# 작업 목록

위에서부터 순서대로 한다. 각 작업 `<이름>` = 연구 `experiment/<이름>` + 제품 `feat/<이름>` 브랜치·PR 한 쌍.
감독이 검증 후 병합하며 체크·날짜·제품 커밋을 적는다. 막혀서 건너뛰면 `[~]` 로 표시하고 이유를 적는다. 감독이 순서를 바꿀 수 있다.
FEEDBACK 의 열린 항목이 새 작업보다 먼저다.

## 태그

- **[cloud]** — GPU 없이 완결·검증 가능: 자산 포맷·LOD·컬링·직렬화, 프로토콜, CPU 참조 구현, 합성 장면 정량 테스트, 클라이언트 측(헤드리스 검증), 문서. 자동 주기 세션이 돈다.
- **[local]** — GPU 가 필요: 래스터화 커널, 비디오 인코더, 실기기 fps 측정, 실데이터. **사람이 띄운 세션에서만** 한다. 자동 주기 세션은 [local] 을 건너뛰고 STATUS `다음 할 일` 에 남긴다.
- 클라우드 세션에는 GPU 가 없고 GPU 서버에도 닿지 않는다.

## 병렬 구현 규약 (모든 [cloud] 작업 공통)

1. **계약 하위 작업 `.0` 을 작업자가 직접 먼저 커밋한다.** 인터페이스·타입·자산 포맷 조각·테스트 픽스처·빈 테스트 이름까지. 계약이 제품 `feat/<작업>` 에 푸시되기 전에는 서브에이전트를 띄우지 않는다.
2. 나머지 하위 작업(`.1` 부터, 작업마다 10개 이상)은 서브에이전트에게 하나씩 맡긴다. 각자 **격리된 작업 트리**에서 `feat/<작업>` 의 계약 커밋 위에 시작한다.
3. **소유 경로**: 하위 작업은 표에 적힌 경로만 만들고 고친다. 같은 작업 안에서 소유 경로는 겹치지 않는다. 계약(`contracts/<모듈>`)을 고쳐야 하면 서브에이전트는 고치지 말고 작업자에게 돌려보낸다.
4. 공용 파일(빌드 설정·의존성 목록·CI·README)은 **작업자만** 고친다. 서브에이전트는 필요한 변경을 보고에 적는다.
5. **완료 기준**: 표의 테스트가 통과하고 수치를 만족해야 완료. 통합·전체 테스트·검증은 작업자 본인이 한다.
6. 경로 표기: 스택이 T02 에서 정해지기 전이므로 디렉터리 단위로 적는다. 파일 확장자·빌드 단위는 T02 결정을 따른다. 테스트 이름은 그대로 쓴다.

## 제품 저장소 배치 (T03 계약에서 확정)

```
contracts/   모듈별 인터페이스·타입 (작업자 소유)
format/      자산 포맷 명세 문서·스키마 (작업자 소유)
fixtures/    합성 장면·고정 시점·골든 파일
server/      서버 측 모듈 (모듈마다 하위 디렉터리)
client/      클라이언트 측 모듈 (모듈마다 하위 디렉터리)
bench/       측정 도구
tools/       명령줄 도구
```

---

## 1단계 — 경로 B (자산 경량화)

- [x] **T01 `baseline`** [cloud 부분] — 현재 three.js 구현의 기준값 측정. SPEC §4 의 "현재" 열을 채운다. (2026-10-01 병합, 제품 48b4c1d, 연구 research 5789e63, 반려 3회 뒤 범위 쪼갬)
- [ ] **T01L `baseline-local`** [local] — T01.4·T01.5 실제 녹화, T01.10 녹화 포함 재검, T01.11·T01.12 실측, F-027 앱 로더 대조. 사람의 녹화·실기기 필요.
- [x] **T01F `baseline-fixes`** [cloud] — T01 중간·낮음 잔여(F-022·F-028~F-031). (2026-10-01 병합, 제품 3e2c4c4, 연구 research 8b26c7d, 반려 0회. F-028~F-031 닫음, F-022 다시 엶)
- [x] **T01G `baseline-fixes-2`** [cloud] — T01F 검토 잔여 중간·낮음(F-022·F-032~F-036·F-041). (2026-10-01 병합, 제품 2a61035 merge commit, 연구 research 5188cf2, 반려 0회. F-022·F-032~F-035·F-041 닫음, F-036 다시 엶)
- [x] **T01H `baseline-fixes-3`** [cloud] — T01G 검토 잔여 중간·낮음(F-036·F-042~F-046). 측정 도구 마무리. (2026-10-01 병합, 제품 612eeae merge commit, 연구 research ed23b32, 반려 0회. F-036·F-042~F-046 닫음) 이 뒤 T01 계열 새 잔여는 중간·낮음이면 T01L 또는 다음 기능 작업과 함께 고친다.
- [x] **T01I `baseline-fixes-4`** [cloud] — T01H 검토 잔여 F-047(중간)·F-048(낮음), T01.26~T01.28. (2026-10-01 병합, 제품 003e34b merge commit, 연구 research 4e7b9ff, 반려 0회. F-047·F-048 닫음. 작업 중 감독이 보충한 T01.29·T01.30 은 PR 에 없어 T01J 로 옮김)
- [x] **T01J `baseline-fixes-5`** [cloud] — T01I 검토 잔여와 옮긴 항목: F-049·F-051(중간), F-050·F-052(낮음). T01.29·T01.30·T01.31·T01.32. T02 가 사람 결정(Q1·Q6) 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-5, 연구 experiment/baseline-fixes-5. (2026-10-01 병합, 제품 1c99f60 merge commit, 연구 research f1335ac, 반려 0회. F-049~F-052 닫음)
- [x] **T01K `baseline-fixes-6`** [cloud] — T01J 검토 잔여: F-053(중간), F-054·F-055(낮음). T01.33·T01.34. T02 가 사람 결정(Q1·Q6) 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-6, 연구 experiment/baseline-fixes-6. (2026-10-01 병합, 제품 6b0cb9f merge commit, 연구 experiment/baseline-fixes-5 7a5a21f, 반려 0회. F-054 닫음. F-053 본문 해결·보충 미처리, F-055 미처리 → T01M)
- [x] **T01M `baseline-fixes-7`** [cloud] — T01K 검토 잔여: F-053 보충·보충 2(중간), F-056(중간), F-055(낮음). T01.35·T01.36. T02 가 사람 결정 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-7, 연구 experiment/baseline-fixes-7. (2026-10-01 병합, 제품 8b88f98 merge commit, 연구 experiment/baseline-fixes-5 f2d782b, 반려 0회. F-053·F-056 닫음, F-055 ② 와 F-057 → T01N)
- [x] **T01N `baseline-fixes-8`** [cloud] — T01M 검토 잔여: F-055 ②, F-057(모두 낮음). T01.37·T01.38. T02 가 사람 결정 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-8, 연구 experiment/baseline-fixes-8. 제품 코드·테스트 이름에 FEEDBACK 번호를 넣지 않는다. (2026-10-02 병합, 제품 26b68a3 merge commit, 연구 experiment/baseline-fixes-7 a581af2, 반려 0회. F-055·F-057 닫음, F-058 → T01P)
- [ ] **T01P `baseline-fixes-9`** [cloud] — T01N 검토 잔여: F-058(중간 1·낮음 6). T01.39·T01.40. T02 가 사람 결정 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-9, 연구 experiment/baseline-fixes-9(부모 experiment/baseline-fixes-8). 제품 코드·테스트 이름에 FEEDBACK 번호를 넣지 않는다.
- [ ] **T02 `stack`** — 스택 선정. 서버 래스터라이저(2단계)·자산 처리 서버·클라이언트 경량 래스터라이저를 무엇으로 쓸지 조사. **감독 승인 전에는 T03 이후를 시작하지 않는다.**
- [ ] **T03 `asset-format`** — 경량 자산 포맷 계약과 핵심 타입.
- [ ] **T04 `point-io`** — 27 B 점 형식 입출력과 ENU 좌표.
- [ ] **T05 `synthetic-scenes`** — 합성 장면·고정 시점 8곳·골든 파일.
- [ ] **T06 `reference-raster`** — CPU 참조 래스터라이저와 화질 지표.
- [ ] **T07 `lod`** — 거리 제곱 근거의 LOD 계층.
- [ ] **T08 `culling`** — 뷰 의존 컬링(절두체·법선·가림).
- [ ] **T09 `codec`** — 양자화·직렬화·압축.
- [ ] **T10 `levels`** — 딜레이 패턴 수준 상태(서버·클라이언트 공통).
- [ ] **T11 `protocol`** — 웹소켓 메시지·서버 송출 스케줄러.
- [ ] **T12 `client-raster`** — 클라이언트 경량 래스터라이저(B).
- [ ] **T13 `statusview-b`** — 현황판에 B 적용.
- [ ] **T14 `tower-assets`** — 관제탑 지형·드레이프·건물 자산 가공.
- [ ] **T15 `controlview-b`** — 관제탑에 B 적용.
- [ ] **T16 `load-harness`** — 측정 도구·동시 30명 부하 모의.
- [ ] **T17 `phase1-verify`** [local] — 기준 기기 실측으로 SPEC §4 B 열 전 항목 검증.

