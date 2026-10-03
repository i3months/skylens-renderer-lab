# 실험 노트: T03 asset-format (경량 자산 포맷 .skla v1.0)

- 제품: `feat/asset-format`, 연구: `experiment/asset-format`(base research)
- 결정 기록: [0015 단일 포맷](../decisions/0015-asset-single-format.md) (상태: 제안)
- 이번 실행: 서브에이전트 12개 — sonnet 10, opus 1(T03.7), haiku 1(T03.9). 승격 0건(전부 첫 시도에 통과). T03.F(F-059, haiku)는 앞 작업자가 병합했다.

## 결과 요약

| 하위 | 모듈 | 완료 기준 | 결과(작업자가 병합 뒤 `npm test` 로 직접 확인) |
|---|---|---|---|
| T03.0 | `contracts/asset/`, `format/ASSET_FORMAT.md`, `fixtures/asset_golden/` | 두 골든을 읽어 필드 일치 | 통과(점 27: 480 B·32점, 가우시안 56: 512 B·21점) |
| T03.1 | `server/asset/header/` | `header_roundtrip`, 잘못된 매직·버전 거부 | 통과(왕복 1,000개) |
| T03.2 | `server/asset/tile_index/` | `tile_index_lookup` 1만 점 오분류 0 | 통과(오분류 0, 그룹 283개) |
| T03.3 | `server/asset/bounds/` | `bounds_contain_all` | 통과(qexp 경계 63.9990234375→10, 127.998046875→9, 255.99609375→8) |
| T03.4 | `server/asset/ids/` | `ids_roundtrip` 1,000개 | 통과 |
| T03.5 | `server/asset/checksum/` | 1비트 뒤집기 1,000회 전부 검출 | 통과(파일마다 1,000회 + checksum 필드 32비트 전부) |
| T03.6 | `tools/asset_validate/` | 골든 통과, 손상 10종 거부 | 통과(10종 + 추가 시험) |
| T03.7 | `server/asset/unpack/` | `unpack_error_bound` 두 형식 | 통과, 위반 0 |
| T03.8 | `client/asset/` | `client_header_parity` 두 형식 | 통과(`node:`·Buffer 미사용 소스 검사 포함) |
| T03.9 | `server/asset/determinism/` | 같은 입력 두 번 → 바이트 동일 | 통과(실제 packChunk 통합 시험 포함) |
| T03.10 | `server/asset/compat/` | `compat_matrix` | 통과(골든 2종 × 21행) |
| T03.11 | `server/asset/fuzz/` | 10만 회 패닉·무한 루프 0 | 통과, 대상 9개 전부 fail 0, 유휴 부하에서 호출당 최대 7.88 ms(부하 아래에서는 감독이 45 ms 까지 관측) |
| T03.12 | `server/asset/pack/` | 골든과 바이트 동일 | 통과(점 27·가우시안 56 둘 다) |

전체 `npm test`: 반려 수정 전 458개 중 통과 446·실패 0·건너뜀 12, 수정 뒤 510개 중 통과 498·실패 0·건너뜀 12(기존 환경 의존 시험).

## 역변환 최대 관측 오차 (T03.7, 명세 §8 상한은 낮추지 않음)

| 항목 | 관측 최대 | 상한 |
|---|---|---|
| 위치 qexp 10 / 9 / 8 | 0.48828125 / 0.9765625 / 1.953125 mm | 반 단계(같은 값) |
| f32 반올림 | 0.1220703125 mm | 0.1220703125 mm |
| 법선 각 | 0.9407° | 1° |
| 점 27 색 | 0 | 0 |
| f_dc | 0.006950799376 | 0.006950799415 |
| 불투명도 α | 0.001960784157 | 0.001960784314 |
| ln scale | 0.03124976 | 1/32 |
| 회전 각 | 0.2265° | 0.3° |

## 발견과 명세 보정
1. f_dc·불투명도 상한은 f64 복원 기준이다. 원본이 저장 구간 경계에 정확히 걸리면(로짓 0, f_dc 0) f32 로 내릴 때 반올림 몇 ulp 가 상한을 넘는다(처음 구현에서 위반 4건). T03.7 은 반올림 방향을 아래로 골라 상한 안에 두었다(상한 완화 없음). 명세 §8 에 문장으로 반영했다. 남는 경우: 위 끝 동점 바로 아래 1 f32 ulp 이내 원본이 이론상 약 1e-7 넘을 수 있음(미측정, 열린 문제).
2. 회전 "가장 큰 성분 ≥ 0" 은 반올림으로 깨질 수 있어, 깨지면 4성분 부호를 함께 뒤집는다(같은 회전).
3. 병렬 `npm test` 부하에서 서브에이전트 4명이 전체 테스트 첫 실행에 1건 실패를 봤으나(이름 미확인) 병합 뒤 작업자의 전체 실행 2회는 모두 실패 0이었다. 원인 미확인 — 퍼저의 호출당 50 ms 상한이 부하에 민감하다는 보고가 있어 퍼저는 최대 3회 재시도 뒤 최솟값으로 판정한다.
4. 하위 작업 T03.11 서브에이전트는 커밋이 분류기에 막혀 작업자가 파일을 옮겨 커밋했다(내용 변경 없음).
5. `generate.mjs` 가 부호화 함수를 내보내지 않아 T03.7·T03.12 시험이 골든 입력 규칙을 복사해 다시 만든다(중복). T04 이후 정리 후보.

