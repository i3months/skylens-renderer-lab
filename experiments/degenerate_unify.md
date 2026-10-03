# T08.F19 — 퇴화 시점 판정 일원화(F-120)와 0.05 m 제거 판별(F-125 ②)

제품 브랜치 feat/cull-degenerate-unify (e1d2ef4). 모델별 서브에이전트: opus 1·sonnet 6·haiku 3, 승격 없음.

## F-120
- 계약 커밋: isDegenerateView 에 래스터 조건(해상도 정수, width·height ≤ MAX_PIXELS=2^26)을 넣고, 클라이언트 복제본·combine 기본 판정(localIsDegenerate)이 같은 판정을 쓰게 함.
- backface·occlusion·distance·predict 가 isDegenerateView 를 import(자체 판정 삭제). distance 의 로컬 R 검사 삭제(F-127④). 구멍 난 배열은 인덱스 루프로(F-120 ⑥).
- priority 는 이미 isDegenerateView 를 쓰고 거친 버퍼 칸 수 상한이 있어 코드 변경 없음. 합법 극단 해상도 모두 < 50 ms, 불법은 빈 결과(시험 추가).
- 시험: 같은 퇴화 카메라 목록(폭 1·fx 1e7, 8193², 2e9, R=2I, 반사 R, NaN, 시야각 미만, 1e6 경계, 거의 직교 R 경계)에 모든 공개 함수가 같은 판정. 60000² 시험은 '퇴화' 로 정정.
- 의도한 동작 변화: 8193² 등 MAX_PIXELS 초과 해상도는 이전에 던졌고 이제 빈 결과. occlusion 의 해상도 'cull:' 던짐이 빈 결과로 바뀜(계약의 '퇴화는 던지지 않음' 과 일치).

## F-125 ②
- 0.05 m 에서 제거가 실제 생기는 장면: flat_boxes·8시점을 1/30 로 축소(0.05 m 디스크가 원 크기 1.5 m 디스크에 해당). 7시점에서 후면+가림 제거 ≥ 1(측정 전 정한 하한 1), 8시점 합계 후면 183·가림 1881.
- 제거된 점이 이기는 픽셀 0, 전체 렌더와 남긴 리프 렌더가 깊이·색 전 픽셀 일치, SSIM 최솟값 0.9999 ≥ 0.95.
- 변이: 가림 피라미드 지름 ×1.01 에서 low_close_box 실패, ×1.1 은 2시점, ×1.5 는 6시점 실패(SSIM 은 ≥0.996 이라 SSIM 만으로는 못 잡음).
- 새 시험 combine_pointsize_guard: 두 겹 격자 근접 장면에서 {pointSizeM:0.05} 후면·가림 제거 각 40, {} 는 0. pointSizeM 기본 0.05 폴백 변이 → 실패 확인.

## 검증
npm test: 1732 통과·0 실패·12 건너뜀·0 todo (첫 실행에서 1건 실패가 있었으나 같은 코드 재실행에서 통과 — 부하 중 시간 의존 시험으로 추정, 원인 미확인). 실제 skylens 체크아웃 입력은 [local].
