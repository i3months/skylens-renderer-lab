# T02.8 기존 skylens 와의 결합 방식

작업: T02.8 · 소유 파일: 이 파일 하나 · 성격: 조사 문서(코드 아님)
읽은 근거: 연구 저장소 `SPEC.md`(§0·§1.3·§3·§7), `TASKS.md` T02, skylens `develop` 체크아웃(커밋 `59edcf9`, 읽기 전용).
아래 파일·줄 번호는 모두 그 체크아웃에서 직접 열어 확인한 것이다. 경로의 `skylens/` 는 체크아웃 루트를 뜻한다.

## 0. 결론 요약

- **COMPONENTS 경계 변경 없음.** 두 방식 모두 `docs/COMPONENTS.md` 의 8개 컴포넌트 표(§1, 13~24행)·디렉터리 구조(§6, 148~162행)·포트 맵(§7, 168~177행)을 바꾸지 않고 들어갈 수 있다. 근거는 §3.
- 확인한 사실 하나가 설계를 좌우한다. **스케줄 결정권은 코어에만 있다**(`COMPONENTS.md` 91행, `orchestrator.ts` 3행). 렌더러는 "무엇을 언제 보낼지"를 정하지 않고, 코어가 이미 내리는 결정(구간 닫힘, 수준 도착)을 받아 자산·픽셀로 바꾸는 쪽이다.
- 잠정 의견: **1단계(경로 B)는 (가) 같은 저장소의 새 패키지로 시작하고, 서버 GPU 렌더러(2단계, 경로 A)는 (나) 별도 프로세스로 분리하되, 그 프로세스가 코어와 하는 통신은 기존 ws 경로 규약 위에서만 한다.** 근거는 §5. 확정이 아니며 T02.11 에서 감독이 정한다.

## 1. 결합 지점 조사 (파일·줄 근거)

### 1.1 컴포넌트 경계(COMPONENTS.md)

| 사실 | 근거 |
|---|---|
| 배포 단위 8개: drone · gateway · proxy · core · model · client · shared · demo. `shared` 는 배포 단위가 아니라 의존 라이브러리 | 13~26행 |
| 코어 책임 4개: 관제탑 화면 서버 · 인메모리 보관 · 오케스트레이터(딜레이 패턴) · 배포 | 82~91행 |
| 딜레이 패턴의 스케줄 결정권은 코어에만 있다. 클라이언트가 타이머로 단계를 진행시키는 구조는 폐기 | 91행 |
| 모델 API 는 REST(요청/응답) 계산 서비스. 나머지는 push | `protocol.ts` 5~7행, 264~267행 |
| 코어→현황판은 지금 WebSocket, `Distributor` 인터페이스 뒤에 숨겨 WebRTC 로 교체 가능하게 둠 | 185~187행, `distributor.ts` 1~9행 |
| 관제탑은 코어 `ws /viewer` 에 직결, 현황판은 `skylens_client` 릴레이를 거침 | 189행 |
| 서버 코드만 `server/` 로 묶고 브라우저 코드는 컴포넌트 루트에 둔다 | 164행 |
| 포트: core 8080(`/uplink`·`/viewer`), client 8090, model 8100 | 168~177행 |

참고: SPEC §7 은 "COMPONENTS §8 의 ws 경로 구성을 따른다"고 쓰며, 실제로 그 내용(Distributor, 관제탑 직결·현황판 릴레이)은 COMPONENTS §8(181~197행)에 있다. 맞다.

### 1.2 코어 서버(`skylens/src/skylens_core/server/`)

