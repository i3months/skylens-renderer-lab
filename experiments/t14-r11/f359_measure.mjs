// F-359 (B) 측정(F-388 로 제품 server/terrain/drape/f359_measure.mjs 에서 옮김): 저대비 사인 블록 실제 1.5 px 국소 어긋남(양성 540회)의
// 거짓 정합 통과와, 이동 0(귀무 360회)의 거짓 local·거짓 불확정.
// 양성: g/e (−0.125,−1.375)·(−0.25,−1.25)·(−0.375,−1.125) × 사인 1.5·2·2.5 DN × 타일 잡음 ±1·±2 DN × 시드 30(2000003 + k·7919).
//   거짓 통과 = 'measured 이면서 maxMisalignPx ≤ ALIGN_TOLERANCE_PX'.
// 귀무: 사인 1.5·2·2.5 DN × ±2·±3 DN × 시드 60(같은 생성식), 이동 0. 거짓 local = local 블록이 있는 타일, 거짓 불확정 = 불확정 블록이 있는 타일.
//   귀무 분모는 measured 회차만이다(F-389 ⑧): measured·unmeasurable 수를 따로 출력한다.
// 사용: node experiments/t14-r11/f359_measure.mjs --repo <제품 저장소 루트> [--no-farown] [--seeds N] [--list]
//   --repo 가 없으면 SKYLENS_RENDERER_DIR. --no-farown 은 제품 drape 디렉터리를 임시 디렉터리로 복사해 `const farOwn = false;` 로 바꾼
//   사본을 import 한다(helpers.mjs loadDrape). --seeds N 은 양성 시드 N·귀무 시드 2N 으로 줄인 시험 실행. --list 는 거짓 통과 [잡음, 진폭, g, seed].
// 소요 시간: 전체(900회) 한 번 [cloud] CPU 한 코어로 약 7~8분 추정(회당 약 0.45~0.5초, R11 노트 기록은 약 9.5분).
// 도우미(makeImage·boxMean·warpedTile·HASH·TEX_A·LOW·lowContrastImage)는 helpers.mjs 에 있고, 제품
// server/terrain/drape/drape_noise.test.mjs(feat/t14-r11 0f672c7)에서 그대로 복사했다.
import { repoArg, loadDrape, makeHelpers, G_E, AMPS, seeds, posWarp } from './helpers.mjs';

const argv = process.argv.slice(2);
const repo = repoArg(argv);
const noFarOwn = argv.includes('--no-farown');
const listFails = argv.includes('--list');
const si = argv.indexOf('--seeds');
const nPos = si >= 0 ? Number(argv[si + 1]) : 30, nNull = si >= 0 ? 2 * Number(argv[si + 1]) : 60;
const D = await loadDrape(repo, { farOwn: !noFarOwn });
const { ALIGN_TOLERANCE_PX, measureDrapeAlignment } = D;
const H = makeHelpers(D);
const images = new Map(AMPS.map((a) => [a, H.lowContrastImage(H.LOW.sine(a))]));
const t0 = Date.now();

const rows = [];
const fails = [];
for (const [g, e] of G_E) {
  let pass = 0;
  const warp = posWarp(g, e);
  for (const amp of AMPS) {
    for (const noise of [1, 2]) {
      for (const seed of seeds(nPos)) {
        const m = measureDrapeAlignment(images.get(amp), H.warpedTile(images.get(amp), 0, 0, 0, warp, { noise, seed }));
        if (m.status === 'measured' && m.maxMisalignPx <= ALIGN_TOLERANCE_PX) { pass++; fails.push([noise, amp, g, seed]); }
      }
    }
  }
  rows.push([g, e, pass]);
}
let nullLocal = 0, nullUnd = 0, nullRuns = 0, nullMeasured = 0;
const id = (p) => p;
for (const amp of AMPS) {
  for (const noise of [2, 3]) {
    for (const seed of seeds(nNull)) {
      const m = measureDrapeAlignment(images.get(amp), H.warpedTile(images.get(amp), 0, 0, 0, id, { noise, seed }));
      nullRuns++;
      if (m.status !== 'measured') continue;
      nullMeasured++;
      if (m.blocks.some((b) => b.local)) nullLocal++;
      if (m.undecidedBlocks) nullUnd++;
    }
  }
}
const nPosRuns = G_E.length * AMPS.length * 2 * nPos;
console.log(`repo ${repo}`);
console.log(`drape ${D.variant}${noFarOwn ? ` (사본 ${D.tmp})` : ''}, 양성 시드 ${nPos}·귀무 시드 ${nNull}`);
console.log(`| g / e | 거짓 정합 통과(/${nPosRuns / G_E.length}) |`);
console.log('|---|---|');
for (const [g, e, p] of rows) console.log(`| ${g} / ${e} | ${p} |`);
console.log(`양성 합 ${rows.reduce((s, r) => s + r[2], 0)}/${nPosRuns}`);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) : 'NaN');
console.log(`귀무 ${nullRuns}회: measured ${nullMeasured}, unmeasurable ${nullRuns - nullMeasured}; `
  + `거짓 local ${nullLocal}/${nullMeasured}, 거짓 불확정 ${nullUnd}/${nullMeasured} (${pct(nullUnd, nullMeasured)} %)`);
console.log(`소요 ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (listFails) for (const f of fails) console.log(JSON.stringify(f));
