# T12 실험 노트 — client-raster 본체 (T12.1~T12.7·T12.9·T12.10)와 T11.O

## 처리 범위
- T12.1 문맥 초기화·소실 복구, T12.2 점 셰이더, T12.3 조각 버퍼, T12.4 카메라·K 환산, T12.5 프레임 루프·복호 Worker 래퍼, T12.6 빈자리 표시, T12.7 메모리 집계, T12.9 캡처 시험 틀, T12.10 지연 계측, 통합 createRenderer(client/raster/index.mjs).
- T11.O: F-241 ①~⑥(묘비 기억으로 재시도 판정을 ackedUpTo 와 무관하게, 보관 판정은 죽음·기록 없음만, 재시도 걸음 수 호출당 1), F-242 ③④⑤⑥(⑥ 은 stats 대신 levelStats 메서드 — core.test 가 stats 전체를 deepEqual 로 봐서), F-240 ⑥·F-242 ①②(proto·arrival 주석).
- 미처리: F-238 ④(ws 배선), F-228 ⑩(T12 호출처), T12.5 의 실제 Worker 스크립트 연결, 실제 skylens 체크아웃 [local], T12.8 은 이전 PR 에서 완료.

## 실행 기록
- 서브에이전트 13개: opus 4(F-241, T12.2, T12.4, 통합)·sonnet 4(T12.1·T12.3·T12.5·T12.6, 이어서 T12.9)·haiku 3(T12.7·T12.10, T11.O-B). 승격 0. T11.O-B 첫 시도는 자동 작업 트리가 연구 저장소여서 실패(환경 문제, 모델 승격 아님), 같은 모델로 재시도.
- 이번 환경은 서브에이전트 격리 작업 트리가 현재 저장소 기준이라, 각 서브에이전트가 제품 저장소에서 `git worktree add` 로 자기 작업 트리를 만들었다.
- 계약: 새 계약 없이 기존 contracts/client_raster 를 그대로 썼다.

## 결과(작업자 직접 실행)
- `node --test "client/raster/**/*.test.mjs"` 91 중 91 통과, 0 실패(실제 Chromium SwiftShader WebGL2 시험 포함, 건너뜀 0).
- T12.2: 실제 WebGL2 8시점 참조 대비 SSIM 1.0000(기준 ≥ 0.95), 셰이딩 끄기·빛 방향 뒤집기·점 크기 2배 변이는 0.95 아래로 떨어져 시험이 잡는다(서브에이전트 보고, 임시 스크립트).
- T12.4: 8개 화면·dpr 조합 투영 오차 최대 4.5e-13 CSS px(기준 ≤ 0.5), 단계 반올림 차 0.252 장치 px.
- T12.3: createBuffer 수 == deleteBuffer 수. T12.5: 도착 100건에도 프레임당 draw 1회.

- T11.O 변이 13개 중 12개 죽음. 상한 while 줄 제거는 도달 불가한 방어 코드라 등가 변이(F-241 ⑥ '변이를 죽인다' 는 미달, 대신 stored ≤ unacked+1·capDropped == 0 불변식 단언). 남은 대가: 묘비 상한을 넘어 잊힌 범위에서는 다른 값 재시도도 true(결정 0033 의 '죽은 창 다른 값 true' 는 사라짐 — 결정 갱신 필요).
- 전체 `npm test`: 3439 중 3427 통과, 0 실패, 12 건너뜀(작업자 직접 실행, 병합 후).

## 한계·결정 필요
- 계약 밖 확장: createRenderer 의 decode·shading·now·onEvict·contextAttributes 옵션과 setArrived·residentKeys·isContextLost 메서드(LEVEL_ARRIVED 를 렌더러에 넘길 계약 경로가 없었다). 계약 반영 결정 필요.
- 셰이딩 기본값(빛 방향 [0,0,1], 점 지름 0.05 m, near 0.1, far 10000)은 근거 없는 구현 값.
- 셰이더 참조와 GL 차이: near 보다 가까운 점은 셰이더가 버림, 점 크기 상한 1023 px, 중심이 화면 밖인 점의 처리는 구현 의존.
- Worker 복호는 래퍼만 있고 실제 Worker 스크립트 연결이 없다. 60만 점 구간 메인 스레드 long task 0 기준은 아직 미검증.
- Node 22 에서 `node --test <디렉터리>` 는 실패할 수 있어 글롭을 쓴다.
