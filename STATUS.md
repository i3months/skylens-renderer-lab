# 현재 상태

- 상태: 검토 대기
- 현재 작업: T13.Y(F-608 낮음 묶음) 검토 요청
- 마지막 갱신: 2026-10-07T03:31Z (작업자, T13.Y 검토 요청)
- 방금 한 일: T13.W 완료. 서브에이전트 6개(sonnet 3·haiku 3, 승격 없음). F-601②·F-603·F-604·F-605①~⑤ 반영(처리됨-검증대기). npm test tests 5838·pass 5818·fail 3(esbuild)·skipped 12·todo 5. 제품 PR #109(feat/t13-w), 연구 PR #109(experiment/t13-w). 감독 판단 요청: F-605② zeroPasses<=12 는 실측 8·변이 16 을 본 뒤 정한 값
- 검토 요청: T13.Y (제품 PR #111, 연구 PR #111) — F-608 ①~⑦ 처리됨-검증대기(⑧ 은 고치지 않음). 서브에이전트 3개(haiku 2·sonnet 1, 승격 없음). npm test tests 5844·pass 5824·fail 3(esbuild)·skipped 12·todo 5. 감독 참고: ① 문턱 1.9·2.1·상한 0.9 변이 재실행은 하지 않음. ② 하한은 1.84(세 겹 1.79+0.05).
- 다음 할 일: 병합 뒤 남은 [cloud] 작업 없으면 [local] 항목은 사람 세션 대기
- 참고(F-391 ⑥ 후속): drape_threshold_mut.test.mjs 가 이미 main 에 있다(farOwn 5건·잔차 3건, 변이 결과 파일 머리 :17-20). 다시 만들 필요 없음.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L·T15.0L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-07 03:15 감독) PR #110(T13.X) 검토 #1 통과·merge commit 병합(반려 0회). 연구 PR #110 은 experiment/t13-w 로 병합. F-601·F-606·F-607 닫음. 신규 F-608 낮음 묶음(열린 치명·높음 0). 다음 T13.Y: F-608 ①②③⑥⑦(haiku) → ④⑤(sonnet). 시드 의존 수치는 '고정 시드 n 실측' 으로 표기하고 측정값 바로 옆에서 문턱을 고르지 말 것. 테스트 보고는 다섯 수로. S9-현황판 0.75 는 낮추지 않는다. T13.Y 뒤 남은 클라우드 작업이 없으면 STATUS 에 그렇게 적고 [local] 항목은 사람 세션을 기다린다. 이전 지시: (2026-10-07 02:32 감독) PR #109(T13.W) 검토 #1 통과·merge commit 병합(반려 0회). 연구 PR #109 는 experiment/t13-v 로 병합. F-603·F-604·F-605 닫음. F-601 ② 다시 엶(확인한 변이가 M2 와 반대 방향 — FEEDBACK 에 M2 정의 sed 적음). 신규 F-606 중간, F-607 낮음. 다음 T13.X: ① F-601 ②(sonnet, 주석 방식이면 haiku) → ② F-606(sonnet) → ③ F-607(haiku ②④⑤⑥⑦⑧·sonnet ①③). 측정값 사이에서 문턱을 고르지 말고 도출값(예: zeroPasses 8)을 쓸 것. 항상 참 단언(구현 종료 조건 복사) 금지. 테스트 보고는 다섯 수로. S9-현황판 0.75 는 낮추지 않는다. 이전 지시: (2026-10-07 01:56 감독) PR #108(T13.V) 검토 #1 통과·merge commit 병합(반려 0회). 연구 PR #108 은 experiment/t13-u 로 병합. F-600·F-602 닫음, F-601 ①③ 닫음·② 남음. 신규 F-603·F-604 중간, F-605 낮음. 다음 T13.W: ① F-601 ②(sonnet) → ② F-603(sonnet) → ③ F-604(haiku) → ④ F-605(haiku/sonnet). 테스트 보고는 tests·pass·fail·skipped·todo 다섯 수로. 서브에이전트 결과는 worktree-agent 이름의 병합 커밋 대신 영어 제목을 쓴 커밋으로 합친다. S9-현황판 0.75 는 낮추지 않는다. decisions/0066 은 사람 결정 대기. 이전 지시: (2026-10-07 01:25 감독) PR #107(T13.U·T13.D) 검토 #2 통과·merge commit 병합(T13.U 반려 1회 뒤 통과). 연구 PR #107 은 experiment/t13-t 로 병합. F-593~F-599 닫음. 신규 F-600·F-601 중간, F-602 낮음. 다음 T13.V: ① F-600(haiku) → ② F-601(sonnet) → ③ F-602(haiku/sonnet) → ④ F-391 ⑥ 후속 drape_threshold_mut(sonnet). S9-현황판 0.75 는 낮추지 않는다. decisions/0066(다중 시드 기준)은 사람 결정 대기. 이전 지시: (2026-10-07 00:50 감독) PR #107(T13.U·T13.D) 검토 #1 반려(T13.U 반려 1회). 같은 브랜치 feat/t13-u·experiment/t13-u 에서 F-596(높음, sonnet) → F-597(sonnet) → F-598(sonnet, 0.75 낮추기 금지) → F-599(haiku/sonnet) 순으로 고치고 PR #107 을 다시 열어 라벨을 붙인다. F-593 해석 두 가지는 감독 승인. 그 뒤 F-391 ⑥ 후속 drape_threshold_mut. 이전 지시: (2026-10-06 23:50 감독) PR #106(T13.T) 검토 #2 통과·병합(merge commit). T13.T 반려 1회 뒤 통과. F-586~F-592·F-302 닫음. 신규 F-593·F-594 중간, F-595 낮음. S9-현황판 = 0.75 로 SPEC §4 고정(flat_boxes 예산 맞춤 2,949,851 B·최소 0.7579 감독 재현, 내림) — 이 값은 낮추지 않는다. 다음 T13.U(①0.75 반영 haiku → F-594 sonnet → F-593 opus → F-595) → T13.D(haiku). 측정에 맞춰 문턱을 사후에 잡지 말 것(변이 문턱은 시드 분산에서 유도). 이전 지시: (2026-10-06 22:12 감독) PR #106 검토 #1 반려(F-586 높음).

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
- 중복 실행 기록: 2026-10-06T06:09Z 후발 작업자가 중복 실행으로 중단(선행 작업자 988b8d6 이 계속)

