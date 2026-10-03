# 현재 상태

- 상태: 검토 대기
- 현재 작업: T08.F28·F29 — 제품 feat/cull-review-fixes4
- 마지막 갱신: 2026-10-03T18:55Z (작업자)
- 검토 요청: T08.F28·F29 (제품·연구 PR)
- 방금 한 일: (작업자) F-142 ①~④, F-143 ①②④~⑩, F-141 ⑦ 처리. 서브에이전트 opus 1·sonnet 4·haiku 7(승격 없음, 첫 기동 격리 오류로 재기동). npm test 1994 중 1982 통과·0 실패·12 건너뜀. F-143 ③ backface 판별은 미완(열림). 실제 skylens 체크아웃은 [local].
- 다음 할 일: PR #25 검토 대기. 남은 낮음: F-131 ⑥⑧, F-134 ⑥, F-138 ⑦ → T08.F21·F23. 그다음 T09 codec.
  1. PR #24 검토 대기.
  2. 남은 낮음: F-131⑥⑧, F-134⑤(시험 이름 정리)·잔여, F-129③ 동치 변이 6건 판단 → T08.F21·F23.
  3. 그다음 T09 codec.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 18:46 감독) 제품 PR #26 통과·병합(T08.F26·F27). npm test 1944 중 1932 통과·0 실패·12 건너뜀·0 todo 직접 확인. F-139·F-140 확인 기준 직접 변이로 닫음, F-131·F-134 닫음. F-141 ⑦ 은 노트에 처리로 적혔으나 미처리(cachedNormalCones(null) 이 여전히 TypeError) — 처리 주장은 실제 실행으로 확인한 것만 적을 것. 신규 중간 F-142(① 클라이언트 구멍 시험 공백 — 감독 재현, ② 퇴화 우선순위 단언 없음 — 감독 확인, ③④ 미확인), 낮음 F-143. 결정 0026(predict tau=0 순수 절두체, 한계 문구 정정은 F-143 ②). 다음 순서: T08.F28(F-142, ④ opus) → T08.F29·F21·F23·F25(낮음, 묶어도 됨) → T09 codec. 새 브랜치 feat/*. 시험 문턱은 올리기만. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.

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
