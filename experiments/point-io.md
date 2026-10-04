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

## 반려 1회차 수정 (2026-10-03, 제품 feat/point-io acb3818 이후)

반려 사유 F-071(높음)과 F-072·F-073·F-074 를 같은 브랜치에서 처리했다.

### F-071·F-072 — GPS↔ENU 를 skylens `geo.ts` 식으로 교체
- 기준: NET-Challenge-S13/skylens develop `src/shared/geo.ts`(커밋 59edcf9). `e = Δλ·R·cos(φ0)`, `n = Δφ·R`, `u = alt − alt0`, R = 6378137 m. 서버 `server/geo/enu` 와 클라이언트 `client/geo` 모두 이 식. 정확식은 `gpsToEnuExact`/`enuToGpsExact` 로만 남겼고 기본 경로에서 쓰지 않는다. 결정 0016 은 감독이 기각했으므로 새 결정 기록 없음.
- 테스트: geo.ts 를 옮긴 기준 함수 대비 앵커 5곳(서울 37.5665, 126.978, 30 포함), 반경 0.1·1·10·50 km, 각 1만 점. 최대 차 0 m(같은 연산 순서), 왕복 ≤ 1.4e-9 m. 기준 ≤ 1 mm 충족. 변형 시험: R 을 6371000 으로, cos(φ0) 를 cos(점 위도)·cos(φ0·1.0001) 로, u 부호 반전 등 모두 테스트 실패.
- F-072: 배열 [e,n,u] 표현 유지, 배열이 아닌 입력은 GeoError('range'), −0 은 +0 으로 정규화(n=0 에서 두 경로 deepStrictEqual 같음), skylens 함수 이름 6개(gpsToEnu·enuToGps·enuToScene·sceneToEnu·gpsToScene·sceneToGps) 제공, 객체↔배열 어댑터 추가.
- 이전 서버·클라이언트 대조 테스트가 같은 식끼리라 못 잡던 문제는 기준 함수 대조로 해결.

### F-073
① ply_stream chunkPoints 상한 2^20·vertexCount 상한 2^30 → PointsError('range'). ⑤ 입력 형 검사, 헤더 누적 O(n)(1바이트 청크 1M 개 약 190 ms). ②③ points_stat: 비유한 좌표 거부(PointsError('range')), 길이 불일치 PointsError('size'), 변형 12종 생존 0. ④ parsePlyHeader 는 복사 없이 앞 1 MiB 만 본다(250만 점 27 B 에서 추가 arrayBuffers 0 B). 이 한도를 쓰는 bench ref_images 의 긴 헤더 경로는 `maxHeaderBytes` 인자로 유지. ⑥ enuToGps 결과 비유한이면 GeoError('range').

### F-074
①②③ 문구·주석(색 이름은 관례 가정임을 명시), 실제 56 B 헤더 리터럴 테스트. ④ 메모리 테스트: 청크마다 GC 후 보유량으로 이름 변경, 27 B·56 B 모두, 측정 증가량 27 B 0.3~1.8 MB·56 B 2.7~4.0 MB(한도 32 MB 유지). ⑤ 변형 생존 0. ⑥ 헤더 구조 검사로 교체. ⑦ 클라이언트 테스트를 기준 함수 대조로 재작성. ⑧ times=2 로 변경(검사 제거 시 실패 확인). ⑨ 벽시계 단언 → arrayBuffers 증가량·최솟값 비교, 20회 연속 통과. ⑩ segments 는 규칙 밖 이름을 `rejected` 로 분리(빠진 수준은 채우지 않음). ⑪ writer 색 직접 대입(250만 점 쓰기 212 ms → 107 ms).

### 실제 skylens 체크아웃 검증
develop 얕은 체크아웃의 `res/static/demo/segments/*.ply` 16개를 `readPly` 로 읽어 모두 성공(점 합계 749,400).

### 전체 테스트
`npm test`: 619 중 통과 607·실패 0·건너뜀 12.

### 이 실행에서 겪은 일
- 서브에이전트 격리 작업 트리가 제품 main 에서 시작되어 feat/point-io 코드가 없었다. 계약 커밋 위에서 시작한다는 전제가 지켜지지 않아 일부는 직접 만든 작업 트리(<작업 트리 디렉터리>/*)로 재지정했다. 다음 작업자는 팬아웃 전에 작업 트리가 계약 커밋 위인지 확인하고, 지시문에 "먼저 `git checkout -B feat/<이름>--<번호> feat/<이름>`" 을 넣는다.
- R3d(haiku)가 F-074⑧ 의 대상 파일을 잘못 짚어 작업자가 직접 처리했다. 모델 승격은 없었다.
- 서브에이전트 개수: opus 2·sonnet 5·haiku 5(12개).

## 반려 2회차 수정 (PR #13, F-075~F-078)

제품 feat/point-io 에서 같은 브랜치로 처리했다. 하위 작업 sonnet 2(R5·R6)·haiku 1(R7), 승격 없음. 작업 트리는 계약 커밋(feat/point-io) 위에서 시작했다.

- F-075: ply_read 헤더 할당 테스트가 GC 를 강제하지 않아 앞 반복 버퍼 수거 때 음수 delta 로 실패했다. GC 강제(`--expose-gc` + `vm.runInNewContext('gc')`), 반복 사이 참조 해제, 단측 단언(< 64 KiB)으로 바꾸고 `Buffer.from/concat/alloc` 복사 바이트를 직접 세는 보조 도구(server/points/test_util)를 추가했다. 바뀐 테스트 파일 전부를 `node --test` 로 20회(서브에이전트) + 10회(작업자) 돌려 실패 0. 전체 복사 변형(`parsePlyHeader(Buffer.from(bytes))`)은 여전히 실패한다.
- F-077: segments 음성 4건 복원, ply_stream 상한 경계(1 MiB±1, 무한 생성기, 한 청크에 1 MiB 초과 junk+end_header), contracts/ply 경계 ±1·작은 maxHeaderBytes. 변형(NAME_RE 6자리, 상한 4096·−64, 상한 검사 삭제) 모두 실패.
- F-078: ①ply_stream 이 헤더 구간만 합치고 본문은 subarray 로 넘김(스캔은 남은 한도까지), 상한 검사를 복사 전에. ②`opts ?? {}`. ③클라이언트 테스트를 6개 앵커(남·서반구·고위도·alt≠30)로. ④⑤⑥ 주석 정리. ⑦ 벽시계·GC 없는 최솟값 대신 복사 바이트 수. ⑧ PR 본문에 건너뜀 12건 사유를 적음.
- F-076: enuToGps 결과 |lat|>90, 극 앵커(|cos φ0|<1e-12)에서 e≠0 → GeoError('range'), 경도는 (−180,180] 로 감싼다(범위 안 값은 비트 그대로). gpsToEnu 결과 유한 검사, checkEnu 는 Array.isArray(배열 유사 객체 TypeError). **geo.ts 와 다른 점(이탈 기록):** 날짜변경선 왕복이 되도록 gpsToEnu·gpsToEnuClient 가 |Δλ|>180 일 때 ±360 으로 짧은 쪽을 택한다. |Δλ|≤180 값은 geo.ts 와 동일(1만 점 차 0 m 유지). 변형 시험 9종 모두 실패 확인.
- F-068: ASSET_FORMAT.md §10.1 문구에서 시점 거리와 d² 를 잇는 절 삭제, "renderer_basis §11 Q" 로 명시.
- 검증: `npm test` 633 중 통과 621·실패 0·건너뜀 12. 실제 skylens develop(얕은 체크아웃) `res/static/demo/segments/*.ply` 16/16 `readPly` 성공.
