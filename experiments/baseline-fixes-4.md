# baseline-fixes-4 (T01I)

제품 브랜치 feat/baseline-fixes-4. T01H 검토 잔여 F-047(중간)·F-048(낮음)을 처리했다.

## 하위 작업

| 하위 | 항목 | 모델 | 결과 |
|---|---|---|---|
| T01.26 | F-047 | opus | ws_bytes 에 "받은 수준 최고(rhi)" 추가: 원본 + 추월되지 않은 첫 resend 회차로 오르고, resend 회차의 추월을 rhi 와 비교. [rL2 40, rL0 5] → [40]·[[3]]·resend 5, [L0 1, rL3 40, rL1 5] → levels [[1,4]]·resend 5. 변형 5개 각각 전용 테스트가 실패. ws_bytes 52건 모두 통과 |
| T01.27 | F-048① | sonnet | statm 폴백에서 Number.isFinite 아니면 그 프로세스 제외, "1 abc" → null 테스트 |
| T01.28 | F-048②③④ | haiku | wrapper_delegate 임시 디렉터리 try/finally 정리, basisNote 에 속성 순서 조건, closure 의 sourcemap JSON 파싱 실패 사유를 basis·method 에 기록 |
| (작업자) | F-048② heap, ⑤ | — | heap.test.mjs 임시 디렉터리를 after 훅으로 일괄 삭제(테스트 전후 tmp 항목 수 42 → 42). 이전 노트의 건너뜀 분류·측정 출처 보충 |

서브에이전트 3개(opus 1·sonnet 1·haiku 1), 승격 없음.

## 판단·결정

- F-047 skipped 의 top 은 원본 기준을 유지한다. 재접속 스냅샷은 현재 수준만 다시 보내므로 resend 전용 최고 수준 아래 공백을 "건너뜀"이라 하면 도착하지 않은 것을 메우는 셈이다. 그래서 `[rL2 40, rL0 5]` 의 skipped 는 `[[]]`, `[L2 40, rL0 5]` 는 `[[1,2]]` 이고 구간·수준·resend 바이트는 같다. 코드 주석에 근거를 적었다.
- F-047 ②(d) 테스트: 감독의 예시 입력에서는 final 필드가 있어 seg2 가 미완이므로 segment_total.method 에 'resend 전용' 이 없는 것이 정답이다. 변형(필터 삭제)이 그 문구를 붙이므로 `doesNotMatch` 로 변형을 잡는다.
- F-048④ 로 mapEvidence 가 파싱 실패 시 `sourcemap-parse-error:<사유>` 를 돌려주고 basis 로 남는다. 판정(is_3d)은 이전처럼 코드 표지 폴백이다. 이에 따라 bundle_tower 테스트의 깨진·HTML 맵 두 입력의 기대 basis 를 'heuristic' 에서 파싱 오류 표기로 바꿨다(의도한 동작 변경이며 is_3d 기대값은 그대로). sources 가 빈 맵 등 파싱은 성공하는 경우는 heuristic 그대로.
- F-048⑥: 이번 실험 브랜치에서는 STATUS.md 를 고치지 않았다(main 에서만).

## 검증

- `npm test`(제품 루트): 291건 중 279 통과·0 실패·12 건너뜀. 건너뜀은 실제 트리·SKYLENS_DIR 필요 10건, 대형 RSS 2건(이전과 같음).
- 서브에이전트 보고는 믿지 않고 통합 후 전체를 직접 돌렸다. 처음 돌렸을 때 haiku 의 closure 변경이 소유 경로 밖 bundle_tower 테스트 1건을 깨뜨렸고(위 판단), 고쳐서 0 실패.
- 실제 skylens develop 체크아웃 대조는 이 세션에도 없어 하지 못했다.
- Node 22 에서 `node --test <디렉터리>` 는 모듈 오류라 파일 경로로 돌렸다(`npm test` 는 glob 이라 영향 없음).

## FEEDBACK 처리 표시

F-047·F-048 → 처리됨-검증대기. 닫는 것은 감독.
