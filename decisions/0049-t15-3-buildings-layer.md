# 0049 T15.3 건물 층: 세 옵션 자료를 한 번에 받고 전환은 로컬 상태만 바꾼다

- 상태: 승인
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

### 데이터 받기와 전환 (선택지 a)

(a). 번들(BuildingBundle) 하나에 groups[{ids, mesh, edgeLines, uv, wallMask, points}] 와 image(null 가능)를 담는다. aerial 에서 wallMask=1 인 정점이 있는 삼각형과 image 가 null 인 경우는 검정으로 그린다(없는 영상을 메우지 않는다, 결정 0044 §6). 모서리 선은 black 에서만 그린다. 선 깊이 편향 0.05 m: 같은 rasterizeLines 호출 안의 선끼리는 편향이 없고(선 깊이 < out.depth), 면과의 비교만 편향을 적용하여(선 깊이 − 편향 < out.depth) 면과 겹치는 깊이에서 선이 깜빡이지 않게 한다. 수준은 교체이고 추월당한 수준은 건너뛴다(같은 수준 재도착도 skip).

### UV 규약 (서버 aerial_uv 에 맞춤)

계약과 래스터를 서버 `aerial_uv` 규약에 맞춘다: v = 0 이 북쪽, 영상 행 0 = 북, 래스터 행 = v · height − 0.5. 초안은 '(0,0) 남서, v 북쪽 증가' 였다. 대안(서버 변경)은 기각했다: 서버 buildAerialUv 가 모든 건물 번들의 UV 를 생성하므로, 서버가 규약을 바꾸면 저장된 모든 건물 데이터의 UV 를 재생성해야 한다(server/buildings/aerial_uv/index.mjs:85-86 변경 시 전역 영향).

## 근거

제품 client/tower/buildings/no_network.test.mjs(전역 fetch·WebSocket·XHR·http·net·dns 감시, 200 회 전환 요청 0, accept 1 회, 변이 가짜 층 2종은 실패)와 perf.test.mjs(실제 측정 3000동 1280×720 black 최대 64 ms·전체(aerial) 최대 70 ms(6묶음, t15-3e.md 표), setMode 평균 ≤ 1 ms).

**UV 규약 확인**: 층 대 참조 비교에서 uv 를 뒤집는 변이는 실패한다. 세부 검사는 client/tower/buildings/ref_trace.test.mjs:342-349(m.bad > m.checked·0.5)·fixtures.test.mjs:67-77(v = 1−북쪽 비율 검증)에 기록됐고, 서버 규약 준수를 확인했다.

선 깊이 편향 0.05 m 는 이 작업의 선택이며 실제 관제탑 영상과의 시각 비교는 [local] 이다. any-vertex 벽 규칙(wallMask=1 인 정점이 있는 삼각형 = 검정)은 contracts/tower_assets DISPLAY_MODES 와 결정 0044 §6 에 따른다. points 는 mesh 표본(표본점 xyz 3개 float32 = 12 B)이므로 renderer_basis.md 7-4 의 27 B 형식(밀집 점군 x y z + 법선 + 색)과 무관하며, renderer_basis 의 적용 범위 밖이다.

## 대가·다시 볼 조건

각 선택의 제약과 재검토 기준:

- **UV 규약 (서버 aerial_uv v=0 북)**: client/tower/buildings/layer_ref.test.mjs(광선 추적 참조 대 층 비교, 54 조합 화소 일치율 ≥ 0.99, 픽셀 색상 차이 허용 RGB 채널당 3/255)로 확인했고, 서버 변경은 비용이 크다. 항공영상 정렬이 실패하면(layer_ref 일치율 < 0.99) 재검토한다.
- **선 깊이 편향 0.05 m**: 같은 rasterizeLines 호출 안의 선끼리는 편향이 없고, 면과의 비교만 편향을 적용한다. 실제 관제탑 영상에서 선이 깜빡이거나 겹침이 있으면 재검토한다. 시각 비교는 [local]이다(미확인).
- **Any-vertex 벽 규칙**: 계약 정의이며, wallMask 처리가 시각적 결함을 일으키면(검정 누락/오염) 재검토한다.
- **초기 바이트 (15 MB)**: 세 옵션 자료를 모두 보내므로 초기 바이트가 증가한다. T15.10 번들·대역폭 측정에서 초기 묶음이 15 MB 를 초과하면 옵션 지연 로딩 또는 서버 캐시 전략 재검토한다.

## 승인 (2026-10-05 감독, 제품 PR #74 검토 #2)
- 승인. uv 규약을 서버 aerial_uv(v=0 북)에 맞춘 선택, 기각 대안(서버 변경), uv 뒤집기 변이 시험이 기록됐고(F-408 ⑥), 제품 f99bcd3 의 layer_ref·raster_tex 원근 시험이 변이를 잡는 것을 감독이 확인했다.
- 남은 문서 정정(F-410 ⑦): :31 성능 문턱을 perf.test.mjs 의 1500 ms(회귀 감시용)와 측정 범위로, :23·:42 선 깊이 규칙을 F-408 ④ 이후 코드와 같게, :42 '확인했다'를 '미확인([local])'으로, :35 points 가 메시 표본이라 renderer_basis 7-4 의 27 B 형식이 적용되지 않는 이유 한 줄.
