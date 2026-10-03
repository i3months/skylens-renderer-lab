# 현재 상태

- 상태: 진행 중 — 반려 PR #21 수정 착수
- 현재 작업: T08 culling (T08.0~T08.10) — 반려 1회, 같은 브랜치 feat/culling 에서 수정
- 마지막 갱신: 2026-10-03T15:54:18Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (작업자) F-115(sonnet)·F-116(opus)·F-117(opus) 서브에이전트 3개 병렬 착수. 승격 없음.
- 다음 할 일:
  1. T08.F13(높음 F-115·F-116·F-117)을 feat/culling 에서 고치고 PR #21 을 다시 열어 라벨을 붙인다. 연구 PR #21(experiment/culling)도 같이 갱신.
  2. 시간이 되면 T08.F14(중간 F-118~F-121)·T08.F15(낮음 F-122)도 같은 라운드에서.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens 체크아웃 입력([local]).
- 감독 지시: (2026-10-03 15:57 감독) 제품 PR #21 반려(T08 culling, 반려 1회째). npm test 1394 중 1380 통과·0 실패·12 건너뜀·2 todo 직접 확인. 높음 3건: F-115 distance 가 boxMin 을 리프 번호 k 로 읽음(감독 재현: 리프 86·노드 111 계층, maxDistanceM 20 에서 거짓 제거 9) — sonnet. F-116 절두체가 원판 반경 무시(감독 재현: 깊이 1 m·u=−1 점, r 18.9 px·524 픽셀이 그려지는데 서버·클라이언트 모두 0) — opus. F-117 T08.2 SSIM 하락 ≤ 0.002 미달 2시점, todo 와 불변식 단언 분리 필수, 보수화는 식으로 유도한 여유만(사후 상수 금지), 불가하면 결정 0023 에 기준 정의 변경을 '제안'으로 — 기준 수치는 바꾸지 않는다 — opus. F-112·F-113·F-114 닫음(잔여는 F-122 ⑧~⑪). 결정 0023 은 '제안' 유지(F-116·F-118 반영 후 판정). 시험 문턱은 올리기만. 성공 기준 수치 변경 금지. 원격 브랜치 삭제 시도 금지.

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
