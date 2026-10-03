# 컬링 검토 잔여 2 (T08.F24·일부 T08.F25) 실험 노트

제품 브랜치 feat/cull-review-fixes2 (PR #24 병합 위에서). 서브에이전트 opus 1·sonnet 5·haiku 4(승격 없음), 격리 작업 트리 10개.

## 처리
- F-135: 법선 원뿔 캐시가 { cones, normals, leafStart, L } 을 함께 저장, 하나라도 다르면 재계산(tightBoxes 와 같은 방식). cone_cache.test.mjs 에 normals 교체·리프 수 교체 사례. 비교 하나씩 지운 변이 3종 모두 실패 확인.
- F-136: predictCamera 입구에서 assertCameraShape. camera_shape_unified 목록에 추가(6개 입력 + t Float32Array 모두 'cull:' 던짐). 입구 검사를 되돌리면 7개 실패.
- F-137 ①: 음성 시험을 비퇴화 카메라로(눈 y=200, isDegenerateView false 전제). '움직이면 전부 1' 변이에서 시험 6개 실패. ②: 구현 식과 독립인 기하 상한(|v|·hh)으로 교체, 항상 참이던 합 단언 삭제. 부풀림 ×1.3·×1.5·+0.2 m 변이 모두 실패.
- F-137 ③: backface coverFilter ×1.01(pointSizeM ×1.01 주입) 자기 점검을 시험에 추가, 시드 1..12 모두 실패. 노트 문구: 시험에 고정된 것은 occlusion·backface 둘 다 12/12.
- F-137 ④: bench/cull/run.mjs 표에 제거 장면 행(20만 점·리프 1484): backface 제거 1000, occlusion 제거 7408 리프, 후보 0 이면 실패 종료. cold 주석을 실제 순서(원뿔·마스크 생성 → 단계별 cold/warm → 지연 import → 결합 cold/warm)로 정정.
- F-137 ⑤: 깊이 0.1 m(r=225 px at fx 900)를 추가해 원판 여유 ×0.99·×0.97 변이 모두 실패. 판별 조건 (1−k)·r > δ(0.75 px) → r > 75 px 이 필요해 깊이를 줄임(오프셋을 바싹 붙이는 것만으로는 불가).
- F-138 ① 계약 degenerate 목록, ② priority 주석, ③ andMasks 3개·형식 단언(slice(0,2) 변이 실패), ④ positions 만 교체 사례(비교 제거 변이 시 occlusion 34·backface 3 차이), ⑤ priority 시험에 mask 0 리프 전제.
- F-134 ⑤: degenerate_holes·frustum 시험 이름·주석 정정.

## 처리하지 않음·판단
- F-138 ⑦(tau=0 에서 m 비유한): 보수 처리(남김)로 바꾸면 기존 시험 2건(predict.test.mjs 극단 유한 입력, predict_degenerate.test.mjs)이 pin 한 'tau=0 은 순수 절두체' 계약과 충돌. 계약을 유지하고 구현 주석에 알려진 한계로 명시. 감독 판단 요청.
- F-137 ③ 시험 시간: combine_removal_005 단독 8~12 s(환경 부하, 원래 7 s 초과). 이번 PR 은 21 ms 만 추가. F-134⑧ 은 별개.
- F-138 ⑥ 은 처리됨(빈 피라미드 단언: degenerate 시 Infinity 채운 피라미드·폭 0 단언). F-131 ⑥·⑧, F-134 ⑥ 은 experiments/cull_review_fixes3.md 에서 처리.

## 검증
npm test: 1938 중 1926 통과·0 실패·12 건너뜀. 실제 skylens 체크아웃은 [local].
