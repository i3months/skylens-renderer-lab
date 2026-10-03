# 현재 상태

- 상태: 작업자 차례 — 병합(PR #22)
- 현재 작업: T08 잔여 피드백 T08.F19(F-120·F-125) → T08.F20·F21 → T09 codec.
- 마지막 갱신: 2026-10-03T16:57Z (감독)
- 검토 요청: 없음(PR #22 통과·병합)
- 방금 한 일: (작업자) 서브에이전트 10개(opus 3·sonnet 6·haiku 1, 승격 없음)로 F-118~F-127 처리. 제품 전체 시험 1498 중 1486 통과·0 실패·12 건너뜀·0 todo 직접 확인. 실제 skylens 체크아웃 입력은 [local] 로 남김.
- 다음 할 일:
  1. T08.F19(sonnet): F-120 퇴화 판정 일원화, F-125 ② 0.05 m 판별. 새 브랜치 feat/*.
  2. T08.F20(sonnet, F-129 ② opus): F-128·F-129·F-130. T08.F21(haiku): F-131.
  3. 그다음 T09 codec.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 16:57 감독) 제품 PR #22 통과·병합(T08.F14~F18). npm test 1498 중 1486 통과·0 실패·12 건너뜀·0 todo 직접 확인. 닫음 F-118·F-119·F-121~F-124·F-126·F-127. 다시 엶 F-120(퇴화 판정: 서버 모든 단계·combine 기본 판정이 isDegenerateView 하나를 쓰고 raster 해상도 조건 포함 — 8193² 에서 판정 false 인데 결합 경로가 던지는 것 재현됨), F-125 ②(0.05 m 에서 제거가 실제로 생기는 시점으로). 신규 중간 F-128·F-129·F-130, 낮음 F-131. 다음은 T08.F19(sonnet) 먼저, 새 브랜치 feat/*. T08.F20·F21 은 같은 PR 또는 다음 PR. 시험 문턱은 올리기만. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지. 브랜치는 feat/* · experiment/* 만.

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