## 2단계 — 경로 A (픽셀 스트리밍, 현황판 저사양)

1단계 감독 확인 뒤에 상세화한다. 입력은 1단계 자산 포맷 그대로다.
- [ ] T20 `gpu-raster` [local] — 서버 GPU 래스터라이저(1단계 자산 입력)
- [ ] T21 `encoder` [local] — 비디오 인코딩·웹소켓 송출
- [ ] T22 `input-return` [cloud] — 입력 전송 규약·클라이언트 `<video>` 화면
- [ ] T23 `device-branch` [cloud] — 현황판 안의 기기 사양 분기와 폴백
- [ ] T24 `phase2-verify` [local] — SPEC §4 A 열 검증

---

## 작업 상세

### T01 `baseline` — [cloud] + [local]

현재 skylens(`develop`)의 three.js 구현을 그대로 잰다. 측정 결과는 실험 노트와 SPEC §4 "현재" 열에 적는다. 이 작업은 skylens 를 고치지 않는다.

| 하위 | 태그 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|---|
| T01.0 | cloud | 계약: 측정 결과 스키마(`metric`, `value`, `unit`, `device`, `method`, `commit`)와 고정 시점 8곳 초안 | `contracts/metrics/`, `fixtures/viewpoints/` | 스키마 검증 테스트 `metrics_schema_roundtrip` 통과, 시점 8개 | haiku |
| T01.1 | cloud | 현황판 3D 번들 크기(three·splat 라이브러리·statusview, gzip) | `bench/baseline/bundle_status/` | 같은 커밋에서 두 번 재서 바이트 동일 | sonnet |
| T01.2 | cloud | 관제탑 3D 번들 크기 | `bench/baseline/bundle_tower/` | 같은 커밋에서 두 번 재서 바이트 동일 | sonnet |
| T01.3 | cloud | 구간×수준 자산 바이트 집계(4수준·구간당 합) | `bench/baseline/asset_bytes/` | 27 B × 점 수 와 파일 크기 차 ≤ 헤더 크기 | sonnet |
| T01.4 | cloud | 웹소켓 프레임 바이트 기록기(모의 코어 재생) | `bench/baseline/ws_bytes/` | 녹화 재생 두 번 합계 일치 | sonnet |
| T01.5 | cloud | 관제탑 건물·지형 요청 수·바이트 집계(녹화 응답 사용, 외부 호출 없음) | `bench/baseline/tower_bytes/` | 건물 수 6,191 ± 1% 재현 | sonnet |
| T01.6 | cloud | 헤드리스 브라우저 첫 프레임 시간(소프트웨어 렌더, 참고값) | `bench/baseline/first_frame/` | 5회 중앙값·분산 기록 | sonnet |
| T01.7 | cloud | 헤드리스 JS 힙 사용량(참고값) | `bench/baseline/heap/` | 5회 중앙값 기록 | sonnet |
| T01.8 | cloud | 원본 점군 CPU 렌더로 고정 시점 8곳 기준 영상 생성(T06 이전 임시 구현) | `bench/baseline/ref_images/` | 8장, 같은 입력 재실행 시 바이트 동일 | opus |
| T01.9 | cloud | 측정 결과를 SPEC 표 형식 마크다운으로 내보내는 도구 | `tools/baseline_report/` | 스키마 → 표 변환 테스트 `baseline_report_table` 통과 | haiku |
| T01.10 | cloud | 측정 재현 스크립트(한 명령으로 T01.1~T01.8) | `bench/baseline/run_all/` | 클린 클론에서 한 번에 통과 | sonnet |
| T01.11 | local | 기준 기기 2종 fps·메모리·입력 지연 실측 | `bench/baseline/device/` | 기기당 3회, 중앙값·분위 기록 | sonnet |
| T01.12 | local | 실데이터 구간당 대역폭 실측 | `bench/baseline/real_bw/` | 구간당 바이트 기록(현재 약 67 MB 확인) | sonnet |
| T01.13 | cloud | F-022 ws_bytes 잔여(끝이 아닌 미완 구간·재전송 회차·stale 바이트·topLevel 경고) | `bench/baseline/ws_bytes/` | F-022 확인 기준 | sonnet |
| T01.14 | cloud | F-029·F-030 테스트·견고성 잔여 | `bench/baseline/`, `tests/` | F-029·F-030 확인 기준 | sonnet |
| T01.15 | cloud | F-028 측정 도구 성능·왜곡 잔여 | `bench/baseline/ref_images/`, `heap/`, `bundle_status/` | F-028 확인 기준 | sonnet |
| T01.16 | cloud | F-031 표기·출처 잔손질, F-027 실 PLY 위아래 분포 노트 | 제품 주석·연구 노트 | F-031 확인 기준 | haiku |
| T01.17 | cloud | F-022 relay 재생 회차·resend 뒤 원본·합계 safe integer·final/topLevel 표기 | `bench/baseline/ws_bytes/` | F-022 확인 기준 (가)~(라) | opus |
| T01.18 | cloud | F-032·F-041 ref_images 표기 분기·rgb·clip·비대칭 시점·대형 RSS 단언, ws_bytes·viewpoints 테스트 보강 | `bench/baseline/ref_images/`, `ws_bytes/`, `tests/` | F-032·F-041 확인 기준 | opus |
| T01.19 | cloud | F-033·F-034·F-035 heap 판정·지표 이름, 테스트 변형 잔여, run_all 견고성 | `bench/baseline/heap/`, `bundle_*/`, `tower_bytes/`, `run_all/` | F-033~F-035 확인 기준 | sonnet |
| T01.20 | cloud | F-036 측정 도구 부하·표기, 제품 테스트의 F-xxx 번호 제거 | `bench/baseline/_common/`, `bundle_status/` | F-036 확인 기준, `grep 'F-0[0-9][0-9]'` 0건 | haiku |
| T01.21 | cloud | F-042 ws_bytes 재전송 잔여(추월된 낮은 수준 resend, resend 만의 완결, resend 뒤 같은 수준 원본) | `bench/baseline/ws_bytes/` | F-042 확인 기준, F-022 (가)~(라) 유지 | opus |
| T01.22 | cloud | F-043 비대칭 시점 테스트에 R·t 와 무관한 독립 정답 | `bench/baseline/ref_images/` | F-043 확인 기준(t[0]·t[1] 부호 변형 실패) | opus |
| T01.23 | cloud | F-044 closure.mjs sources 추출 퇴행 수정·회귀 테스트 | `bench/baseline/bundle_status/` | F-044 확인 기준 | sonnet |
| T01.24 | cloud | F-036·F-046 래퍼 복원 동작 테스트, heap 0 프로세스 run 테스트 | `bench/baseline/_common/`, `heap/` | F-036·F-046 확인 기준 | sonnet |
| T01.25 | cloud | F-045 표기·주석·노트 잔여(연구 decision.md:85 포함) | 제품 주석, 연구 노트 | F-045 확인 기준 | haiku |
| T01.26 | cloud | F-047 ws_bytes resend 추월 기준(받은 수준 최고)·변형 생존 테스트 5건 | `bench/baseline/ws_bytes/` | F-047 확인 기준, F-042·F-022 유지 | opus |
| T01.27 | cloud | F-048 ① heap statm 유한 검사 | `bench/baseline/heap/` | F-048 ① 확인 기준 | sonnet |
| T01.28 | cloud | F-048 ②~⑥ tmp 정리·basisNote 순서·closure 표기·노트 숫자 | `_common/`, `heap/`, `ref_images/`, `bundle_status/` 테스트·주석, 연구 노트 | F-048 ②~⑤ 확인 기준 | haiku |
| T01.29 | cloud | F-049 ws_bytes final 판정 잔여(stale final·resend 전용 final 모드·미완 회차 표기) | `bench/baseline/ws_bytes/` | F-049 확인 기준, F-022·F-042·F-047 유지 | opus |
| T01.30 | cloud | F-050 테스트 공백(basisNote 별칭·법선 형·undefined, 3프레임 회차, 브라우저 없는 문법 테스트)·BOM·Set·주석 | `ref_images/`, `ws_bytes/`, `_common/`, `bundle_status/` | F-050 확인 기준 | sonnet |
| T01.31 | cloud | F-051 ws_bytes 원본 프레임 stale 판정을 받은 수준 최고(rhi) 기준으로 | `bench/baseline/ws_bytes/` | F-051 확인 기준, F-022·F-042·F-047 유지 | opus |
| T01.32 | cloud | F-052 bundle_status HTML 맵 입력 복원·parse-error 범위·경고, statm 음수, propertyOrderCorrect 정리, 노트 수치 출처 | `bundle_status/`, `heap/`, `ref_images/`, 연구 노트 | F-052 확인 기준 | sonnet |
| T01.33 | cloud | F-053 ws_bytes final 을 추월된 낮은 수준에서만 무시(끊긴 같은 최고 수준 final 은 완결), F-053 보충(stale 조각 연속 규칙 통일), F-054 ①②⑤ 받은 수준 표기·final 경고 문구·단언 보충, F-055 ① | `bench/baseline/ws_bytes/` | F-053(보충 포함)·F-054 ①②⑤·F-055 ① 확인 기준, F-022·F-042·F-047·F-049·F-051 유지 | opus |
| T01.34 | cloud | F-054 ③ statm 빈 필드, ④ basisNote 주석·10속성 PLY 테스트, F-055 ②③④ 테스트 공백 | `bench/baseline/heap/`, `ref_images/`, `_common/` | F-054 ③④·F-055 ②③④ 확인 기준 | haiku |
| T01.35 | cloud | F-053 보충·보충 2: 끊긴 같은 최고 수준 원본을 '사본' 또는 '새 메시지' 중 한 규칙으로 정해 final·바이트·뒤 조각 판정 통일(주석·노트에 근거), F-055 ①, F-056 ① | `bench/baseline/ws_bytes/` | F-053 보충·보충 2·F-055 ①·F-056 ① 확인 기준, F-022·F-042·F-047·F-049·F-051·F-053 본문 유지 | opus |
| T01.36 | cloud | F-055 ②③④, F-056 ②~⑥ 테스트 공백·주석 | `bench/baseline/heap/`, `ref_images/`, `_common/`, 연구 노트 | F-055 ②③④·F-056 ②~⑥ 확인 기준 | haiku |
| T01.37 | cloud | F-057 ④ "같은 프레임 집합" 테스트에 손계산 리터럴 단언, ⑤ 사본 규칙이 skylens 송신 코드 미대조 가정임을 주석에 밝히고 run method 에 끊긴 같은 수준 사본 개수 표기, F-055 ② 감지 뒤 조기 반환(실제 buildDetectScript 에 호출 수 훅 + 테스트, 또는 두 줄 삭제) | `bench/baseline/ws_bytes/`, `bench/baseline/_common/` | F-057 ④⑤·F-055 ② 확인 기준, F-042·F-047·F-049·F-051·F-053 유지 | sonnet |
| T01.38 | cloud | F-057 ①②③ ref_images 주석·문서·colorType, ⑥⑦ heap 합 상한·혼합 테스트 | `bench/baseline/ref_images/`, `bench/baseline/heap/` | F-057 ①②③⑥⑦ 확인 기준 | haiku |
| T01.39 | cloud | F-058 ② copy_frames 직접 단언(개수 2·rhi/hi 구분·[L2 5, L1 3, L2 5 final]), ③ method·정의에 가정 단서, ④ 사본 규칙 근거 주석을 "가정:" 으로·stale 블록 주석 | `bench/baseline/ws_bytes/` | F-058 ②③④ 확인 기준, F-042·F-047·F-049·F-051·F-053 유지 | sonnet |
| T01.40 | cloud | F-058 ① PSS 개별·합 isSafeInteger + 테스트, ⑥ heap JSDoc null 조건·테스트 제목, ⑤ basisNote 문서·:496 문구·줄 번호 참조, ⑦ 테스트 훅 읽기 한 번 또는 옵션 주입, ⑧ heap 테스트 값을 페이지 크기에서 유도 | `bench/baseline/heap/`, `bench/baseline/ref_images/`, `bench/baseline/_common/` | F-058 ①⑤⑥⑦⑧ 확인 기준 | haiku |

