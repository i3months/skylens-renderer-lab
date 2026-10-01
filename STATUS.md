# 현재 상태

- 상태: 진행 중
- 현재 작업: T02.12 `stack` 정정(F-037~F-040) → T01G `baseline-fixes-2`(T01.17~T01.20)
- 마지막 갱신: 2026-10-01T18:51Z (작업자)
- 검토 요청: 없음(제품 PR #3 병합, 연구 PR #2 병합. 연구 PR #3 T02 는 열어 둠 — 조건부, 정정 필요)
- 방금 한 일: 제품 feat/baseline-fixes-2 와 연구 experiment/stack 에서 서브에이전트 12개 병렬 실행 중(opus 2, sonnet 8, haiku 2, 승격 없음).
- 다음 할 일:
  1. 작업자: T02.12(연구 experiment/stack, F-037~F-040) → T01G(제품 feat/baseline-fixes-2, T01.17~T01.20). 감독 지시 참고.
  2. 사람: T02 쟁점 Q1(입력 형식)·Q6(경계 변경)·H1(NVIDIA 약관)·H2·H3 결정 대기.
- 막힌 점(미달): T01.5 관제탑 녹화(6,191 판정)·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local] 성격, 반려 사유 아님). 앵커는 상태판 기본값(관제탑용 사람 확인 필요).
- 감독 지시: (2026-10-01 18:55 감독) 제품 PR #3(T01F) 통과·병합, 연구 PR #2 → research 병합. 채택 치명 0·높음 0. F-028~F-031 닫음, F-022 다시 엶, 새 중간·낮음 F-032~F-036·F-041 은 T01G(T01.17~T01.20)로. T02 는 아직 승인하지 않는다: 연구 PR #3 에 높음 3건(F-037 NVENC nonfree 사실 오류, F-038 클라이언트 추천이 Q1 에 기댐, F-039 별도 프로세스 = RULES §1.4 경계 변경 후보). 1단계 방향(Node 22 + WebGL2/three 최소)은 조건부로 받아들일 수 있으나 Q1(입력 27 B 점 vs 56 B 가우시안)·Q6(경계 변경)은 사람이 정한다(사람에게 알림 보냄). T03 은 Q1 결정과 T02 승인 전 시작 금지. 다음: ① experiment/stack 에서 T02.12(F-037→F-038→F-039→F-040, sonnet), 연구 PR #3 에 커밋. ② 새 브랜치 feat/baseline-fixes-2 에서 T01.17(opus) → T01.18(opus) → T01.19(sonnet) → T01.20(haiku). ③ 둘 다 끝나면 제품 PR(feat/baseline-fixes-2) 을 열고 본문에 연구 PR #3 정정도 함께 검토 요청한다고 적은 뒤 라벨. 서브에이전트 커밋 저자 i3months 확인.

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
