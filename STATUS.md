# 현재 상태

- 상태: 검토 대기 — 제품 PR #64(T14.R8), review-requested
- 현재 작업: T14.R7 통과·병합. 다음은 T14.R4 잔여(T14.R8)
- 마지막 갱신: 2026-10-05T02:28Z (작업자)
- 검토 요청: 제품 PR #64, 연구 PR #64
- 방금 한 일: (작업자) T14.R8 완료: F-358~F-362·F-354·F-325·F-321 처리됨-검증대기. 서브에이전트 6개(opus 1, sonnet 3, haiku 2), 승격 없음. npm test 4191 통과·0 실패. 합성 입력만, 실제 체크아웃은 [local]. 에이전트 보고 중 t14-r7.md 0.1346 px 정정은 감독 확인 필요.
- 다음 할 일:
  1. 새 브랜치 feat/t14-r8·experiment/t14-r8(base experiment/t14)에서 F-363(opus, 높음 — 먼저) → F-358(opus) → F-359(opus) → F-364(sonnet) → F-355(sonnet) → F-360(sonnet) → F-361(sonnet) → F-354·F-325(haiku) → F-362(①④ haiku, ②③ sonnet) → F-321. 고친 뒤 제품 PR 에 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 02:20 감독, 02:25 보강) 제품 PR #63(T14.R7) 검토 #2 통과·병합. 병합 뒤 도착한 축 4a 보고로 F-363(높음) 등록 — 감독 직접 재현: 저대비 사인 2 DN 블록 + ±3 DN 잡음 + 이동 0 에서 시드 20개 중 4개 거짓 local, 시드 142542 는 maxMisalignPx 1.41(이전 머리 0). index.mjs:636 잔차 경로에 유의성이 없다. 다음 작업은 F-363 부터, 고치기 전 main 의 드레이프 정합 판정은 저대비·잡음 블록에서 거짓 실패할 수 있음. 열린 높음은 F-363·F-302(사람 판단). 새로 연 중간: F-358(블록 축 평평 판정이 절대 1/12 — 잡음 없는 사인 1·1.5 DN 블록의 실제 2~4 px 이동이 maxMisalignPx 0, 감독 직접 재현; 출력이 axes 로 드러내서 반려 사유는 아님), F-359(재적합 이상치 잔차가 탐색 경계 0.5 에서 숨음), F-360(windingArea O(T²) — 근거리에서도 돈다), F-361(dedupe 풋프린트 경로 시험 없음·minZ 허용차). 다시 엶: F-355(안쪽 벽 −1 고리와 뒤집은 바닥 +1 이 상쇄), F-354(0044 §7 표 대가·다시 볼 조건 빈 칸), F-325(낮음). 처리됨-검증대기 F-328·F-329·F-316·F-319·F-320·F-346~F-351 등은 이번에도 개별 재실행하지 않음(npm test 전체 통과만) — 다음 검토에서 확인. 서브에이전트 작업 트리 오염 없음.

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

- (19:32Z 후발 작업자) 중복 실행으로 중단 — 다른 작업자가 19:29:43Z 에 먼저 T14.R 을 시작함. 내 결과물 없음.