완료 후: 감독이 SPEC §4 를 확정해 "제안값" → "확정" 으로 바꾼다.

### T02 `stack` — [cloud]

조사 문서 작업. 코드가 아니다. 결과는 연구 `experiment/stack` 의 실험 노트로 내고, 감독 승인 뒤 SPEC §8 에 옮긴다.

| 하위 | 내용 | 소유 경로(연구 저장소) | 완료 기준 | 모델 |
|---|---|---|---|---|
| T02.0 | 계약: 비교 표 틀(후보·라이선스·GPU 백엔드·헤드리스 가능·브라우저 지원·점 렌더 방식·성숙도·결정 근거) | `experiments/stack.md` 머리 | 표 열 고정 | haiku |
| T02.1 | 서버 래스터라이저 후보 조사(네이티브 GPU API 계열) | `experiments/stack/server_native.md` | 후보 3개 이상, 라이선스 명시 | sonnet |
| T02.2 | 서버 래스터라이저 후보 조사(헤드리스 웹 GPU 계열) | `experiments/stack/server_web.md` | 후보 2개 이상 | sonnet |
| T02.3 | 비디오 인코더 후보(2단계, 하드웨어 인코더 지원) | `experiments/stack/encoder.md` | 후보 2개 이상, 지연 수치 출처 | sonnet |
| T02.4 | 클라이언트 경량 래스터라이저 후보(WebGL2·WebGPU·직접 구현) | `experiments/stack/client.md` | 번들 크기 추정 ≤ 300 KB 근거 | sonnet |
| T02.5 | 자산 처리 서버 언어·런타임 후보 | `experiments/stack/runtime.md` | CPU 참조 구현·테스트 속도 비교 근거 | sonnet |
| T02.6 | 점 압축 포맷 선행 사례(라이선스 포함) | `experiments/stack/compression.md` | 사례 3개 이상 | sonnet |
| T02.7 | 3D 타일·LOD 표준 사례(지형·건물) | `experiments/stack/tiling.md` | 사례 2개 이상 | sonnet |
| T02.8 | 기존 skylens 와의 결합 방식(같은 저장소 패키지 vs 별도 서비스) — COMPONENTS 경계 안에서 | `experiments/stack/integration.md` | 경계 변경 없음을 명시 | sonnet |
| T02.9 | 라이선스 점검(후보 전체 의존성 트리에 AGPL·GPL 없음) | `experiments/stack/license.md` | 후보별 의존성 라이선스 목록 | sonnet |
| T02.10 | GPU 없는 클라우드 세션에서 검증 가능한 범위 정리 | `experiments/stack/cloud_scope.md` | [cloud]/[local] 경계 표 | sonnet |
| T02.11 | 추천안과 기각안(이유) | `experiments/stack/decision.md` | 감독 승인 | opus |
| T02.12 | 감독 검토 정정: F-037(NVENC nonfree 사실 오류)·F-038(클라이언트 추천의 Q1 조건)·F-039(별도 프로세스 = 경계 변경 후보, 사람 결정)·F-040(잔여) | `experiments/stack/` | F-037~F-040 확인 기준 | sonnet |

