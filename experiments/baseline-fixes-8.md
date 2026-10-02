# baseline-fixes-8 (T01N)

F-055 ②, F-057 ①~⑦ 처리. 제품 브랜치 feat/baseline-fixes-8 (8b8ea2b, 2e4fe7a, 251c3ca).

## 처리
- F-057 ④: ws_bytes "같은 프레임 집합" 테스트가 케이스별 손계산 리터럴(segment_ids·segments·incomplete bytes)을 단언한다. `s.last = f.level` 변형에서 이 테스트가 실패한다. 다만 기존 사본 규칙 변이 테스트 둘도 같은 변형을 잡아 "단독" 실패는 아니다(확인 기준 ④ 부분 충족, 감독 판단 요청).
- F-057 ⑤: 사본 규칙 근거 주석에 "skylens 송신 코드 미대조 가정"과 [L2 5, L1 3, L2 5 final] 미완이 설계상 대가임을 적었다. summarize 에 copy_frames, run method 에 사본 판정 개수 표기(사본 있을 때만). 테스트 추가.
- F-055 ②: browser.mjs 해시 경로 진입에 테스트 훅(`window.__ffTestHook.hash`, 없으면 무동작)을 넣고 wrapper_delegate 테스트 2개 추가(감지 뒤 50회 호출 해시 진입 0, 감지 전 대조 2회). 조기 반환 두 줄을 지운 사본에서 실패 확인.
- F-057 ①②③: ref_images 주석 정리(길이·순서 일치, 입력 목록 colorType·propertyOrderCorrect, colorType 늘 uchar 명시). 코드 불변.
- F-057 ⑥⑦: heap 합 뒤 isSafeInteger 검사(넘으면 null), 테스트 3개(합 초과 null, 혼합 트리 rssProcs 1·bytes 50×page, '1 0' 경계). `continue`→`return null` 사본에서 실패 확인.

## 검증
npm test: 328 중 통과 316·실패 0·건너뜀 12(실제 skylens 체크아웃 없음 등). 실제 skylens develop 체크아웃 대조는 이번에도 못 함.
참고: 이 환경 node 22 는 `node --test <디렉터리>` 가 실패해 `*.test.mjs` 글롭으로 돌렸다.

## 서브에이전트
sonnet 2·haiku 2, 승격 없음. 범위가 작고 소유 경로가 4곳뿐이라 10개 미만으로 나눴다(지침 이탈).
