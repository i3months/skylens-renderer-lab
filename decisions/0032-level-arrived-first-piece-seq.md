# 0032 LEVEL_ARRIVED 에 firstPieceSeq(u32)를 싣고, 이어받기 저장소가 LEVEL_ARRIVED 를 기록·재전송한다

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: TASKS T11(프로토콜)·T12(렌더러 재개 전 선행), FEEDBACK F-236(관련 F-234·F-235), 결정 0030(선 형식)·0031(어댑터 재시도)

## 맥락
LEVEL_ARRIVED 는 pieceSeq 를 쓰지 않는다. 그래서 PIECE f..f+n−1 은 모두 받았는데 바로 뒤 LEVEL_ARRIVED 만 끊김으로 잃으면 HELLO(lastPieceSeq=f+n−1)·ACK 로는 그것을 알 수 없고, 이어받기 저장소(server/ws/resume)는 PIECE 만 기록하므로 다시 보낼 것이 없다. 그 수준은 클라이언트에서 영구히 pending 으로 남는다(더 높은 수준이 올 때까지 그 구간이 그려지지 않음 — 안전 쪽 실패).
LEVEL_ARRIVED 만 뒤늦게 다시 보내는 것도 막혀 있었다. 클라이언트의 완료 창(contracts/client_raster/arrival.mjs 규칙 ②)은 'LEVEL_ARRIVED 전까지 받은 가장 큰 pieceSeq' 를 끝으로 추정하므로, 그 사이 더 큰 pieceSeq 를 받았으면 창이 어긋나 ClientRasterError 가 난다. 소비자(T12 렌더러)가 재개를 다루기 전에 선 규약을 정해야 한다.

## 선택지
| 선택지 | 장점 | 단점 | 근거(측정·출처) |
|---|---|---|---|
| A. LEVEL_ARRIVED 에 firstPieceSeq u32 추가(본문 9 → 13 B). 창 = firstPieceSeq..+pieceCount−1 을 선에 명시. 저장소가 LEVEL_ARRIVED 를 기록하고 이어받기 때 자기 조각 뒤에 다시 보낸다 | 창 추정이 사라져 단독 재전송이 멱등. 순번 공간·ACK 의미는 그대로. 어댑터는 이미 firstPieceSeq 를 안다(nextSeq) | 선 형식 변경(코덱 3벌·퍼저·교차 시험·초기 묶음 예산 상수). LEVEL_ARRIVED 당 4 B. 저장소가 수신 여부를 몰라 이미 받은 LEVEL_ARRIVED 를 다시 보낼 수 있음(멱등이라 무해) | 확인 시험(아래 근거). 4 B × 수준 수: 초기 묶음 예산 15,000,000 B 대비 구간·수준당 0.00003 % |
| B. LEVEL_ARRIVED 가 pieceSeq 하나를 쓴다(조각처럼 순번을 받음) | lastPieceSeq·ACK 로 수신 여부까지 정확히 알 수 있다. 저장소가 PIECE 와 같은 경로로 재전송 | 순번 의미가 '조각 순번' 에서 '메시지 순번' 으로 바뀌어 어댑터·저장소(recordSent 는 key 기반, 추월 묶음)·arrival 창 규칙·F-219 ② 순번 태우기를 모두 다시 맞춰야 함. 창을 여전히 추정하거나 명시해야 함(창 문제는 A 와 같이 남는다) | 영향 범위 추정(코드 읽기) |
| C. 선 형식 그대로, 저장소만 LEVEL_ARRIVED 를 창 끝 순번과 함께 기록해 재전송 | 선 변경 없음 | 클라이언트 창이 maxSeq 추정이라 재전송이 '창 끝 = 그때까지 받은 최대 순번' 일 때만 맞다. 단독 재전송이 멱등이 아니다(더 큰 순번 뒤에 오면 거부) | arrival.mjs 규칙 ② |
| D. 고치지 않는다(더 높은 수준이 오면 풀린다) | 비용 0 | 마지막 수준(level 3)을 잃으면 영구 미표시 | F-236 |

## 결정
A. LEVEL_ARRIVED 본문을 segmentId u32, level u8, pieceCount u32, firstPieceSeq u32(13 B)로 바꾸고, server/ws/resume 이 recordLevelArrived·resendPlan 으로 잃었을 수 있는 LEVEL_ARRIVED 를 이어받기 때 자기 조각 뒤에 다시 보낸다.

