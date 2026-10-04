# 0035 setArrived 지연 경로, Worker gpu 평면 신뢰 경계, 복호 Worker 큐 기준 시한, 시험 전용 확장

- 상태: 승인
- 날짜: 2026-10-04
- 결정한 사람: 감독(PR #51 검토 #1 때 작업자 구현을 기록·승인). 작업자는 결정 기록을 쓰지 않았다(F-249 ①).
- 관련: FEEDBACK F-248 ④⑤⑥, F-249 ①, F-250, 결정 0034, 제품 PR #51(feat/t12r)

## 맥락
도착 이벤트 폭주 때 setArrived 가 호출마다 selectDrawable 전체를 돌았다(F-248 ④). Worker 가 만든 gpu 평면을 메인에서 값 전수 검사하면 T12.5(long task 0)를 깬다(F-244 ②). 복호 Worker 시한이 호출 시점부터 재여 큐 대기까지 포함했다(F-248 ⑥). 시험 전용 옵션 testHooks·onContextRestored 둘째 인자 error 가 계약·결정에 없었다.

## 결정
1. setArrived(list, {deferResult: true}): 반환 없이 선택을 다음 draw(또는 한도 초과 업로드의 makeRoom)로 미루고, 연속 호출은 마지막 입력으로 합친다. 반환값이 필요한 호출자는 인자 없이 즉시 경로를 쓴다.
2. Worker gpu 평면: 메인은 형식·점 수·origin(= bboxMin, 유한)·평면 이름·타입·길이만 O(1) 로 본다. 값(위치 NaN·normalOct −128) 전수 검사는 하지 않는다. gpu 는 기본 복호 Worker(toGpuPlanes 를 거침)만 만든다는 것을 신뢰 경계로 한다. 주입 decode 가 gpu 를 돌려주면 그 값은 호출자 책임이다.
3. 복호 Worker 시한은 Worker 가 요청을 순서대로 하나씩 처리한다는 가정 아래 '처리 시작(앞 요청 응답 또는 시한)'부터 잰다. 큐 맨 앞 요청만 타이머를 가진다. 취소 메시지는 두지 않는다.
4. testHooks(selectDrawable 계수 등)와 onContextRestored 둘째 인자 error 는 시험 전용 구현 확장으로 계약 주석에만 적고 계약 서명표에는 올리지 않는다.

## 선택지와 대가
- 1: 지연 경로는 discard 를 돌려주지 않아 호출자가 해제 근거를 못 받는다(상주는 makeRoom 한도로만 묶임). 입력 검사가 얕아 잘못된 key 가 다음 draw·업로드에서 'piece' 로 반복된다 — F-250 ① 에서 즉시 검사로 고친다.
- 2: 운영 경로가 기본 Worker 뿐인 동안만 안전하다.
- 3: 맨 앞 요청이 시한으로 버려져도 Worker 는 그 요청을 계속 처리하므로 다음 요청의 시한이 실제 처리 시작보다 일찍 시작된다(연쇄 오탐, F-250 ②). 진짜 멈춘 Worker 에서 k 번째 요청 거부까지 k×timeoutMs.
- 4: testHooks 를 운영에서 넘기면 그리기 규칙을 우회할 수 있다. 막는 장치는 없다.

## 다시 볼 조건
ws 배선(F-238 ④)에서 도착 이벤트를 지연 경로로 넘길 때 discard 해제 규칙을 정한다. 주입 decode 가 운영에서 쓰이면 2 를 값 검사로 바꾼다. 시한 연쇄 오탐이 실측되면 시한 뒤 Worker 재시작(failAll·respawn)으로 바꾼다.

## 감독 승인 (2026-10-04 PR #51 검토 #1)
- 1~4 승인. 감독 확인: set_arrived_batch 변이(지연 경로 stale 제거·즉시 select) 실패, timeout_queue 변이 3종 실패, T12.5 실제 createRenderer 경로 long task 0(감독 6회 반복 0, 대조 727 ms 1개).
- 결정 0034 의 남은 대가 'makeRoom 이 낡은 선택으로 막 완전해진 LOD 퇴출(F-248 ①)' 은 이번 PR 로 대부분 해소. 업로드 중인 key 자신이 LOD 를 완성하는 순서는 남음(F-250 ③).
