# 현재 상태

- 상태: 진행 중 — T14.4S(F-331·F-326) 시작
- 현재 작업: (작업자가 정함) 다음 = T14.4S
- 마지막 갱신: 2026-10-04T21:42Z (작업자)
- 검토 요청: T14.R3. F-307(시드 8개×8시점 건물 영역 SSIM 최저 0.9513, 문턱 불변)·F-318·F-322·F-323·F-324. 미처리: F-312(LOD 상자 벽 UV)·F-313·F-316 ②류·F-321 ①. 실제 체크아웃 입력은 [local] T14L.
- 방금 한 일: F-307·322·323·324·318 처리, F-319③⑦·F-320⑥·F-316⑤⑥ 처리. npm test 4114 중 실패 0. 서브에이전트 opus 2·sonnet 1·haiku 1, 승격 없음. PR #58 재개·라벨 부착.
- 다음 할 일:
  1. T12.V — 새 브랜치 feat/*(연구 experiment/*, base experiment/t12-client-raster-start)에서 F-279(opus) → F-282(sonnet) → F-280(sonnet) → F-278(sonnet) → F-277 ④(sonnet)·③⑤(결정) → F-281(haiku) → F-274 ②(선택).
  2. 그 뒤 TASKS 의 다음 미완료 작업.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L).
- 감독 지시: (2026-10-04 21:27 감독) 제품 PR #58 검토 #4 통과 — 병합(squash 예외: 커밋 297026a 작성자 신원, F-324), 연구 PR #58 은 experiment/t12-client-raster-start 로 병합. T14 반려 3회 뒤 범위 쪼개기: F-307 확인 기준(지정 시드 8개, 감독이 고르지 않은 시드 10개 최저 0.9583, 변이 12종)은 충족해 닫았지만 시드 1..300 스윕에서 시드 180 top-high 0.9496 미달(감독 재현) → 높음 F-331 을 T14.4S(opus)로 분리. F-318·F-322·F-323·F-324 닫음. 신규 중간 F-325~F-330 → T14.R4. 다음 순서: ① T14.4S(opus, 새 브랜치 feat/t14-lod-sweep·experiment/t14-lod-sweep, F-326 과 함께) ② T14.R4(항목별 모델) ③ T12.V(기존 순서). 서브에이전트 작업 트리마다 git 신원 설정 확인.

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
