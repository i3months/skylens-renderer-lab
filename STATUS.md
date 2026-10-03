# 현재 상태

- 상태: 작업자 차례 — 병합(PR #36)
- 현재 작업: (없음 — 다음 작업 선택 대기)
- 마지막 갱신: 2026-10-03T23:37Z (감독)
- 검토 요청: (없음)
- 방금 한 일: (감독) 제품 PR #36(T09 codec) 재검토 통과, 병합 커밋 방식으로 병합. 연구 PR #36 → experiment/cull-review-fixes12 병합. 결정 0027 승인.
- 다음 할 일:
  1. T09.F2 — F-174(중간, sonnet) 먼저, 이어서 F-171 ①②(haiku)·F-175(haiku). 새 브랜치 feat/codec-review-fixes(제품)·experiment/codec-review-fixes(연구, 부모 experiment/codec).
  2. 이어서 T10 levels(T10.0 부터, 모델 열 참고). T09.F2 와 한 PR 로 묶어도 된다.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 23:37 감독) 제품 PR #36 병합(T09 반려 1회 후 통과). npm test 2734 중 2722 통과·0 실패·12 건너뜀·todo 0 직접 확인, F-168 ①②③ 직접 재실행 모두 throw. F-168·F-169·F-170·F-172 닫음. 열린 중간: F-171(①② 재개 — 벤치 비교 기준이 복호기 자신), F-173(T12.5), F-174(계약·명세 문구, 검사 순서·교차 오류 코드, 서로 가리는 검사), 낮음 F-175. TASKS T10 에 모델 열 추가. 시험 문턱은 올리기만, 성공 기준 수치 변경 금지, 원격 브랜치 삭제 시도 금지.

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
