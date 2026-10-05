// T14.R11 연구 측정 공용 도우미(F-386·F-388).
// 합성 영상·타일 도우미(makeImage·boxMean·warpedTile·HASH·TEX_A·LOW.sine·lowContrastImage)는 제품
// server/terrain/drape/drape_noise.test.mjs(feat/t14-r11 0f672c7)에서 그대로 복사했다. 제품 시험이 바뀌면 이 사본은 따로 맞춰야 한다.
// loadDrape(repo, { farOwn, instrument }): 제품 drape 를 import 한다.
//   farOwn === false 면 제품 server/terrain/drape 디렉터리를 임시 디렉터리로 복사해 `const farOwn = ...;` 를 `const farOwn = false;` 로
//   바꾼 사본을 import 한다(contracts 는 제품 것을 심볼릭 링크로 써서 같은 모듈 인스턴스를 쓴다).
//   instrument 면 사본에서 farOwn 판정 직후 globalThis.__farOwnLog 에 블록 진단(창 안 잔차·자기 최소·창 최소·예측)을 남긴다.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function repoArg(argv = process.argv.slice(2)) {
  const i = argv.indexOf('--repo');
  const repo = i >= 0 ? argv[i + 1] : process.env.SKYLENS_RENDERER_DIR;
  if (!repo) {
    console.error('사용법: node <스크립트> --repo /path/to/skylens-renderer  (또는 SKYLENS_RENDERER_DIR)');
    process.exit(1);
  }
  return path.resolve(repo);
}

const FAROWN_RE = /const farOwn = [^;]+;/;
// 후보 규칙(F-359 (B), 0044 T14.R11 결정; 제품에는 적용하지 않은 규칙): 재적합 뒤 inlier 이면서 두 축을 잰 블록(ix && iy, local·불확정 아님) 중
// 표본 픽셀(xs × ys, mask 255 만)의 표준편차가 세 채널 모두 lowStd(기본 4 DN) 이하인 저대비 블록이, 자기 다듬은 최소가 예측에서 minOwn(0.35 px)
// 이상 떨어져 있고 unexcludedPx > minUnex(1.25 px) 이면 markUndecided. 위치: 한 축만 평평한 블록 루프 바로 앞.
// 원 측정 스크립트(제품 09393d31)는 저장소에 남지 않아 0044·t14-r11.md 의 규칙 서술로 다시 구현했다(F-390 ③). 원 구현과 같은지는 확인할 수 없다.
const CAND_ANCHOR = '    for (const b of blocks) {\n      if (b.local || b.undecided || (b.ix && b.iy)) continue;';
const candidateCode = ({ lowStd, minOwn, minUnex }) => `    for (const b of blocks) {
      if (b.local || b.undecided || !(b.ix && b.iy) || !fit.inlier.has(b)) continue;
      const cm = [0, 0, 0], cs2 = [0, 0, 0]; let cn = 0;
      for (const j of b.ys) for (const i of b.xs) {
        const o = j * TW + i;
        if (mask && mask[o] !== 255) continue;
        cn++;
        for (let k = 0; k < 3; k++) { const v = trgb[o * 3 + k]; cm[k] += v; cs2[k] += v * v; }
      }
      if (cn < 2) continue;
      let low = true;
      for (let k = 0; k < 3; k++) { const m = cm[k] / cn; if (Math.sqrt(Math.max(0, cs2[k] / cn - m * m)) > ${lowStd}) low = false; }
      if (!low) continue;
      const [cpx, cpy] = fit.at(b.di, b.dj);
      const co = ownFine(b);
      if (Math.hypot(co.dx - cpx, co.dy - cpy) >= ${minOwn} && unexcludedPx(b, [cpx, cpy]) > ${minUnex}) markUndecided(b, [cpx, cpy]);
    }
`;
export async function loadDrape(repo, { farOwn = true, instrument = false, candidate = null } = {}) {
  const contracts = await import(pathToFileURL(path.join(repo, 'contracts/tower_assets/index.mjs')).href);
  const src = path.join(repo, 'server/terrain/drape');
  if (farOwn && !instrument && !candidate) return { ...contracts, ...(await import(pathToFileURL(path.join(src, 'index.mjs')).href)), variant: 'product' };
  const text = fs.readFileSync(path.join(src, 'index.mjs'), 'utf8');
  const hits = text.match(new RegExp(FAROWN_RE.source, 'g')) || [];
  if (hits.length !== 1) throw new Error(`farOwn 선언을 정확히 하나 찾지 못함(${hits.length})`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drape-farown-'));
  fs.mkdirSync(path.join(tmp, 'server/terrain'), { recursive: true });
  fs.cpSync(src, path.join(tmp, 'server/terrain/drape'), { recursive: true });
  fs.symlinkSync(path.join(repo, 'contracts'), path.join(tmp, 'contracts'));
  let decl = farOwn ? hits[0] : 'const farOwn = false;';
  if (instrument) {
    decl += ' if (globalThis.__farOwnLog) globalThis.__farOwnLog.push({ i0: b.i0, j0: b.j0, farOwnTrue: '
      + (farOwn ? 'farOwn' : `(${hits[0].replace(/^const farOwn = |;$/g, '')})`)
      + ', out, windowResidual: residual(b, fit.at), own: [of0.dx, of0.dy], window: [b.dx, b.dy], pred: [px0, py0] });';
  }
  let out2 = text.replace(FAROWN_RE, decl);
  if (candidate) {
    if (out2.split(CAND_ANCHOR).length !== 2) throw new Error('후보 규칙 삽입 위치를 정확히 하나 찾지 못함');
    const c = { lowStd: 4, minOwn: 0.35, minUnex: 1.25, ...candidate };
    out2 = out2.replace(CAND_ANCHOR, () => candidateCode(c) + CAND_ANCHOR);
  }
  fs.writeFileSync(path.join(tmp, 'server/terrain/drape/index.mjs'), out2);
  const mod = await import(pathToFileURL(path.join(tmp, 'server/terrain/drape/index.mjs')).href);
  return { ...contracts, ...mod, variant: `${farOwn ? 'farOwn' : 'no-farown'}${instrument ? '+instrument' : ''}${candidate ? '+candidate' : ''}`, tmp };
}

export function makeHelpers({ drapeTileSize, tileBounds, TERRAIN_TILE_SIZE_M }) {
/** 합성 영상: 각 픽셀 중심 ENU 로 색을 정한다. 행 0 = 북. */
function makeImage(bounds, width, height, colorAt) {
  const rgb = new Uint8Array(width * height * 3);
  const sx = (bounds.maxX - bounds.minX) / width, sy = (bounds.maxY - bounds.minY) / height;
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const [R, G, B] = colorAt(bounds.minX + (c + 0.5) * sx, bounds.maxY - (r + 0.5) * sy, c, r);
      const o = (r * width + c) * 3;
      rgb[o] = R; rgb[o + 1] = G; rgb[o + 2] = B;
    }
  }
  return { width, height, rgb, bounds };
}