| 결합 지점 | 위치 | 확인한 내용 |
|---|---|---|
| 청크 생성 | `orchestrator.ts` 337~354행 | 모델 API 결과로 `SplatChunk`(`kind:'splat-chunk'`, `segment`, `level`, `final`, `url`, `bytes`, `align`)를 만든다. 구간·수준 식별자가 이미 메시지에 실린다(SPEC §6 요구와 일치) |
| 청크 방출 훅 | `orchestrator.ts` 55행(옵션 `onChunk`), 363행(호출) | 청크가 저장소에 들어간 직후 호출. 호출 뒤 다음 수준을 큐에 넣는다(364~368행) |
| 훅 배선 | `index.ts` 80행 | `onChunk: (chunk) => distributor.broadcast(chunk)`. 배선은 이 파일에만 있다(8행 주석) |
| 구간 닫힘 훅 | `index.ts` 95행 | `onSegmentClosed: (seg) => orchestrator.segmentClosed(seg)`. 렌더러가 "이 구간의 입력이 확정됐다"를 알 수 있는 자리 |
| 뷰어 팬아웃 | `distributor.ts` 75~79행(`broadcast`), 134~143행(`Envelope` 로 감싸 JSON 텍스트 전송), 145~154행(`raw`) | 모든 프레임이 `JSON.stringify` 텍스트다. 바이너리 프레임 경로는 없다 |
| 늦게 붙은 뷰어 재생 | `index.ts` 133~148행(`onJoin`) | 저장된 청크를 순서대로 재전송(144행) |
| 뷰어→코어 제어 | `distributor.ts` 102~132행, 특히 125행 | **허용 kind 가 `assign-route`·`manual-control` 두 개로 하드코딩**되어 있다. 그 밖은 `rejected` 로 버린다 |
| 제어 처리 | `index.ts` 150~159행(`onControl`) | 새 제어 kind 를 받으려면 여기도 분기 필요 |
| ws 경로 분기 | `index.ts` 266~288행, 경로는 `config.ts` 106~107행(`/uplink`, `/viewer`) | `noServer` WebSocketServer 2개를 `upgrade` 에서 경로로 나눈다. 경로 하나를 더하는 자리가 명확하다 |
| 모델 API 호출 | `orchestrator.ts` 312~323행(`ReconJobRequest` 구성, `runRecon`), `modelClient.ts` | 코어는 모델 API 를 REST 로 부르고 결과의 `url` 만 받는다. 자산 바이트는 코어를 지나지 않는다 |

### 1.3 공용 프로토콜(`skylens/src/shared/protocol.ts`)

| 지점 | 위치 | 확인한 내용 |
|---|---|---|
| 뷰어로 가는 메시지 합집합 | 342~353행 `ViewerMessage` | 새 메시지 종류를 더하는 1순위 자리 |
| kind 목록 단일 출처 | 366~375행 `VIEWER_MESSAGE_KINDS`, 378~380행 완전성 검사 | 합집합에 더하고 목록에 빼먹으면 **컴파일 오류**가 난다. 주석(356~364행)이 과거 "조용히 사라진" 사고를 기록한다 |
| 제어 메시지 | 134행 `ControlMessage` | 입력(카메라 조작 등)을 서버로 보내야 하는 2단계 A 가 여기에 더하게 된다 |
| 봉투 | 34~43행 `Envelope` | `seq`·`originTs`·`from`. `from` 은 `ComponentId`(18행)이며 `'core'|'client'|'model'` 등 6종. 새 송신자는 여기에 값이 필요할 수 있다 |
| 청크 형태 | 172~188행 `SplatChunk` | `url`+`bytes`+`align`. 이미 "메타데이터는 ws, 바이트는 `url`" 구조다 |

### 1.4 현황판 릴레이(`skylens/src/skylens_client/server/`)와 클라이언트

