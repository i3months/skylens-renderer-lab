// T13b 압축 한도 측정(연구용 임시 스크립트, 제품 코드는 제품 작업 트리(환경변수 PRODUCT_DIR) 에서 import 만 한다).
// 사용: node experiments/t13b-codec-measure.mjs <부분> [N=2500000] [시드=1]
//   부분 = bytes  : 현재 codec 1(SKLC1) 필드별 바이트/점(수준 0~3)
//          alt    : 최고 수준(N 점)에서 대안 부호기 비용(적응형 산술 부호 이상적 길이) + brotli 참고값
//          ssim   : 손실 양자화별 8시점 SSIM(설정 A = 제품 화질 시험과 같은 320x180·0.75 m, 설정 B = 근접 640x360·0.08 m)
// 장면: fixtures/scenes/levels 구간 0(50 m x 100 m 띠, 기복 ±2 m), 최고 수준 N 점, 낮은 수준은 N/2·N/4·N/8.
// 좌표: 장면은 y-up(x, 높이, z). 조각화는 ENU(e = x, n = -z, u = y)로 바꿔서 한다(실자산과 같은 축 배치).
const P = (process.env.PRODUCT_DIR ?? '.') + '/';
const imp = (p) => import(P + p);
const { generate, levelCloud } = await imp('fixtures/scenes/levels/index.mjs');
const { groupByTile } = await imp('server/asset/tile_index/index.mjs');
const { packChunk, encodeOctNormal } = await imp('server/asset/pack/index.mjs');
const { decodeOctNormal } = await imp('server/asset/unpack/index.mjs');
const { encodeChunk } = await imp('server/codec/chunk/index.mjs');
const { mortonOrder } = await imp('server/codec/order/index.mjs');
const { encodePositionStream } = await imp('server/codec/position/index.mjs');
const { entropyEncode } = await imp('server/codec/entropy/index.mjs');
const { FORMAT_POINT27, parseHeader, bodyLayout, HEADER_SIZE } = await imp('contracts/asset/index.mjs');
const { viewpointToCamera } = await imp('tools/render_views/index.mjs');
const { renderPoints } = await imp('server/raster_ref/zbuffer/index.mjs');
const { shadeResult } = await imp('server/raster_ref/shade/index.mjs');
const { ssim } = await imp('server/metrics/ssim/index.mjs');
import { brotliCompressSync, constants as ZC } from 'node:zlib';

const PART = process.argv[2] || 'bytes';
const N = +process.argv[3] || 2500000;
const SEED = +process.argv[4] || 1;
const t0 = Date.now();
const log = (...a) => console.log(...a);
const f3 = (x) => x.toFixed(3);

// ---------- 공통 ----------
function toENU(c) {
  const n = c.count, p = new Float32Array(3 * n), nr = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) {
    p[3 * i] = c.positions[3 * i]; p[3 * i + 1] = -c.positions[3 * i + 2]; p[3 * i + 2] = c.positions[3 * i + 1];
    nr[3 * i] = c.normals[3 * i]; nr[3 * i + 1] = -c.normals[3 * i + 2]; nr[3 * i + 2] = c.normals[3 * i + 1];
  }
  return { format: FORMAT_POINT27, count: n, positions: p, normals: nr, colors: c.colors };
}
function subsetFields(c, idx) {
  const n = idx.length, positions = new Float32Array(3 * n), normals = new Float32Array(3 * n), colors = new Uint8Array(3 * n);
  for (let k = 0; k < n; k++) {
    const s = idx[k];
    for (let a = 0; a < 3; a++) { positions[3 * k + a] = c.positions[3 * s + a]; normals[3 * k + a] = c.normals[3 * s + a]; colors[3 * k + a] = c.colors[3 * s + a]; }
  }
  return { positions, normals, colors };
}
/** ENU 점군 → 타일 조각들의 codec 0 파일 */
function chunksOf(enu, level) {
  return groupByTile(enu.positions).map((g, ci) => packChunk({
    format: FORMAT_POINT27, segmentId: 0, level, lod: 0, chunkIndex: ci, anchor: { lat: 0, lon: 0, alt: 0 }, fields: subsetFields(enu, g.indices),
  }));
}
function planesOf(raw) {
  const h = parseHeader(raw);
  const { planes } = bodyLayout(h.format, h.pointCount);
  const out = { h };
  for (const p of planes) {
    const rel = h.headerSize + p.offset;
    const b = raw.slice(rel, rel + p.bytes);
    out[p.name] = p.type === 'u16' ? new Uint16Array(b.buffer) : p.type === 'i8' ? new Int8Array(b.buffer) : b;
  }
  return out;
}
/** codec 0 파일 → 모턴 순으로 정렬한 평면 */
function sortedPlanes(raw) {
  const pl = planesOf(raw);
  const ord = mortonOrder(pl.pos_e, pl.pos_n, pl.pos_u);
  const g = (a) => { const o = new a.constructor(ord.length); for (let k = 0; k < ord.length; k++) o[k] = a[ord[k]]; return o; };
  return { h: pl.h, n: ord.length, qe: g(pl.pos_e), qn: g(pl.pos_n), qu: g(pl.pos_u), r: g(pl.color_r), gg: g(pl.color_g), b: g(pl.color_b), ox: g(pl.normal_oct_x), oy: g(pl.normal_oct_y) };
}

// 적응형 다기호 모델의 이상적 부호 길이(비트). 산술 부호기가 이 길이 + 수 바이트로 실제 달성한다.
// 문맥마다 빈도 표(초기 1, 증가 INC, 합이 LIMIT 넘으면 절반) — 일반적인 적응형 빈도 모델.
class Adaptive {
  constructor(alphabet, contexts = 1, inc = 24, limit = 1 << 16) {
    this.A = alphabet; this.inc = inc; this.limit = limit;
    this.f = new Uint32Array(alphabet * contexts).fill(1);
    this.tot = new Float64Array(contexts).fill(alphabet);
    this.bits = 0;
  }
  code(s, ctx = 0) {
    const o = ctx * this.A;
    this.bits += Math.log2(this.tot[ctx] / this.f[o + s]);
    this.f[o + s] += this.inc; this.tot[ctx] += this.inc;
    if (this.tot[ctx] > this.limit) {
      let t = 0;
      for (let k = 0; k < this.A; k++) { const v = (this.f[o + k] + 1) >>> 1; this.f[o + k] = v; t += v; }
      this.tot[ctx] = t;
    }
  }
}
const brotli = (u8) => brotliCompressSync(u8, { params: { [ZC.BROTLI_PARAM_QUALITY]: 11, [ZC.BROTLI_PARAM_LGWIN]: 24, [ZC.BROTLI_PARAM_SIZE_HINT]: u8.length } }).length;

