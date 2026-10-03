# T08.F41 컬링 검토 보정 (F-164·F-165)

제품 브랜치 feat/cull-review-fixes12 (기준 328080c). 서브에이전트 8개(sonnet 4, haiku 4, 승격 없음). 전체 `npm test`: 2554 통과·0 실패·12 건너뜀(직접 실행).

## F-164
- ① priority_nan_score: 노드를 `leafIndex.indexOf(k)` 로 찾아 리프 k 상자에 NaN 주입, 주입 전후 score[k] 가 다르고 유한함·다른 리프 불변을 단언. '버그' 표현 삭제. `priority/index.mjs:155` 가드(`Number.isFinite(s) ? s : 0`)는 도달 경로가 없다: wins[k] 는 셀 수×px ≤ W·H, degenerateCamera 가 해상도·R·t·K 를 제한, leaf_check 가 ±Inf 거부, clippedArea 는 0 또는 유한. 해상도 1e150~1e300 카메라는 퇴화로 거부돼 가드에 닿지 않음. 서브에이전트가 가드를 `out[k] = s;` 로 바꿔 돌린 결과 priority 80/80 통과(실패 없음)로 이 판단과 일치. 그래서 계약 cull 에 '방어용, 도달 경로 없음' 으로 적고 시험 2 이름을 실제 검사 내용(뒤·밖 리프 0, 안 리프 양수, 모두 유한)으로 바꿈. 내가 이 변이를 따로 재실행하지는 않음.
- ② leaf_check_callers: importingModules 가 5단계(frustum·distance·predict·occlusion·priority)를 모두 포함 단언, client 경로 `../../client` + existsSync, ENOENT 외 오류 재던짐, import 정규식 판정, 머리 주석 자름 -1 처리 오류 수정. 서브에이전트 변이: 단계 index.mjs 의 leaf_check→leaf_chk 치환 → 실패 1, leaf_check.mjs 1행 단계 이름 삭제 → 실패 1, 원복 시 4/4. (내가 재실행하지는 않음)
- ③ 계약 cull :10(NaN 쪽 경계 비교 무시·유한 경계로 한쪽 간격, ±Inf 포함 비유한 합은 0)·:12(distanceCull 제외) 정정, 표 시험에 min.x=NaN·max.x=-1e6·C=0 → 1e6 행 추가(nan_box_policy_table 75/75). 계약 lod :17 표본은 cull checkLeafIndexOneToOne 만, :20 근거를 leaf_check_inplace_unguaranteed.test.mjs 로, '감지 보장 없음'.

## F-165
- ① leaf_check_bench: --runs·--points 양의 정수, --scale small|large 검사 후 usage·exit 1(6개 잘못된 입력 확인은 서브에이전트 실행), --points 반영.
- ② 단계별 첫 호출을 새 계층에서 측정(JIT 비용은 남아 있어 냉기동 값 아님, 머리 주석에 명시). large 는 22690 리프·30069 노드(기존 1933). 기본 규모는 small 6664점·71 리프(이전 노트의 400000→6664 축소 그대로). 측정 환경: node v22.22.0, nproc 4. 기본 실행 leaf_check 첫 호출 6.8~7.5 ms·미스 7.3~7.7 ms·적중 0.004 ms. 이전 노트의 '미스 4.0 ms' 는 large(--runs 5) 실행의 최솟값으로, 미스는 실행마다 달라 4.0~7.7 ms — 미스 ≈ 첫 호출이 정정된 서술.
- ③ combine_guard_wrap: 호출 지점 수 대신 검사 블록 종료 표지 뒤 combine 읽기를 위반으로 세고, 블록 안 읽기는 기준선+1 과 비교. 같은 줄 반복 호출 변이 포함 7종 변이 모두 실패(서브에이전트 실행), combine 139/139.
- ④⑤ 주석 정정, 표본 노드 5·6 하드코딩을 step 에서 계산(노드 15·16), 이름에 '감지가 개선되면 갱신'. 22/22.

## 참고
- `node --test <디렉터리>` 는 Node 22 에서 모듈 경로로 해석돼 실패한다. 글롭을 쓴다(`npm test` 는 글롭이라 문제 없음).
- 실제 skylens 체크아웃 입력은 [local] 이라 합성 시험만.
