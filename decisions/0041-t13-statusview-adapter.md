# 0041 현황판 어댑터: 모듈 주입 조립, 조각 요청 입력·pieceSeq 장부, 대응표는 추정 상태

- 상태: 승인(2026-10-04 감독, PR #56 검토 #3)
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: TASKS T13, 실험 노트 experiments/t13.md, 결정 0029(수준 상태 기계), 0040

## 맥락
현황판(skylens statusview)의 역할을 경로 B 위에 다시 얹는 어댑터를 8개 모듈로 나눠 만들었다. skylens 체크아웃은 [cloud] 에서 열 수 없어 splatScene.ts·splatReveal.ts·cameraSync.ts 의 실제 메서드를 대조하지 못했다.

## 선택지와 결정

| 쟁점 | 선택지 | 채택 | 대가 |
|---|---|---|---|
| 조립 방식 | A. 어댑터가 모듈을 정적 import / B. modules 를 인자로 주입, 기본은 loadDefaultModules() 동적 import | B | 호출자가 한 줄 더 쓴다. 모듈별 가짜로 시험할 수 있다 |
| 조각 요청 입력 | A. 수준 도착 때 그 창의 키(이미 받은 것)를 요청 / B. 호출자가 넘기는 자산 색인 pieceIndex, MISSING 구간이 도착 전일 때 색인 중 받지 않은 key 만 | B | pieceIndex 를 안 넘기면 requests() 는 늘 빈 배열. 선 메시지에 아직 받지 않은 PieceKey 를 알리는 것이 없어 호출자 색인이 필요하다. A 는 이미 받은 조각만 되요청해 대역폭 중복(F-291) |
| 교체 해제 키 출처 | arrive 결과의 released / levels.released() | levels.released()(돌려준 뒤 비움) | 어댑터가 받아들인 arrive 직후 불러 levels 쪽 누적이 쌓이지 않게 한다. 가짜 모듈도 같은 의미 |
| WELCOME resumed=false | 색인만 비움 / 수준 상태·planner·색인을 모두 새로 만들고 이전 그리던 key 를 releasedKeys 로 내보냄 | 후자(F-288) | 새 세션 도착분이 (구간, 수준) 키로 교체, 도착시키지 않은 칸은 비운다(server/ws/session/contract.mjs). 앞 세션에서 알던 구간은 도착 전 표시. 새 세션이 같은 key 를 도착시키면 같은 frame 의 releasedKeys 에서 빼고, PIECE 만 오고 LEVEL_ARRIVED 전에 frame 이 불리면 앞 세션 해제 목록에 그 key 가 나간다(호출자 보관 규칙 필요, 미결) |
| 해제·건너뜀 조각의 pieceSeq 장부와 이어받기 재전송(F-295·F-296 ③) | A. 해제·skip 때 seq 색인을 지운다(75eb20a, resumed 재전송이 RangeError) / B. 조각 항목을 세션 내내 둔다(a8d0654, 해제 수준도 무거운 항목이 남음) / C. 끝난 seq 는 무거운 색인에서 빼고 retired 에 seq→key 만 남긴다 / D. 세션 안 최소 미해제 seq 하한 하나만 둔다 | C | 재전송 PIECE(같은 key)와 끝난 조각이 든 창의 LEVEL_ARRIVED 는 조용히 무시한다(같은 세션에서 수준은 늘기만 하니 다시 넣어도 skip 이라 결과 같음). 다시 그리지도 releasedKeys 에 다시 내지도 않는다. 같은 seq 다른 key 는 TypeError. D 는 하한 아래 seq 의 key 대조를 잃는다. 대가: retired 가 세션 길이에 비례해 자란다(재현 측정은 아래 '측정' 절: retired 조각당 약 111~132 B, 100만 조각 약 110~132 MB). LEVEL_ARRIVED 가 끝내 오지 않는 PIECE 는 live 에 남는다. 새 세션에서 모두 비운다 |
| 대응표 원본 열 | 추정으로 표시 / 비워 둠 | 'estimated' | T13L [local] 에서 skylens 와 한 줄씩 대조해 'verified' 로 바꾼다 |

## 측정: retired 장부 조각당 바이트(재현 가능)
- 명령(연구 저장소 작업 트리 루트에서, 제품 저장소는 main 14ba5f4e 를 읽기만): `SKYLENS_ROOT=<제품 저장소 경로> node --expose-gc experiments/t13b-ledger-measure.mjs [구간수] [수준당조각]`
- 방법: 실제 createStatusView(client/status/e2e/index.mjs)를 같은 폴더의 시험용 가짜 모듈로 조립하고 선 메시지를 넣는다. 1단계에서 구간마다 수준 3 을 도착시켜 live 로 두고, 2단계에서 수준 0..2 를 도착시켜 건너뜀(retired)으로 보낸다. 각 단계 끝에서 gc 3회 뒤 heapUsed 를 잰다. 2단계 증가분 / 2단계 조각 수 = retired 조각당 바이트(수준 기계에는 2단계에서 아무것도 안 남는다).
- 결과(node v22.22.0, key 는 구간.수준.lod.chunkIndex.tile 정규 문자열):

| 구간수 × 수준당 조각 | retired 조각 수 | 2단계 heap 증가 | retired 조각당 |
|---|---|---|---|
| 4000 × 16 (2회) | 192,000 | 21.25 MB | 110.7 B |
| 400 × 1000 | 1,200,000 | 157.98 MB | 131.7 B |
| 20000 × 20 | 1,200,000 | 157.99 MB | 131.7 B |

- 참고: 1단계(live 조각 + 수준 기계 몫)는 조각당 269~285 B.
- 정정: 이전에 적었던 '40만 조각 heap 86.5 MB, 조각당 약 216 B' 는 이 방법으로 재현되지 않았다(40만 조각이면 retired 로는 약 44~53 MB, live 로는 약 110 MB). 감독 재현의 약 43 B(experiments/t13.md)도 이 측정과 다르다. 값은 key 문자열 길이·Map 확장 시점·측정 방법에 따라 달라지므로 약 111~132 B(이 key 형식, node v22) 를 현재 기준으로 삼고, 수치를 다시 인용할 때는 위 명령으로 다시 잰다.
- 이 기준으로 100만 조각은 약 110~132 MB 라 아래 문턱(100만 조각·200 MB)보다 아래이며, 1.2M 에서도 약 158 MB 다.

## 다시 볼 조건
- skylens 원본 대조(T13L)에서 메서드 이름·인자가 다르면 대응표를 고친다.
- 서버가 구간 도착 이벤트·자산 색인을 선에 싣게 되면 pieceIndex 를 선 입력으로 바꾼다.
- retired 는 해제·건너뜀으로 끝난 조각이 쌓이는 곳이라 세션 내내 늘기만 한다(받은 조각 수에 비례, 위 측정 기준 조각당 약 111~132 B). 한 세션의 받은 조각이 100만을 넘거나 장부 heap 이 200 MB 를 넘으면 retired 를 "연속 구간 하한 + 하한 위 seq→key" 로 줄인다(C·D 혼합).
- 서버 ACK 하한(resendPlan 시작 seq)이 선에 실리면 그 아래 retired 를 지운다.
- live 에 창 없이 남은 조각이 세션 조각의 1% 를 넘으면 정리 규칙(같은 구간의 더 높은 수준이 받아들여질 때 낮은 수준의 미창 조각을 끝냄)을 둔다.

## 승인 근거(감독, 2026-10-04 PR #56 검토 #3)
- 이어받기 재전송·해제 장부(F-295·F-296)와 wire 계측(F-290)을 실제 모듈 조립 시험과 변이로 확인했다. 선택지 표·대가·다시 볼 조건이 갖춰졌다. 남은 낮음 항목은 F-301.
