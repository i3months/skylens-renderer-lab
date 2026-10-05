# F-386·F-388 처리 기록 (T14.R11)

실행: 2026-10-05. 제품 작업 트리 /home/user/wt/s1 (브랜치 feat/t14-r11--1, 기준 0f672c7, 커밋 e2dcfe7). drape index.mjs 는 0f672c7 과 같다.
측정 원자료 요약은 같은 디렉터리 `f359_measure_output.md`.

## 결론

- 주석(index.mjs:752-755)의 입력은 고정 시드로 찾았다. 노트(t14-r10.md:9)·0044:133 의 'farOwn 적용 뒤 35 → 27/540' 은 **재현된다**.
  - 원본: 27/540 (g/e 별 1·6·20). `--no-farown`(farOwn=false 사본): 35/540 (1·6·28). R10 노트의 '고치기 전 35(1·6·28)' 와 조합별로 같다.
  - 귀무 360회: 둘 다 measured 360·unmeasurable 0, 거짓 local 0, 거짓 불확정 17/360(4.7 %) — farOwn 은 귀무를 바꾸지 않는다.
    (R10 노트의 19/360 은 귀무 시드가 달랐던 것으로 보임 — R11 노트에 이미 '원 시드 못 찾음' 으로 적혀 있다.)
- 감독 계측(시험 입력에서 바뀐 결정 0)과 어긋나지 않는다: farOwn 이 바꾸는 8건은 모두 g −0.375 의 사인 1.5·2.5 DN 인데,
  drape_noise.test.mjs `POS_CASES` 의 g −0.375 는 사인 2 DN 뿐이라 시험 입력(240회)에 들어 있지 않았다.
  같은 이유로 노트의 27/540(540경우 집합)과 시험 알려진 실패 목록 21건(`POS_KNOWN_FAIL`, POS_CASES 집합)은 서로 다른 입력 집합의 수다.
- 따라서 (A) 효과 주장은 고칠 필요가 없고, '못 찾으면' 가지(±3 DN 입력 시험)는 쓰지 않았다. 다만 노트·0044 에는 '540경우 집합 기준이며
  시험 목록(21건, POS_CASES)과 집합이 다르다' 는 표기가 필요하다(문서는 이 작업 소유가 아니라 고치지 않음).

## farOwn 만으로 짝 검정 경로에 드는 입력 (farown_scan.mjs, 1350회)

| 집합 | 회 | farOwn 만으로 경로 | 그중 결과가 바뀐 수 |
|---|---|---|---|
| 양성 ±1 DN | 270 | 1 | 1 |
| 양성 ±2 DN | 270 | 7 | 7 |
| 양성 ±3 DN | 270 | 14 | 14 |
| 귀무 ±1·±2·±3 DN | 540 | 0 | 0 |

- 22건 모두 블록 (64,32)(실제 이동 1.5 px 블록). 원본에서는 모두 불확정(보고 1.53~2.84 px), farOwn=false 에서는 정합 블록으로 남아
  maxMisalignPx 0.25~0.375 px(정합 통과).
- 양성 ±1·±2 DN 의 8건이 곧 35 − 27 이다. 창 안 잔차 0.375~0.494, 자기 최소 x −1.22~−1.59 px, 창 최소 x −0.75~−0.84 px
  — 주석의 범위와 맞는다(주석의 '잔차 0.44~0.47' 은 이 중 일부 범위).
- ±3 DN 에서는 자기 최소가 예측 반대쪽(+0.53·+0.91 px)인 경우도 farOwn 으로 불확정이 된다(seed 2007922·2142545, 사인 2 DN).

## 새 시험 (제품 server/terrain/drape/drape_farown.test.mjs)

