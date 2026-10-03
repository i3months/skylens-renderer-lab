# 0025 카메라 구조 오류는 모든 컬링 단계가 'cull:' 로 던지고, 값 퇴화만 빈 결과로 보낸다

- 상태: 제안
- 날짜: 2026-10-03
- 결정한 사람: 작업자(감독 승인 대기)
- 관련: FEEDBACK F-132, 결정 0024 보완, 제품 feat/cull-review-fixes

## 맥락
계약 :7 은 입력 오류를 'cull:' 오류로 던진다고 하는데, 0024 이후 isDegenerateView 가 구조 오류(필드 누락·타입 배열·문자열 수)도 true 로 삼켜 frustum·backface·distance·predict·priority 는 빈 마스크, occlusion·combine 은 던졌다.

## 선택지
| 선택지 | 장점 | 단점 |
|---|---|---|
| A. 구조 오류는 전 단계가 던짐, 값 퇴화만 빈 결과(채택) | 계약 :7 유지, 호출자 버그가 빈 화면으로 숨지 않음 | Float32Array R 을 쓰던 호출자는 이제 던짐 |
| B. 구조 오류도 퇴화로 보고 빈 결과 | 던지지 않음 일관 | 타입 실수가 조용히 빈 결과가 됨, occlusion·combine 동작 변경 |

## 결정
A. degenerate/index.mjs 에 assertCameraShape·degenerateCamera 를 두고 서버 단계 전부가 입구에서 쓴다. 클라이언트 복제본도 같은 규칙. isDegenerateView 자체는 계속 던지지 않는다. 구조 오류 = 객체 아님·width/height 비수·K 가 fx/fy/cx/cy 수를 가진 객체 아님·R 이 수 9개 일반 배열 아님·t 가 수 3개 일반 배열 아님. NaN·0 이하·비회전·과대 해상도는 값 퇴화.

## 대가
typed array R·t 와 문자열 수는 오류다. 호출자는 일반 배열로 변환해야 한다.

## 다시 볼 조건
실제 클라이언트·서버 입력이 typed array 카메라를 쓰는 것이 확인되면 배열형 허용 범위를 재검토.
