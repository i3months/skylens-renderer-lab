# T08.F38 — PR #31 검토 반영 (제품 feat/cull-review-fixes9)

## 한 일
- F-157 ①②③(sonnet): nonfinite_box_scope.test.mjs 를 표 주도로 다시 씀(33→133 시험). NaN 리프는 정상 마스크와 비교해 남김(1)·다른 리프 불변을 단언, 내부 노드 사례는 `assert.ok(node >= 0)`, 리프 ±Inf(boxMin +Inf·boxMax −Inf × x·y·z) 66 행 추가. 머리 주석은 '계약 문구를 시험'. 정상에서 제거되던 리프의 NaN 단언은 다른 축으로 정당하게 제거될 수 있어 뺌.
- 발견·수정(sonnet, 추가 서브에이전트): 리프 상자 y 좌표만 NaN 이면 frustumCull·clientFrustumCull(카메라에 따라)·predictiveMask(정지 시)가 정상에서 남던 리프를 제거함 — 거짓 제거 0 위반. 공용 boxTest(server/lod/select/view_check.mjs)는 소유 밖이라 건드리지 않고 세 단계에서 상자 좌표 6개 중 NaN 이 있으면 통과(1)로 둠. 새 시험 nan_y_leaf.test.mjs 9 건(수정 되돌리면 6 건 실패; predict 이동 사례는 부풀림이 NaN 이 되어 되돌려도 우연히 통과).
- F-157 ④·F-158 ④: 계약 :10 클라이언트 줄을 'leafBoxesOf 통과, clientFrustumCull ±Inf 는 cull: 오류·NaN 통과' 로 정정, leafIndex 는 Int32Array·정수 명시.
- F-157 ⑤(sonnet): combine_guard_wrap 의 읽기 횟수 47 고정을 없앰. 카메라 첫 읽기를 검사 완료 시점으로 삼아 그 뒤 combine 이 직접 읽는 leafCount 접근자가 다른 값을 내게 함(호출 스택으로 호출자 구분 — combine 경로명에 기댐, 한계). ones 는 인자 길이 사용. combine :162·:164 재독 변이 실패, select :113 캐시 리팩터 통과. selectLevels 의 자체 재검증 읽기는 select 모듈 몫으로 주석.
- F-158 ①(opus): 대각 속도 v=(3,0,4) 해석 사례(속력 5, 손 계산 부풀림 1.25 m 상한). |v|→|vx|·L1 변이 모두 실패. 참고: `node --test server/cull/predict/` 디렉터리 인자는 Node 22 에서 실패하므로 글롭 사용.
- F-158 ③(haiku): leaf_check 주석 정정(scratch 는 0 으로 채운 수 배열, priority 사용처 추가). ⑥: (정정, F-159 ④) priority makeBuf 를 try/catch 로 감싸지 않았다. 코드에는 주석 한 줄뿐이고 할당 실패(RangeError)는 그대로 던져진다(priority_hierarchy_check.test.mjs 가 그대로를 요구). 계약에 '할당 실패는 범위 밖, cull: 아님' 으로 적었다. ⑤(haiku): priority·predict leafIndex 형 시험에 양성 대조와 '정수 Float32Array' 사례 추가, Int32Array 요구 제거 변이에서 각 파일 실패.
- 서브에이전트 7개: opus 1·sonnet 3·haiku 3 (+ 격리 경로 오류로 재개 1건, 같은 sonnet). 승격 없음.

## 검증
npm test 2401 중 2389 통과·0 실패·12 건너뜀(직접). 실제 skylens 체크아웃은 [local].
