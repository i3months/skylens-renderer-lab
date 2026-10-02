# baseline-fixes-9 (T01P)

F-058 ①~⑧ 처리. 제품 브랜치 feat/baseline-fixes-9 (머리 6ce3122), 부모 연구 브랜치 experiment/baseline-fixes-8.

## 처리
- ① heap: PSS 개별 값 isSafeInteger 검사(아니면 그 프로세스는 RSS 폴백), PSS 경로에도 합 검사 추가. 테스트: PSS 6e12 kB 두 프로세스 → null, 개별 unsafe PSS → RSS 폴백. 주의: 합 검사는 PSS·RSS 두 경로에 각각 있다(한 곳으로 합치지 않음).
- ⑥ heap: JSDoc 에 null 조건 넷과 개별 건너뜀/합 폐기 차이를 적고, 테스트 제목을 실제 검증 내용으로 정정.
- ⑧ heap 테스트: 합 초과 값을 `floor(MAX_SAFE_INTEGER / systemPageSize())` 에서 유도(페이지 크기 무관).
- ② ws_bytes: summarize 의 copy_frames 직접 단언 테스트([L2 5, rL2 5, L2 5, L2 5]→2, [L1 3, rL2 4, L1 3]→0, [L2 5, L1 3, L2 5 final]→1·stale 2). 작업자가 직접 돌린 변형 `copyFrames = 1`, `>= s.hi` 각각 1건 실패.
- ③④ ws_bytes: copy_frames 정의·method 에 "미검증 가정에 따른 판정" 단서, 근거 주석을 "가정:" 으로, 뒤늦은 프레임 주석 확장. 줄 번호 참조 없음.
- ⑤ ref_images: `same` 에 colorType === 'uchar' 요구, colorType 이 없으면 색 형을 적지 않음(서브에이전트가 남긴 'uchar rgb' 기본값은 작업자가 'rgb' 로 고치고 테스트 추가). stride 주석 정정, 줄 번호 참조를 planPly 의 rgb-u8 검사로 교체.
- ⑦ _common/browser.mjs: 테스트 훅은 buildDetectScript 의 testMode 옵션일 때만 생성(기본 꺼짐). 조기 반환 두 줄을 각각 지운 변형 → wrapper_delegate 1건씩 실패(작업자 확인).

## 검증
npm test: 332 중 통과 320·실패 0·건너뜀 12. 실제 skylens develop 체크아웃 대조는 이번에도 못 함.

## 서브에이전트
sonnet 1·haiku 3, 승격 없음. 소유 경로 4곳이라 10개 미만으로 나눔(지침 이탈). ref_images 서브에이전트 보고가 문서와 코드 불일치를 남겨 작업자가 보정함.
