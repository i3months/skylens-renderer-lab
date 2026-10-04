# client-raster (T12) — T11.H 처리와 T12.0·T12.8 선행

제품 feat/client-raster, 연구 experiment/client-raster(부모 experiment/protocol). 이번 실행은 T11.H(PR #40 검토 잔여)와 T12 의 계약·번들 검사를 먼저 올린다. 래스터라이저 본체(T12.1~T12.7, T12.9, T12.10)는 다음 작업자.

## 실행
서브에이전트 12개(opus 1·sonnet 8·haiku 3, 승격 0). 격리 worktree, 소유 경로 분리, 작업자가 하나씩 병합. 3개(F-206·F-200 / F-207 resume / F-208 scheduler)는 소유 경로 충돌 없이 병합됨. 작업자가 직접 고친 것: initial.test.mjs 의 손계산 값 3곳(WELCOME 23 B·LEVEL_ARRIVED 23 B 반영).

## 처리
- F-210(높음): upgrade 핸들러 첫 줄에 소켓 error 처리기. 시험: 잘못된 핸드셰이크 + 즉시 RST 20회 uncaughtException 0, 이후 정상 수락. 처리기 제거 변이에서 실패 확인.
- F-211(높음): 'end' 처리기, FIN 만 보내면 onClose 1회·code 1006(2 s 안). 제거 변이에서 실패 확인.
- F-204: 방식 (b). 송출 실패한 이벤트를 기억해 다른 이벤트는 UnfinishedEventError(UNFINISHED_EVENT)로 거부, 같은 이벤트(같은 key·바이트) 재시도로만 회복. 이유: emit 이 던졌을 때 그 메시지가 실제로 나갔는지 어댑터가 알 수 없어 (a)는 빈칸 또는 같은 seq 두 key 를 만든다. 계약 contracts/proto:15 에 '같은 pieceSeq 를 다른 key 로 쓰지 않는다' 명시. 시험: 실패 지점 6곳 × 코덱 유무 × 다른 이벤트 5종, 선로 기록의 pieceSeq→key 일대일, resume.unacked 1..4 빈칸·중복 없음. 기존 어댑터 시험 위반 변이 13건 실패.
- F-205: 세 코덱(서버·클라이언트·기준) pieceCount 0 → 'field', 퍼저·cross 생성기 1 이상.
- F-206: pong 대기 바이트만 셈(send 데이터 제외), 옵션 검증(maxWriteBuffer 정수 > 256, maxPingsPerSecond 정수 ≥ 1, Infinity 거부 — 호환 변경), now 주입·performance.now. 2 MiB 이상 send 뒤 ping 1개 연결 유지.
- F-200 잔여: maxPendingMessages 기본 64(초과 시 소켓 pause), maxSendBuffer 기본 32 MiB(초과 시 send false·1008 'send buffer'). 결정: 1008 대신 pause 를 택함(정상 폭주를 끊지 않으려고). 끝나지 않는 핸들러는 그 연결만 멈춘다.
- F-207: closed() 3 s 시한, 시계 주입 창 시험, 옵션 없는 서버 기본값(1 MiB·50/s), resume 같은 key 대체+축출 groups ≤ maxEntries, 재기록 retainedBytes 손계산. 변이(destroy 제거·P2·P5·P7·P6·G3·R6)가 각각 실패. 미처리: 감독이 추가한 ⑧⑨⑩, 비동기 기본값 W2 는 상수 단언만(행동 시험 없음).
- F-208: frame 파서 꼬리 버퍼 합치기(4 MiB 1 B 조각 증가 약 3~6 MiB, 이전 약 550 MB), scheduler 힙·지연 삭제·묶음별 수준 목록(100k 오름차순 enqueue 약 0.5 s 과부하 상태 CPU 시간, 이전 16~38 s). **한계: 과부하 환경(load 16~45)에서만 측정, 문턱 0.3 s·50 ms 는 3배(150 ms)로 완화 + '또는 내림차순의 3배' 조건. 감독이 확인 기준 수치 완화 여부를 판단해 달라.**
- F-209: ①②③(chunkIndex 시험·교차, ASSET_FORMAT.md·ids 상한 65535, frameBytes 단언), ④(초기 예산이 WELCOME·LEVEL_ARRIVED 프레임도 센다 — 15,000,000 불변, 실제 프레임 합 ≤ 15,000,000 시험), ⑤(RangeError), ⑦(ackedQ Map, 100만 회 후 길이 3). ⑥(수신측 재전송 중복 처리)은 T12 수신 경로 확인 기준으로 남김.
- F-212: ① 음성·TTL 시험, ⑥ pendingQ 압축(100만 회 후 ≤ 2×maxEntries). ②~⑤ 미처리.
- T12.0: contracts/client_raster/(createRenderer·uploadPiece·releasePiece·setView·draw·memoryBytes·dispose·컨텍스트 소실 콜백, frameStats). 9건 시험.
- T12.8: bench/client_bundle/ — client 모듈 6개 esbuild minify+gzip -9 합 14,157 B(문턱 300 KB 불변, 시험에 박음).

## 검증(작업자 직접)
제품 feat/client-raster 에서 `npm test`: 3210 중 3198 통과·0 실패·12 건너뜀·todo 0. 실제 skylens 체크아웃 입력은 [local](T11.8L·T10.10L).

## 남은 것
T12.1~T12.7·T12.9·T12.10, F-209 ⑥, F-212 ②~⑤, F-207 ⑧~⑩, F-200 시험 판별력(상수만 단언).
