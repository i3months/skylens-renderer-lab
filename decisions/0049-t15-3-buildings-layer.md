# 0049 T15.3 건물 층: 세 옵션 자료를 한 번에 받고 전환은 로컬 상태만 바꾼다

- 상태: 제안
- 날짜: 2026-10-05
- 결정한 사람: 작업자(제안)
- 관련: TASKS T15.3, SPEC(관제탑 표시 옵션 3종), contracts/tower_assets DISPLAY_MODES, 실험 노트 experiments/t15-3.md

## 맥락

관제탑 건물 표시 옵션은 points / black(기본) / aerial 세 가지이고 T15.3 완료 기준은 '전환 시 네트워크 요청 0' 이다. 옵션마다 자료가 다르다(표본점, 면+모서리 선, 항공영상 uv).

## 선택지

| 선택지 | 장점 | 단점 |
|---|---|---|
| (a) accept 한 번에 세 옵션 자료를 모두 받고 setMode 는 로컬 상태만 바꾼다 | 전환에 요청이 없다(완료 기준 직접 충족). 전환 비용 ≈ 0 | 쓰지 않는 옵션 자료도 메모리에 둔다 |
| (b) 옵션마다 필요할 때 요청 | 메모리 절약 | 전환 때 요청이 생겨 완료 기준 위반 |

## 결정

(a). 번들(BuildingBundle) 하나에 groups[{ids, mesh, edgeLines, uv, wallMask, points}] 와 image(null 가능)를 담는다. aerial 에서 wallMask=1 인 정점이 있는 삼각형과 image 가 null 인 경우는 검정으로 그린다(없는 영상을 메우지 않는다, 결정 0044 §6). 모서리 선은 black 에서만 그린다. 선 깊이 시험은 앞으로 0.05 m 당긴다(면과 같은 깊이에서 선이 깜빡이지 않게). 수준은 교체이고 추월당한 수준은 건너뛴다(같은 수준 재도착도 skip).

## 근거

제품 client/tower/buildings/no_network.test.mjs(전역 fetch·WebSocket·XHR·http·net·dns 감시, 200 회 전환 요청 0, accept 1 회, 변이 가짜 층 2종은 실패)와 perf.test.mjs(3000동 1280×720 중앙값 ≤ 70 ms, setMode 0.000 ms). 선 깊이 편향 0.05 m 는 이 작업의 선택이며 실제 관제탑 영상과의 시각 비교는 [local] 이다. renderer_basis 이탈 없음.

## 대가·다시 볼 조건

세 옵션 자료를 모두 보내므로 초기 바이트가 늘어난다. T15.10 번들·대역폭 측정에서 초기 15 MB 를 넘으면 다시 연다.
