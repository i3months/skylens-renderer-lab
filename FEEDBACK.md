# 피드백 목록

감독이 매 실행마다 제품 코드를 정밀 검토해 남기는 보강 항목이다. **작업자는 새 작업보다 이 목록의 열린 항목을 먼저 처리한다.**

## 형식

```
### F-001 [열림|처리됨-검증대기|닫힘] (심각도: 치명/높음/중간/낮음) — 한 줄 요약
- 위치: 경로:줄 (브랜치/커밋)
- 문제: 무엇이 왜 틀렸는지 (수식이면 수식으로)
- 실패 상황: 구체적 입력 → 잘못된 출력/패닉/잘못 통과하는 테스트
- 고칠 것: 구체적 수정
- 확인 기준: 감독이 돌려서 닫을 수 있는 테스트·수치
- 이력: YYYY-MM-DD HH:MM 감독 등록 → … 작업자 처리(커밋) → … 감독 확인 닫음
```

- 작업자는 고친 뒤 상태를 `처리됨-검증대기` 로 바꾸고 커밋 해시를 이력에 적는다. **닫는 것은 감독만** 한다(확인 기준을 직접 돌려 통과해야 닫음).
- 감독은 같은 문제가 다시 생기면 새 번호 대신 기존 항목을 다시 연다.
- 닫힌 항목은 지우지 않는다(기록).
- 치명·높음은 감독이 직접 재현한 것만 올린다.

## 항목 → 2026-10-01 작업자 처리(제품 5a7179a): run_all 이 빌드 포함 실제 클론에서 성공 7·실패 1(tower_bytes: 녹화 없음, 사람 요청 중 — 미달 명시)

### F-001 [처리됨-검증대기] (심각도: 높음) — run_all 이 실제 skylens develop 에서 8개 중 6개 실패 (T01.10 미달)
- 위치: bench/baseline/run_all/index.mjs:79, 기본 입력 경로 asset_bytes/index.mjs:59, ws_bytes/index.mjs:68, tower_bytes/index.mjs:70, heap/index.mjs:62, bundle_status/index.mjs:67 (feat/baseline 2e69336)
- 문제: 모든 모듈의 기본 입력 경로가 skylens 에 없는 가정 경로다(`assets/seg*_L*.bin`, `fixtures/ws_recording.jsonl`, `recordings/tower.jsonl`, `index.html` file://). run_all 테스트는 가짜 모듈로만 돈다(run_all.test.mjs:104-113).
- 실패 상황: 감독 직접 실행 `node bench/baseline/run_all/cli.mjs --skylens-dir <skylens develop 59edcf9 클론> --out o --commit 59edcf9` → `성공 2, 실패 6` (bundle_status 대상 없음, asset_bytes ENOENT assets/, ws_bytes ENOENT, tower_bytes ENOENT, first_frame 30 s 타임아웃, heap url 없음).
- 고칠 것: 실제 skylens 배치에 맞춘 경로(자산 `res/static/demo/segments/seg<N>_step<5자리>.ply`), 녹화 픽스처는 이 저장소 `fixtures/` 에 두고 인자로 넘김, 빌드가 필요한 모듈은 복사본에서 빌드. 입력이 없으면 합성으로 대체하지 말고 실패.
- 확인 기준: skylens develop 클린 클론(의존성 설치·빌드 단계 포함 한 명령)에서 run_all `성공 8, 실패 0`, 종료코드 0. 못 재는 모듈은 STATUS·PR 에 미달로 명시.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려)

