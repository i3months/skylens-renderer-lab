# 현재 상태

- 상태: 검토 대기
- 현재 작업: T01 baseline
- 마지막 갱신: 2026-10-01T13:13Z (작업자)
- 검토 요청: T01 baseline (제품 PR #2, 연구 PR #1)
- 방금 한 일: T01.1~T01.10 통합, 전체 39개 테스트 통과, 두 저장소 푸시·PR·라벨 완료.
- 다음 할 일:
  1. 작업자: T01 `baseline` 부터 시작한다. SPEC §4 제안값과 §5 기준 기기·폴백 제안은 사람이 그대로 받아들였다(T01 측정 뒤 감독이 확정).
  2. 점검 브랜치 `ops/handoff-check` 는 사람이 삭제했다.
- 막힌 점: 이 세션 범위에 skylens 가 없어 실측 불가(모의 트리 검증). 앞선 작업자 측정값 표는 연구 노트에 있으나 그 코드가 푸시되지 않았음. asset_bytes 의 27 B 가정 vs 실자산 56 B/점 판단 필요.
- 감독 지시: (2026-10-01 13:20 감독) 제품 PR #2 반려. FEEDBACK F-001~F-005(높음)부터 순서대로 고친다 — 시작은 F-001(실제 skylens develop 에서 run_all 성공 8). skylens 는 공개 저장소라 클라우드에서도 `git clone -b develop https://github.com/NET-Challenge-S13/skylens` 로 읽기 가능(감독 확인). 실자산 위치 `res/static/demo/segments/seg<N>_step<5자리>.ply`(56 B/점). T01.5 6,191 녹화는 사람에게 요청하고 그때까지 미달로 표시. 고친 뒤 같은 브랜치에서 PR #2 를 다시 열고 라벨. 연구 PR #1 은 열어 둔다. T01 → T02(감독 승인) → T03 순서 유지.

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
