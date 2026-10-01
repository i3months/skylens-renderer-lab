# 기준값 도구 보완 2차 노트 (T01G: F-022·F-032~F-036·F-041)

제품 브랜치 `feat/baseline-fixes-2`(main 3e2c4c4 위). 서브에이전트가 격리 작업 트리에서 하위 작업별로 일하고 작업자가 병합·검증했다.
이번 실행 서브에이전트: 제품 8개(opus 2·sonnet 4·haiku 2) + 연구 4개(sonnet 4) = 12개, 승격 없음.

## 하위 작업 결과

| 번호 | 항목 | 모델 | 내용 | 확인 |
|---|---|---|---|---|
| T01.17 | F-022·F-041(ws_bytes) | opus | 재생 회차는 직전 프레임이 같은 (구간, 수준)의 재전송일 때만 합류. 재전송 뒤 원본이 stale 상한을 올리지 않음. 합계가 safe integer 를 넘으면 오류. final 필드 판정 시 wsTopLevel 무시를 method 에 표기. stale trailing·미완 순서·stale_bytes 레코드 단언 | ws_bytes 41 통과·0 실패, 변형 9개 모두 실패 확인 |
| T01.18a | F-032·F-041(ref_images)·F-036(subarray) | opus | 분기별 method 표기(27 B 는 "법선 nx ny nz 있음·무시"), decodePly 헤더 자르기 제거·decodePlyFile 만 1 MiB 상한, 점 0개 오류에 제외 사유, rgb 3종 레이아웃 run·청크 비교, 비대칭 시점 투영 대조, 축별 clip 경계, 대형 PLY 자식 프로세스 RSS 단언 | ref_images 57건 중 52 통과·0 실패·5 건너뜀, 변형 21개 모두 실패, 1천만 점 대형 2/2 통과(56 B 증가분 123.9 MiB ≤ 196.5, 15 B 117.7 ≤ 196.5), 읽기를 전체 읽기로 바꾸면 둘 다 실패(648.7·253.4 MiB) |
| T01.18b | F-041(viewpoints) | sonnet | coordProblems 부정어 판정을 인접 절로 좁히고 음성 사례 추가 | tests/viewpoints_schema 통과 |
| T01.18c | F-xxx 번호 제거(그 밖 경로) | haiku | 해당 경로에 연구 번호 없음 | — |
| T01.19a | F-033 | sonnet | 지표 이름 heap.process_pss, 워밍업 1회 폐기, 보고값 비교, 방식 혼합 경고, 0 프로세스 기록 생략 | 브라우저 테스트 10회 연속 통과, 상주 제거 변형 실패(delta -14 MiB) |
| T01.19b | F-034 | sonnet | 깨진 맵·`sources:[]`·배열 feature·소스 문자열 단언→동작 음성 테스트·linux 가드 | 변형 2종 모두 실패 확인 |
| T01.19c | F-035 | sonnet | worker 안에 부모 PID 감시 Worker thread(200 ms), 대상 0개 종료코드 2, `only:[]` throw | 20 통과, 감시자 끄면 동기 루프 테스트 실패 |
| T01.20 | F-036 | haiku | 첫 프레임 감지 뒤 래퍼 원본 복원, 감지 비용 method 표기, .map 의 sources 만 추출 | _common·bundle_status 47건 중 45 통과·2 건너뜀 |

## 한계·열린 점 (정직하게)

- heap: 서브에이전트 측정에서 PSS 합이 동시에 도는 다른 chromium 때문에 흔들렸다(원인은 정황 추정, 격리 검증 안 함). 렌더러 프로세스별 증가분은 일정했다(약 155 MiB 대 약 55 MiB). 테스트는 hold·blank 를 동시에 돌려 영향을 줄였다. 문턱 90 MiB 는 그대로.
- run_all 감시자: 부모 PID 재사용, 감시 스레드가 스케줄되지 못할 만큼 CPU 를 점유하는 환경, 감시 주기(200 ms)만큼의 지연은 보장하지 못한다(코드 주석에 기재).
- closure.mjs 의 sources 추출은 정규식이라 경로에 `]` 가 든 맵은 JSON 폴백(null → 코드 표지 판정)으로 간다.
- F-036 의 wrapper_delegate 테스트 중 "문서 존재 확인" 류는 약하다. 후속 검토 대상.
- Node 22 에서 `node --test <디렉터리>` 는 MODULE_NOT_FOUND 로 실패한다. 파일 글롭을 쓴다(`npm test` 는 영향 없음).

## 통합 검증 (작업자 직접)

- `npm test` 전체(Playwright 브라우저는 /opt/pw-browsers): 273건 중 261 통과·0 실패·12 건너뜀.
- `grep -rn 'F-0[0-9][0-9]' bench tests tools contracts` 0건.
- 실제 skylens 체크아웃은 이 세션에 없어 대조하지 못했다(건너뜀 12건에 포함). 합성·재구성 픽스처로만 검증했다.
- 서브에이전트 통과 보고는 믿지 않고 위 전체 테스트를 직접 돌렸다.

## 정정·보충 (T01H, F-045 ③)

- 대형 PLY 청크 읽기 RSS 상한: 자식 프로세스 피크 RSS 증가 ≤ 15·n × 1.15 + 32 MiB (n = 점 수, 점당 출력 버퍼 15 B). 계수 1.15 는 출력 버퍼 외 V8 여유(약 15%)와 고정 32 MiB 는 런타임 기본 증가분을 위한 값이며, 실측으로 맞춘 값이 아니라 사전에 둔 상한이다(상한 근거 측정이며 이 노트 T01.18a 의 대형 RSS 별도 실행(`REF_IMAGES_BIG_POINTS=10000000`)에서 얻은 값이다: n=10,000,000 에서 56 B 형식 증가 124.9 MiB, 15 B 형식 120.1 MiB, 상한 196.5 MiB).
- 기준 교체 사유: 이전 기준 "입력 파일 크기 × 1.3" 은 청크 읽기라 파일 크기와 무관하게 늘지 않는데도 파일이 큰 형식(56 B)만 느슨해지는 문제가 있어, 출력 버퍼 기준 산식으로 바꿨다.
- 건너뜀 12건 내역: 대형 RSS 2건은 기본 `npm test` 에서 건너뛴다(`REF_IMAGES_BIG_POINTS=10000000` 별도 실행으로 켠다). 나머지는 실제 skylens 체크아웃·Playwright 브라우저가 필요한 항목이다. 건너뜀 개수의 정확한 분류는 다음 통합 검증에서 `--test-reporter` 출력으로 다시 적는다(이 보충은 이력 근거 없이 추정하지 않는다).