- 입력: 사인 2.5 DN, g −0.375 / e −1.125(블록 실제 1.5 px), 타일 잡음 ±2 DN, 시드 **2142545**·**2150464**
  (생성식 2000003 + k·7919 의 k = 18·19). 블록 (64,32): 창 안 잔차 0.447·0.470, 자기 최소 (−1.281, −0.094)·(−1.375, 0.031),
  창 최소 (−0.8125, −0.094)·(−0.84375, 0.031), 예측 (−0.375, 0) — 주석의 세 범위에 모두 드는 두 시드를 골랐다.
- 단언: status measured, 블록 (64,32) 가 local 이거나 불확정, maxMisalignPx > ALIGN_TOLERANCE_PX(1 px). 기준은 측정 전에 과제에서 정한
  그대로이며 측정값에 맞춰 바꾸지 않았다.
- 도우미(makeImage·boxMean·warpedTile·HASH·TEX_A·LOW·lowContrastImage)는 drape_noise.test.mjs 에서 복사(시험 파일끼리 import 없음).

## 변이 실험

작업 트리를 임시 디렉터리로 복사해 index.mjs 의 `const farOwn = Math.hypot(...) >= OUTLIER_PX - 1e-9;` 를 `const farOwn = false;` 로
바꾼 사본(커밋하지 않음)에서 `node --test 'server/terrain/drape/*.test.mjs'`:

| | tests | pass | fail | todo |
|---|---|---|---|---|
| 원본(작업 트리) | 52 | 47 | 0 | 5 |
| farOwn=false 사본 | 52 | 45 | **2** | 5 |

실패 2건은 새 시험 두 개뿐이다(블록 (64,32) local false·undecided false, dx −0.8125·−0.84375). 이전(감독 재현)에는 같은 변이에서 fail 0 이었다.

참고: 과제의 `node --test server/terrain/drape/` 는 이 환경 Node v22.22.0 에서 디렉터리 인자를 모듈로 읽어 MODULE_NOT_FOUND 로 실패한다.
같은 파일 집합을 `node --test 'server/terrain/drape/*.test.mjs'` 로 돌렸다(package.json 의 test 도 glob 방식).

## F-388: 측정 스크립트 이전

- 제품 server/terrain/drape/f359_measure.mjs 는 `git rm`(커밋 e2dcfe7). 제품에서 이 파일을 가리키던 다른 경로는 없었다.
- 연구 `experiments/t14-r11/f359_measure.mjs`: `--repo`(또는 SKYLENS_RENDERER_DIR) 로 제품 drape import, `--no-farown`, `--seeds N`(시험 실행용),
  `--list`. 귀무는 measured·unmeasurable 수를 따로 내고 거짓 local·불확정 비율 분모를 measured 로 한다(F-389 ⑧). 머리 주석에 소요
  시간(한 코어 약 7~8분 추정)과 도우미 복사 원본 명시. 이번 실행은 두 변형을 동시에 돌려 각 338초(CPU 공유).
- `experiments/t14-r11/helpers.mjs`: 도우미 사본(원본 제품 drape_noise.test.mjs, 0f672c7)과 `loadDrape` — `--no-farown`·계측은 제품 drape
  디렉터리를 임시 디렉터리로 복사해 `const farOwn = ...;` 한 줄만 바꾸고(정확히 한 번 일치하지 않으면 중단) contracts 는 제품 것을
  심볼릭 링크로 쓴다.
- `experiments/t14-r11/farown_scan.mjs`: 위 1350회 탐색(계측 사본 + farOwn=false 사본 비교). 4분할 병렬로 CPU 공유 상태에서 약 10분.
- 확인: `--seeds 1 --no-farown` 시험 실행(18·12회, 11초)으로 동작 확인 뒤 전체 실행.

## 사용한 시드

- 양성: 2000003 + k·7919, k = 0..29 (g/e 세 조합 × 사인 1.5·2·2.5 DN × ±1·±2(·±3) DN).
- 귀무: 같은 생성식 k = 0..59 (사인 1.5·2·2.5 DN × ±2·±3(·±1) DN, 이동 0).
- 시험: 2142545, 2150464 (사인 2.5 DN, g −0.375, ±2 DN).
