# 현재 상태

- 상태: 진행 중
- 현재 작업: T14.R10 (F-359 잔여 opus → F-379·F-380·F-381·F-382·F-374 잔여·F-369 sonnet → F-383 haiku/sonnet)
- 마지막 갱신: 2026-10-05T06:51Z (작업자) drape opus 마무리 중
- 검토 요청: 없음
- 방금 한 일: T14.R9 통합·푸시·PR. 서브에이전트 opus 2·sonnet 2·haiku 1(승격 없음, 도구 격리로 일부는 작업자가 직접 통합). drape 시험 통과 42·todo 4. 미해결: ±2 DN 양성 6/180 정합 통과(F-359 열림), F-369 0044 정리, F-377 외 작업. 전체 npm test 는 PR 시점 실행 중 — 감독이 확인
- 다음 할 일:
  1. 같은 브랜치 feat/t14-r8·experiment/t14-r8 에서 F-359(opus, 높음 — 먼저: 잔차 경로 유의성을 같은 픽셀 짝 검정으로, 실제 1.4~1.5 px 13경우 양성 + F-363 음성 유지) → F-366(opus, F-359 시험 continue 제거·정답 비교) → F-370(sonnet, 벽시계 시험 → 작업량 계수, 병렬 npm test 0 실패) → F-369(sonnet, F-363·색인·상쇄 결정 0044) → F-354(opus, §7 표 5칸·실제 대가) → F-365(sonnet, 절 위치·§8 참조) → F-367(sonnet) → F-371(haiku/sonnet). 고친 뒤 제품 PR #64 다시 열고 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 06:12 감독) 제품 PR #65(T14.R9) 검토 #1 통과·병합(merge commit) — F-359 가 같은 작업에서 반려 3회를 넘겨 범위를 쪼갬: 통과한 부분을 병합하고 남은 높음 F-359(g −0.375 e −1.125 에서 28/180, ±1 DN 포함 — 두 축을 잰 블록의 자기 최소가 예측 0.5 px 안이면 어느 경로에도 안 듦, 축 1a 재현·감독 미재실행)를 TASKS T14.R10(opus)로 뗌. npm test 4242·pass 4226·fail 0·skipped 12·todo 4(감독 직접). 닫음: F-376. 처리됨-검증대기: F-375·F-377·F-378. F-374 높음 → 중간(1.0001 자르기 변이 미포착). 신규: F-379·F-380·F-381·F-382 중간, F-383 낮음. 다음 순서: 새 브랜치 feat/t14-r10·experiment/t14-r10(base experiment/t14) 에서 F-359(opus) → F-379(sonnet) → F-380(sonnet) → F-381(sonnet) → F-382(sonnet) → F-374(sonnet) → F-369(sonnet) → F-383(haiku/sonnet). 그 뒤 T15. 연구 PR #65 는 experiment/t14 로 병합.

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
