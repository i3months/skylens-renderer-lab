# T10 levels — 수준 상태 기계 (+ F-176)

제품 브랜치 feat/levels (기준 main 5c7e092). 연구 결정: [0029](../decisions/0029-levels-state-machine.md).
서브에이전트 13개(sonnet 6, haiku 5, opus 2; 그중 haiku 2개(T10.7·F-176 ①)는 끝내지 못해 작업자가 직접 처리, 승격 없음; T10.1 은 계약 커밋과 함께 작업자가 직접 구현). 첫 시도는 하네스가 worktree 를 제품이 아니라 연구 저장소에서 만들어 11개가 시작하지 못했고, 제품 worktree 를 직접 만들어 재지시했다(에이전트 ID-과제 대응을 잘못 안내한 뒤 정정, 한 명이 T10.6 파일을 주 체크아웃에 쓴 것은 회수해 정리).

## 구성
- T10.0 contracts/levels: 상수 4개(250·1,000·3,500·7,000)·FINAL_LEVEL·NONE, `decideArrival`, 기계 인터페이스.
- T10.1 server/levels/state: createLevelMachine(arrive·expect·snapshot·segments·pointCount·history).
- T10.2 skip: 4수준 전 순열 24가지(accepted 합 50) + 시드 고정 1만 경우 오라클 대조(accepted 47182 / skip 67768). 변이 3종 실패.
- T10.3 replace: createPieceLedger — 해제 콜백, 해제+보관=accepted. 변이에서 2 실패.
- T10.4 client/levels: 독립 구현, 서버와 1만 입력 열 deepEqual(약 9 초). 변이 2종 실패.
- T10.5 client/levels/missing: 없음 구간 렌더 점 0·라벨 '없음'.
- T10.6 final: isSegmentFinal·allFinal(빈 목록 false).
- T10.7 log: formatHistory·replayHistory, 1000 도착 이력 = 입력 열(작업자가 직접 구현 — 서브에이전트 haiku 가 끝내지 못해 회수, 시험 4건).
- T10.8 property: 10만 열 불변식 9종 위반 0(약 23 초), 변이 5종 모두 실패.
- T10.9 no_timer: 가짜 시계 1시간(×2) 진행 후 상태 불변, 타이머 호출 0, 정적 검사(금지어 7개). 변이 2 실패.
- T10.10 parity: 사례 19건(출처 있음 16·추정 3), 23 시험 통과. skylens 원본 소스는 접근 403 으로 읽지 못함 → server/levels/parity/UNVERIFIED.txt 10건. [local] 대조 필요.

## F-176
- ① 계약 순서 문구: 'limit' 줄에 하한(rawLen < min, 조각 경로) 추가, ① 을 rawLen ∉ [min, max] 로, 목록이 오류 code 결정 순서만 적는다고 명시(작업자 직접; haiku 서브에이전트 미완). 서버 chunk/index.mjs:73·클라이언트 client/codec/index.mjs:128-129 조건과 대조.
- ② client/codec/cross_error.test.mjs: 헤더 경로를 (서버 클래스·code ↔ 클라이언트 클래스·code) 대응표로 단언, '[순서 정렬 대기]' 이름 정리. 대응표 9건은 code 가 다른 알려진 차이(본문 길이 5건 length↔body, 점 0 limit↔field, codec=0 mode↔body, codec=2 mode↔codec, headerSize=64 header_size↔short). 변이: 본문 길이 code 5 실패, lod 검사 1 실패. client/codec/index.mjs:229-230 의 pointCount·tileSizeM 검사 code 변이는 통과 — parseHeader 가 먼저 같은 code 로 거부해 도달하지 못하는 중복 검사로 추정(미확인).
- ③ 시간 문턱: 서브에이전트가 상한을 800→1500/500/400 으로 **낮추고** 편향 시험의 `Buffer.compare(d,a)` 단언을 지운 변경을 냈다 → 규칙('올리기만')·판별력 위반이라 폐기하고 직접 다시 함. 3000 ms 유지, 실측(단독 5회·동시 npm test 2회: 1 MB 무작위 부호화 최대 273 ms·복호 1 ms, 편향 부호화 94 ms·복호 319 ms) 을 주석에 기록, 퍼징 상한 100→400 ms(동시 부하 최대 114 ms 관측). **미처리**: chunk_validation 'limit 은 50 ms' 시간 단언을 횟수·할당 단언으로 대체하는 것.
- ④ bench 손실 행: 원본 raw 파일 기준(readPlanesClient)과 위치 키로 짝지어 채널별 |Δ| ≤ 2 단언(이론 상한: ((v>>2)<<2)+2 → 오차 +2…−1, 실측 최대 2). QUANT2 색 1 비트 뒤집기 변이에서 bench 1 실패.
- ⑤ 노트 'DELTA 정확 단언(512색 입력)' → 실제 시험은 n=500. 이전 노트(codec_review_fixes.md)는 PR #37 연구 브랜치 소유라 이 노트에서 정정한다.

## 전체 시험(작업자 직접)
`npm test`: 2860 중 2848 통과·0 실패·12 건너뜀·todo 0 (최종 feat/levels, 직접 실행).

## 참고
- `node --test <디렉터리>` 는 Node 22 에서 실패한다. 글롭을 쓴다.
- 제품 저장소에 실제 skylens 체크아웃 입력으로 돌리는 경로는 없다([local]).