완료 후: 감독이 승인하면 SPEC §8, ops/WORKER.md·ops/SUPERVISOR.md 의 명령 자리를 채운다.

### T03 `asset-format` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T03.0 | 계약: 포맷 명세(헤더·타일·LOD 단계·조각·구간/수준 식별자·양자화 범위·체크섬), 핵심 타입, 골든 파일 1개 | `contracts/asset/`, `format/`, `fixtures/asset_golden/` | 명세 문서와 타입이 골든 파일을 읽어 필드 일치 | opus |
| T03.1 | 헤더 쓰기·읽기 | `server/asset/header/` | `header_roundtrip` 통과, 잘못된 매직·버전 거부 | sonnet |
| T03.2 | 타일 색인(ENU 사각 격자) | `server/asset/tile_index/` | `tile_index_lookup` 무작위 1만 점 오분류 0 | sonnet |
| T03.3 | 조각 경계 상자 계산 | `server/asset/bounds/` | `bounds_contain_all` 모든 점 포함, 여유 ≤ 양자화 1단계 | sonnet |
| T03.4 | 구간·수준 식별자 인코딩 | `server/asset/ids/` | `ids_roundtrip` 4수준×구간 1,000개 왕복 일치 | sonnet |
| T03.5 | 체크섬 | `server/asset/checksum/` | `checksum_detects_flip` 무작위 1비트 뒤집기 1,000회 전부 검출 | sonnet |
| T03.6 | 포맷 검증기(명세 위반 목록 출력) | `tools/asset_validate/` | 골든 통과, 손상 파일 10종 전부 거부 | sonnet |
| T03.7 | 원본 27 B 로 되돌리기(역변환) | `server/asset/unpack/` | `unpack_error_bound` 좌표 오차 ≤ 명세 상한 | opus |
| T03.8 | 클라이언트 측 헤더·색인 읽기 | `client/asset/` | 서버 쓰기 → 클라이언트 읽기 필드 일치 `client_header_parity` | sonnet |
| T03.9 | 포맷 결정성 검사 | `server/asset/determinism/` | 같은 입력 두 번 → 바이트 동일 | haiku |
| T03.10 | 버전 호환 정책 테스트(구버전 거부·신버전 무시 필드) | `server/asset/compat/` | `compat_matrix` 통과 | sonnet |
| T03.11 | 포맷 퍼저(손상 입력 패닉 0) | `server/asset/fuzz/` | 10만 회 패닉·무한 루프 0 | sonnet |