| 지점 | 위치 | 확인한 내용 |
|---|---|---|
| 코어→릴레이 수신 | `upstream.ts` 41~48행(`unwrap`), 104~119행 | `isViewerMessageKind` 로 거른다. 목록에 없는 kind 는 `malformed` 로 센다 |
| 릴레이 캐시 | `boards.ts` 143~170행 `remember` | kind 별 `switch`. 청크는 구간별 최고 수준만 유지(145~151행). 새 kind 는 여기서 캐시 여부를 정해야 재접속 보드가 받는다 |
| 보드 팬아웃 | `boards.ts` 127행 `replayFrames` | 재생 순서 정의 |
| 보드→릴레이 | `boards.ts` 201행 | "Boards are receive-only today. Anything they send is ignored" — **현황판 쪽 입력 역방향은 의도적으로 막혀 있다** |
| 릴레이 ws 라우팅 | `server/index.ts` 96~113행 | `/stream`(보드), PeerJS, Vite HMR 이 한 포트를 공유 |
| 브라우저 수신 | `shared/viewer/serverSource.ts` 99행(`isViewerMessageKind`), 126행 | **`typeof ev.data !== 'string'` 이면 버린다.** 바이너리 프레임은 지금 브라우저에서 무시된다 |
| 클라 수신 분배 | `skylens_client/sources/relayClient.ts` 171~174행(`splat-chunk` → `chunkCbs`) | 클라이언트 측 분배 지점 |
| 현황판 청크 소비 | `skylens_client/status.ts` 118행(`relay.onSplatChunk`), 162~168행(`ingestSplatChunk`) | 주석 161행: 청크 자신의 PLY 는 받지 않고 "첫 도착이 최종 장면을 배치·로드한다" |
| 장면 로드 | `statusview/statusViewer.ts` 523~560행(`ingestSplatChunk`), `statusview/splatScene.ts` 125~148행(`loadFinal`, `addSplatScene`) | **경로 B 의 클라이언트 교체 지점.** three.js `DropInViewer` 로 PLY 하나를 한 번에 로드한다 |
| 도착 기준 노출 | `statusview/splatReveal.ts` 76행 `noteArrival(segment, level, final)` | 렌더러 교체 뒤에도 같은 호출 규약을 지키면 "도착 = 보인다"(COMPONENTS 197행)가 유지된다 |
| 관제탑 | `skylens_core/coreLink.ts` 104~131행 | `splat-chunk` 분기(122행)는 있으나 `control.ts` 가 `onSplatChunk` 를 연결하지 않는다(확인: `control.ts` 133행에 `onCameraFeed` 만 연결됨). 관제탑 3D 는 `controlview/towerViewer.ts` 가 `shared/viewer/sources/` 의 `terrainSource`·`buildingSource` 결과(`TerrainVisual`·`BuildingVisual`, 19~20행)를 그린다. 관제탑에서 B 가 바꿀 자리는 이 소스 쪽이다 |

### 1.5 확인된 결함·주의(렌더러 작업 전 알아 둘 것)

- `skylens_client/relayProtocol.ts` 69~76행 `VIEWER_KINDS` 에 `assign-route`·`camera-feed` 가 없다. 사용처는 이 파일 안의 `isViewerMessage`(78행) 뿐이라 현재 영향은 없어 보이나, `protocol.ts` 356~364행이 지우려던 "kind 목록 복제본"의 잔재다. 새 kind 를 더할 때 헷갈릴 수 있으므로 원본 목록을 쓰도록 정리하라는 제안을 FEEDBACK 후보로 둔다. 이 노트는 skylens 를 고치지 않는다.
- 현황판의 최종 장면은 데모에서 "구간 PLY 가 아니라 하나의 최종 파일"로 로드한다(`statusViewer.ts` 514~521행 주석, `splatScene.ts` 120~124행 주석). 자산 경량화(경로 B)가 들어가려면 이 데모 단순화를 구간·수준 단위 로드로 되돌려야 한다. 이것은 클라이언트 쪽 변경이며 컴포넌트 경계 변경은 아니다.

## 2. 두 결합 방식

### (가) skylens 저장소 안의 패키지

`skylens/src/` 아래 새 디렉터리(예: 자산 처리 서버는 `skylens_core/server/` 옆의 별도 모듈, 클라이언트 래스터라이저는 `skylens_client/statusview/` 쪽)로 들어간다. 저장소는 `package.json` 하나의 평면 구성이다(workspaces 없음, `"type":"module"`; 스크립트 `test` 는 Playwright). 배포 단위는 늘지 않는다.

### (나) 별도 서비스

