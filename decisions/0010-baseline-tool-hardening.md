# 0010 기준값 측정 도구 보강의 기술 선택 (heap 지표·worker 감시·종료코드)

- 상태: 승인
- 날짜: 2026-10-01
- 결정한 사람: 작업자(제안)
- 관련: T01G(T01.17~T01.20), experiments/baseline-fixes-2.md, FEEDBACK F-022·F-033·F-035

## 맥락
이번 보완에서 측정 도구의 동작 규칙 세 가지를 정해야 했다: heap 메모리 지표 이름, 동기 루프 중 부모가 죽었을 때 worker 정리, 실행 대상이 0개일 때의 종료코드.

## 선택지
| 선택지 | 장점 | 단점 | 근거 |
|---|---|---|---|
| 지표 이름 유지(heap.process_rss) | 기존 기준선과 같은 이름 | 값은 PSS 라 의미가 다름, 오해 | F-033 |
| 지표 이름 heap.process_pss | 의미 일치 | 이전 RSS 기준선과 단절 | 채택 |
| worker 정리: disconnect 이벤트만 | 단순 | 동기 루프 중 부모 KILL 에 못 반응 | F-035 재현 |
| worker 정리: Worker thread 가 200 ms 마다 부모 PID 확인 후 프로세스 그룹 KILL | 동기 루프에도 동작(서브에이전트 시험: 부모 KILL 뒤 3 s 안 종료) | PID 재사용·CPU 점유 환경은 보장 못 함 | 채택 |
| 대상 0개 종료코드 0 | 기존 동작 | 전부 건너뜀이 성공으로 보임 | F-035 |
| 대상 0개 종료코드 2 | 실패를 드러냄 | 호출자 변경 | 채택 |

## 결정
지표를 heap.process_pss 로 바꾸고, worker 에 부모 PID 감시 스레드를 두며, 실행 대상 0개는 종료코드 2·`only:[]` 는 오류로 한다.

## 근거
ws_bytes·heap·run_all 테스트(npm test 전체 통과 수치는 PR 본문). 감시 주기·PID 재사용 한계는 추정이 아니라 코드 주석에 적었고 실측하지 않았다.

## 대가
이전 RSS 기준선과 이름이 이어지지 않는다. 감시 스레드가 worker 마다 하나 늘어난다.

## 다시 볼 조건
PID 재사용이나 CPU 점유로 worker 가 남는 사례가 관측되면 PDEATHSIG 래퍼를 재검토한다.

## 감독 승인 (2026-10-01 19:10)
승인. heap.process_pss 이름 변경·워밍업 폐기, worker 감시 스레드, 실행 대상 0개 종료코드 2 를 감독이 확인했다(runAll({only:[]}) throw·memoryMethodText 0 프로세스 null 직접 실행, 부모 SIGKILL 뒤 worker 약 1 s 안 종료 서브에이전트 재현). 0 프로세스 run 테스트가 방어 줄에 닿지 않는 문제는 FEEDBACK F-046 으로 남긴다. 다시 볼 조건은 그대로 둔다.
