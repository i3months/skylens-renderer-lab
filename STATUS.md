# 현재 상태

- 상태: 진행 중
- 현재 작업: T15.3 건물 그리기 + F-405 ①③ + F-406 ①②
- 마지막 갱신: 2026-10-05T17:07Z (작업자, 시작 17:06Z)
- 방금 한 일: T15.3 PR #74 반려 잔여 처리: 17:12Z 서브에이전트 9개 동시 투입(sonnet 7·haiku 2, 승격 없음) — F-408 ①②③④⑤⑥⑦·F-409 ④⑤⑥⑦⑧. 통합·검증 대기 중.
- 검토 요청: 없음(F-408·F-409 잔여 처리 뒤 PR #74 다시 열고 라벨)
- 다음 할 일: 같은 브랜치 feat/t15-3·experiment/t15-3 에서 F-408 ①②③④⑦(sonnet 각각: perf 시험 catch 삭제·화소 수·aerial 실제 영상, no_network 감시 복원·syncBuiltinESMExports, raster_tex u 기울기 시험, lines 선끼리 bias 없이, 결과 버퍼 재사용·컬링)·⑤⑥(haiku: 결정 0048 근거 정정, 0049 에 uv 규약·기각 대안), F-409 ④⑤⑥⑦⑧. 끝나면 PR #74 다시 열고 review-requested 라벨. 그 뒤 T15.2b·T15.4.
- 참고(F-391 ⑥ 후속, 미통합): 검토 요청 뒤 서브에이전트가 보고한 시험 입력 — (a) farOwn 0.5~0.6 양성: 블록 (64,32), 사인 2 DN, g −0.5, e −0.9, 잡음 ±1 DN, 시드 5995287(잔차 0.4375·거리 0.5876)·6011125(잔차 0.478·거리 0.5344); (b) 잔차 ≥ 0.5 이면서 farOwn 거짓: 이동 0, 영역 x 16..48·y 8..56 m, 사인 3 DN, 잡음 ±5 DN, 시드 7047525, 블록 (48,16), 잔차 0.504·거리 0.421. 변이 (a) 0.6 → 2/3 실패, (b) 잔차 1.0 → 1/3 실패(서브에이전트 보고, 작업자 미검증, 제품 저장소에 푸시되지 않음). 다음 작업자가 drape_threshold_mut.test.mjs 로 다시 만들어 검증한다.
  1. 같은 브랜치 feat/t14-r11·experiment/t14-r11 에서 F-386(opus) → F-359 (B) 0044 결정(sonnet) → F-388(haiku) → F-387(sonnet) → F-381 ⑨·F-369(haiku) → F-389·F-385 잔여. 고친 뒤 PR #67 다시 열고 review-requested 라벨.
  2. 그 뒤 TASKS 의 다음 미완료 작업(T15).
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L). 실제 VWorld 입력([local], T14L).
- 감독 지시: (2026-10-05 16:50 감독) 제품 PR #74(T15.3) 검토 #1 반려 — 병합하지 않고 닫음, 연구 PR #74 는 열어 둠. 사유 F-407(높음): layer_ref 가 black 면 색·층 선 그리기·points 묶음 누락을 판별 못 함(감독 재현: rasterizeLines 호출 삭제·홀수 면 흰색·points 마지막 묶음 누락 변이 모두 buildings 시험 111 pass). 같은 브랜치 feat/t15-3·experiment/t15-3 에서 F-407(sonnet) → F-408 ①②③④(sonnet) → F-408 ⑤⑥·F-409 ①②③⑧(haiku) → F-409 ④~⑦(sonnet). F-408 ⑦ 성능은 미뤄도 됨. 고친 뒤 PR #74 다시 열고 review-requested 라벨. 그 뒤 T15.2b(opus). F-405 ③·F-406 ①② 닫음. 결정 0048·0049 는 F-408 ⑤⑥ 처리 뒤 승인 판단.

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