### T04 `point-io` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T04.0 | 계약: 점 타입(27 B), PLY 머리 규칙, `Gps`·`GeoAnchor`·`Enu` 타입 | `contracts/points/`, `contracts/geo/` | 타입 크기 27 B 단언 |
| T04.1 | 이진 PLY 읽기 | `server/points/ply_read/` | `ply_read_golden` 골든 파일 점 수·첫/끝 점 일치 |
| T04.2 | 이진 PLY 쓰기 | `server/points/ply_write/` | 쓰기→읽기 왕복 바이트 동일 |
| T04.3 | 스트리밍 읽기(메모리 상한) | `server/points/ply_stream/` | 250만 점 읽기 중 추가 메모리 ≤ 32 MB |
| T04.4 | 손상·불완전 PLY 거부 | `server/points/ply_robust/` | 손상 10종 패닉 0, 오류 반환 |
| T04.5 | GPS ↔ ENU (skylens `geo.ts` 와 같은 식) | `server/geo/enu/` | skylens 식과 무작위 1만 점 차 ≤ 1 mm |
| T04.6 | ENU ↔ 씬 좌표(x=동, y=위, z=−북) | `server/geo/scene/` | `scene_axes` 왕복 일치 |
| T04.7 | 클라이언트 측 같은 변환 | `client/geo/` | 서버 구현과 무작위 1만 점 차 ≤ 1 mm |
| T04.8 | 법선 정규화·검사(NaN·0 벡터 처리) | `server/points/normals/` | 단위 길이 오차 ≤ 1e-6, NaN 0 |
| T04.9 | 점 통계(점 수·경계·밀도) 도구 | `tools/points_stat/` | 골든 파일 통계 일치 |
| T04.10 | 구간 PLY 묶음 읽기(구간×수준 이름 규칙) | `server/points/segments/` | 4수준×3구간 묶음 식별 100% |

### T05 `synthetic-scenes` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T05.0 | 계약: 장면 생성기 인터페이스(시드·점 수·구간 수·수준 수), 고정 시점 8곳 확정 | `contracts/scenes/`, `fixtures/viewpoints/` | 시점 8곳 위치·자세가 문서와 일치 |
| T05.1 | 평지 + 상자 건물 장면(무늬 텍스처, 법선 포함) | `fixtures/scenes/flat_boxes/` | 같은 시드 → 바이트 동일 |
| T05.2 | 완만한 지형 장면 | `fixtures/scenes/terrain/` | 같은 시드 → 바이트 동일 |
| T05.3 | 무늬 없는 영역(흰 지붕·물) 빈자리 장면 | `fixtures/scenes/holes/` | 빈자리 비율 정답 기록 |
| T05.4 | 구간×4수준 점 수 사다리(낮은 수준 = 성긴 점) | `fixtures/scenes/levels/` | 수준별 점 수 단조 증가 |
| T05.5 | 250만 점 규모 장면(성능 시험용, 생성만) | `fixtures/scenes/large/` | 생성 시간 기록, 점 수 정확 |
| T05.6 | 깊이 오차 모형(Δd ≈ d²/(f·b)) 잡음 주입 | `fixtures/scenes/depth_noise/` | 거리별 잡음 표준편차가 식과 10% 이내 |
| T05.7 | 건물 외곽 돌출 장면(관제탑용, 1,000동) | `fixtures/scenes/buildings/` | 동 수 정확, 겹침 0 |
| T05.8 | DEM 타일 합성(관제탑용) | `fixtures/scenes/dem/` | 높이 왕복 오차 ≤ 0.1 m |
| T05.9 | 카메라 경로(드론 추적·자유 조작) | `fixtures/paths/` | 프레임 수·간격 정확 |
| T05.10 | 장면 미리보기 도구(CPU, PNG) | `tools/scene_preview/` | 8시점 이미지 생성 |

### T06 `reference-raster` — [cloud]