// 모턴 키(축당 B 비트, B ≤ 16). 결과 < 2^48 이라 Number 로 정확.
const SPREAD8 = new Uint32Array(256);
for (let v = 0; v < 256; v++) { let s = 0; for (let i = 0; i < 8; i++) if (v & (1 << i)) s |= 1 << (3 * i); SPREAD8[v] = s; }
const key3 = (e, n, u) => (SPREAD8[e >>> 8] | (SPREAD8[n >>> 8] << 1) | (SPREAD8[u >>> 8] << 2)) * 16777216 + (SPREAD8[e & 255] | (SPREAD8[n & 255] << 1) | (SPREAD8[u & 255] << 2));
function compact(key, off) { // key 에서 축 off 의 좌표
  let lo = key % 16777216, hi = Math.floor(key / 16777216), v = 0;
  for (let i = 0; i < 8; i++) { v |= ((lo >>> (3 * i + off)) & 1) << i; v |= ((hi >>> (3 * i + off)) & 1) << (i + 8); }
  return v;
}
const P8 = [1, 8, 64, 512, 4096, 32768, 262144, 2097152, 16777216, 134217728, 1073741824, 8589934592, 68719476736, 549755813888, 4398046511104, 35184372088832, 281474976710656];

/**
 * 8분 트리 점유 부호(G-PCC 방식)의 이상적 길이. 좌표를 s 비트 버린(격자 2^s 배) 뒤 적용.
 * ctxMode 'depth' = 깊이별 문맥, 'nbr' = 깊이 x 같은 깊이 6이웃 존재 패턴(64)(이웃 존재는 부모 단계 부호화 후 알려져 있어 인과적).
 * 같은 칸 중복 점은 칸당 (개수-1) 을 적응형으로 부호(점 수 보존).
 */
function octreeBits(qe, qn, qu, s, ctxMode) {
  const n = qe.length, B = 16 - s;
  const keys = new Float64Array(n);
  for (let i = 0; i < n; i++) keys[i] = key3(qe[i] >>> s, qn[i] >>> s, qu[i] >>> s);
  keys.sort();
  // 고유 키와 중복 수
  const uniq = []; const mult = new Adaptive(256);
  for (let i = 0; i < n;) { let j = i + 1; while (j < n && keys[j] === keys[i]) j++; uniq.push(keys[i]); const c = Math.min(255, j - i - 1); mult.code(c); i = j; }
  const U = Float64Array.from(uniq);
  const occ = new Adaptive(256, ctxMode === 'nbr' ? B * 64 : B);
  for (let l = 0; l < B; l++) { // 단계 l 의 노드(접두 = key / 8^(B-l))의 자식 점유를 부호
    const dC = P8[B - l - 1], dP = P8[B - l];
    let nodeSet = null;
    if (ctxMode === 'nbr' && l > 0) {
      nodeSet = new Set();
      let prev = -1;
      for (let i = 0; i < U.length; i++) { const p = Math.floor(U[i] / dP); if (p !== prev) { nodeSet.add(p); prev = p; } }
    }
    let i = 0;
    while (i < U.length) {
      const p = Math.floor(U[i] / dP);
      let o = 0;
      while (i < U.length && Math.floor(U[i] / dP) === p) { o |= 1 << (Math.floor(U[i] / dC) % 8); i++; }
      let ctx = l;
      if (nodeSet) {
        const x = compact(p, 0), y = compact(p, 1), z = compact(p, 2), lim = (1 << l) - 1;
        let m = 0;
        if (x > 0 && nodeSet.has(key3(x - 1, y, z))) m |= 1;
        if (x < lim && nodeSet.has(key3(x + 1, y, z))) m |= 2;
        if (y > 0 && nodeSet.has(key3(x, y - 1, z))) m |= 4;
        if (y < lim && nodeSet.has(key3(x, y + 1, z))) m |= 8;
        if (z > 0 && nodeSet.has(key3(x, y, z - 1))) m |= 16;
        if (z < lim && nodeSet.has(key3(x, y, z + 1))) m |= 32;
        ctx = l * 64 + m;
      } else if (ctxMode === 'nbr') ctx = 0;
      occ.code(o, ctx);
    }
  }
  return { bits: occ.bits + mult.bits, uniq: U.length, occBits: occ.bits, multBits: mult.bits };
}

/** 모턴 키 차분 LEB128 바이트를 '바이트 위치' 문맥 적응형으로 부호한 길이 */
function lebCtxBits(qe, qn, qu) {
  const raw = encodePositionStream(qe, qn, qu);
  const m = new Adaptive(256, 8);
  let k = 0;
  for (let i = 0; i < raw.length; i++) { m.code(raw[i], Math.min(k, 7)); k = raw[i] & 0x80 ? k + 1 : 0; }
  return { bits: m.bits, raw };
}

// ---------- 색 ----------
/** b 비트 균일 양자화(복원 = 칸 중앙). b = 8 이면 무손실 */
const qColor = (v, b) => (b >= 8 ? v : v >> (8 - b));
const rColor = (q, b) => (b >= 8 ? q : Math.min(255, (q << (8 - b)) + (1 << (7 - b))));
/**
 * 색 부호 비용(비트). 방법:
 *  'delta'  : 채널별 이전 점 차분(mod 2^b), 채널 문맥 3
 *  'ic'     : G 차분 + (R-G)·(B-G) 잔차의 이전 점 차분(채널 간 상관 이용), 채널 x 직전 G 잔차 크기 문맥
 *  'ycocg'  : YCoCg-R(무손실 가역) 후 채널별 차분, 채널 x 직전 Y 잔차 크기 문맥
 */
