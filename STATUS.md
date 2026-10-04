# 현재 상태

- 상태: 검토 대기
- 현재 작업: T14 tower-assets + F-303·F-304
- 마지막 갱신: 2026-10-04T19:40Z (작업자)
- 검토 요청: T14.R 반려 처리(제품 PR #58 재오픈, 연구 PR #58). 감독 판단: ① F-307 로 건물 LOD 면 수 감소 0%(건물 영역 SSIM 1.0000) ② F-308 실측 직렬화 크기가 잡음 DEM 에서 15 MB 초과(41.97 MB), 매끈한 DEM 은 4.46 MB — 실제 DEM 필요 ③ 미처리: F-311·F-313·F-316 ⑤. 서브에이전트 opus 3·sonnet 3(반려 처리분), 승격 없음. 전체 npm test 4063 중 실패 0.
- 방금 한 일: F-305~310·312·314·315·316(일부) 처리, 결정 0044, 계약 coverage·wallMask. 결과는 experiments/t14.md 반려 처리 절.
- 다음 할 일:
  1. T12.V — 새 브랜치 feat/*(연구 experiment/*, base experiment/t12-client-raster-start)에서 F-279(opus) → F-282(sonnet) → F-280(sonnet) → F-278(sonnet) → F-277 ④(sonnet)·③⑤(결정) → F-281(haiku) → F-274 ②(선택).
  2. 그 뒤 TASKS 의 다음 미완료 작업.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local], T10.10L·T11.8L).
- 감독 지시: (2026-10-04 19:25 감독) 제품 PR #58(T14 + F-303·F-304) 검토 #1 반려 — PR 닫음(병합 안 함), 연구 PR #58 은 열어 둔다. 높음 4건(감독 직접 재현): F-305 지형 LOD 오차를 쌍선형으로 재 삼각형 메시가 상한 초과(체커보드 DEM LOD3 2.5 m > 2 m), F-306 드레이프 정합이 평행이동만 재 4% 축척 오류가 0.07 px 로 통과, F-307 T14.4 SSIM 이 화면 전체 평균이라 먼 시점 tol×100 변이도 통과 — 감독 해석: 건물 영역 SSIM ≥ 0.95 로 단언하고 LOD 를 맞춘다(문턱 변경 금지), F-308 T14.9 벤치 단언이 항상 참이고 드레이프·직렬화가 빠짐. 중간 F-309~F-313·F-315·F-316, 낮음 F-314. F-303·F-304 닫힘. 같은 브랜치 feat/t14·experiment/t14 에서 TASKS T14.R 순서대로 고친 뒤 PR #58 을 다시 열고 라벨을 붙인다. 실제 VWorld 입력은 T14L([local]). 연구 experiments/t14.md 의 로컬 경로를 빼고 다음 실행은 제품 작업 트리를 처음부터 저장소 밖에 만들되 노트에는 경로를 적지 않는다.

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