renderer_basis §2 의 투영식을 그대로 쓰는 CPU 참조 구현. 이후 모든 화질 비교의 기준이다.

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T06.0 | 계약: 카메라(K, R, t, 해상도), 렌더 결과(색·깊이·점 번호) 타입 | `contracts/raster/` | 타입 문서와 일치 |
| T06.1 | 투영 `X_c = R·X_w + t`, `[u,v,1]ᵀ ∝ K·X_c` | `server/raster_ref/project/` | renderer_basis §2-3 예제 픽셀 (396.27, 139.47) 를 0.01 px 이내 재현 |
| T06.2 | 역투영 `X_c = d·K⁻¹[u,v,1]ᵀ` | `server/raster_ref/unproject/` | 투영→역투영 왕복 ≤ 1e-6 m |
| T06.3 | 해상도에 따른 K 환산 | `server/raster_ref/intrinsics/` | 2048→960 에서 renderer_basis §1-2 K 값 재현 |
| T06.4 | 점 스플랫(크기 = 거리 반비례) | `server/raster_ref/splat/` | 단일 점 픽셀 반경 해석해와 일치 |
| T06.5 | 깊이 버퍼·가까운 점 우선 | `server/raster_ref/zbuffer/` | 겹친 두 점 테스트 100% |
| T06.6 | 법선 셰이딩(램버트) | `server/raster_ref/shade/` | 해석해 대비 오차 ≤ 1/255 |
| T06.7 | 빈자리 그대로 두기(메우기 금지 검사) | `server/raster_ref/no_fill/` | holes 장면에서 빈 픽셀 수 = 정답 |
| T06.8 | SSIM 계산 | `server/metrics/ssim/` | 공개 참조값(표준 시험 영상 쌍)과 1e-3 이내 |
| T06.9 | PSNR·빈 픽셀 비율 지표 | `server/metrics/psnr/` | 해석 예제 일치 |
| T06.10 | 고정 시점 8곳 일괄 렌더 도구 | `tools/render_views/` | 8장 생성, 재실행 바이트 동일 |
| T06.11 | 성능 기록(250만 점 1장 CPU 시간) | `bench/raster_ref/` | 시간 기록(기준 아님) |

### T07 `lod` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T07.0 | 계약: LOD 노드·단계·선택 함수 서명, 단계별 밀도 규칙(거리 제곱) | `contracts/lod/` | 서명 문서와 일치 |
| T07.1 | 격자 대표점 축소(복셀) | `server/lod/voxel/` | 축소 후 점이 입력 점의 부분집합(새 점 생성 0) |
| T07.2 | 팔진 트리 계층 구축 | `server/lod/octree/` | 모든 점이 정확히 한 잎에 있음 |
| T07.3 | 단계 간격 = Δd ≈ d²/(f·b) 근거 거리표 | `server/lod/distance_table/` | 거리별 단계가 식과 일치 |
| T07.4 | 화면 공간 오차 기반 단계 선택 | `server/lod/select/` | 고정 시점 8곳 SSIM ≥ 0.95(참조 래스터라이저) |
| T07.5 | 점 예산 상한 하 선택 | `server/lod/budget/` | 예산 초과 0, 예산 내 SSIM 최대 |
| T07.6 | 법선 대표값(축소 시) | `server/lod/normals/` | 대표 법선 단위 길이, 각 오차 기록 |
| T07.7 | 색 대표값(축소 시) | `server/lod/colors/` | 평균색 오차 ≤ 1/255 |
| T07.8 | 이웃 시점 점수(공유 점·광선 각·축척) 기반 우선순위 | `server/lod/view_score/` | renderer_basis §3 예제 순위 재현 |
| T07.9 | 점진 순서(거친 단계 먼저) | `server/lod/progressive/` | 앞부분 k% 만으로 SSIM 단조 증가 |
| T07.10 | 구간당 크기 집계 | `bench/lod/` | 250만 점 구간 → 자산 크기 기록(목표 ≤ 3 MB 대비) |
| T07.11 | 빈자리 보존 검사 | `server/lod/no_fill/` | holes 장면 빈 픽셀 비율 원본과 같음 |

### T08 `culling` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T08.0 | 계약: 시점 상태·컬링 결과(조각 목록) 타입 | `contracts/cull/` | 타입 문서와 일치 |
| T08.1 | 절두체 컬링 | `server/cull/frustum/` | 거짓 제거 0(보수적), 고정 시점 8곳 |
| T08.2 | 법선 기반 뒷면 제거(조각 단위 법선 원뿔) | `server/cull/backface/` | 렌더 결과 SSIM 변화 ≤ 0.002 |
| T08.3 | 거친 가림(깊이 피라미드, CPU) | `server/cull/occlusion/` | 거짓 제거 0, 제거율 기록 |
| T08.4 | 거리 컷 | `server/cull/distance/` | 경계 시험 통과 |
| T08.5 | 시점 예측(이동 방향 앞당겨 보내기) | `server/cull/predict/` | 경로 재생 시 빠진 조각 0 |
| T08.6 | 조각 우선순위 정렬 | `server/cull/priority/` | 화면 기여 순 정렬 검사 |
| T08.7 | 클라이언트 측 절두체 컬링 | `client/cull/` | 서버 결과와 조각 목록 일치 |
| T08.8 | 컬링 + LOD 결합 선택 | `server/cull/combine/` | 8시점 SSIM ≥ 0.95, 조각 수 기록 |
| T08.9 | 컬링 비용 측정 | `bench/cull/` | 시점당 CPU 시간 기록 |
| T08.10 | 퇴화 시점(지면 아래·NaN·0 화각) 처리 | `server/cull/degenerate/` | 패닉 0, 빈 결과 |

### T09 `codec` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T09.0 | 계약: 양자화 범위·비트 수, 압축 블록 형식 | `contracts/codec/` | 명세와 타입 일치 |
| T09.1 | 위치 양자화(조각 상자 기준) | `server/codec/position/` | 오차 ≤ 명세 상한(예: 1 cm) |
| T09.2 | 법선 양자화(팔면체 사상) | `server/codec/normal/` | 각 오차 ≤ 1° |
| T09.3 | 색 양자화·팔레트 | `server/codec/color/` | 평균 오차 ≤ 2/255 |
| T09.4 | 순서 재배치(공간 채움 곡선) | `server/codec/order/` | 결정적, 압축률 향상 기록 |
| T09.5 | 엔트로피 부호화(허용 라이선스 라이브러리 또는 직접 구현) | `server/codec/entropy/` | 왕복 무손실 |
| T09.6 | 클라이언트 복호기 | `client/codec/` | 서버 부호화 → 클라이언트 복호 일치 |
| T09.7 | 점 1개당 바이트 측정 | `bench/codec/` | 27 B 대비 비율 기록 |
| T09.8 | 손상 블록 거부 | `server/codec/robust/` | 퍼저 10만 회 패닉 0 |
| T09.9 | 복호 속도(클라이언트, CPU) | `bench/codec_client/` | 100만 점 복호 시간 기록 |
| T09.10 | 양자화 후 화질 | `server/codec/quality/` | 8시점 SSIM ≥ 0.98(양자화 전 대비) |

