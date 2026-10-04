# 현재 상태

<<<<<<< Updated upstream
- 상태: 진행 중 (T14.R5 시작 2026-10-04T23:06Z)
- 현재 작업: (작업자가 정함) 다음 = T14.R4 잔여(T14.R5 브랜치)
- 마지막 갱신: 2026-10-04T23:07Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (작업자) feat/t14-r5 푸시, 서브에이전트 5개 병렬(opus 1: F-338, sonnet 3: F-339·F-341+F-344·F-342, haiku 1: F-340). F-343(haiku)은 병합 뒤.
=======
- 상태: 진행 중 — T11.K 시작
- 현재 작업: T11.J 병합됨. 다음은 T11.K(F-230·F-231 등, T12.1 전 필수) → T12 client-raster 본체
- 마지막 갱신: 2026-10-04T23:12Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (작업자) feat/t14-r5 푸시, 서브에이전트 5개 병렬(opus 1: F-338, sonnet 3: F-339·F-341+F-344·F-342, haiku 1: F-340). F-343(haiku)은 병합 뒤.
>>>>>>> Stashed changes
- 다음 할 일:
  1. T14.R4 잔여 — 새 브랜치 feat/t14-r5·experiment/t14-r5(연구 PR base experiment/t14)에서 F-338(opus) → F-341(sonnet) → F-339(sonnet) → F-340(haiku) → F-343(haiku) → F-342(sonnet) → F-344(sonnet) → F-325 이하 기존 항목(TASKS T14.R4 줄 순서·모델).
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-04 23:15 감독) 제품 PR #60(T14.R4 부분) 검토 #1 통과 — merge commit 으로 병합, 연구 PR #60 은 experiment/t14 로 병합(감독 0044 §7 추가 커밋 7987ce5 포함). 감독 직접: `node tools/lod_seed_sweep.mjs 1-300` 실패 0·최저 0.9789(시드 56 E-far)·감소 0 시드·시점 1건, `node --test server/buildings/lod/*.test.mjs` 32/32·lod.test.mjs 17.5 s. npm test 4126 중 실패 1(frame.test.mjs 시간비 10.9, 부하 중; 단독 3회 통과 → F-342 낮음, 이 PR 무관). F-332~F-337 닫음. 신규 중간 F-338(연쇄 병합 틈 > hideTol)·F-339(분기한정·예산 시험 공백)·F-340(README·노트 수치)·F-341(중간 시점 합계 > 0 단언 복원), 낮음 F-342·F-343·F-344. 결정 0044 §7 에 틈 폭 척도·예산·하한을 감독이 기록. 다음: 위 "다음 할 일" 순서. 서브에이전트 작업 트리마다 git 신원 설정 확인.

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
