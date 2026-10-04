# 0040 ws 세션 배선: LEVEL_ARRIVED 는 보내기 전에 기록하고, 이어받기 때 resendPlan 으로 다시 보낸다

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-238 ④·F-270·F-272·F-273, 결정 0032·0033, 실험 노트 experiments/t12u.md

## 맥락
어댑터(server/adapter/core)·이어받기 저장소(server/ws/resume)·ws 접속(server/ws)은 따로 있었고 이어 주는 곳이 없었다.
그래서 recordLevelArrived·resendPlan 은 호출처가 0건이었고, LEVEL_ARRIVED 프레임만 유실되면 그 수준이 영구 pending 이었다(F-236).

## 선택지

### 기록·송출 순서(F-238)

| 선택지 | 장점 | 단점 |
|---|---|---|
| A. send 뒤 기록(감독 문구 '어댑터 emit 뒤') | 보낸 것만 기록 | 기록 전에 프로세스가 죽거나 기록이 실패하면 이미 나간 프레임이 재전송 목록에 없어 영구 pending 창이 생긴다 |
| B. 기록 뒤 send(채택) | 기록 후 유실은 resendPlan 이 되살린다. 기록 실패 시 아무것도 안 나가 어댑터 재시도(멱등)로 풀린다 | 기록은 됐는데 안 나간 LEVEL_ARRIVED 가 생길 수 있으나, 이어받기 때 어차피 재전송 대상이라 해가 없다 |

### send 반환값 처리(F-273 ④)

| 선택지 | 장점 | 단점 |
|---|---|---|
| A. false 를 송출 실패로 던짐 | 송출 실패를 구별할 수 있다 | server/ws/index.mjs 의 conn.send 는 false 를 '소켓 배압(쌓임)' 과 '닫힘·상한 초과로 미송출(1008)' 두 뜻으로 돌려줘 구별 불가 |
| B. 반환값 무시, 던지는 것만 실패(채택) | conn.send 의 두 가지 false 원인을 구별할 필요가 없다 | 닫힘·상한 초과로 미송출된 MISSING 은 기록이 없어 이어받기로 복구되지 않는다(PIECE·LEVEL_ARRIVED 는 기록돼 복구됨) |

## 결정

### 기록과 송출(F-238)
- server/ws/session/emit.mjs: 부호화 → 기록 → send. PIECE 는 recordSent, LEVEL_ARRIVED 는 recordLevelArrived 를 send 보다 먼저 부르고 false 면 던진다. MISSING 은 기록하지 않는다. send 반환값은 보지 않는다(배압 신호).
- server/ws/session/resume.mjs: HELLO → open → WELCOME → resumed 이면 resendPlan 의 메시지를 재전송(PIECE 바이트는 호출자가 주입한 loadPiece, 못 얻으면 그 조각과 그 창을 덮는 LEVEL_ARRIVED 는 생략).
- server/ws/session/connection.mjs: 첫 메시지 HELLO 검사, ACK→store.ack, 닫힘은 세션을 지우지 않는다.

### 닫힘 코드와 프로토콜 오류(F-270·F-273)
- 첫 메시지가 HELLO 가 아니거나 복호 실패: ERROR BAD_MESSAGE + close(1002)
- 내부 예외(어댑터 재시도 후도 실패, 저장소 오류, onMessage 예외): close(1011)
- 둘째 HELLO: ERROR BAD_MESSAGE + close(1002) 로 거부(F-270 수정 후)

### 이어받기 요청 처리(F-270)
- UNKNOWN_SESSION(저장소가 새 세션 생성): ERROR 없이 WELCOME resumed=0 으로 응답(서버 선택 가능, 현재는 에러 안 보냄)
- 기존 세션 이어받기: resendPlan 의 메시지 재전송

### loadPiece 주입(F-192·F-272)
- PIECE 의 chunk 바이트는 호출자(자산 저장소)가 loadPiece 함수로 주입한다
- 저장소가 보관한 bytes 는 ACK 되면 놓이므로(F-192) 재전송에 쓰지 않는다(호출자가 정본)
- loadPiece 가 null 을 돌려주면: 그 PIECE 와 그 창을 덮는 LEVEL_ARRIVED 는 보내지 않음(창은 조각을 모두 받아야 완료로 센다)

### 재전송 정책(F-272)
- loadPiece 가 바이트를 못 주면 그 순번을 missing 으로 기록하고 그 조각과 그 창의 LEVEL_ARRIVED 는 생략
- 첫 빠짐에서 재전송을 멈춘다
- 그 뒤 순번을 클라이언트가 ACK 로 보내면: 누적 ACK 가 빠진 조각과 그 창의 LEVEL_ARRIVED 기록을 영구히 지운다(F-272)
- 대가: 영구히 못 얻는 바이트가 있으면 그 세션은 그 순번 뒤를 영영 못 받는다. 호출자가 그 세션을 닫고 새 세션으로 받아야 함

### 순번 하한(F-270)
- attachConnection 이 onSession 으로 nextPieceSeq 를 넘긴다
- 어댑터 adapter.firstPieceSeq 는 그 이상이어야 한다
- emit 은 (seq, key) < minPieceSeq 인 메시지를 send 없이 던진다

## 근거
- 시험: server/ws/session/ws_level_arrived_loss.test.mjs — 실제 TCP 경로에서 LEVEL_ARRIVED 만 유실 → HELLO 재개 → 완료 key 3(기준값), 기록을 뺀 대조군은 0(영구 pending 재현).
- emit.test.mjs 변이: 기록을 send 뒤로 옮기면 재시도 시험이 실패, 지우면 resendPlan 시험이 실패.

## 대가
- 재전송 도중 라이브 emit 이 끼면 한 연결 안 순서 보장이 깨질 수 있다(replay_race.test.mjs 가 이 모델 안의 불변식을 고정). 이어받기 중 송출을 막는 규칙은 넣지 않았다.
- 마지막 순번까지 ACK 해도 창 끝 == ackedUpTo 인 LEVEL_ARRIVED 한 건은 다시 나간다(결정 0033, 멱등이라 무해).

## 다시 볼 조건
이 결정을 다시 검토하는 측정 가능한 사건:

① 서버 진입점(server/ws/index.mjs 의 onConnection 콜백)에 attachConnection 을 실제로 연결하는 PR 이 열릴 때
② 이어받기 재전송 바이트가 세션 상한(DEFAULT_MAX_BYTES_PER_SESSION 64 MiB)과 송신 상한(DEFAULT_MAX_SEND_BUFFER 32 MiB)을 함께 넘는 시나리오가 발생할 때
③ 외부 클라이언트(현재는 클라이언트 테스트만 있음)가 생길 때
