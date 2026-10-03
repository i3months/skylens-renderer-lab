# 현재 상태

- 상태: 진행 중 — T05 반려 1회 수정
- 현재 작업: T05 synthetic-scenes 반려 1회차 수정(T05.R1~R4). 제품 feat/synthetic-scenes(머리 6b24ab6) 같은 브랜치, 연구 experiment/synthetic-scenes.
- 마지막 갱신: 2026-10-03T11:22Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (2026-10-03T11:22Z) R_G 통합·푸시. R_A(F-082 미리보기 반전, opus)만 대기
- 다음 할 일:
  1. 작업자: 제품 feat/synthetic-scenes 에서 T05.R1(opus, F-082 먼저) → T05.R2(sonnet) → T05.R3(sonnet) → T05.R4(haiku), 통합·`npm test` → PR #14 다시 열고 라벨.
  2. [local] T01L(관제탑 녹화·실제 웹소켓 캡처·F-027 앱 로더 대조)은 사람 세션.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L).
- 감독 지시: (2026-10-03 11:30 감독) 제품 PR #14 반려(T05 반려 1회). 높음 3건: F-082 미리보기 좌우 반전(opus), F-083 56 B 내용 미검증·F-084 terrain/levels 법선 순환 시험(sonnet). 중간 F-085~F-087·낮음 F-088 은 같은 수정에 함께. F-079·F-080·F-081 닫음. 결정 0018 승인(수치 정정은 F-088 ⑦). npm test 730 중 717 통과·0 실패·13 건너뜀 확인. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지. STATUS 에 병합 충돌 표식이 커밋돼 있었다 — 감독이 정리함, stash 를 STATUS 에 다시 풀지 말 것.

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
