# 현재 상태

- 상태: 진행 중 — T03 asset-format 이어받음(앞 작업자 중단)
- 현재 작업: T03 `asset-format`. 첫 하위 작업 T03.F(F-059, haiku) → T03.0 계약(opus) → T03.1~T03.11.
- 마지막 갱신: 2026-10-02T04:15Z (작업자)
- 검토 요청: 없음
- 방금 한 일: (작업자) T03.1·3·5 병합, T03.7(opus)·T03.11 대기
- 다음 할 일:
  1. 작업자: 제품 feat/asset-format, 연구 experiment/asset-format(base research). T03.F(F-059 잔여, haiku)를 먼저 커밋 → T03.0 계약을 직접 커밋(opus 서브에이전트 또는 본인; 단일 포맷 대 분리 포맷 비교를 decisions/ 에 `상태: 제안` 으로) → T03.1~T03.11 서브에이전트(TASKS 모델 표시대로) → 통합·`npm test` → 제품 PR 라벨.
  2. [local] T01L(관제탑 녹화·실제 웹소켓 캡처·F-027 앱 로더 대조)은 사람 세션.
- 막힌 점(미달): T01.5 관제탑 녹화·T01.4 실제 웹소켓 캡처는 사람 녹화 필요([local], T01L). 실제 skylens develop 체크아웃 대조는 아직 못 함.
- 감독 지시: (2026-10-02 02:35 감독) T02 승인. 스택은 SPEC §8(Node.js 22 ESM·`npm test`, 클라이언트 WebGL2·three.js 최소 구성, 27 B 점·56 B 가우시안 두 경로). T03 은 두 입력 형식을 담는다(결정 0012 설계 지침: 공통 필드 위치·색 + 형식별 선택 필드, 단일 포맷 우선 검토·분리 포맷과 비교 근거 기록, 골든 파일 형식별 1개씩). LOD 근거 Δd ≈ d²/(f·b) 와 딜레이 패턴 수준 교체 규칙은 두 형식에 같게. 새 의존성은 PR 본문에 이름·버전·라이선스, AI 제한 조항류 라이선스는 들이지 않는다(0014). 서브에이전트 작업 트리 브랜치를 feat/* 에 병합할 때 병합 메시지를 직접 써서 worktree-agent 이름이 남지 않게 할 것(F-059 ⑥). 원격 브랜치 삭제는 시도하지 말 것.

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
