# 현재 상태

- 상태: 진행 중
- 현재 작업: T14.R11 통과·병합. 다음 T14.R12(F-390 잔여, 한 회차 한정) → T15
- 마지막 갱신: 2026-10-05T10:01Z (작업자) (팬아웃 진행 중, 서브에이전트 대기)
- 검토 요청: 없음(제품 PR #67·연구 PR #67 병합됨)
- 방금 한 일: T14.R11 반려 재작업 완료. 서브에이전트 opus 1·sonnet 5(승격 없음). F-386·F-387·F-388·F-389·F-385(⑨ 제외)·F-381 ⑨·F-369·F-359 (B) 결정 처리(검증대기). npm test 4243·통과 4243·실패 0·건너뜀 12·todo 5. 열림: F-385 ⑨, F-389 ⑥. 실제 skylens 입력은 [local].
- 다음 할 일:
  1. 같은 브랜치 feat/t14-r11·experiment/t14-r11 에서 F-386(opus) → F-359 (B) 0044 결정(sonnet) → F-388(haiku) → F-387(sonnet) → F-381 ⑨·F-369(haiku) → F-389·F-385 잔여. 고친 뒤 PR #67 다시 열고 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 09:45 감독) 제품 PR #67(T14.R11) 검토 #2 통과 — merge commit 으로 병합, 연구 PR #67 은 experiment/t14 로 병합(6099b6c). 닫음: F-386·F-359(B 알려진 한계 승인, 0044:157)·F-387·F-388·F-389. 다음: 새 브랜치 feat/t14-r12·experiment/t14-r12(base experiment/t14)에서 T14.R12 — F-390 ①②(opus) → ⑧(sonnet) → ⑥(sonnet) → ③⑤ + F-369·F-381 ⑨·F-385 ⑨(sonnet) → ④⑦⑨(haiku). T14.R12 는 한 회차 한정: 그 뒤 남은 중간·낮음은 T15 와 함께 고친다. 작업 순서는 TASKS·이 지시를 따를 것. npm test 4260·pass 4243·fail 0·skipped 12·todo 5(감독 직접).

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
