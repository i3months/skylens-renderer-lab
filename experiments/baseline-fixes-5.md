# baseline-fixes-5 (T01J)

제품 브랜치 feat/baseline-fixes-5(main 003e34b 위). F-049·F-051(중간), F-050·F-052(낮음)을 처리했다.
서브에이전트 6개(opus 1·sonnet 4·haiku 1), 승격 없음. F-049·F-051·F-050② 가 같은 파일(ws_bytes/index.mjs)을 고쳐 소유 경로가 겹치므로 하나의 opus 에이전트에게 맡겼다. 그래서 10개에 못 미쳤다(경로 분리 원칙 우선).

## 하위 작업

| 하위 | 항목 | 모델 | 결과 |
|---|---|---|---|
| T01.29+31 | F-049·F-051·F-050②⑤ | opus | 원본 stale 판정을 받은 수준 최고(rhi) 기준으로: [rL2 40, L0 5] → [40]·[[3]]·stale 1·stale_bytes 5. stale 원본의 final 은 완결을 만들지 않음, anyFinal 은 원본 프레임 final 로만 켬, resend_merged_rounds 는 완결 구간만 셈. 3프레임 회차 [r40,r40,r40] → 1회차, segment_ids Set. 전용 테스트 5개, 변형 5개 모두 실패. ws_bytes 52 → 57건 통과 |
| T01.30a | F-050①⑥(코드)·F-052⑤ | sonnet | float32·uint8 별칭, 법선 형 비교, undefined 표기 테스트, propertyOrderCorrect 한 항으로, 주석 120.89497 정정. 변형 2개 실패. ref_images 56 → 57 통과 |
| T01.30b | F-050③⑤ | sonnet | 브라우저 없이도 도는 `new Function(buildDetectScript)` 문법 테스트, 상태 래퍼 조기 반환. 문법 오류 변형이 PLAYWRIGHT_BROWSERS_PATH=/nonexistent 에서 3/3 exit 1 |
| T01.30c | F-050④·F-052①②③ | sonnet | BOM 제거, 맵 `null` 은 heuristic, 파싱 오류만 있어도 경고, HTML 맵 입력 복원(parse-error 분기 is_3d 변형에서 실패). bundle_status 18 → 20 |
| T01.32a | F-052④⑧ | sonnet | statm 음수 제외, 항상 참 단언 삭제, 정상+깨진 프로세스 혼합 테스트(`continue`→`return null` 변형 실패). heap 14 → 16 |
| T01.32b | F-052⑨ | haiku | 테스트 주석의 번호 삭제, parse error 요약 단언 |
| (작업자) | F-050⑥·F-052⑥ 노트 | — | baseline-fixes-2.md 의 RSS 수치 출처(별도 재실행 124.9·120.1 vs T01.18a 행 123.9·117.7)와 기준 교체 커밋(9e1c2cf) 명시 |

## 판단·한계

- F-051 로 기존 ws_bytes 테스트의 하위 단언 하나(`[rL2 9, L0 4]` → stale 0·[13], "더 높은 수준 resend 뒤의 낮은 수준 원본도 stale 이 아님")를 stale 1·stale_bytes 4·[9] 로 바꿨다. 이 단언은 F-051 이 요구한 동작과 정반대라 동시에 성립할 수 없다. 기준을 낮춘 것이 아니라 감독이 정한 규칙의 반영이며, 감독이 확인해 달라.
- F-049 ②: 형식 오류로 거부하지 않고 "final 필드가 하나라도 있는 녹화에서 resend 전용 구간은 미완"이라는 기존 규칙을 유지했다(없으면 [7,4] 가 되어 확인 기준과 어긋남).
- F-050③ 의 부수 발견: 브라우저가 없을 때 최상위 console.log 안내가 node 테스트 러너 stdout 을 깨뜨려 원래 코드도 8번 중 4번 exit 1 이었다. console.error 로 옮겨 10/10 exit 0.
- F-052⑦: 서브에이전트 브랜치 병합은 `git merge -m` 으로 직접 영어 메시지를 썼다. 서브에이전트 작업 트리 브랜치는 원격에 푸시하지 않았다.
- 실제 skylens develop 체크아웃 대조는 이 세션에도 없어 하지 못했다.

## 검증 (작업자 직접)

- `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm test`: 302건 중 290 통과·0 실패·12 건너뜀(실제 트리·대형 RSS).
- `grep -rn 'F-0[0-9][0-9]' bench tests tools contracts` 0건. 이번 커밋에 생성 도구 문구 0건.

## FEEDBACK 처리 표시

F-049·F-050·F-051·F-052 → 처리됨-검증대기(제품 병합 커밋 091b901). 닫는 것은 감독.
