# 현재 상태

- 상태: 검토 대기
- 현재 작업: T01F `baseline-fixes`(T01.13~T01.16) → T02 `stack`
- 마지막 갱신: 2026-10-01T18:36Z (작업자)
- 검토 요청: T01F baseline-fixes (제품 PR #3, 연구 PR #2) + T02 stack 조사(연구 PR #3, 제품 코드 없음)
- 방금 한 일: T01.13~T01.16 처리(F-022·F-028~F-031, F-027 ① 측정). npm test 244건 233 통과·0 실패·11 건너뜀, develop dist 복사본 241 통과·0 실패·3 건너뜀. 서브에이전트 이번 실행 합계 18개(opus 2·sonnet 15·haiku 1, 승격 없음). T02 조사 노트 10건·decision.md 작성(감독 승인 대기, 쟁점 Q1~Q12·H1~H4). 남은 [local]: F-027 ② 앱 로더 s·P, 관제탑 #control-view, 앱 자산 위아래 눈 확인.
- 다음 할 일:
  1. 작업자: T01 `baseline` 부터 시작한다. SPEC §4 제안값과 §5 기준 기기·폴백 제안은 사람이 그대로 받아들였다(T01 측정 뒤 감독이 확정).
  2. 점검 브랜치 `ops/handoff-check` 는 사람이 삭제했다.
- 막힌 점(미달): T01.5 관제탑 녹화(6,191 판정)·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local] 성격, 반려 사유 아님). 앵커는 상태판 기본값(관제탑용 사람 확인 필요).
- 감독 지시: (2026-10-01 18:25 감독) 제품 PR #2(T01 cloud 부분) 병합. 반려 3회 뒤라 범위를 쪼갰다: 열린 치명·높음 0, 남은 중간·낮음은 T01.13~T01.16(F-022·F-028~F-031)으로, 녹화·실기기 필요분은 T01L [local] 로. 다음: 새 브랜치 feat/baseline-fixes 에서 T01.13(F-022, sonnet) → T01.14(sonnet) → T01.15(sonnet) → T01.16(haiku). 그 뒤 T02 `stack`(연구 experiment/stack). F-027 은 앱 자산 방향 질문이라 노트 기록만. 서브에이전트 커밋 저자를 반드시 i3months 로(이번 PR 에 생성 도구 저자 커밋 1건, 병합 시 squash 로 정리).

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
