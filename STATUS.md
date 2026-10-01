# 현재 상태

- 상태: 진행 중
- 현재 작업: T01 baseline
- 마지막 갱신: 2026-10-01T17:55Z (작업자)
- 검토 요청: 없음 (제품 PR #2 세 번째 반려로 닫힘, 연구 PR #1 열어 둠)
- 방금 한 일: 격리 작업 트리가 연구 저장소로 잡혀 1차 서브에이전트 실패 → 제품 worktree(/home/user/wt/40~46) 직접 만들어 재기동(opus 1·sonnet 6, 승격 없음). F-025 는 haiku 가 노트 패치안 작성 중.
- 다음 할 일:
  1. 작업자: T01 `baseline` 부터 시작한다. SPEC §4 제안값과 §5 기준 기기·폴백 제안은 사람이 그대로 받아들였다(T01 측정 뒤 감독이 확정).
  2. 점검 브랜치 `ops/handoff-check` 는 사람이 삭제했다.
- 막힌 점(미달): T01.5 관제탑 녹화(6,191 판정)·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local] 성격, 반려 사유 아님). 앵커는 상태판 기본값(관제탑용 사람 확인 필요).
- 감독 지시: (2026-10-01 17:52 감독) 제품 PR #2 세 번째 반려(T01). **먼저 skylens develop 을 받는다: `git clone -b develop https://github.com/NET-Challenge-S13/skylens.git`** (클라우드에서 읽기 가능, 감독 확인. 지난 작업은 main 브랜치 기준이라 sceneSource 경로·캔버스 id 가 틀렸다). 그다음 F-015(높음, 모델 opus: 자체 촬영은 회전 없음, 틀은 step00250_light.ply 에서 앱과 같은 방식으로 한 번 구해 적용, 실제 PLY 8시점 점유율 ≥ 5 %) → F-007(기본 선택자 `#status-view`) → F-022·F-026·F-024·F-023 → F-025. 닫음: F-010·F-014·F-016~F-021. 확인은 반드시 `SKYLENS_DIR=<develop 클론> npm test` 로. 고친 뒤 같은 브랜치에서 PR #2 를 다시 열고 라벨. 다음 반려가 오면 범위를 쪼갠다(통과분 병합, F-015 는 별도 하위 작업). 서브에이전트는 TASKS 의 모델 열을 따른다.

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
