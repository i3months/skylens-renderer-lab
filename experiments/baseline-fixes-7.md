# baseline-fixes-7 (T01M)

제품 브랜치 feat/baseline-fixes-7(main 6b0cb9f 위). F-053 보충·보충 2, F-055 ①③④, F-056 ①~⑤(② 감지 뒤 조기 반환은 미해결) 를 다뤘다.
서브에이전트 4개(opus 1·haiku 3), 승격 없음. 소유 경로가 ws_bytes / heap / _common / ref_images 4개뿐이라 10개에 못 미쳤다(같은 파일을 여럿이 고치면 충돌만 늘어 경로 분리를 우선).

## 이전 노트(baseline-fixes-6)가 적지 않은 미처리 항목 (F-056 ⑥)
baseline-fixes-6 은 F-053 본문과 F-054 만 처리했다. 당시 F-053 보충·보충 2(끊긴 같은 수준 뒤 조각·final 의 바이트 판정)와 F-055 ①~④ 는 미처리였고 이번에 다뤘다.

## 하위 작업

| 하위 | 항목 | 모델 | 결과 |
|---|---|---|---|
| T01.35 | F-053 보충·보충 2, F-055 ①, F-056 ① | opus | 사본 규칙 채택(아래). 새 테스트 5개, ws_bytes 62→67 |
| T01.36a | F-055 ③, F-056 ②③④ (heap) | haiku | statm '1 1e3'·'1 0x10'·'1 5.5'·'1 +5' → 제외 테스트, 개행 테스트를 ' 100 5' 로 교체(trim 의존), `rss<0`(도달 불가) → `Number.isSafeInteger`, 정상+음수 혼합·'1 0' 포함 테스트. 정규식 제거·trim 제거·`rss<=0` 변형 각각 실패 |
| T01.36b | F-055 ② (_common) | haiku | **미해결.** 하위 작업은 실제 `buildDetectScript` 가 아닌 복제 계측 스크립트(115줄)를 시험해 병합하지 않았다. 허용된 대안으로 browser.mjs 에 조기 반환이 테스트로 지켜지지 않는다는 주석만 남겼다. 해시 경로 호출 수를 세려면 실제 스크립트에 계측 훅이 필요하다 — 다음 작업 후보(F-055 ② 열어 둠) |
| T01.36c | F-055 ④, F-056 ⑤ (ref_images) | haiku | basisNote 가 colorType 을 typeName 으로 내고 단언(uint8 별칭 → uchar). 10속성 PLY 는 문구 전체·stride 31·propertyOrderCorrect false 단언, propertyOrderCorrect 에 길이 검사 추가 |

## F-053 결정: 사본 규칙
정의: 같은 구간에서 원본 최고 수준과 같은 수준의 원본 프레임이 분할 연속이 끊긴 뒤(resend 또는 다른 수준 프레임이 끼어든 뒤)에 오면 늦게 온 사본이다. 그 프레임과 뒤 같은 수준 조각은 모두 stale 이고, stale 프레임은 분할 연속을 잇지도 시작하지도 않으며(`s.last = -1`), stale 원본의 final 은 완결 근거가 아니다. 완결 판정과 segments 합은 같은 프레임 집합(stale 아닌 원본 + 기존 규칙의 resend 사본)을 근거로 한다.
근거: ① 분할 전송은 같은 수준 연속 프레임이고, 기존 규칙(resend 뒤 같은 수준 원본은 stale)이 이미 바이트를 그렇게 정했다 — 새 메시지 규칙은 이를 뒤집어야 한다. ② 딜레이 패턴은 수준을 교체하며 (구간, 수준)마다 원본은 한 번이다, 새 메시지로 보면 같은 수준을 두 번 더한다. ③ 도착하지 않은 것을 메우지 않는다: 바이트를 세지 않는 사본의 final 로 원본이 끝났다고 채우지 않는다. ④ 추월 판정(rhi 기준)은 그대로.
대가: 완결이 순서에 따라 갈린다. [L2 5, rL2 5, L2 5 final] 미완, [L2 5 final, rL2 5, L2 5] 완결 [5]. 추월 수준의 기존 순서 의존([L1 5, L0 3 final] 미완 / [L0 3 final, L1 5] 완결)과 같은 종류이며 순열 테스트에 손계산 값으로 고정했다.
**이전 결정(baseline-fixes-6 F-053 본문: 끊긴 같은 수준 final 을 완결로 본다)을 뒤집었다.** 그 확인 기준 입력 [L2 5, rL2 5, L2 5 final] 은 이제 완결 [5] 가 아니라 미완이다(F-053 본문 확인 기준과 어긋나므로 감독이 판단해 달라). 순서만 바꾼 입력은 완결.
재현 입력(사본 규칙): [L2 40, rL2 40, L2 7, L2 9] → [40]·stale 2·stale_bytes 16. [L0 10, rL0 10, L0 7, L0 9 final] → 미완. [L2 5, L1 3, L2 5 final] → 미완·stale_bytes 8. 대조군 [L0 10, L0 7, L0 9 final] → 완결 [26].

## 변형 실험 (하위 에이전트 보고, 67개 테스트)
M1 `s.last = f.level` 복원 → 2 실패. M2 `anyFinal`→`anyFinalField` → 1 실패. M3 rhi→hi 계열 변형 → 1~7 실패(겹치지 않는 입력 [L0 5, rL2 5, L1 3 final] 추가로 잡음). 스크립트는 세션 scratchpad 에만 있고 저장소에 없다.

## 한계·미처리
- ref_images: propertyOrderCorrect 에 길이 검사를 추가했기 때문에 `stride===27` → `stride>=27` 변형은 10속성 PLY 에서 같은 문구를 내어 **동치 변형으로 생존**한다(F-056 ⑤ 확인 기준 일부 미달). 두 방어가 겹친 결과로 판단했다.
- `node --test bench/baseline/ws_bytes/`(디렉터리 인자)는 Node v22 에서 MODULE_NOT_FOUND 로 실패한다(기준 커밋 동일). 파일 경로나 `npm test` 로 돌린다.
- 실제 skylens develop 체크아웃 대조는 이번에도 하지 못했다.
- renderer_basis 이탈 없음, 새 의존성 없음, README 변경 없음.
