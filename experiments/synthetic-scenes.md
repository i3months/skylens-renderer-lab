# 실험 노트: T05 synthetic-scenes

## 가설
알려진 카메라·점·정답을 가진 결정적 합성 장면 8종과 고정 시점 8곳이 있으면 이후 T06~T12 의 화질·성능·LOD 시험을 정답 대비로 할 수 있다. 같은 시드는 같은 바이트를 낸다.

## 방법
- 계약(제품 `contracts/scenes/index.mjs`): 시드 PRNG(mulberry32), 27 B/56 B 레코드 포장(`packRecords`), 바이트 해시(`resultHash`), 결과 검사(`assertSceneResult`). 장면은 항상 27 B 로 만들고 56 B 는 `point27ToGauss56`(f_dc=(rgb/255−0.5)/C0, 불투명도 0.9, σ 0.05 m, 단위 사원수)로 옮긴다(결정 0012).
- 고정 시점 8곳: `fixtures/viewpoints/synthetic.json`(ENU m, GL 규약, flat_boxes 용). 실자산용 `viewpoints.json` 은 그대로 둔다.
- 하위 작업 13개 병렬(sonnet 8·haiku 3·opus 1, 합계에 계약 작업자 직접 1). 승격 없음.

## 결과(통합 후 `npm test` 직접 실행)
| 장면/도구 | 완료 기준 | 결과 |
|---|---|---|
| flat_boxes | 같은 시드 해시 동일, 12동 겹침 0, 법선 1±1e-6, 8시점 모두 상자가 시야에 ≥100점 | 통과 |
| terrain | y 가 해석 높이와 1e-4 m, 법선 각도 오차 ≤1e-3 rad, 경사 ≤15° | 통과 |
| holes | 빈자리 안 점 0(전수), holeFraction 해석값과 1e-12 | 통과 |
| levels | 구간당 수준별 점 수 [1/8,1/4,1/2,1]·count 엄격 증가, 낮은 수준 ⊂ 높은 수준 | 통과 |
| large | 250만 점 정확, 생성 시간 기록(작업자 보고 143 ms, RSS 116 MB; 통합 후 재측정은 아래) | 통과 |
| depth_noise | 거리 5구간 σ 비 1±0.10(실측 0.994~1.015) | 통과 |
| buildings | 1000동 겹침 0(499500쌍 전수) | 통과 |
| dem | 높이 왕복 ≤0.1 m(실제 ≤ 100/65535/2 m) | 통과 |
| paths | 프레임 수·간격 1e-9, 속도·각속도 상한 | 통과 |
| scene_preview | 8시점 PNG, 해석 픽셀 ±1 px | 통과 |

전체 `npm test` 는 위 표 반영 후 726건 중 713 통과·0 실패·13 건너뜀(F-080 반영 전 수치).

## renderer_basis 에서 벗어난 점
- depth_noise: 지시의 f 기본 1280 px 대신 renderer_basis §1-2 의 960×540 K(fx 754.32)를 기본으로 썼다(문서와 일치가 조건). 출력은 씬 ENU 규약이고 OpenCV→씬 변환은 truth.frame 에 있다.
- GPS↔ENU 극 앵커: 결정 0018.

## 한계·남은 문제
- 합성 장면은 정답이 해석적이어서 실제 복원 잡음·무늬 분포와 다르다(실자산 대조는 T01L).
- 장면의 점은 28 bit 부동소수 반올림 영향을 받으므로 해시는 같은 Node 메이저에서만 비교한다.
- F-080 은 아래 별도 절.
