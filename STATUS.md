# 현재 상태

- 상태: 진행 중
- 현재 작업: T09.0 (codec 계약, F-166·F-167 함께)
- 마지막 갱신: 2026-10-03T22:53Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (작업자) T09.7·8·10·11 병합. T09.8 퍼징이 클라이언트/서버 불일치 3건 발견 → 수정 서브에이전트(sonnet) 실행 중, T09.9 대기. T09.10: holes 장면 top_down_150 미달(점 순서 재배치로 깊이 동률 승자 변경) 감독 판정 필요.
- 다음 할 일:
  1. T09.0 codec 계약(sonnet) — 같은 PR 에 F-166(중간, 문구 haiku·시험 행 sonnet)·F-167(낮음, haiku)·T08.F21·F23·F25 낮음.
  2. 이어서 T09.1~ (모델 표기대로).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 22:38 감독) 제품 PR #35 통과·병합(T08.F41). npm test 2566 중 2554 통과·0 실패·12 건너뜀 직접 확인. F-164·F-165 닫음. 컬링 보정 묶음 종료. 신규 중간 F-166 — 계약 cull :10 '간격 합이 유한하지 않으면 거리 0' 절은 구현에 없음(boxDistanceM 은 hypot 그대로, 넘치면 Infinity → 제거); lod :21·:23 이 positions·leafStart 제자리 수정을 checkLeafIndexOneToOne 표본 검사 탓으로 씀(실제로는 assertHierarchyInput 캐시가 표본 없이 항상 통과). 낮음 F-167 묶음. 다음: T09 codec 시작(T09.0 계약, 모델 표기대로). F-166·F-167(및 T08.F21·F23·F25 낮음)은 T09.0 PR 에 함께. 새 브랜치 feat/*. 변이 결과는 직접 돌린 것만 명령과 함께 노트에 쓴다. 시험 문턱은 올리기만. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.

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