렌더러가 독립 프로세스·독립 저장소로 돌고, **웹소켓으로 skylens 서버(코어)와 통신**한다. 이 작업이 SPEC 이 정한 "ws 단일" 규약(§3, §7)과 맞으려면 통신 형태를 이렇게 제한해야 한다.

- 렌더러는 코어 `ws /viewer`(8080) 에 **뷰어처럼 붙어** `splat-chunk` 등을 받는다. 지금 코드가 이미 이것을 지원한다. 현황판 릴레이가 같은 일을 하는 `upstream.ts` 가 선례다(`createUpstream`, 50행~).
- 코어에서 렌더러로 보낼 새 정보(예: 기기 분기 결과, 입력)는 `ViewerMessage`/`ControlMessage` 에 **메시지 종류를 더하는 방식**으로만 전한다(SPEC §7 "렌더러는 그 위에 메시지 종류를 더한다").

## 3. 각 방식에서 필요한 변경과 COMPONENTS 경계

| 항목 | (가) 패키지 | (나) 별도 서비스 |
|---|---|---|
| 새 배포 단위 | 없음. 코어의 `server/` 안 모듈로 들어가거나 클라이언트 번들의 모듈 | 새 프로세스 1개. 단 컴포넌트 표(§1)의 행은 아니라 "코어의 하위 서비스"로 두거나 `skylens_model` 처럼 코어가 부르는 계산 서비스로 설명할 수 있다 |
| `ViewerMessage` 확장 | `protocol.ts` 342행·366행 두 곳(+ 컴파일 검사) | 동일 |
| 코어 허용 제어 kind | `distributor.ts` 125행·`index.ts` 150행 | 동일 |
| 릴레이 캐시·필터 | `boards.ts` 143행, `upstream.ts` 44행(목록으로 자동) | 동일 |
| `ComponentId` | 보통 불필요 | 새 송신자라면 `protocol.ts` 18행에 값 추가 필요할 수 있음 |
| 포트 맵(§7) | 변경 없음 | 새 포트 1개 필요. 포트 맵은 "지시된 구성"의 목록이므로 행 추가가 생긴다 |
| 디렉터리 구조(§6) | 새 하위 디렉터리 1~2개 | 이 저장소 밖이면 변경 없음 |

**결론: COMPONENTS 경계 변경 없음.**

- 메시지 종류 추가는 `shared`(§1 의 공용 계약 라이브러리) 안에서 끝난다. 컴포넌트 책임이 옮겨 가지 않는다. 스케줄 결정권은 코어에 남는다(91행).
- 렌더러는 새 컴포넌트가 아니라 (1단계) 코어가 이미 하는 "배포"(§3.4-4)와 클라이언트가 이미 하는 "그리기"의 **구현 교체**이거나, (2단계) `skylens_model` 처럼 코어가 일을 시키는 **계산 서비스**다. 후자도 코어→서비스 방향이며 코어→뷰어 방향의 역전이 아니다.
- 단, **(나) 로 가면 포트 맵(§7)에 행이 하나 늘 수 있다.** 이것은 "경계"(누가 무엇을 책임지는가)의 변경이 아니라 "구성 목록"의 보충이므로 이 노트는 변경으로 세지 않지만, 감독이 엄격하게 읽어 변경으로 본다면 감독 승인 사안이다. 이 점만 열어 둔다.

### 3.1 감독에게 올릴 쟁점(경계 변경은 아니나 SPEC 문구와 맞닿음)

