# 0064 실제 소켓 부하(T16.12)

- 상태: 승인(감독 2026-10-06)
- 날짜: 2026-10-06
- 결정한 사람: 작업자(제안)
- 관련: TASKS T16.12, 결정 0061(가), 실험 노트 [experiments/t16-12b.md](../experiments/t16-12b.md)

## 맥락
기존 부하 하네스는 모의 시계를 썼으므로 실제 서버 프로세스의 CPU·RSS 측정값은 없다. T16.12 는 실제 소켓 연결로 제품 ws 서버를 띄우고 프로세스 자원을 측정하는 첫 단계다.

## 선택지
| 선택지 | 장점 | 단점 | 근거(측정·출처) |
|---|---|---|---|
| 모의 시계 하네스만 | 제품·클라이언트 가짜 구현 불필요 | 서버 부하 측정값 없음 | 현재 상태 (0061) |
| 같은 프로세스 소켓 | 빌드·배포 불필요 | JavaScript 이벤트 루프 지연·모듈 로드 등이 섞임, 네트워크 지연 0 | 고려했으나 불가 |
| 자식 프로세스 서버 + /proc 표본 (채택) | 실제 시계·실제 socket, 프로세스 격리·/proc 직접 읽음 | 하네스가 제품 wire protocol 아님, loopback 네트워크 지연 0, 클라우드 컨테이너 CPU 특성 ≠ 대상 하드웨어 | 나머지 옵션보다 실제에 가까우며 비용 명확 |

## 결정
자식 프로세스 서버에서 createWsServer + bench 핸들러로 실제 소켓 연결을 받고, 30명의 클라이언트가 동시에 연결·4개 수준(페이로드 크기 2048/8192/32768/131072 B)을 수신한다. 서버 CPU/RSS 를 실제 시계로 1초 간격 샘플링한다(/proc/<pid>/stat·statm).

## 근거
첫 번째 실제 소켓 부하이므로 간단한 구성으로 시작한다:
- 클라이언트 30명, 기본 기간 10 s: bench/load/socket/run.mjs 의 socketScenario·runSocketLoad 기본값(durationS = 10)
- 4개 수준 payload: bench/load/socket/contract.mjs 의 LEVEL_PAYLOAD_BYTES [2048, 8192, 32768, 131072] B
- createWsServer + 베어 핸들러: 제품 완전 wire protocol 불필요 (비용 절감, 측정 목표에 충분)
- /proc 표본: 실제 커널 자원, CPU 시간·메모리 페이지 수 절대값
- 1초 간격: 부하 패턴 해상도
- 서버 샘플 수 = ceil(durationS): bench/load/socket/run.mjs 의 tickOnRealClock(i = 1..ceil(durationS))

## 대가
- **제품 wire protocol 미반영**: 벤치 핸들러는 자산·압축·메시지 재구성 없음. 실제 클라이언트 부하와 다를 수 있음 (하지만 처음 측정이므로 기준선).
- **Loopback 네트워크**: 실제 WAN/LAN 지연 0. 네트워크 패킷 처리 오버헤드도 적음.
- **클라우드 컨테이너 환경**: CPU 스케줄링·분할은 대상 하드웨어(데스크톱·모바일·서버)와 다를 수 있음. 상대 비교만 유효.

## 다시 볼 조건
- server_main 이 제품 wire 프로토콜을 전체적으로 쓰게 될 때
- T17 에서 실제 서버·실체크아웃 환경의 실측 데이터가 들어올 때
- 이 벤치를 다시 실행해 서버 CPU 최대·RSS 가 이 결정의 측정값과 2배 이상 어긋날 때(임계값은 이 줄이 정의)

## 측정된 수치 (2026-10-06 클라우드 컨테이너, 제품 feat/t16-18 통합본, `node bench/load/socket/run.mjs <outDir> 10`)

### 서버 자원 (실제 시계, /proc/<pid>)
- 클라이언트: 30명, 기간 10 s, 서버 샘플 10개(tS 0.9933 … 9.9932)
- CPU: 첫 초 1.01 %, 최대 4.00 %, 나머지 대부분 0 %
- 메모리 RSS: 59.3 MiB(첫) / 59.3(최대) / 57.7(마지막)

### 첫 프레임 분포 (30 클라이언트, loopback)
- first_frame p95: 0 ms(결과 파일 socket30.json). 통계가 connect 이벤트(핸드셰이크 완료)부터이고 101 과 같은 청크로 첫 페이로드가 오므로 0 으로 나온다. 시도 시각 기준 지연은 bytes 의 latencyMs 에 있다. loopback 이라 S5 판정 자료가 아니며 보고서에도 '(handshake-complete basis, not an S5 value)' 로 표기된다
- 총 5,222,400 B(30 × 174,080), 위반 0

### 위반 및 조건
- 결과 validateResult 통과: YES
- 30 연결 유지: YES(open min 30)
- S8 미측정 — 클라우드 근사만, [local] T17 에서 판정
- 서버 부하: burst-only(접속 직후 약 5 MB 버스트만, 나머지 시간 유휴), 정상상태 아님
- /proc CPU 해상도: 100/(CLK_TCK·wallS)%, 짧은 마지막 칸(durationS 2.01·1.001)에서 0%/수백 %
- 한계: 한 번 실행한 값이며 재현 변동은 보지 않았다. 보고서는 loopback-socket 을 '(cloud approximation), S5/S8 verdict [local]' 로 적는다(제품에서 정정됨).

## 감독 검토 (대기)
실제 측정값 수집 후 검토 예정.

## 감독 승인 (2026-10-06, 제품 PR #101 검토 #1)
- 근거: F-569 확인 기준 충족 — 근거 각 행의 출처(run.mjs runSocketLoad 기본값 clients 30·durationS 10, contract.mjs LEVEL_PAYLOAD_BYTES 합 174,080 B × 30 = 5,222,400 B)가 실제 값과 일치, '= ceil(durationS)' 근거(run.mjs `Math.ceil(durationS)`, server_stats 개수 검사), 노트 p95 = socket30.json 값, 다시 볼 조건 세 개 모두 아직 일어나지 않은 사건, 임계값 '2배' 정의.
- 조건(F-577 에서 정리): 근거 줄 'socketScenario 기본값' 출처를 runSocketLoad·CLI 기본값으로, 측정 머리말에 제품 커밋 2c9de9b9, first_frame p95 0 ms 는 고정값이 아님(재실행에서 0~수 ms)과 CPU·RSS 가 1회 실행값임을 표기.
