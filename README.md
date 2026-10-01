# skylens-renderer-lab

`skylens-renderer`(SkyLens 서버사이드 렌더러)를 만드는 연구 과정 기록.

- [RULES.md](RULES.md) — 깨지 않을 것, 저장소·기록·라이선스·비밀정보 규칙
- [SPEC.md](SPEC.md) — 목표 사양과 성공 기준
- [renderer_basis.md](renderer_basis.md) — 렌더러가 지켜야 할 기반 규칙(SPEC 의 상위 근거)
- [TASKS.md](TASKS.md) — 작업 순서와 병렬 하위 작업
- [STATUS.md](STATUS.md) — 작업자의 현재 상태
- [FEEDBACK.md](FEEDBACK.md) — 감독의 정밀 피드백(작업자가 먼저 처리)
- [ops/WORKER.md](ops/WORKER.md), [ops/SUPERVISOR.md](ops/SUPERVISOR.md) — 작업자·감독 절차
- [logs/supervisor/](logs/supervisor/) — 감독 기록
- `experiments/` — 작업별 실험 노트(`research` 아래 `experiment/*` 브랜치 + PR = 실험 트리의 노드)

브랜치: `main` 은 살아 있는 문서, `research` 는 실험 트리의 루트. 실험 노드는 main 으로 병합하지 않는다.
