# 0038 T12.5 long task 판정에서 GL 단계를 분리해 보고한다

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-255, F-244 ②, SPEC T12.5, 실험 노트 experiments/t12s.md

## 맥락
시험의 `start >= t0` 필터를 `start + duration > t0` 로 고쳐(uploadPiece 동기부 포함), 헤드리스 Chromium(SwiftShader 소프트웨어 GL)에서 업로드~첫 draw 전체 구간을 측정하니 유휴 상태에서도 거의 매번 long task 1개(133~419 ms)로 실패했다. 단계로 갈라 보니 남는 long task 는 모두 렌더러 testHooks(onGlUploadStart/onGlUploadEnd/onDrawStart/onDrawEnd, 제품 client/raster/index.mjs 에 다른 작업자가 추가 중)가 찍은 pool.upload 호출 구간과 draw GL 호출 구간에 완전히 든 것이었고, setArrived·복호 응답 처리(checkGpuPlanes·toPlanes·헤더 검사·makeRoom)·uploadPiece 동기부는 0 개였다.

## 선택지
| 선택지 | 장점 | 단점 |
|---|---|---|
| A. 전체 구간 0 단언 유지 | 기준 문구 그대로 | 이 환경에서 상시 실패 — 복호가 메인을 막는지와 무관한 SwiftShader 비용을 섞어 판정 |
| B. GL 단계를 뺀 구간 0 단언 + GL 단계는 단계별로 로그 | 복호·동기 구간 회귀(메인 동기 복호 변이)를 잡음, 기준 수치 0 유지 | GL 단계 long task 는 판정하지 않음 |
| C. 문턱을 올림 | 통과 | 성공 기준 변경 — 금지 |
| D. 시작 시각 귀속(직전 안, 기각) | 전체 구간 GL 단계 배제 | 비-GL 메인 작업(복호 직후 120 ms busy loop 변이)을 감독이 재현한 뒤 가렸다는 맥락 추가 필요 |

## 결정(제안)
B. 성공 기준 수치(long task 0 개)는 바꾸지 않고, 판정 대상을 '복호가 메인 스레드를 막지 않는가'에 해당하는 구간으로 한정한다. 시험이 제외하는 것은 렌더러 testHooks 가 찍은 pool.upload 호출 구간과 draw GL 호출 구간에 완전히 든 long task 뿐이다. setArrived·복호 응답 처리·uploadPiece 동기부는 제외하지 않고 long task 0 을 단언한다. 계측용 await sleep(0) 은 제거했다(측정 경로 불변). GL 단계 long task 는 단계 이름과 함께 출력하며, 실제 GPU 에서의 확인은 [local] 로 남긴다. draw 를 별도 작업으로 나누는 것은 후속 과제.

## 대가
SwiftShader 가 아닌 환경에서 GL 단계가 길어지는 회귀는 이 시험이 잡지 못한다. 직전 안(시작 시각 단계 귀속으로 GL 단계 통째 제외)은 비-GL 메인 작업(복호 직후 120 ms busy loop 변이)을 가렸다는 감독 재현이 있어 기각했다.

## 다시 볼 조건
실제 GPU 의 GL 단계 포함 전체 구간 long task 0 은 TASKS T12.5L [local] 로 확인한다(시험이 SwiftShader 의 GL 비용은 판정하지 않는다). 실제 GPU 환경 측정이 가능해지거나 draw 분할이 구현되면 전체 구간 0 단언으로 되돌린다.

## 성공 기준
성공 기준 수치(long task 0 개)는 바꾸지 않는다.
