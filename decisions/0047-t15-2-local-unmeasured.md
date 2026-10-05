# 0047 T15.2 드레이프 정합 판정 전: 배제 못 한 이동량을 재지 않은 local 블록은 미측정으로 센다

- 상태: 제안
- 날짜: 2026-10-05
- 결정한 사람: 작업자(제안)
- 관련: TASKS T15.2(드레이프 정합 판정, 선행 조건), FEEDBACK F-393 ①②, F-391 ④, F-397 ②④, F-390 ⑥, F-359; 결정 0044 의 'T15.1 결정: F-391 ④ 호출부 t === null 은 도달 불가' 절과 'T15.R3 결정' 절; 제품 server/terrain/drape/index.mjs unexcludedSummary, server/terrain/drape/drape_unmeasured_summary.test.mjs·drape_unmeasured_link.test.mjs·drape_unmeasured.test.mjs, contracts/controlview/index.mjs isDrapeAligned

## 맥락

드레이프 정렬 측정(measureDrapeAlignment)에서 local 블록이 되는 경로는 넷이다.

1. 첫 settle: 예측 ±1 px 최소가 자기 최소보다 뚜렷이 나쁨 → `markLocal`.
2. 재적합 이상치의 짝 검정 분기, t > DRAPE_PAIRED_K → `markLocal` 뒤 걷기 값(unexcludedPx)을 대입.
3. 같은 분기의 t === null → unexcludedPx 에 NaN 대입(`unexcludedOrNaN`). 0044 T15.1 결정대로 공개 입력으로는 도달하지 않는다.
4. 재적합 이상치의 `out !== false`(예측 ±0.5 px 최소가 뚜렷이 나쁨 = true, 예측 위치 표본이 minN 미만이라 못 잼 = null) → `markLocal`.

배제 못 한 이동량(자기 최소에서 예측 반대쪽으로 걷기)을 실제로 재는 것은 2 뿐이다. 1·4 는 unexcludedPx 를 대입하지 않아 undefined 다. F-393 ① 이 지적한 이전 집계(`Number.isNaN(undefined)` 거짓, `undefined > 0` 거짓)는 undefined 를 미측정으로도 상한으로도 세지 않았다. 0044 T15.1 결정으로 3 이 도달 불가가 되자, 측정된 타일의 unmeasuredLocalBlocks 는 구조상 늘 0 이 되었다. 그러면 계약 isDrapeAligned 의 `unmeasuredLocalBlocks === 0` 조건이 이름이 가리키는 블록(예측 근처를 못 재 local 이 된 `out === null` 블록 등)을 하나도 막지 못한다.

T15.2 정합 판정은 isDrapeAligned 를 그대로 쓴다. 그래서 이 수의 뜻을 T15.2 구현 전에 별도 결정으로 고정한다. 같은 내용은 0044 T15.R3 절에 제안으로 먼저 적혔고 제품 코드에도 반영되어 있다(이 회차 작업 트리 확인). 이 파일은 그 결정을 T15.2 선행 조건으로 따로 세우고, 이번 회차에 다시 잰 값과 T15.1 '도달 불가' 결정과의 연결을 함께 적는다. 0044 는 이 회차에 고치지 않는다. 0044 T15.R3 절을 `대체됨(→ 0047)` 으로 표기할지는 0044 담당자가 정한다.

## 선택지

