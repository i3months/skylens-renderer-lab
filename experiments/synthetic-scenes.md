# 실험 노트: T05 synthetic-scenes

## 가설
알려진 카메라·점·정답을 가진 결정적 합성 장면 8종과 고정 시점 8곳이 있으면 이후 T06~T12 의 화질·성능·LOD 시험을 정답 대비로 할 수 있다. 같은 시드는 같은 바이트를 낸다.

## 방법
- 계약(제품 `contracts/scenes/index.mjs`): 시드 PRNG(mulberry32), 27 B/56 B 레코드 포장(`packRecords`), 바이트 해시(`resultHash`), 결과 검사(`assertSceneResult`). 장면은 항상 27 B 로 만들고 56 B 는 `point27ToGauss56`(f_dc=(rgb/255−0.5)/C0, 불투명도 0.9, σ 0.05 m, 단위 사원수)로 옮긴다(결정 0012).
- 고정 시점 8곳: `fixtures/viewpoints/synthetic.json`(ENU m, GL 규약, flat_boxes 용). 실자산용 `viewpoints.json` 은 그대로 둔다.
- 하위 작업 13개 병렬(sonnet 8·haiku 3·opus 1, 합계에 계약 작업자 직접 1). 승격 없음.

## 결과(통합 후 `npm test` 직접 실행)
| 장면/도구 | 완료 기준 | 결과 |
|---|---|---|
| flat_boxes | 같은 시드 해시 동일, 12동 겹침 0, 법선 1±1e-6, 8시점 모두 상자가 시야에 ≥100점 | 통과 |
| terrain | y 가 해석 높이와 1e-4 m, 법선 각도 오차 ≤1e-3 rad, 경사 ≤15° | 통과 |
| holes | 빈자리 안 점 0(전수), holeFraction 해석값과 1e-12 | 통과 |
| levels | 구간당 수준별 점 수 [1/8,1/4,1/2,1]·count 엄격 증가, 낮은 수준 ⊂ 높은 수준 | 통과 |
| large | 250만 점 정확, 생성 시간 기록(1차 통합 시점 106 ms, 반려 수정 후 format 1 165 ms — 같은 코드 재측정이 아니라 측정 시점·부하 차이, 현재 값은 아래 F-088 줄의 165 ms) | 통과 |
| depth_noise | 거리 5구간 σ 비 1±0.10(실측 0.994~1.015) | 통과 |
| buildings | 1000동 겹침 0(499500쌍 전수) | 통과 |
| dem | 높이 왕복 ≤0.1 m(실제 ≤ 100/65535/2 m) | 통과 |
| paths | 프레임 수·간격 1e-9, 속도·각속도 상한 | 통과 |
| scene_preview | 8시점 PNG, 해석 픽셀 ±1 px | 통과 |

전체 `npm test`: 반려 수정 전(R1 이전) 730건 중 717 통과·0 실패·13 건너뜀, 반려 수정 후(현재) 788건 중 776 통과·0 실패·12 건너뜀. 바뀐 테스트(ply·ply_read·ply_stream·geo 서버·클라이언트) 20회 반복 실패 0.

## renderer_basis 에서 벗어난 점
- depth_noise: 지시의 f 기본 1280 px 대신 renderer_basis §1-2 의 960×540 K(fx 754.32)를 기본으로 썼다(문서와 일치가 조건). 출력은 씬 ENU 규약이고 OpenCV→씬 변환은 truth.frame 에 있다.
- GPS↔ENU 극 앵커: 결정 0018.

## 한계·남은 문제
- 합성 장면은 정답이 해석적이어서 실제 복원 잡음·무늬 분포와 다르다(실자산 대조는 T01L).
- 장면의 점은 28 bit 부동소수 반올림 영향을 받으므로 해시는 같은 Node 메이저에서만 비교한다.

