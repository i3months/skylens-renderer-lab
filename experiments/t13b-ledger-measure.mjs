// t13b: 현황판 어댑터 retired 장부의 조각당 바이트를 잰다(결정 0041 '조각당 약 216 B' 재현용).
// 실행(연구 저장소 작업 트리 루트에서):
//   SKYLENS_ROOT=<제품 저장소 경로> node --expose-gc experiments/t13b-ledger-measure.mjs [구간수=4000] [수준당조각=16]
// 방법: 실제 createStatusView(client/status/e2e/index.mjs) 를 시험용 가짜 모듈(같은 폴더 fakes.mjs)로 조립한다.
//   1단계: 구간마다 수준 3 을 도착시킨다(수준 3 조각은 live 로 남는다).
//   2단계: 구간마다 수준 0..2 를 도착시킨다(이미 더 높은 수준이 있어 건너뜀 → 그 조각들이 retired 로 간다).
//   각 단계 끝에서 gc 를 세 번 돌린 뒤 heapUsed 를 잰다. 2단계 증가분 / 2단계 조각 수 = retired 조각당 바이트.
//   (1단계 증가분 / 1단계 조각 수 는 live 조각 + 수준 기계 몫이라 참고용.)
// 한계: pieceSeq 를 늘기만 하는 정수로, key 는 '구간.수준.…' 문자열로 쓴다. key 문자열 길이에 따라 값이 달라진다.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.env.SKYLENS_ROOT;
if (!root) throw new Error('SKYLENS_ROOT(제품 저장소 경로)를 환경 변수로 준다');
if (typeof globalThis.gc !== 'function') throw new Error('node --expose-gc 로 실행한다');
const imp = (rel) => import(pathToFileURL(path.join(root, rel)).href);
const { createStatusView } = await imp('client/status/e2e/index.mjs');
const { FAKE_MODULES } = await imp('client/status/e2e/fakes.mjs');
const { countOfTestChunk, testChunk, pieceKeyOf } = await imp('client/status/e2e/mock_server.mjs');

const S = Number(process.argv[2] ?? 4000);
const P = Number(process.argv[3] ?? 16);
const chunk = testChunk(10);
const view = createStatusView({ modules: FAKE_MODULES, countOf: countOfTestChunk });
let seq = 1;
const heap = () => { for (let i = 0; i < 3; i += 1) globalThis.gc(); return process.memoryUsage().heapUsed; };

function sendLevel(seg, level) {
  const first = seq;
  for (let c = 0; c < P; c += 1) view.handle({ type: 'PIECE', pieceSeq: seq++, key: pieceKeyOf(seg, level, c), chunk });
  view.handle({ type: 'LEVEL_ARRIVED', segmentId: seg, level, firstPieceSeq: first, pieceCount: P });
}

view.handle({ type: 'WELCOME', sessionId: 7, resumed: false });
const h0 = heap();
for (let s = 0; s < S; s += 1) sendLevel(s, 3);
const h1 = heap();
for (let s = 0; s < S; s += 1) for (let l = 0; l < 3; l += 1) sendLevel(s, l);
const h2 = heap();

const live = S * P;
const retired = S * 3 * P;
const fmt = (n) => n.toFixed(1);
console.log(JSON.stringify({
  node: process.version, segments: S, piecesPerLevel: P,
  phase1_pieces: live, phase1_heap_delta_B: h1 - h0, phase1_B_per_piece: fmt((h1 - h0) / live),
  phase2_retired_pieces: retired, phase2_heap_delta_B: h2 - h1, retired_B_per_piece: fmt((h2 - h1) / retired),
}, null, 1));
