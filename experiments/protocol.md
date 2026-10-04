# T11 protocol — 웹소켓 메시지·송출 (+ T10.F)

제품 브랜치 feat/protocol (기준 main dbb59e7). 연구 결정: [0030](../decisions/0030-protocol-wire-format.md).
서브에이전트 14개(sonnet 11·haiku 2·opus 1, 승격 없음). 모두 푸시 전 로컬 브랜치에서 합쳤다. 하네스가 작업 트리를 연구 저장소에서 만들므로 각자 제품 작업 트리(/home/user/wt/<ID>)를 직접 만들게 했다(T10 과 같은 경위).

## 구성
- T11.0 contracts/proto: 메시지 9종, 머리 8 B, 본문 배치, 검사 순서(short→type→version→reserved→limit→length→direction→본문 length→field), 상한(본문 4 MiB, 요청 항목 256).
- T11.1 server/proto/codec: 17 시험. T11.2 client/proto: 독립 구현, 서버와 교차 시험 3건.
- T11.3 server/ws: 의존성 없는 RFC 6455(프레임 파서·핸드셰이크), 주소·포트는 환경 변수 `SKYLENS_WS_HOST`·`SKYLENS_WS_PORT`, 저장소에 주소·포트 문자열 0(시험이 grep). 15 시험.
- T11.4 scheduler 9 시험: 합성 1만 항목 예산 초과 0·순서 위반 0·추월 후 낮은 수준 전송 0. T11.5 initial 5 시험: 총 ≤ 15 MiB, 카메라 뒤 0.
- T11.6 backpressure 6 시험(버퍼 상한 초과 0, 요청 256 허용·257 거부, 복호 50 ms 허용·51 ms 거부). T11.7 resume 7 시험(100조각 재접속 중복 0·누락 0).
- T11.8 adapter 7 시험(opus; 녹화 재생 서버·클라이언트 기계 일치, skip 에서 emit 0). T11.9 mock_client 1 시험. T11.10 fuzz. T11.11 bench/proto 18 시험.

## 통합에서 발견한 것 (작업자 직접 수정)
- 교차 시험이 처음에 2건 실패: (1) 방향 검사를 클라이언트가 type 직후에 했고 서버는 길이 검사 뒤에 했다 → 계약에 위치를 적고 클라이언트를 서버에 맞춤. (2) 클라이언트만 PIECE_REQUEST 같은 키 중복을 거부(계약에 없음) → 제거. 이것이 서로 독립 구현을 교차시킨 이유다.
- F-181 로 상한이 2^30-1 이 되어 기존 시험 3건(levels.test:47, parity cases:133, property:38) 이 깨져 조정.

## 알려진 가정·미해결
- T11.8 어댑터의 skylens 코어 이벤트 모양은 가정이다(원본 미열람). PIECE 들을 먼저, LEVEL_ARRIVED 를 마지막 완료 표시로 보낸다(계약에 순서 명시 필요 — 다음 PR).
- 어댑터가 쌓는 조각은 {key, bytes} 라 서버 기계 pointCount 는 0(.skla 를 해석하지 않음).
- T11.4 추월 묶음 기준은 (구간, tileX, tileY, lod) 이고 chunkIndex 를 뺐다. 한 타일의 높은 수준 chunk 일부만 큐에 있어도 낮은 수준 chunk 전부가 버려진다 — 수준이 chunk 단위로 교체되는지 확인 필요.
- ws 서버에 backpressure·resume·scheduler·adapter 를 잇는 통합 서버는 아직 없다(각 모듈은 순수 로직). 다음 PR.
- 본문 상한 4 MiB·역압 상한은 임의값(근거 없음).
- 전체 `npm test` 는 서브에이전트 여럿이 동시에 돌려 과부하(시간 단언 시험 2~3건이 부하 때 실패, 단독 재실행 통과)였다.