### F-002 [처리됨-검증대기] (심각도: 높음) — asset_bytes 가 27 B·`.bin` 을 가정해 실제 56 B/점 PLY 자산을 전혀 못 잰다
- 위치: bench/baseline/asset_bytes/index.mjs:3-6,12,14,27-31,73 (feat/baseline 2e69336)
- 문제: 실제 구간 파일은 PLY(ASCII 헤더 + float32×14 = 56 B/점, `element vertex N`)다(감독 확인: seg0_step00250.ply 헤더). 점 수를 크기에서 역산(`floor((size-header)/27)`)하므로 "27×N 과 크기 차 ≤ 헤더" 검사는 나머지 0 검사 외에는 항상 참이고, 독립된 점 수 출처가 없다. 형식이 다르면 바이트 집계까지 통째로 예외로 버린다.
- 실패 상황: 실제 자산 → `ENOENT .../assets` 또는 형식 예외, 레코드 0개. 27 의 배수 크기인 엉뚱한 파일은 통과.
- 고칠 것: 크기 집계와 형식 검사를 분리해 바이트는 항상 기록. PLY 헤더에서 N·property 목록·헤더 길이를 읽어 `size − stride×N == 헤더 길이` 검사. 실제 stride 와 `assumed_stride_matches`(27 B 기대 일치 0/1)를 지표로 남김. 56 B 이탈은 method 에 명시(T03 입력 형식은 감독·사람이 결정).
- 확인 기준: 실제 데모 16개 구간 파일에서 수준별 합계 473,744 / 1,256,960 / 14,170,732 / 26,070,736 B 재현, stride 56, matches 0. 헤더 N 과 본문 크기가 어긋난 픽스처는 거부하는 음성 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): PLY 헤더 파싱, 수준 합계 473,744/1,256,960/14,170,732/26,070,736·stride 56·matches 0 재현, 음성 테스트

### F-003 [처리됨-검증대기] (심각도: 높음) — T01.5 건물 6,191 테스트가 순환(합성 6,191동을 만들어 6,191 단언), 미달이 충족처럼 보고됨
- 위치: bench/baseline/tower_bytes/tower_bytes.test.mjs:12,19-41,45,57; 연구 experiments/baseline.md "하위별 기준" 줄 (experiment/baseline 21eac85)
- 문제: 기댓값이 입력에서 나온다. T01.5 기준은 "녹화 응답에서 6,191 ± 1% 재현"인데 실제 녹화가 없다(노트 §미달 415동). 노트 재구현 기록은 "합성 건물 정확히 6,191" 을 기준처럼 적었다.
- 실패 상황: 실제 녹화 없이 `npm test` 녹색 → T01.5 완료로 오인. 실제 run 은 ENOENT.
- 고칠 것: 합성 테스트는 N 을 6191 이 아닌 값으로 바꾸고 이름을 "중복 제거 집계"로. T01.5 판정 테스트는 실제 녹화 픽스처가 있을 때만 돌고 없으면 skip+미달 표시. 노트 문구 정정. 녹화는 사람에게 요청(STATUS 막힌 점).
- 확인 기준: 녹화 없이 `npm test` 에서 T01.5 판정 테스트가 skip 으로 보고. 테스트 코드에 6191 리터럴이 합성 입력 크기로 쓰이지 않음.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 합성 테스트 N=37 로 이름 변경, 6,191 판정은 TOWER_RECORDING 있을 때만(없으면 skip·미달)

### F-004 [처리됨-검증대기] (심각도: 높음) — ref_images 가 run_all 경로에서 원본이 아닌 합성 점군으로 기준 영상을 만든다 (T01.8 미달)
- 위치: bench/baseline/ref_images/index.mjs:178-181 (`void skylensDir`, pointsPath 없으면 syntheticPoints(1)), run_all/index.mjs:79 (feat/baseline 2e69336)
- 문제: T01.8·SPEC §4 의 기준 영상 = 원본 점군 렌더. 합성 영상이 skylens 커밋 해시를 달고 성공 레코드로 나온다. decodePoints(:109-111)는 PLY 헤더를 못 읽는다.
- 실패 상황: `run_all --skylens-dir /nonexistent` 에서도 ref_images 가 ok, 16개 레코드.
- 고칠 것: run_all/CLI 에 점군 경로 인자, 없으면 failed. PLY 헤더 파싱(56 B 스플랫이면 중심 x y z·f_dc 색 사용을 method 에 명시). 합성은 테스트 전용.
- 확인 기준: 점군 경로 없이 run_all → ref_images failed. 실제 레벨4 PLY 로 8장 생성, 비어 있지 않은 픽셀 수가 노트 표와 일치하거나 차이 설명, 재실행 sha256 동일.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): pointsPath 필수·없으면 failed, 레벨4 PLY 8장·재실행 sha256 동일

