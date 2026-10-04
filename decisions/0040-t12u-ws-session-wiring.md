# 0040 ws 세션 배선: LEVEL_ARRIVED 는 보내기 전에 기록하고, 이어받기 때 resendPlan 으로 다시 보낸다

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-238 ④, 결정 0032·0033, 실험 노트 experiments/t12u.md

## 맥락
어댑터(server/adapter/core)·이어받기 저장소(server/ws/resume)·ws 접속(server/ws)은 따로 있었고 이어 주는 곳이 없었다.
그래서 recordLevelArrived·resendPlan 은 호출처가 0건이었고, LEVEL_ARRIVED 프레임만 유실되면 그 수준이 영구 pending 이었다(F-236).

## 선택지

| 선택지 | 장점 | 단점 |
|---|---|---|
| A. send 뒤 기록(감독 문구 '어댑터 emit 뒤') | 보낸 것만 기록 | 기록 전에 프로세스가 죽거나 기록이 실패하면 이미 나간 프레임이 재전송 목록에 없어 영구 pending 창이 생긴다 |
| B. 기록 뒤 send(채택) | 기록 후 유실은 resendPlan 이 되살린다. 기록 실패 시 아무것도 안 나가 어댑터 재시도(멱등)로 풀린다 | 기록은 됐는데 안 나간 LEVEL_ARRIVED 가 생길 수 있으나, 이어받기 때 어차피 재전송 대상이라 해가 없다 |

## 결정
- server/ws/session/emit.mjs: 부호화 → 기록 → send. PIECE 는 recordSent, LEVEL_ARRIVED 는 recordLevelArrived 를 send 보다 먼저 부르고 false 면 던진다. MISSING 은 기록하지 않는다. send 반환값은 보지 않는다(배압 신호).
- server/ws/session/resume.mjs: HELLO → open → WELCOME → resumed 이면 resendPlan 의 메시지를 재전송(PIECE 바이트는 호출자가 주입한 loadPiece, 못 얻으면 그 조각과 그 창을 덮는 LEVEL_ARRIVED 는 생략).
- server/ws/session/connection.mjs: 첫 메시지 HELLO 검사, ACK→store.ack, 닫힘은 세션을 지우지 않는다.

## 근거
- 시험: server/ws/session/ws_level_arrived_loss.test.mjs — 실제 TCP 경로에서 LEVEL_ARRIVED 만 유실 → HELLO 재개 → 완료 key 3(기준값), 기록을 뺀 대조군은 0(영구 pending 재현).
- emit.test.mjs 변이: 기록을 send 뒤로 옮기면 재시도 시험이 실패, 지우면 resendPlan 시험이 실패.

## 대가
- 재전송 도중 라이브 emit 이 끼면 한 연결 안 순서 보장이 깨질 수 있다(replay_race.test.mjs 가 이 모델 안의 불변식을 고정). 이어받기 중 송출을 막는 규칙은 넣지 않았다.
- 마지막 순번까지 ACK 해도 창 끝 == ackedUpTo 인 LEVEL_ARRIVED 한 건은 다시 나간다(결정 0033, 멱등이라 무해).

## 다시 볼 조건
- 외부 클라이언트가 생기거나 재전송 도중 송출 순서가 문제가 될 때.