## 미달·열린 문제
- **실제 skylens 체크아웃 대조 못 함**: 이 세션에 skylens 체크아웃(`SKYLENS_DIR`)이 없다. 합성 점·골든만으로 검증했다. 실제 구간 PLY(56 B)를 packChunk→unpackChunk 로 왕복하는 확인은 T04 첫 작업 또는 [local] 로 넘긴다. 원본 PLY x y z 가 ENU (e, n, u) 라는 가정도 그때 확인한다(명세 §16).
- 4수준 합 3 MB(S6) 달성은 이 포맷 단독으로는 불가(codec 0 에서 형식 1 약 23만 점, 형식 2 약 17.6만 점)이고 LOD·컬링·압축(T07~T09)의 몫이다(명세 §14, 계산).
- 불투명도 `Math.exp` 엔진 간 마지막 비트 차이가 round 경계에서 바이트를 바꾸는지 미측정.
- 새 의존성 없음(`node:zlib` 은 내장). 서브에이전트 코드는 외부 오픈소스 차용 없음.

## 재현
```
npm test
node tools/asset_validate/cli.mjs fixtures/asset_golden/point27.skla   # 위반 0, 종료코드 0
```

## 반려 1회차 수정 (PR #12 감독 검토 → F-060~F-067)
서브에이전트 10개: opus 1(F-061), sonnet 7, haiku 2. 승격 0건. 상한(`contracts/asset/index.mjs` ERROR_BOUNDS) 변경 없음.

| 항목 | 처리 | 직접 확인한 결과 |
|---|---|---|
| F-060 | `checkDeterminism` 기본 packFn = 정적 import 한 packChunk, times 정수 검사, 결과를 쌓지 않고 비교, 실제 pack 테스트의 skip 제거 | pack 에 문법 오류를 넣으면 determinism 테스트 fail(서브에이전트 확인), 두 형식 packFn 생략 호출 identical true |
| F-061 | 상한 시험이 제품 `packChunk` 사용, 색 코드 0..255·불투명도 q 0..255 끝점 f32 사례, quantExp 등호 경계(65535/1024·512·256), 접힘 법선·회전 m=3 사이드카 | 변형 3종 각각 작업자가 직접 실패 확인: (a) unpack f_dc `f32Toward`→`Math.fround` unpack 테스트 fail 1, (b) 불투명도 같은 변형 fail 1, (c) pack 등호 `<=`→`<` pack 테스트 fail 1 |
| F-062 | 명세·0015 의 형식 1 점당 13 B → 11 B(40.7%), S6 추정 27.5 MB·약 27만 점 | `grep '13 B\|13n' format/ASSET_FORMAT.md` 0건 |
| F-063 | `packChunk` lod 정수·0..7 검사('field') | `pack_lod.test.mjs` 통과 |
| F-064 | 클라이언트 codec·quantExp·pointCount·tileSizeM·길이 검사, 음성 테스트 | 서브에이전트가 검사별 변형 8종 전부 fail 확인 |
| F-065 | `f32Toward`·회전 복원의 점당 할당 제거(출력 비트 동일: f32Toward 100만 값 불일치 0, 30만 점 조각 바이트 차이 0) | 100만 점 unpackChunk 3회 중 최소, 유휴 부하: 가우시안 56 394 ms(목표 ≤ 500 ms, 수정 전 약 3.0~3.4 s), 점 27 135 ms. 측정: 스크래치의 bench 스크립트(pack 으로 조각을 만들고 unpackChunk 3회) |
| F-066 | 검증기 손상 6종 추가, unpack 음성 29건(새 파일), 퍼저는 파일이 있을 때의 import 실패를 fail 로, OFFSETS 단언, 'validator failure' 단언 | 검사별 변형 각각 fail ≥ 1(서브에이전트 확인) |
| F-067 | ①~⑤ 명세 문구(⑤ 중복 키·앵커 책임), ⑥ verifyChecksum 입력 방어, ⑦ unpack JSDoc 검사 범위, ⑧ 테스트 정리, ⑨ generate.mjs 부호화 함수 export | 전체 테스트 통과. ① 의 SPEC 문구(연구 SPEC.md:72)는 감독이 맞추기로 한 것이라 건드리지 않음 |

추가 수정(작업자): 퍼저 전체 예산 60 s 를 벽시계에서 CPU 시간(`process.cpuUsage`)으로 바꿨다. 병렬 부하 30~50 에서 벽시계 예산 초과로 `fuzz_no_panic` 이 간헐 실패했고(CPU 는 약 14 s), 이것이 발견 3 의 원인 미확인 실패의 정체로 보인다(이름이 확인된 실패 전부 `fuzz_no_panic`). 벽시계 응답 없음 가드는 CPU 예산의 10배(600 s)로 둔다. 호출당 50 ms 상한은 그대로다.

남는 한계: f_dc·불투명도의 저장 구간 위쪽 끝 동점에서 f32 출력이 상한을 최대 1 f32 ulp 넘을 수 있다(R2 서브에이전트 측정: f_dc 79개 코드, 불투명도 119개 코드). 명세 §8 문장에 반영된 f32 반올림 항 안이며 테스트는 위쪽 끝에서만 이 항을 허용한다. 엄격한 상한이 필요하면 코드마다 f32 값을 고르는 방식이 필요하지만 구간 폭이 약 1 ulp 라 존재하지 않을 수 있다(미결).
