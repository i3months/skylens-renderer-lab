# lod-fixes5 — T08.F9·T08.F10 (F-109~F-111 처리)

제품 브랜치 feat/lod-fixes5, 부모 연구 브랜치 experiment/lod-fixes4.

## 처리 내역

| 항목 | 내용 | 결과 |
|---|---|---|
| F-110 ① | screen_error.test.mjs: '이론 하한' 문구 삭제. 규칙 추정값 f·e_l/d_eff 에 대해서는 τ/2 < 값 ≤ τ 를 단언(증명된 하한). 실제 투영 칸 변의 minWorstPx 는 측정 기반으로 새 규칙 측정값과 '단계 l−1 강제' 변이 값의 중간(0.22/0.20/0.22/0.19) | d_eff×0.6 변이: 설정 2·3 실패. 단계 l−1 강제: 4개 실패. 원본 통과 |
| F-110 ② | budget_discrim 10000 예산 0.28/3 복원. 재측정 합 차 최솟값 0.4602, 이긴 시점 최솟값 5 | 단독 통과 |
| F-110 ③ | 실제 리프(leafIndex ≥ 0) 대상으로 변경. 입력 검사(F-111 ⑧)가 비유한 상자를 거부하게 되어, 비유한 d 는 카메라 t 를 1.7e308 로 키워 오버플로시킴. 비유한 상자는 두 경로 모두 'lod:' 로 거부하는 시험 추가 | budget 가시성 판정 순서 변이 → 실패 |
| F-110 ④ | nodeCount 시험에 기대 메시지 지정, nodeCount = leafCount−1(길이 일치) 사례 추가 | select/index.mjs nodeCount 검사 삭제 변이 → 3건 실패 |
| F-109 ② | select·budget 주석을 screen_error.mjs 조건과 일치 | grep 확인 |
| F-109 ④ | contracts/lod LOD_API 표를 server/lod 모듈 export 와 일치(35개 대조, 누락 0), 거리 근거 문구·hierarchy 서술 정정 | 스크립트 대조 |
| F-109 ①③ | 결정 0022 applyChunks 서술, 0020 줄 번호 → 함수 이름 | 연구 문서 |
| F-111 ① | applychunks_source 시험 이름 '결과 동등', cloud.positions 변경 뒤에도 같은 결과 단언 | 통과 |
| F-111 ② | hierarchy_nokey: sort 호출 감시로 비교 함수 경로 확인 | `!opts._forceNoKey &&` 삭제 변이 → 실패 |
| F-111 ③ | paths.test.mjs 주석(이론 약 1.76 m, 측정 1.79 m), 한계 1.0→1.3 m(올리기만) | 통과 |
| F-111 ④ | try/catch 삭제 | — |
| F-111 ⑤ | budget_discrim 낡은 주석 재측정 값으로 | — |
| F-111 ⑥ | screen_error_cabs.test.mjs 신규: BigInt 유리수 참값과 z_P 비교 | cAbs = 0 변이 → 3건 실패 |
| F-111 ⑦ | progressive 목표 단계 대조를 여러 시점·단계 ≥ 2·상한까지 | 통과 |
| F-111 ⑧ | assertHierarchyInput 에 leafStart·leafIndex 범위·상자 유한성·boxMin ≤ boxMax 추가, 새 시험 12건 | 변이 11건 실패 |
| F-111 ⑨ | experiments/lod-fixes4.md 의 G·I 구분 | 문서 |

## 통합 중 발견

하위 작업 C(비유한 상자를 던지지 않음 단언)와 E(비유한 상자 거부)가 충돌했다. E 의 검증이 입력을 더 일찍 거부하는 것이 F-111 ⑧ 의 취지라 C 의 시험을 카메라 오버플로 방식으로 고쳤다.

## 측정

- 제품 `npm test`: 1201 중 1189 통과·0 실패·12 건너뜀.
- 실제 skylens 체크아웃 없음([local]).

## 한계·남은 것

- F-110 ① 설정 1 의 d_eff×0.6 변이는 실제 투영 칸 변(0.274)으로는 새 한계 0.22 를 넘어 통과한다. 설정 2·3 이 잡는다. 설정 1·4 의 단계 l−1 변이 칸 변 값은 직접 못 재고 설정 2·3 의 절반 관계로 추정했다.
- F-111 ⑧ 의 leafStart 마지막 값 = 점 수 조건은 지시 밖으로 추가했다.

## 이번 실행

모델별 서브에이전트: sonnet 6·haiku 4(연구 문서 1 포함), 승격 0. 첫 시도는 격리 작업 트리가 연구 저장소로 잡혀 7개가 시작하지 못해, 제품 작업 트리를 직접 만들어 같은 모델로 재실행했다.
