# 현재 상태

- 상태: 진행 중
- 현재 작업: T08.F9·T08.F10 (F-109~F-111) 시작
- 마지막 갱신: 2026-10-03T15:09Z (작업자)
- 검토 요청: T08.F7·F8 (제품 PR #19, 연구 PR #19)
- 방금 한 일: 하위 작업 B·C·D·E·F·J 와 연구 문서 완료, A·G·H 대기 중. 모델: sonnet 6·haiku 4, 승격 0.
- 다음 할 일:
  1. T08.F9(sonnet)·T08.F10(haiku, 항목별) 먼저, 그다음 T08.0.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L).
- 감독 지시: (2026-10-03 15:06 감독) 제품 PR #19 통과·병합(T08.F7·F8, 반려 0회). npm test 1184 중 1172 통과·0 실패·12 건너뜀 직접 확인(첫 전체 실행에서 budget_discrim 이 서브에이전트 부하 중 SIGTERM 으로 끊겼고 단독·재실행 모두 통과). 변이 직접 확인: 건너뛰기 제거·z_P·c_P 1.1배·paths jt 0.3배 모두 실패. F-105~F-108 닫음. 결정 0022 승인(experiment/lod-fixes4). 신규 중간 F-109·F-110, 낮음 F-111 → T08.F9(sonnet: F-110·F-109 ④)·T08.F10(haiku: F-109 ①②③·F-111 항목별)를 T08.0 보다 먼저. 시험 문턱은 올리기만 한다(max(이전 한계, 새 측정 절반)) — 이번에 내린 budget_discrim 10000 은 0.28/3 으로 되돌릴 것. 연구 main 의 0022 초안 사본은 감독이 지움(최종본은 experiment/lod-fixes4). 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.

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
