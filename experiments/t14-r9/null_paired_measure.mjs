// F-369: 귀무(이동 0) 짝 검정 t 분포 측정. 사용: node null_paired_measure.mjs [--seeds N] [--mode independent|correlated|both]
// 도우미는 제품 drape_noise.test.mjs 에서 복사(채널 상관 모드만 추가).
import { measureDrapeAlignment, drapeTileSize, DRAPE_PAIRED_K } from '/home/user/skylens-renderer/server/terrain/drape/index.mjs';
import { ALIGN_TOLERANCE_PX, TERRAIN_TILE_SIZE_M, tileBounds } from '/home/user/skylens-renderer/contracts/tower_assets/index.mjs';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const NSEED = Number(arg('--seeds', 60)), MODE = arg('--mode', 'both');
function makeImage(bounds, width, height, colorAt) {
  const rgb = new Uint8Array(width * height * 3);
  const sx = (bounds.maxX - bounds.minX) / width, sy = (bounds.maxY - bounds.minY) / height;
  for (let r = 0; r < height; r++) for (let c = 0; c < width; c++) {
    const [R, G, B] = colorAt(bounds.minX + (c + 0.5) * sx, bounds.maxY - (r + 0.5) * sy, c, r);
    const o = (r * width + c) * 3; rgb[o] = R; rgb[o + 1] = G; rgb[o + 2] = B;
  }
  return { width, height, rgb, bounds };
}
function boxMean(img, x0, x1, y0, y1, out) {
  const b = img.bounds, sx = (b.maxX - b.minX) / img.width, sy = (b.maxY - b.minY) / img.height;
  const u0 = (x0 - b.minX) / sx, u1 = (x1 - b.minX) / sx, v0 = (b.maxY - y1) / sy, v1 = (b.maxY - y0) / sy;
  if (u0 < 0 || v0 < 0 || u1 > img.width || v1 > img.height) return false;
  out.fill(0); let a = 0;
  for (let r = Math.floor(v0); r < Math.ceil(v1); r++) {
    const ly = Math.min(v1, r + 1) - Math.max(v0, r); if (ly <= 0) continue;
    for (let c = Math.floor(u0); c < Math.ceil(u1); c++) {
      const lx = Math.min(u1, c + 1) - Math.max(u0, c); if (lx <= 0) continue;
      const w = lx * ly, o = (r * img.width + c) * 3;
      for (let k = 0; k < 3; k++) out[k] += img.rgb[o + k] * w; a += w;
    }
  }
  for (let k = 0; k < 3; k++) out[k] /= a; return true;
}
// shared=true: 픽셀당 잡음 하나를 세 채널에 같이 더한다(채널 상관 귀무). false 는 원본과 같은 채널 독립 잡음.
function warpedTile(img, tx, ty, mip, warp, { noise = 0, seed = 12345, shared = false } = {}) {
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 2 ** 32; };
  const { width, height } = drapeTileSize(img, mip);
  const tb = tileBounds(tx, ty), pw = TERRAIN_TILE_SIZE_M / width, ph = TERRAIN_TILE_SIZE_M / height, n = 4;
  const rgb = new Uint8Array(width * height * 3), mask = new Uint8Array(width * height);
  const acc = new Float64Array(3), sum = new Float64Array(3);
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
    sum.fill(0); let ok = true;
    for (let b = 0; b < n && ok; b++) for (let a = 0; a < n && ok; a++) {
      const q = warp({ x: tb.minX + (i + (a + 0.5) / n) * pw, y: tb.maxY - (j + (b + 0.5) / n) * ph });
      ok = boxMean(img, q.x - pw / n / 2, q.x + pw / n / 2, q.y - ph / n / 2, q.y + ph / n / 2, acc);
      for (let k = 0; k < 3; k++) sum[k] += acc[k];
    }
    if (!ok) continue;
    const o = j * width + i; mask[o] = 255;
    const e0 = shared && noise ? Math.round((rnd() * 2 - 1) * noise) : 0;
    for (let k = 0; k < 3; k++) {
      const e = shared ? e0 : (noise ? Math.round((rnd() * 2 - 1) * noise) : 0);
      rgb[o * 3 + k] = Math.max(0, Math.min(255, Math.round(sum[k] / (n * n)) + e));
    }
  }
  return { tx, ty, mip, width, height, rgb, coverage: { mask } };
}
const HASH = (c, r) => (((c * 73856093) ^ (r * 19349663)) >>> 0);
const TEX_A = (x, y, c, r) => [((Math.floor(x / 8) + Math.floor(y / 8)) & 1) ? 200 : 40, Math.round(128 + 100 * Math.sin(x * 0.07) * Math.cos(y * 0.05)), HASH(c, r) % 256];
const sine = (amp) => (x, y, c, r) => [Math.round(128 + amp * Math.sin((2 * Math.PI * c) / 48)), Math.round(60 + amp * Math.sin((2 * Math.PI * r) / 32)), 60];
const lowImg = (low) => makeImage({ minX: -64, minY: -64, maxX: 128, maxY: 128 }, 384, 384, (x, y, c, r) => (x >= 26 && x < 46 && y >= 36 && y < 52 ? low(x, y, c, r) : TEX_A(x, y, c, r)));

const AMPS = [1, 1.5, 2, 2.5, 3], NOISES = [1, 2, 3, 4];
const seeds = Array.from({ length: NSEED }, (_, i) => (i + 1) * 7919);
function run(shared) {
  let runs = 0, calls = 0, local = 0, bad = 0; const ts = [];
  for (const amp of AMPS) {
    const img = lowImg(sine(amp));
    for (const noise of NOISES) for (const seed of seeds) {
      const m = measureDrapeAlignment(img, warpedTile(img, 0, 0, 0, (p) => p, { noise, seed, shared }));
      runs++;
      if (m.status !== 'measured' || !(m.maxMisalignPx < ALIGN_TOLERANCE_PX)) bad++;
      for (const b of m.blocks) { if (b.local) local++; if (Number.isFinite(b.pairedT)) { calls++; ts.push(b.pairedT); } }
    }
  }
  const mean = ts.reduce((a, b) => a + b, 0) / ts.length;
  const sd = Math.sqrt(ts.reduce((a, b) => a + (b - mean) ** 2, 0) / (ts.length - 1));
  return { runs, calls, max: Math.max(...ts), mean, sd, m4: mean + 4 * sd, local, bad };
}
const rows = [];
if (MODE !== 'correlated') rows.push(['채널 독립', run(false)]);
if (MODE !== 'independent') rows.push(['채널 상관', run(true)]);
console.log(`설정: 사인 ${AMPS} DN × 잡음 ±${NOISES} DN = ${AMPS.length * NOISES.length}설정 × 시드 k·7919(k=1..${NSEED}), 밉 0, 이동 0, PAIRED_K=${DRAPE_PAIRED_K}`);
console.log('| 모드 | 총 시험 | 짝 검정 호출 | 최대 t | 평균 | 표준편차 | 평균+4sd | 거짓 local(블록) | 정합 실패 |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [n, r] of rows) console.log(`| ${n} | ${r.runs} | ${r.calls} | ${r.max.toFixed(3)} | ${r.mean.toFixed(3)} | ${r.sd.toFixed(3)} | ${r.m4.toFixed(3)} | ${r.local} | ${r.bad} |`);