function colorBits(r, g, b, bits, method) {
  const n = r.length, M = 1 << bits, mask = M - 1;
  const mag = (d) => { const a = Math.min(d, M - d); return a === 0 ? 0 : a < 2 ? 1 : a < 4 ? 2 : a < 8 ? 3 : a < 16 ? 4 : 5; };
  if (method === 'delta') {
    const m = new Adaptive(M, 3);
    let pr = 0, pg = 0, pb = 0;
    for (let i = 0; i < n; i++) {
      const R = qColor(r[i], bits), G = qColor(g[i], bits), Bc = qColor(b[i], bits);
      m.code((R - pr) & mask, 0); m.code((G - pg) & mask, 1); m.code((Bc - pb) & mask, 2);
      pr = R; pg = G; pb = Bc;
    }
    return m.bits;
  }
  if (method === 'ic') {
    const m = new Adaptive(M, 3 * 6);
    let pg = 0, prg = 0, pbg = 0, lastMag = 0;
    for (let i = 0; i < n; i++) {
      const R = qColor(r[i], bits), G = qColor(g[i], bits), Bc = qColor(b[i], bits);
      const dg = (G - pg) & mask, rg = (R - G) & mask, bg = (Bc - G) & mask;
      m.code(dg, lastMag);
      const c = mag(dg);
      m.code((rg - prg) & mask, 6 + c); m.code((bg - pbg) & mask, 12 + c);
      pg = G; prg = rg; pbg = bg; lastMag = c;
    }
    return m.bits;
  }
  if (method === 'ycocg') { // 8비트 무손실 전용: Co, Cg 는 9비트라 alphabet 512
    const m = new Adaptive(512, 3 * 6);
    let py = 0, pco = 0, pcg = 0, lastMag = 0;
    for (let i = 0; i < n; i++) {
      const R = qColor(r[i], bits), G = qColor(g[i], bits), Bc = qColor(b[i], bits);
      const co = R - Bc, t = Bc + (co >> 1), cg = G - t, y = t + (cg >> 1);
      const dy = (y - py) & 511;
      m.code(dy, lastMag);
      const c = Math.min(5, Math.ceil(Math.log2(1 + Math.min(dy, 512 - dy))));
      m.code((co - pco) & 511, 6 + c); m.code((cg - pcg) & 511, 12 + c);
      py = y; pco = co; pcg = cg; lastMag = c;
    }
    return m.bits;
  }
  throw new Error(method);
}

// ---------- 법선 ----------
function octEncodeBits(x, y, z, bits) { // 팔면체 사상, 성분을 ±(2^(bits-1)-1) 정수로
  const S = (1 << (bits - 1)) - 1;
  const l1 = Math.abs(x) + Math.abs(y) + Math.abs(z);
  let u = x / l1, v = y / l1;
  if (z < 0) { const su = u >= 0 ? 1 : -1, sv = v >= 0 ? 1 : -1; [u, v] = [(1 - Math.abs(v)) * su, (1 - Math.abs(u)) * sv]; }
  return [Math.max(-S, Math.min(S, Math.round(u * S))), Math.max(-S, Math.min(S, Math.round(v * S)))];
}
function octDecodeBits(qx, qy, bits) {
  const S = (1 << (bits - 1)) - 1;
  let u = qx / S, v = qy / S; const z = 1 - Math.abs(u) - Math.abs(v);
  if (z < 0) { const su = u >= 0 ? 1 : -1, sv = v >= 0 ? 1 : -1; [u, v] = [(1 - Math.abs(v)) * su, (1 - Math.abs(u)) * sv]; }
  const l = Math.hypot(u, v, z); return [u / l, v / l, z / l];
}
/** 법선(ENU 실수) → bits 비트 oct, 이전 점 차분을 문맥(축 x 직전 차분 크기) 적응형으로 부호 */
function normalBits(nx, ny, nz, bits) {
  const n = nx.length, M = 1 << bits, mask = M - 1;
  const m = new Adaptive(M, 2 * 4);
  let px = 0, py = 0, cx = 0, cy = 0;
  const mag = (d) => { const a = Math.min(d, M - d); return a === 0 ? 0 : a < 2 ? 1 : a < 4 ? 2 : 3; };
  for (let i = 0; i < n; i++) {
    const [qx, qy] = bits === 8 ? encodeOctNormal(nx[i], ny[i], nz[i]) : octEncodeBits(nx[i], ny[i], nz[i], bits);
    const dx = (qx - px) & mask, dy = (qy - py) & mask;
    m.code(dx, cx); m.code(dy, 4 + cy);
    cx = mag(dx); cy = mag(dy); px = qx; py = qy;
  }
  return m.bits;
}