### T10 `levels` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T10.0 | 계약: 수준 상수(250·1,000·3,500·7,000), 구간 상태 기계 서명 | `contracts/levels/` | 상수 4개 고정 |
| T10.1 | 서버 측 구간 상태(최고 수준 기록) | `server/levels/state/` | 교체·건너뛰기 시험 전부 통과 |
| T10.2 | 추월당한 수준 건너뛰기 | `server/levels/skip/` | 순서 뒤바뀐 도착 1만 경우 전부 최고 수준 유지 |
| T10.3 | 교체 시 낮은 수준 조각 해제(누적 0) | `server/levels/replace/` | 교체 후 낮은 수준 조각 수 0 |
| T10.4 | 클라이언트 측 같은 상태 기계 | `client/levels/` | 서버와 같은 입력 열 → 같은 상태 |
| T10.5 | "없음" 표시 상태(도착 전 구간) | `client/levels/missing/` | 도착 전 구간 렌더 점 0, 표시 상태 참 |
| T10.6 | 마지막 수준 완료 표시 | `server/levels/final/` | 최종 플래그 시험 |
| T10.7 | 수준 이력 기록(디버그) | `server/levels/log/` | 이력이 입력 열과 일치 |
| T10.8 | 무작위 순서 속성 시험 | `server/levels/property/` | 무작위 10만 열 불변식 위반 0 |
| T10.9 | 타이머 진행 금지 검사(시간 흘려도 상태 불변) | `server/levels/no_timer/` | 가짜 시계 1시간 진행 후 상태 불변 |
| T10.10 | skylens `splatScene.ts` 동작과 대조표 | `server/levels/parity/` | 기존 동작 시험 사례 전부 일치 |

### T11 `protocol` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T11.0 | 계약: 웹소켓 메시지 종류(시점 갱신·조각 요청·조각·수준 도착·없음·오류), 이진 머리 | `contracts/proto/` | 명세 문서와 타입 일치 |
| T11.1 | 메시지 부호화·복호(서버) | `server/proto/codec/` | 전 종류 왕복 일치 |
| T11.2 | 메시지 부호화·복호(클라이언트) | `client/proto/` | 서버와 교차 왕복 일치 |
| T11.3 | 웹소켓 서버 골격(설정은 환경 변수, 주소·포트 기본값을 저장소에 두지 않음) | `server/ws/` | 접속·종료 시험, 저장소에 주소·포트 문자열 0 |
| T11.4 | 송출 스케줄러(우선순위·대역 예산) | `server/scheduler/` | 예산 초과 0, 우선순위 순서 |
| T11.5 | 초기 묶음(첫 프레임용 최소 조각) | `server/scheduler/initial/` | 합성 장면 초기 ≤ 15 MB |
| T11.6 | 역압(느린 클라이언트) 처리 | `server/ws/backpressure/` | 버퍼 상한 초과 0 |
| T11.7 | 재접속·이어받기 | `server/ws/resume/` | 재접속 후 중복 조각 0 |
| T11.8 | skylens 코어 이벤트 어댑터(구간·수준 도착 → 렌더러) | `server/adapter/core/` | 녹화 이벤트 재생 시 상태 일치 |
| T11.9 | 모의 클라이언트(시험용) | `tools/mock_client/` | 경로 재생 스크립트 동작 |
| T11.10 | 프로토콜 퍼저 | `server/proto/fuzz/` | 10만 회 패닉 0 |
| T11.11 | 바이트 집계 | `bench/proto/` | 구간당 바이트 기록(≤ 3 MB 대비) |

### T12 `client-raster` — [cloud] (fps 확정 측정은 T17 [local])

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T12.0 | 계약: 클라이언트 렌더러 인터페이스(조각 올리기·내리기·시점·그리기) | `contracts/client_raster/` | 서명 문서와 일치 |
| T12.1 | 렌더 문맥 초기화·소실 복구 | `client/raster/context/` | 헤드리스 소프트웨어 렌더에서 초기화 성공 |
| T12.2 | 점 셰이더(크기·색·법선 셰이딩) | `client/raster/shader/` | 참조 래스터라이저와 8시점 SSIM ≥ 0.95(헤드리스) |
| T12.3 | 조각 버퍼 관리(올리기·해제·상한) | `client/raster/buffers/` | 해제 후 누수 0, 상한 준수 |
| T12.4 | 카메라·K 환산(장치 픽셀 비) | `client/raster/camera/` | 해상도 바꿔도 투영 일치 ≤ 0.5 px |
| T12.5 | 프레임 루프(조각 도착과 그리기 분리) | `client/raster/loop/` | 도착 폭주 중 프레임 누락 기록 |
| T12.6 | 빈자리 표시(메우기 금지) | `client/raster/missing/` | holes 장면 빈 픽셀 = 참조 |
| T12.7 | 메모리 집계 | `client/raster/memory/` | 집계값과 실제 버퍼 합 일치 |
| T12.8 | 번들 크기 검사(CI 문턱 300 KB) | `bench/client_bundle/` | gzip ≤ 300 KB |
| T12.9 | 헤드리스 화면 캡처 시험 틀 | `client/raster/test_harness/` | 8시점 캡처 재현 |
| T12.10 | 입력 → 화면 지연 계측 지점 | `client/raster/latency/` | 계측 이벤트 기록 |