1. **자산 바이트 전달 경로.** 지금 `SplatChunk.url` 은 HTTP 로 받는 주소이고 ws 에는 메타데이터만 흐른다. 확인한 근거는 `protocol.ts` 185~186행, `statusview` 가 `url` 로 `addSplatScene` 을 부르는 것(`splatScene.ts` 130행). SPEC §3·§7 의 "전송 규약은 웹소켓(TCP) 단일"을 엄격하게 읽으면 경량 자산 조각(수 MB)을 ws 바이너리 프레임으로 보내야 하는데, **지금은 브라우저 쪽이 문자열 프레임만 받는다**(`serverSource.ts` 126행). 선택지는 (i) 자산도 기존처럼 `url` 로 HTTP GET(이미 쓰는 방식이므로 "추가된 규약 없음"으로 볼 수 있는지 감독 판단 필요), (ii) 바이너리 프레임 허용(`serverSource.ts`·`distributor.ts`·`upstream.ts`·`boards.ts` 4곳 변경). 이 노트는 판단하지 않는다.
2. **현황판 저사양 A 경로의 영상 전달.** 영상은 `<video>` 재생이다. 어떤 규약으로 영상이 가는지는 T02.3·T02.11 소관이며, 새 규약이면 SPEC §7 근거가 먼저 필요하다. 여기서는 "코어 `ws` 에 메시지 종류를 더해서는 영상 자체를 보낼 수 없다"는 점만 적는다(`distributor.ts` 가 텍스트 JSON 만 보냄, 145~154행).
3. **현황판 입력 역방향.** 경로 A 는 입력을 서버로 보내야 하는데 릴레이는 보드→코어 방향을 의도적으로 버린다(`boards.ts` 201행, COMPONENTS 189행). 현황판 A 에서 입력을 올리려면 이 설계 결정을 건드려야 한다. **이 부분은 경계 변경 후보다.** 감독 확인이 필요하다. (관제탑은 B 고정이며 코어 직결이라 해당 없음.)

## 4. 장단점 표

| 항목 | (가) 저장소 안 패키지 | (나) 별도 서비스(ws) |
|---|---|---|
| 프로토콜 변경 | 같은 PR 에서 `protocol.ts`·`distributor.ts`·`boards.ts` 와 함께 컴파일 검사로 묶임. 목록 누락이 컴파일 오류(`protocol.ts` 378~380행)로 잡힘 | 양쪽 저장소의 `protocol.ts` 를 맞춰야 한다. 복제하면 3중 복제 사고(`protocol.ts` 356~364행이 기록한 것)가 재발할 수 있다. 공유하려면 패키지 게시 또는 서브모듈 필요 |
| 스택 선택의 자유(T02 의 핵심) | 저장소가 Node+TS 단일. Rust·C++·Python 서버 래스터라이저는 어차피 별 프로세스가 되므로 (가) 안에서도 자식 프로세스·REST 로 분리됨. 즉 (가) 는 TS 로 쓸 수 있는 부분에 한정 | 언어·GPU 드라이버·런타임을 자유롭게 고른다. 헤드리스 GPU 렌더러가 TS 가 아닐 가능성(T02.1·T02.2)과 잘 맞는다 |
| 배포·망 | 코어와 같은 KOREN 내부망 배치(§1). 프로세스 추가 없음 | 새 프로세스 1개의 망 위치·이중화·헬스체크를 정해야 함. 포트 맵 행 추가 가능 |
| 라이선스(SPEC §9) | 코어 저장소(LICENSE 가 별도)에 들어가는 의존성 전체를 점검해야 함 | 의존성이 그 서비스에 격리된다. AGPL·GPL 후보를 쓸 수 없는 규칙은 동일하나 오염 범위가 좁다 |
| 리뷰·소유 | skylens 저장소 소유자(팀) 의 리뷰가 필요. 이 연구 저장소의 감독·작업자 운영과 분리됨 | 연구 저장소가 소유. skylens 쪽 변경은 프로토콜 확장 몇 줄로 최소화 |
| 장애 격리 | 렌더러 오류가 코어를 죽일 수 있다. 코어는 "죽지 않는 것"을 의도적으로 지킨다(`index.ts` 272~275행, `orchestrator.ts` 388~392행 주석 `onError`) | 렌더러가 죽어도 코어·관제탑은 유지. 폴백(SPEC §5)과 결합이 쉽다 |
| 지연·대역폭 | 같은 프로세스 안이면 복사 없음 | 로컬 ws 한 홉 추가. 청크 메타데이터는 작아 영향 미미, 자산 바이트는 `url` 로 갈 때 영향 없음. 바이너리 프레임으로 보내면 직렬화 비용 |
| 테스트 | skylens 의 Playwright 중심 테스트(`src/test/`) 와 같은 틀. CPU 참조 구현 대조(SPEC §4 S9)를 같은 틀에서 하기 어려울 수 있음 | 연구 저장소의 `bench/`·`tests/` 틀 그대로. 이 렌더러의 합성 장면·GPU 없는 [cloud] 검증과 맞음 |
| 빌드·CI | 공용 `package.json` 하나(빌드 시간·의존성 충돌 공유) | 독립 빌드. 단, skylens 와 함께 띄우는 통합 시나리오는 `demo` 런처(§5)에 한 줄을 더해야 함 |
| 경계 변경 위험 | 낮음 | 낮음. 포트 맵 행 추가만 열린 쟁점 |

