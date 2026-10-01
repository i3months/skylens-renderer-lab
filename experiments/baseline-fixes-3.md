# 기준값 도구 보완 3차 노트 (T01H: F-036·F-042~F-046)

제품 브랜치 `feat/baseline-fixes-3`(main 2a61035 위). 서브에이전트가 격리 작업 트리에서 하위 작업별로 일하고 작업자가 병합·검증했다.
이번 실행 서브에이전트: 제품 4개(opus 2·sonnet 2), 승격 없음. 연구 쪽(F-045 ③·⑥)은 작업자가 직접 수정. 하위 작업이 10개 미만인 것은 항목이 소규모이고 소유 경로가 겹쳐 더 쪼갤 수 없었기 때문이다.

## 하위 작업 결과

| 번호 | 항목 | 모델 | 내용 | 확인 |
|---|---|---|---|---|
| T01.21 | F-042 | opus | 도착 시점 원본 최고 수준보다 낮은 resend 회차는 추월로 보고 합·받은 수준에서 제외(resend_bytes·skipped), 완결 판정은 원본 프레임의 final 만, resend 가 분할 연속을 끊음, [r40,r40] 모호성 method 표기, resend_only_segments 출력 | ws_bytes 41→45건 통과, 이전 구현에서 새 4건 실패. F-042 확인 기준 값 전부와 F-022 (가)~(라) 유지 |
| T01.22 | F-043·F-045 ①⑤ | opus | 손계산 비대칭 시점 정답(eye [5,3,10], target [2,1,0]; target 투영 (160,120) 1e-9, x_c·y_c 방향 점의 u·v, 픽셀 상수), 주석 범위 정정, basisNote 가 좌표 형·법선 형까지 표기(double 27 B 에 "double"), idx+11 | t[0] 부호 변형 1건 실패, t[1] 부호 변형 6건 실패(사본 직접 확인, 변형 전에는 0건) |
| T01.23 | F-044 | sonnet | closure.mjs 가 JSON.parse(mapText).sources 로 복귀, `]` 포함 경로 회귀 테스트 | 옛 구현에서 새 테스트 실패, 수정 후 bundle_status+bundle_tower 29 통과 |
| T01.24 | F-036·F-046·F-045 ②④ | sonnet | wrapper_delegate 의 문자열 단언 삭제, chromium 에서 17개 WebGL 메서드와 getContext 복원을 `__ffOrig === undefined`·native 로 단언, 거의 항상 참인 단언 삭제, heap `processTreeMemory` 가 /proc 경로 주입, run 의 deps 주입·브라우저 없는 run 테스트, heap 주석을 실제 판정에 맞춤 | 복원 두 줄을 각각 끈 변형에서 실패, 방어 줄 삭제 변형에서 processTreeMemory null 테스트 실패 |

## 판단 필요·한계 (정직하게)

- F-042 "resend 전용 구간은 incomplete" 를 그대로 따르면 F-022 (가)([r(1,2,40), r(2,2,30)]×2 → [40,30]·70)가 깨진다. final 필드가 있는 녹화에서만 resend 전용 구간을 미완으로 두고, 없는 녹화는 집계하되 resend_only_segments·method 에 표시했다. 감독이 의도와 맞는지 확인해 달라.
- 추월 기준은 녹화 끝의 hi 가 아니라 도착 시점의 hi 다([rL0 99, L2 10] → [109], 원본 stale 규칙과 같은 기준).
- heap 의 `pssProcs+rssProcs===0` 방어 줄은 `run` 수준에서는 memoryMethodText 와 중복이라, 줄 삭제 변형은 `processTreeMemory` 직접 단언이 잡고 run 수준 테스트는 종단 동작을 지킨다.
- 실제 skylens 체크아웃은 이 세션에 없어 대조하지 못했다(건너뜀 12건에 포함. 분류: 실제 트리·SKYLENS_DIR 필요 10건, 대형 RSS 2건).

## 통합 검증 (작업자 직접)

- `npm test` 전체: 281건 중 269 통과·0 실패·12 건너뜀.
- `grep -rn 'F-0[0-9][0-9]' bench tests tools contracts` 0건. 커밋 메시지에 생성 도구 문구 없음.
