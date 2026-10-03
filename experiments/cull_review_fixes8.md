# T08.F36 — PR #30 검토 반영 (제품 feat/cull-review-fixes8)

## 한 일
- F-153(sonnet 3): 공용 leaf_check 가 leafIndex 의 Number.isInteger 를 요구(1.5·NaN → cull: 오류, 검사 제거 변이는 시험 실패). predict·priority 는 leafIndex 가 Int32Array 여야 함(predict 는 boxMin·boxMax 가 Float32/Float64Array — 기존 시험 픽스처가 Float64Array 라 frustum 의 Float32 전용보다 느슨함). clientFrustumCull 의 leafBoxesOf 도 Int32Array 요구. 전 단계 표 시험에 leafPriority 와 '정수 아닌 값'·'Float32Array leafIndex' 사례 추가(37 사례).
- F-155 ①: leafPriority·orderChunks 의 검사표를 결과(점수) 버퍼로 재사용 → priority_resolution 단언을 2n→n 으로 되돌림. 세 함수 합계는 4n→3n(각 함수가 n 칸 버퍼 하나씩; 호출자 마스크는 0/1 값이라 검사표로 못 씀 → 2n 은 불가, 근거는 시험 주석). 정상 출력 해시 12 시점 동일.
- F-155 ②: combine_guard_wrap 가 검사 뒤 leafCount 재독 변이(48번째 읽기)를 읽기 횟수 47 고정으로 잡음. 47 은 현재 assertHierarchyInput 의 실측이라 검사 블록이 바뀌면 함께 고쳐야 함(취약점).
- F-155 ③: 단계별 비유한 상자 범위를 실측해 계약에 기재(frustum·distance·occlusion·priority·predict: 리프 ±Inf 거부·NaN 통과, backface·leafNormalCones·cullAndSelect: 모든 노드 NaN/±Inf 거부, 클라이언트: 리프 상자 ±Inf 거부) + nonfinite_box_scope 시험 33 사례.
- F-155 ④(opus): '잘게/성기게 나눈 직선 이동' 을 합성 상자 3개·좁은 화각 해석 배치로 이동. 시드 1·2·3·5·42·99 모두 올바른 구현 통과, +0.02 m·+0.2 m·×1.2·h/2 변이 실패.
- 서브에이전트 7개: opus 1·sonnet 4·haiku 2, 첫 시도 성공, 승격 없음(F-153·F-155 가 겹치지 않는 조각 7 개로만 쪼개져 10 개 미만).

## 검증
npm test 2288 중 2276 통과·0 실패·12 건너뜀(직접). 실제 skylens 체크아웃은 [local]. F-154·F-156 은 T08.F37 로.