### T13 `statusview-b` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T13.0 | 계약: 현황판 화면 어댑터 인터페이스(기존 `splatScene.ts` 공개 메서드와 대응표) | `contracts/statusview/` | 대응표 전 메서드 포함 |
| T13.1 | 구간 도착 → 조각 요청 | `client/status/arrival/` | 녹화 재생 시 요청 순서 일치 |
| T13.2 | 수준 교체 화면 반영 | `client/status/levels/` | 교체 후 낮은 수준 점 0 |
| T13.3 | 도착 기준 노출(기존 `splatReveal.ts` 의미) | `client/status/reveal/` | 도착 전 구간 점 0 |
| T13.4 | 카메라 동기(기존 `cameraSync.ts` 의미) | `client/status/camera/` | 기존 시험 사례 일치 |
| T13.5 | 드론·마커 덧그리기(기존 오버레이 유지) | `client/status/overlay/` | 마커 위치 ENU 일치 ≤ 1 cm |
| T13.6 | "없음" 안내 표시 | `client/status/missing_ui/` | 미도착 구간에 안내 표시 |
| T13.7 | 폴백 화면(SPEC §5 제안, 사람 확인 전 임시) | `client/status/fallback/` | 서버 불가 모의 시 폴백 표시 |
| T13.8 | 통합 시험(모의 코어 + 모의 렌더 서버) | `client/status/e2e/` | 3구간×4수준 재생 시 상태 일치 |
| T13.9 | 대역폭 측정(현황판 경로) | `bench/status_bw/` | 초기 ≤ 15 MB, 구간당 ≤ 3 MB(합성) |
| T13.10 | 화질 측정(현황판 8시점) | `bench/status_quality/` | SSIM ≥ 0.95 |

### T14 `tower-assets` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T14.0 | 계약: 지형 타일·드레이프·건물 자산 형식(T03 포맷 확장) | `contracts/tower_assets/` | 명세 일치 |
| T14.1 | DEM 타일 → 지형 격자 LOD | `server/terrain/mesh_lod/` | 높이 오차 단계별 상한 이내 |
| T14.2 | 위성 영상 드레이프 타일(밉 단계) | `server/terrain/drape/` | 단계별 크기 기록, 좌표 정합 ≤ 1 px |
| T14.3 | 건물 외곽 돌출 → 프리즘 | `server/buildings/extrude/` | 동 수 보존, 높이 규칙(층×3 m, 기본 6 m) 일치 |
| T14.4 | 건물 LOD(먼 곳 상자 합치기) | `server/buildings/lod/` | 8시점 SSIM ≥ 0.95 |
| T14.5 | 건물 점 표시 옵션용 표본 | `server/buildings/points/` | 동별 표본 수 규칙 일치 |
| T14.6 | 검정 텍스처 건물(기본)·선 표시 자산 | `server/buildings/black/` | 모서리 선 수 = 정답 |
| T14.7 | 실사 항공뷰 UV | `server/buildings/aerial_uv/` | UV 범위 [0,1], 정합 ≤ 1 px |
| T14.8 | 타일 공간 색인(관제탑 범위) | `server/terrain/tile_index/` | 무작위 조회 오분류 0 |
| T14.9 | 6,191동 규모 처리 시간·크기 | `bench/tower_assets/` | 크기 기록(초기 ≤ 15 MB 대비) |
| T14.10 | 외부 호출 없는 녹화 입력 사용 검사 | `server/terrain/offline/` | 시험 중 네트워크 호출 0 |

### T15 `controlview-b` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T15.0 | 계약: 관제탑 화면 어댑터 인터페이스(기존 `towerViewer.ts` 공개 메서드 대응표) | `contracts/controlview/` | 대응표 전 메서드 포함 |
| T15.1 | 지형 그리기 | `client/tower/terrain/` | 8시점 SSIM ≥ 0.95 |
| T15.2 | 드레이프 그리기 | `client/tower/drape/` | 정합 ≤ 1 px |
| T15.3 | 건물 그리기(3옵션 전환, 재요청 없음) | `client/tower/buildings/` | 전환 시 네트워크 요청 0 |
| T15.4 | 방향키 조향·Q/E 고도 로컬 처리 | `client/tower/input/` | 입력→카메라 갱신이 같은 프레임 안 |
| T15.5 | 추적 카메라(기존 감쇠 의미) | `client/tower/chase/` | 기존 시험 사례 일치 |
| T15.6 | 드론·경로·탐지 마커 | `client/tower/overlay/` | 위치 ENU 일치 ≤ 1 cm |
| T15.7 | 시점 이동에 따른 조각 요청 | `client/tower/streaming/` | 경로 재생 시 빠진 조각 0 |
| T15.8 | 폴백(2D 지도 표시, 사람 확인 전 임시) | `client/tower/fallback/` | 서버 불가 모의 시 표시 |
| T15.9 | 통합 시험 | `client/tower/e2e/` | 녹화 재생 상태 일치 |
| T15.10 | 번들·대역폭 측정 | `bench/tower/` | 번들 ≤ 300 KB, 초기 ≤ 15 MB |

### T16 `load-harness` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 |
|---|---|---|---|
| T16.0 | 계약: 부하 시나리오 형식(접속 수·경로·시간), 결과 스키마(T01 스키마 재사용) | `contracts/load/` | 스키마 검증 |
| T16.1 | 모의 클라이언트 30개 동시 구동 | `bench/load/clients/` | 30개 동시 접속 유지 |
| T16.2 | 서버 CPU·메모리 기록 | `bench/load/server_stats/` | 1초 간격 기록 |
| T16.3 | 클라이언트별 바이트·지연 기록 | `bench/load/per_client/` | 30개 각각 기록 |
| T16.4 | 첫 프레임 시간 분포 | `bench/load/first_frame/` | 30명 95% 분위 ≤ 3 s(헤드리스 참고) |
| T16.5 | 대역 총합 | `bench/load/bandwidth/` | 총합 기록 |
| T16.6 | 수준 도착 폭주 시나리오 | `bench/load/burst/` | 상태 불변식 위반 0 |
| T16.7 | 느린 회선 모의 | `bench/load/slow_link/` | 역압 동작 |
| T16.8 | 결과 → SPEC §4 표 보고서 | `tools/load_report/` | 표 생성 |
| T16.9 | 회귀 문턱 파일(확정 기준값) | `bench/thresholds/` | 문턱 초과 시 실패 종료 |
| T16.10 | 한 명령 재현 | `bench/load/run_all/` | 클린 클론에서 통과 |

### T17 `phase1-verify` — [local]

| 하위 | 내용 | 완료 기준 |
|---|---|---|
| T17.1 | 저사양 기준 기기: S1·S3·S5·S7 | SPEC §4 B 열 |
| T17.2 | 고사양 기준 기기: S2·S3·S5·S7 | SPEC §4 B 열 |
| T17.3 | 실데이터 구간: S6·S9 | SPEC §4 B 열 |
| T17.4 | 동시 30명 실측: S8 | SPEC §4 B 열 |
| T17.5 | 감독 직접 재현 | 감독 기록에 재현 결과 |
