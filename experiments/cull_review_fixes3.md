# T08.F26·F27(+F21·F23·F25 낮음 일부) — PR #25 검토 잔여

제품 브랜치 feat/cull-review-fixes3, 서브에이전트 11개(opus 1·sonnet 4·haiku 6, 승격 없음).
검증: npm test 1944 중 1932 통과·0 실패·12 건너뜀·0 todo(직접 실행). 실제 skylens 체크아웃 입력은 [local].
시험 파일 안에 있는 변이 단언과 수동 변이를 구분해 적는다.

## F-139 (opus)
- 새 시험 server/cull/predict/predict_rotation.test.mjs: 장면을 시험 안에서 구성(원점 카메라 R=I, fx 4000, 반경 20 m 원 위 소형 상자 600개, y 축 회전).
- 시험 1: ω=1, horizon 2, steps 2. 전제 단언 '표본 시각에서 보이는 리프 51, 표본 사이에서만 보이는 리프 166', 가운데 리프(φ=0.5)가 마스크에 있어야 함. 가시성은 구현 식과 독립으로 boxMayBeVisibleSplat 로 계산.
- 시험 2: 과잉 상한을 현(chord) 상한 1.01·2·far·sin(ωh/2)+1e-6 으로(θ≤0.24 에서 호/현 비 ≤1.0024, 여유 1%를 실행 전에 고정). 마스크 크기 81·147·165 고정.
- 수동 변이 결과(시험 코드에는 변이 자체가 없음): far×0.5 → 새 시험 둘 다 실패(기존 predict.test.mjs 는 통과 — F-139 재확인), 회전 항 ×1.5 → 과잉 시험 실패.
- F-138 ⑦: predictiveMask docstring·CULL_API.predict 에 '모든 예측 표본의 부풀림이 비유한이면 표본 사이는 덮지 않음(비단조 가능)' 한 줄.

## F-140 (sonnet)
- stale_box_cache.test.mjs: 오라클을 같은 필드의 새 객체로, 이동 dz=30(탐침 dz=3·10·30·60·100 중 30), 전제 '이동 전 결과 ≠ 새 객체 결과'(13칸 차이, 제거 4).
- 수동 변이: backface/index.mjs:156 positions 비교 삭제 → 4건 중 1건 실패('positions만 교체'), 원본 통과.

## F-141
- ① bench real_stages: 결합 경로 측정 전에 cachedNormalCones 로 데움, 주석 정정.
- ② priority_mask_skip: 앞층 mask 0·뒤층 mask 1, 'mask 0 이면서 score>0' 전제. 수동 변이(마스크 0 리프 투영 생략) → 실패.
- ③ camera_shape_unified: length === n, predictCamera 퇴화에 isDegenerateView === true.
- ④ contracts/cull/cull.test.mjs: 마스크마다 다른 위치 0, CULL_API fn 이름 동적 import 확인. 수동 변이(첫 마스크 생략) → 실패.
- ⑤ predict.test.mjs 사례 2·3 을 탐색값으로 교체(옛 값은 변이를 못 잡았음을 주석에 기록), 사례 2~5 에 가산 변이(+0.02, +0.2) 전제를 시험 안에서 단언. 수동 변이 +0.2·+0.02 → 실패. 사례 4·5 만 따로 변이에 돌리지는 않음.
- ⑥ degenerate_holes 항상 참 단언 삭제, stale_box_cache 주석 세미콜론 정리.
- ⑦ cachedNormalCones(null/undefined) 가 'cull:' 오류. bench/cull/run.mjs 가 occlusion > 0 단언(bench: backface 1000·occlusion 7408).
- ⑧ 위 cull_review_fixes2 노트 정정.

## F-131
- ⑥ 구멍 난 t·R: 서버 degenerate/index.mjs·클라이언트 client/cull/index.mjs 인덱스 루프. 구멍 시험 2건. 수동 변이(every 복귀) → 실패.
- ⑧ 구조 논증으로 더 높은 하한을 도출하지 못해 하한 유지(시점 4·5 각 ≥ 1), 주석에 판별은 occlusion_unit 이 맡는다고 명시. 측정값(29·66)에 맞춘 하한 금지 원칙.

## F-134 ⑥
- 벽시계 단언 제거(priority_resolution·client degenerate_unified·degenerate.test). TypedArray 할당량(최대 버퍼·합계) 및 R·t 원소 읽기 횟수 단언으로 대체. 수동 변이 4건(coarseScale 상한 제거 6건·leafPriority 중복 할당 11건·orderChunks 이중 호출 8건·checkCamera 조기 읽기 1건 실패). 한계: 할당 원소 수는 연산량의 대리 지표.
- server/cull/degenerate/degenerate_unified.test.mjs 는 존재하지 않아 제외.

## 처리하지 않음
- F-138 ⑧(F-133 ④ 노트 문구)은 이번 라운드 미처리.