| 선택지 | 장점 | 단점 | 근거(측정·출처) |
|---|---|---|---|
| (a) unexcludedSummary 가 local 인데 unexcludedPx 가 0 이상의 수가 아닌 블록(undefined·null·문자열·NaN·음수)을 unmeasuredLocalBlocks 로 세고 상한에는 넣지 않는다 | 이동량 상한을 모르는 블록이 정합 통과로 세지지 않는다(모르면 통과가 아니다). 경로와 무관하게 수 하나로 드러난다. 계약 조건 `unmeasuredLocalBlocks === 0` 이 실제로 무언가를 막는다 | 경로 1·4 의 local 이 있는 측정 타일은 보고 이동량이 허용 안이어도 isDrapeAligned 가 거짓이다(보수 실패) | 아래 근거: 공개 입력 사례 4개, 변이 8 실패 |
| (b) 경로 1·4 의 local 은 '이동량을 쟀다' 고 보고 주석·결정으로 밝힌다(동작 그대로) | 출력이 바뀌지 않는다 | 두 경로 모두 자기 최소(ownFine)만 보고하고 예측 반대쪽 걷기를 하지 않는다. 저대비 블록의 자기 최소는 실제 1.5 px 에서 0.78~1.0 px 로 0 쪽에 치우칠 수 있어(F-359 검토 #4) '쟀다' 는 근거가 없다. `out === null` 은 예측 근처를 아예 못 잰 블록이다. 계약 조건이 측정 타일에서 늘 참으로 남는다 | 코드 읽기(index.mjs markLocal·unexcludedPx), F-359 |
| (c) 경로 1·4 에도 걷기를 해 unexcludedPx 를 채운다 | 이동량 상한이 생긴다 | maxMisalignPx 가 바뀌는 동작 변경이다. `out === null` 블록은 예측 위치를 못 재 걷기 방향의 기준부터 불안정하다. F-385 ⑨(양방향 걷기)·0044 T15.1 의 안 3(search 시작 비용)과 얽혀 있다 | 0044 T15.R 결정(F-385 ⑨ 미룸), 0044 T15.1 안 3 |

## 결정

(a)를 고른다. local 블록의 unexcludedPx 가 0 이상의 수가 아니면(undefined 포함) unmeasuredLocalBlocks 로 세고 unexcludedMaxPx 상한에는 넣지 않는다. 따라서 `unexcludedSummary([{local:true}])` 는 `{ unexcludedMaxPx: 0, unmeasuredLocalBlocks: 1 }` 이다.

## 근거

이번 회차 측정. 제품 feat/t15-2 작업 트리, Node 기본 시험 실행기.

- 직접 호출: `unexcludedSummary([{local:true}])` → `{"unexcludedMaxPx":0,"unmeasuredLocalBlocks":1}`.
- 변이 확인(수정 전 상태 재현): 작업 트리 index.mjs 의 판정 한 줄을 이전 형태 `if (Number.isNaN(b.unexcludedPx)) unmeasuredLocalBlocks++;` 로 잠시 되돌려 돌리고 원본으로 복원했다(복원 뒤 `git diff` 변화 없음).
  - 되돌린 상태에서는 `unexcludedSummary([{local:true}])` → unmeasuredLocalBlocks 0.
  - drape_unmeasured_summary·drape_unmeasured_link·drape_unmeasured 세 파일 18개 중 8개가 실패했다.
    - drape_unmeasured_summary 의 7개: 집계 `{local:true}`, 집계 null·문자열, 집계 음수(F-397 ②), 공개 API `out === null` 축척 1.16·1.2, 공개 API 첫 settle 3 px, 공개 API F-397 ④.
    - drape_unmeasured 의 첫 집계 시험 1개(기대값 3).
  - 복원 뒤에는 18/18 통과했다.
- 공개 입력에서 경로 1 이 내는 값. 시험 사례와 같은 무늬 영상(8 m 바둑판 + 사인 + 해시, 잡음 0)의 타일 (0,0) 밉 0 에서 블록 (64,32) 를 x 로 정수 s px 옮겼다. 열은 maxMisalignPx / localMaxPx / unexcludedMaxPx / unmeasuredLocalBlocks / local 블록 수다.
  - s = 0 → 0 / 0 / 0 / 0 / 0.
  - s = 1 → 1 / 1 / 0 / 1 / 1.
  - s = 2 → 2 / 2 / 0 / 1 / 1.
  - s = 3 → 3 / 3 / 0 / 1 / 1.

  s = 1 은 maxMisalignPx 가 허용 1 px 이하인데 unmeasuredLocalBlocks 1 이라 isDrapeAligned 가 거짓이다. 이 결정 때문에만 판정이 바뀌는 사례로, drape_unmeasured_summary.test.mjs 의 F-397 ④ 시험이 지킨다.
- 공개 입력에서 경로 4(`out === null`)가 나는 사례도 있다. 영상 서쪽 끝 = 타일 서쪽 끝, x 축척 1.16·1.2, 밉 2 타일의 제자리 블록 (0,12) 에서 unmeasuredLocalBlocks 1, unexcludedMaxPx 0 이다(drape_unmeasured_summary.test.mjs).
- 전체 drape 시험: `node --test server/terrain/drape/*.test.mjs` 를 돌렸다(8파일 — 지시서의 7파일에 F-393 ① 회차에 추가된 drape_unmeasured_summary 를 더한 수). 결과는 tests 86, pass 81, fail 0, todo 5, 약 233 s 다.
- 기존 시험 전제 갱신: 이 결정으로 깨지는 기존 시험은 drape_unmeasured.test.mjs 의 첫 집계 시험 하나다. 그 시험은 `{ local: true }` 를 세지 않는다는 옛 뜻을 고정해 기대값이 2 였고, 새 뜻에서는 3 이다. 기대값을 3 으로 고쳤다(0044 T15.R3 회차에 처리됨, 이번 회차 변경 없음). 이 갱신은 기준을 낮춘 것이 아니라 더 엄격하게 한 것이다. 같은 입력에서 미측정으로 세는 블록이 하나 늘었다. 다른 drape 시험(이동 0 음성: drape_noise 거짓 local 0, drape.test.mjs ±20 잡음 타일 local 0)은 local 블록이 없음을 단언하고 통과한다. 그래서 그 입력들에서는 이 결정으로 판정이 바뀌지 않는다.

## 대가

- T15.2 정합 판정이 더 엄격해진다. 이전에는 측정 타일의 unmeasuredLocalBlocks 가 구조상 늘 0 이라 `unmeasuredLocalBlocks === 0` 조건이 아무것도 막지 않았다. 이제는 측정 타일에서도 0 이상의 값이 나온다. 경로 1·4 의 local 블록이 하나라도 있으면 그 수만큼 올라가고, isDrapeAligned 는 maxMisalignPx 와 무관하게 거짓이다. 그런 블록의 대부분은 실제 국소 어긋남이다(시험 사례 2~4 px). 이런 블록은 maxMisalignPx 로도 이미 실패한다. 그러나 보고 이동량 1 px 이하인 local(위 s = 1)은 이 결정 때문에만 실패한다. 실제 영상에서 그런 타일이 얼마나 나오는지는 재지 않았다.
- unmeasuredLocalBlocks 의 뜻이 넓어진다. 이전 뜻은 '예측 위치를 못 잰 짝 검정 local' 이고, 새 뜻은 '배제 못 한 이동량을 재지 않은 local' 이다. 계약 isDrapeAligned JSDoc(contracts/controlview/index.mjs:45-46)이 이 수를 올리는 경로를 명시한다. 그 경로는 첫 안착 local 과 잔차 재적합 local(out !== false)이고, 호출부 t === null 은 도달하지 않는다. 이번 회차에 다시 읽어 결정과 맞음을 확인했고 고치지 않았다.
- 경로 1·4 블록에 대해서는 이동량 상한을 내지 않는다. 그 블록이 실제로 1 px 안에 있어도 정합 증거가 되지 못한다. 선택지 (c)를 하기 전까지 그렇다.
- 호출부 t === null 대입(감독 변이 U1)은 여전히 시험으로 지켜지지 않는다. 0044 T15.1 결정대로 공개 출력이 같은 동등 변이이기 때문이다.

## 0044 T15.1 '도달 불가' 결정과의 연결

- 0044 T15.1 결정은 호출부 t === null 이 공개 입력으로 도달하지 않는다고 보았다. search 의 시작 비용이 Infinity 라 settle 이 null 을 내고, 블록은 경로 4 로 간다. 그 결정 자체는 맞다. 다만 결과적으로 F-390 ⑥ 이 만든 '모르면 NaN 으로 세라' 규칙이 출력에 한 번도 나타나지 않게 되었다. 예측 위치를 못 잰 블록은 실제로는 경로 4 로 빠져 undefined 가 되었고, 집계는 이를 세지 않았기 때문이다. 이것이 F-393 ② 가 지적한 T15.1 절의 '대가 누락' 이다.
- 이 결정 (a)로 그 대가가 해소된다. t === null 이 도달하지 않아도, 같은 상황(예측 위치를 못 잰 블록)이 경로 4 의 undefined 로 들어와 unmeasuredLocalBlocks 로 세진다. 도달 불가 결정과 이 결정을 함께 두면 '예측 위치를 못 잰 local 은 통과가 아니다' 가 공개 출력에서 성립한다(위 축척 1.16·1.2 사례).
- 0044 T15.1 절의 세 안(1 분기 함수 분리, 2 pairedT 주입, 3 search 시작 비용 수정) 선택은 이 결정에 달려 있었다(F-393 ② 감독 판단: ① 을 정한 뒤 고른다). (a)가 서면 안 1·2 가 지키려던 'NaN → 미측정' 은 경로 4 를 통해 공개 API 시험으로 이미 지켜진다. 그래서 1·2 의 이득은 더 작아진다. 안 3 은 경로 4 의 블록을 짝 검정 분기로 옮길 수 있다. 그때 호출부 t === null 이 도달 가능해지고 이 결정의 수치도 바뀔 수 있으므로, 아래 다시 볼 조건에 넣는다.
- 0044 의 F-390 ⑥ 다시 볼 조건(0044 :178)은 T15.R3 에서 이미 갱신되었다. 이전 조건은 '실제 입력에서 unmeasuredLocalBlocks > 0 관측 시' 였다. 이 결정 뒤에는 합성 입력에서도 > 0 이 나오므로 그 조건은 더 이상 쓸 수 없다.

## 다시 볼 조건

- T15.2 에서 경로 1·4 에도 걷기를 넣을 때(선택지 (c)). 또는 F-385 ⑨ 양방향 걷기나 search 시작 비용 수정(0044 T15.1 안 3)으로 local 경로가 바뀌어 호출부 t === null 이 도달 가능해질 때. 그때 공개 API 사례와 U1 변이를 다시 잰다.
- 실영상(T14L)에서 '보고 이동량 1 px 이하 local 로만 isDrapeAligned 가 거짓' 인 타일 비율을 잴 수 있을 때. 보수 실패가 과하면 (c)를 앞당긴다.
- T15.2 정합 판정이 unmeasuredLocalBlocks 를 쓰는 방식(현재 `=== 0`)을 바꿀 때, 또는 pairedT 의 null 조건이나 minN 을 바꿀 때.