### F-005 [처리됨-검증대기] (심각도: 높음) — ws_bytes 의 "구간"이 1000 ms 시간 창이라 SPEC §4 정의(한 구간의 4수준 전체)와 다르다
- 위치: bench/baseline/ws_bytes/index.mjs:41-43,79 (feat/baseline 2e69336)
- 문제: `seg = floor(t_ms / segmentMs)` 로 시간 창 합을 `ws_bytes.segment_total` 로 낸다. 빈 창 0 이 평균에 들어간다. 녹화 형식에 구간·수준 필드가 없다. epoch ms 를 넣으면 배열이 t_ms/1000 크기로 커진다.
- 실패 상황: 한 구간 4수준이 여러 초에 걸쳐 오면 구간당 값이 실제보다 작게 나와 S6 "구간당 ≤ 3 MB" 를 거짓으로 통과. t_ms=1.7e12 → 메모리 고갈.
- 고칠 것: 녹화 줄에 segment·level 추가, 구간 ID 별 4수준 합. 시간 창 지표가 필요하면 다른 이름(`ws_bytes.window_1000ms`). 상대 시각·Map 사용.
- 확인 기준: 구간 2개×4수준이 서로 다른 시간 창에 흩어진 픽스처에서 samples 가 정확히 2개이고 각 값이 해당 구간 4프레임 합. t_ms=1.7e12 픽스처가 1 s 안에 끝남.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): segment·level 필드, 구간 ID별 4수준 합, window_1000ms 분리, 1.7e12 시각 1초 내

### F-006 [처리됨-검증대기] (심각도: 중간) — 번들 측정 source 모드가 three/build 의 변형 전부를 더하고, bundle_tower 는 대상 0개여도 0 B 를 성공으로 낸다
- 위치: bench/baseline/bundle_status/index.mjs:61-66, bundle_tower/index.mjs:38-46,51-53 (feat/baseline 2e69336)
- 문제: build/ 의 cjs·module·min·webgpu 변형을 모두 합산 → S4 "현재" 가 수 배로 부풀 수 있음. "두 번 재서 동일" 테스트는 같은 파일을 두 번 gzip 할 뿐 빌드 재현성을 보지 않는다.
- 실패 상황: 모의 트리에 three.module.js 하나만 있어 드러나지 않음. `/nonexistent` 에서 bundle_tower.gzip_bytes = 0 이 ok.
- 고칠 것: 복사본에서 vite 프로덕션 빌드 후 3D 청크만, 또는 패키지 진입점 하나만. 대상 0개면 throw.
- 확인 기준: 모의 트리에 cjs·min·webgpu 변형을 추가해도 값 불변인 테스트, 대상 0개 → reject 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 진입 HTML 폐포 방식, 대상 0개 reject, 변형 불변 테스트

### F-007 [처리됨-검증대기] (심각도: 중간, 미확인) — first_frame 픽셀 판정이 그리지 않은 alpha:false WebGL 캔버스를 첫 프레임으로 잡는다
- 위치: bench/baseline/first_frame/index.mjs:30-38,42; 테스트 first_frame.test.mjs:30 (`__firstFrame` 직접 세움) (feat/baseline 2e69336)
- 문제: alpha≠0 픽셀이 있으면 첫 프레임. 불투명 clear 만으로 참. 캔버스 감지 경로는 테스트되지 않음. dump-dom 대체 경로(:112-119)는 테스트 페이지가 쓰는 data-ff-ms 에만 의존.
- 실패 상황(서브에이전트 재현, 감독 미확인): 그리지 않는 alpha:false 페이지에서 23~78 ms 에 감지.
- 고칠 것: 도착한 자산이 처음 그려진 신호(첫 draw 호출 훅 또는 배경색과 다른 픽셀 비율)로 판정. 음성 테스트 추가.
- 확인 기준: 빈 alpha:false 캔버스 → 타임아웃/미감지, 500 ms 뒤 그리는 페이지 → ≥ 500 ms.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 배경색과 다른 픽셀 비율 판정, 빈 alpha:false 캔버스 미감지·500 ms 뒤 그림 ≥500 ms 테스트

