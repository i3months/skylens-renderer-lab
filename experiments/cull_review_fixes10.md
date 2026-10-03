# T08.F39+T08.F37 — PR #32 검토 반영·PR #30 잔여 (제품 feat/cull-review-fixes10)

## 한 일
- F-159 ①②(sonnet): nonfinite_box_scope.test.mjs — occlusion 행을 levels[0].positions 점 좌표(NaN·±Inf × x·y·z)로 바꿔 정상 마스크 1 인 리프 전부가 1 로 남는지 단언. 상자 행은 정상 마스크 1 인 리프 전부 × boxMin/boxMax × x·y·z. 변이: predict/index.mjs:135 삭제 → x·y·z 모두 어떤 배열에서든 실패(단 boxMin.z 행은 뒤의 가시 판정이 남겨 실패하지 않음), occlusion 점 좌표 거짓 제거 변이 9건 실패, 판정 포기(:392) 변이는 카메라 뒤 사례 2건이 잡음(비유한 점은 이미 bad 로 걸러져 도달 불가).
- F-159 ③·F-160 ⑤(sonnet): combine_guard_wrap — 검사 블록 안 첫 leafCount 읽기를 기준으로 그 뒤 combine 직접 읽기는 모두 실패, 호출자는 스택 전체를 import.meta.url 경로로 판정. 변이 4종(:149-150 재독, Reflect.get, 헬퍼, emptyStats 재독) 실패.
- F-159 ④·F-160 ②③④(haiku): 계약에 '할당 실패(RangeError)는 범위 밖' 문구, NaN 꼭짓점 주석 정정, 계약 distance·priority NaN 서술, leaf_check 머리말 예외. 연구 노트 cull_review_fixes9.md 의 makeBuf try/catch 서술을 사실대로 정정(그 PR 은 감싸지 않았음).
- F-160 ①(haiku): nan_y_leaf.test.mjs 가 파일 머리에서 저장한 정상 마스크와 비교. 복원 삭제 변이 실패.
- F-154(sonnet): leaf_check 를 계층당 한 번만 검사(WeakMap, leafIndex 키, boxMin·boxMax 동일성·개수·간격 표본). 한계 명시: 큰 계층의 제자리 수정은 표본에 걸릴 때만 잡힘(32 노드 이하는 전수). ±Inf 는 Math.abs(x)===Infinity 한 번. bench/cull/leaf_check_bench.mjs 추가. 400k점 최소 시간(ms, 시점 3개 합) base d0a1c4d→new: frustum 1.397→1.391, distance 0.760→0.733, predict 3.342→3.307, occlusion 3.134→3.134, orderChunks 48.9→48.1, client 2.748→2.504 (+5% 이내).
- F-156 ①②④(haiku): predict_analytic 상수 산술 단언 → 전제 주석, tight>=8 근거 주석, predict_hierarchy 중복·leafStart 길이 사례. ③(sonnet): 상한을 기하식 |v|·hh+2·far·sin(ω·hh/2)+교차항 여유로(IMPL 상수 복사 제거). 변이 +0.02 m·×1.2·회전항 ×1.5 실패, +0.003 m 는 시험 허용 오차(1 mm)보다 작아 못 잡음(미해결 한계). ⑤ leaf_check 머리말은 이미 priority 를 포함 — 호출처 목록 시험(leaf_check_callers.test.mjs) 추가. ⑥(haiku): 행 이름 정정·leafBoxesOf 범위 단독 시험(변이 실패). ⑦(sonnet): 구현이 이미 일관(NaN 리프는 어느 단독 단계도 제거하지 않음, ±Inf 는 오류, backface 등은 cull: 오류) → 계약에 단계별 정책표, 표 주도 시험 72건. ⑧ combine 주석을 계약과 일치.

## 한계
- F-159 ②: boxMin.z 행은 predict:135 삭제 변이에서 실패하지 않는다(후속 가시 판정이 남김). x·y·z 각각은 boxMin/boxMax 중 최소 하나가 실패.
- 서브에이전트 일부가 격리 작업 트리 대신 주 체크아웃에서 일함(시험 변이가 겹칠 위험) — 통합 뒤 전체 시험으로 확인.

## 서브에이전트
10개: opus 0·sonnet 5·haiku 5. 승격 없음.

## 검증
npm test 2531 중 2519 통과·0 실패·12 건너뜀(직접, 병합 뒤). 실제 skylens 체크아웃은 [local].
