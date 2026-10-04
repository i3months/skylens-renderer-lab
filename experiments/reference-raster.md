# T06 reference-raster — CPU 참조 래스터라이저와 화질 지표

- 제품 브랜치 `feat/reference-raster`, 결정 [0019](../decisions/0019-raster-reference-conventions.md)
- 이번 실행 범위: T06.F(F-089·F-090·F-091 처리) + T06.0~T06.11 전부. 이번 실행의 서브에이전트: 1차(격리 worktree 가 연구 저장소를 가리켜 전부 실패, 변경 없음) 14개를 버리고 제품 worktree 를 수동 생성해 재투입. 최종 사용 모델 개수: opus 4(T06.1·T06.2/3·T06.4 + 중복 1회 낭비)·sonnet 10·haiku 5, 승격 없음(같은 하위 작업 두 번 실패 없음; 1차 실패는 환경 문제).
- 교훈: 서브에이전트 격리(worktree)는 세션의 기본 저장소 기준이라, 작업자의 기본 저장소가 연구 저장소이면 제품 코드가 없다. 제품 쪽 worktree 를 `git worktree add <작업 트리 디렉터리>/<x>` 로 직접 만들고 절대 경로를 준다.

## 구현 요약(제품)
| 하위 | 내용 | 확인 |
|---|---|---|
| T06.0 | contracts/raster: Camera·RenderResult·assertCamera·assertRenderResult·API 표 | 4 시험 |
| T06.1 | project·projectMany | 손계산 리터럴(z축 90° 회전 t≠0), 변이 7종 실패 |
| T06.2 | unproject | 왕복 최대 1.4e-13 m(4 카메라×1000점), 전치 변이 246.9 m |
| T06.3 | scaleIntrinsics | 2048→960: fx 754.321875, fy 753.8484375, cx 480, cy 270 |
| T06.4 | splatRadiusPx·splatPixels | d=10, fx=754.32, 0.1 m → 3.7716, r=20 면적 1264 vs π·400=1256.6(+0.59%) |
| T06.5 | renderPoints(z-버퍼) | 겹침 100%, 같은 깊이는 번호 작은 점 |
| T06.6 | lambert·shadeResult | 45° → (159,79,40), 오차 ≤ 0.5 |
| T06.7 | countEmpty·reachablePixelSet·assertNoFill | holes 장면 빈 픽셀 75097 고정 |
| T06.8 | ssim(11×11 가우시안 σ1.5) | 상수 영상 해석해 30006.5025/32506.5025, 단순 구현 대조 1e-9, 960×540×3 약 1 s |
| T06.9 | psnr·emptyRatio | 48.1308 dB 등 리터럴 |
| T06.10 | viewpointToCamera·renderViews·CLI | 8장, 재실행 PNG 해시 동일 |
| T06.11 | bench/raster_ref | 250만 점 1280×720 중앙값 약 1.40 s(기록, 기준 아님, 빈 픽셀 55.9%) |

## 알려진 사실·편차
- renderer_basis §2-3 예제: 문서 X_c(소수 둘째 자리 반올림)로는 u=396.2052(문서 396.27 과 0.065 px 차). 반올림 전 X_c.x=−5.02611 로는 0.01 px 이내. 시험은 반올림 전 값으로 0.01 px, 반올림된 값으로는 0.083 px 한계를 단언한다. 문서 수정은 감독 판단 사항(결정 0019).
- 이전에 시험이 없던 T06.8 SSIM 은 외부 공개 참조값 없이 독립 단순 구현과 해석해로 대조했다. 공개 표준 영상 쌍과의 1e-3 대조는 외부 자료가 없어 못 했다(미달, 후속 필요).
- 서브에이전트 보고: 전체 실행 중 1회 실패가 한 번 관찰됐으나 재현되지 않았다(어느 시험인지 불명). 최종 통합 실행은 900건 중 888 통과·0 실패·12 건너뜀.

## 실제 skylens 데이터 확인
실제 `step00250_light.ply`(56 B 가우시안, 398,601점, 위치 범위 x 20~80, y 20~60, z −60~0 m)를 renderPoints 로 960×540 두 시점에서 렌더: oblique 278 ms·빈 픽셀 0.9906, topdown 344 ms·0.9907, assertNoFill 통과(메운 픽셀 0). 빈 픽셀이 큰 것은 점당 5 cm 크기가 희소한 점군에 비해 작기 때문이다(화질 목표 문턱 아님).

## 재현
`npm test`(제품). 개별: `node --test server/raster_ref/*/*.test.mjs server/metrics/*/*.test.mjs tools/render_views/*.test.mjs`(Node 22 는 디렉터리 인자를 못 받는다).
