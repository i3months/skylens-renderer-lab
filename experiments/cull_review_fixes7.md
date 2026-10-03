# T08.F34·F35 — PR #29 검토 반영 (제품 feat/cull-review-fixes7)

## 한 일
- 계약(작업자 직접, 제품 3a4eb03): server/cull/degenerate/leaf_check.mjs `checkLeafIndexOneToOne(oc, scratch?)` — leafIndex 일대일·범위, 리프 노드 상자의 ±Infinity 를 cull: 오류로. NaN 상자는 단계별 기존 정책(통과) 유지.
- F-150 ①②: frustum·distance·predict·occlusion 이 공용 검사를 쓰고 priority 도 같은 검사를 넣었다. predict 는 leafBoxes 를 읽기+검사 단계와 채우기 단계로 나눠 중복 leafIndex 로 빠진 리프가 (0,0,0) 상자가 되던 거짓 제거를 막음. clientFrustumCull 은 ±Inf 상자와 getter·Proxy 예외를 cull: 오류로. 정상 입력 출력은 predict·occlusion·priority 에서 변경 전후 해시 동일(서브에이전트 측정). 전 단계 표 시험 leafindex_inf_all_stages.test.mjs(5 단계×3 사례+양성 대조).
- F-151(opus): 허용 집합 상한을 U·(1+1e-3)+1e-3 로(구현 배율 1.0001 보다 크게), 모든 경우 1.0001·U+1e-9 <= M 을 단언. BASE 스냅샷·시드 3 전제 삭제. predict_analytic.test.mjs 에 합성 상자·좁은 화각 해석 배치(번역 상자 A·B, 회전 가장자리 상자)로 h/2·×1.2·회전 ×1.5 변이가 시드와 무관하게 판별. 변이 결과: 해석 시험은 시드 1·2·3·42·99 모두 h/2·×1.2·×1.5 실패, 올바른 구현(교차항 제거 포함) 통과. 결합 운동 시험 자체는 h/2 가 시드 42 에서는 통과(시드 의존 잔여 — 해석 시험이 대신 판별).
- F-152: ① frustum 이 결과 마스크를 검사표로 재사용(단독 할당 n). 단 ⑧ 로 priority 가 검사표를 추가해 세 함수 합계 문턱은 2n 으로 못 돌리고 4n(올리기만, 이유는 시험 주석)과 frustum 단독 ≤ n 단언으로 대체. ② trackAlloc 타입 6종 추가. ③ zero_leaf backface 정규식 구체화. ④ 계약에 '검사 뒤 상태형 접근자는 범위 밖' 명시, combine 의 중복 가드 제거(첫 검사 블록에서 읽은 leafCount 재사용; 가드 제거 변이는 구분 불가 — 중복이었음). ⑤ 클라이언트 getter·Proxy 감쌈. ⑥ 계약·hierarchy_guard 문구 정정, 새 규칙 추가. ⑦ predict·priority 가드를 계층 읽기로만 한정. ⑧ priority 검증 추가(nodeCount·길이·leafIndex·positions). ⑨ occlusion 건너뛴 비유한 점을 occluderPoints·budget 에 세지 않음(변이 3 시험 실패 확인).
- 열린 채 둠: F-151 의 '잘게/성기게 나눈 직선 이동'(+0.02 m 변이) 시험은 시드 3 에서 고른 시점이라 시드 1·2·42·99 에서 전제가 깨짐(올바른 구현에서도). 해석 배치로 바꿔야 함 → 다음 작업. F-152 ③ 의 인접 항목·동치 변이 판단은 T08.F21·F23·F25 로.
- 서브에이전트 11개: opus 1·sonnet 8·haiku 2, 모두 첫 시도 성공, 승격 없음.

## 검증
npm test 결과는 PR 본문. 실제 skylens 체크아웃 입력은 [local].
참고: Node 22 에서 `node --test <디렉터리>` 는 MODULE_NOT_FOUND — glob 으로 돌릴 것. 작업 트리가 d0a1c4d 에서 시작해 서브에이전트가 계약 커밋 위로 직접 브랜치를 만들었다.
