# T08.F40 — F-161·F-162·F-163 처리 (제품 feat/cull-review-fixes11)

## 요약
PR #33 검토의 중간 F-161·F-162 와 낮음 F-163 묶음을 처리했다. 구현 동작은 바꾸지 않았고 시험·계약 문구·벤치만 바꿨다.
서브에이전트 11개: haiku 6, sonnet 5, 승격 없음. 전체 `npm test`(직접): 2563 중 2551 통과·0 실패·12 건너뜀.

## 직접 돌린 변이 (제품 server/cull/degenerate/, 통과 확인 후 되돌림)
| 항목 | 변이 | 결과 |
|---|---|---|
| F-161① | nan_y_leaf.test.mjs 의 `arr[i] = saved;` 를 `;` 로 | `node --test .../nan_y_leaf.test.mjs` 실패 1 |
| F-161② | leaf_check.mjs 1행 단계 이름 주석 삭제 | `node --test .../leaf_check_callers.test.mjs` 실패 1 |
| F-161③ | leaf_check.mjs 의 `hit.boxMin === oc.boxMin && hit.boxMax === oc.boxMax &&` 삭제 | `node --test .../leaf_check_cache.test.mjs` 실패 1 |
원본은 세 파일 모두 실패 0.

## 항목별
- F-161: ① 복원 뒤 boxMin·boxMax deepEqual. ② import 로 고치고 node:test·단계 5개 단언. ③ 노드 100 계층에서 표본 밖에 Infinity 를 넣은 새 배열로 바꿔 끼우는 사례(+F-163⑥ 적중 시 표본 밖 읽기 0).
- F-162: ① contracts/cull·contracts/lod 에 불변 가정·제자리 수정은 감지 보장 없음을 명시, 보장 없음을 고정하는 시험 leaf_check_inplace_unguaranteed.test.mjs. ② distanceCull 은 NaN 축 간격 0·유한 축만으로 판정(하한, 먼 리프는 제거)로 문구 정정, 표 시험에 행 2개(서브에이전트 보고: NaN 안 남김 변이에서 새 시험 실패, 나는 이 변이를 직접 돌리지 않음). ③ leafPriority 문구 정정, priority_nan_score.test.mjs.
- F-163: ① predict 시험 주석·식·수치 단언 복원(서브에이전트 보고의 ×1.003 변이 확인은 직접 재현 안 함). ② 벤치를 합성 계층(노드 26만·리프 19만)의 첫 호출·미스(leafIndex.slice())·적중 분리 측정으로 재작성(서브에이전트 초안은 리프 1933·미스 경로 무효여서 내가 고침). 실행 `node bench/cull/leaf_check_bench.mjs --runs 5`: 첫 호출 8.0 ms, 미스 4.0 ms, 적중 0.008 ms. ③ predict_hierarchy 중복 사례 삭제. ④ combine_guard_wrap 이 재호출·헬퍼 경유 재독 검출(서브에이전트 보고: C5·C6 변이에서 실패, 직접 재현 안 함). ⑤ nonfinite_box_scope 에 높은 시점 predict 행·가려진 리프 occlusion 행(서브에이전트 보고: 변이 실패 확인, 직접 재현 안 함). ⑥ F-161③ 과 함께.

## 한계
F-162② 문구는 구현에 맞췄다(구현이 맞다는 감독 판단). F-163④ 의 지점 수 기반 검출은 변이가 기존 호출 지점과 같은 줄·열에서 재독하면 못 잡는다(서브에이전트 보고). 실제 skylens 체크아웃 입력은 [local]이라 돌리지 않았다.