## 피드백 처리(T05.F)
- F-079: 극 앵커 e=0·위도 ±90 붙임·경도 −180→180(결정 0018). 변형 8종 fail 확인, 극 앵커 ±90 × lon {−180,−10,10,180} 왕복 오류 0, gps.lat=±90 무작위 앵커 10만 회 실패 0, 범위 안 1만 점 geo.ts 대비 0 m.
- F-080: countCopies 가 TypedArray·ArrayBuffer slice, Buffer.copyBytesFrom, new Uint8Array(view)도 센다. 호출 뒤 GC 제거, 27 B·56 B 시험 분리와 `out >= cols` 하한(측정 27 B +67.5 MB, 56 B +140 MB = 열 배열 크기). parsePlyHeader·ply_stream·readPly 복사 변형 11종 모두 fail.
- F-081 ①②③④⑤⑥: 문구·README(한·영)·`element vertex 0x10`/`1e3` → header 오류·클라이언트 점 수 10002. ⑦ 은 PR #13 본문 오타라 기록만.
- 서브에이전트가 연구 저장소 FEEDBACK 을 다른 브랜치에서 읽어 절을 못 찾은 일이 있었다(F1·F2·F3). 다음부터 지시문에 main 체크아웃 경로를 준다.


## 반려 1회차 수정(PR #14, F-082~F-088)
- 서브에이전트 10개(opus 1·sonnet 7·haiku 2), 승격 없음. 계약 헬퍼 `checkCount`·`normalizeSeed`·`checkFormat` 을 먼저 커밋(09a83ab). 통합 후 `npm test` 788 중 통과 776·실패 0·건너뜀 12(large 250만 점 시험은 이제 기본 실행). 바뀐 테스트 10회 반복 실패 0.
- F-082: 미리보기가 ref_images `cameraExtrinsics` 로 기저를 잡는다(오른손계). 픽셀은 floor. eye(0,0,10)·64×48 에서 (3,0,0) → u=47(해석 47.44), top_down (30,0,0) → u 755.8±1, 8시점 1323개 격자점이 ref_images `projectCamera` 와 1 px 이내. u 부호·round 변형 fail.
- F-083: 56 B 오프셋별 시험, positions 일치, fdc 역변환, scales=ln 0.05. 위치 0·opacity↔fdc 교체·scales log 빠짐 변형 fail. 장면별 format 2 시험 추가.
- F-084: terrain·levels 법선을 시험 안 유한차분으로 검증. 이 과정에서 levels `normalAt` 의 hz 항 오류(각도 오차 0.16 rad)를 찾아 고침. 법선 부호 반전·kx↔kz 변형 fail.
- F-085: large 250만 점 시험 기본 실행. 격자 간격이 점 수에 안 맞아 +x 띠가 비던 것을 층화 격자로 고침. flat_boxes·holes·PNG(CRC·IDAT)·드론 이동·계약 검사 시험 보강. depth_noise ① 변형(`d < best.d` → `>`)은 기본 평면 5장이 겹치지 않아 잔차 시험에서는 생존하나, 겹치는 평면 2장 보조 시험이 잡는다.
- F-086: 7개 장면 count·seed·format, 경로, 미리보기, ply 속성 이름(`Object.hasOwn`) 입력 검증. dem 기본 시드가 0→1 로 바뀌었다. levels 는 count≥8(levels=4) 요구로 count 0 을 거부한다.
- F-087: depth_noise 기본 기선 b=8.26 m(renderer_basis 표 1위 이웃), σ=1 px 시차(부화소 아님) 가정을 주석·truth 에 기록.
- F-088: levels step 매핑·count 하한, 법선 단위 검사, 경로 pitch ±30° 클램프(Catmull-Rom 오버슈트 최대 36.6° 제거), measure.mjs 피크 RSS(format 1: 117 MB·165 ms, format 2: 223 MB·277 ms, Node v22.22.0), README T05 절 한·영, 결정 0018 수치 정정, enuToGps 상한 4×2πR 초과 거부(GeoError range), 여러 바퀴 감싸기 시험, 복사 측정 할당량 단언.
- 이탈: `point27ToGauss56` 이 positions 버퍼를 입력과 공유한다(복사 제거, 장면은 만든 뒤 고치지 않음, 호출자는 복사해서 넘긴다).