## 근거
- 선 규칙: firstPieceSeq ≥ 1, firstPieceSeq + pieceCount − 1 ≤ 0xFFFFFFFF, 어기면 'field'. 서버 코덱·클라이언트 코덱·퍼저 기준 코덱이 같은 규칙을 쓰고, 교차 시험·퍼저(차등 비교)가 13 B 배치로 통과.
- 저장소 확인 규칙: 한 연결 안에서는 순서가 보장되고 어댑터는 조각 → LEVEL_ARRIVED 를 다른 이벤트 없이 연달아 보낸다(0031). 그러므로 ackedUpTo(또는 HELLO lastPieceSeq) > 창 끝이면 그 LEVEL_ARRIVED 는 받은 것이고, == 창 끝이면 모른다. 모르는 것만 남기므로 기록 수 ≤ 미확인 조각 수 + 1(항목 상한에 묶임). 다시 보낼 때는 창 안의 미확인 순번이 모두 재전송 조각에 있을 때만 넣는다(추월·대체로 빠진 조각이 있으면 보내지 않음).
- 클라이언트 창: firstPieceSeq 가 있으면 그 창을 쓰고 maxSeq 와 무관하다 → 같은 LEVEL_ARRIVED 를 몇 번, 어느 자리에서 받아도 같은 완료 key 집합(selectDrawable 은 같은 수준 항목을 합집합으로 받는다).
- 확인 시험(server/ws/resume/level-arrived.test.mjs, 실제 서버 코덱 → 클라이언트 코덱 경유): 'PIECE 3..5 전부 수신, LEVEL_ARRIVED(9,1) 유실, HELLO(lastPieceSeq=5)' → resendPlan 이 LEVEL_ARRIVED(9,1,first 3,n 3) 하나를 내고, 재개 뒤 collectArrivals·selectDrawable draw 가 수준 1 key 3개(고치기 전에는 pending). 이미 받은 LEVEL_ARRIVED 를 더 큰 pieceSeq 뒤에 두 번 더 받아도 draw 가 같고, firstPieceSeq 없는 옛 형식을 같은 자리에 두면 거부된다.

## 대가
- PROTO_VERSION 은 1 그대로 둔다(결정 0030 은 '종류 추가 때 올림'). 배포된 클라이언트가 없고 서버·클라이언트가 한 저장소에서 교차 시험으로 묶여 있어서다. 옛 9 B LEVEL_ARRIVED 는 고정 크기 불일치 'length' 로 거부된다(조용히 다르게 읽히지 않음). 추정: 외부 클라이언트가 생기기 전까지는 안전.
- LEVEL_ARRIVED 하나에 4 B, 초기 묶음 예산 상수(server/scheduler/initial LEVEL_ARRIVED_FRAME_BYTES)가 27 → 31 B.
- 서버는 LEVEL_ARRIVED 수신 여부를 확정할 수 없어(ACK 가 조각 순번만 셈) 창 끝 == lastPieceSeq 인 것은 이미 받았어도 다시 보낸다. 멱등이라 그리기에는 무해하지만 collectArrivals 의 arrived 에 같은 항목이 중복된다.
- 저장소 호출자(ws 배선·어댑터 emit)가 LEVEL_ARRIVED 를 recordLevelArrived 로 기록해야 한다. 기록을 빠뜨리면 이전과 같이 잃은 LEVEL_ARRIVED 를 회복하지 못한다(안전 쪽).
- firstPieceSeq 가 없는 입력(선을 거치지 않은 시험 입력 등)은 arrival.mjs 가 옛 maxSeq 추정 창으로 계속 받는다. 선을 거친 메시지에는 언제나 firstPieceSeq 가 있다.

## 다시 볼 조건
- 외부(저장소 밖) 클라이언트가 생기거나 선 형식을 다시 바꿀 때: PROTO_VERSION 올림과 옛 형식 처리 방침을 함께 정한다.
- LEVEL_ARRIVED 수신을 정확히 알아야 하는 요구(예: 서버가 수준 도착 확인을 근거로 자원을 놓아야 할 때)가 생기면 B(LEVEL_ARRIVED 가 순번을 씀) 또는 수준 단위 ACK 를 다시 본다.
- T12 렌더러가 재개를 구현하면서 중복 arrived 항목이 비용(selectDrawable 호출당 시간)으로 측정되면 클라이언트 쪽 중복 제거를 정한다.
- 저장소의 LEVEL_ARRIVED 기록 수가 세션 상한 계측(stats)에서 문제가 되면 상한·축출 규칙을 정한다.
