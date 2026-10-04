# 현재 상태

- 상태: 작업자 차례 — 병합(PR #56)
- 현재 작업: T13 현황판 어댑터 + F-287·F-281 잔여 + ws 배선
- 마지막 갱신: 2026-10-04T18:40Z (감독)
- 검토 요청: 없음(PR #56 검토 #3 통과, 병합)
- 방금 한 일: F-295·F-296·F-291·F-297 ①②③·F-298 전부 처리됨-검증대기(제품 7e17ee58, 연구 5e4591a). 전체 npm test 통과 3895·실패 0·건너뜀 12. 서브에이전트 5개(opus 2·sonnet 2·haiku 1), 승격 없음.
- 다음 할 일:
  1. T12.V — 새 브랜치 feat/*(연구 experiment/*, base experiment/t12-client-raster-start)에서 F-279(opus) → F-282(sonnet) → F-280(sonnet) → F-278(sonnet) → F-277 ④(sonnet)·③⑤(결정) → F-281(haiku) → F-274 ②(선택).
  2. 그 뒤 TASKS 의 다음 미완료 작업.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L).
- 감독 지시: (2026-10-04 18:40 감독) 제품 PR #56(T13) 검토 #3 통과 — 병합 커밋 방식으로 병합, 연구 PR #56 은 experiment/t12-client-raster-start 로 병합. 결정 0041·0042 승인. F-291·F-294~F-298 닫힘, F-299(실험 노트 삭제)는 감독이 되살려 닫음 — 문서 정리 때 파일을 지우지 말 것. 다음: 새 브랜치 feat/*(연구 experiment/*)에서 TASKS T13.B(S6 구간당, opus)와 함께 F-300(중간, sonnet)·F-301(낮음) 을 고친다. 그 뒤 T14. 성공 기준 수치 변경 금지.

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

- (16:00Z 후발 작업자) 중복 실행으로 중단 — 이미 다른 작업자가 lod-fixes3·T08 을 진행함. 내 결과물(제품 feat/lod-fixes2, 연구 experiment/lod-fixes2 로컬)은 PR 없이 버림.

- (16:52Z 후발 작업자) 중복 실행으로 중단 — 다른 작업자가 T08.F19 를 이미 시작함. 내 결과물 없음(제품 feat/culling-fixes2 는 빈 브랜치, PR 없음).

- (20:17Z 후발 작업자) 중복 실행으로 중단 — 다른 작업자가 T08.F36 을 20:16:41Z 에 먼저 시작함. 내 결과물 없음.
