// 사용: cd /home/user/wt/p9 && node /home/user/wt/lab/experiments/t13b-quality-measure.mjs [점수=200000] [시드=1]
// 기준 = 솎기 전 원본 점군 렌더, 비교 = (솎기 -> 컬링+LOD -> 조각 왕복) 렌더. 방법은 bench/status_quality 와 동일.
const P = '/home/user/wt/p9/';
const imp = (p) => import(P + p);
const { generate } = await imp('fixtures/scenes/flat_boxes/index.mjs');
const { viewpointToCamera } = await imp('tools/render_views/index.mjs');
const { renderPoints } = await imp('server/raster_ref/zbuffer/index.mjs');
const { ssim } = await imp('server/metrics/ssim/index.mjs');
const { buildHierarchy, materialize } = await imp('server/lod/select/index.mjs');
const { cullAndSelectDefault } = await imp('server/cull/combine/index.mjs');
const sq = await imp('bench/status_quality/index.mjs');
const { W, H, TAU, POINT_SIZE_M, LEVEL_COUNT, MAX_LEAF, EDGE0_M, VIEWPOINTS, chunkedRoundTrip } = sq;
const SIZEC = process.argv[4] === 'sizec'; // 4번째 인자 sizec: 솎은 비율 f 에 맞춰 비교 렌더 점 크기를 1/sqrt(f) 배
const COUNT = +process.argv[2] || 200000, SEED = +process.argv[3] || 1;

function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function subset(c, idx) {
  const n = idx.length, o = { format: c.format, count: n, positions: new Float32Array(3 * n), normals: new Float32Array(3 * n), colors: new Uint8Array(3 * n) };
  idx.forEach((s, k) => { for (let a = 0; a < 3; a++) { o.positions[3 * k + a] = c.positions[3 * s + a]; o.normals[3 * k + a] = c.normals[3 * s + a]; o.colors[3 * k + a] = c.colors[3 * s + a]; } });
  return o;
}
function randomThin(c, f, seed) { // 균일 무작위: 부분 Fisher-Yates 로 정확히 round(f*N)개
  const N = c.count, m = Math.round(N * f), r = rng(seed), p = new Uint32Array(N).map((_, i) => i);
  for (let i = 0; i < m; i++) { const j = i + Math.floor(r() * (N - i)); const t = p[i]; p[i] = p[j]; p[j] = t; }
  return subset(c, Array.from(p.subarray(0, m)).sort((a, b) => a - b));
}
function gridPick(c, cell, seed) { // 3D 격자 칸마다 무작위 1점
  const r = rng(seed), best = new Map();
  for (let i = 0; i < c.count; i++) {
    const k = [0, 1, 2].map((a) => Math.floor(c.positions[3 * i + a] / cell)).join(',');
    const v = r(); const b = best.get(k); if (!b || v > b[0]) best.set(k, [v, i]);
  }
  return Array.from(best.values(), (x) => x[1]).sort((a, b) => a - b);
}
function gridThin(c, f, seed) { // 칸 크기를 이분 탐색해 목표 점 수에 맞춤(칸당 1점이라 정확히 맞추긴 어려움: 실제 비율 보고)
  const target = Math.round(c.count * f);
  if (f >= 1) return subset(c, Array.from({ length: c.count }, (_, i) => i));
  let lo = 0.01, hi = 100, idx;
  for (let it = 0; it < 18; it++) { const mid = Math.sqrt(lo * hi); idx = gridPick(c, mid, seed); if (idx.length > target) lo = mid; else hi = mid; }
  idx = gridPick(c, hi, seed); // hi 는 목표 이하
  return subset(c, idx);
}

const { cloud } = generate({ seed: SEED, count: COUNT });
const cams = VIEWPOINTS.map((vp) => viewpointToCamera({ eye: vp.eye, target: vp.target, up: vp.up, width: W, height: H, fov_y_deg: vp.fov_y_deg }));
const refs = cams.map((cam) => renderPoints(cam, cloud, { pointSizeM: POINT_SIZE_M }).color);
async function run(thinned, ps) {
  const h = buildHierarchy(thinned, { edge0M: EDGE0_M, levelCount: LEVEL_COUNT, maxLeafPoints: MAX_LEAF });
  const s = [];
  let sent = 0;
  for (let i = 0; i < cams.length; i++) {
    const r = await cullAndSelectDefault(h, cams[i], { thresholdPx: TAU, pointSizeM: POINT_SIZE_M });
    const sel = materialize(h, r.selection); sent += sel.count;
    const rt = chunkedRoundTrip(sel);
    s.push(ssim(refs[i], renderPoints(cams[i], rt.cloud, { pointSizeM: ps }).color, W, H, 3));
  }
  return { min: Math.min(...s), mean: s.reduce((a, b) => a + b) / s.length, sent: sent / cams.length };
}
console.log(`장면 flat_boxes seed=${SEED} 점=${cloud.count} 해상도=${W}x${H} 시점=${cams.length}`);
console.log('방식\t목표%\t실제점%\t선택점(시점평균)\tSSIM최소\tSSIM평균\t>=0.95');
for (const f of [1, 0.5, 0.2, 0.1, 0.05]) for (const [name, fn] of [['무작위', randomThin], ['격자', gridThin]]) {
  if (f === 1 && name === '격자') continue;
  const t = f === 1 ? cloud : fn(cloud, f, 7);
  const r = await run(t, SIZEC ? POINT_SIZE_M / Math.sqrt(t.count / cloud.count) : POINT_SIZE_M);
  console.log(`${f === 1 ? '기준' : name}\t${f * 100}\t${(100 * t.count / cloud.count).toFixed(2)}\t${r.sent.toFixed(0)}\t${r.min.toFixed(4)}\t${r.mean.toFixed(4)}\t${r.min >= 0.95 ? 'O' : 'X'}`);
}