## T10.F 처리
- F-183: 제품에서 UNVERIFIED.txt 삭제, [levels_unverified.md](levels_unverified.md) 로 이동(첫 커밋).
- F-181·F-178: contracts/levels 가 asset 상수 import, 상한 2^30-1, count 정의역(0 이상 안전 정수), 해제 콜백 전부 호출 후 첫 오류, -0 거부(시험 12건).
- F-180: 열마다 새 기계(replace 2720/15000), 손계산 4×4 표, 정적 검사 전 소스. 변이: 누적 2 실패, setTimeout 1 실패, `>`→`>=` 3 실패.
- F-182: 클라이언트 entropy 의 mode 검사를 길이<1 검사 뒤로(서버와 같음), mode 0..255 × 길이 0·1 시험. F-177 ②~④: 기대 code 전부 고정, 경계 ±1 시험(streamRawBounds 12 + 조기 거부 6), body_bytes 0·1·15 length 케이스, rawLen>7 건너뜀 제거. 변이: client/codec/index.mjs:63 `+64`→`+63` 에서 client/codec+chunk_validation 1 실패(작업자 직접 확인; 에이전트의 21개 변이는 병렬 잡음이 있어 신뢰도 낮음). 도달 불가 중복 검사는 삭제하지 않고 이유 주석.
- F-179(조회 성능)는 T12 착수 전 — 미처리. F-176 ③ 시간 단언 대체는 T12.5 와.

## 전체 시험(작업자 직접)
`npm test`: 3007 중 2995 통과·0 실패·12 건너뜀·todo 0 (f177 병합 직전 feat/protocol, 직접 실행). f177 병합 뒤 최종(1107514): 3024 중 3012 통과·0 실패·12 건너뜀·todo 0 (직접 실행).

## T11.F 처리 (PR #39 반려 1회, 제품 feat/protocol 7f362d0)
서브에이전트 11개(opus 2·sonnet 7·haiku 2), 승격 없음. 첫 투입은 격리 worktree 가 연구 저장소로 만들어져 6개가 시작하지 못해 제품 worktree 로 재투입(실패 아님, 환경 문제).
- 계약(97f2d5d): pieceSeq 는 1 부터(PIECE_SEQ_MIN, 0 = 받은 것 없음), `overtakeGroup` = (segmentId,tileX,tileY,lod) 한 함수를 scheduler·resume 이 공유, chunkIndex 상한 CHUNK_INDEX_LIMIT=65536(contracts/asset 은 더 크게 허용하나 PIECE 로는 못 보냄 — 결정: PieceKey u16 유지), quat = 카메라→ENU(contracts/raster 축), oversize 단독 배치 예외를 계약 문구에 명시.
- F-184: 어댑터 기본 firstPieceSeq 1, 0 RangeError, 어댑터→recordSent→open 통합 시험(core.test). F-185·F-190: resume·scheduler 가 overtakeGroup 사용, scheduler 는 묶음별 나간 최고 수준 기억(낮은 수준 enqueue false), 교차 시험 server/scheduler/overtake_cross.test.mjs(8쌍 표). F-186: 15,000,000·3,000,000 B(MiB 제거), 경계 ±1 시험. 작업자가 하위 작업 4 의 임의 '항목별 3 MB 버림' 로직을 되돌림(구간당 상한은 구간 합 기준).
- F-187: ① server/scheduler/initial/scenes.test.mjs — large 장면 레벨 0 합 27,508,808 B, 시점별 totalBytes ≤ 14,943,940·dropped 합 36. ② replayPath(실제 코덱, dronePath 50·freePath 40 시점 정확히 수신). ③ bench/proto/measure.mjs — 합성 구간 4개 실제 프레임 바이트 2,064,882·2,065,660·2,065,788·2,065,928 B(상한 3,000,000 의 68.8%, 충족).
- F-188: ws 콜백 try, 실패 연결만 1011, onError. F-189: 어댑터가 메시지를 모두 만들고 송출한 뒤 상태 확정(emit n 번째 실패 시 상태 불변). F-191: 프레임 파서 선형(4 MiB/1400 B 약 10~12 ms, 이전 920~1390 ms), 빈 연속 프레임 상한 1009. F-192: scheduler maxPending·maxSentGroups, resume ack 시 bytes 해제·세션 상한(상한 축출 시 중복 전송 가능 — 헤더에 대가 명시). F-193: ①u16 유지·65535/65536 시험 ②quat 규약 ③oversize ④주소·포트 검사 server/·tools/ 로. F-194: 코덱 code 통일('short'·'type')·BOM·Buffer 복사, 프레임 1002. F-195: 변이 시험 다수 추가. F-196: arrayBuffers 계측·선할당 복호기 3종·차등 비교·순서 교환 변이 사망.
- 한계: 어댑터 재시도 시 일부 송출분이 같은 pieceSeq 로 한 번 더 나갈 수 있다(수신·resume 이 같은 조각으로 처리한다는 전제, 계약 미기재 — 감독 판단 요청). resume 상한 축출 시 중복 전송 가능. [local] 실제 skylens 녹화 대조는 T11.8L.
- 전체 `npm test`(작업자 직접): 3128 중 3116 통과·0 실패·12 건너뜀.
