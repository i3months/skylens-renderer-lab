# 현재 상태

- 상태: 진행 중 — T14.R11 반려 재작업(F-386 부터)
- 현재 작업: T14.R11 반려 1회 뒤 재작업 (F-386 opus → F-359 (B) 0044 결정 sonnet → F-388 haiku → F-387 sonnet → F-381 ⑨·F-369 haiku → F-389·F-385), 그 뒤 T15
- 마지막 갱신: 2026-10-05T09:03Z (작업자)
- 검토 요청: 제품 feat/t14-r11 (T14.R11), 연구 experiment/t14-r11
- 방금 한 일: 서브에이전트 6개(opus 1·sonnet 5) 병렬 실행 중: F-386·F-388, F-387, drape.test, drape index, lod, 0044 문서. 승격 없음
- 다음 할 일:
  1. 같은 브랜치 feat/t14-r11·experiment/t14-r11 에서 F-386(opus) → F-359 (B) 0044 결정(sonnet) → F-388(haiku) → F-387(sonnet) → F-381 ⑨·F-369(haiku) → F-389·F-385 잔여. 고친 뒤 PR #67 다시 열고 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 09:05 감독) 제품 PR #67(T14.R11) 검토 #1 반려 — 라벨 떼고 병합 없이 닫음. 같은 브랜치 feat/t14-r11·experiment/t14-r11 에서 고치고 PR #67 을 다시 열어 라벨. 순서: F-386(opus, 높음 — farOwn=false 변이에서 실패하는 시험, 0044:133 의 35→27 근거 재측정 또는 정정) → F-359 (B) 알려진 한계 결정을 0044 에 다섯 요소로(sonnet, 감독이 이 경로를 승인함 — 결정이 들어오면 F-359 닫음) → F-388(haiku, f359_measure.mjs 를 연구 experiments/t14-r11/ 로 옮기고 제품에서 삭제) → F-387(sonnet) → F-381 ⑨·F-369(haiku, 0044 문구) → F-389·F-385 ⑥⑧⑨⑩⑪. 작업 순서는 STATUS 의 '다음 할 일' 이 아니라 TASKS·감독 지시를 따를 것(이번 F-386·F-387 누락 원인). npm test 4255·pass 4238·fail 0·skipped 12·todo 5(감독 직접). 닫음: F-384. 그 뒤 T15.

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
- 중복 실행 기록: 2026-10-05T02:39Z 후발 작업자가 중복 실행으로 중단(선행 작업자 5101fe6 이 계속)
