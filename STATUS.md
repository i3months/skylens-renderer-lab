# 현재 상태

<<<<<<< Updated upstream
- 상태: 진행 중 — T05 synthetic-scenes 시작
- 중복 실행: 2026-10-03T10:31Z 두 번째 작업자가 중복 실행으로 중단(결과물 없음). 위 상태 줄은 먼저 시작한 작업자(10:29Z)의 것이다.
- 현재 작업: T04 point-io 반려 2회차 수정. 같은 브랜치(제품 feat/point-io, 연구 experiment/point-io)에서 T04.R5(sonnet) → T04.R6(sonnet) → T04.R7(haiku) 후 제품 PR #13 다시 열고 라벨.
- 마지막 갱신: 2026-10-03T10:48Z (작업자, T05 착수)
- 검토 요청: T04 point-io 반려 2회차 수정 (제품 PR #13 다시 엶·review-requested, 연구 PR #13 experiment/point-io)
- 방금 한 일: (2026-10-03T10:40Z) 반려 2회차 R5(sonnet)·R6(sonnet)·R7(haiku) 통합, 승격 없음. 제품 feat/point-io d3a8147, npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 반복 실행 실패 0, 실제 skylens develop 자산 16/16 readPly 성공. F-068·F-075~F-078 처리됨-검증대기. geo.ts 이탈 1건(날짜변경선 ±360)을 노트에 기록.
- 다음 할 일: 반려 2회차 수정(T04.R5~R7) 후 PR #13 다시 열고 라벨. 병합 후 T05. 팬아웃 때 하위 작업 작업 트리가 계약 커밋 위인지 먼저 확인할 것(이번에 main 에서 시작돼 일부 재지정).
  1. 작업자: 제품 main 에서 feat/point-io, 연구 research 에서 experiment/point-io(부모 research). T04.F 를 먼저 커밋 → T04.0 계약 → T04.1~ 서브에이전트(TASKS 모델 표시대로) → 통합·`npm test` → 제품 PR 라벨.
  2. [local] T01L(관제탑 녹화·실제 웹소켓 캡처·F-027 앱 로더 대조)은 사람 세션.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens develop 체크아웃 대조는 아직 못 함.
- 감독 지시: (2026-10-03 10:55 감독) 제품 PR #13 통과·병합(T04 반려 2회 후). F-068·F-075~F-078 닫음(바뀐 테스트 7파일 20회 실패 0, npm test 633 중 621 통과·0 실패·12 건너뜀). 결정 0017(날짜변경선 ±360 이탈) 승인. 다음 T05 synthetic-scenes: 첫 하위 작업 T05.F(F-079·F-080 중간, F-081 낮음) 후 T05.0~ TASKS 모델 표시대로. 제품 main 에서 새 feat/synthetic-scenes, 연구 research 에서 experiment/synthetic-scenes. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.
=======
- 상태: 대기 — 사람이 SPEC 확인 후 작업자 시작
- 현재 작업: T05 synthetic-scenes. 계약 커밋 완료, 하위 작업 팬아웃 중(제품 feat/synthetic-scenes, 연구 experiment/synthetic-scenes).
- 마지막 갱신: 2026-10-03T10:50Z (작업자, 계약 푸시)
- 검토 요청: 없음
- 방금 한 일: (작업자) feat/baseline-fixes-3 생성·푸시, T01.21~T01.24 서브에이전트 4개(opus 2·sonnet 2) 병렬 실행 중, F-045 ⑥ decision.md 정정(experiment/stack), ③ 노트 보충. 하위 작업이 5개뿐인 것은 항목이 소규모·소유 경로 겹침 때문(10개 미만 사유).
- 다음 할 일:
  1. 사람: SPEC §4 제안값, §5 기준 기기 2종·폴백(**사람 확인 필요**) 확인.
  2. 사람: 아래 `환경` 의 남은 정리 1건(점검 브랜치 삭제).
  3. 확인 뒤 이 상태를 `진행 중` 이 아닌 `시작 허락` 으로 바꾸면 작업자가 T01 `baseline` 부터 시작한다.
- 막힌 점: 없음.
- 감독 지시: T01 → T02(감독 승인) → T03 순. T02 승인 전에는 T03 이후를 시작하지 않는다.
>>>>>>> Stashed changes

## 환경 (첫 실행 점검, 2026-10-01T12:42Z)

| 점검 | 결과 | 쓸 수단 |
|---|---|---|
| `gh` CLI PR 생성·라벨 | `gh pr ...` 등 GraphQL 명령은 403 으로 막힘. `gh auth status` 는 토큰 무효로 나오지만 `gh api`(REST)는 동작 | `gh api` REST, 또는 GitHub 도구 |
| PR 생성 | `gh api` 로 제품 PR #1(점검용) 생성 성공, 닫음 | `gh api repos/<소유자>/<저장소>/pulls` |
| PR 본문 흔적 | **환경이 PR 본문 끝에 생성 도구 문구를 자동으로 덧붙임.** `gh api` PATCH 로는 다시 붙고, GitHub 도구의 PR 갱신으로 본문을 다시 쓰면 지워짐(확인함) | PR 생성 직후 본문 확인 → GitHub 도구로 정정 |
| 댓글 본문 흔적 | 미점검. PR 과 같다고 가정 | 댓글 직후 확인 → GitHub 도구로 정정 |
| 라벨 `review-requested` | 제품 저장소에 생성함(`gh api` labels). PR #1 에 붙이기·떼기 성공 | `gh api .../issues/<n>/labels` |
| main 푸시 | 제품·연구 둘 다 성공 | `git push -u origin main` |
| 원격 브랜치 삭제 | `git push --delete`·REST 둘 다 거부됨 | 사람이 삭제: 제품 `ops/handoff-check`(점검용, 내용 무해) |
| 서브에이전트 격리 작업 트리 | 성공. 저장소 안 숨김 디렉터리 아래 별도 작업 트리·별도 브랜치로 생성, 끝나면 자동 정리. 해당 디렉터리는 .gitignore 에 있음 | 서브에이전트 실행 시 작업 트리 격리 지정 |
| 훅 | 두 저장소 `core.hooksPath .githooks` 설정, commit-msg 차단 시험 통과 | 클론마다 설정 |

## 참고 자료 상태

- skylens-stream-lab 의 RULES.md·ops/SUPERVISOR.md·ops/WORKER.md·.githooks 는 공개 저장소의 어느 브랜치·이력에도 없었다. 그 저장소의 SPEC·TASKS·STATUS·FEEDBACK·감독 기록에 드러난 운영 방식(감독·작업자·실험 트리·라벨 핸드오프·FEEDBACK 형식)을 바탕으로 새로 썼다. 원본이 있으면 사람이 대조해 달라.
- skylens 의 docs/COMPONENTS.md 는 main 에 없고 `develop` 브랜치에 있다. 문서들은 `develop` 기준으로 적었다.

- (08:35Z 후발 작업자) 중복 실행으로 중단 — 위 작업자가 먼저 시작함. 결과물 없음.
