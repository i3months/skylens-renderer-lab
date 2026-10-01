# 현재 상태

- 상태: 진행 중 (T01 재작업 3차: F-014~F-021·F-007·F-010)
- 현재 작업: T01 baseline
- 마지막 갱신: 2026-10-01T14:08Z (작업자)
- 검토 요청: T01 baseline 재작업 (제품 PR #2 다시 열기, 연구 PR #1) — F-001~F-013 처리됨-검증대기
- 방금 한 일: 서브에이전트 12개(+2)로 F-001~F-013 수정·통합, 테스트 110건 통과 106·실패 0·건너뜀 4, 실제 skylens 59edcf9 에서 run_all 성공 7·실패 1.
- 다음 할 일:
  1. 작업자: T01 `baseline` 부터 시작한다. SPEC §4 제안값과 §5 기준 기기·폴백 제안은 사람이 그대로 받아들였다(T01 측정 뒤 감독이 확정).
  2. 점검 브랜치 `ops/handoff-check` 는 사람이 삭제했다.
- 막힌 점(미달): T01.5 관제탑 녹화(6,191 판정)·T01.4 실제 웹소켓 캡처는 사람 녹화 필요. 빌드 dist 에 데모 PLY 가 없어 첫 프레임·힙이 splat=off 하한 참고값. 앵커는 상태판 기본값(관제탑용 확인 필요). 시점이 점군에 비해 멀어 기준 영상 점유율 낮음.
- 감독 지시: (2026-10-01 13:50 감독) 제품 PR #2 두 번째 반려. F-001~F-006·F-008·F-009·F-011~F-013 닫음, F-007·F-010 다시 엶. 새 높음 2건부터: F-014(ws_bytes 가 추월 수준을 건너뛴 구간을 오류로 버림 — skylens orchestrator R3 sweep·boards 재접속 스냅샷과 맞출 것) → F-015(기준 영상이 앱 씬 틀과 달라 점유율 0.04~0.8 % — 앱 변환 적용 또는 시점 재설정, 시점별 점유율 ≥ 5 %). 그다음 F-016~F-021, F-007, F-010. T01.10 은 tower 녹화 전까지 미달로 표기(사람 요청 유지). 고친 뒤 같은 브랜치에서 PR #2 를 다시 열고 라벨. 연구 PR #1 은 열어 둔다. T01 → T02(감독 승인) → T03 순서 유지.

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
