// F-386: farOwn(제품 server/terrain/drape/index.mjs, 재적합 이상치의 '다듬은 자기 최소–예측 거리 ≥ OUTLIER_PX' 판정)만으로
// 짝 검정 경로에 드는 입력을 찾는다. 계측 사본(helpers.mjs loadDrape instrument)을 돌려 'out === false 이고 창 안 잔차 < 0.5 이며
// farOwn 참' 인 블록을 모으고, 그런 입력만 farOwn=false 사본으로 다시 돌려 결과(블록 local·불확정, maxMisalignPx)를 비교한다.
// 입력: 양성 g/e 세 조합 × 사인 1.5·2·2.5 DN × 잡음 ±1·±2·±3 DN × 시드 30(2000003 + k·7919),
//       귀무(이동 0) 사인 1.5·2·2.5 DN × ±1·±2·±3 DN × 시드 60(같은 생성식).
// 사용: node farown_scan.mjs --repo <제품 저장소> [--part k/N] [--seeds N] [--skip <앞선 출력.jsonl ...>] — 출력은 JSON 줄. 전체(1350회)는 [cloud] CPU 4코어 4분할·다른 작업과 CPU 공유 상태에서 약 10분(회당 약 0.45초 + 계측 사본 비교).
import fs from 'node:fs';
import { repoArg, loadDrape, makeHelpers, G_E, AMPS, seeds, posWarp } from './helpers.mjs';

const argv = process.argv.slice(2);
const repo = repoArg(argv);
const pi = argv.indexOf('--part');
const [part, nPart] = pi >= 0 ? argv[pi + 1].split('/').map(Number) : [0, 1];
const si = argv.indexOf('--seeds');
const nPos = si >= 0 ? Number(argv[si + 1]) : 30, nNull = si >= 0 ? Number(argv[si + 1]) * 2 : 60;
const ins = await loadDrape(repo, { instrument: true });
const off = await loadDrape(repo, { farOwn: false });
const H = makeHelpers(ins);
const images = new Map(AMPS.map((a) => [a, H.lowContrastImage(H.LOW.sine(a))]));
const inputs = [];
// 순서: 양성 ±1·±2 DN(f359_measure 의 540회), 양성 ±3 DN, 귀무 ±2·±3 DN(f359_measure 의 360회), 귀무 ±1 DN.
for (const noises of [[1, 2], [3]]) for (const [g, e] of G_E) for (const amp of AMPS) for (const noise of noises) for (const seed of seeds(nPos)) inputs.push({ kind: 'pos', g, e, amp, noise, seed });
for (const noises of [[2, 3], [1]]) for (const amp of AMPS) for (const noise of noises) for (const seed of seeds(nNull)) inputs.push({ kind: 'null', g: 0, e: 0, amp, noise, seed });
// --skip <jsonl...>: 이미 잰 입력(앞선 실행 출력)은 건너뛴다(중단 뒤 이어 돌리기).
const key = (x) => [x.kind, x.g, x.amp, x.noise, x.seed].join('|');
const done = new Set();
for (let i = argv.indexOf('--skip') + 1; i > 0 && i < argv.length && !argv[i].startsWith('--'); i++) {
  for (const line of fs.readFileSync(argv[i], 'utf8').split('\n')) if (line.startsWith('{')) done.add(key(JSON.parse(line)));
}
const summary = (m) => ({
  status: m.status, max: m.maxMisalignPx, und: m.undecidedBlocks,
  local: m.blocks ? m.blocks.filter((b) => b.local).map((b) => [b.i0, b.j0]) : [],
  undBlocks: m.blocks ? m.blocks.filter((b) => b.undecided).map((b) => [b.i0, b.j0]) : [],
});
for (let k = part; k < inputs.length; k += nPart) {
  const x = inputs[k];
  if (done.has(key(x))) continue;
  const img = images.get(x.amp);
  const warp = x.kind === 'pos' ? posWarp(x.g, x.e) : (p) => p;
  globalThis.__farOwnLog = [];
  const tile = H.warpedTile(img, 0, 0, 0, warp, { noise: x.noise, seed: x.seed });
  const m = ins.measureDrapeAlignment(img, tile);
  const alone = globalThis.__farOwnLog.filter((r) => r.farOwnTrue && r.out === false && r.windowResidual < 0.5 - 1e-9);
  const rec = { ...x, on: summary(m) };
  if (alone.length) {
    rec.alone = alone;
    rec.off = summary(off.measureDrapeAlignment(img, tile));
  }
  console.log(JSON.stringify(rec));
}
