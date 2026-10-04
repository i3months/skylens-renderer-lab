# 0038 T12.5 long task 판정에서 GL 단계를 분리해 보고한다

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-255, F-244 ②, SPEC T12.5, 실험 노트 experiments/t12s.md

## 맥락
시험의 `start >= t0` 필터를 고쳐(uploadPiece 동기부 포함) 헤드리스 Chromium(SwiftShader 소프트웨어 GL)에서 업로드~첫 draw 전체 구간을 측정하면 유휴 상태에서도 long task 1개(50~419 ms)가 생겼다. 단계로 갈라 보면 시간은 렌더러 testHooks(onGlUploadStart/End, onDrawStart/End)가 찍은 pool.upload 호출 구간과 draw GL 호출 구간에 있었다. 그러나 Worker 응답 처리 task 하나에 응답 처리→검사·makeRoom→pool.upload→setArrived→setView→draw 가 모두 들어, task 시작은 늘 onGlUploadStart 보다 앞이다. 그래서 'GL 구간에 완전히 든 task 만 제외' 하는 직전 규칙은 성립할 수 없는 죽은 규칙이었고(실측 0회), SwiftShader GL 시간이 그대로 판정에 들어가 변이 없는 원본이 부하에서 흔들렸다(감독 재현).

## 선택지
| 선택지 | 장점 | 단점 |
|---|---|---|
| A. 전체 구간 0 단언 유지 | 기준 문구 그대로 | 이 환경에서 상시 실패 — 복호가 메인을 막는지와 무관한 SwiftShader 비용을 섞어 판정 |
| B. GL 단계를 뺀 구간 0 단언 + GL 단계는 단계별로 로그 | 복호·동기 구간 회귀(메인 동기 복호 변이)를 잡음, 기준 수치 0 유지 | GL 단계 long task 는 판정하지 않음 |
| C. 문턱을 올림 | 통과 | 성공 기준 변경 — 금지 |
| D. 시작 시각 귀속(직전 안, 기각) | 전체 구간 GL 단계 배제 | 비-GL 메인 작업(복호 직후 120 ms busy loop 변이)을 감독이 재현한 뒤 가렸다는 맥락 추가 필요 |

## 결정(제안)
B'. 성공 기준 수치(long task 0 개, 문턱 50 ms)는 바꾸지 않는다. 판정은 task 단위 포함/제외가 아니라 task 마다 비-GL 시간 = duration − (그 task 구간과 GL 구간(pool.upload·draw GL 호출)의 겹친 ms 합)으로 하고, 비-GL 시간이 50 ms 를 넘는 task 를 센다. GL 호출 안의 시간은 단계 이름과 함께 출력만 한다. GL 구간 경계 hook 의 위치(makeRoom 해제 → onGlUploadStart → pool.upload → onGlUploadEnd, currentSelection → onDrawStart)는 단위 시험(client/raster/hook_order.test.mjs)이 고정해, 비-GL 작업이 경계 안으로 숨는 이동을 막는다. Worker 응답에 gpu 평면이 있었음(메인 toGpuPlanes 호출 0회)은 따로 단언한다. 계측용 await sleep(0)은 없다.

## 대가
SwiftShader 가 아닌 환경에서 GL 호출 자체가 길어지는 회귀는 이 시험이 잡지 못한다(GL 호출 안에 120 ms 를 넣는 변이는 설계상 통과). 직전 안(시작 시각 단계 귀속, task 단위 포함/제외)은 비-GL 메인 작업을 가리거나 죽은 규칙이라 기각했다.

## 다시 볼 조건
실제 GPU 의 GL 단계 포함 전체 구간 long task 0 은 TASKS T12.5L [local] 로 확인한다(시험이 SwiftShader 의 GL 비용은 판정하지 않는다). 실제 GPU 환경 측정이 가능해지거나 draw 분할이 구현되면 전체 구간 0 단언으로 되돌린다.

## 성공 기준
성공 기준 수치(long task 0 개)는 바꾸지 않는다.