/** 원본 영상의 축 정렬 박스 [x0,x1]×[y0,y1](ENU) 면적 가중 평균. 영상 밖에 걸치면 false. */
function boxMean(img, x0, x1, y0, y1, out) {
  const b = img.bounds, sx = (b.maxX - b.minX) / img.width, sy = (b.maxY - b.minY) / img.height;
  const u0 = (x0 - b.minX) / sx, u1 = (x1 - b.minX) / sx, v0 = (b.maxY - y1) / sy, v1 = (b.maxY - y0) / sy;
  if (u0 < 0 || v0 < 0 || u1 > img.width || v1 > img.height) return false;
  out.fill(0);
  let a = 0;
  for (let r = Math.floor(v0); r < Math.ceil(v1); r++) {
    const ly = Math.min(v1, r + 1) - Math.max(v0, r);
    if (ly <= 0) continue;
    for (let c = Math.floor(u0); c < Math.ceil(u1); c++) {
      const lx = Math.min(u1, c + 1) - Math.max(u0, c);
      if (lx <= 0) continue;
      const w = lx * ly, o = (r * img.width + c) * 3;
      for (let k = 0; k < 3; k++) out[k] += img.rgb[o + k] * w;
      a += w;
    }
  }
  for (let k = 0; k < 3; k++) out[k] /= a;
  return true;
}

/**
 * warp 로 내용이 틀어진 드레이프 타일(밉 크기·박스 필터는 buildDrapeTile 과 같음, 픽셀당 4×4 부분 박스로 근사).
 * keep(i, j) 가 false 인 픽셀은 영상 밖처럼 비운다(mask 0). noise > 0 이면 채널마다 결정적 ±noise 균등 잡음(seed 로 정함)을 더한다.
 * sameNoise 면 픽셀마다 잡음 하나를 세 채널에 똑같이 더한다(채널 상관 잡음, F-376).
 * coverage.bounds 는 넣지 않는다(피복 범위는 mask 로만 알 수 있다).
 */