### F-008 [처리됨-검증대기] (심각도: 중간) — heap 이 소스 index.html 을 file:// 로 열고 JSHeapUsedSize 만 재 S3(탭 전체 메모리) 기준으로 쓸 수 없다
- 위치: bench/baseline/heap/index.mjs:50-51,62-63,65-68,77 (feat/baseline 2e69336)
- 문제: vite 소스 index.html 은 file:// 에서 모듈 로드 실패 → 빈 페이지 힙. first_frame 은 dist 를 http 로 서빙해 대상이 다름. TypedArray·WebGL 버퍼는 JS 힙 밖. 실행 인자에 swiftshader 지정이 없어 device 라벨로 소프트웨어/GPU 구분 불가.
- 실패 상황: run_all 에서 "측정할 url 이 없음"(감독 직접 실행 확인).
- 고칠 것: first_frame 의 dist http 서빙 재사용, 첫 프레임 뒤 측정, 지표명을 `heap.js_used` 로 한정하고 S3 와 매핑하지 않음(가능하면 프로세스 메모리 함께 기록), 인자·device 를 first_frame 과 맞춤.
- 확인 기준: 100 MB Float32Array 를 잡는 픽스처에서 프로세스 메모리 지표 ≥ 100 MB, run_all 에서 heap 대상이 http://…/index.html.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): dist http 서빙 재사용, heap.js_used·heap.process_rss 분리, 100 MB 픽스처 RSS ≥ 100 MB. 데모 PLY 가 dist 에 없어 splat=off 상태(연구 노트 재작업 절)

### F-009 [처리됨-검증대기] (심각도: 중간) — 투영 부호 반전을 테스트가 못 잡고, 퇴화 카메라(up∥시선, eye=target)에서 NaN 으로 빈 영상이 조용히 나온다
- 위치: bench/baseline/ref_images/index.mjs:36-37,76-77; ref_images.test.mjs:20-26,32-50,71 (feat/baseline 2e69336)
- 문제: 테스트는 화면 중심 점과 거리 비율만 본다. `u = cx − f·x/d, v = cy + f·y/d` 로 바꿔도 전부 통과(서브에이전트 사본 재현). cross(up,zc)=0 이면 R 이 NaN → 모든 점 탈락, 예외 없음. :71 은 some(drawn>0).
- 실패 상황: 수직 내려다보기 `{eye:[0,300,0], target:[0,0,0], up:[0,1,0]}` → drawn 0 검은 영상이 정상 기록.
- 고칠 것: 비대칭 점 방향 테스트([1,0,-10]→px>640, [0,1,-10]→py<360), 퇴화 시 throw, 모든 시점 drawn>0, 시점별 sha256 골든.
- 확인 기준: 부호 반전 변형에서 새 테스트 실패, 위 수직 시점 입력에서 예외.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 비대칭 점 방향·퇴화 카메라 throw·시점별 sha256 골든, 부호 반전 변형에서 새 테스트 실패 확인

### F-010 [처리됨-검증대기] (심각도: 중간) — viewpoints.json 의 좌표 표기가 "ENU" 인데 실제는 씬 규약(y-up)이고 GeoAnchor 가 없다
- 위치: fixtures/viewpoints/viewpoints.json:2 및 각 시점 `up:[0,1,0]`; ref_images/index.mjs:5-8 (feat/baseline 2e69336)
- 문제: ENU 는 (동,북,위). x=동·y=위·z=−북은 RULES/SPEC 의 씬 규약이다. 원점(GeoAnchor) 위경도·고도가 없어 실데이터와 맞출 수 없다. renderer_basis §2 의 OpenCV 규약(d=X_c.z, y 아래)과 다른 GL 규약인데 같은 식 이름을 쓴다.
- 실패 상황: 시점 1 eye [0,120,300] 을 ENU 로 읽으면 북 120 m·높이 300 m 로 해석됨.
- 고칠 것: `coord` 를 "scene (x=east, y=up, z=-north), local ENU 에서 변환, 1 unit = 1 m" 로, `anchor {lat,lon,alt}` 추가, 주석에 OpenCV↔GL 변환 diag(1,−1,−1) 명시.
- 확인 기준: 스키마 테스트가 anchor 존재·coord 문자열 검사, 앵커 불일치 점군 입력 시 ref_images 실패.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): coord·anchor·note 추가, 스키마 테스트, ref_images 앵커 불일치 실패. 앵커 값(36.3685/127.3475/30)은 상태판 기본값이라 관제탑용은 사람 확인 필요

