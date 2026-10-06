# 0061 T16 부하 하네스 기술 결정(순수 시뮬레이션·모의 분포·큐 상한·문턱·첫 프레임 정의)

- 상태: 승인
- 날짜: 2026-10-06
- 결정한 사람: 감독 조건부 승인(PR #93 검토 #2) → F-532 확인 뒤 승인
- 관련: TASKS T16.1~T16.10, SPEC S6·S8 및 §4 성공 기준, FEEDBACK F-524, 결정 0060, 제품 contracts/load/harness.mjs, bench/load/**, bench/thresholds/thresholds.json (feat/t16-1 3b37b10)

## 맥락
T16.1~T16.10 하네스가 기록 없이 들어온 기술 결정을 (가)~(카) 로 모아 적는다. 모든 수치는 합성 시뮬레이션이 낸 값이며 실제 서버 부하에서 잰 값이 아니다.

## 선택지와 결정
| 항목 | 선택지 | 결정 | 근거 | 대가 | 다시 볼 조건 |
|---|---|---|---|---|---|
| (가) 부하의 실체 | 소켓 없는 순수 시뮬레이션 / 제품 server/ws 를 띄운 실제 소켓 부하 | 이번 단계는 순수 시뮬레이션(같은 시드·시나리오면 같은 로그, 벽시계·소켓 없음). 실제 소켓 부하는 server/ws 가 클라우드에서도 띄울 수 있으므로 후속 [cloud] 작업 T16.12(실제 server/ws 대상 30 클라이언트 소켓 부하)로 TASKS 에 올릴 것을 제안한다(TASKS.md 는 이 변경에서 고치지 않는다. 감독이 반영한다). T16.12 [cloud] 는 근사이고, S5·S8 확정은 [local](SPEC §4) 다 | 결정적이라 CI 에서 빠르고 회귀 비교가 가능하다. 하네스 계약·보고서·문턱 파일을 소켓 없이 먼저 굳힐 수 있다 | 시뮬레이션이 증명하지 못하는 것: 실제 서버 CPU·메모리 사용, 실제 소켓 대역·혼잡·재전송, 이벤트 루프 지연, 30 연결 동시 유지의 실제 동작. 이 단계의 SPEC S5·S8 통과 표시는 합성 값이다(S6 은 판정 지표가 없어 통과 표시 자체가 없다, (카) 참조) | T16.12 착수 시. 실서버 연결(T01L 계열)이나 문턱 조정 전에 반드시 |
| (나) 모의 분포 상수 | 제품 크기(27 B/점·구간 크기)에서 유도 / 임의 상수 | 임의 상수: 접속 지터 200 ms, 첫 수준 평균 300 ms(×(0.5+U)), 수준 간격 평균 400 ms, 수준 크기 [4000, 12000, 40000, 120000] B(×(0.8+0.4U)), 기본 지연 20+U(0,80) ms | 정직하게: 이 값들은 27 B/점이나 구간 크기에서 유도하지 않았다. 하네스 배관(지터·순서·분포)을 시험하려는 자리표시 값이다. 현재 first_frame p95 ≈ 0.5 s(steady 503·burst 526 ms)는 접속 후 첫 수준 지연 150~450 ms 에 지연 20~100 ms 를 더한 상한(약 550 ms)에서 나온 값이지 서버 성능이 아니다 | p95 ≈ 0.5 s 는 분포 가정의 산물이어서 3 s 문턱 대비 여유가 크게 보인다(실제 성능 여유가 아니다). 수준 크기 합계가 약 176 KB 로 SPEC 구간당 3 MB 와도 무관하다 | 실제 구간 크기·네트워크 지연이 측정될 때(T16.12·T01L), 또는 문턱을 조이려 할 때 |
| (다) QUEUE_LIMIT_BYTES | 262144(256 KiB) / 더 작음 / 무제한 | 262144. 정의는 제품 bench/load/slow_link/index.mjs:7 `export const QUEUE_LIMIT_BYTES = 262144;` (같은 값이 다른 파일에서 쓰이는 곳은 제품 server/cull/occlusion 의 무관한 상수이며 이 결정과 별개다) | 페이로드 최대 40960 B 의 약 6배라 한 번에 여러 개를 쌓을 수 있고, 125000 B/s 회선에서 약 2 s 분량이라 역압이 걸리는 지점을 시험할 수 있다. 값 자체의 유도는 없는 선택이다 | 상한에 닿으면 생산자가 대기하며, 종료 시각까지 전달되지 않은 페이로드는 버린다(slow_link.test 의 504828 B 사례). 값을 바꾸면 slow_link 지연·bytes 가 모두 달라진다 | 실제 server/ws 의 송신 큐 상한이 정해지거나 T16.12 에서 실제 역압이 관측될 때 |
| (라) linkBytesPerS 해석 | 클라이언트별 독립 회선 / 30 클라이언트가 나눠 쓰는 공유 회선 | 클라이언트별 독립 회선(클라이언트마다 FIFO 큐 하나, 각자 linkBytesPerS 로 배출). clients/index.mjs 의 slow_link 지연 경로(clients/index.mjs:32, 큐 없는 두 번째 모형)는 시험 전용이다 | 한 클라이언트의 느린 회선을 시험하는 것이 목적이고, 클라이언트 간 간섭이 없으면 시드·순서에 결과가 덜 흔들린다 | 서버 쪽 총 대역 포화는 표현하지 못한다. 30 × 125000 = 3.75 MB/s 가 서버에서 동시에 나가는 상황은 합쳐서만 보인다. 공유 회선이면 큐·지연이 훨씬 커진다 | 서버 출구 대역이 병목인지 알아야 할 때(T16.12) |
| (마) 문턱 | load.first_frame_p95 max 3000 / 모의 분포에 맞춘 더 낮은 값 / 문턱 없음. slow_link 면제 여부 | 3000 ms 유지, slow_link 는 문턱 검사에서 제외(값만 보고). 3000 은 SPEC S5 성공 기준 값이라 바꾸지 않는다. 이 문턱은 모의 분포의 회귀 문턱일 뿐 SPEC 만족의 증거가 아니다 | SPEC S5 는 회선 조건이 없다. 대역이 제한된 slow_link 는 명시된 조건이 아니므로 작업자 판단으로 판정을 제외한다 | 모의 p95 가 0.5 s 라 이 문턱은 사실상 분포·하네스가 크게 망가질 때만 걸린다(검출력 약함). slow_link 는 지연 폭주를 문턱으로 못 잡는다 | (나)의 값이 바뀔 때, 또는 실제 측정이 생기면 문턱 값(3000 은 SPEC 변경 없이는 불변)과 별도로 회귀 문턱을 둘지 |
| (바) 첫 프레임 정의 | clients 는 수준 0 도착, slow_link 는 첫 페이로드 도착(서로 달랐음) / 하나로 통일 | 하나로 통일: 수준 0 에 해당하는 첫 페이로드가 도착해 그려진 시각 − 접속 시각. clients 는 level 0 도착, slow_link 는 첫 페이로드(수준 구분이 없어 그것이 수준 0 몫)의 도착으로 같은 정의를 구현한다. 정의는 contracts/load/harness.mjs 머리 주석에 한 번만 적는다 | 같은 metric 이름(load.first_frame_p95)이 시나리오마다 다른 뜻이면 비교가 되지 않는다 | slow_link 는 수준 개념이 없어 첫 페이로드로 대신한 것이라 엄밀히 같은 사건이 아니다. 둘 다 합성이다 | slow_link 에 수준 상태가 생길 때, 그림 그리기 지연(렌더 시간)을 모형에 넣을 때 |
| (사) 백분위·미도달 | 최근접 순위(nearest-rank) / 선형 보간. 미도달: 제외 / 0 / Infinity | 최근접 순위(ceil(p·n)번째). 첫 프레임이 없거나 접속이 없는 클라이언트는 제외하지 않고 Infinity 로 두어 가장 위에 정렬한다. p95 가 비유한이면 위반 | 보간은 없는 표본값을 만들어낸다. 미도달을 빼거나 0 으로 채우면 실패가 좋은 값으로 가려진다 | 30 명에서 p95 는 29번째 표본(ceil(28.5)=29)이라 한 명이 Infinity 여도 p95 는 유한하고, 두 명이 Infinity 여야 p95 가 Infinity 가 된다. 한 명의 미도달은 p95 에 안 보이므로 perClientMs 로 따로 봐야 한다 | 클라이언트 수가 바뀌거나(MAX_CLIENTS) 꼬리 지표(p99·최댓값)가 필요할 때 |
| (아) scenario.path | 경로를 읽어 위치 의존 부하 / 읽지 않음 | 어떤 하네스도 읽지 않는다(경로 무관 부하). 계약(0060)은 경로를 검증만 한다 | 시점 이동에 따른 조각 요청은 T15.7 계획기 영역이고, 하네스 이번 단계는 접속·수준 도착·대역만 모사한다 | 경로를 바꿔도 결과가 변하지 않는다. 이동량·가시 타일 의존 부하(구간 경계, 요청 급증)는 시험되지 않는다 | 경로 의존 요청 모형(T15.7 연결)이나 T16.12 에서 실제 이동이 요청을 만들 때 |
| (자) 시나리오 값·시드 | 다른 값 / 이 값 | steady30·burst30·slow30: clients 30, durationS 60, 경로는 (0,0,100)→(150,0,100) 30 s, burstLevels 4, linkBytesPerS 125000(1 Mbps). SEED 1 고정 | 30 은 SPEC S8 접속 목표(0060 MAX_CLIENTS). 60 s·경로는 하네스 한 번에 도는 크기. 125000 B/s 는 SPEC 의 8 Mbps 보다 한참 느린 값으로 역압이 걸리게 고른 값 | 시드 하나라 분포 꼬리 한 표본만 본다. 값은 근거 없이 정했다. 시드를 바꾸면 p95 가 조금 달라질 수 있다 | 다른 시드 여러 개로 안정성을 볼 때, 접속 목표·회선 대역이 바뀔 때 |
| (차) burst 표시 | 하네스가 최고 수준을 직접 계산 / 제품 수준 상태 기계 사용 | 제품 client/levels 의 createLevelMachine 에 도착 level 이벤트를 먹여 표시 로그를 만들고, 하네스는 최고 수준을 따로 계산하지 않는다. 불변식(도착한 수준만, 도착한 최고, 낮은 수준 뒤따름 없음)은 별도로 검사한다 | 하네스가 같은 규칙을 다시 구현하면 제품 규칙과 어긋나도 시험이 통과한다 | 제품 상태 기계가 바뀌면 이 시험도 함께 바뀐다(의도한 결합). 버스트는 수준 0..burstLevels-1 이 한꺼번에 도착하는 모형이며, 묶음 안 지연은 클라이언트 묶음 지연의 최댓값(clients/index.mjs:41-42)을 쓴다. 같은 순간(같은 tMs) 도착은 하네스 정책으로 높은 수준부터 상태 기계에 넣는다(낮은 수준이 추월당해 건너뛰어지는 규약과 같다). 오름차순으로 넣으면 수준마다 표시가 남는 것이 되어 의미가 다르다 | 수준 상태 기계 시그니처가 바뀔 때, 일부 수준만 겹치는 도착 패턴이 필요할 때 |
| (카) 미전달 바이트·대역 정의 | 종료 시 미전달분을 버림 / undeliveredBytes 로 보고. 대역: SPEC(초기 + 구간당) / 전체 합 | slow_link 는 종료 시각까지 전달되지 않고 큐에 남은 바이트를 undeliveredBytes 로 보고한다(전달은 지연될 뿐 바이트가 만들어지지는 않는다. 사라지는 경우는 하나: 종료 시각에 역압 대기 중이던 페이로드는 버려지고 dropped 로 센다 — slow_link/index.mjs:41 `dropped += size`). 하네스가 기록하는 load.bandwidth_total 은 전달 완료 바이트의 시나리오 전체 합(60 s), bandwidth_peak 는 1 초 칸 최댓값(B) 이다 | SPEC S6 은 초기(접속~첫 프레임) ≤ 15 MB + 구간당(4수준 전체) ≤ 3 MB 로 정의한다. 기록 값은 그 정의와 다르다(시간 합이고 구간별로 나누지 않음). 예: slow30 total ≈ 201 MB 는 60 s·30명 합이라 SPEC 구간당 3 MB 와 직접 비교되지 않는다 | 기록 값을 SPEC S6 의 통과·미달 근거로 쓰면 안 된다. 초기·구간당 분리 지표가 없으면 S6 판정은 비어 있다. 미전달분 보고가 없으면 종료 직전 큐가 쌓여도 안 보인다 | 필수 metric 이름을 정하는 T16.8·T16.9(0060)에서 초기·구간당 지표를 추가할 때 |

## 추가 기록(PR #94 검토 #1 정정)
- MAX_DURATION_S = 3600: 계약 contracts/load/index.mjs 의 durationS 상한. 하네스가 초마다 서버 표본·이벤트를 만들어 한 시나리오 메모리가 durationS×clients 에 비례하므로, 모의가 폭주하지 않게 1 시간으로 막는다. 근거는 크기 한계일 뿐 SPEC 값이 아니며, 3600 초과 시나리오가 필요하면 상한만 올린다(0060 은 durationS > 0 만 정했다).
- 서버 표본은 하네스 안에서 만든 모의 값이다: 모의 CPU(cpuPct)는 0 으로 고정이라 실제 서버 CPU 를 말해 주지 않는다. 실제 값은 T16.12·[local].
- renderer_basis 에서 벗어난 점: 없음.

## 대가(요약)
- 모든 값이 합성이고 실제 성능과 무관하다. 보고서·문턱 통과는 하네스 배관이 맞다는 뜻이다.
- (나)(자) 의 값은 근거 없는 상수라 바뀔 수 있고, 바뀌면 (마) 의 p95·bytes 가 달라진다.
- T16.12 를 올리지 않으면 실제 소켓 부하 검증이 비게 된다.
- S6(초기 15 MB, 구간당 3 MB) 의 판정 지표가 없다. T16.8·T16.9 에서 추가할 계획.

## 다시 볼 조건
- T16.12(실제 server/ws 대상 30 클라이언트 소켓 부하)를 TASKS 에 올릴 때: (가)(나)(다)(라) 를 함께 본다.
- SPEC S6·S8 성공 기준이나 접속 상한이 바뀔 때: (마)(자)(카).
- 수준 상태 기계(createLevelMachine)나 수준 수가 바뀔 때: (차).

## 추가 기록 (T16.15)

| 항목 | 결정 | 근거 | 대가 | 다시 볼 조건 |
|---|---|---|---|---|
| (가) 서버 표본 개수 | 매초 한 번 tick 하되 ceil(durationS) 번: 첫 tick 을 0 에 둠, …, tick_{n-1}=durationS·1000 ms. 0.5 s 는 1개(tS 0.5), 1.5 s 는 2개(tS 1.0, 1.5) | Math.floor(durationS) 사용 시 0.5 s 같은 durationS<1 은 샘플 0개로 서버 CPU·메모리 증거 없이 통과. 최소 증거 1개는 필요하고, 종료 시각 정확히 durationS·1000 에서 한 번 샘플하는 것이 정의 일관성 | 기존 시험의 기대값 0개를 1개로 바뀜 | T16.12 실서버 측정에서 표본 시계가 벽시계(실제)일 때 |
| (나) 통계 시계 인자 | createStatsSampler 의 clock 인자는 필수이며 'simulated' 또는 'real'. 모의는 기본 'simulated' 클록. cpuStub 옵션을 받아 모의 CPU 값을 cpuPct null 또는 cpuSource 'stub' 으로 표시(상수 0 이 측정값처럼 보이는 것을 방지) | run.mjs 에서 statsClock 주입 시 now 를 항상 주면 검사를 우회하고, 실제 clock 인자 없이 serverSamples 에 mock 값이 cpuPct 0 으로 기록되어 SPEC 조건 미충족이 눈에 띄지 않음 | contracts/load/harness.mjs 서명 수정, 기본 호출의 cpuSource 지정 추가 | T16.12 에서 clock:'real' 지정 여부 확인 시 |
| (다) 대역: 종료 시각 bucket | 종료 시각 정확히 tMs = durationS·1000 인 이벤트는 bucket 종료 칸 번호 durationS 에 들어가(창 밖 가장 마지막 칸), 아무 값도 없으면 정의상 최후 유효 bucket. 유효하지 않은 tMs(음수, NaN, Infinity, 정수 아님)는 throw 대신 위반 문구로 별도 보고 함수 에 들어가거나 무시(전달 없음) | 1e6 bucket 시험은 메모리 3600 bucket 으로 줄여 처리했다. 그 시험에 'no argument-count-limit' 주석이 있지만 3600 bucket 에서는 그 주석의 의도를 보호하는 고용량 시험이 없다. 파이프라인 시간 상 1e6 를 새 helper 시험으로 두는 대신 주석을 삭제했다 | 1e6 bucket 시험 삭제; validateEvent 에 tMs 유효성 검사 추가(F-539) | 실제 구간 크기·네트워크 지연이 측정될 때(T16.12) |
| (라) 주입 로그 검증 | runScenario 진입 시 주입받은 events 배열을 validateEvent(e, scenario) 로 검사해 누락·중복·범위 밖 값을 위반 문구로. T16.12 가 실서버 웹소켓 로그를 이 경로로 넣을 때 나쁜 데이터가 조용히 통과하지 않도록 함. 기존 SCENARIOS 위반 0 유지 | events 배열이 모의 하네스에서 만들어질 때는 검증이 중복처럼 보이지만, T16.12 에서 server/ws 의 실제 로그를 건네받을 때 필요한 방어. 기존 시험이 주입 로그 검증을 기대하지 않았으므로 새 검사가 기존 통과 시험 위반을 추가하지 않는지 확인 필요 | 기존 SCENARIOS 시험 통과 유지, T16.12 실서버 로그 검증 추가 | T16.12 실서버 웹소켓 로그를 runScenario 에 주입할 때 반드시 |

완료: T16.15 에서 (가)~(라) 의 변경을 적용하고, 각 재현 기준을 만족했는지 확인한다. (다) 의 1e6 bucket 시험 삭제 대신 helper 시험을 추가하는 것과 그 비용은 다시 볼 조건에서 판단한다.

## 추가 기록 정정 (F-545)

| 항목 | 정정 내용 | 근거 |
|---|---|---|
| (가) tick 일정 | 구현 run.mjs 선 121: `for (let i = 1; i <= expectedSamples; i++) { tickMs = Math.min(i, scenario.durationS) * 1000; sampler.tick(); }`. 따라서 ticks 는 i=1..ceil(durationS) 에서 min(i, durationS)*1000 ms 에 일어난다(old wording: '첫 tick 을 0 에 둠'은 사용되지 않음). 0.5 s: ticks [0.5s], 1.5 s: ticks [1s, 1.5s]. | server_stats/index.mjs 는 보고서 정의와 무관하게 tS를 계산하고, 모의 루프가 tick 개수와 시각을 정한다 |
| (나) statsClock 규칙 | 구현 server_stats/index.mjs: createStatsSampler 는 clock 인자(필수, 'simulated'\|'real')를 받는다. now 와 cpuUsage 둘 다 제공하거나 둘 다 제공하지 않아야 하며, clock:'real' 이면 둘 다 필수(둘 중 하나만 있으면 throw). cpuSource 는 'simulated'\|'measured'\|'stub' 중 하나(measured 는 clock:'real' 필요, simulated 는 clock:'simulated' 필요). run.mjs 선 44-58: samplerOptions 는 statsClock 에 unknown key 가 있으면 throw 한다. checkServerSamples(samples, {durationS}) 는 real-clock 표본을 검증하고, cpuSource 'measured' 와 clock 불일치를 위반으로 보고한다. | clock 이 필수이므로 statsClock={now:f, cpuUsage:f} 만으로는 측정 clock 을 명시하지 못한다. old wording: "실제 clock 인자 없이"는 부정확함 |
| (다) 대역 종료 시각 bucket | 구현 bandwidth/index.mjs 선 26, 41: lastBucket = ceil(durationS)-1; k = min(floor(e.tMs/1000), lastBucket). 따라서 tMs === durationS*1000 인 이벤트는 bucket ceil(durationS)-1 에 folding 된다(old wording: 'bucket 종료 칸 번호 durationS'는 틀림, '창 밖'도 틀림, '그 시험에 있지만 3600 bucket 에서는...' 및 '별도 보고 함수' 함수는 존재하지 않음). 비정수 tMs 는 invalid 로 보고되지만 위반 문구가 아니라 invalid 배열에 들어간다. bandwidthViolations 는 '`bytes event i: bad tMs`' 문구를 만든다. | 마지막 bucket 은 window 안에 있고, 칸 밖이 아니다. 비정수/음수 tMs 검증은 run_all/run.mjs 선 76-78 checkEventLog → validateEvent 에서 이루어지며, 한 개의 나쁜 이벤트가 모든 통계를 비운다 |
| (라) 주입 로그 검증 | 구현 event_log.mjs: checkEventLog(injected, clients) 를 contracts/load/harness.mjs 의 validateEvent 로 감싼다. run.mjs 선 75-79: checkEventLog 결과가 0 이 아니면 모든 통계를 건너뛴다. 검증 entry 는 checkEventLog 이고, 구현은 각 stats 함수 내부에도 있다(누락/중복은 각각 검출). old wording: 'runScenario 진입 시'와 '기존 SCENARIOS 위반 0 유지' 는 맞지만, 검증 이후 비용은 '한 개 bad event 가 모든 stats 를 비운다'이다 | event_log.mjs 는 validateEvent 를 import 하고, 각 stats 함수는 자신의 invalid/missing 을 따로 본다 |

추가 주석: (다) 의 old wording 에서 '1e6 bucket 시험'·'3600 bucket'·'주석 삭제'는 F-545 가 아닌 실제 개발 경과이지만, 정정 문맥에서 old wording 으로만 인용된다. helper-test 조건 재검토: (나) 의 statsClock={clock, ...} 필수화와 (라) 의 checkEventLog 추가는 기존 호출 site 검증을 요구하므로, 재검토 범위를 helper 시험(contracts/load/harness.test.mjs, bench/load/*/test.mjs 등)과 run_all main 호출로 제한한다(runScenario 진입 검증은 이미 통과).