function warpedTile(img, tx, ty, mip, warp, { keep = () => true, noise = 0, seed = 12345, sameNoise = false } = {}) {
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 2 ** 32; };
  const { width, height } = drapeTileSize(img, mip);
  const tb = tileBounds(tx, ty), pw = TERRAIN_TILE_SIZE_M / width, ph = TERRAIN_TILE_SIZE_M / height, n = 4;
  const rgb = new Uint8Array(width * height * 3), mask = new Uint8Array(width * height);
  const acc = new Float64Array(3), sum = new Float64Array(3);
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      sum.fill(0);
      let ok = keep(i, j);
      for (let b = 0; b < n && ok; b++) {
        for (let a = 0; a < n && ok; a++) {
          const q = warp({ x: tb.minX + (i + (a + 0.5) / n) * pw, y: tb.maxY - (j + (b + 0.5) / n) * ph });
          ok = boxMean(img, q.x - pw / n / 2, q.x + pw / n / 2, q.y - ph / n / 2, q.y + ph / n / 2, acc);
          for (let k = 0; k < 3; k++) sum[k] += acc[k];
        }
      }
      if (!ok) continue;
      const o = j * width + i;
      mask[o] = 255;
      const e0 = sameNoise && noise ? Math.round((rnd() * 2 - 1) * noise) : 0;
      for (let k = 0; k < 3; k++) {
        const e = sameNoise ? e0 : noise ? Math.round((rnd() * 2 - 1) * noise) : 0;
        rgb[o * 3 + k] = Math.max(0, Math.min(255, Math.round(sum[k] / (n * n)) + e));
      }
    }
  }
  return { tx, ty, mip, width, height, rgb, coverage: { mask } };
}

const HASH = (c, r) => (((c * 73856093) ^ (r * 19349663)) >>> 0);
// 영상 A 와 같은 무늬(8 m 바둑판 + 사인 + 해시, 잡음 0)를 픽셀 중심 ENU·번호로.
const TEX_A = (x, y, c, r) => [
  ((Math.floor(x / 8) + Math.floor(y / 8)) & 1) ? 200 : 40, Math.round(128 + 100 * Math.sin(x * 0.07) * Math.cos(y * 0.05)), HASH(c, r) % 256,
];
// 저대비 무늬(잡음 0). c·r 은 0.5 m/px 영상 픽셀 번호(= 밉 0 타일 픽셀).
const LOW = {
  // 사인 진폭 amp DN, R 은 x 주기 48 px, G 는 y 주기 32 px.
  sine: (amp) => (x, y, c, r) => [Math.round(128 + amp * Math.sin((2 * Math.PI * c) / 48)), Math.round(60 + amp * Math.sin((2 * Math.PI * r) / 32)), 60],
  // R·G 채널 ±1 DN 해시 무늬.
  hash1: (x, y, c, r) => [128 + (HASH(c, r) % 3) - 1, 60 + (HASH(r, c) % 3) - 1, 60],
  // 균일 바탕에 R +6 DN 점(밀도 1/32, 위치는 해시 상위 비트 — 하위 비트는 주기 8 무늬).
  dots6: (x, y, c, r) => [(HASH(c, r) >>> 16) % 32 === 0 ? 134 : 128, 60, 60],
  // F-353: R = x 경사 0.15 DN/px + x 36·44 m 의 4.7 DN 세로 경계 둘(블록 안 4.7→9.4 DN), G = y 경사 0.12→0.24 DN/px.
  // y 로 1 px 옮긴 비용 상승은 1/12 이하(수정 전: 블록 제외), 4 px 에서는 뚜렷하다.
  edgeGrad: (x, y, c, r) => [
    Math.round(100 + 0.15 * (c - 180) + (x >= 36 ? 4.7 : 0) + (x >= 44 ? 4.7 : 0)),
    Math.round(60 + 0.12 * (r - 152) + (0.12 * (r - 152) ** 2) / 64), 60,
  ],
  // F-353: 위의 R 만, G 는 균일 → y 축은 어느 거리에서도 평평(한 축만 평평한 블록).
  edgeOnly: (x, y, c, r) => [Math.round(100 + 0.15 * (c - 180) + (x >= 36 ? 4.7 : 0) + (x >= 44 ? 4.7 : 0)), 60, 60],
};
/** 타일 격자와 맞물린 0.5 m/px 영상: x 26..46, y 36..52 m 는 저대비 무늬 low, 그 밖은 영상 A 무늬(잡음 0). */
function lowContrastImage(low) {
  return makeImage({ minX: -64, minY: -64, maxX: 128, maxY: 128 }, 384, 384, (x, y, c, r) => (
    x >= 26 && x < 46 && y >= 36 && y < 52 ? low(x, y, c, r) : TEX_A(x, y, c, r)));
}
  return { makeImage, boxMean, warpedTile, HASH, TEX_A, LOW, lowContrastImage };
}

export const G_E = [[-0.125, -1.375], [-0.25, -1.25], [-0.375, -1.125]];
export const AMPS = [1.5, 2, 2.5];
export const seeds = (n) => Array.from({ length: n }, (_, i) => 2000003 + i * 7919);
// 블록 x 32..40·y 40..48 m 만 g+e, 나머지 g 만큼 동쪽(실제 블록 이동 |g+e| = 1.5 px). drape_noise.test.mjs POS 와 같은 식.
export const posWarp = (g, e) => (p) => ({ x: p.x + (p.x >= 32 && p.x < 40 && p.y >= 40 && p.y < 48 ? g + e : g) * 0.5, y: p.y });