### F-011 [처리됨-검증대기] (심각도: 낮음) — 단위·출력·의존성 표기 잔손질
- 위치: first_frame/index.mjs:143 (분산 unit 'ratio'), ws_bytes/index.mjs:67-84 (outDir 무시), bundle_tower/index.mjs:72-79 (assertRecords 미호출), package.json:6 (`"license": "MIT"` 인데 LICENSE 없음), heap/index.mjs:23-25·first_frame/index.mjs:70-83 (playwright 미선언·탐색 방식 상이, 고정 경로 기본값) (feat/baseline 2e69336)
- 문제/실패 상황: 보고 표에 분산이 "ratio" 로 찍힘, ws_bytes 산출 파일 없음, 라이선스 선언만 있고 전문 없음, 한쪽 모듈만 브라우저 skip 가능.
- 고칠 것: 계약 UNITS 에 ms2 추가 또는 표준편차(ms), ws_bytes 파일 출력, run 안 assertRecords, license 는 사람 확인 전 UNLICENSED, playwright 탐색 공용화·README 에 외부 도구 명시.
- 확인 기준: 해당 단언 테스트 추가, README·package.json 확인.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): first_frame.stddev(ms), ws_bytes 산출 파일, bundle_tower assertRecords, license UNLICENSED, playwright 탐색 공용화·README 명시

### F-012 [처리됨-검증대기] (심각도: 낮음) — 연구 노트 측정값 표가 PR 코드로 재현되지 않았는데 표에 표시가 없다
- 위치: 연구 experiments/baseline.md 8-19행 (experiment/baseline 21eac85), 39행과 대조
- 문제: 표 값은 푸시되지 않은 이전 코드의 측정이다. 첫 프레임 "dev 번들" 비고는 현재 코드(dist 서빙)와 조건이 다르다. STATUS 는 미달 하위 작업(T01.3·5·8·10)을 명시하지 않고 "통합 완료·검토 대기" 로만 보고했다.
- 고칠 것: 표 머리에 "이전 미푸시 코드 측정, 현 코드로 미재현" 표시, 재현 후 갱신. 검토 요청 시 STATUS·PR 본문에 하위 작업별 충족/미달 표.
- 확인 기준: 노트 표의 각 값이 run_all 산출 JSON 과 일치하거나 미재현 표시.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 노트 측정값 표에 미재현 표시, 재작업 절에 하위별 충족/미달 표 추가

### F-013 [처리됨-검증대기] (심각도: 중간) — 잘못된 입력이 조용히 잘못된 수치로 집계된다 (asset_bytes 이름 충돌, tower_bytes 항목 검증 없음)
- 위치: bench/baseline/asset_bytes/index.mjs:14,48-53; tower_bytes/index.mjs:16-21,41-46,54-66 (feat/baseline 2e69336)
- 문제: `Number(m[1])` 로 seg01·seg1, L0250·L250 이 같은 키가 되어 덮어씀. tower_bytes 는 bytes 음수·문자열·null 줄·null feature 를 검사하지 않고, 빈 녹화도 0 으로 성공. 오류 줄 번호가 빈 줄 제거 뒤 인덱스.
- 실패 상황(서브에이전트 재현): seg1_L*(270 B)+seg01_L*(27000 B) → segment_total 1080, 파일 4개 누락. `{"kind":"dem","bytes":-500}` → dem_bytes −500 이 계약 통과.
- 고칠 것: 중복 구간·수준 키는 throw. 녹화 항목마다 객체·kind 허용값·bytes ≥ 0 정수 검사, 항목 0개 throw, null feature 제외, 원래 줄 번호 보존.
- 확인 기준: 위 입력 각각이 줄 번호·파일명 포함 오류로 실패하는 음성 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 중복 구간·수준 키 throw, 녹화 항목 검증, 원래 줄 번호 보존, 음성 테스트
