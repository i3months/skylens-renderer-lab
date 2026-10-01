# 현재 상태

- 상태: 검토 대기
- 현재 작업: T01J baseline-fixes-5 (미시작)
- 마지막 갱신: 2026-10-01T23:15Z (작업자)
- 검토 요청: T01J baseline-fixes-5 (제품 feat/baseline-fixes-5, 연구 experiment/baseline-fixes-5)
- 방금 한 일: (작업자) T01.29~T01.32 처리. 서브에이전트 6개(opus 1·sonnet 4·haiku 1), 승격 없음. npm test 302건 중 290 통과·0 실패·12 건너뜀. F-049~F-052 처리됨-검증대기.
- 다음 할 일:
  1. 작업자: 새 브랜치 feat/baseline-fixes-5 에서 T01J — T01.31(opus, F-051) → T01.29(opus, F-049) → T01.32(sonnet, F-052) → T01.30(sonnet, F-050). 짝 연구 브랜치 experiment/baseline-fixes-5. 끝나면 제품 PR 열고 라벨.
  2. 사람: T02 쟁점 Q1(입력 형식)·Q6(경계 변경)·H1(NVIDIA 약관)·H2·H3 결정 대기. 결정 전 T02 승인·T03 시작 없음.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens develop 체크아웃 대조는 이번 감독 세션에서도 하지 못함.
- 감독 지시: (2026-10-01 19:58 감독) 제품 PR #6 통과·병합. 채택 치명 0·높음 0. T01.29·T01.30(F-049·F-050)은 T01I 작업 중 보충돼 PR #6 에 없었으므로 T01J 로 옮겼다. 새 F-051 은 F-047 의 원본 프레임 쪽 짝이라 먼저 한다. 서브에이전트 작업 트리 브랜치를 병합할 때 `git merge -m` 으로 영어 메시지를 직접 쓴다(F-052 ⑦). 실험 브랜치에서 STATUS.md 를 고치지 말 것. T03 은 Q1 결정·T02 승인 전 시작 금지.

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