// =====================================================================
if (PART === 'bytes') {
  const sc = generate({ seed: SEED, segments: 1, count: N });
  log(`# 현재 codec 1 바이트/점 (levels 구간 0, 최고 수준 N=${N}, 시드 ${SEED}, ENU 조각화)`);
  log('수준 | 점 수 | 조각 수 | qexp | codec0 B/점 | codec1 합 B/점 | 위치 | 법선 | 색(무손실) | 헤더+고정 | codec1 lossy색 합 | lossy 색');
  const tot = { n: 0, c0: 0, c1: 0, c1l: 0, pos: 0, nrm: 0, col: 0, coll: 0, hd: 0 };
  for (let lv = 0; lv < 4; lv++) {
    const enu = toENU(levelCloud(sc, 0, lv));
    const raws = chunksOf(enu, lv);
    const a = { c0: 0, c1: 0, c1l: 0, pos: 0, nrm: 0, col: 0, coll: 0, hd: 0 }; const qx = new Set();
    for (const raw of raws) {
      qx.add(parseHeader(raw).quantExp);
      const e = encodeChunk(raw), el = encodeChunk(raw, { lossyColor: true });
      const dv = new DataView(e.buffer, e.byteOffset), dl = new DataView(el.buffer, el.byteOffset);
      const pl = dv.getUint32(HEADER_SIZE + 4, true), nl = dv.getUint32(HEADER_SIZE + 8, true), cl = dv.getUint32(HEADER_SIZE + 12, true);
      a.c0 += raw.length; a.c1 += e.length; a.c1l += el.length; a.pos += pl; a.nrm += nl; a.col += cl; a.coll += dl.getUint32(HEADER_SIZE + 12, true); a.hd += HEADER_SIZE + 16;
    }
    const n = enu.count;
    log(`${lv} | ${n} | ${raws.length} | ${[...qx].join(',')} | ${f3(a.c0 / n)} | ${f3(a.c1 / n)} | ${f3(a.pos / n)} | ${f3(a.nrm / n)} | ${f3(a.col / n)} | ${f3(a.hd / n)} | ${f3(a.c1l / n)} | ${f3(a.coll / n)}`);
    tot.n += n; for (const k of Object.keys(a)) tot[k] += a[k];
  }
  log(`합(4수준) | ${tot.n} | | | ${f3(tot.c0 / tot.n)} | ${f3(tot.c1 / tot.n)} | ${f3(tot.pos / tot.n)} | ${f3(tot.nrm / tot.n)} | ${f3(tot.col / tot.n)} | ${f3(tot.hd / tot.n)} | ${f3(tot.c1l / tot.n)} | ${f3(tot.coll / tot.n)}`);
  log(`구간 바이트: codec1 무손실 4수준 합 ${tot.c1} B (${(tot.c1 / 1e6).toFixed(2)} MB), lossy색 ${tot.c1l} B (${(tot.c1l / 1e6).toFixed(2)} MB)`);
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

if (PART === 'alt') {
  const sc = generate({ seed: SEED, segments: 1, count: N });
  const lvArg = process.argv[5] !== undefined ? +process.argv[5] : 3;
  const enu = toENU(levelCloud(sc, 0, lvArg));
  const raws = chunksOf(enu, lvArg);
  const n = enu.count;
  log(`# 대안 부호기 (수준 ${lvArg}, 점 ${n}, 조각 ${raws.length}). 단위 B/점. 적응형 = 이상적 산술 부호 길이`);
  const acc = {};
  const add = (k, bits) => { acc[k] = (acc[k] || 0) + bits; };
  for (const raw of raws) {
    const sp = sortedPlanes(raw);
    const e = encodeChunk(raw);
    const dv = new DataView(e.buffer, e.byteOffset);
    add('pos.현재(SKLC1)', 8 * dv.getUint32(HEADER_SIZE + 4, true));
    add('nrm.현재(SKLC1)', 8 * dv.getUint32(HEADER_SIZE + 8, true));
    add('col.현재(SKLC1)', 8 * dv.getUint32(HEADER_SIZE + 12, true));
    const lc = lebCtxBits(sp.qe, sp.qn, sp.qu);
    add('pos.LEB128 바이트위치 문맥 적응형', lc.bits);
    add('pos.LEB128 + brotli-11(참고)', 8 * brotli(lc.raw));
    for (const s of [0, 1, 2, 3, 4, 5]) {
      const step = 2 ** (s - sp.h.quantExp) * 1000;
      const d = octreeBits(sp.qe, sp.qn, sp.qu, s, 'depth');
      add(`pos.8분트리 깊이문맥 격자 ${step.toFixed(2)} mm`, d.bits);
      const o = octreeBits(sp.qe, sp.qn, sp.qu, s, 'nbr');
      add(`pos.8분트리 6이웃문맥 격자 ${step.toFixed(2)} mm`, o.bits);
      add(`pos.(고유 칸 비율) 격자 ${step.toFixed(2)} mm`, o.uniq * 8); // 표시용: 8로 나눠 비율로 되돌린다
    }
    // 색
    const colRaw = new Uint8Array(3 * sp.n); colRaw.set(sp.r, 0); colRaw.set(sp.gg, sp.n); colRaw.set(sp.b, 2 * sp.n);
    add('col.무손실 원평면 + brotli-11(참고)', 8 * brotli(colRaw));
    for (const bits of [8, 6, 5, 4, 3]) {
      add(`col.${bits}비트 채널차분`, colorBits(sp.r, sp.gg, sp.b, bits, 'delta'));
      add(`col.${bits}비트 채널간잔차(G,R-G,B-G)`, colorBits(sp.r, sp.gg, sp.b, bits, 'ic'));
    }
    add('col.8비트 YCoCg-R', colorBits(sp.r, sp.gg, sp.b, 8, 'ycocg'));
    // 법선: 정렬된 oct8 을 복원한 실수 법선을 다시 bits 로(원 실수 법선 대신; 8비트 행은 현재 값과 같다)
    const nx = new Float64Array(sp.n), ny = new Float64Array(sp.n), nz = new Float64Array(sp.n);
    for (let i = 0; i < sp.n; i++) { const v = decodeOctNormal(sp.ox[i], sp.oy[i]); nx[i] = v[0]; ny[i] = v[1]; nz[i] = v[2]; }
    for (const bits of [8, 6, 5, 4]) add(`nrm.oct${bits} 차분 문맥 적응형`, normalBits(nx, ny, nz, bits));
  }
  for (const [k, bits] of Object.entries(acc)) {
    if (k.startsWith('pos.(고유')) log(`${k} | ${f3(bits / 8 / n)} (비율)`);
    else log(`${k} | ${f3(bits / 8 / n)}`);
  }
  // 무작위 균일 표면 점의 집합 정보량 하한(높이 잡음 0 가정): log2(A/(N δ²)) + log2(e) 비트/점
  const A = 50 * 100;
  for (const dmm of [0.98, 1.95, 3.91, 7.81, 15.6, 31.3]) {
    const d = dmm / 1000, x = A / (n * d * d);
    log(`이론.표면 균일 무작위 점 집합 하한(높이 잡음 0) 격자 ${dmm} mm | ${f3(Math.max(0, Math.log2(x) + Math.log2(Math.E)) / 8)}`);
  }
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

if (PART === 'ssim') {
  const sc = generate({ seed: SEED, segments: 1, count: N });
  const ref = levelCloud(sc, 0, 3); // y-up 원본 f32
  const n = ref.count;
  // 7번째 인자 smooth: 점마다 독립인 색 잡음(0..15)을 빼고 무늬(체크·줄무늬)만 남긴 색으로 바꾼다(구간 0 은 색조 0). 색이 공간적으로 매끈한 경우의 대조.
  if (process.argv[7] === 'smooth') {
    const c = new Uint8Array(3 * n);
    for (let i = 0; i < n; i++) {
      const x = ref.positions[3 * i], z = ref.positions[3 * i + 2];
      const check = (Math.floor(x / 2) + Math.floor(z / 2)) & 1, stripe = Math.sin(x * 1.7 + z * 0.9) > 0.6 ? 40 : 0;
      c[3 * i] = c[3 * i + 1] = c[3 * i + 2] = Math.min(255, (check ? 190 : 80) + stripe + 7);
    }
    ref.colors = c;
  }
  const LIGHT = [0.4, 0.8, 0.45], AMB = 0.3;
  const vp = (name, eye, target, fov) => ({ name, eye, target, up: [0, 1, 0], fov });
  const CONF = {
    A: { W: 320, H: 180, ps: 0.75, vps: [
      vp('top_down_25', [25, 25, 0.01], [25, 0, 0], 60), vp('oblique_s_20', [25, 20, 45], [25, 0, 5], 60),
      vp('oblique_n_20', [25, 20, -45], [25, 0, -5], 60), vp('east_10', [60, 10, 0], [25, 0, 0], 60),
      vp('west_10', [-10, 10, 10], [25, 0, 0], 60), vp('ne_15', [45, 15, -30], [25, 0, 0], 60),
      vp('sw_15', [5, 15, 30], [25, 0, 0], 60), vp('near_6', [20, 6, -10], [30, 0, 10], 60)] },
    B: { W: 640, H: 360, ps: 0.08, vps: [
      vp('top_down_10', [25, 10, 0.01], [25, 0, 0], 60), vp('oblique_5', [5, 5, -20], [25, 0, 0], 60),
      vp('low_3', [45, 3, 10], [30, 0, 0], 60), vp('south_6', [25, 6, 30], [25, 0, 10], 60),
      vp('graze_2', [10, 2, 0], [25, 0, 0], 60), vp('high_15', [40, 15, -40], [25, 0, 0], 60),
      vp('nw_8', [0, 8, 40], [20, 0, 20], 60), vp('north_4', [25, 4, -45], [25, 0, -30], 60)] },
  };
  const confs = (process.argv[5] || 'A,B').split(',');
  const clone = (c) => ({ format: 1, count: c.count, positions: c.positions, normals: c.normals, colors: c.colors });
  // 위치: 축마다 격자 δ(m)로 반올림(격자 원점 = 축 최솟값; 조각 bbox 최솟값 원점과 같은 성질)
  const mins = [0, 1, 2].map((a) => { let m = Infinity; for (let i = 0; i < n; i++) m = Math.min(m, ref.positions[3 * i + a]); return m; });
  const qPos = (d) => { const p = new Float32Array(3 * n); for (let i = 0; i < 3 * n; i++) { const a = i % 3; p[i] = mins[a] + Math.round((ref.positions[i] - mins[a]) / d) * d; } return { ...clone(ref), positions: p }; };
  const qCol = (bits) => { const c = new Uint8Array(3 * n); for (let i = 0; i < 3 * n; i++) c[i] = rColor(qColor(ref.colors[i], bits), bits); return { ...clone(ref), colors: c }; };
  const qColYC = (yb, cb) => { // Y 는 yb 비트, 색차(Co,Cg)는 cb 비트(실수 YCoCg, 손실)
    const c = new Uint8Array(3 * n);
    const q = (v, lo, hi, b) => { const L = (1 << b) - 1; return lo + Math.round((v - lo) / (hi - lo) * L) / L * (hi - lo); };
    for (let i = 0; i < n; i++) {
      const R = ref.colors[3 * i], G = ref.colors[3 * i + 1], B = ref.colors[3 * i + 2];
      let Y = 0.25 * R + 0.5 * G + 0.25 * B, Co = 0.5 * (R - B), Cg = -0.25 * R + 0.5 * G - 0.25 * B;
      Y = q(Y, 0, 255, yb); Co = q(Co, -127.5, 127.5, cb); Cg = q(Cg, -127.5, 127.5, cb);
      const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
      c[3 * i] = cl(Y + Co - Cg); c[3 * i + 1] = cl(Y + Cg); c[3 * i + 2] = cl(Y - Co - Cg);
    }
    return { ...clone(ref), colors: c };
  };
  // 법선: y-up 법선을 ENU 로 바꿔 oct bits 로 왕복 후 y-up 으로 되돌림
  const qNrm = (bits) => {
    const o = new Float32Array(3 * n);
    for (let i = 0; i < n; i++) {
      const e = ref.normals[3 * i], nn = -ref.normals[3 * i + 2], u = ref.normals[3 * i + 1];
      let v;
      if (bits === 8) { const [a, b] = encodeOctNormal(e, nn, u); v = decodeOctNormal(a, b); } else { const [a, b] = octEncodeBits(e, nn, u, bits); v = octDecodeBits(a, b, bits); }
      o[3 * i] = v[0]; o[3 * i + 1] = v[2]; o[3 * i + 2] = -v[1];
    }
    return { ...clone(ref), normals: o };
  };
  // 법선 미전송: 클라이언트가 위치로 추정(3D 격자 이웃 PCA, 칸 h, 위쪽(+y)으로 방향 고정 — 합성 지면 전용 가정)
  const estNormals = (src, h) => {
    const P = src.positions, cell = new Map();
    const ck = (x, y, z) => (x + 4096) + (y + 4096) * 8192 + (z + 4096) * 67108864;
    const ci = new Int32Array(3 * n);
    for (let i = 0; i < n; i++) {
      const x = Math.floor(P[3 * i] / h), y = Math.floor(P[3 * i + 1] / h), z = Math.floor(P[3 * i + 2] / h);
      ci[3 * i] = x; ci[3 * i + 1] = y; ci[3 * i + 2] = z;
      const k = ck(x, y, z); let a = cell.get(k); if (!a) cell.set(k, (a = [])); a.push(i);
    }
    const o = new Float32Array(3 * n);
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, sz = 0, sxx = 0, sxy = 0, sxz = 0, syy = 0, syz = 0, szz = 0, c = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const a = cell.get(ck(ci[3 * i] + dx, ci[3 * i + 1] + dy, ci[3 * i + 2] + dz)); if (!a) continue;
        for (const j of a) { const x = P[3 * j], y = P[3 * j + 1], z = P[3 * j + 2]; sx += x; sy += y; sz += z; sxx += x * x; sxy += x * y; sxz += x * z; syy += y * y; syz += y * z; szz += z * z; c++; }
      }
      const mx = sx / c, my = sy / c, mz = sz / c;
      const C = [sxx / c - mx * mx, sxy / c - mx * my, sxz / c - mx * mz, syy / c - my * my, syz / c - my * mz, szz / c - mz * mz];
      // 최소 고유벡터: (tr·I − C) 의 최대 고유벡터를 거듭제곱법으로
      const tr = C[0] + C[3] + C[5];
      const M = [tr - C[0], -C[1], -C[2], tr - C[3], -C[4], tr - C[5]];
      let v = [0, 1, 0];
      for (let it = 0; it < 30; it++) {
        const w = [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[1] * v[0] + M[3] * v[1] + M[4] * v[2], M[2] * v[0] + M[4] * v[1] + M[5] * v[2]];
        const l = Math.hypot(...w) || 1; v = [w[0] / l, w[1] / l, w[2] / l];
      }
      if (v[1] < 0) v = [-v[0], -v[1], -v[2]];
      o[3 * i] = v[0]; o[3 * i + 1] = v[1]; o[3 * i + 2] = v[2];
    }
    return { ...clone(src), normals: o };
  };
  // 무늬 손실 기준선: 법선 전부 위(0,1,0) — 법선 정보가 화질에 주는 최대 영향 확인용
  const flatN = () => { const o = new Float32Array(3 * n); for (let i = 0; i < n; i++) o[3 * i + 1] = 1; return { ...clone(ref), normals: o }; };

  const variants = [
    ['현재 codec1 무손실(위치 qexp10 1/1024 m, oct8, 색 8비트)', () => qNrm(8), (c) => qPos(1 / 1024)],
    ['위치 격자 2^-8 m (3.9 mm)', () => qPos(1 / 256)],
    ['위치 격자 2^-7 m (7.8 mm)', () => qPos(1 / 128)],
    ['위치 격자 2^-6 m (15.6 mm)', () => qPos(1 / 64)],
    ['위치 격자 2^-5 m (31.3 mm)', () => qPos(1 / 32)],
    ['위치 격자 2^-4 m (62.5 mm)', () => qPos(1 / 16)],
    ['색 6비트(QUANT2 상당)', () => qCol(6)],
    ['색 5비트', () => qCol(5)],
    ['색 4비트', () => qCol(4)],
    ['색 3비트', () => qCol(3)],
    ['색 YCoCg Y6/C4', () => qColYC(6, 4)],
    ['색 YCoCg Y5/C3', () => qColYC(5, 3)],
    ['법선 oct6', () => qNrm(6)],
    ['법선 oct5', () => qNrm(5)],
    ['법선 oct4', () => qNrm(4)],
    ['법선 미전송·클라 PCA 추정(h=0.1 m)', () => estNormals(ref, 0.1)],
    ['법선 전부 위(정보 0, 참고)', () => flatN()],
    ['대조: 위치 무작위 흔들림 축마다 균일 ±0.05 mm(양자화 아님, 깊이 동률 승자 뒤바뀜만 보기)', () => { let a = 7; const r = () => { a = (Math.imul(a, 1103515245) + 12345) >>> 0; return a / 4294967296; }; const p = Float32Array.from(ref.positions, (v) => v + (r() - 0.5) * 1e-4); return { ...clone(ref), positions: p }; }],
  ];
  // 조합(필드별 손실을 함께 적용): 위치 격자 d(m), 색 비트, 법선 방식('oct8'|'oct5'|'pca')
  const combo = (d, cb, nm) => { const c = qCol(cb); const p = qPos(d).positions; const base = { ...c, positions: p };
    const nr = nm === 'pca' ? estNormals(base, 0.1).normals : qNrm(nm === 'oct5' ? 5 : 8).normals; return { ...base, normals: nr }; };
  variants.push(
    ['조합: 위치 1/1024 m + 색 5비트 + 법선 oct5', () => combo(1 / 1024, 5, 'oct5')],
    ['조합: 위치 1/1024 m + 색 4비트 + 법선 미전송(PCA)', () => combo(1 / 1024, 4, 'pca')],
    ['조합: 위치 1/256 m + 색 5비트 + 법선 oct5', () => combo(1 / 256, 5, 'oct5')],
    ['조합: 위치 1/64 m + 색 5비트 + 법선 미전송(PCA)', () => combo(1 / 64, 5, 'pca')],
    ['조합: 위치 1/1024 m + 색 5비트 + 법선 미전송(PCA) (= budget S2)', () => combo(1 / 1024, 5, 'pca')],
  );
  const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
  for (const cn of confs) {
    const C = CONF[cn];
    const cams = C.vps.map((v) => viewpointToCamera({ eye: v.eye, target: v.target, up: v.up, width: C.W, height: C.H, fov_y_deg: v.fov }));
    const draw = (cam, cl) => shadeResult(renderPoints(cam, cl, { pointSizeM: C.ps, validate: false }), cam, cl, LIGHT, { ambient: AMB });
    const refImgs = cams.map((cam) => draw(cam, ref));
    // 빈 픽셀 비율(설정 B 의 점 크기가 적절한지 확인용)
    const emp = cams.map((cam) => { const r = renderPoints(cam, ref, { pointSizeM: C.ps, validate: false }); let e = 0; for (const x of r.index) if (x < 0) e++; return (e / r.index.length).toFixed(3); });
    log(`# 설정 ${cn}: ${C.W}x${C.H}, 점 지름 ${C.ps} m, N=${n}, 기준 빈 픽셀 비율 ${emp.join(' ')}`);
    log(`변형 | 최소 SSIM | 평균 | 시점별(${C.vps.map((v) => v.name).join(', ')})`);
    variants.forEach(([name, mk, mk2], vi) => {
      if (only && !only.includes(vi)) return;
      let cl = mk(); if (mk2) { const p = mk2(); cl = { ...cl, positions: p.positions }; }
      const s = cams.map((cam, k) => ssim(refImgs[k], draw(cam, cl), C.W, C.H, 3));
      log(`${vi} ${name} | ${s.length ? Math.min(...s).toFixed(5) : ''} | ${(s.reduce((a, b) => a + b, 0) / s.length).toFixed(5)} | ${s.map((x) => x.toFixed(4)).join(' ')}`);
    });
  }
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// 'hard': 합성 장면을 실제에 가깝게 어렵게 만든 변형(실자산 대용 아님, 상한 쪽 괄호용).
//  위치 u 에 정규 잡음 σ = SIG_U m(MVS 깊이 잡음 대용), 색 채널마다 독립 균일 잡음 −8..7, 법선에 성분별 정규 잡음 σ = 0.08(약 5°).
if (PART === 'hard') {
  const SIG_U = +(process.argv[5] || 0.01);
  const sc = generate({ seed: SEED, segments: 1, count: N });
  const enu = toENU(levelCloud(sc, 0, 3));
  const n = enu.count;
  let a = 0x9e3779b9 ^ SEED; const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const colors = new Uint8Array(enu.colors);
  for (let i = 0; i < n; i++) {
    enu.positions[3 * i + 2] += SIG_U * gauss();
    for (let k = 0; k < 3; k++) colors[3 * i + k] = Math.max(0, Math.min(255, colors[3 * i + k] + Math.floor(rnd() * 16) - 8));
    let x = enu.normals[3 * i] + 0.08 * gauss(), y = enu.normals[3 * i + 1] + 0.08 * gauss(), z = enu.normals[3 * i + 2] + 0.08 * gauss();
    const l = Math.hypot(x, y, z); enu.normals[3 * i] = x / l; enu.normals[3 * i + 1] = y / l; enu.normals[3 * i + 2] = z / l;
  }
  enu.colors = colors;
  const raws = chunksOf(enu, 3);
  log(`# 어려운 변형(u 잡음 σ=${SIG_U} m, 색 독립 잡음 ±8, 법선 잡음 약 5°), 점 ${n}, 조각 ${raws.length}. 단위 B/점`);
  const acc = {}; const add = (k, b) => { acc[k] = (acc[k] || 0) + b; };
  for (const raw of raws) {
    const sp = sortedPlanes(raw);
    const e = encodeChunk(raw), el = encodeChunk(raw, { lossyColor: true });
    const dv = new DataView(e.buffer, e.byteOffset), dl = new DataView(el.buffer, el.byteOffset);
    add('pos.현재(SKLC1)', 8 * dv.getUint32(HEADER_SIZE + 4, true));
    add('nrm.현재(SKLC1)', 8 * dv.getUint32(HEADER_SIZE + 8, true));
    add('col.현재(SKLC1) 무손실', 8 * dv.getUint32(HEADER_SIZE + 12, true));
    add('col.현재(SKLC1) QUANT2', 8 * dl.getUint32(HEADER_SIZE + 12, true));
    add('pos.LEB128 바이트위치 문맥 적응형', lebCtxBits(sp.qe, sp.qn, sp.qu).bits);
    for (const s of [0, 2, 4, 5]) add(`pos.8분트리 6이웃문맥 격자 ${(2 ** (s - sp.h.quantExp) * 1000).toFixed(2)} mm`, octreeBits(sp.qe, sp.qn, sp.qu, s, 'nbr').bits);
    for (const bits of [8, 6, 5, 4]) add(`col.${bits}비트 채널간잔차`, colorBits(sp.r, sp.gg, sp.b, bits, 'ic'));
    add('col.8비트 YCoCg-R', colorBits(sp.r, sp.gg, sp.b, 8, 'ycocg'));
    const nx = new Float64Array(sp.n), ny = new Float64Array(sp.n), nz = new Float64Array(sp.n);
    for (let i = 0; i < sp.n; i++) { const v = decodeOctNormal(sp.ox[i], sp.oy[i]); nx[i] = v[0]; ny[i] = v[1]; nz[i] = v[2]; }
    for (const bits of [8, 6, 5, 4]) add(`nrm.oct${bits} 차분 문맥 적응형`, normalBits(nx, ny, nz, bits));
  }
  for (const [k, b] of Object.entries(acc)) log(`${k} | ${f3(b / 8 / n)}`);
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// 'floor': SSIM 지표의 바닥 확인. 같은 표면에서 독립으로 뽑은 두 점군(2N 점 장면의 짝수 번째 N 점 vs 홀수 번째 N 점)은
// 화질이 같다고 봐야 하는데 원본 대비 SSIM 이 얼마인지 잰다. 시점·설정은 ssim 부분과 같다(A,B).
if (PART === 'floor') {
  const sc = generate({ seed: SEED, segments: 1, count: 2 * N });
  const all = levelCloud(sc, 0, 3);
  const pick = (par) => { const m = N, p = new Float32Array(3 * m), nr = new Float32Array(3 * m), c = new Uint8Array(3 * m);
    for (let k = 0; k < m; k++) { const i = 2 * k + par; for (let a = 0; a < 3; a++) { p[3 * k + a] = all.positions[3 * i + a]; nr[3 * k + a] = all.normals[3 * i + a]; c[3 * k + a] = all.colors[3 * i + a]; } }
    return { format: 1, count: m, positions: p, normals: nr, colors: c }; };
  const ev = pick(0), od = pick(1);
  const LIGHT = [0.4, 0.8, 0.45], AMB = 0.3;
  const vp = (name, eye, target, fov) => ({ name, eye, target, up: [0, 1, 0], fov });
  const CONF = {
    A: { W: 320, H: 180, ps: 0.75, vps: [
      vp('top_down_25', [25, 25, 0.01], [25, 0, 0], 60), vp('oblique_s_20', [25, 20, 45], [25, 0, 5], 60),
      vp('oblique_n_20', [25, 20, -45], [25, 0, -5], 60), vp('east_10', [60, 10, 0], [25, 0, 0], 60),
      vp('west_10', [-10, 10, 10], [25, 0, 0], 60), vp('ne_15', [45, 15, -30], [25, 0, 0], 60),
      vp('sw_15', [5, 15, 30], [25, 0, 0], 60), vp('near_6', [20, 6, -10], [30, 0, 10], 60)] },
    B: { W: 640, H: 360, ps: 0.08, vps: [
      vp('top_down_10', [25, 10, 0.01], [25, 0, 0], 60), vp('oblique_5', [5, 5, -20], [25, 0, 0], 60),
      vp('low_3', [45, 3, 10], [30, 0, 0], 60), vp('south_6', [25, 6, 30], [25, 0, 10], 60),
      vp('graze_2', [10, 2, 0], [25, 0, 0], 60), vp('high_15', [40, 15, -40], [25, 0, 0], 60),
      vp('nw_8', [0, 8, 40], [20, 0, 20], 60), vp('north_4', [25, 4, -45], [25, 0, -30], 60)] },
  };
  for (const cn of ['A', 'B']) {
    const C = CONF[cn];
    const cams = C.vps.map((v) => viewpointToCamera({ eye: v.eye, target: v.target, up: v.up, width: C.W, height: C.H, fov_y_deg: v.fov }));
    const draw = (cam, cl) => shadeResult(renderPoints(cam, cl, { pointSizeM: C.ps, validate: false }), cam, cl, LIGHT, { ambient: AMB });
    const s = cams.map((cam) => ssim(draw(cam, ev), draw(cam, od), C.W, C.H, 3));
    log(`설정 ${cn} 독립 재샘플(짝수 ${N} 점 vs 홀수 ${N} 점) | 최소 ${Math.min(...s).toFixed(5)} | 평균 ${(s.reduce((a, b) => a + b, 0) / s.length).toFixed(5)} | ${s.map((x) => x.toFixed(4)).join(' ')}`);
  }
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// 'budget': 방식별 구간 바이트(최고 수준만 / 4수준 합). 5번째 인자 hard 면 'hard' 와 같은 잡음을 넣는다.
//  S0 현재 codec1 무손실(실제 encodeChunk 길이)
//  S1 같은 화질 무손실 개선: 위치 8분트리 6이웃(격자 그대로) + 법선 oct8 문맥 적응형 + 색 min(현재, 채널간잔차 8비트)
//  S2 손실(S9 문자 그대로 통과 후보): 위치 8분트리(격자 그대로) + 색 5비트 채널간잔차 + 법선 미전송(클라 추정, 0 B)
//  S3 가정(S9 문자 기준 미달): 위치 격자 15.6 mm 8분트리 + 색 5비트 + 법선 미전송
//  모든 방식에 조각당 헤더+고정 144 B 와 스트림 컨테이너(약 10 B)를 더한다.
if (PART === 'budget') {
  const HARD = process.argv[5] === 'hard';
  const sc = generate({ seed: SEED, segments: 1, count: N });
  const res = { S0: [0, 0], S1: [0, 0], S2: [0, 0], S3: [0, 0] };
  let pts = [0, 0];
  for (let lv = 0; lv < 4; lv++) {
    const enu = toENU(levelCloud(sc, 0, lv));
    if (HARD) {
      let a = 0x9e3779b9 ^ (SEED + lv); const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
      const colors = new Uint8Array(enu.colors);
      for (let i = 0; i < enu.count; i++) {
        enu.positions[3 * i + 2] += 0.01 * gauss();
        for (let k = 0; k < 3; k++) colors[3 * i + k] = Math.max(0, Math.min(255, colors[3 * i + k] + Math.floor(rnd() * 16) - 8));
        let x = enu.normals[3 * i] + 0.08 * gauss(), y = enu.normals[3 * i + 1] + 0.08 * gauss(), z = enu.normals[3 * i + 2] + 0.08 * gauss();
        const l = Math.hypot(x, y, z); enu.normals[3 * i] = x / l; enu.normals[3 * i + 1] = y / l; enu.normals[3 * i + 2] = z / l;
      }
      enu.colors = colors;
    }
    const raws = chunksOf(enu, lv);
    const b = { S0: 0, S1: 0, S2: 0, S3: 0 };
    for (const raw of raws) {
      const e = encodeChunk(raw); b.S0 += e.length;
      const dv = new DataView(e.buffer, e.byteOffset);
      const curCol = dv.getUint32(HEADER_SIZE + 12, true);
      const sp = sortedPlanes(raw);
      const ov = 144 + 30;
      const pos0 = octreeBits(sp.qe, sp.qn, sp.qu, 0, 'nbr').bits / 8;
      const nx = new Float64Array(sp.n), ny = new Float64Array(sp.n), nz = new Float64Array(sp.n);
      for (let i = 0; i < sp.n; i++) { const v = decodeOctNormal(sp.ox[i], sp.oy[i]); nx[i] = v[0]; ny[i] = v[1]; nz[i] = v[2]; }
      const nrm8 = normalBits(nx, ny, nz, 8) / 8;
      const col8 = Math.min(curCol, colorBits(sp.r, sp.gg, sp.b, 8, 'ic') / 8);
      const col5 = colorBits(sp.r, sp.gg, sp.b, 5, 'ic') / 8;
      const s = 4 + Math.max(0, sp.h.quantExp - 10); // 격자 15.6 mm = 2^-6 m
      const pos4 = octreeBits(sp.qe, sp.qn, sp.qu, Math.max(0, sp.h.quantExp - 6), 'nbr').bits / 8;
      b.S1 += ov + pos0 + nrm8 + col8; b.S2 += ov + pos0 + col5; b.S3 += ov + pos4 + col5;
      void s;
    }
    for (const k of Object.keys(b)) { res[k][0] += b[k]; if (lv === 3) res[k][1] = b[k]; }
    pts[0] += enu.count; if (lv === 3) pts[1] = enu.count;
  }
  log(`# budget N=${N}${HARD ? ' (hard)' : ''}: 방식 | 4수준 합 B | 4수준 B/점(${pts[0]} 점) | 최고 수준만 B | 최고 수준 B/점`);
  for (const [k, [all, top]] of Object.entries(res)) log(`${k} | ${Math.round(all)} | ${f3(all / pts[0])} | ${Math.round(top)} | ${f3(top / pts[1])}`);
  log(`경과 ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
