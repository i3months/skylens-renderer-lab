# 0058 T15.10e 지형 높이만 전송 형식(H32)을 계약으로 올린다

- 상태: 제안
- 날짜: 2026-10-06
- 결정한 사람: 작업자(제안)
- 관련: TASKS T15.10e, FEEDBACK F-458, 결정 0056(제안 (1)·예산 해석), 0057(S 규칙), experiments/t15-10e.md, 제품 contracts/tower_assets/terrain_h32.mjs·server/terrain/height_format/·client/tower/terrain/decode.mjs·bench/tower/h32_initial.mjs·client/tower/terrain/ssim_h32.test.mjs

## 맥락
메시 형식(f32 xyz + u32 인덱스)에서 noiseBig 초기 지형이 LOD3 38,158,848 B 로 지형 몫 10,780,163 B(0056, 감독 승인 해석)와 초기 합계 15,000,000 B 를 넘는다. 클라이언트 createTerrainLayer.accept 는 이미 TerrainTile{cells, heights} 를 받아 격자에서 메시를 만들므로 xy·인덱스 전송은 필요 없다. 0056 제안 (1) 을 구현한다. SSIM 0.95·15 MB 는 낮추지 않는다.

## 선택지
| 안 | 장점 | 단점 |
|---|---|---|
| 메시 형식 유지 | 변경 없음 | noiseBig 초기 지형 몫의 3.5 배(미충족) |
| H32 비양자화(f32) | 무손실, 단순 | 4,330,496 B(+프레임 머리 9,728 B) |
| **H32 + LOD1~3 선택적 양자화(전역 격자 step 0.03 m, u16)**(채택) | 2,169,344 B(몫의 20 %), LOD0 은 f32 로 계약 상한 0 m 유지 | 양자화 오차 step/2 = 0.025 m 가 LOD 상한에 더해짐, 범위 > 3276.75 m 타일은 f32 폴백 |

## 결정
머리 16 B(+양자화 8 B) + f32/u16 본문 형식(계약 terrain_h32.mjs). LOD0 은 늘 f32, LOD1~3 은 기본 양자화(step 0.05 m, base = 타일 최솟값), 범위 초과 타일은 f32. 양자화 격자는 전역이다(F-492): 머리에 i32 kbase = floor(min/step), q = round(h/step) − kbase, 복원 fround((kbase+q)·step) — 같은 높이는 어느 타일에서든 같은 비트라 같은 LOD 이웃 공유 가장자리가 비트 동일(base = 타일 최솟값 방식은 smoothDem 36/36 이음매에 최대 0.0488 m 틈, 감독 재현). 범위 초과 폴백 타일(LOD1~3)의 f32 도 같은 격자로 반올림한다. 형식 버전 2. step 은 0.03 m(F-493: 0.05 는 hill 시드 23 에서 0.9486 미달). 양자화 타일의 오차 상한은 terrainLodMaxErrorM + step/2 = +0.015 m(f32 반올림 제외). 서버 encodeTerrainTileH32, 클라이언트 decodeTerrainTileH32.

## 근거
- 크기 [cloud 합성]: noiseBig LOD3 256 타일 f32 payload 4,330,496 B, 양자화 2,169,344 B(폴백 0), 조각 프레임 머리 38 B/타일 포함 wire 4,340,224·2,179,072 B. 지형 몫 여유 6,439,939·8,601,091 B, 초기 합계 8,560,061·6,398,909 B ≤ 15,000,000 B(bench/tower/h32_initial.mjs, 서버 인코더 길이와 불일치 0).
- SSIM [cloud CPU 소프트웨어 렌더, 108 장면 × LOD1~3 × 8시점, ssim_h32_sweep.mjs, 장면은 측정 전에 고정: hill 시드 1..40 × 잡음 {0, 0.015}, noiseBig 0..7, lowNoise 1..8, lowNoise012 1..12]: step 0.05 최소 0.9482(lowNoise012 시드 12 LOD2)·hill 시드 23 0.9486 미달, 0.04 최소 0.9496 미달, **0.03 최소 0.9543**, 0.025 0.9554, 0.02 0.9567, 0.0125 0.9587. 하락은 step 에 단조롭지 않다. 0.03 채택(모든 장면 ≥ 0.95 인 최대 step). 여유 0.0043 로 얇다. 여유가 step 이 아니라 LOD 솎기에서 오므로(lowNoise012 는 양자화 없이도 최소 0.9647) 여유 0.01 이 필요하면 0057 의 1 m 셀 규칙을 다시 봐야 한다. hill 시드 41..50 은 재지 않았다.
- step 0.05 m 는 작업자가 정한 값이며 SPEC 수치가 아니다. 0.9555 는 여유가 약 0.006 으로 얇다.

- renderer_basis 와의 관계: renderer_basis §7-4 점 형식과 §3-7 Δd 는 지형 전송 형식을 정하지 않는다. step 은 SSIM 측정으로 정한다.

## 대가
- 양자화 LOD1~3 의 SSIM 여유가 얇다(0.9543, 여유 0.0043). step 을 키우면 실패한다. 바이트는 step 과 무관(u16)이라 step 0.03 은 크기 변화 없음(noiseBig LOD3 양자화 2,169,344 B).
- 0.5 m 셀 실제 DEM 이면 f32 상한이 지형 몫을 넘는다는 0056 계산은 그대로(미측정). 양자화는 들어간다는 계산값(미측정).
- 건물·드레이프 바이트는 bench/tower_assets 의 박힌 값(3,157,410·1,062,400)을 썼다(이번에 다시 재지 않음). LEVEL_ARRIVED 프레임은 몫 정의 밖.
- 서버 ws 조각 프레임에 H32 를 실어 보내는 연결(조립)은 이 작업 범위 밖이다: 인코더·디코더·측정까지.

## 다시 볼 조건
실제 DEM(T14L [local])의 셀 크기·거칠기를 보고 몫 초과 시. SSIM 여유가 0.95 에 닿는 장면이 나오면 step 을 줄인다.
