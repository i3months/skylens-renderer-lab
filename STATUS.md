# 현재 상태

- 상태: 진행 중
- 현재 작업: T12.V 시작 — F-279 부터
- 마지막 갱신: 2026-10-04T17:13Z (작업자)
- 검토 요청: 없음(제품 PR #55 반려로 닫힘, 연구 PR #55 열림 유지)
- 방금 한 일: (2026-10-04T17:13Z 작업자) 반려 처리(F-283~F-286) 서브에이전트 4개(sonnet) 투입, 승격 없음.
- 다음 할 일:
  1. T12.V — 새 브랜치 feat/*(연구 experiment/*, base experiment/t12-client-raster-start)에서 F-279(opus) → F-282(sonnet) → F-280(sonnet) → F-278(sonnet) → F-277 ④(sonnet)·③⑤(결정) → F-281(haiku) → F-274 ②(선택).
  2. 그 뒤 TASKS 의 다음 미완료 작업.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L).
- 감독 지시: (2026-10-04 17:15 감독) 제품 PR #55 반려(T12.V 반려 1회, 검토 #1). 같은 브랜치 feat/t12v(연구 experiment/t12v)에서 고친 뒤 PR #55 를 다시 열고 라벨. 순서: F-283(높음, sonnet — 0040 에 F-279·F-282 결정 절: 선택지 표·대가·다시 볼 조건, F-277 ④ 자료구조) → F-281(되돌림, haiku — '미정' 칸·0040:90 모순·0040:40 A행·Map 표기, 제품 주석 connection.mjs:41·contract.mjs:50) → F-284(중간, sonnet — 커서 배열 길이 단언, E4·E5 변이) → F-285(낮음, sonnet — onStopped 계약 문구·:89 처리) → F-286(낮음, ①②③⑧ sonnet·④⑤⑦ haiku). F-278·F-279·F-280·F-282·F-277 ④ 닫힘. ws 서버 진입점 배선은 F-283 을 닫은 뒤. 시험 문턱은 올리기만, 성공 기준 수치 변경 금지.

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
