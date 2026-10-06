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
- [x] **T01P `baseline-fixes-9`** [cloud] — T01N 검토 잔여: F-058(중간 1·낮음 6). T01.39·T01.40. T02 가 사람 결정 대기라 그 사이에 처리한다(감독 지정). 제품 feat/baseline-fixes-9, 연구 experiment/baseline-fixes-9(부모 experiment/baseline-fixes-8). 제품 코드·테스트 이름에 FEEDBACK 번호를 넣지 않는다. (2026-10-02 병합, 제품 11f6bf1 merge commit, 연구 experiment/baseline-fixes-8 acfdd28, 반려 0회. F-058 닫음, F-059 → T02 승인 뒤 첫 작업)
- [x] **T02 `stack`** — 스택 선정. 서버 래스터라이저(2단계)·자산 처리 서버·클라이언트 경량 래스터라이저를 무엇으로 쓸지 조사. (2026-10-02 감독 승인, 결정 0009 승인·0012~0014 반영, 연구 PR #3 → research merge commit ddd3219, 제품 변경 없음, 반려 0회)
- [x] **T03 `asset-format`** — 경량 자산 포맷 계약과 핵심 타입. 27 B 점·56 B 가우시안 두 입력 형식을 담는다(0012). 첫 하위 작업으로 F-059(T03.F, haiku)를 함께 처리한다. (2026-10-03 병합, 제품 5b41a3b merge commit, 연구 research f8d847f, 반려 1회. F-059~F-067 닫음, 잔여 F-068~F-070 → T04.F, 결정 0015 승인)
- [x] **T04 `point-io`** — 27 B 점·56 B 가우시안 PLY 입출력과 ENU 좌표. (2026-10-03 병합, 제품 a89fb27 merge commit, 연구 research 359532d, 반려 2회: 1회 F-071 높음, 2회 F-075 높음. F-068·F-071~F-078 닫음, 잔여 F-079~F-081 → T05.F, 결정 0016 기각·0017 승인)
- [x] **T05 `synthetic-scenes`** — 합성 장면·고정 시점 8곳·골든 파일. (2026-10-03 병합, 제품 b23c9fd merge commit, 연구 research 5227e84, 반려 1회: F-082·F-083·F-084 높음. F-082~F-088 닫음, 잔여 F-089~F-091 → T06.F·T06.F2, 결정 0018 승인)
- [x] **T06 `reference-raster`** — CPU 참조 래스터라이저와 화질 지표. (2026-10-03 병합, 제품 c64d34e merge commit, 연구 experiment/synthetic-scenes a8c111f, 반려 0회. F-089~F-091 닫음, 잔여 F-092~F-095 → T07.F·T07.F2, 결정 0019 승인)
- [x] **T07 `lod`** — 거리 제곱 근거의 LOD 계층. (2026-10-03 병합, 제품 3c150a7 merge commit, 연구 experiment/reference-raster b1a2b3f, 반려 0회. F-092~F-095 닫음, 잔여 F-096~F-100 → T08.F·F2·F3, T07.8 실데이터 순위는 [local] T07L.1, 결정 0020 승인)
- [ ] **T08 `culling`** — 뷰 의존 컬링(절두체·법선·가림).
- [x] **T09 `codec`** — 양자화·직렬화·압축. (2026-10-03 PR #36 병합, 반려 1회, 제품 3d3a26f)
- [x] **T10 `levels`** — 딜레이 패턴 수준 상태(서버·클라이언트 공통). (2026-10-04 PR #38 병합, 반려 0회, 제품 dbb59e7 merge commit, 연구 experiment/codec-review-fixes 53aca0f. 잔여 중간 F-178~F-183 → T10.F, 원본 대조 [local] T10.10L)
- [x] **T11 `protocol`** — 웹소켓 메시지·서버 송출 스케줄러. (2026-10-04 PR #39 병합, 반려 1회(F-184~F-189 높음), 제품 2b154aa merge commit, 연구 experiment/levels 57bbdc2. F-180·F-184~F-191·F-194~F-196 닫음, 잔여 중간 F-192·F-193·F-197~F-202·낮음 F-203 → T11.G, 결정 0030 승인)
- [x] **T12 `client-raster`** — 클라이언트 경량 래스터라이저(B). (2026-10-04 PR #51 병합 시점에 T12.0~T12.10 [cloud] 완료 기준 감독 재현 — 마지막 남은 T12.5 를 실제 createRenderer 경로 헤드리스 Chromium(SwiftShader) 60만 점 long task 0 으로 확인. ws 배선 F-238 ④ 와 잔여 F-250·F-251 은 T12.S, 실제 GPU fps 는 T17 [local])
- [x] **T13 `statusview-b`** — 현황판에 B 적용. (2026-10-04 제품 PR #56 병합, 반려 2회 뒤 검토 #3 통과, 제품 14ba5f4 merge commit, 연구 experiment/t12-client-raster-start 6956f33; S6 구간당은 T13.B, 남은 중간·낮음은 T13.R3)
- [x] **T14 `tower-assets`** — 관제탑 지형·드레이프·건물 자산 가공. (2026-10-04 제품 PR #59 병합으로 T14.4S 완료 — T14 [cloud] 전부 완료, 남은 중간·낮음은 T14.R4, 실제 입력은 T14L. 이전: 제품 PR #58 병합, 반려 3회 뒤 검토 #4 통과 — 범위 쪼개기: T14.0~T14.3·T14.5~T14.10 완료, T14.4 는 시드 스윕 잔여 F-331 로 T14.4S. 제품 eb41a71 squash(예외: 커밋 297026a 작성자 신원), 연구 experiment/t12-client-raster-start 6f3110d merge commit)
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

스택: Node.js 22 ESM, 테스트 `npm test`(SPEC §8). 입력 형식은 27 B 점과 56 B 가우시안 둘 다(결정 0012). 공통 필드(위치·색)와 형식별 선택 필드(법선 / 불투명도·크기·회전)를 한 포맷에 담는 안을 우선 검토하고, 두 포맷을 따로 두는 안과 비교한 근거를 T03 결정 기록(decisions/)에 남긴다.

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T03.F | F-059 잔여(낮음) 처리 — T03 계약 커밋 전에 먼저 | F-059 위치의 기존 파일 | F-059 확인 기준 | haiku |
| T03.0 | 계약: 포맷 명세(헤더·형식 표시(27 B 점/56 B 가우시안)·공통/선택 필드·타일·LOD 단계·조각·구간/수준 식별자·양자화 범위·체크섬), 핵심 타입, 골든 파일 형식별 1개씩(2개), 단일 포맷 대 분리 포맷 비교 결정 기록 | `contracts/asset/`, `format/`, `fixtures/asset_golden/` | 명세 문서와 타입이 두 골든 파일을 읽어 필드 일치, decisions/ 에 비교 근거 | opus |
| T03.1 | 헤더 쓰기·읽기 | `server/asset/header/` | `header_roundtrip` 통과, 잘못된 매직·버전 거부 | sonnet |
| T03.2 | 타일 색인(ENU 사각 격자) | `server/asset/tile_index/` | `tile_index_lookup` 무작위 1만 점 오분류 0 | sonnet |
| T03.3 | 조각 경계 상자 계산 | `server/asset/bounds/` | `bounds_contain_all` 모든 점 포함, 여유 ≤ 양자화 1단계 | sonnet |
| T03.4 | 구간·수준 식별자 인코딩 | `server/asset/ids/` | `ids_roundtrip` 4수준×구간 1,000개 왕복 일치 | sonnet |
| T03.5 | 체크섬 | `server/asset/checksum/` | `checksum_detects_flip` 무작위 1비트 뒤집기 1,000회 전부 검출 | sonnet |
| T03.6 | 포맷 검증기(명세 위반 목록 출력) | `tools/asset_validate/` | 골든 통과, 손상 파일 10종 전부 거부 | sonnet |
| T03.7 | 원본 형식(27 B 점·56 B 가우시안)으로 되돌리기(역변환) | `server/asset/unpack/` | `unpack_error_bound` 두 형식 모두 좌표 오차 ≤ 명세 상한, 형식별 선택 필드(법선 / 불투명도·크기·회전) 오차 ≤ 명세 상한 | opus |
| T03.8 | 클라이언트 측 헤더·색인 읽기 | `client/asset/` | 서버 쓰기 → 클라이언트 읽기 필드 일치 `client_header_parity`(두 형식) | sonnet |
| T03.9 | 포맷 결정성 검사 | `server/asset/determinism/` | 같은 입력 두 번 → 바이트 동일 | haiku |
| T03.10 | 버전 호환 정책 테스트(구버전 거부·신버전 무시 필드) | `server/asset/compat/` | `compat_matrix` 통과 | sonnet |
| T03.11 | 포맷 퍼저(손상 입력 패닉 0) | `server/asset/fuzz/` | 10만 회 패닉·무한 루프 0 | sonnet |
| T03.R1 | (반려 1회차, 먼저) F-060 checkDeterminism 기본 packFn·실제 pack 테스트 skip 제거·times 검사 | `server/asset/determinism/` | F-060 확인 기준 | sonnet |
| T03.R2 | (반려 1회차) F-061 unpack_error_bound 끝점 사례·제품 packChunk 경로·quantExp 등호 경계 | `server/asset/unpack/`, `server/asset/pack/`, `fixtures/asset_golden/` | F-061 확인 기준(변형 3종 각각 실패) | opus |
| T03.R3 | (반려 1회차, 중간) F-062 명세·0015 바이트 수치, F-063 pack lod 검사 | `format/`, `server/asset/pack/`, 연구 decisions/0015 | F-062·F-063 확인 기준 | haiku |
| T03.R4 | (반려 1회차, 중간) F-064 클라이언트 codec·음성 테스트, F-065 f32Toward 할당 제거, F-066 음성 테스트 | `client/asset/`, `server/asset/unpack/`, `tools/asset_validate/`, `server/asset/fuzz/` | F-064·F-065·F-066 확인 기준 | sonnet |

### T04 `point-io` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T04.F | (먼저) T03 검토 잔여: F-068 명세 문구(haiku 몫), F-069 비유한·이상 입력 처리, F-070 테스트 공백 | `format/`, `server/asset/`, `client/asset/`, `tools/asset_validate/` | F-068·F-069·F-070 확인 기준 | sonnet |
| T04.0 | 계약: 점 타입(27 B)과 가우시안 타입(56 B, `x y z f_dc_0..2 opacity scale_0..2 rot_0..3`), PLY 머리 규칙(두 형식 판별), `Gps`·`GeoAnchor`·`Enu` 타입 | `contracts/points/`, `contracts/geo/` | 타입 크기 27 B·56 B 단언 | sonnet |
| T04.1 | 이진 PLY 읽기(27 B·56 B 두 형식) | `server/points/ply_read/` | `ply_read_golden` 형식별 골든 파일 점 수·첫/끝 점 일치 | sonnet |
| T04.2 | 이진 PLY 쓰기 | `server/points/ply_write/` | 쓰기→읽기 왕복 바이트 동일 | sonnet |
| T04.3 | 스트리밍 읽기(메모리 상한) | `server/points/ply_stream/` | 250만 점 읽기 중 추가 메모리 ≤ 32 MB | sonnet |
| T04.4 | 손상·불완전 PLY 거부 | `server/points/ply_robust/` | 손상 10종 패닉 0, 오류 반환 | sonnet |
| T04.5 | GPS ↔ ENU (skylens `geo.ts` 와 같은 식) | `server/geo/enu/` | skylens 식과 무작위 1만 점 차 ≤ 1 mm | opus |
| T04.6 | ENU ↔ 씬 좌표(x=동, y=위, z=−북) | `server/geo/scene/` | `scene_axes` 왕복 일치 | opus |
| T04.7 | 클라이언트 측 같은 변환 | `client/geo/` | 서버 구현과 무작위 1만 점 차 ≤ 1 mm | sonnet |
| T04.8 | 법선 정규화·검사(NaN·0 벡터 처리) | `server/points/normals/` | 단위 길이 오차 ≤ 1e-6, NaN 0 | sonnet |
| T04.9 | 점 통계(점 수·경계·밀도) 도구 | `tools/points_stat/` | 골든 파일 통계 일치 | haiku |
| T04.10 | 구간 PLY 묶음 읽기(구간×수준 이름 규칙) | `server/points/segments/` | 4수준×3구간 묶음 식별 100% | sonnet |
| T04.R1 | (반려 1회차, 먼저) F-071: GPS↔ENU 를 skylens develop `src/shared/geo.ts` 식(등장방형, R=6378137)으로 교체(서버·클라이언트), geo.ts 기준 1만 점 테스트. F-072 좌표 계약 표현·이름 정리 | `server/geo/`, `client/geo/`, `contracts/geo/` | F-071·F-072 확인 기준 | opus |
| T04.R2 | F-073 점 입력 이상·큰 입력 처리 | `server/points/`, `tools/points_stat/`, `contracts/ply/` | F-073 확인 기준 | sonnet |
| T04.R3 | F-074 ①②③⑥⑧ 문구·단순 테스트(실제 skylens 56 B 헤더 리터럴 테스트 포함) | `format/`, `contracts/points/`, `server/points/`, `server/asset/determinism/` | F-074 해당 항목 | haiku |
| T04.R4 | F-074 ④⑤⑦⑨⑩⑪ 테스트 강화·segments 잡파일·writer 색 대입 | `server/points/`, `tools/points_stat/`, `client/geo/` | F-074 해당 항목 | sonnet |
| T04.R5 | (반려 2회차, 먼저) F-075 불안정 테스트(GC 강제·단측 단언), F-077 경계·음성 테스트, F-078 ①⑦ | `server/points/`, `contracts/ply/` | F-075·F-077 확인 기준, 같은 9파일 20회 실패 0 | sonnet |
| T04.R6 | F-076 enuToGps 결과 범위·극 앵커·서버 결과 유한 검사·checkEnu, F-078 ③ 클라이언트 다중 앵커 테스트 | `server/geo/`, `client/geo/` | F-076 확인 기준, geo.ts 1만 점 차 여전히 0 m | sonnet |
| T04.R7 | F-068 :249 문구, F-078 ②④⑤⑥⑧ 주석·문구·PR 본문 | `format/`, `contracts/`, `server/points/` | F-068 확인 기준, 해당 grep | haiku |

### T05 `synthetic-scenes` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T05.F | (먼저) T04 검토 잔여: F-079 GPS↔ENU 경계 왕복·날짜변경선 테스트(sonnet), F-080 복사 측정 테스트(sonnet), F-081 ①~⑥ 문구·소소한 검사(haiku 몫) | `server/geo/`, `client/geo/`, `server/points/`, `contracts/ply/`, `format/`, `README.md` | F-079·F-080·F-081 확인 기준 | sonnet |
| T05.0 | 계약: 장면 생성기 인터페이스(시드·점 수·구간 수·수준 수·출력 형식 27 B/56 B, 결정 0012), 고정 시점 8곳 확정 | `contracts/scenes/`, `fixtures/viewpoints/` | 시점 8곳 위치·자세가 문서와 일치 | opus |
| T05.1 | 평지 + 상자 건물 장면(무늬 텍스처, 법선 포함) | `fixtures/scenes/flat_boxes/` | 같은 시드 → 바이트 동일 | sonnet |
| T05.2 | 완만한 지형 장면 | `fixtures/scenes/terrain/` | 같은 시드 → 바이트 동일 | sonnet |
| T05.3 | 무늬 없는 영역(흰 지붕·물) 빈자리 장면 | `fixtures/scenes/holes/` | 빈자리 비율 정답 기록 | sonnet |
| T05.4 | 구간×4수준 점 수 사다리(낮은 수준 = 성긴 점) | `fixtures/scenes/levels/` | 수준별 점 수 단조 증가 | sonnet |
| T05.5 | 250만 점 규모 장면(성능 시험용, 생성만) | `fixtures/scenes/large/` | 생성 시간 기록, 점 수 정확 | haiku |
| T05.6 | 깊이 오차 모형(Δd ≈ d²/(f·b)) 잡음 주입 | `fixtures/scenes/depth_noise/` | 거리별 잡음 표준편차가 식과 10% 이내 | opus |
| T05.7 | 건물 외곽 돌출 장면(관제탑용, 1,000동) | `fixtures/scenes/buildings/` | 동 수 정확, 겹침 0 | sonnet |
| T05.8 | DEM 타일 합성(관제탑용) | `fixtures/scenes/dem/` | 높이 왕복 오차 ≤ 0.1 m | sonnet |
| T05.9 | 카메라 경로(드론 추적·자유 조작) | `fixtures/paths/` | 프레임 수·간격 정확 | sonnet |
| T05.10 | 장면 미리보기 도구(CPU, PNG) | `tools/scene_preview/` | 8시점 이미지 생성 | haiku |
| T05.R1 | (반려 1회차, 먼저) F-082 미리보기 좌우 반전: 카메라 기저를 GL 오른손계로(ref_images cameraExtrinsics 재사용 권장), floor 픽셀 규약, u 부호·8시점 ref_images 대조 시험 | `tools/scene_preview/` | F-082 확인 기준 | opus |
| T05.R2 | F-083 56 B 위치·fdc·scales·오프셋 레이아웃 시험, F-084 terrain·levels 법선을 유한차분 독립 정답으로 | `contracts/scenes/`, `fixtures/scenes/terrain/`, `fixtures/scenes/levels/` | F-083·F-084 확인 기준 | sonnet |
| T05.R3 | F-085 장면·도구 시험 공백(large 기본 실행 포함), F-086 입력 검증 공통화, F-087 depth_noise 기선 근거 | `fixtures/scenes/`, `fixtures/paths/`, `tools/scene_preview/`, `contracts/scenes/`, `contracts/ply/` | F-085·F-086·F-087 확인 기준 | sonnet |
| T05.R4 | F-088 haiku 표기 항목(③⑥⑦⑧⑨⑫⑬⑮⑯: 주석·README 한·영 T05 절·measure·결정 0018 수치·단순 시험). sonnet 표기 항목은 R2·R3 와 같은 소유 경로에서 함께 | `README.md`, `fixtures/scenes/large/measure.mjs`, 연구 `decisions/0018-*` | F-088 해당 항목 | haiku |

### T06 `reference-raster` — [cloud]

renderer_basis §2 의 투영식을 그대로 쓰는 CPU 참조 구현. 이후 모든 화질 비교의 기준이다.

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T06.F | (먼저) T05 검토 잔여: F-090 입력 유한성(depth_noise f·b, dem cell, 56 B 계약 필드, ENU 극 근처 경도 증분, 미리보기 픽셀 상한, 경로 fps·frames), F-089 시험 하한·정답 연결(paths·levels·terrain·buildings·viewpoints·ply_stream·enu), F-091 sonnet 표기 항목 | `fixtures/`, `contracts/scenes/`, `contracts/ply/`, `server/geo/enu/`, `server/points/ply_stream/`, `tools/scene_preview/`, `tests/` | F-089·F-090·F-091 확인 기준 | sonnet |
| T06.F2 | F-091 haiku 표기 항목(①②③⑤⑥⑨⑪⑫⑬: 단순 시험·주석·README 한·영·measure·연구 노트 수치) | `tools/scene_preview/`, `fixtures/scenes/large/measure.mjs`, `README.md`, 연구 `experiments/synthetic-scenes.md` | F-091 해당 항목 | haiku |
| T06.0 | 계약: 카메라(K, R, t, 해상도), 렌더 결과(색·깊이·점 번호) 타입 | `contracts/raster/` | 타입 문서와 일치 | sonnet |
| T06.1 | 투영 `X_c = R·X_w + t`, `[u,v,1]ᵀ ∝ K·X_c` | `server/raster_ref/project/` | renderer_basis §2-3 예제 픽셀 (396.27, 139.47) 를 0.01 px 이내 재현 | opus |
| T06.2 | 역투영 `X_c = d·K⁻¹[u,v,1]ᵀ` | `server/raster_ref/unproject/` | 투영→역투영 왕복 ≤ 1e-6 m | opus |
| T06.3 | 해상도에 따른 K 환산 | `server/raster_ref/intrinsics/` | 2048→960 에서 renderer_basis §1-2 K 값 재현 | opus |
| T06.4 | 점 스플랫(크기 = 거리 반비례) | `server/raster_ref/splat/` | 단일 점 픽셀 반경 해석해와 일치 | opus |
| T06.5 | 깊이 버퍼·가까운 점 우선 | `server/raster_ref/zbuffer/` | 겹친 두 점 테스트 100% | sonnet |
| T06.6 | 법선 셰이딩(램버트) | `server/raster_ref/shade/` | 해석해 대비 오차 ≤ 1/255 | sonnet |
| T06.7 | 빈자리 그대로 두기(메우기 금지 검사) | `server/raster_ref/no_fill/` | holes 장면에서 빈 픽셀 수 = 정답 | sonnet |
| T06.8 | SSIM 계산 | `server/metrics/ssim/` | 공개 참조값(표준 시험 영상 쌍)과 1e-3 이내 | sonnet |
| T06.9 | PSNR·빈 픽셀 비율 지표 | `server/metrics/psnr/` | 해석 예제 일치 | haiku |
| T06.10 | 고정 시점 8곳 일괄 렌더 도구 | `tools/render_views/` | 8장 생성, 재실행 바이트 동일 | haiku |
| T06.11 | 성능 기록(250만 점 1장 CPU 시간) | `bench/raster_ref/` | 시간 기록(기준 아님) | haiku |

### T07 `lod` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T07.F | (먼저) T06 검토 잔여: F-092(T06.1 반올림 전 입력 0.01 px 단언, T06.8 scikit-image 표준 영상 쌍 리터럴, 실험 노트 T06.8 표기), F-093(render_views 시야각 검사, 길이 0 법선 규칙, no_fill 점 수 정의, 56 B opacity·scale 기록, ssim 값 범위), F-094(no_fill 독립 정답, 시점 카메라 리터럴·골든, 경로 시드 선택), F-095 sonnet 표기 항목 | `server/raster_ref/`, `server/metrics/`, `contracts/raster/`, `tools/render_views/`, `bench/raster_ref/`, `fixtures/paths/`, 연구 `decisions/0019-*`·`experiments/reference-raster.md` | F-092·F-093·F-094·F-095(sonnet) 확인 기준 | sonnet |
| T07.F2 | F-095 haiku 표기 항목(①③④⑤⑥: 계약 문구·음성 시험·항상 참 시험 정리) | 위와 같음, `fixtures/scenes/terrain/`, `contracts/scenes/` | F-095 해당 항목 | haiku |
| T07.0 | 계약: LOD 노드·단계·선택 함수 서명, 단계별 밀도 규칙(거리 제곱) | `contracts/lod/` | 서명 문서와 일치 | sonnet |
| T07.1 | 격자 대표점 축소(복셀) | `server/lod/voxel/` | 축소 후 점이 입력 점의 부분집합(새 점 생성 0) | sonnet |
| T07.2 | 팔진 트리 계층 구축 | `server/lod/octree/` | 모든 점이 정확히 한 잎에 있음 | sonnet |
| T07.3 | 단계 간격 = Δd ≈ d²/(f·b) 근거 거리표 | `server/lod/distance_table/` | 거리별 단계가 식과 일치 | opus |
| T07.4 | 화면 공간 오차 기반 단계 선택 | `server/lod/select/` | 고정 시점 8곳 SSIM ≥ 0.95(참조 래스터라이저) | opus |
| T07.5 | 점 예산 상한 하 선택 | `server/lod/budget/` | 예산 초과 0, 예산 내 SSIM 최대 | opus |
| T07.6 | 법선 대표값(축소 시) | `server/lod/normals/` | 대표 법선 단위 길이, 각 오차 기록 | sonnet |
| T07.7 | 색 대표값(축소 시) | `server/lod/colors/` | 평균색 오차 ≤ 1/255 | sonnet |
| T07.8 | 이웃 시점 점수(공유 점·광선 각·축척) 기반 우선순위 | `server/lod/view_score/` | renderer_basis §3 예제 순위 재현 | opus |
| T07.9 | 점진 순서(거친 단계 먼저) | `server/lod/progressive/` | 앞부분 k% 만으로 SSIM 단조 증가 | sonnet |
| T07.10 | 구간당 크기 집계 | `bench/lod/` | 250만 점 구간 → 자산 크기 기록(목표 ≤ 3 MB 대비) | haiku |
| T07.11 | 빈자리 보존 검사 | `server/lod/no_fill/` | holes 장면 빈 픽셀 비율 원본과 같음 | sonnet |
| T07L.1 | [local] T07.8 잔여: 실제 skylens COLMAP 데이터(points3D 관측 목록)로 renderer_basis §3-6 기준 camF_0030 이웃 순위표 재현 | `server/lod/view_score/` | §3-6 표 1~12위 순서 재현 | sonnet |

### T08 `culling` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T08.F [x] (2026-10-03 PR #17 병합, 제품 0ebcc40) | (먼저) T07 검토 잔여: F-096(T07.4·T07.5·T07.11 판별력 있는 시험, 실제 LOD 경로로 빈자리 검사), F-098(결정 0020 보완·T07.8 §3-6 표 행 순위 시험), F-099(progressive 카메라 검사, psnr 사례 4 복원) | `server/lod/`, `server/metrics/psnr/`, `bench/lod/`, 연구 `decisions/0020-*`·`experiments/lod.md` | F-096·F-098·F-099 확인 기준 | sonnet |
| T08.F2 [x] (2026-10-03 PR #17 병합, 제품 0ebcc40) | F-097 기하 보강(축 밖 화면 오차 cos² 보정, 칸이 리프 경계를 걸치지 않게, max(fx,fy)) | `server/lod/select/`, `server/lod/budget/`, `server/lod/progressive/`, `server/lod/hierarchy/` | F-097 확인 기준 | opus |
| T08.F3 [x] (2026-10-03 PR #17 병합, 제품 0ebcc40) | F-100 낮음 묶음(시험 정리·주석·계약 문구) | 항목별 경로 | F-100 해당 항목 | haiku |
| T08.F4 [x] (2026-10-03 PR #18 병합, 제품 ab06dc1) | (먼저) PR #17 검토 잔여: F-101(applyChunks 추월 건너뛰기, 빈자리 실경로 단계 0~3), F-102(시험 판별력: 4 평면·회전 카메라·paths jt·render_views 리터럴·budget_discrim 다중 시드), F-103(결정 0020 기록 보완·§3-6 상위 8 단언) | `server/lod/`, `fixtures/paths/`, `tools/render_views/`, 연구 `decisions/0020-*` | F-101·F-102·F-103 확인 기준 | sonnet |
| T08.F5 [x] (2026-10-03 PR #18 병합, 제품 ab06dc1) | F-099 ③ materialize 위치 구간 복사(단계별 대표점 위치 미리 담기), 첫 호출 포함 최댓값 < 100 ms | `server/lod/select/`, `server/lod/hierarchy/`, `bench/lod/` | F-099 ③ 확인 기준 | opus |
| T08.F6 [x] (2026-10-03 PR #18 병합, 제품 ab06dc1) | F-104 낮음 묶음 | 항목별 경로 | F-104 해당 항목 | haiku(②는 opus, ③⑤는 sonnet) |
| T08.F7 [x] (2026-10-03 PR #19 병합, 제품 9b07887) | (먼저) PR #18 검토 잔여 중간: F-106 ①②(결정 0020 ④ d_eff 식, levels[l].positions 결정 기록), F-108(progressive 시험: 독립 d_eff 기대값, 고운 뒤 거친 조각 입력, 사후 상수 제거) | `server/lod/progressive/`, 연구 `decisions/0020-*`·`0021-*` 또는 `0022-*` | F-106 ①②·F-108 확인 기준 | sonnet |
| T08.F8 [x] (2026-10-03 PR #19 병합, 제품 9b07887) | PR #18 잔여: F-105(paths 원형 평균), F-106 ③(주석 6곳), F-107 낮음 묶음 | `fixtures/paths/`, 항목별 경로 | F-105·F-106 ③·F-107 해당 항목 | haiku(F-107 ①④ 는 sonnet, ⑤ 는 opus) |
| T08.F9 [x] (2026-10-03 PR #20 병합, 제품 8186d4c) | (먼저) PR #19 검토 잔여 중간: F-110(screen_error 하한 근거, budget_discrim 10000 문턱 0.28/3 복원, 루트 노드 변조 빈 시험, nodeCount 독립 검증), F-109 ④(계약 거리 근거 문구·LOD_API 표) | `server/lod/select/`, `server/lod/budget/`, `contracts/lod/` | F-110·F-109 ④ 확인 기준 | sonnet |
| T08.F10 [x] (2026-10-03 PR #20 병합, 제품 8186d4c) | PR #19 잔여: F-109 ①②③(0022 applyChunks 서술, 걸침 주석 2곳, 0020 줄 번호), F-111 낮음 묶음 | 연구 `decisions/0020-*`·`0022-*`, 항목별 경로 | F-109 ①②③·F-111 해당 항목 | haiku(F-111 ⑥⑧ 은 sonnet) |
| T08.F11 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | PR #20 검토 잔여 중간: F-112(계층 입력 검사 중복·누락, Infinity 상자 퇴행, 호출마다 전수 검사), F-113(시험 주장과 판별력) — T08.0 과 같은 PR 에서 함께 처리 | `server/lod/select/`, `server/lod/octree/`, 항목별 시험 | F-112·F-113 확인 기준 | sonnet(F-113 ⑤ 는 opus) |
| T08.F12 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | PR #20 잔여 낮음: F-114 — T08.0 과 같은 PR 에서 | 항목별 경로 | F-114 항목별 | haiku |
| T08.F13 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | (먼저) PR #21 반려 높음: F-115(distance 리프→노드 상자, 퇴화·입력 검사), F-116(절두체 원판 반경 여유, 서버·클라이언트·계약 서명), F-117(T08.2 SSIM ≤ 0.002 미달 2시점, todo 와 불변식 분리) — feat/culling 같은 브랜치·PR #21 | `server/cull/distance/`, `server/cull/frustum/`, `client/cull/`, `server/lod/select/view_check.mjs`, `server/cull/backface/`, `contracts/cull/` | F-115·F-116·F-117 확인 기준 | F-115 sonnet, F-116·F-117 opus |
| T08.F14 [x] (2026-10-03 PR #22 병합, 제품 bd962ae) | PR #21 중간: F-118(통합 3장면×8시점·가림 점 크기 전달), F-119(컬링 시험 판별력), F-120(퇴화 판정 일원화), F-121(비용·벤치) — 시간이 되면 같은 라운드에서, 아니면 다음 PR | `server/cull/`, `client/cull/`, `bench/cull/`, `server/lod/select/` | F-118~F-121 확인 기준 | sonnet(F-119 ②④ opus) |
| T08.F15 [x] (2026-10-03 PR #22 병합, 제품 bd962ae) | PR #21 낮음: F-122 | 항목별 경로 | F-122 항목별 | haiku(③ sonnet) |
| T08.F16 [x] (2026-10-03 PR #22 병합, 제품 bd962ae) | (먼저) PR #21 통과 후 잔여 중간: F-123(결합 backface 에 pointSizeM 전달·기본 구현 시험), F-124(predict 경로 재생 시험 판별력 복원), F-125(뒷면 기본 마스크 제거 하한·0.05 m SSIM) | `server/cull/combine/`, `server/cull/predict/`, `server/cull/backface/` | F-123·F-124·F-125 확인 기준 | sonnet |
| T08.F17 [x] (2026-10-03 PR #22 병합, 제품 bd962ae) | F-126 LOD 선택(selectLevels·budget·progressive)에 선택 인자 pointSizeM, 결합 경로 가장자리 리프 보존 | `server/lod/select/`, `server/lod/budget/`, `server/lod/progressive/`, `server/cull/combine/` | F-126 확인 기준 | opus |
| T08.F18 [x] (2026-10-03 PR #22 병합, 제품 bd962ae) | PR #21 재검토 낮음: F-127 | 항목별 경로 | F-127 항목별 | haiku(④ sonnet) |
| T08.F19 [x] (2026-10-03 PR #23 병합, 제품 1b01522) | (먼저) PR #22 검토 잔여 중간: F-120(퇴화 판정 진짜 일원화 — 서버 모든 단계·combine 기본 판정이 isDegenerateView, raster 해상도 조건 포함, 시험 목록 확장), F-125 ②(0.05 m 에서 제거가 생기는 시점의 픽셀 동일 단언, pointSizeM 없음 가드 판별) | `server/cull/`, `client/cull/`, `server/cull/combine/` | F-120·F-125 확인 기준 | sonnet |
| T08.F20 [x] (2026-10-03 PR #24 병합, 제품 a77b99e) | PR #22 잔여 중간: F-128(원뿔 캐시 모듈 최상위·priority mask 건너뛰기 검토·벤치 장면), F-129(살아남는 변이 6건), F-130(컬링 상자 캐시 지문 또는 계약) — T09 와 별도 PR 이 좋다 | `server/cull/`, `server/lod/select/`, `bench/cull/`, `contracts/` | F-128·F-129·F-130 확인 기준 | sonnet(F-129 ② opus) |
| T08.F21 | PR #22 낮음: F-131 | 항목별 경로 | F-131 항목별 | haiku(⑧ sonnet) |
| T08.F22 [x] (2026-10-03 PR #24 병합, 제품 a77b99e) | PR #23 검토 중간: F-132(카메라 구조 오류 처리 단계 간 통일 — 계약 :7 과 일치), F-133(시험 판별력 공백 ①~⑤) | `server/cull/`, `client/cull/`, `contracts/cull/` | F-132·F-133 확인 기준 | sonnet(F-133 ④ opus) |
| T08.F23 | PR #23 낮음: F-134 | 항목별 경로 | F-134 항목별 | haiku(⑥⑦ sonnet) |
| T08.F24 [x] (2026-10-03 PR #25 병합, 제품 a1b55ea) | (먼저) PR #24 검토 중간: F-135(원뿔 캐시 입력 참조 비교 또는 계약), F-136(predictCamera 구조 검사), F-137(시험 판별력 ①~⑤) — T09 와 별도 PR | `server/cull/`, `server/lod/select/`, `bench/cull/`, `contracts/` | F-135·F-136·F-137 확인 기준 | sonnet(F-136 haiku, F-137 ⑤ opus) |
| T08.F25 | PR #24 낮음: F-138 — T08.F21·F23 과 함께 처리해도 됨 | 항목별 경로 | F-138 항목별 | haiku(⑦ sonnet) |
| T08.F26 [x] (2026-10-03 PR #26 병합, 제품 3059380) | (먼저) PR #25 검토 중간: F-139(predict 회전 부풀림 판별 시험, 과잉 상한 독립화), F-140(backface 상자 캐시 positions 교체 시험) — T09 와 별도 PR | `server/cull/` | F-139·F-140 확인 기준 | sonnet(F-139 opus) |
| T08.F27 [x] (2026-10-03 PR #26 병합, 제품 3059380; F-141 ⑦ 미처리 → T08.F29) | PR #25 낮음: F-141 — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로 | F-141 항목별 | haiku(⑤ sonnet) |
| T08.F28 [x] (2026-10-03 PR #27 병합, 제품 9b92c6e) | (먼저) PR #26 검토 중간: F-142(① 클라이언트 구멍 시험, ② 퇴화 우선순위 단언, ③ 합법 해상도 정상 출력 단언, ④ 회전 하한 판별 사례) — T09 와 별도 PR | `server/cull/`, `client/cull/` | F-142 확인 기준 | sonnet(①② haiku, ④ opus) |
| T08.F29 [x] (2026-10-03 PR #27 병합, 제품 9b92c6e; F-143 ③ backface·F-138 ⑧ 미처리 → T08.F31) | PR #26 낮음: F-143, F-141 ⑦(cachedNormalCones 입력 검사·시험), F-138 ⑧ — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로 | F-143·F-141 ⑦·F-138 ⑧ 항목별 | haiku(F-143 ④⑦ sonnet) |
| T08.F30 [x] (2026-10-03 PR #28 병합, 제품 06ff3da) | (먼저) PR #27 검토 중간: F-144(predict 상한 식 교차항·사례 3·4 건너뜀·하한 여유), F-145(리프 0 개 계층 규칙 통일·계약 문구) — T09 와 별도 PR | `server/cull/`, `client/cull/`, `contracts/cull/` | F-144·F-145 확인 기준 | sonnet(F-144 opus) |
| T08.F31 [x] (2026-10-03 PR #28 병합, 제품 06ff3da; F-146 ⑥ 일부·⑦ 미처리 → T08.F33) | PR #27 낮음: F-146, F-143 ③(backface leafStart 판별), F-138 ⑧ — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로 | F-146·F-143 ③ 항목별 | haiku(F-143 ③ sonnet) |
| T08.F32 [x] (2026-10-03 PR #29 병합, 제품 d0a1c4d) | (먼저) PR #28 검토 중간: F-147(predict 하한을 실제 가시 리프 합집합으로, 상한 H = hh, 판별 사례 추가), F-148(접근자 예외 래핑 전 단계·clientFrustumCull 빈 상자 거부·zero_leaf_all_stages 고정 계층 교정) — T09 와 별도 PR | `server/cull/`, `client/cull/`, `contracts/cull/` | F-147·F-148 확인 기준 | sonnet(F-147 opus) |
| T08.F33 [x] (2026-10-03 PR #29 병합, 제품 d0a1c4d; F-146 ⑦ → F-138 ⑧ 로 일원화) | PR #28 낮음: F-149, F-146 ⑥ 잔여·⑦ — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로 | F-149·F-146 항목별 | haiku(F-149 ②④ sonnet) |
| T08.F34 [x] (2026-10-03 PR #30 병합, 제품 3ecab24; F-151 잔여 → F-155 ④) | (먼저) PR #29 검토 중간: F-150(predict leafBoxes leafIndex 중복·범위 검사, 비유한 상자 cull: 오류로 통일), F-151(predict 시험 상한 상대 여유, 시드 비의존 판별 사례, BASE 스냅샷 삭제) — T09 와 별도 PR | `server/cull/`, `client/cull/`, `contracts/cull/` | F-150·F-151 확인 기준 | sonnet(F-151 opus) |
| T08.F35 [x] (2026-10-03 PR #30 병합, 제품 3ecab24) | PR #29 낮음: F-152 — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로 | F-152 항목별 | haiku(①④⑦⑧ sonnet) |
| T08.F36 [x] (2026-10-03 PR #31 병합, 제품 0e0c9c7; F-155 ③ 잔여 → F-157) | (먼저) PR #30 검토 중간: F-153(leafIndex 정수·Int32Array 강제), F-155(할당 문턱 복귀·combine 시험·계약 7줄·직선 이동 시험 해석화) — T09 와 별도 PR | `server/cull/`, `client/cull/`, `contracts/cull/` | F-153·F-155 확인 기준 | sonnet(F-155 ④ opus, ②③ haiku) |
| T08.F38 [x] (2026-10-03 PR #32 병합, 제품 3343627; 잔여 → T08.F39) | (먼저) PR #31 검토 중간: F-157(nonfinite_box_scope 시험이 정책 값을 단언·리프 ±Inf 행·계약 :10 클라이언트 줄 정정), F-158 낮음 묶음 — T09 와 별도 PR | `server/cull/`, `client/cull/`, `contracts/cull/` | F-157 확인 기준·F-158 항목별 | sonnet(F-158 ① opus, ③④⑤⑥ haiku) |
| T08.F39 [x] (2026-10-03 PR #33 병합, 제품 2ef7666; 잔여 → T08.F40) | PR #32 중간·낮음: F-159(occlusion NaN 행을 점 좌표로·predict x/z 판별력·combine 무장 시점), F-160 — T08.F37 과 한 PR 로 묶어도 됨, 그 뒤 T09 | `server/cull/`, `client/cull/`, `contracts/cull/` | F-159 확인 기준·F-160 항목별 | sonnet(F-160 ①②③④ haiku) |
| T08.F37 [x] (2026-10-03 PR #33 병합, 제품 2ef7666, T08.F39 와 한 PR; 잔여 → T08.F40) | PR #30 중간·낮음: F-154(검사 캐시·벤치), F-156 — T08.F21·F23·F25 와 함께 처리해도 됨 | 항목별 경로, `bench/` | F-154 확인 기준·F-156 항목별 | sonnet(F-156 ①②④⑤⑥⑧ haiku) |
| T08.F40 [x] (2026-10-03 PR #34 병합, 제품 328080c; 잔여 → T08.F41) | (먼저) PR #33 검토 중간: F-161(nan_y_leaf 복원 단언·호출처 시험 require 무력·캐시 동일성 시험), F-162(계약에 검증 캐시 불변 가정·NaN 정책표 distance·priority 문구), F-163 낮음 묶음 — 한 PR, 그 뒤 T09 | `server/cull/`, `contracts/cull/`, `contracts/lod/`, `bench/cull/` | F-161·F-162 확인 기준·F-163 항목별 | sonnet(F-161 ①② haiku, F-162 ①③ 문구 haiku, F-163 ①②③⑥ haiku) |
| T08.F41 [x] (2026-10-03 PR #35 병합, 제품 d0f2999; 잔여 → F-166·F-167 은 T09 PR 과 함께) | (먼저) PR #34 검토 중간: F-164(priority NaN 시험을 실제 리프에·가드 도달 입력 또는 계약에 도달 경로 없음 명시, 호출처 시험 빈 탐지 통과·client 경로, 계약 cull :10·:12·lod :17·:20 문구), F-165 낮음 묶음 — 한 PR. 이것으로 컬링 검토 보정 묶음을 마무리하고 바로 T09 로 간다(다음 검토의 시험 문구·주석 수준 낮음은 T09 PR 과 함께 처리) | `server/cull/`, `contracts/cull/`, `contracts/lod/`, `bench/cull/` | F-164 확인 기준·F-165 항목별 | sonnet(F-164 ③·F-165 ①②④⑤ haiku, F-165 ③ sonnet) |
| T08.0 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 계약: 시점 상태·컬링 결과(조각 목록) 타입 | `contracts/cull/` | 타입 문서와 일치 | sonnet |
| T08.1 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 절두체 컬링 | `server/cull/frustum/` | 거짓 제거 0(보수적), 고정 시점 8곳 | sonnet |
| T08.2 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 법선 기반 뒷면 제거(조각 단위 법선 원뿔) | `server/cull/backface/` | 렌더 결과 SSIM 변화 ≤ 0.002 | sonnet |
| T08.3 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 거친 가림(깊이 피라미드, CPU) | `server/cull/occlusion/` | 거짓 제거 0, 제거율 기록 | opus |
| T08.4 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 거리 컷 | `server/cull/distance/` | 경계 시험 통과 | haiku |
| T08.5 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 시점 예측(이동 방향 앞당겨 보내기) | `server/cull/predict/` | 경로 재생 시 빠진 조각 0 | sonnet |
| T08.6 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 조각 우선순위 정렬 | `server/cull/priority/` | 화면 기여 순 정렬 검사 | sonnet |
| T08.7 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 클라이언트 측 절두체 컬링 | `client/cull/` | 서버 결과와 조각 목록 일치 | sonnet |
| T08.8 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 컬링 + LOD 결합 선택 | `server/cull/combine/` | 8시점 SSIM ≥ 0.95, 조각 수 기록 | opus |
| T08.9 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 컬링 비용 측정 | `bench/cull/` | 시점당 CPU 시간 기록 | haiku |
| T08.10 [x] (2026-10-03 PR #21 병합, 제품 df3a5c5) | 퇴화 시점(지면 아래·NaN·0 화각) 처리 | `server/cull/degenerate/` | 패닉 0, 빈 결과 | sonnet |

### T09 `codec` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T09.0 | 계약: 양자화 범위·비트 수, 압축 블록 형식. 같은 PR 에 F-166(계약 cull :10·lod :21·:23 문구, 시험 행) 중간·F-167 낮음 묶음 처리 | `contracts/codec/` (F-166·F-167: `contracts/cull/`·`contracts/lod/`·`server/cull/`·`bench/cull/`) | 명세와 타입 일치, F-166 확인 기준 | sonnet(F-166 문구·F-167 haiku) |
| T09.1 | 위치 양자화(조각 상자 기준) | `server/codec/position/` | 오차 ≤ 명세 상한(예: 1 cm) | opus |
| T09.2 | 법선 양자화(팔면체 사상) | `server/codec/normal/` | 각 오차 ≤ 1° | opus |
| T09.3 | 색 양자화·팔레트 | `server/codec/color/` | 평균 오차 ≤ 2/255 | sonnet |
| T09.4 | 순서 재배치(공간 채움 곡선) | `server/codec/order/` | 결정적, 압축률 향상 기록 | opus |
| T09.5 | 엔트로피 부호화(허용 라이선스 라이브러리 또는 직접 구현) | `server/codec/entropy/` | 왕복 무손실 | opus |
| T09.6 | 클라이언트 복호기 | `client/codec/` | 서버 부호화 → 클라이언트 복호 일치 | sonnet |
| T09.7 | 점 1개당 바이트 측정 | `bench/codec/` | 27 B 대비 비율 기록 | haiku |
| T09.8 | 손상 블록 거부 | `server/codec/robust/` | 퍼저 10만 회 패닉 0 | sonnet |
| T09.9 | 복호 속도(클라이언트, CPU) | `bench/codec_client/` | 100만 점 복호 시간 기록 | haiku |
| T09.10 | 양자화 후 화질 | `server/codec/quality/` | 8시점 SSIM ≥ 0.98(양자화 전 대비, 기준 렌더는 codec 점 순서 — 결정 0028) | sonnet |
| T09.11 | 조각 부호화·복호화 묶음(encodeChunk·decodeChunk), 서버→클라이언트 통합 왕복 | `server/codec/chunk/` | 왕복 점 집합 일치, 손상 입력 거부 | sonnet |
| T09.F [x] (2026-10-03 PR #36 병합, 제품 3d3a26f; 잔여 → T09.F2) | (먼저, PR #36 반려 1회) 같은 브랜치 feat/codec 에서: F-168(높음, encodeChunk 입력 엄격 검사) → F-170(T09.10 순서 맞춘 기준, todo 0) → F-169(서버 rawLen 상한) → F-171(벤치·시험 판별력) → F-172 낮음 묶음(가능한 만큼). 고친 뒤 PR #36 을 다시 열고 라벨 | `server/codec/`, `client/codec/`, `contracts/codec/`, `bench/codec*/`, `format/ASSET_FORMAT.md`, `contracts/cull/`(F-172 ⑨) | F-168·F-169·F-170·F-171 확인 기준 | sonnet(F-171 ①②③·F-172 대부분 haiku, F-172 ③ sonnet) |
| T09.F2 [x] (2026-10-03 PR #37 병합, 제품 5c7e092; 잔여 낮음 → F-176) | (먼저, T10 과 같은 PR 이나 별도 PR) PR #36 재검토 중간·낮음: F-171 ①②(벤치 lossy 행 colorMode 단언, 비교 기준을 복호기 밖에서), F-174(계약·명세 문구 = 구현, 서버·클라이언트 검사 순서·교차 오류 코드 시험, 서로 가리는 검사), F-175 낮음 묶음(가능한 만큼) | `bench/codec_client/`, `server/codec/`, `client/codec/`, `contracts/codec/`, `format/ASSET_FORMAT.md` | F-171·F-174 확인 기준 | sonnet(F-171·F-174 ① 문구·F-175 haiku) |

### T10 `levels` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T10.0 | 계약: 수준 상수(250·1,000·3,500·7,000), 구간 상태 기계 서명 | `contracts/levels/` | 상수 4개 고정 | haiku |
| T10.1 | 서버 측 구간 상태(최고 수준 기록) | `server/levels/state/` | 교체·건너뛰기 시험 전부 통과 | sonnet |
| T10.2 | 추월당한 수준 건너뛰기 | `server/levels/skip/` | 순서 뒤바뀐 도착 1만 경우 전부 최고 수준 유지 | sonnet |
| T10.3 | 교체 시 낮은 수준 조각 해제(누적 0) | `server/levels/replace/` | 교체 후 낮은 수준 조각 수 0 | sonnet |
| T10.4 | 클라이언트 측 같은 상태 기계 | `client/levels/` | 서버와 같은 입력 열 → 같은 상태 | sonnet |
| T10.5 | "없음" 표시 상태(도착 전 구간) | `client/levels/missing/` | 도착 전 구간 렌더 점 0, 표시 상태 참 | sonnet |
| T10.6 | 마지막 수준 완료 표시 | `server/levels/final/` | 최종 플래그 시험 | haiku |
| T10.7 | 수준 이력 기록(디버그) | `server/levels/log/` | 이력이 입력 열과 일치 | haiku |
| T10.8 | 무작위 순서 속성 시험 | `server/levels/property/` | 무작위 10만 열 불변식 위반 0 | opus |
| T10.9 | 타이머 진행 금지 검사(시간 흘려도 상태 불변) | `server/levels/no_timer/` | 가짜 시계 1시간 진행 후 상태 불변 | sonnet |
| T10.10 [x] (문서 기준 대조 19건; 원본 대조는 T10.10L) | skylens `splatScene.ts` 동작과 대조표 | `server/levels/parity/` | 기존 동작 시험 사례 전부 일치 | opus |
| T10.10L [local] | skylens 원본 `splatScene.ts` 직접 대조 — UNVERIFIED 10항목(F-183 으로 연구 노트로 옮긴 목록)을 사례 또는 해소 기록으로 | `server/levels/parity/` | 원본 코드 줄 출처 사례로 기존 동작 전부 일치 | opus |
| T10.F | (T11 PR 에 함께) PR #38 검토 중간: F-183(먼저, 연구 기록 이동), F-181, F-178, F-182, F-180, F-177 ②~④, F-176 ③ 은 T12.5 와. F-179 는 T12 착수 전 | F-178~F-183 의 위치 경로 | 각 항목 확인 기준 | sonnet(F-181·F-183 haiku) |

### T11 `protocol` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T11.0 | 계약: 웹소켓 메시지 종류(시점 갱신·조각 요청·조각·수준 도착·없음·오류), 이진 머리 | `contracts/proto/` | 명세 문서와 타입 일치 | haiku |
| T11.1 | 메시지 부호화·복호(서버) | `server/proto/codec/` | 전 종류 왕복 일치 | sonnet |
| T11.2 | 메시지 부호화·복호(클라이언트) | `client/proto/` | 서버와 교차 왕복 일치 | sonnet |
| T11.3 | 웹소켓 서버 골격(설정은 환경 변수, 주소·포트 기본값을 저장소에 두지 않음) | `server/ws/` | 접속·종료 시험, 저장소에 주소·포트 문자열 0 | sonnet |
| T11.4 | 송출 스케줄러(우선순위·대역 예산) | `server/scheduler/` | 예산 초과 0, 우선순위 순서 | sonnet |
| T11.5 | 초기 묶음(첫 프레임용 최소 조각) | `server/scheduler/initial/` | 합성 장면 초기 ≤ 15 MB | sonnet |
| T11.6 | 역압(느린 클라이언트) 처리 | `server/ws/backpressure/` | 버퍼 상한 초과 0, 조각 요청 크기·복호 시간 상한(F-175 ⑥) | sonnet |
| T11.7 | 재접속·이어받기 | `server/ws/resume/` | 재접속 후 중복 조각 0 | sonnet |
| T11.8 | skylens 코어 이벤트 어댑터(구간·수준 도착 → 렌더러) | `server/adapter/core/` | 녹화 이벤트 재생 시 상태 일치 | opus |
| T11.9 | 모의 클라이언트(시험용) | `tools/mock_client/` | 경로 재생 스크립트 동작 | haiku |
| T11.10 | 프로토콜 퍼저 | `server/proto/fuzz/` | 10만 회 패닉 0 | sonnet |
| T11.11 | 바이트 집계 | `bench/proto/` | 구간당 바이트 기록(≤ 3 MB 대비) | haiku |
| T11.F [x] | (PR #39 반려 1회, 같은 브랜치) 높음 F-184(pieceSeq 0)·F-185(추월 묶음 기준 계약화)·F-186(MB 단위 되돌리기)·F-187(T11.5·T11.9·T11.11 완료 기준 재현)·F-188(ws 콜백 예외)·F-189(어댑터 송출 원자성) 먼저. 중간 F-190~F-193·F-195·F-196 은 같은 PR 또는 다음 PR, 낮음 F-194 | F-184~F-196 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | sonnet(F-185·F-189 opus, F-186 haiku) |
| T11.G [x] | (2026-10-04 제품 PR #40 병합, 반려 0회, 제품 8ed7a9f merge commit, 연구 experiment/protocol 6245903) (T12 PR 에 함께, 첫 커밋들) PR #39 재검토 잔여: F-197(어댑터 재시도 순번 ↔ resume 재기록, ws 배선 전 필수)·F-192(resume 유한 기본 상한)·F-198(코덱 pieceSeq 0 거부)·F-199(unacked 추월 거름)·F-201(시험 공백) 먼저, 그다음 F-193 ①·F-200·F-202, 낮음 F-203 | F-192·F-193·F-197~F-203 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | sonnet(F-197 opus, F-203 ⑥⑦⑧ haiku) |
| T11.H [x] | (2026-10-04 제품 PR #41 병합, 반려 0회, 제품 de39732 merge commit, 연구 experiment/protocol cfc8f73) (T12 PR 에 함께, 첫 커밋들) **높음 F-210(ws 400 거부 경로 소켓 error 처리기 — 원격 RST 로 프로세스 종료)·F-211(FIN 만 받은 연결 onClose 미호출) 을 맨 먼저(각 시험 포함, sonnet).** 그다음 PR #40 검토 잔여 중간: F-204(어댑터 실패 뒤 다른 이벤트 — 순번 규약, ws 배선 전 필수)·F-206(pong 상한이 send 데이터를 셈·옵션 검사·단조 시계)·F-205(코덱 pieceCount 0 거부)·F-207(시험 공백) 먼저, 그다음 F-200 잔여(비동기 onMessage 미결·send 상한)·F-208, 중간 F-212, 낮음 F-209 | F-200·F-204~F-209 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | sonnet(F-204 opus, F-209 ①②③ haiku) |
| T11.I [x] | (2026-10-04 제품 PR #42 병합, 반려 2회, 제품 59b2311 merge commit, 연구 experiment/client-raster 5d4a9ba) (PR #42 반려 2회 뒤 같은 브랜치에서) **높음 F-221(2회째): npm test 안의 벽시계 비교 단언을 모두 없애고(scheduler.test:356-357·:389, resume.test:694 → 출력만 또는 bench), 판정 시험은 시험 쪽 계측(splice/shift 이동 수·주입 비교자 등)으로 — 가드 끈 splice·S5 변이가 단언으로 실패해야 함. 문턱 완화·상대 조항 금지, opus.** 그다음 F-213 resume 판정을 구현 밖 계측으로(sonnet), F-227(같은 수준 skip 해제, sonnet), F-226(drawingBufferSize 상한, haiku), F-228 ①⑥⑧(sonnet)·②~⑤⑦⑨⑪(haiku). F-216·F-222·F-223·F-224 닫힘. 같은 작업 반려 3회를 넘기면 범위를 쪼갠다. | FEEDBACK F-213·F-221·F-226~F-228 위치 경로 | 각 항목 확인 기준, 감독 환경 scheduler.test·resume.test 각 10회 연속 0 실패, npm test 3회 연속 0 실패 | opus(F-221), sonnet(F-213·F-227·F-228 ①⑥⑧), haiku(F-226·F-228 나머지) |
| T11.J [x] | (2026-10-04 제품 PR #43 병합, 반려 0회, 제품 7e95050 merge commit, 연구 experiment/t11i 12e4e12) (T12 PR 첫 커밋들) PR #42 잔여: F-227 클라이언트 몫(selectDrawable 이 완료 key 집합만 draw, T12.1 전 필수, sonnet), F-228 ⑥(skip 경로 A7·A8 시험, sonnet)·⑧(key segmentId 상한, sonnet)·⑦ 잔여(haiku), F-229 ①(관측기 인덱스 루프 한계, opus)·②③(sonnet)·④~⑦(haiku) | FEEDBACK F-227~F-229 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-229 ①), sonnet(F-227·F-228 ⑥⑧·F-229 ②③), haiku(나머지) |
| T11.K [x] | (2026-10-04 제품 PR #44 병합, 반려 0회, 제품 e518d1f merge commit, 연구 experiment/t12-client-raster-start c8972d0) (T12 다음 PR 첫 커밋들) PR #43 잔여: **F-230(LEVEL_ARRIVED 완료 key 집합 — 수신 PIECE·pieceCount 로 keys 를 만드는 규칙과 변환 함수·시험, 또는 proto firstPieceSeq; 빈 keys 거부; T12.1 전 필수, opus)**, F-231 ①②(재통지 실패가 다음 이벤트를 막지 않음·flush 때 live 재검사, opus)·③⑤(REPLACE 경로·살아남은 변이 시험, sonnet)·④(계약 문구, haiku), F-232 ①④⑤(sonnet)·②③⑥(haiku), F-233 ①②(관측 시험 중단·교체 감싸기 계수, opus)·③(haiku), F-228 ⑩(T12 호출처) | FEEDBACK F-228·F-230~F-233 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-230·F-231 ①②), sonnet(F-231 ③⑤·F-232 ①④⑤), haiku(나머지) |
| T11.L [x] | (2026-10-04 제품 PR #45 병합, 반려 0회, 제품 48b62b1 merge commit, 연구 experiment/t12-client-raster-start 806b383) (T12 다음 PR 첫 커밋들, T12.1 전 필수) PR #44 잔여: **F-231 ⑥(어댑터 onRelease 재진입 무한 중첩·releaseDropped 누출, 두 번째 미해결, opus)**, **F-234(collectArrivals 세션 경계·pieceSeq 단조, opus)**, **F-235(LEVEL_ARRIVED 송출 뒤 skip 모순 — 어댑터 표시·계약 문구·arrival.test:164 정리, opus)**, F-236(LEVEL_ARRIVED 유실 — proto firstPieceSeq 또는 resume 재전송 결정, decisions/ 기록, opus), F-237 ②④⑥⑧(sonnet)·①③⑤⑦(haiku), F-232 ⑥(haiku), F-228 ⑩(T12 호출처) | FEEDBACK F-231·F-232·F-234~F-237 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-231 ⑥·F-234·F-235·F-236), sonnet(F-237 ②④⑥⑧), haiku(나머지) |
| T11.M [x] | (2026-10-04 제품 PR #46 병합, 반려 0회, 제품 f0b50de merge commit, 연구 experiment/t12-client-raster-start f6b7b7b) (T12 다음 PR 첫 커밋들) PR #45 잔여: **F-238 ①③(재전송분 재기록 멱등·창 겹침 거부, opus)·②(levels 상한·stats, sonnet)** — T12 ws 배선 전 필수, F-238 ④(어댑터 emit 뒤 recordLevelArrived·이어받기 resendPlan 배선과 ws 경로 유실 시험, opus)는 ws 배선 PR 에서, 배선 전에는 계약 주석에 '미배선'. F-239 ③⑤⑥⑦⑨(sonnet)·①②④⑧⑩(haiku), F-228 ⑩(T12 호출처) | FEEDBACK F-238·F-239 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-238 ①③④), sonnet(F-238 ②·F-239 ③⑤⑥⑦⑨), haiku(F-239 나머지) |
| T11.N [x] | (2026-10-04 제품 PR #47 병합, 반려 0회, 제품 0770483 merge commit, 연구 experiment/t12-client-raster-start 4eb7170) (T12 다음 PR 첫 커밋들) PR #46 잔여: **F-238 ⑧(상한이 창 끝 == ackedUpTo 기록을 지움 — F-236 재현, opus)·⑥(지운 기록 재시도 멱등 규칙, opus) — ④ 배선 전 필수**·⑤⑨(ackedUpTo == last 뒤 첫 기록 시험·생존 변이, sonnet)·⑦(windowLive 추월 판정, sonnet), F-240 ①(계약 머리 주석 firstPieceSeq, haiku — T12.1 전 필수)·②④⑤⑨⑪(sonnet)·③⑥⑦⑧⑩(haiku). F-238 ④ 는 ws 배선 PR, F-228 ⑩ 은 T12 호출처 | FEEDBACK F-238·F-240 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-238 ⑥⑧), sonnet(F-238 ⑤⑦⑨·F-240 ②④⑤⑨⑪), haiku(F-240 나머지) |
| T11.O [x] | (2026-10-04 제품 PR #48 병합, 반려 0회, 제품 44ea9bb merge commit, 연구 experiment/t12-client-raster-start 921de30) (T12 다음 PR 첫 커밋들, F-238 ④ ws 배선 전 필수) PR #47 잔여: **F-241 ①②③(재시도 판정을 ackedUpTo·기록 순서와 무관하게 — 묘비 또는 (d) 제거, 보관 판정은 죽음·기록 없음만, opus)·④⑤⑥⑦(gone 건너뛰기·nextSeq 경계 시험·상한 시험·scheduler reads 즉시 상한, sonnet)·⑧(haiku)**, F-240 ⑥(proto 주석)·③ 잔여(haiku), F-242 ①②③⑤(haiku)·④⑥(sonnet). 처리 주장은 diff 와 대조해 PR 본문에 적는다 | FEEDBACK F-240·F-241·F-242 위치 경로 | 각 항목 확인 기준, npm test 0 실패 | opus(F-241 ①②③), sonnet(F-241 ④·F-242 ④⑥), haiku(F-240 ⑥③·F-242 ①②③⑤) |
| T12.P [x] | (2026-10-04 제품 PR #49 병합, 반려 0회, 제품 41d2930 merge commit, 연구 experiment/t12-client-raster-start 80ecfa5) (T12 다음 PR 첫 커밋들, ws·Worker 배선 전) PR #48 잔여: **F-243 ①(같은 key 동시 업로드 덮어쓰기, sonnet)·②(dpr ≠ 1 렌더러 시험, opus)·③(앵커 먼 장면 f32 상대 좌표, opus)·④(selectDrawable LOD 교체 규칙, opus)**·⑤⑥⑦⑧(sonnet), **F-244 ①(T12.6 클라이언트 holes 시험·도우미 음성 시험)·②(T12.5 실제 Worker·헤드리스 60만 점 long task 0 — 미달이면 미달로)·③(T12.7 meter = pool = bufferData 대조)·④(REQUIRE_GL)·⑥(SSIM 음성 시험)** sonnet, F-244 ⑤⑦ haiku, F-245(haiku, ⑥ sonnet), **F-241 ⑨(보관 중 기록과 겹치는 다른 값이 지평 아래서 true — FIFO 지평, opus)**·⑦(sonnet)·⑧(haiku), F-240 ③ 잔여(haiku). 그다음 F-238 ④ ws 배선 | FEEDBACK F-240·F-241·F-243~F-245 위치 경로 | 각 항목 확인 기준, npm test 0 실패, client/raster 시험 skip 0 | opus(F-243 ②③④·F-241 ⑨), sonnet(F-243 ①⑤~⑧·F-244 ①~④⑥·F-241 ⑦), haiku(나머지) |
| T12.Q [x] | (2026-10-04 제품 PR #50 병합, 반려 0회, 제품 4954c82 merge commit, 연구 experiment/t12-client-raster-start 7efe213) (T12 다음 PR 첫 커밋들, ws 배선 전) PR #49 잔여: **F-246 ①(완전한 LOD 가 없을 때 성긴 일부 LOD 를 discard 하지 않게, 결정 0034 규칙 2 보완, opus)**·②(core.test L == M 시험 복원, haiku)·③(dpr·holes 시험 glSkip, haiku)·⑤(프레임 루프 now()·Worker onmessageerror, sonnet)·④(api.test 가 실제 renderer 키 대조, sonnet)·⑥(holes lost 단언·마스크, sonnet)·⑦(업로드마다 selectDrawable 재계산 제거 — 걸음 수 시험, sonnet), **F-244 ②(T12.5: origin 기준 GPU 평면을 Worker 에서 만들어 transfer, 메인 long task 0; 옵트인 시험을 기본 실행에 넣고 미달 동안 todo, sonnet)**·⑥ 잔여(haiku), F-243 ⑧(sonnet), F-241 ⑦(sonnet)·⑧(haiku), F-247(haiku, ⑥ sonnet), F-245 ④⑤⑦⑧⑨(haiku). 그다음 F-238 ④ ws 배선 | FEEDBACK F-241·F-243~F-247 위치 경로 | 각 항목 확인 기준, npm test 0 실패, client/raster 시험 skip 0(미달은 todo 로 보임), T12.5 헤드리스 60만 점 long task 0 또는 미달 보고 | opus(F-246 ①), sonnet(F-246 ④⑤⑥⑦·F-244 ②·F-243 ⑧·F-241 ⑦·F-247 ⑥), haiku(나머지) |
| T12.R [x] | (2026-10-04 제품 PR #51 병합, 반려 0회, 제품 5511b4f merge commit, 연구 experiment/t12-client-raster-start 4e32828) (T12 다음 PR 첫 커밋들) PR #50 잔여: **F-248 ①(makeRoom 이 낡은 선택으로 막 완전해진 LOD 퇴출 — stale 이면 재계산, 시험 추가)·②(T12.5 시험을 실제 createRenderer.uploadPiece 경로로, todo 분기 삭제 — 통과하면 T12.5 완료)** sonnet, F-248 ④⑥ sonnet, F-248 ③⑤ haiku, F-249 ①~⑨ haiku, F-245 ⑤⑦⑨ haiku. 그다음 F-238 ④ ws 배선(opus) | FEEDBACK F-245·F-248·F-249 위치 경로 | 각 항목 확인 기준, npm test 0 실패, client/raster skip 0·todo 0, T12.5 실제 렌더러 경로 헤드리스 60만 점 long task 0(미달이면 실패로 보임) | sonnet(F-248 ①②④⑥), haiku(F-248 ③⑤·F-249·F-245 잔여), opus(F-238 ④ 배선) |
| T12.S [x] | (2026-10-04 제품 PR #52 병합, 반려 3회 뒤 검토 #4 통과, 제품 c131458 merge commit, 연구 experiment/t12-client-raster-start 338c56e) (2026-10-04 13:02 PR #52 반려 3회 — 먼저 **F-255(높음 3회째, 비-GL 시간 판정·hook 순서 시험·gpu 단언, opus)**, 그다음 F-258 sonnet, F-259 ①②⑤ sonnet·③④ haiku, F-253 ④·F-260 haiku. F-238 ④ 는 다음 PR. 4회째 반려 대상이 되면 범위를 나눈다) (2026-10-04 12:07 PR #52 반려 2회 — 먼저 **F-255(높음 2회째, T12.5 GL 제외 범위를 pool.upload·draw 호출 구간으로 좁힘, opus)**, 그다음 F-256 ①②③ sonnet·④⑤ haiku, F-253 ④⑥·F-254 ⑦·F-257 haiku, 그 뒤 F-238 ④ opus) (2026-10-04 PR #52 반려 1회 — 같은 브랜치 feat/t12s 에서 먼저 **F-252(높음, makeRoom 추정 선택 캐시 회귀, sonnet)·F-255(높음, T12.5 필터 거짓 통과, sonnet)**, 그다음 F-253 ①②③ sonnet·④⑥⑦ haiku, F-254 haiku) (T12 다음 PR 첫 커밋들, ws 배선 전) PR #51 잔여: **F-250 ①(지연 setArrived 입력을 상태 변경 전에 즉시 검사 — 잘못된 key 가 draw·관계없는 업로드를 계속 막음, 계약 :158·:215 정정)·③(makeRoom 재계산이 업로드 중 key 가 완성할 LOD 의 상주 chunk 를 퇴출)·②(복호 시한 연쇄 오탐·JSDoc·setTimeoutFn 예외)** sonnet, F-250 ④⑤⑥⑦·F-251·F-249 ⑤⑥⑨·F-245 ⑤⑦ haiku. 그다음 F-238 ④ ws 배선(opus, 지연 setArrived 를 쓸 때 discard 해제 규칙 — 결정 0035 다시 볼 조건) | FEEDBACK F-245·F-249·F-250·F-251 위치 경로 | 각 항목 확인 기준, npm test 0 실패, client/raster skip 0·todo 0, T12.5 시험 10회 반복 0 실패 | opus(F-255), sonnet(F-258·F-259 ①②⑤), haiku(F-259 ③④·F-253 ④·F-260), opus(F-238 ④ 배선, 다음 PR) |
| T12.T [x] | (2026-10-04 제품 PR #53 병합, 반려 1회 뒤 검토 #2 통과, 제품 3c029a8 merge commit, 연구 experiment/t12-client-raster-start ac8c0fa; F-238 ④ 는 T12.U 로 옮김) (반려 1회 2026-10-04 14:12, PR #53: 같은 브랜치에서 F-263(높음, sonnet — README·0036:35·7(가) 증분·0039 간격 상한) → F-265(sonnet) → F-266 ①③⑤ sonnet·②④ haiku; F-261·F-262·F-264 ①~④ 닫힘) (T12.S 범위 쪼개기 — 다음 PR 첫 커밋들, 새 브랜치 feat/*, 연구 experiment/*, 연구 PR base experiment/t12-client-raster-start) 먼저 **F-263(높음, makeRoom 보호 집합 결정 기록·0036 7(가)·0037:33 정정·decisions/README 목록, haiku)**, 그다음 F-261(GL 경계 안 사건 없는 CPU 작업 시험, sonnet)·F-262(보호 집합 증분 갱신, sonnet)·F-264(haiku). 그 뒤 F-238 ④ ws 배선(opus) | FEEDBACK F-261~F-264 위치 경로, decisions/ | 각 항목 확인 기준, npm test 0 실패, client/raster skip 0·todo 0, T12.5 단독 10회 0 실패 | sonnet(F-263·F-265·F-266 ①③⑤), haiku(F-266 ②④), opus(F-238 ④ 배선) |
| T12.U [x] | (2026-10-04 제품 PR #54 병합, 반려 2회 뒤 검토 #3 통과, 제품 6d7a4e6 merge commit, 연구 experiment/t12-client-raster-start 876f9a1; 남은 중간·낮음은 T12.V) (반려 2회 2026-10-04 15:50, PR #54 검토 #2: 같은 브랜치에서 **F-275(높음, opus — 재전송 멈춤 뒤 같은 연결 생방송 송출·누적 ACK 소실, stoppedAt 처리 정책과 attachConnection+실제 저장소 시험)** → F-276(중간, sonnet — 0040·계약 문장 정합) → F-277(①②③⑤⑧ sonnet, ④⑥⑦ haiku) → F-278(중간, sonnet — raster 시험 변이 공백, F-274 ⑥ 흡수) → F-274 ②(낮음, 선택); F-270·F-271·F-272·F-273 닫힘) (반려 1회 2026-10-04 15:20, PR #54: 같은 브랜치 feat/t12u(연구 experiment/t12u)에서 F-270(높음, opus — nextPieceSeq 전달·emit 하한 방어·이어받기 뒤 어댑터 경로 시험) → F-271(높음, opus — 희생 후보 목록 LOD 승격 무효화 회귀) → F-273 ①②③④(sonnet)·⑤(opus) → F-272(sonnet) → F-274(③④⑤⑥⑧⑨⑩ haiku, ①②⑦ sonnet); F-267·F-268·F-269 닫힘) (T12.T 다음 PR, 새 브랜치 feat/*, 연구 experiment/*, 연구 PR base experiment/t12-client-raster-start) 먼저 **F-238 ④ ws 배선(어댑터 emit 뒤 recordLevelArrived·이어받기 resendPlan, ws 경로 LEVEL_ARRIVED 유실 시험)**, 그다음 F-267(VAO 해제·원래 오류 보존 단언), F-269(makeRoom 희생 탐색 O(M)), F-268(결정 0036:57·주석·색인) | server/ws/resume/, server/ws/session/, server/adapter/, client/raster/index.mjs·vao_wiring_throw.test.mjs, bench/room_reject_bench.mjs, 연구 decisions/·experiments/ | 각 항목 확인 기준, npm test 0 실패, F-269 bench 16000 상주 보호 key 앞쪽 0.5 ms 미만 | opus(F-275), sonnet(F-276·F-277 ①②③⑤⑧·F-278·F-274 ②), haiku(F-277 ④⑥⑦) |
| T12.V [x] | (2026-10-04 제품 PR #55 병합, 반려 1회 뒤 검토 #2 통과, 제품 bd5e301 merge commit, 연구 experiment/t12-client-raster-start 4e50a4f; 남은 중간·낮음 F-287·F-281 잔여는 T13 첫 PR 과 함께) (반려 1회 2026-10-04 17:15, PR #55 검토 #1: 같은 브랜치 feat/t12v(연구 experiment/t12v)에서 **F-283(높음, sonnet — 0040 결정 기록)** → F-281(haiku, 되돌림) → F-284(중간, sonnet) → F-285(낮음, sonnet) → F-286(①②③⑧ sonnet, ④⑤⑦ haiku); F-278·F-279·F-280·F-282·F-277 ④ 닫힘) (T12.U 다음 PR, 새 브랜치 feat/*, 연구 experiment/*, 연구 PR base experiment/t12-client-raster-start) PR #54 검토 #3 의 남은 중간·낮음. 순서: **F-279(중간, opus — 재전송 정지를 호출자에게 알림 또는 attachConnection 이 store.close, 정지 1011 구별, 클라이언트 규약; ws 서버 진입점 배선 전 필수)** → F-282(중간, sonnet — async onSession·onClose 거부 처리) → F-280(중간, sonnet — session 시험 변이 공백 ①~⑤) → F-278(중간, sonnet — raster 희생 후보 시험 변이 M5·M6·M7·M9·M11·M12·M13·M16) → F-277 ④(중간, sonnet — sentKeys 하한 커서) ③⑤(결정 필요, ③ sonnet·⑤ opus) ⑦(haiku, 선택) → F-281(낮음, haiku — 0040 선택지 표·닫힘 코드 절·주석) → F-274 ②(낮음, 선택) | server/ws/session/, server/ws/resume/, client/raster/*.test.mjs·index.mjs, bench/emit_sentkeys_bench.mjs, 연구 decisions/·experiments/ | 각 FEEDBACK 항목 확인 기준, npm test 0 실패 | sonnet(F-283·F-284·F-285·F-286 ①②③⑧·F-277 ③), opus(F-277 ⑤), haiku(F-281·F-286 ④⑤⑦·F-277 ⑦) |
| T11.8L [local] | skylens 원본 코어 이벤트 모양·실제 녹화로 어댑터 재생 대조(클라우드 시험은 합성 녹화 — experiments/protocol.md '원본 미열람, 가정') | `server/adapter/core/` | 실제 녹화 재생 시 상태 일치 | opus |
| T12.5L [local] | 실제 GPU 기기에서 T12.5 전체 구간(uploadPiece→첫 draw, GL 업로드·draw 포함) 메인 스레드 long task 0 확인(클라우드 SwiftShader 는 GL 호출 자체가 50 ms 를 넘어 GL 호출 구간만 판정에서 제외 — F-255·결정 0038) | `client/raster/loop/worker.browser.test.mjs` | 실제 GPU 브라우저에서 전체 구간 long task 0, 기기·브라우저 기록 | sonnet |

### T12 `client-raster` — [cloud] (fps 확정 측정은 T17 [local])

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T12.0 | 계약: 클라이언트 렌더러 인터페이스(조각 올리기·내리기·시점·그리기) | `contracts/client_raster/` | 서명 문서와 일치 | haiku |
| T12.1 | 렌더 문맥 초기화·소실 복구 | `client/raster/context/` | 헤드리스 소프트웨어 렌더에서 초기화 성공 | sonnet |
| T12.2 | 점 셰이더(크기·색·법선 셰이딩) | `client/raster/shader/` | 참조 래스터라이저와 8시점 SSIM ≥ 0.95(헤드리스) | opus |
| T12.3 | 조각 버퍼 관리(올리기·해제·상한) | `client/raster/buffers/` | 해제 후 누수 0, 상한 준수 | sonnet |
| T12.4 | 카메라·K 환산(장치 픽셀 비) | `client/raster/camera/` | 해상도 바꿔도 투영 일치 ≤ 0.5 px | opus |
| T12.5 | 프레임 루프(조각 도착과 그리기 분리). codec 복호는 Web Worker 에서(F-173) | `client/raster/loop/` | 도착 폭주 중 프레임 누락 기록, 60만 점 구간 복호 중 메인 스레드 long task(> 50 ms) 0 — 2026-10-04 PR #51 [cloud](SwiftShader) 실제 경로 0 감독 재현. [cloud] 판정은 GL 호출 구간을 뺀 task 별 비-GL 시간 > 50 ms 가 0(결정 0038, 2026-10-04 PR #52 감독 재현), GL 포함 전체 구간은 T12.5L [local] | sonnet |
| T12.6 | 빈자리 표시(메우기 금지) | `client/raster/missing/` | holes 장면 빈 픽셀 = 참조 | sonnet |
| T12.7 | 메모리 집계 | `client/raster/memory/` | 집계값과 실제 버퍼 합 일치 | haiku |
| T12.8 | 번들 크기 검사(CI 문턱 300 KB) | `bench/client_bundle/` | gzip ≤ 300 KB | haiku |
| T12.9 | 헤드리스 화면 캡처 시험 틀 | `client/raster/test_harness/` | 8시점 캡처 재현 | sonnet |
| T12.10 | 입력 → 화면 지연 계측 지점 | `client/raster/latency/` | 계측 이벤트 기록 | haiku |

### T13 `statusview-b` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T13.0 | 계약: 현황판 화면 어댑터 인터페이스(기존 `splatScene.ts` 공개 메서드와 대응표) | `contracts/statusview/` | 대응표 전 메서드 포함 | haiku |
| T13.1 | 구간 도착 → 조각 요청 | `client/status/arrival/` | 녹화 재생 시 요청 순서 일치 | sonnet |
| T13.2 | 수준 교체 화면 반영 | `client/status/levels/` | 교체 후 낮은 수준 점 0 | sonnet |
| T13.3 | 도착 기준 노출(기존 `splatReveal.ts` 의미) | `client/status/reveal/` | 도착 전 구간 점 0 | sonnet |
| T13.4 | 카메라 동기(기존 `cameraSync.ts` 의미) | `client/status/camera/` | 기존 시험 사례 일치 | opus |
| T13.5 | 드론·마커 덧그리기(기존 오버레이 유지) | `client/status/overlay/` | 마커 위치 ENU 일치 ≤ 1 cm | opus |
| T13.6 | "없음" 안내 표시 | `client/status/missing_ui/` | 미도착 구간에 안내 표시 | haiku |
| T13.7 | 폴백 화면(SPEC §5 제안, 사람 확인 전 임시) | `client/status/fallback/` | 서버 불가 모의 시 폴백 표시 | sonnet |
| T13.8 | 통합 시험(모의 코어 + 모의 렌더 서버) | `client/status/e2e/` | 3구간×4수준 재생 시 상태 일치 | opus |
| T13.9 | 대역폭 측정(현황판 경로) | `bench/status_bw/` | 초기 ≤ 15 MB, 구간당 ≤ 3 MB(합성) | sonnet |
| T13.10 | 화질 측정(현황판 8시점) | `bench/status_quality/` | SSIM ≥ 0.95 | sonnet |
| T13.R | (반려 1회 2026-10-04 17:48, PR #56 검토 #1) 같은 브랜치 feat/t13(연구 experiment/t13)에서 **F-288(높음, opus — 새 세션 상태 초기화)** → **F-289(높음, sonnet — 문턱 10^6 B)** → **F-290(높음, sonnet — createWire 결정·계측)** → F-291(sonnet) → F-292 이 PR 부분(sonnet) → F-293(opus) → F-294(①②③④⑥⑨ sonnet, ⑤⑧ haiku, ⑦ opus) → F-287 ③⑦(haiku) | client/status/, contracts/statusview/, bench/status_bw/, bench/status_quality/, server/ws/wire/, server/ws/index.mjs, server/ws/session/, README.md, 연구 decisions/·experiments/ | 각 FEEDBACK 항목 확인 기준, npm test 0 실패 | 항목별(왼쪽) |
| T13.R2 | (반려 2회 2026-10-04 18:08, PR #56 검토 #2; F-288·F-289·F-290·F-293 닫힘) 같은 브랜치 feat/t13(연구 experiment/t13)에서 **F-295(높음, opus — 이어받기 재전송의 해제 조각 처리, F-296 ③ 장부와 함께)** → F-291 잔여(sonnet) → F-296 ①②④(sonnet) → F-298 ⑥⑧(sonnet) → F-297(①sonnet ②③haiku) → F-298 나머지(②⑩ sonnet, ③④⑤⑨ haiku, ①⑦ opus) | client/status/, server/ws/wire/, server/ws/session/*.test.mjs, bench/status_bw/, README.md, 연구 decisions/0041·0042, experiments/t13.md | 각 FEEDBACK 항목 확인 기준, npm test 0 실패 | 항목별(왼쪽) |
| T13.R3 [x] | (2026-10-04 PR #57 로 처리, F-300·F-301 닫힘) (PR #56 검토 #3 통과 뒤 남은 중간·낮음, T13.B 와 같은 PR 로) F-300(①②③④ sonnet) → F-301(①②⑥ haiku, ③④⑤⑦ sonnet) | client/status/, bench/status_bw/, server/ws/wire/, 연구 decisions/0041·0042, experiments/t13.md | 각 FEEDBACK 확인 기준, npm test 0 실패 | 항목별(왼쪽) |
| T13.B [x] | (2026-10-04 제품 PR #57 병합, 반려 0회 검토 #1 통과; 제품 병합 커밋은 감독 기록 19:00 절) SPEC S6 구간당 문턱: 구간당 250만 점 합성에서 구간당 ≤ 3,000,000 B(F-292). 수준별 증분 송출·구간 송출 점 예산·압축률 개선 중 선택을 결정으로 남긴다. T13 병합 뒤 별도 PR | `bench/status_bw/`, `server/scheduler/`, `server/codec/`, 연구 decisions/ | large 구간당 ≤ 3,000,000 B 단언 | opus |
| T13.Q | (PR #57 뒤, F-302 근거) 구간당 250만 점 합성에서 채택 방식(모턴 등간격·수준 비례, S6_SEND_CONFIG) 그대로 8시점 SSIM 측정·기록. 문턱 변경 금지, 결과는 사람 판단 자료 | 연구 experiments/, bench/status_quality/(측정 도구만) | 측정 명령·수치 기록, 노트 수치 = 재현값 | opus |
| T13.R4 | (PR #57 검토 #1 남은 중간·낮음, 다음 PR 과 함께) F-304(①② sonnet, ③④⑤ haiku) → F-303(①②③④⑥⑦ sonnet, ⑤⑧ haiku) | bench/status_bw/, server/scheduler/segment_budget/, client/status/, README.md, 연구 decisions/0043·experiments/t13b-* | 각 FEEDBACK 확인 기준, npm test 0 실패 | 항목별(왼쪽) |
| T13.T | (2026-10-06 사람 결정, F-302·SPEC §4.1) S6 예산(구간당 ≤ 3,000,000 B, S6_SEND_CONFIG 경로) 안에서 현황판 8시점 최소 SSIM 을 최대로 하는 솎기 튜닝. 후보(수준별 배분, 모턴 등간격 대안, Δd·화면 크기 기반 선택 등)마다 서브에이전트 하나. S6 문턱 변경 금지. 결과 표(후보 × 구간당 B × 8시점 최소 SSIM)와 채택안을 결정 기록에 남긴다. 시험은 같은 구성에서 S6 ≤ 3,000,000 B 와 SSIM ≥ 0.65 를 함께 단언(감독이 값을 고정하면 그 값으로 올림) | `server/scheduler/`, `bench/status_bw/`, `bench/status_quality/`, 연구 decisions/·experiments/ | 후보 표 재현, 채택안 S6 통과, 8시점 최소 SSIM ≥ 0.65 | opus |
| T13.D | (2026-10-06 사람 결정, SPEC §4.1) 다음 연구 PR 에서 decisions/0044 '사람 판단 필요' 의 §8 hideTol 항목을 '사람 결정 2026-10-06: 대가 수용' 으로 옮긴다. SPEC §5 확정에 맞춰 폴백의 '사람 확인 전 임시' 문구(제품 README 한·영, 폴백 코드 주석)를 정리한다 | 연구 decisions/0044, 제품 README.md·client/*/fallback/ 주석 | 폴백 관련 '사람 확인 전' 0건, 0044 사람 판단 필요 두 항목만 남음 | haiku |

### T14 `tower-assets` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T14.0 | 계약: 지형 타일·드레이프·건물 자산 형식(T03 포맷 확장) | `contracts/tower_assets/` | 명세 일치 | haiku |
| T14.1 | DEM 타일 → 지형 격자 LOD | `server/terrain/mesh_lod/` | 높이 오차 단계별 상한 이내 | opus |
| T14.2 | 위성 영상 드레이프 타일(밉 단계) | `server/terrain/drape/` | 단계별 크기 기록, 좌표 정합 ≤ 1 px | opus |
| T14.3 | 건물 외곽 돌출 → 프리즘 | `server/buildings/extrude/` | 동 수 보존, 높이 규칙(층×3 m, 기본 6 m) 일치 | sonnet |
| T14.4 | 건물 LOD(먼 곳 상자 합치기) | `server/buildings/lod/` | 8시점 SSIM ≥ 0.95 | opus |
| T14.5 | 건물 점 표시 옵션용 표본 | `server/buildings/points/` | 동별 표본 수 규칙 일치 | sonnet |
| T14.6 | 검정 텍스처 건물(기본)·선 표시 자산 | `server/buildings/black/` | 모서리 선 수 = 정답 | sonnet |
| T14.7 | 실사 항공뷰 UV | `server/buildings/aerial_uv/` | UV 범위 [0,1], 정합 ≤ 1 px | opus |
| T14.8 | 타일 공간 색인(관제탑 범위) | `server/terrain/tile_index/` | 무작위 조회 오분류 0 | sonnet |
| T14.9 | 6,191동 규모 처리 시간·크기 | `bench/tower_assets/` | 크기 기록(초기 ≤ 15 MB 대비) | haiku |
| T14.10 | 외부 호출 없는 녹화 입력 사용 검사 | `server/terrain/offline/` | 시험 중 네트워크 호출 0 | haiku |
| T14.R | (PR #58 검토 #1 반려, 같은 브랜치 feat/t14·experiment/t14) 순서: F-305(opus) → F-306(opus) → F-307(opus) → F-308(sonnet) → F-309(sonnet, 결정 파일) → F-310·F-315·F-316 ①~④(sonnet) → F-312(sonnet)·F-313(opus, 결정으로 대신 가능)·F-311(opus) → F-314·F-316 ⑤⑥(haiku/sonnet) | T14 소유 경로 전부, bench/tower_assets/, 연구 decisions/·experiments/t14.md | 각 FEEDBACK 확인 기준, 치명·높음 0, npm test 0 실패, 문턱 변경 금지 | 항목별(왼쪽) |
| T14.R2 | (PR #58 검토 #2 반려, 같은 브랜치 feat/t14·experiment/t14) 순서: F-307(opus, 방향 상자 또는 각 허용 + 실제 합쳐지는 8시점 장면) → F-311(opus, 같은 파일) → F-312 LOD 상자 벽(sonnet) → F-317(opus) → F-320 ①②③⑤⑦(sonnet)·④⑥(haiku) → F-319(sonnet) → F-318(sonnet/haiku) → F-321·F-316 ⑤⑥(haiku) | T14 소유 경로 전부, bench/tower_assets/, 연구 decisions/0044·experiments/t14.md | F-307 확인 기준, 치명·높음 0, npm test 0 실패, 문턱 변경 금지 | 항목별(왼쪽) |
| T14.R3 [x] | (2026-10-04 PR #58 검토 #4 통과로 처리, 제품 eb41a71, F-307·F-318·F-322·F-323·F-324 닫힘) (PR #58 검토 #3 반려, T14 반려 3회, 같은 브랜치 feat/t14·experiment/t14. 다음 반려면 T14.4 를 떼어 내고 나머지 병합) 순서: F-307(opus, 시드 무관 SSIM — S-far-high 미달 원인부터) → F-318(sonnet, 0044 건물 LOD 절·계약 :6) → F-324(haiku, 서브에이전트 작업 트리 git 신원, PR 본문 수치) → F-322(opus)·F-323(opus) → F-319 ③⑦(sonnet) → F-320 ⑥(haiku) → F-312(sonnet) → F-321 ①③·F-316 ⑤⑥(haiku) | T14 소유 경로 전부, bench/tower_assets/, 연구 decisions/0044·experiments/t14.md | F-307·F-318 확인 기준, 치명·높음 0, npm test 0 실패, 문턱 변경 금지 | 항목별(왼쪽) |
| T14.4S [x] | (2026-10-04 제품 PR #59 검토 #1 통과·병합(merge commit, 0266bba), F-331·F-326 닫힘, 시드 1..300 실패 0·최저 0.9825 감독 재현) (PR #58 검토 #4 에서 분리, 높음 F-331) 건물 LOD 시드 스윕: 시드 180 top-high 0.9496 원인 규명·수정, 시드 1..300 × 8시점 실패 0 을 시험(또는 [cloud] 스윕 스크립트+노트)으로 보인다. 새 브랜치 feat/t14-lod-sweep·experiment/t14-lod-sweep(base experiment/t14). F-326(틈 칸 hideTol) 과 함께 볼 것 | `server/buildings/lod/`, 연구 decisions/0044·experiments/t14.md | 시드 1..300 실패 0·최솟값 기록, 변이 12종 실패, 문턱 0.95·2 px 불변 | opus |
| T14.R4 | (2026-10-05 [x] T14.R8 제품 PR #64 검토 #4 통과·병합(merge commit, 제품 9184ae6), 남은 높음 F-359·F-374 는 T14.R9 로 분리) (이전: 2026-10-05 제품 PR #64(T14.R8) 검토 #3 반려(T14.R8 반려 3회 — 다음 검토에서 F-359 만 남으면 범위 쪼갬) — 사유 F-372(높음, 응집 색인 큰 좌표 무한 루프, 이번 diff 회귀)·F-359(높음, ±2 DN 4경우 경계값 거짓 정합 통과). 같은 브랜치에서 F-372(sonnet) → F-359(opus, 불확정 블록 보고 또는 귀무 근거 k) → F-366(opus) → F-370(sonnet, 계수 시험 빈 곳) → F-369(sonnet, 0044 색인·계수 항목) → F-373(opus, 색인 최악 이차) → F-371 ⑧⑨ 와 남은 항목, 고친 뒤 PR #64 다시 열기) (이전: 2026-10-05 제품 PR #64(T14.R8) 검토 #2 반려(T14.R8 반려 2회) — 사유 F-359(높음, F-363 고침이 실제 1.4~1.5 px 어긋남을 거짓 통과로 되돌림). 같은 브랜치에서 F-359(opus) → F-366(opus) → F-370(sonnet) → F-369(sonnet) → F-354(opus) → F-365(sonnet) → F-367(sonnet) → F-371(haiku①③④⑤/sonnet②⑥⑦), 고친 뒤 PR #64 다시 열기) (이전: 2026-10-05 제품 PR #64(T14.R8) 검토 #1 반려(T14.R8 반려 1회) — 사유 F-363(높음) 미처리. 같은 브랜치 feat/t14-r8·experiment/t14-r8 에서 F-363(opus) → F-364(sonnet) → F-366(sonnet) → F-368(sonnet) → F-354(haiku) → F-365(haiku) → F-367(sonnet), 고친 뒤 PR #64 다시 열기) (이전: 2026-10-05 제품 PR #63(T14.R7) 검토 #2 통과·병합(merge commit, 제품 7cbca86, 연구 PR #63 → experiment/t14 22b3ba5) — F-352·F-353·F-357·F-312·F-330·F-356 닫힘, F-354·F-355·F-325 다시 엶. T14.R7 반려 1회 뒤 통과. 남은 것: 새 브랜치 feat/t14-r8·experiment/t14-r8(base experiment/t14)에서 F-363(opus, 높음, 잔차 경로 거짓 local — 병합 뒤 발견) → F-358(opus, 축 평평 절대 문턱) → F-359(opus, 이상치 경계 0.5) → F-364(sonnet, 드레이프 시험 공백) → F-355(sonnet, 감김 섞인 메시) → F-360(sonnet, windingArea O(T²)) → F-361(sonnet, 접기 시험·minZ 허용차) → F-354·F-325(haiku, 0044 표·조건 목록) → F-362(①④ haiku, ②③ sonnet) → F-321) (이전: 2026-10-05 제품 PR #63(T14.R7) 검토 #1 반려(T14.R7 반려 1회) — F-327 닫힘, F-312 다시 엶. 같은 브랜치 feat/t14-r7·experiment/t14-r7 에서 고친 뒤 PR #63 다시 열기. 순서: F-352(opus, 높음, LOCAL_MIN_MSE 거짓 통과) → F-357(opus, 높음, 재적합 이상치 1~1.6 px 거짓 통과) → F-353(opus, 한 축 평평 블록 제외) → F-354(haiku, 0044 기록) → F-355(sonnet, 부분 지붕) → F-312(sonnet, 공유 정점 벽 mask) → F-356(①②③④ sonnet, ⑤⑥ haiku) → 남은 F-330(haiku 노트, sonnet 접기)·F-321) (이전: 2026-10-05 제품 PR #62(T14.R6) 검토 #1 통과·병합(merge commit, 제품 e3bb7e3, 연구 PR #62 → experiment/t14 01ef6c8) — F-342·F-345 닫힘. 남은 것: 새 브랜치 feat/t14-r7·experiment/t14-r7(base experiment/t14)에서 F-348(sonnet, 예산 소진 → 거부 병합 시험) → F-347(sonnet, 경계 등호·대각 시험 재작성) → F-346 ③(haiku, README 척도 문장) → F-349(haiku, 32동 시험 주석) → F-350(sonnet, frame 계수 사각) → F-351(sonnet, heap PSS 시험) → 아래 기존 F-325 이하) (이전: 2026-10-04 제품 PR #61(T14.R5) 검토 #1 통과·병합(merge commit, 제품 e9e1fe6, 연구 PR #61 → experiment/t14 91e0bc1) — F-338·F-339·F-340·F-341·F-343·F-344 닫힘, F-342 열림 유지(같은 파일 벽시계 시험). 남은 것: 새 브랜치 feat/t14-r6·experiment/t14-r6(base experiment/t14)에서 F-345(opus, 이어받은 틈 칸 예산·재측정 범위) → F-342(sonnet, frame 시험 나머지 벽시계) → F-346(sonnet, reframe 시험·표기) → F-347(haiku, 경계 등호·e 상한 주석) → 아래 기존 F-325 이하) (이전: 2026-10-04 제품 PR #60 검토 #1 통과·병합(merge commit, 제품 4c1828c, 연구 experiment/t14 03368b1) — F-332~F-337 닫힘. 남은 것: 새 브랜치 feat/t14-r5·experiment/t14-r5(base experiment/t14)에서 F-338(opus, 연쇄 병합 틈) → F-341(sonnet, 중간 시점 합계 > 0) → F-339(sonnet, 분기한정·예산 시험) → F-340(haiku, README·노트 수치) → F-343(haiku, 주석 한국어) → F-342(sonnet, frame 시간비 시험) → F-344(sonnet, 칸 키 시험·하한 주석) → 아래 기존 F-325 이하) (원래 범위, F-332~F-337 처리됨: (PR #58 검토 #4·PR #59 검토 #1 뒤 남은 중간·낮음, 새 브랜치 feat/t14-r4·experiment/t14-r4(base experiment/t14)) 순서: F-332(sonnet, 감소율 하한·스윕 도구 실패 조건) → F-333(sonnet, 시드 180 고정·시험 시간) → F-334(opus, 끼인 틈 폭) → F-335(opus, 긴 틈 칸 표본) → F-336(haiku) → F-337(haiku) → F-325(sonnet, 0044 §7 서술·시험 이름) → F-327(sonnet) → F-328(opus, 드레이프 시험 공백·외삽) → F-329(①②③⑥ sonnet, ④⑤ haiku) → F-330(haiku 노트, sonnet 접기) → F-312(sonnet) → F-319·F-320·F-321·F-316 잔여(haiku/sonnet) | T14 소유 경로, 연구 decisions/0044·experiments/t14.md | 각 FEEDBACK 확인 기준, npm test 0 실패 | 항목별(왼쪽) |
| T14.R9 | (2026-10-05 [x] 제품 PR #65 검토 #1 통과·병합(merge commit, 제품 4cc379c) — F-359 반려 누적 3회 초과로 범위 쪼갬, 남은 높음 F-359 는 T14.R10) (원래: 2026-10-05 제품 PR #64(T14.R8) 검토 #4 에서 분리 — T14.R8 반려 3회 뒤 범위 쪼갬, 높음 F-359·F-374) 드레이프 잔차 경로 거짓 정합 통과: 탐색 경계에 닿았는데 판정 안 난 블록·저대비 블록은 정합 통과를 내지 않음(불확정 보고), k 는 진단값, 양성 시드 30개 단언, dy 허용 0.15 복원·짝 검정 경로 축소 변이를 잡는 시험. 이어서 F-376(opus) → F-369(sonnet) → F-375(sonnet) → F-377(opus) → F-378(haiku/sonnet). 새 브랜치 feat/t14-r9·experiment/t14-r9(base experiment/t14) | `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044·experiments/t14-r9.md | F-359·F-374 확인 기준(warpedTile 1.5·2·2.5 DN × ±1·±2 × 시드 30 에서 measured·≤ 1 px 0건, 귀무 거짓 local 0), npm test 0 실패 | opus |
| T14.R10 | (2026-10-05 [x] 제품 PR #66 검토 #1 통과·병합(merge commit, 제품 fe503af) — F-359 (A)·F-379·F-380·F-382·F-383 ①② 처리, 남은 높음 F-359 (B) 는 T14.R11) (원래: 2026-10-05 제품 PR #65(T14.R9) 검토 #1 에서 분리) 드레이프 F-359 잔여: 두 축을 잰 블록의 자기 최소가 예측 0.5 px 안이라 어느 경로에도 들지 않는 실제 1.5 px 블록(g −0.375 e −1.125 에서 28/180, ±1 DN 포함). 귀무 거짓 불확정 비율 함께 기록. 이어서 F-379(sonnet, todo 를 알려진 시드만) → F-380(sonnet) → F-381(sonnet, 0044·노트) → F-382(sonnet) → F-374 잔여(sonnet) → F-369(sonnet) → F-383(haiku/sonnet). 새 브랜치 feat/t14-r10·experiment/t14-r10(base experiment/t14) | `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044·experiments/t14-r10.md | F-359 확인 기준(검토 #1: 세 g 조합 표, 0 아니면 그 시드만 todo), F-379 확인 기준, npm test 0 실패 | opus |
| T14.R11 | (2026-10-05 [x] 제품 PR #67 검토 #2 통과·병합(merge commit, 제품 337d39f) — F-386·F-359·F-387·F-388·F-389 닫음, 반려 1회 뒤 통과; 잔여 중간·낮음은 T14.R12) (2026-10-05 09:05 제품 PR #67 검토 #1 반려 1회 — F-386·F-387 미처리, F-359 (B) 알려진 한계 승인하되 0044 결정 필요, F-388 신규; 재작업 순서 F-386(opus) → F-359 (B) 결정(sonnet) → F-388(haiku) → F-387(sonnet) → F-381 ⑨·F-369(haiku) → F-389·F-385 잔여) (2026-10-05 제품 PR #66(T14.R10) 검토 #1 에서 분리, 한 회차 한정) 먼저 F-386(opus, 높음 — farOwn 을 지키는 시험, (A) 효과 수치 정정) → 드레이프 F-359 (B): 저대비·잡음 블록 비용 치우침으로 남은 거짓 정합 통과 21/540 — 0.35/1.25 계열 규칙을 저대비 블록으로 제한해 F-317·F-363 회귀 없이, 측정 스크립트 커밋. 한 회차로 줄지 않으면 0044 에 알려진 한계 결정으로 남김. 이어서 F-381(sonnet, 0044 T14.R10 결정 4건·:44·:106·:111) → F-384(sonnet) → F-387(sonnet) → F-369(sonnet) → F-383 ③④⑥~⑨(haiku/sonnet) → F-385(haiku/sonnet). 새 브랜치 feat/t14-r11·experiment/t14-r11(base experiment/t14) | `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044·experiments/t14-r11.md | F-359 확인 기준(검토 #1: 수정 전/후 세 g 조합 표, 알려진 시드만 todo, 귀무 거짓 local 0, 귀무 거짓 불확정 ≤ 15 %), F-384 변이 확인, npm test 0 실패 | opus |
| T14.R12 | (2026-10-05 [x] 제품 PR #68 검토 #1 통과·병합(merge commit, 제품 51b6efc, 연구 experiment/t14 974c670) — F-390 ①~⑧ 닫음, 반려 0회; 남은 F-390 ⑨·F-391 은 T15 와 함께) (2026-10-05 제품 PR #67(T14.R11) 검토 #2 에서 분리, 한 회차 한정 — 이 회차 뒤에는 반려하지 않고 남은 항목을 T15 와 함께 고친다) F-390 ①②(opus, farOwn 음성 시험·진입 경로 단언) → ⑧(sonnet, lod NaN·finally·near 빈 호출 시험) → ⑥(sonnet, t===null local 블록 드러내기, 결정이면 0044) → ③⑤ + F-369·F-381 ⑨·F-385 ⑨(sonnet, 0044 문구·후보 규칙 재현 옵션) → ④⑦⑨(haiku). 새 브랜치 feat/t14-r12·experiment/t14-r12(base experiment/t14) | `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044·experiments/t14-r11·t14-r12.md | F-390 항목별 확인 기준(변이에서 실패·원본 통과), npm test 0 실패 | opus |
| T14L | [local] 실제 VWorld DEM·위성·건물 외곽 입력으로 T14.1~T14.9 재측정(사람 입력 필요) | 연구 experiments/ | 실제 입력 수치 기록 | sonnet |

### T15 `controlview-b` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T15.R | (2026-10-05 제품 PR #69 검토 #1 통과·병합(merge commit, 제품 ed43b2a, 연구 experiment/t14 a8bf842) — F-391 ①③⑤⑧⑩⑪ 닫음; 남은 F-391 ②④⑥⑦⑨·F-392·F-390 ⑨ 는 T15.R2) (2026-10-05 제품 PR #68(T14.R12) 검토 #1 에서 분리) T15 첫 PR 과 함께: F-391 ①②③⑤⑦⑧⑩⑪(haiku, 주석·0044·노트 문구·계수 단언·캐시 키) → ④⑥(sonnet, t===null 연결 시험·farOwn 0.6·잔차 1.0 문턱 변이 시험) → F-390 ⑨(haiku, 시험 강도 유지 조건에서만) | `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044·experiments | F-391 항목별 확인 기준 | haiku |
| T15.0 | [x] 2026-10-05 제품 ed43b2a(PR #69 검토 #1 통과, 원본 towerViewer.ts 대조는 [local] T15.0L) 계약: 관제탑 화면 어댑터 인터페이스(기존 `towerViewer.ts` 공개 메서드 대응표) | `contracts/controlview/` | 대응표 전 메서드 포함 | haiku |
| T15.R2 | [x] 2026-10-05 제품 e181ff7(PR #70 검토 #1 통과, merge commit; 연구 experiment/t14 e363af9) — F-392 ①~⑨·F-391 ⑥ 닫음, 남은 F-391 ②④⑦ 은 T15.R3. (2026-10-05 제품 PR #69 검토 #1 에서 분리) T15.1 첫 PR 과 함께: F-392 ①②(sonnet, isDrapeAligned 수·유한·음수 검사, 음수 미측정 사례) → F-391 ②⑦·F-392 ③~⑨(haiku, 주석·0044·계약 문구·한도 필드) → F-391 ④(sonnet, U1 변이를 잡는 호출부 연결 시험) → F-391 ⑥·F-390 ⑨(sonnet, 못 하면 0044 기록) | `contracts/controlview/`, `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044 | F-391·F-392 항목별 확인 기준 | sonnet |
| T15.R3 | [x] 2026-10-05 제품 02bfe45(PR #71 과 함께 병합, F-391 ②④⑦·F-393 ③~⑦ 처리, F-393 ⑪⑬ 은 T15.1c). (2026-10-05 제품 PR #70 검토 #1 에서 분리) T15.1 PR 과 함께: F-391 ②④⑦·F-393 ③~⑦(haiku, 0044 표기·괄호·시험 이름·주석 −1·tolPx 유한·계약 음성 단언) | `contracts/controlview/`, `server/terrain/drape/`, `server/buildings/lod/`, 연구 decisions/0044 | F-391·F-393 항목별 확인 기준 | haiku |
| T15.0L | [local] skylens 체크아웃 towerViewer.ts 공개 메서드와 대응표 한 줄씩 대조, origin 'estimated' → 'checked' | `contracts/controlview/` | 대응표 = 원본 공개 메서드 | haiku |
| T15.1 | [x] 2026-10-05 제품 c420ed6(PR #72 T15.1c 로 완료 기준 충족, 합성 근사 기준 — 실제 DEM SSIM 은 T14L [local]. 2026-10-06 감독: 1 m 셀 ±0.15 m 잡음(lowNoise)에서 LOD1~3 20/36 조건 SSIM < 0.95 — 2 m 셀 장면만으로 충족 판정, F-474·T15.10d). (2026-10-05 제품 PR #71 검토 #2 통과·병합(merge commit, 제품 02bfe45, 연구 experiment/t14 ea949c0) — 지형 층·F-394·F-395(대안 기준) 닫음; 반려 1회 뒤 통과. **완료 기준 미충족: LOD3 시드 5·6·7·9·10 미달 10 조건 → T15.1c**, [x] 아님) 지형 그리기 | `client/tower/terrain/` | 8시점 SSIM ≥ 0.95(시드 1~12 × 잡음 {0, 0.015} 최소값) | opus |
| T15.1c | [x] 2026-10-05 제품 c420ed6(PR #72 검토 #1 통과·merge commit, 연구 experiment/t14 bfbd3b5, 반려 0회; LOD3 상한 1 m 결정 0046 조건부 승인, 후속 F-400·F-401). (2026-10-05 제품 PR #71 검토 #2 에서 분리) LOD3 기하 개선으로 알려진 미달 10 조건(ssim_views KNOWN_SHORTFALL)을 0.95 이상으로 — 원인 측정(경사 오차 대 높이 오차 상한 2 m), 기준 0.95·해상도 160×90 은 바꾸지 않는다. 함께: F-398 ①(sonnet)·②③④(haiku), F-399(sonnet/haiku), F-396 ①②③·F-397 ⑦ 잔여, F-393 ⑪⑬ | `client/tower/terrain/`, 서버 지형 LOD(필요 시), 연구 decisions/0046 | KNOWN_SHORTFALL 비움 + 시드 1~12 × 잡음 {0,0.015} LOD1~3 최소 ≥ 0.95, npm test 0 실패 | opus |
| T15.2 | [x] 2026-10-05 제품 b46bf70(PR #73 검토 #2 통과·merge commit, 연구 experiment/t14 ca41687, 반려 1회; F-402·F-403·F-404 닫음, 결정 0047 승인, 후속 F-405·F-406). (반려 1회 2026-10-05 15:33, 제품 PR #73 검토 #1: 같은 브랜치에서 먼저 **F-402(높음, sonnet — mask 0 화소 메우기)**, 그다음 F-403(중간, ①②④⑧ sonnet·③⑤⑥ opus·⑦ haiku)·F-404(낮음)) 드레이프 그리기(정합 판정은 unmeasuredLocalBlocks > 0 이면 통과로 세지 않음, F-391 ⑨). 먼저 F-393 ①②(opus): :745·:779 경로 local 블록(unexcludedPx 미설정)을 미측정으로 셀지 정하고 0044 결정 보강 — 정하지 않고 T15.2 정합 판정을 올리면 높음으로 반려 | `client/tower/drape/` | 정합 ≤ 1 px | opus |
| T15.2b | [x] 2026-10-05 제품 병합 커밋 7067016(PR #77, T15.3d 와 함께, 검토 #1 통과·merge commit, 반려 0회; F-405 ②·F-406 ⑥ 닫음) (2026-10-05 PR #73 검토 #2 에서 분리) 비스듬 정합 시험 시드 의존 제거(F-405 ②): 고정 MUST_CATCH 목록 대신 예상 이동 > 문턱 여유일 때만 초과 단언, 화면 음성 구성값 시드별 진단, 정상 경로 정밀도 단언(F-406 ⑥) | `client/tower/drape/` | SEEDS [1..6]·[7..12]·[13..18] 모두 통과, 반 화소 변이 48 시점 실패 | opus |
| T15.3 | [x] 2026-10-05 제품 a2cd492(PR #74 검토 #2 통과·merge commit, 연구 experiment/t14 2818e9b, 반려 1회; F-407 닫음, 결정 0049 승인·0048 조건부 승인, 후속 F-408 ⑦·F-409 ①·F-410·F-411 은 T15.3b). 건물 그리기(3옵션 전환, 재요청 없음). (2026-10-05 PR #74 검토 #1 반려 1회 — 순서: F-407(sonnet) → F-408 ①②③④(sonnet) → F-408 ⑤⑥·F-409 ①②③⑧(haiku) → F-409 ④~⑦(sonnet). F-408 ⑦ 성능은 다음 PR 로 미뤄도 됨) | `client/tower/buildings/` | 전환 시 네트워크 요청 0, 층 대 참조 시험이 F-407 변이 ①②③ 에서 실패 | sonnet |
| T15.3b | [x] 2026-10-05 제품 병합 커밋 d2cf5f2(PR #75 검토 #1 통과·merge commit, 반려 0회; F-408·F-409·F-410·F-411 닫음, F-412 ⑦⑧ 닫음, 남은 F-412 ①~⑥·F-413·F-414 는 T15.3c). (2026-10-05 PR #74 검토 #2 에서 분리) 건물 층 후속: F-410 ① points 투영 분모 double(sonnet), ②③ layer_ref 선 화소 index·깊이 단언과 대칭 허용 뒤 black 하한 0.99(sonnet), ④ 감시자 지연 호출(mock.timers)(sonnet), ⑤ 영상 없는 aerial 층 시험(sonnet), F-408 ⑦ 결과 버퍼 재사용·묶음 컬링(sonnet), F-411 ③(sonnet), F-409 ①·F-410 ⑥⑦·F-411 ①②④ 문서·주석(haiku), F-412 ①②③④⑦⑧(sonnet)·⑤⑥(haiku) | `client/tower/buildings/`, 연구 decisions·experiments | F-410 각 확인 기준, 연속 render 사이 새 typed array 0 | sonnet |
| T15.3c | [x] 2026-10-05 제품 병합 커밋 19ece21(PR #76 검토 #1 통과·merge commit, 반려 0회; F-412 닫음, F-413 ②③·F-414 ①②③⑥⑦ 닫음, 남은 F-413 ①④·F-414 ④⑤·F-415·F-416 은 T15.3d). (2026-10-05 PR #75 검토 #1 에서 분리) 건물 층 시험·문서 보강: F-413 ② 할당 단언(생성 횟수 0, black 포함)(sonnet), F-412 ①②③④ perf 하한·aerial 표본·dns 감시·지붕 색 허용(sonnet), F-414 ①②③ 근평면 컬링 경계·선 단언·setInterval(sonnet), F-413 ①③④·F-412 ⑤⑥·F-414 ④⑤⑥⑦ 노트·결정·계약 문구(haiku) | `client/tower/buildings/`, 연구 decisions·experiments | F-412·F-413·F-414 각 확인 기준 | sonnet |
| T15.3d | [x] 2026-10-05 제품 병합 커밋 7067016(PR #77 검토 #1 통과·merge commit, 연구 experiment/t14 fa620aa), 반려 0회; F-413·F-414·F-415 닫음, F-416 ⑤ 잔여·F-417·F-418 은 T15.3e. (2026-10-05 PR #76 검토 #1 에서 분리) 건물 층 남은 보강: F-414 ⑤ compose into 버퍼 겹침 RangeError(sonnet), F-415 ① node:timers 이름 가져오기 감시(sonnet), F-415 ② perf 덮인 화소 정확 단언·여러 묶음(sonnet), F-413 ① t15-3b 표 재측정(sonnet), F-413 ④·F-414 ④·F-415 ③·F-416 ①~⑥ 노트·결정·주석·단언(haiku), F-416 ⑦ 관찰만 | `client/tower/buildings/`, 연구 decisions·experiments | F-413 ①④·F-414 ④⑤·F-415·F-416 각 확인 기준 | sonnet |
| T15.3e | [x] 2026-10-05 PR #78 에 포함 병합(T15.4 와 같은 병합 커밋), F-417·F-418 닫음. (2026-10-05 PR #77 검토 #1 에서 분리) T15.4 PR 과 함께: F-417 ①③(haiku, 6묶음 perf 장면 재측정 → 주석·t15-3b/3c·0049 수치 한 값, [cloud] 표), F-417 ②④(haiku, layer_ref:19 주석, 0049 승인 절 원문 되돌림), F-418 ①②(haiku, compose fill 시험, align_oblique 시드 환경 변수·건너뛴 시점 로그), F-418 ③④(haiku, 노트·JSDoc 문구) | `client/tower/buildings/`, `client/tower/drape/`, 연구 decisions·experiments | F-417·F-418 각 확인 기준 | haiku |
| T15.4 | [x] 2026-10-05 제품 병합 커밋 c5b763c(PR #78 검토 #2 통과·merge commit, 연구 experiment/t14 b2bce99), 반려 1회; F-419~F-422 닫음, 잔여 F-423~F-425 는 T15.4f. 방향키 조향·Q/E 고도 로컬 처리 | `client/tower/input/` | 입력→카메라 갱신이 같은 프레임 안 | sonnet |
| T15.4f | [x] 2026-10-05 PR #79 에 포함 병합(T15.5 와 같은 병합 커밋), F-423·F-424·F-425 닫음(F-423 문구 잔여는 F-426). (2026-10-05 PR #78 검토 #2 에서 분리) T15.5 PR 과 함께: F-423 결정 0050 근거 정정·MAX_RATE 절(haiku), F-424 ① node:timers 타이머 계수(sonnet), ② DRAPE_SEEDS 0 거절·빈 문자열 단언(haiku), ③ 기본 pos float32 검사(haiku), F-425 ①② 시험 이름·주석(haiku) | `client/tower/input/`, `client/tower/drape/`, 연구 decisions | F-423·F-424·F-425 각 확인 기준 | haiku |
| T15.5 | [x] 2026-10-05 제품 병합 커밋 67361df(PR #79 검토 #1 통과·merge commit, 연구 experiment/t14 ae5565f), 반려 0회. 합성 시험으로 [cloud] 검증, 원본 사례 일치는 [local] T15.0L. 추적 카메라(기존 감쇠 의미) | `client/tower/chase/` | 기존 시험 사례 일치 | sonnet |
| T15.5f | [x] 2026-10-05 PR #80 에 포함 병합(T15.6 와 같은 병합 커밋), F-427·F-428 닫음, F-426 ① 닫음·②③④ 잔여는 T15.6f. (2026-10-05 PR #79 검토 #1 에서 분리) T15.6 PR 과 함께: F-427 추적 카메라 setTarget·생성 float32 검사·계약(sonnet), F-426 결정 0051 renderer_basis·dt 상한 정정·0050 문구 잔여·계약 chase.mjs:13 조건(haiku), F-428 ①②③⑤(haiku)·④⑥(sonnet) | `client/tower/chase/`, `client/tower/input/`, 연구 decisions | F-426·F-427·F-428 각 확인 기준 | sonnet |
| T15.6 | [x] 2026-10-05 제품 병합 커밋 afbe1cc(PR #80 검토 #1 통과·merge commit, 연구 experiment/t14 c05b265), 반려 0회. 합성 시험으로 [cloud] 검증(ENU 왕복 4.225e-9 m), 원본 오버레이 의미 대조는 [local] T15.0L. 드론·경로·탐지 마커 | `client/tower/overlay/` | 위치 ENU 일치 ≤ 1 cm | opus |
| T15.6f | [x] 2026-10-05 PR #81 에 포함 병합(T15.7 과 같은 병합 커밋), F-429~F-433 닫음, F-426 은 T15.7f. (2026-10-05 PR #81 검토 #2: F-432 닫음, 문구 잔여는 F-440 ①②, F-426 열림) (2026-10-05 PR #81 검토 #1: F-429·F-430·F-431·F-433 닫음, F-426·F-432 문구 잔여 haiku — T15.7 재제출과 함께) (2026-10-05 PR #80 검토 #1 에서 분리) T15.7 PR 과 함께: F-429 maxPaths 한도·계약(sonnet), F-430 project 프레임 경로 깊은 복사 제거·상한 규모 perf 시험(sonnet), F-431 overlay·input 타이머 감시 scheduler·지연 타이머·양성 대조 공유(sonnet), F-426 ②③④ 0051·0050 문구(haiku), F-432 0052 서술(haiku, ① 일치 시험 sonnet), F-433 ①③⑥(sonnet)·②④⑤(haiku) | `client/tower/overlay/`, `client/tower/input/`, 연구 decisions·experiments | F-426·F-429~F-433 각 확인 기준 | sonnet |
| T15.7 | [x] 2026-10-05 제품 병합 커밋 f0b6609(PR #81 검토 #3 통과·merge commit, 연구 experiment/t14 5354fd9), 반려 2회. 합성 재생 시험으로 [cloud] 검증. 완료 기준 해석(감독 판정): maxInflight 무제한에서 빠진 조각 0, 기본값은 놓친 타일 0·자리 낭비 0·정지 뒤 0. 시점 이동에 따른 조각 요청 | `client/tower/streaming/` | 경로 재생 시 빠진 조각 0 | opus |
| T15.7f | [x] 2026-10-05 PR #82 에 포함 병합(T15.8 과 같은 병합 커밋), F-441 닫음, F-442 ③⑥⑦⑧⑩~⑭ 닫음·①②④⑤⑨ 와 F-426 은 T15.8f. (2026-10-05 PR #81 검토 #3 에서 분리) T15.8 PR 과 함께: F-441 재생 시험 틀 강화 — K < 경로 시점 수, 경로 중 진행 하한·오라클 밖 inflight 0, 변이 세 종, 퍼즈 1 벽시계 단언 교체(opus), F-442 ①~⑥⑧ 문구·주석·isSafeInteger·R 직교성(haiku)·⑦ perf 이동 시험 묶음 판정(sonnet), F-426 ②④ 문구(haiku) | `client/tower/streaming/`, 연구 decisions·experiments | F-441·F-442·F-426 각 확인 기준 | opus |
| T15.8 | [x] 2026-10-05 제품 병합 커밋 256b653(PR #82 검토 #1 통과·merge commit, 연구 experiment/t14 07abad6), 반려 0회. 합성 장면 [cloud] 검증. 폴백(2D 지도 표시, 사람 확인 전 임시) | `client/tower/fallback/` | 서버 불가 모의 시 표시 | sonnet |
| T15.8f | [x] 2026-10-06 PR #83 에 포함 병합(T15.9 와 같은 병합 커밋 ad19769), F-443·F-444·F-445·F-446·F-442·F-426 닫음, F-450 잔여는 T15.9f(F-455). (2026-10-05 PR #82 검토 #1 에서 분리) T15.9 PR 과 함께: F-443 퇴화 입력(marginPx 0 경계 visible, 여백 > 크기, minSpanM·metersPerPx 하한) 계약·시험(sonnet), F-446 폴백 시험 빈틈(M19·M09·M26·M30·N05·N08·N09 변이가 실패하게, sonnet), F-444 ① 자동 맞춤 무할당·② 한도 규모 perf 또는 총 점 상한(sonnet)·③ visible 2D 클리핑(opus), F-445 ①~⑩(haiku 중심, ⑥⑧⑨ sonnet), F-442 ①②④⑤⑨·F-426 문구(haiku) | `client/tower/fallback/`, `client/tower/streaming/`, 연구 decisions·experiments | F-443~F-446·F-442·F-426 각 확인 기준 | sonnet |
| T15.9 | [x] 2026-10-06 제품 병합 커밋 ad19769(PR #83 검토 #2 통과·merge commit, 연구 experiment/t14 16f0a95), 반려 1회. F-447·F-448·F-449 닫음, 잔여는 T15.9f. 통합 시험 | `client/tower/e2e/` | 녹화 재생 상태 일치 | opus |
| T15.9f | [x] 2026-10-06 PR #84 에 포함 병합(T15.10 과 같은 병합 커밋, 해시는 아래 T15.10 줄), F-451~F-465 닫음. (2026-10-06 PR #83 검토 #2 에서 분리) T15.10 PR 과 함께: F-452 no_network 옛 시험 안 조립 삭제·held 정확 단언(sonnet), F-453 공허한 오버레이 되돌리기 시험·determinism :65·:122-139(sonnet), F-454 폴백 성능 문턱(frame 호출 1 회 단언·16 ms·p90, sonnet) + F-451(sonnet), F-455 0055 fitView 하한 고정·도달 불가 되돌리기(sonnet)·F-450 잔여 문구(haiku), F-456 낮음 묶음(haiku, ④⑤ sonnet) | `client/tower/e2e/`, `client/tower/fallback/`, `contracts/controlview/`, 연구 decisions·experiments | F-451~F-456 각 확인 기준 | sonnet |
| T15.10 | [x] 2026-10-06 제품 병합 커밋 7f254b1(PR #84 검토 #3 통과·merge commit, 연구 experiment/t14 병합), 반려 2회 뒤 통과. 번들 68,062 B ≤ 300,000 B. 초기 ≤ 15 MB: 합성 noiseBig 에서 메시 형식 미충족(지형 LOD3 raw 38,158,848 B) — 0056·T15.10e. 잔여 F-466·F-467·F-468 은 T15.10c. (2026-10-06 PR #84 검토 #2 반려, 반려 2회: F-462 p90 시험 불안정 높음·F-463·F-464·F-465. 검토 #1 반려: F-461 번들 시험 높음 — 모델 haiku→sonnet) 번들·대역폭 측정. 함께: 지형 LOD 단계별 타일 바이트(합성 DEM + noiseBig 류 거친 DEM), LOD3/LOD2·LOD3/LOD0 비율 기록(F-400 ⑦, LOD3 상한 1 m 의 대가 확인 — LOD3 이 LOD2 와 같거나 예산 초과면 0046 다시 엶) | `bench/tower/` | 번들 ≤ 300 KB, 초기 ≤ 15 MB | sonnet |
| T15.10b | [x] 2026-10-06 제품 병합 커밋 9d6d676(PR #85 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회 뒤 통과. 결정 0056 측정·결론 승인(제안 (1)(2) 는 T15.10d·T15.10e). 후속 F-474~F-478. (2026-10-06 PR #85 검토 #1 반려, 반려 1회: F-470 0046 결론 1 lowNoise 해석 높음·F-471·F-472·F-473) (2026-10-06 PR #84 검토 #1 에서 분리, 결정 0046 다시 엶) F-458: 거친 DEM 지형 LOD 원본 물러남 — 상한표 4안(현행·옛 [0,0.5,1,2]·C1 면 법선 7.5°·LOD3 정점 수 상한/타일별 간격) × LOD3 raw 바이트·8시점 SSIM 비교, 높이만 보내는 지형 형식 검토(F-457 ①), 0046 에 T15.10 결과 절·예산 정의(raw 웹소켓 바이트). 실제 DEM 은 T14L [local] | `server/terrain/mesh_lod/`, `contracts/tower_assets/`, `bench/tower/`, 연구 decisions·experiments | F-458 확인 기준. SSIM 0.95·초기 15 MB 는 낮추지 않는다 | opus |
| T15.10c | [x] 2026-10-06 PR #85 에 포함 병합(T15.10b 와 같은 병합 커밋). (2026-10-06 PR #85 검토 #1: F-466~F-469 감독 확인 닫음, PR #85 통과 때 [x]) (2026-10-06 PR #84 검토 #3 에서 분리) T15.10b PR 과 함께: F-466 번들 시험 chunk 일부 누락·client_bundle 음성 단언·index.mjs 폴백 삭제(sonnet), F-467 Pfit10 주석·0054 다시 볼 조건·노트 수치(sonnet, ④⑤ haiku), F-468 낮음 묶음(haiku, ① sonnet), F-469 reuse_cull 시간 단언 부하 불안정(sonnet) | `bench/tower/`, `bench/client_bundle/`, `client/tower/fallback/`, `client/tower/buildings/`, 연구 decisions·experiments | F-466~F-469 각 확인 기준 | sonnet |
| T15.10d | [x] 2026-10-06 제품 병합 커밋 dde32ac — PR #86 검토 #2 통과·merge commit, 연구 experiment/t14 병합, 반려 1회 뒤 통과. 결정 0057 조건부 승인(F-485). 잔여 F-485·F-486·F-487 은 T15.10e 와 함께. (2026-10-06 PR #86 검토 #1 반려, 반려 1회: F-474 다시 엶 — 0057 S = 0.25 근거 불성립(높음), F-480~F-484) (2026-10-06 PR #85 검토 #2 에서 분리, F-474) 지형 LOD 상한 규칙 정정: 현행 [0,0.5,1,1] 이 1 m 셀 lowNoise 에서 S9 미달. 셀 크기·기울기 흔들림을 반영하는 규칙을 근거와 함께 정한다((v2) 0.25 m 는 사후 값이라 그대로 채택 금지). 시험으로 lowNoise 1 m 셀 시드 1~12 × LOD1~3 SSIM ≥ 0.95 단언(현행표 되돌림 변이에서 실패), lowNoise2m·hill 24·noiseBig 유지. 결정 기록(0046 부분 대체). 함께: F-475(sonnet), F-476(sonnet), F-477(sonnet), F-479(sonnet), F-478(haiku, ④⑤⑦ sonnet) | `contracts/tower_assets/`, `server/terrain/mesh_lod/`, `bench/tower/`, `bench/client_bundle/`, 연구 decisions·experiments | F-474~F-478 각 확인 기준. SSIM 0.95 는 낮추지 않는다 | opus |
| T15.10e | [x] 2026-10-06 제품 병합 커밋 5c4d6b5(PR #87 검토 #3 통과·merge commit, 연구 experiment/t14 병합), 반려 2회 뒤 통과. noiseBig 초기 지형 2,179,072 B·초기 합계 6,398,909 B ≤ 15,000,000 B, 128 장면 양자화 최소 SSIM 0.9648(step 0.03). F-458·F-493·F-498·F-499 닫음. 결정 0058 조건부 승인(F-500). 잔여 F-490·F-500·F-501·F-502 는 T15.10f. (2026-10-06 PR #87 검토 #2 반려, 반려 2회: F-493 다시 엶 — step 근거가 전역 격자 이전 측정(높음, opus), 함께 F-498·F-490 sonnet/haiku, F-499 sonnet/haiku. F-492·F-494~F-497 닫음) (2026-10-06 PR #87 검토 #1 반려, 반려 1회: F-492 이음매 균열 높음·F-493 양자화 SSIM 시드 밖 미달 높음 — 둘 다 opus, 함께 F-490·F-494·F-495·F-497 sonnet, F-496 haiku/sonnet) (함께: F-485 sonnet, F-486 sonnet, F-487 haiku·①②③⑤⑦ sonnet, F-488·F-489·F-490 sonnet, F-491 haiku·⑥⑦⑧⑩⑪ sonnet) (2026-10-06 PR #85 검토 #2 에서 분리, 0056 제안 (1)·F-458) 지형 높이만 전송 형식(H32: TerrainTile{cells, heights}, xy·인덱스 생략; LOD1~3 선택적 step ≤ 0.05 m 양자화, LOD0 은 f32 또는 계약에 상한 + step/2) — 계약·서버·클라이언트. T15.10d 뒤. noiseBig 초기 지형 raw ≤ 10,780,163 B(0056 지형 몫, 감독 승인 해석)와 초기 합계 ≤ 15,000,000 B 측정, SSIM 0.95 유지 | `contracts/tower_assets/`, `server/terrain/`, `client/tower/terrain/`, `bench/tower/`, 연구 decisions·experiments | 초기 ≤ 15 MB(noiseBig 합성), 8시점 SSIM ≥ 0.95, F-458 닫힘 | opus |
| T15.10f | [x] 2026-10-06 제품 병합 커밋 3c04667(PR #88 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회 뒤 통과. F-490·F-500·F-501·F-502·F-503·F-504 닫음. 잔여 F-505(aerial·black 4회 변이 결정적 계수·벽시계 감시)·F-506 은 T15.10g. (2026-10-06 PR #88 검토 #1 반려, 반려 1회: F-503 buildings perf 부하 간헐 실패 높음 sonnet, 함께 F-500 haiku·F-504 sonnet/haiku. F-490·F-501·F-502 닫음) (2026-10-06 PR #87 검토 #3 에서 분리) T15.10e 잔여: F-501 ssim_h32 변이 검사 장면·미달 수(sonnet), F-490 buildings perf points 문턱·옛 수치(sonnet), F-500 0058 정정·대가·다시 볼 조건과 0058 상태 줄·decisions/README 표 갱신(haiku), F-502 낮음 묶음(haiku ②④⑤⑦⑨, sonnet ①③⑥⑧) | `client/tower/terrain/`, `client/tower/buildings/`, `contracts/tower_assets/`, `server/terrain/height_format/`, `bench/tower/`, 연구 decisions·experiments | F-490·F-500·F-501·F-502 각 확인 기준. SSIM 0.95·15 MB 는 낮추지 않는다 | sonnet |
| T15.10g | [x] 2026-10-06 제품 병합 커밋 4b46e9c(PR #89 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. F-505·F-506 닫음. 잔여 F-507~F-510 은 T15.10h. (2026-10-06 PR #88 검토 #2 에서 분리) F-505 buildings perf 결정적 계수 단언(래스터 호출 수·처리 화소 수)·벽시계 감시 정리·재사용 out 단언·옛 수치 정정(sonnet), F-506 낮음 묶음(sonnet ①②③④⑤ 단언, haiku ⑤ 주석·⑥⑦⑧⑨). T16.0 과 같은 PR 로 묶어도 된다 | `client/tower/buildings/`, `contracts/tower_assets/`, `bench/tower/`, `client/tower/terrain/`, 연구 decisions·experiments | F-505·F-506 각 확인 기준. 시간 문턱은 근거 없이 측정에 맞추지 않는다 | sonnet |
| T15.10h | [x] 2026-10-06 제품 병합 커밋 7c942f4(PR #90 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. F-507·F-508·F-509·F-510 닫음. 잔여 F-511·F-512·F-513 은 T15.10i. (2026-10-06 PR #89 검토 #1 에서 분리) F-507 buildings 래스터 일의 양 카운터(깊이 시험 전 덮개 화소 또는 삼각형 수)·내부 반복 변이 단언·주석 범위 정정(sonnet), F-508 terrain_h32 비유한 검사를 round(min/s) 로·kbase 쪽 음성 시험(sonnet), F-509 perf 시간 문턱 규칙 결정 기록 decisions/0059(haiku), F-510 낮음 묶음(sonnet ①②③④, haiku ⑤⑥⑦). T16.0 과 같은 PR 로 묶어도 된다 | `client/tower/buildings/`, `contracts/tower_assets/`, 연구 decisions·experiments | F-507~F-510 각 확인 기준. 시간 문턱은 근거 없이 측정에 맞추지 않는다. SSIM 0.95·15 MB 불변 | sonnet |
| T15.10i | [x] 2026-10-06 제품 병합 커밋 8c61968(PR #91 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. F-511·F-512·F-513 닫음. 잔여 F-514 는 T15.10j. (2026-10-06 PR #90 검토 #1 에서 분리) F-511 terrain_h32 kmax 쪽 검사 음성 시험([0, 3.4e38]/2e38 null)·:194 입력 주석(sonnet), F-512 decisions/0059 정정(10배·벽시계 혼동 삭제, 1.34배 대 1.5배 선택 이유, 16 병렬 수치, 출처·관련 정정, [cloud], 상태 줄·README 행 승인)(haiku), F-513 낮음 묶음(haiku ①②⑤⑥, sonnet ③④). T16.0 과 같은 PR 로 묶어도 된다 | `client/tower/buildings/`, `contracts/tower_assets/`, 연구 decisions·experiments | F-511~F-513 각 확인 기준. 시간 문턱은 근거 없이 측정에 맞추지 않는다. SSIM 0.95·15 MB 불변 | sonnet |
| T15.10j | [x] 2026-10-06 제품 병합 커밋 7aef498(PR #92 검토 #2 통과, T16.0 과 같은 PR). F-514 닫음. (2026-10-06 PR #92 검토 #1: ①②③⑥⑦ 닫음, ④⑤ 잔여 haiku) (2026-10-06 PR #91 검토 #1 에서 분리) F-514 낮음 묶음 — ① terrain_h32 kmax > I32_MAX 음성 시험(sonnet), ②~⑦ decisions/0059 중복·승인 이력·출처·범위 서술·[cloud], t15-10i 노트 검증 줄(haiku). T16.0 과 같은 PR 로 묶어도 된다 | `contracts/tower_assets/`, 연구 decisions·experiments | F-514 확인 기준. SSIM 0.95·15 MB 불변 | haiku |

### T16 `load-harness` — [cloud]

| 하위 | 내용 | 소유 경로 | 완료 기준 | 모델 |
|---|---|---|---|---|
| T16.0 | [x] 2026-10-06 제품 병합 커밋 7aef498(PR #92 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. F-515~F-518 닫음. 잔여 F-519~F-521 은 T16.0a. 계약: 부하 시나리오 형식(접속 수·경로·시간), 결과 스키마(T01 스키마 재사용). (2026-10-06 PR #92 검토 #1 반려 1회) F-515 decisions/0060(sonnet), F-516 검증기 의미 검사(sonnet), F-517 시험 정확 비교(sonnet), F-518 낮음 묶음(haiku ①②⑤, sonnet ③④). T16.1 팬아웃 전에 끝낸다 | `contracts/load/`, 연구 decisions·experiments | 스키마 검증 + F-515~F-518 확인 기준 | sonnet |
| T16.0a | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. (2026-10-06 PR #93 검토 #1: F-519 닫음, F-520 ⑤·F-521 ③⑥ 잔여 → PR #93 반려 처리와 같이) (2026-10-06 PR #92 검토 #2 에서 분리) F-519 결과 검증기 희소 배열·중첩 여분 필드·path[0] NaN 중복(sonnet), F-520 load·H32 시험 경계 공백 ①~⑧(sonnet), F-521 0060·0059 문서 낮음 묶음(haiku). T16.1 과 같은 PR 로 묶어도 된다(T16.1 팬아웃 전에 F-519 를 먼저) | `contracts/load/`, `contracts/tower_assets/`, 연구 decisions | F-519~F-521 각 확인 기준 | sonnet |
| T16.1 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 모의 클라이언트 30개 동시 구동 | `bench/load/clients/` | 30개 동시 접속 유지 | sonnet |
| T16.2 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 서버 CPU·메모리 기록 | `bench/load/server_stats/` | 1초 간격 기록(모의: 하네스 프로세스 값, 실서버 미측정 → T16.12·F-530) | haiku |
| T16.3 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 클라이언트별 바이트·지연 기록 | `bench/load/per_client/` | 30개 각각 기록 | haiku |
| T16.4 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 첫 프레임 시간 분포 | `bench/load/first_frame/` | 30명 95% 분위 ≤ 3 s(헤드리스 참고) | sonnet |
| T16.5 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 대역 총합 | `bench/load/bandwidth/` | 총합 기록 | haiku |
| T16.6 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 수준 도착 폭주 시나리오. (2026-10-06 PR #93 검토 #1 반려) F-522: 측정 로그의 동시 도착을 제품 수준 상태 기계(client/levels)에 넣어 표시 로그를 만들고 도착 로그와 대조 | `bench/load/burst/`, `bench/load/clients/` | 상태 불변식 위반 0 + F-522 확인 기준 | opus |
| T16.7 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 느린 회선 모의 | `bench/load/slow_link/` | 역압 동작 | sonnet |
| T16.8 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 결과 → SPEC §4 표 보고서 | `tools/load_report/` | 표 생성 | haiku |
| T16.9 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 회귀 문턱 파일(확정 기준값) | `bench/thresholds/` | 문턱 초과 시 실패 종료(S5 문턱만, S6 지표 없음 → F-532 ⑧) | sonnet |
| T16.10 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 한 명령 재현 | `bench/load/run_all/` | 클린 클론에서 통과 | haiku |
| T16.11 | [x] 2026-10-06 제품 병합 커밋 a693fea(PR #93 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. (2026-10-06 PR #93 검토 #1 반려, 같은 브랜치 feat/t16-1·experiment/t16-1, PR #93 다시 열기) 순서: F-522(opus) → F-523(sonnet) → F-524 decisions/0061(sonnet) → F-525·F-526(sonnet) → F-527(sonnet/haiku) → F-520 ⑤(sonnet) → F-521 ③⑥·F-528(haiku) | `bench/load/`, `bench/thresholds/`, `tools/load_report/`, `contracts/load/`, `contracts/tower_assets/`, 연구 decisions·experiments | F-520~F-528 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.13 | [x] 2026-10-06 제품 병합 커밋 79481f1(PR #94 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. (2026-10-06 PR #93 검토 #2 통과 뒤 잔여, 새 브랜치) 순서: F-529 run_all 주입·burstArrivals·이름 단언(sonnet) → F-530 서버 샘플 출처·계약 주석(sonnet) → F-531 burst latencyMs(sonnet) → F-532 결정 0061 정정(haiku) → F-533 낮음 묶음(sonnet/haiku) | `bench/load/`, `bench/thresholds/`, `tools/load_report/`, `contracts/load/`, 연구 decisions·experiments | F-529~F-533 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.14 | [x] 2026-10-06 제품 병합 커밋 a3b5c34(PR #95 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. F-538·F-539 는 T16.15 로 넘김. (2026-10-06 PR #94 검토 #1 통과 뒤 잔여, 새 브랜치) (13:45 감독 보강: F-539 주입 로그 검증(sonnet)·F-538 statsClock 반쪽 주입(sonnet) 추가 — 진행 중 순서 끝에 붙이고, 이번 PR 에 넣기 어려우면 별도 PR. F-539 는 T16.12 가 실서버 로그를 주입하기 전에 반드시) 순서: F-535 durationS 소수 거짓 위반(sonnet) → F-536 load_report 역슬래시 이스케이프(sonnet) → F-537 ①~⑪(sonnet)·⑫⑬(haiku) → F-534 결정 0061·노트 정정(haiku) | `bench/load/`, `bench/thresholds/`, `tools/load_report/`, `contracts/load/`, 연구 decisions·experiments | F-534~F-539 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.15 | [x] 2026-10-06 제품 병합 커밋 666093d(PR #96 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. F-543~F-548 은 T16.16 로. (2026-10-06 PR #95 검토 #1 통과 뒤 잔여, 새 브랜치, T16.12 전) 순서: F-539 주입 로그 검증(sonnet) → F-538 statsClock 반쪽 주입·tS 비유한·checkServerSamples null(sonnet) → F-541 durationS < 1 샘플 0개(sonnet) → F-540 ③ 보고서 출처 줄(sonnet)·①② 계약 문구(haiku) → F-542 ①~⑦(sonnet)·⑧~⑫(haiku) | `bench/load/`, `tools/load_report/`, `contracts/load/`, 연구 decisions·experiments | F-538~F-542 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.16 | [x] 2026-10-06 제품 병합 커밋 5b49144(PR #97 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. 잔여 F-549~F-554 는 T16.17 로. (2026-10-06 PR #96 검토 #1 통과 뒤 잔여, 새 브랜치, T16.12 전) 순서: F-543 실제 시계 출처 표기·샘플 간격(sonnet) → F-547 주입 경로 validateScenario(sonnet) → F-544 first_frame·burst 도착 대조(sonnet) → F-546 생존 변이 ①~⑤(sonnet) → F-545 계약·0061 서술(haiku) → F-548 ①~⑧(sonnet)·⑨⑩(haiku) | `bench/load/`, `tools/load_report/`, `contracts/load/`, 연구 decisions·experiments | F-543~F-548 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.17 | [x] 2026-10-06 제품 병합 커밋 527ca91(PR #98 검토 #1 통과·merge commit, 연구 experiment/t14 병합), 반려 0회. 잔여 F-555~F-560 은 T16.12 로. (2026-10-06 PR #97 검토 #1 통과 뒤 잔여, 새 브랜치, T16.12 전, 하네스 정리 마지막 회차) 순서: F-551 실제 시계 샘플 간격·clock 일관성(sonnet) → F-550 계약 FIXTURE_EVENTS level 0·계약 서술(sonnet) → F-554 burst 경계 누락 시험(sonnet) → F-549 결정 0061 원래 행 되돌림·정정 절 정확화(opus) → F-552 새 결정 파일(haiku, 허용폭 근거 sonnet) → F-553 ①~⑬⑮⑯(sonnet)·⑪⑭(haiku) | `bench/load/`, `tools/load_report/`, `contracts/load/`, 연구 decisions·experiments | F-549~F-554 각 확인 기준. SPEC 수치(3 s 등) 변경 금지 | sonnet |
| T16.12 | [x] 2026-10-06 제품 병합 커밋 (병합 뒤 기록)(PR #100 검토 #2 통과·merge commit, 연구 experiment/t14 병합), 반려 1회. 잔여 F-567·F-569·F-570·F-571·F-572·F-573 은 T16.18 로. (2026-10-06 17:20 감독: 본 작업 PR #100 검토 #1 반려(반려 1회). F-559·F-561·F-562·F-563 닫음. 같은 브랜치 feat/t16-12b·experiment/t16-12b 에서 F-564 보고서 S5/S8 문구(sonnet) → F-565 실제 deps 통합 시험·run 판정 음성 시험(sonnet) → F-566 durationS 검증·자식 정리(sonnet) → F-567 level 페이로드 복원·첫 프레임 기준점(sonnet) → F-568 계약 문구(haiku)·reason 시험(sonnet) → F-569 0064·노트 정정(haiku) → F-570(sonnet) → F-571 ①~⑧⑩(sonnet)·⑨(haiku). F-566~F-571 은 같은 PR 에 넣되 F-564·F-565 가 먼저.) (2026-10-06 16:50 감독: 앞 정리 F-555~F-560 은 PR #99 검토 #1 통과·merge commit 555f1a6 으로 병합, 반려 0회. 본 작업 전에 먼저 F-559 want=1 잔여(sonnet) → F-561 load_report 섞인 source 시험·정확 단언(sonnet) → F-562 계약·0063 개수 서술(haiku) → F-563 ①~④⑦⑧(sonnet)·⑤⑥⑨(haiku) 를 본 작업 PR 에 함께 넣는다. 별도 정리 PR 은 만들지 않는다.) (2026-10-06 15:56 감독 보강: 먼저 PR #98 잔여 F-555 실제 시계 마지막 tS 늦음 여유(opus) → F-558 loadReport durationS·빈 샘플 개수(sonnet) → F-556 first_frame 추월 건너뛰기(sonnet) → F-557 계약·결정 서술 정정(haiku, 허용폭 근거는 F-555 와 opus) → F-559 server_stats 생존 변이(sonnet) → F-560 ①~⑩(sonnet)·⑦(haiku). 하네스 정리 별도 PR 은 더 만들지 않는다. 이어서) (2026-10-06 감독 등록, 결정 0061 (가) 제안 반영, T16.17 뒤) 제품 server/ws 를 띄운 실제 소켓 부하: 30 클라이언트 동시 접속·수준 수신, 서버 프로세스 CPU·메모리 1초 간격(실제 시계), 첫 프레임 분포를 같은 결과 스키마로. 클라우드 근사이며 S5·S8 확정은 [local](T17). T16.13 뒤 | `bench/load/socket/`, `bench/load/run_all/`, 연구 decisions·experiments | 30 연결 유지 단언, 서버 샘플 ≥ durationS(실제 시계), 결과 validateResult 통과, 결정 기록 | opus |
| T16.18 | (2026-10-06 18:00 감독 등록, PR #100 검토 #2 통과 뒤 잔여, 새 브랜치 feat/*·experiment/*) 순서: F-572 server_proc 시작 타임아웃·SIGKILL 폴백 시험(sonnet) → F-570 M11 주입 시계 전진(sonnet) → F-567 지연 기준 일치·보고서 표기(sonnet, 계약 필드 추가면 결정 기록) → F-569 0064·노트 정정(haiku) → F-571 ⑧(sonnet) → F-573 ③~⑦(sonnet)·①②(haiku) | `bench/load/socket/`, `bench/load/first_frame/`, `tools/load_report/`, 연구 decisions·experiments | F-567·F-569~F-573 각 확인 기준. SPEC 수치 변경 금지. S5·S8 확정은 [local] T17 | sonnet |

### T17 `phase1-verify` — [local]

| 하위 | 내용 | 완료 기준 |
|---|---|---|
| T17.1 | 저사양 기준 기기: S1·S3·S5·S7 | SPEC §4 B 열 |
| T17.2 | 고사양 기준 기기: S2·S3·S5·S7 | SPEC §4 B 열 |
| T17.3 | 실데이터 구간: S6·S9 | SPEC §4 B 열 |
| T17.4 | 동시 30명 실측: S8 | SPEC §4 B 열 |
| T17.5 | 감독 직접 재현 | 감독 기록에 재현 결과 |