## 5. 잠정 의견

1. **자산 처리 서버(오프라인 가공, 경로 B 의 서버 절반)**는 코어의 실시간 경로에 올라타지 않는다. 입력은 `splat-chunk.url` 이 가리키는 모델 결과이고 출력은 경량 자산이다. 이 일은 코어를 지나가는 메시지가 아니라 "모델 API 와 같은 종류의 계산 서비스"에 가깝다. **(나) 로 둔다.** 코어 연결 지점은 `orchestrator.ts` 363행 `onChunk` 뒤(또는 앞)에서 렌더러가 "이 구간·수준 자산이 준비됐다"고 알려 주는 메시지 하나(예: 기존 `splat-chunk` 에 경량 자산 `url` 을 더하는 필드, 또는 새 kind)로 충분하다.
2. **클라이언트 경량 래스터라이저(경로 B 의 클라이언트 절반)**는 구조상 `statusview/` 안에 들어가야 한다(`statusViewer.ts` 523행, `splatScene.ts` 125행 교체). 이건 (가) 의 일부다. 별도 저장소로 빼면 `shared/` 의 좌표 변환(`geo.ts`)·스토어·설정 의존이 끊긴다.
3. **서버 GPU 렌더러(2단계, 경로 A)**는 GPU·드라이버·인코더 의존이 크고 TS 가 아닐 가능성이 높다. **(나)**. 코어와는 `ws /viewer` 에 붙는 뷰어로서 `splat-chunk` 를 받는 것까지가 기존 규약 안이다. 입력 역방향과 영상 전달만 §3.1 의 쟁점이다.
4. 1단계는 **(가)+(나) 혼합**이다. 이 분할은 SPEC §1.4 의 "2단계는 1단계 자산 포맷을 그대로 입력으로 쓴다"와도 맞는다. 자산을 코어 안에 묶지 않으므로 2단계 렌더러가 같은 포맷을 쓰기 쉽다.
5. T02.11 에서 라이선스(T02.9)·GPU 없는 환경 검증 범위(T02.10)와 함께 최종 판단한다. 이 노트의 의견은 T02.1~T02.7 의 후보 결과에 따라 바뀔 수 있다. 특히 서버 래스터라이저가 Node 에서 돌 수 있다면 (가) 로 기울 수 있다.

## 6. 이 노트가 확인하지 못한 것

- 코어가 자식 프로세스·네이티브 애드온을 허용하는 운영 환경(KOREN 내부망)인지는 문서에 없어 확인하지 못했다. (COMPONENTS §9 는 "실제 KOREN 회선 위 배치"를 이번 단계에서 하지 않는다고만 적는다.)
- 관제탑의 VWorld 지형·건물 소스(`terrainSource.ts` 989행, `buildingSource.ts` 567행)는 결합 지점(`towerViewer.ts` 19~20행의 타입)까지만 읽었고 내부 로드 로직은 읽지 않았다. 관제탑 경로 B 의 세부 훅은 T03 이후 별도 조사가 필요하다.
- `skylens_model` 의 REST 구현(`app.py`)은 열지 않았다. 코어 쪽 `modelClient.ts` 와 `protocol.ts` §7 만 봤다.
