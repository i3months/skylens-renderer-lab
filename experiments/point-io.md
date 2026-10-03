# 실험 노트: T04 point-io (점 입력·좌표)

- 제품: `feat/point-io`, 연구: `experiment/point-io`(base research)
- 결정 기록: [0016 GPS↔ENU 정확식](../decisions/0016-gps-enu-exact.md) (상태: 제안)
- 이번 실행: T03 반려 수정 후속(T04.F)과 T04.1~T04.10. 서브에이전트 13개 — 반려 수정 뒤 첫 작업이라 T04.F 4개(haiku 2·sonnet 2), T04 하위 10개(sonnet 8·opus 1·haiku 1). 승격 0건. T04.0 계약은 작업자가 직접 커밋(`contracts/points/`, `contracts/geo/`).

## T04.F (F-068·F-069·F-070)
| 항목 | 처리 | 확인 |
|---|---|---|
| F-068 | 명세 문구 6곳 정정(§10.2 항목 4 분리 포함) | `grep '단서\\.\\|명세에 한 줄'` 0건 |
| F-069 | unpack·클라이언트 bbox 6값 유한 검사·복원 위치 비유한 거부, packFn 결과 형 검사, crc32·computeChecksum 입력 형 검사, `checkDeterminism` times < 2 거부(기존 테스트 2건을 거부 단언으로 바꿈) | 골든 무작위 변조 2만 건에서 비유한 출력 0, 새 테스트 4파일 |
| F-070 | 검증기 tileY·anchor lon/alt 사례, tile_index 고정 상수 복원, 클라이언트 instanceof, determinism identical === true, 퍼저 벽시계 보호 예산의 2.5배(150 s)·재시도 통과 건수 출력 | 변형(타일 반복 축소·anchor lat 만 검사)에서 테스트 fail, 200 ms 대기 모의 대상에서 퍼저가 벽시계 보호로 fail |

## T04 하위 결과 (병합 뒤 작업자가 직접 `npm test`: 584개 중 통과 572·실패 0·건너뜀 12)
| 하위 | 모듈 | 완료 기준 | 결과 |
|---|---|---|---|
| T04.0 | `contracts/points/`, `contracts/geo/` | 타입 크기 27 B·56 B 단언 | 통과(`points.test.mjs`) |
| T04.1 | `server/points/ply_read/` | `ply_read_golden` 형식별 점 수·첫/끝 점 | 통과(27 B 32점, 56 B 21점, 손계산 값) |
| T04.2 | `server/points/ply_write/` | 쓰기→읽기 왕복 바이트 동일 | 통과(11건, NaN 비트까지 바이트 동일) |
| T04.3 | `server/points/ply_stream/` | 250만 점 읽기 중 추가 메모리 ≤ 32 MB | 통과. 처음엔 쓰레기까지 재서 28~36 MB 로 부하 아래 간헐 실패(전체 테스트 1회 실패 36.2 MB). 청크마다 GC 를 강제해 붙들고 있는 양을 재도록 고쳐 1.2~1.5 MB |
| T04.4 | `server/points/ply_robust/` | 손상 10종 패닉 0 | 통과(변이 5천 회 PointsError 외 예외 0) |
| T04.5 | `server/geo/enu/` | skylens 식과 1만 점 차 ≤ 1 mm | **미달(대조 불가)**. 독립 검증만: 앵커 자신 1e-9 m, 손계산 값 허용 1 mm(북 5 mm), 왕복 4.6e-9 m, 독립 ECEF 회전행렬 구현과 3.8e-9 m. 결정 0016 |
| T04.6 | `server/geo/scene/` | `scene_axes` 왕복 | 통과(1만 점 왕복 최대 상대 5.92e-8 = f32 정밀도, 행렬식 +1) |
| T04.7 | `client/geo/` | 서버와 1만 점 차 ≤ 1 mm | 통과(독립 구현 6.6e-9 m, 서버 구현 병합 뒤 대조 시험도 skip 없이 통과) |
| T04.8 | `server/points/normals/` | 단위 길이 오차 ≤ 1e-6, NaN 0 | 통과(10만 개) |
| T04.9 | `tools/points_stat/` | 골든 통계 일치 | 통과 |
| T04.10 | `server/points/segments/` | 4수준×3구간 식별 100% | 통과 |

## GPS↔ENU 구면·평면 근사와의 차이 (정확식 대비 최대 오차, T04.5 서브에이전트 측정)
| 앵커 위도 | 반경 | 구면 ECEF→ENU(R=6371 km) | 등장방형 평면 근사 |
|---|---|---|---|
| 37.57° | 0.1 km | 0.237 m | 0.237 m |
| 37.57° | 1 km | 2.37 m | 2.39 m |
| 37.57° | 10 km | 23.7 m | 30.3 m |
| 37.57° | 50 km | 118.6 m | 346.8 m |
| 60° | 50 km | 182.5 m | 538.8 m |
skylens `geo.ts` 가 근사식이면 1 km 에서 m 단위 차이가 난다. 식 종류는 대조로 판별한다.

## 발견·한계
1. T03 반려 수정 때 간헐 실패 원인이 퍼저의 벽시계 예산이었음(CPU 14 s, 부하 아래 벽시계 60 s 초과)을 확인했고 이 실행에서 CPU 예산·벽시계 150 s 보호로 정리했다. 전체 테스트가 병렬 서브에이전트 부하(load 30~50)에서 3분 이상 걸린 것이 서브에이전트 보고의 "전체 테스트 확인 못 함"의 원인이다.
2. 실제 skylens 체크아웃·자산이 없어 PLY 읽기·GPS 변환 모두 합성·골든으로만 검증했다. 실제 56 B 자산(`res/static/demo/segments/seg<N>_step<5자리>.ply`)으로 읽기→쓰기 왕복·통계를 돌려 보는 것은 [local] 또는 체크아웃이 있는 세션에서.
3. PLY 속성 이름: 27 B 의 색은 `red green blue`로 가정했다(실제 skylens 파일 헤더 미확인). 실제 이름이 `r g b`이면 `detectFormat` 이 null 을 돌려 'format' 오류가 난다 — 추측하지 않는 설계의 결과이므로 실제 헤더 확인 뒤 계약을 맞춘다.
4. `identifySegments` 는 구간 id 상한 2^30 을 계약에서 가져왔다.
5. 새 의존성 없음.

## 재현
```
npm test
node --test server/geo/enu/enu.test.mjs client/geo/geo.test.mjs
```
