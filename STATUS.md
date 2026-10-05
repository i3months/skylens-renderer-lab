# 현재 상태

- 상태: 진행 중 — T14.R9 시작
- 현재 작업: T14.R9 (F-359·F-374·F-376 opus, F-377 opus, F-375 sonnet, F-378② haiku, F-369 측정 스크립트 sonnet 병렬)
- 마지막 갱신: 2026-10-05T05:31Z (작업자)
- 검토 요청: 없음 (PR #64 병합 처리됨)
- 방금 한 일: F-377(opus)·F-375(sonnet)·F-378②(직접) 통합·푸시(feat/t14-r9). 드레이프 F-359·374·376 opus 진행 중. 귀무 측정(시드 40): 독립 최대 t 1.644, 채널 상관 2.023(짝 검정 호출 51·54, 거짓 local 0)
- 다음 할 일:
  1. 같은 브랜치 feat/t14-r8·experiment/t14-r8 에서 F-359(opus, 높음 — 먼저: 잔차 경로 유의성을 같은 픽셀 짝 검정으로, 실제 1.4~1.5 px 13경우 양성 + F-363 음성 유지) → F-366(opus, F-359 시험 continue 제거·정답 비교) → F-370(sonnet, 벽시계 시험 → 작업량 계수, 병렬 npm test 0 실패) → F-369(sonnet, F-363·색인·상쇄 결정 0044) → F-354(opus, §7 표 5칸·실제 대가) → F-365(sonnet, 절 위치·§8 참조) → F-367(sonnet) → F-371(haiku/sonnet). 고친 뒤 제품 PR #64 다시 열고 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 04:52 감독) 제품 PR #64(T14.R8) 검토 #4 통과·병합(merge commit) — T14.R8 반려 3회를 넘겨 범위를 쪼갬: 통과한 부분을 병합하고 남은 높음 F-359(±2 DN 실제 1.5 px 거짓 정합 통과, 감독 재현 시드 10개 중 5~7개)·F-374(dy 허용 사후 완화, 짝 검정 경로 축소·PAIRED_K 변경 생존)를 TASKS T14.R9(opus)로 뗌. 닫음: F-372(감독 재현 z 3e16~3e38·x 1e17~3e38 2~30 ms, 0b9ea51 과 같은 그룹)·F-373·F-366. 다시 엶: F-369(0044 의 옛 k=4 문장·PAIRED_K 행·귀무 측정 스크립트 없음). 신규: F-374 높음, F-375·F-376·F-377 중간, F-378 낮음. 다음 순서: 새 브랜치 feat/t14-r9·experiment/t14-r9(base experiment/t14) 에서 F-359(opus, 불확정 블록은 정합 통과를 내지 않음, 시드 30개 단언) → F-374(opus) → F-376(opus) → F-369(sonnet, 귀무 측정 스크립트 커밋) → F-375(sonnet) → F-377(opus) → F-378(haiku/sonnet). 그 뒤 T15. npm test 4232·pass 4219·fail 0·skipped 12·todo 1(감독 직접). 연구 PR #64 는 experiment/t14 로 병합.

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
