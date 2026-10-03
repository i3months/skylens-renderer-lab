# T08 잔여 피드백(F-118~F-127) 처리 노트

- 날짜: 2026-10-03
- 제품: feat/culling-fixes (main df3a5c5 위), 연구: experiment/culling-fixes
- 서브에이전트 10개: opus 3(F-126·F-121 선택부, 가림, 뒷면), sonnet 6(결합 통합, 결합 품질, predict, 퇴화 통일, distance, bench), haiku 1(계약·주석). 승격 없음.

## 처리 요약
| 항목 | 처리 |
|---|---|
| F-123 | combine 의 backface 래퍼가 pointSizeM 전달. 기본 구현(spy 아님)으로 단독 backfaceCull 과 제거·화면 동일 시험. 인자 제거 변이 → 실패. pointSizeM 없으면 제거 0 |
| F-118 | 통합 시험이 단계 마스크 AND 를 단언, low_close_box 에서 후면 2·가림 3 제거 > 0, skip 분기 삭제, NOT_DRAWN 리프를 조각에서 제외. 3장면×8시점 실제 단계 SSIM ≥ 0.95(flat 1.0000, terrain 0.9828, holes 0.9877), 단계 무시 변이 → 실패 |
| F-124 | predict 재생 시험이 pointSizeM(0·0.5)을 넘김, 가장자리 리프 시험 추가. `m = 0` 변이 → 재생 시험 실패 |
| F-125 | 기본 마스크 제거 하한 1(flat low_close_box, terrain street_level·low_close_box). '항상 안 덮임' 변이 → 장면 시험 5개 실패. 0.05 m SSIM ≥ 0.95(flat 1.0000, terrain 0.9828). buildings street_level 은 법선이 모두 위라 기본 제거가 0 이어서 하한 대상에서 뺌(감독 전제와 다름) |
| F-126 | selectLevels·budget·progressive 에 선택 인자 pointSizeM. F-116 반례(깊이 1 m·u=−1·0.05 m)가 NOT_DRAWN 이 아님. 값 없으면 기존 시험 값 불변. combine 이 전달 |
| F-119 | ④ 경계 f≈0 시험(F_MARGIN·BOX_PAD 변이 각각 실패), ⑤ andMasks 음성 시험, 가림 시험(①②③)은 G 보고 참조 |
| F-120 | 퇴화 판정 일원화(degenerate 가 유일), 해상도 상한 1e6/변, priority 거친 깊이 4M 칸 상한, 클라이언트 복제. 퇴화 카메라 10종에 모든 공개 함수가 같은 판정 |
| F-121 | 검증 WeakMap 캐시(N=100만 첫 검증 10 ms, 적중 0.003 ms), 덮임 피라미드 비후보 제한(flat 57–79 → 15–40 ms, 마스크 동일), 벤치가 실제 단계 측정 + 통계 변이 4건 실패 |
| F-127 | ①②③④ distance 오류 처리·R 검사, ⑤ 문자열 개수 변이 시험 삭제, ⑥⑦⑧ 주석·계약 정리, ② predict null 입력 |
| F-122 | ① predict 빈 리프, ② ⑧ 검증 후 불변 규약과 캐시 한계 고정 시험, ④ 뒷면 정의, ⑤ 낡은 주석, ⑥ 클라이언트 길이 검사, ⑨⑩⑪ 주석 |

## 벤치(제품 bench/cull/measure_scaling.mjs, 시점당 ms 중앙값, 1회)
| 점 | 리프 | frustum | backface | occlusion | priority | cullAndSelectDefault |
|---|---|---|---|---|---|---|
| 100k | 1024 | 0.17 | 1.07 | 6.52 | 5.98 | 20.04 |
| 100k | 16384 | 1.45 | 1.25 | 13.76 | 11.10 | 66.88 |
| 1M | 1024 | 0.12 | 4.83 | 43.68 | 35.16 | 141.56 |
| 1M | 105418 | 9.43 | 10.53 | 99.64 | 83.71 | 477.66 |
비용은 리프 수보다 점 수에 지배된다(가림·우선순위). 미해결: occlusion·priority 가 점 전부를 다시 투영하는 선형 비용(별도 작업).

## 남은 것·한계
- 서브에이전트가 FEEDBACK.md 를 읽지 못해(작업 트리 연구 저장소 main 의 낡은 사본) 지시문 본문만으로 작업했다. 항목 문구와 대조는 감독이 한다.
- 결합 시험의 점 수 비증가 비교는 같은 pointSizeM 의 LOD-only 와 한다(F-126 으로 LOD 선택이 가장자리 리프를 더 남기므로).
- 가림 제거는 24 쌍 중 1쌍(flat low_close_box)에서만 발생한다(기존 한계).
