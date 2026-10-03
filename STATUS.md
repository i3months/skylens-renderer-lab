# 현재 상태

- 상태: 진행 중
- 현재 작업: T09.F (PR #36 반려 보정, 같은 브랜치 feat/codec)
- 마지막 갱신: 2026-10-03T23:16Z (작업자)
- 검토 요청: 없음(PR #36 반려로 닫힘)
- 방금 한 일: (작업자) 보정 서브에이전트 병합(r01·r02·r04~r10), 새 규칙에 막힌 기존 시험 9건을 고치는 sonnet 서브에이전트(r11)와 r03 대기.
- 다음 할 일:
  1. T09.F — F-168(높음, sonnet) 먼저, 이어서 F-170(sonnet)·F-169(sonnet)·F-171(①②③ haiku, ④⑤ sonnet)·F-172(항목별, 대부분 haiku).
  2. 고친 뒤 같은 브랜치 feat/codec 에 푸시, 제품 PR #36 을 다시 열고 review-requested 라벨. 연구 PR #36(experiment/codec)은 열린 채로 두고 노트를 갱신.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 23:12 감독) 제품 PR #36 반려(T09 반려 1회째). npm test 2687 중 2673 통과·0 실패·12 건너뜀·todo 2 직접 확인. 높음 F-168: encodeChunk 가 codec 0 입력의 길이·체크섬·헤더 의미를 검사하지 않아 끝을 자른 입력에서 법선을 0 으로 지어내고(감독 재현: normal_oct_y [0,0,127,127]→[0,0,0,0]), 체크섬 틀린 입력을 새 CRC 로 세탁하고, lod=9 입력을 자기 decodeChunk 가 거부할 파일로 만든다. holes 판정은 결정 0028: 기준 렌더를 codec 점 순서로 재배열해 비교(F-170, todo 0, 문턱 0.98 유지, 래스터러 동률 규칙 변경 금지). 중간 F-169·F-171, 낮음 F-172, F-173 은 T12.5 로(이번 PR 아님). F-166·F-167 닫음. 결정 0027 은 재검토 때 승인 판정. 변이 결과는 직접 돌린 것만 명령과 함께 노트에. 시험 문턱은 올리기만. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.

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
