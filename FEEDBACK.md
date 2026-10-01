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
- 이력: YYYY-MM-DD HH:MM 감독 등록 → … 작업자 처리(커밋) → … 감독 확인 닫음 → 2026-10-01 작업자 처리(제품 5a7179a): 실제 클론(빌드 포함) run_all 성공 7·실패 1(tower_bytes 녹화 없음, 미달 명시)
```

- 작업자는 고친 뒤 상태를 `처리됨-검증대기` 로 바꾸고 커밋 해시를 이력에 적는다. **닫는 것은 감독만** 한다(확인 기준을 직접 돌려 통과해야 닫음).
- 감독은 같은 문제가 다시 생기면 새 번호 대신 기존 항목을 다시 연다.
- 닫힌 항목은 지우지 않는다(기록).
- 치명·높음은 감독이 직접 재현한 것만 올린다.

## 항목

### F-001 [닫힘] (심각도: 높음) — run_all 이 실제 skylens develop 에서 8개 중 6개 실패 (T01.10 미달)
- 위치: bench/baseline/run_all/index.mjs:79, 기본 입력 경로 asset_bytes/index.mjs:59, ws_bytes/index.mjs:68, tower_bytes/index.mjs:70, heap/index.mjs:62, bundle_status/index.mjs:67 (feat/baseline 2e69336)
- 문제: 모든 모듈의 기본 입력 경로가 skylens 에 없는 가정 경로다(`assets/seg*_L*.bin`, `fixtures/ws_recording.jsonl`, `recordings/tower.jsonl`, `index.html` file://). run_all 테스트는 가짜 모듈로만 돈다(run_all.test.mjs:104-113).
- 실패 상황: 감독 직접 실행 `node bench/baseline/run_all/cli.mjs --skylens-dir <skylens develop 59edcf9 클론> --out o --commit 59edcf9` → `성공 2, 실패 6` (bundle_status 대상 없음, asset_bytes ENOENT assets/, ws_bytes ENOENT, tower_bytes ENOENT, first_frame 30 s 타임아웃, heap url 없음).
- 고칠 것: 실제 skylens 배치에 맞춘 경로(자산 `res/static/demo/segments/seg<N>_step<5자리>.ply`), 녹화 픽스처는 이 저장소 `fixtures/` 에 두고 인자로 넘김, 빌드가 필요한 모듈은 복사본에서 빌드. 입력이 없으면 합성으로 대체하지 말고 실패.
- 확인 기준: skylens develop 클린 클론(의존성 설치·빌드 단계 포함 한 명령)에서 run_all `성공 8, 실패 0`, 종료코드 0. 못 재는 모듈은 STATUS·PR 에 미달로 명시.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 13:50 감독 확인 닫음: skylens develop 59edcf9 클린 클론에서 run_all(빌드 포함, --points·--ws-recording, 앵커 미지정) 성공 6·실패 2(tower_bytes 입력 없음, ref_images 앵커 없음 — 둘 다 입력 누락으로 정확히 실패). 앵커 주면 ref_images 실측 테스트 통과(SKYLENS_DIR). 도구 경로 문제는 해결. T01.10 자체는 tower 녹화 전까지 미달(F-016)

### F-002 [닫힘] (심각도: 높음) — asset_bytes 가 27 B·`.bin` 을 가정해 실제 56 B/점 PLY 자산을 전혀 못 잰다
- 위치: bench/baseline/asset_bytes/index.mjs:3-6,12,14,27-31,73 (feat/baseline 2e69336)
- 문제: 실제 구간 파일은 PLY(ASCII 헤더 + float32×14 = 56 B/점, `element vertex N`)다(감독 확인: seg0_step00250.ply 헤더). 점 수를 크기에서 역산(`floor((size-header)/27)`)하므로 "27×N 과 크기 차 ≤ 헤더" 검사는 나머지 0 검사 외에는 항상 참이고, 독립된 점 수 출처가 없다. 형식이 다르면 바이트 집계까지 통째로 예외로 버린다.
- 실패 상황: 실제 자산 → `ENOENT .../assets` 또는 형식 예외, 레코드 0개. 27 의 배수 크기인 엉뚱한 파일은 통과.
- 고칠 것: 크기 집계와 형식 검사를 분리해 바이트는 항상 기록. PLY 헤더에서 N·property 목록·헤더 길이를 읽어 `size − stride×N == 헤더 길이` 검사. 실제 stride 와 `assumed_stride_matches`(27 B 기대 일치 0/1)를 지표로 남김. 56 B 이탈은 method 에 명시(T03 입력 형식은 감독·사람이 결정).
- 확인 기준: 실제 데모 16개 구간 파일에서 수준별 합계 473,744 / 1,256,960 / 14,170,732 / 26,070,736 B 재현, stride 56, matches 0. 헤더 N 과 본문 크기가 어긋난 픽스처는 거부하는 음성 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): PLY 헤더 파싱, 수준 합계 473,744/1,256,960/14,170,732/26,070,736·stride 56·matches 0 재현, 음성 테스트 → 2026-10-01 13:50 감독 확인 닫음: SKYLENS_DIR=<클론> 실측 테스트 "수준별 합계·stride 56·matches 0" 통과

### F-003 [닫힘] (심각도: 높음) — T01.5 건물 6,191 테스트가 순환(합성 6,191동을 만들어 6,191 단언), 미달이 충족처럼 보고됨
- 위치: bench/baseline/tower_bytes/tower_bytes.test.mjs:12,19-41,45,57; 연구 experiments/baseline.md "하위별 기준" 줄 (experiment/baseline 21eac85)
- 문제: 기댓값이 입력에서 나온다. T01.5 기준은 "녹화 응답에서 6,191 ± 1% 재현"인데 실제 녹화가 없다(노트 §미달 415동). 노트 재구현 기록은 "합성 건물 정확히 6,191" 을 기준처럼 적었다.
- 실패 상황: 실제 녹화 없이 `npm test` 녹색 → T01.5 완료로 오인. 실제 run 은 ENOENT.
- 고칠 것: 합성 테스트는 N 을 6191 이 아닌 값으로 바꾸고 이름을 "중복 제거 집계"로. T01.5 판정 테스트는 실제 녹화 픽스처가 있을 때만 돌고 없으면 skip+미달 표시. 노트 문구 정정. 녹화는 사람에게 요청(STATUS 막힌 점).
- 확인 기준: 녹화 없이 `npm test` 에서 T01.5 판정 테스트가 skip 으로 보고. 테스트 코드에 6191 리터럴이 합성 입력 크기로 쓰이지 않음.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 합성 테스트 N=37 로 이름 변경, 6,191 판정은 TOWER_RECORDING 있을 때만(없으면 skip·미달) → 2026-10-01 13:50 감독 확인 닫음: 녹화 없이 npm test 에서 T01.5 판정 SKIP, 6191 리터럴은 판정 단언(tower_bytes.test.mjs:115-118)에만

### F-004 [닫힘] (심각도: 높음) — ref_images 가 run_all 경로에서 원본이 아닌 합성 점군으로 기준 영상을 만든다 (T01.8 미달)
- 위치: bench/baseline/ref_images/index.mjs:178-181 (`void skylensDir`, pointsPath 없으면 syntheticPoints(1)), run_all/index.mjs:79 (feat/baseline 2e69336)
- 문제: T01.8·SPEC §4 의 기준 영상 = 원본 점군 렌더. 합성 영상이 skylens 커밋 해시를 달고 성공 레코드로 나온다. decodePoints(:109-111)는 PLY 헤더를 못 읽는다.
- 실패 상황: `run_all --skylens-dir /nonexistent` 에서도 ref_images 가 ok, 16개 레코드.
- 고칠 것: run_all/CLI 에 점군 경로 인자, 없으면 failed. PLY 헤더 파싱(56 B 스플랫이면 중심 x y z·f_dc 색 사용을 method 에 명시). 합성은 테스트 전용.
- 확인 기준: 점군 경로 없이 run_all → ref_images failed. 실제 레벨4 PLY 로 8장 생성, 비어 있지 않은 픽셀 수가 노트 표와 일치하거나 차이 설명, 재실행 sha256 동일.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): pointsPath 필수·없으면 failed, 레벨4 PLY 8장·재실행 sha256 동일 → 2026-10-01 13:50 감독 확인 닫음: pointsPath 없음 throw 음성 테스트, 실제 레벨4 PLY 8장·재실행 sha256 동일 테스트 통과. 좌표계 문제는 별건 F-015

### F-005 [닫힘] (심각도: 높음) — ws_bytes 의 "구간"이 1000 ms 시간 창이라 SPEC §4 정의(한 구간의 4수준 전체)와 다르다
- 위치: bench/baseline/ws_bytes/index.mjs:41-43,79 (feat/baseline 2e69336)
- 문제: `seg = floor(t_ms / segmentMs)` 로 시간 창 합을 `ws_bytes.segment_total` 로 낸다. 빈 창 0 이 평균에 들어간다. 녹화 형식에 구간·수준 필드가 없다. epoch ms 를 넣으면 배열이 t_ms/1000 크기로 커진다.
- 실패 상황: 한 구간 4수준이 여러 초에 걸쳐 오면 구간당 값이 실제보다 작게 나와 S6 "구간당 ≤ 3 MB" 를 거짓으로 통과. t_ms=1.7e12 → 메모리 고갈.
- 고칠 것: 녹화 줄에 segment·level 추가, 구간 ID 별 4수준 합. 시간 창 지표가 필요하면 다른 이름(`ws_bytes.window_1000ms`). 상대 시각·Map 사용.
- 확인 기준: 구간 2개×4수준이 서로 다른 시간 창에 흩어진 픽스처에서 samples 가 정확히 2개이고 각 값이 해당 구간 4프레임 합. t_ms=1.7e12 픽스처가 1 s 안에 끝남.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): segment·level 필드, 구간 ID별 4수준 합, window_1000ms 분리, 1.7e12 시각 1초 내 → 2026-10-01 13:50 감독 확인 닫음: 2구간×4수준 흩어진 픽스처 samples 2개, 1.7e12 테스트 통과. 추월 수준 문제는 별건 F-014

### F-006 [닫힘] (심각도: 중간) — 번들 측정 source 모드가 three/build 의 변형 전부를 더하고, bundle_tower 는 대상 0개여도 0 B 를 성공으로 낸다
- 위치: bench/baseline/bundle_status/index.mjs:61-66, bundle_tower/index.mjs:38-46,51-53 (feat/baseline 2e69336)
- 문제: build/ 의 cjs·module·min·webgpu 변형을 모두 합산 → S4 "현재" 가 수 배로 부풀 수 있음. "두 번 재서 동일" 테스트는 같은 파일을 두 번 gzip 할 뿐 빌드 재현성을 보지 않는다.
- 실패 상황: 모의 트리에 three.module.js 하나만 있어 드러나지 않음. `/nonexistent` 에서 bundle_tower.gzip_bytes = 0 이 ok.
- 고칠 것: 복사본에서 vite 프로덕션 빌드 후 3D 청크만, 또는 패키지 진입점 하나만. 대상 0개면 throw.
- 확인 기준: 모의 트리에 cjs·min·webgpu 변형을 추가해도 값 불변인 테스트, 대상 0개 → reject 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 진입 HTML 폐포 방식, 대상 0개 reject, 변형 불변 테스트 → 2026-10-01 13:50 감독 확인 닫음: 변형 추가 불변·대상 0개 reject 테스트 통과. 3D 청크 한정 문제는 별건 F-018

### F-007 [닫힘] (심각도: 중간) — first_frame 픽셀 판정이 그리지 않은 alpha:false WebGL 캔버스를 첫 프레임으로 잡는다
- 위치: bench/baseline/first_frame/index.mjs:30-38,42; 테스트 first_frame.test.mjs:30 (`__firstFrame` 직접 세움) (feat/baseline 2e69336)
- 문제: alpha≠0 픽셀이 있으면 첫 프레임. 불투명 clear 만으로 참. 캔버스 감지 경로는 테스트되지 않음. dump-dom 대체 경로(:112-119)는 테스트 페이지가 쓰는 data-ff-ms 에만 의존.
- 실패 상황(서브에이전트 재현, 감독 미확인): 그리지 않는 alpha:false 페이지에서 23~78 ms 에 감지.
- 고칠 것: 도착한 자산이 처음 그려진 신호(첫 draw 호출 훅 또는 배경색과 다른 픽셀 비율)로 판정. 음성 테스트 추가.
- 확인 기준: 빈 alpha:false 캔버스 → 타임아웃/미감지, 500 ms 뒤 그리는 페이지 → ≥ 500 ms.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 배경색과 다른 픽셀 비율 판정, 빈 alpha:false 캔버스 미감지·500 ms 뒤 그림 ≥500 ms 테스트 → 2026-10-01 13:50 감독 다시 엶: 빈 alpha:false·500 ms 테스트는 통과했으나 판정이 모든 canvas 대상이라 2D 미니맵이 그려지면 첫 프레임으로 잡힌다(_common/browser.mjs:151 `document.querySelectorAll('canvas')`, skylens src/skylens_client/ui/minimap.ts:43-46 2D 캔버스). 고칠 것: 대상 캔버스를 3D 뷰 캔버스(선택자 입력, 기본 상황판 3D 캔버스)로 한정하고 판정한 캔버스 id 를 method 에 기록. 확인 기준: 2D 캔버스만 그리는 픽스처 페이지 → 미감지(타임아웃 throw), 3D 캔버스 500 ms 뒤 그림 → ≥500 ms → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 3D 캔버스(#view2) 선택자로 한정, 판정 캔버스 id 를 method 에 기록, 2D 전용 페이지 미감지 테스트(3dad369, 327db50). 실제 dist 의 #view2 는 미확인 → 2026-10-01 17:50 감독 다시 엶: 기본 선택자 `#view2` 는 skylens main 의 recon.html 기준이다. develop(59edcf9) 상황판 res/static/status.html:11 의 3D 캔버스는 `canvas#status-view` 이고 `#view2` 는 develop 트리 어디에도 없다(감독 grep 확인). 실제 dist 에서 첫 프레임이 항상 미감지(타임아웃)된다. 고칠 것: 기본값을 `#status-view` 로, 관제탑은 develop control.html 의 3D 캔버스로. 확인 기준: develop 빌드 dist 로 `SKYLENS_DIR=<develop 클론> node --test bench/baseline/first_frame` 통과, method 에 canvas#status-view. 권장 모델: sonnet → 2026-10-01 작업자 처리(제품 7b34620): 기본 `#status-view`, method 에 canvas#status-view, 실제 dist(복사본 vite build)에서 통과. 관제탑 `#control-view` 는 30 s 안에 미감지라 미검증 → 2026-10-01 18:20 감독 확인 닫음: develop 59edcf9 vite build dist 로 `SKYLENS_DIR=<클론> npm test` 214 통과·0 실패, first_frame 실제 dist 테스트 통과. 관제탑 #control-view 미검증은 F-031 로 옮김

### F-008 [닫힘] (심각도: 중간) — heap 이 소스 index.html 을 file:// 로 열고 JSHeapUsedSize 만 재 S3(탭 전체 메모리) 기준으로 쓸 수 없다
- 위치: bench/baseline/heap/index.mjs:50-51,62-63,65-68,77 (feat/baseline 2e69336)
- 문제: vite 소스 index.html 은 file:// 에서 모듈 로드 실패 → 빈 페이지 힙. first_frame 은 dist 를 http 로 서빙해 대상이 다름. TypedArray·WebGL 버퍼는 JS 힙 밖. 실행 인자에 swiftshader 지정이 없어 device 라벨로 소프트웨어/GPU 구분 불가.
- 실패 상황: run_all 에서 "측정할 url 이 없음"(감독 직접 실행 확인).
- 고칠 것: first_frame 의 dist http 서빙 재사용, 첫 프레임 뒤 측정, 지표명을 `heap.js_used` 로 한정하고 S3 와 매핑하지 않음(가능하면 프로세스 메모리 함께 기록), 인자·device 를 first_frame 과 맞춤.
- 확인 기준: 100 MB Float32Array 를 잡는 픽스처에서 프로세스 메모리 지표 ≥ 100 MB, run_all 에서 heap 대상이 http://…/index.html.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): dist http 서빙 재사용, heap.js_used·heap.process_rss 분리, 100 MB 픽스처 RSS ≥ 100 MB. 데모 PLY 가 dist 에 없어 splat=off 상태(연구 노트 재작업 절) → 2026-10-01 13:50 감독 확인 닫음: 100 MiB Float32Array 픽스처 RSS 테스트 통과, heap.js_used·heap.process_rss 분리

### F-009 [닫힘] (심각도: 중간) — 투영 부호 반전을 테스트가 못 잡고, 퇴화 카메라(up∥시선, eye=target)에서 NaN 으로 빈 영상이 조용히 나온다
- 위치: bench/baseline/ref_images/index.mjs:36-37,76-77; ref_images.test.mjs:20-26,32-50,71 (feat/baseline 2e69336)
- 문제: 테스트는 화면 중심 점과 거리 비율만 본다. `u = cx − f·x/d, v = cy + f·y/d` 로 바꿔도 전부 통과(서브에이전트 사본 재현). cross(up,zc)=0 이면 R 이 NaN → 모든 점 탈락, 예외 없음. :71 은 some(drawn>0).
- 실패 상황: 수직 내려다보기 `{eye:[0,300,0], target:[0,0,0], up:[0,1,0]}` → drawn 0 검은 영상이 정상 기록.
- 고칠 것: 비대칭 점 방향 테스트([1,0,-10]→px>640, [0,1,-10]→py<360), 퇴화 시 throw, 모든 시점 drawn>0, 시점별 sha256 골든.
- 확인 기준: 부호 반전 변형에서 새 테스트 실패, 위 수직 시점 입력에서 예외.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 비대칭 점 방향·퇴화 카메라 throw·시점별 sha256 골든, 부호 반전 변형에서 새 테스트 실패 확인 → 2026-10-01 13:50 감독 확인 닫음: 사본에서 index.mjs:94 u 부호 반전 → (1c)(1d)(3) 실패, v 부호 반전 → (1c)(3) 실패 직접 확인. 퇴화 시점 음성 테스트 통과

### F-010 [닫힘] (심각도: 중간) — viewpoints.json 의 좌표 표기가 "ENU" 인데 실제는 씬 규약(y-up)이고 GeoAnchor 가 없다
- 위치: fixtures/viewpoints/viewpoints.json:2 및 각 시점 `up:[0,1,0]`; ref_images/index.mjs:5-8 (feat/baseline 2e69336)
- 문제: ENU 는 (동,북,위). x=동·y=위·z=−북은 RULES/SPEC 의 씬 규약이다. 원점(GeoAnchor) 위경도·고도가 없어 실데이터와 맞출 수 없다. renderer_basis §2 의 OpenCV 규약(d=X_c.z, y 아래)과 다른 GL 규약인데 같은 식 이름을 쓴다.
- 실패 상황: 시점 1 eye [0,120,300] 을 ENU 로 읽으면 북 120 m·높이 300 m 로 해석됨.
- 고칠 것: `coord` 를 "scene (x=east, y=up, z=-north), local ENU 에서 변환, 1 unit = 1 m" 로, `anchor {lat,lon,alt}` 추가, 주석에 OpenCV↔GL 변환 diag(1,−1,−1) 명시.
- 확인 기준: 스키마 테스트가 anchor 존재·coord 문자열 검사, 앵커 불일치 점군 입력 시 ref_images 실패.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): coord·anchor·note 추가, 스키마 테스트, ref_images 앵커 불일치 실패. 앵커 값(36.3685/127.3475/30)은 상태판 기본값이라 관제탑용은 사람 확인 필요 → 2026-10-01 13:50 감독 다시 엶: 표기(coord·anchor·note)는 고쳐졌으나 "앵커 불일치 점군 입력 시 실패"가 실제로는 viewpoints.json anchor 와 CLI inputs.anchor 두 사람 입력끼리 비교할 뿐 점군을 보지 않는다(ref_images/index.mjs:187-193, contracts/inputs/index.mjs:10 "GeoAnchor of the point cloud"). 테스트도 fixture anchor 를 37.5/127.0/40 으로 덮어써 실제 값을 안 쓴다(ref_images.test.mjs:121,233). 고칠 것: 점군 쪽 앵커 출처(skylens segments.json/청크 align 의 anchor 또는 사이드카)를 읽어 대조하거나, 출처가 없으면 계약 주석을 "운영자 선언값, 점군 대조 없음"으로 바꾸고 노트에 미충족 명시. 확인 기준: 앵커 메타가 다른 점군 입력 → throw, 또는 계약·노트 문구 정정 확인 → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 앵커는 운영자 선언값으로 계약 주석 정정, 점군 대조 없음을 노트에 미충족 명시(93407d0) → 2026-10-01 17:50 감독 확인 닫음: contracts/inputs/index.mjs 주석이 "운영자 선언값, 점군 대조 없음"으로 정정되고 노트에 미충족 명시. 시점 원점 설명 불일치는 F-025 로 분리

### F-011 [닫힘] (심각도: 낮음) — 단위·출력·의존성 표기 잔손질
- 위치: first_frame/index.mjs:143 (분산 unit 'ratio'), ws_bytes/index.mjs:67-84 (outDir 무시), bundle_tower/index.mjs:72-79 (assertRecords 미호출), package.json:6 (`"license": "MIT"` 인데 LICENSE 없음), heap/index.mjs:23-25·first_frame/index.mjs:70-83 (playwright 미선언·탐색 방식 상이, 고정 경로 기본값) (feat/baseline 2e69336)
- 문제/실패 상황: 보고 표에 분산이 "ratio" 로 찍힘, ws_bytes 산출 파일 없음, 라이선스 선언만 있고 전문 없음, 한쪽 모듈만 브라우저 skip 가능.
- 고칠 것: 계약 UNITS 에 ms2 추가 또는 표준편차(ms), ws_bytes 파일 출력, run 안 assertRecords, license 는 사람 확인 전 UNLICENSED, playwright 탐색 공용화·README 에 외부 도구 명시.
- 확인 기준: 해당 단언 테스트 추가, README·package.json 확인.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): first_frame.stddev(ms), ws_bytes 산출 파일, bundle_tower assertRecords, license UNLICENSED, playwright 탐색 공용화·README 명시 → 2026-10-01 13:50 감독 확인 닫음: first_frame.stddev(ms), ws_bytes.json 출력, bundle_tower assertRecords 테스트, license UNLICENSED, playwright 탐색 공용(_common/browser.mjs) 확인

### F-012 [닫힘] (심각도: 낮음) — 연구 노트 측정값 표가 PR 코드로 재현되지 않았는데 표에 표시가 없다
- 위치: 연구 experiments/baseline.md 8-19행 (experiment/baseline 21eac85), 39행과 대조
- 문제: 표 값은 푸시되지 않은 이전 코드의 측정이다. 첫 프레임 "dev 번들" 비고는 현재 코드(dist 서빙)와 조건이 다르다. STATUS 는 미달 하위 작업(T01.3·5·8·10)을 명시하지 않고 "통합 완료·검토 대기" 로만 보고했다.
- 고칠 것: 표 머리에 "이전 미푸시 코드 측정, 현 코드로 미재현" 표시, 재현 후 갱신. 검토 요청 시 STATUS·PR 본문에 하위 작업별 충족/미달 표.
- 확인 기준: 노트 표의 각 값이 run_all 산출 JSON 과 일치하거나 미재현 표시.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 노트 측정값 표에 미재현 표시, 재작업 절에 하위별 충족/미달 표 추가 → 2026-10-01 13:50 감독 확인 닫음: 노트 측정값 표 미재현 표시·재작업 절 하위별 표 확인. 남은 문서 불일치는 F-016

### F-013 [닫힘] (심각도: 중간) — 잘못된 입력이 조용히 잘못된 수치로 집계된다 (asset_bytes 이름 충돌, tower_bytes 항목 검증 없음)
- 위치: bench/baseline/asset_bytes/index.mjs:14,48-53; tower_bytes/index.mjs:16-21,41-46,54-66 (feat/baseline 2e69336)
- 문제: `Number(m[1])` 로 seg01·seg1, L0250·L250 이 같은 키가 되어 덮어씀. tower_bytes 는 bytes 음수·문자열·null 줄·null feature 를 검사하지 않고, 빈 녹화도 0 으로 성공. 오류 줄 번호가 빈 줄 제거 뒤 인덱스.
- 실패 상황(서브에이전트 재현): seg1_L*(270 B)+seg01_L*(27000 B) → segment_total 1080, 파일 4개 누락. `{"kind":"dem","bytes":-500}` → dem_bytes −500 이 계약 통과.
- 고칠 것: 중복 구간·수준 키는 throw. 녹화 항목마다 객체·kind 허용값·bytes ≥ 0 정수 검사, 항목 0개 throw, null feature 제외, 원래 줄 번호 보존.
- 확인 기준: 위 입력 각각이 줄 번호·파일명 포함 오류로 실패하는 음성 테스트.
- 이력: 2026-10-01 13:20 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 5a7179a): 중복 구간·수준 키 throw, 녹화 항목 검증, 원래 줄 번호 보존, 음성 테스트 → 2026-10-01 13:50 감독 확인 닫음: 중복 키 throw, 음수·문자열·null 줄·빈 녹화 음성 테스트(원래 줄 번호) 통과

### F-014 [닫힘] (심각도: 높음) — ws_bytes 가 4수준이 다 없는 구간을 오류로 버려, 추월 수준을 건너뛴 실제 녹화를 측정하지 못한다
- 위치: bench/baseline/ws_bytes/index.mjs:64-68 (feat/baseline 5a7179a)
- 문제: 구간마다 수준 0..3 이 모두 없으면 throw 한다. skylens 코어는 대기 중 추월된 수준을 버리고(skylens src/skylens_core/server/orchestrator.ts:217-229, R3 sweep), 다시 접속한 상황판은 구간마다 가장 높은 수준 하나만 받는다(src/skylens_core/server/boards.ts:144-150). 녹화가 끝날 때 다듬는 중인 마지막 구간도 4수준이 아니다. 감독 직접 확인.
- 실패 상황: 원칙대로 동작한 실제 녹화(구간 3 이 수준 0·3 만 받음) → `구간 3: 수준 1,2 프레임이 없음` 으로 전체 실패. 반대로 4수준을 누적 전송하는(원칙 위반) 녹화만 통과한다. S6 구간당 대역폭을 실데이터로 잴 수 없다.
- 고칠 것: 빠진 수준은 오류가 아니라 기록 대상. 구간 레코드에 받은 수준 집합·건너뛴 수준 수를 함께 내고(`ws_bytes.segment_total` 은 실제 받은 수준 합, `ws_bytes.levels_skipped` 별도 지표), 마지막 미완 구간은 표시하거나 제외. 같은 (구간, 수준) 재전송(재접속 스냅샷)은 분할 프레임과 구분해 이중 합산하지 않거나 별도 지표로. 수준 번호는 skylens 프로토콜(1..4)과 변환 지점을 한 곳에 명시.
- 확인 기준: 수준 {0,3} 만 있는 구간 픽스처 → 실패 없이 합과 건너뛴 수준 [1,2] 기록. 4수준 다 있는 기존 픽스처 값 불변. 같은 구간·수준 재전송 픽스처의 동작이 테스트로 고정.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 빠진 수준을 levels_skipped 로 기록, 재전송은 resend 표시로 구분(99fb7e9) → 2026-10-01 17:50 감독 확인 닫음: npm test ws_bytes 통과, {0,3} 구간 → levels_skipped [1,2] 기록·4수준 픽스처 값 불변·resend 픽스처 테스트 존재. 남은 검출 공백(낮은 수준 역행·건너뜀 합 단언)은 F-022·F-024

### F-015 [닫힘] (심각도: 높음) — 기준 영상(T01.8)이 앱과 다른 좌표 틀에서 그려져 거의 빈 영상인데 '충족'으로 보고됨
- 위치: bench/baseline/ref_images/index.mjs:205-220 (PLY 원좌표를 그대로 투영, `drawn > 0` 만 검사); fixtures/viewpoints/viewpoints.json 시점 거리; 연구 experiments/baseline.md 재작업 표 T01.8 행 (experiment/baseline a97200b)
- 문제: 상황판은 스플랫을 x180 회전·`TARGET_EXTENT=44` 로 축척·바닥 y=0 이동해 그린다(skylens src/shared/viewer/sources/sceneSource.ts:350-385, 95). ref_images 는 이 변환 없이 PLY 원좌표(수십 m 규모)를 100~700 m 떨어진 시점에서 그린다. 노트 스스로 점유율 0.04~0.8 %(비어 있지 않은 픽셀 346~7720 / 921,600)라 적었다. 감독 직접 확인(코드·노트).
- 실패 상황: S9 SSIM 기준 영상이 사실상 배경색 한 장이라, 어떤 경량 렌더도 SSIM ≈ 1 로 거짓 통과한다. 1 px 만 찍혀도 run 은 ok.
- 고칠 것: 앱이 실제로 그리는 씬 틀(위 변환 또는 skylens 청크 align)을 입력으로 받아 적용하거나, 시점을 PLY 틀에 맞춰 다시 잡고 그 틀을 viewpoints.json `coord` 에 명시. 시점별 최소 점유율(예: ≥ 5 %)을 두고 미달이면 throw. 테스트의 동률 깊이 규칙(index.mjs:114 `<`)·fov/width/height 검증(0<fov<180, 양의 정수) 추가.
- 확인 기준: 실제 레벨4 PLY 로 8장 모두 점유율 ≥ 5 %, 재실행 sha256 동일. fov −50/0/180·width 1280.5 입력 → throw. `<` → `<=` 변형에서 새 테스트 실패.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 앱 씬 틀 sceneFrame 적용·점유율 ≥5% 강제·입력 검증(93c181b). 합성 8.3~24.1%, 실제 레벨4 PLY 로는 미확인 → 2026-10-01 17:50 감독 다시 엶(이 항목 두 번째 반려): ① 확인 기준 미달 — `SKYLENS_DIR=<develop 59edcf9 클론> node --test bench/baseline/ref_images/ref_images.test.mjs` 실패 `시점 1 status_overview: 점유율 2.708 % 가 최소 5 % 보다 낮다`. ② 회전이 틀림 — develop sceneSource.ts:342-356 는 자체 촬영(demoPreview=/res/static/demo/step00250_light.ply)이면 UP_PRESETS.none(회전 없음), 인터넷 샘플만 x180. 구간 PLY(res/static/demo/segments/*)는 그 촬영본을 자른 것인데 ref_images/index.mjs:149 는 x180 만 허용해 위아래가 뒤집힌다. ③ 축척·이동 틀을 그리는 구간 PLY 자신의 분위로 다시 구한다(index.mjs:170-179, 300). 앱은 demoPreview 한 파일에서 s·P 를 한 번 구해(config.ts:104-106, sceneSource.ts:40-43) 모든 구간에 같은 변환을 쓴다. ④ 앱의 분위 표본은 stride=max(1,floor(total/60000)) 솎음(sceneSource.ts:335-340). ⑤ index.mjs:6 "1 unit = 1 m" 은 축척 s 적용 뒤라 틀림. 원인: 작업자가 develop 이 아닌 다른 브랜치(main, src/skylens_client/data/sceneSource.ts)를 기준으로 맞췄다. 고칠 것: `git clone -b develop https://github.com/NET-Challenge-S13/skylens.git` 로 develop 을 받아 그 sceneSource.ts 를 기준으로 rotate "none"|"x180" 허용, 자체 촬영 입력은 none, 틀(s·P·clip)은 framePly(기본 res/static/demo/step00250_light.ply)에서 앱과 같은 stride 표본으로 구해 그릴 점군에 적용만, method 에 s·P 기록, 단위 주석 정정, 시점 8곳을 이 틀에서 다시 잡음. 확인 기준: develop 클론으로 위 테스트 통과(8장 모두 점유율 ≥ 5 %, 재실행 sha256 동일), 지면 점 y 중앙값 < 지붕, preview 에서 구한 s·P 를 앱 알고리즘 이식 결과와 1e-6 이내 비교 테스트. 권장 모델: opus → 2026-10-01 작업자 처리(제품 7b34620): develop 틀(stride 표본·s·P)을 앱 알고리즘으로 이식, 회전 none, 1e-6 비교 테스트, NaN 거부. 실제 step07000_light.ply 8시점 점유율 5.46~6.68 %·sha256 동일. 지시와 다른 점: 구간 PLY 는 다른 틀(align_scene.py)이라 미리보기 틀을 적용하면 전부 잘려 같은 틀인 step07000_light.ply 를 그림(구간 PLY 직접 ≥5 % 불가, 최대 약 4.7 %). 지면<지붕은 합성만. 앱 SplatLoader 실제 s·P 는 브라우저 미확인 → 2026-10-01 18:20 감독 확인 닫음: 같은 명령에서 "실제 수준 3 PLY: 8장, 재실행 sha256 동일, 점유율 5 % 이상, method 에 s·P 기록" 통과(서브에이전트 재측정 5.46~6.68 %). 구간 PLY 대신 step07000_light.ply 를 그린 것은 정당하다(segments.json 에 구간별 axis·origin 이 따로 있고 clip 상자 안 구간 점이 거의 없음). 지면<지붕 실데이터 확인과 앱 로더 대조는 F-027 로 분리

### F-016 [닫힘] (심각도: 중간) — 미달이 '충족'·'7/8' 로 표기된다 (보고 도구·PR·노트·STATUS)
- 위치: tools/baseline_report/report.mjs:40 (`ok` 면 무조건 '충족'); 제품 PR #2 본문 "T01.9·T01.10 | 충족 / 7 of 8"; 연구 experiments/baseline.md 재작업 표 T01.3·T01.10 행과 같은 파일 23행; STATUS.md 막힌 점(T01.10 누락); TASKS.md T01.3 기준 문구
- 문제: 모듈 실행 성공 = 하위 작업 충족이 아니다. first_frame·heap(splat=off 참고값), ref_images(F-015)도 '충족' 으로 찍힌다. T01.10 완료 기준은 "클린 클론에서 한 번에 통과"인데 종료코드 1(실패 1)을 '7/8' 로만 적었다. T01.3 은 노트 23행 "27 B 기준은 실패로 기록"과 56행 "충족"이 공존한다.
- 실패 상황: `--status` 표를 STATUS·PR 에 붙이면 T01.6·T01.7·T01.8 이 충족으로 보인다.
- 고칠 것: 보고 도구는 '측정됨/실패/건너뜀' 만 쓰고 충족 판정은 노트에서. device 가 software 인 레코드는 '참고값(클라우드)' 절로 분리. 노트·PR·STATUS 에 T01.10 '미달(tower 녹화 대기)', T01.3 '충족(F-002 대체 기준), TASKS 27 B 기준은 T03 입력 결정 대기'. 노트 37-44행 옛 수치에 "21eac85 시점, 대체됨" 표시.
- 확인 기준: report.test 에서 ok 모듈이 '충족' 으로 찍히지 않고, swiftshader device 레코드가 참고 절로 분리. 노트 안 T01.3·T01.10 판정이 하나씩.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 보고 도구 측정됨/실패/건너뜀·참고값 절 분리, 노트 판정표 정리(aa88cb8) → 2026-10-01 17:50 감독 확인 닫음: report.mjs 가 측정됨/실패/건너뜀만 쓰고 software device 는 참고 절로 분리(report.test 통과). 노트의 옛 표 표기 잔여는 F-025

### F-017 [닫힘] (심각도: 중간) — asset_bytes 가 모르는 step 파일을 조용히 빼고, 부족한 합을 먼저 파일에 쓰며, method 가 56 B 로 고정
- 위치: bench/baseline/asset_bytes/index.mjs:70 (`if (level === undefined) continue;`), :99·:120-121·:136-140 (problems 가 있어도 segment_total 기록 뒤 throw), :100·:132 (method 에 "56 B" 하드코딩) — 감독 직접 확인
- 실패 상황: `seg0_step05000.ply` 추가 → 경고 없이 집계 제외. 27 B PLY 입력 → stride 27 레코드의 method 가 "실제 56 B" 로 모순.
- 고칠 것: 패턴은 맞는데 STEP_LEVEL 에 없는 파일은 problems 에 넣거나 count 지표. 가능하면 skylens `segments.json` 과 대조. problems 가 있으면 불완전 레코드를 쓰지 않음. method 는 `hdr.stride`·property 목록으로 생성. segment_total samples·평균 단언 추가(현재 `totals[0]` 변형이 살아남음).
- 확인 기준: 위 두 입력 음성 테스트, `segment_total_mean = totals[0]` 변형에서 테스트 실패.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 모르는 step 파일 오류·불완전 레코드 미기록·method 생성(025cf28) → 2026-10-01 17:50 감독 확인 닫음: 모르는 step 파일 오류·불완전 레코드 미기록·stride 생성 method, `segment_total_mean=totals[0]` 변형에서 테스트 실패(서브에이전트 변형, 감독은 테스트 통과·코드 확인)

### F-018 [닫힘] (심각도: 중간) — 번들 측정이 SPEC "3D 관련 청크만" 과 다르고, source 모드는 three.core.js 를 뺀다
- 위치: bench/baseline/bundle_status/index.mjs:76 (stylesheet 포함), :121 (진입 HTML 폐포 전체); bundle_tower 같은 구조; 소스 모드 진입점 하나(bundle_tower.test.mjs:122 가 three.core.js 추가 시 "불변" 단언); 동적 import 미추적(index.mjs:53)
- 문제: SPEC §4 측정 방법 "3D 관련 청크만(three·splat·렌더러)". 현재는 CSS·UI 패널·미니맵 코드까지 합산(서브에이전트 실측 status 폐포 234,451 B 중 math 청크 211,243 B). source 모드는 three.module.js 가 import 하는 three.core.js 를 빠뜨린다. 노트는 이 정의 이탈을 적지 않았다.
- 고칠 것: 3D 합계 지표를 따로 내고(CSS 제외, three·splat·렌더러 청크 식별 근거를 method 에), 폐포 합계는 참고값으로 유지. source 모드는 정적 import 폐포를 따라감. 동적 import(`import("…")`, vite mapDeps) 추적. 노트에 정의 이탈 기록. 실제 클론 두 번 빌드 gzip 동일 기록.
- 확인 기준: `bundle_status.3d.gzip_bytes` < 폐포 합계, CSS 0개. module.js→core.js import 모의 패키지에서 core.js 포함. 동적 import 청크 픽스처에서 포함.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 3D 합계 지표 분리·동적 import 추적(32fb645). 3D 식별은 휴리스틱, 실제 vite 산출물 미확인 → 2026-10-01 17:50 감독 확인 닫음: bundle_*.3d.* 지표 분리·CSS 제외·동적 import 추적 테스트 통과. 미해결 mapDeps·정규식 공백은 F-023

### F-019 [닫힘] (심각도: 중간) — 테스트가 실제 경로·실제 값을 검증하지 못하는 곳
- 위치: run_all.test.mjs:46,114,157 (모든 호출이 가짜 modulesDir); heap.test.mjs:49 (`RSS ≥ 100 MiB` — 빈 페이지도 약 700 MiB 라 항상 참); ref_images.test.mjs:240-249 (sha 다르면 골든 비교 조용히 생략); contracts/ply/ply.test.mjs (magic·format·알 수 없는 타입·vertex 0 property 0 거부 경로 미검증, contracts/ply/index.mjs:35 는 stride 0 이면 아무 N 이나 통과); tests/viewpoints_schema.test.mjs:28 (항상 참)
- 실패 상황: 실제 모듈의 inputs 키 이름을 바꿔도 npm test 녹색. RSS 를 루트 프로세스만 세는 회귀도 통과. `element vertex 1000000`·property 0 PLY 4개 → points_total 4,000,000.
- 고칠 것: modulesDir 없이 실제 8개 모듈을 합성 입력·미니 dist 로 도는 통합 테스트 1개. heap 은 빈 페이지 대비 증가분 ≥ 90 MiB. 골든 생략 시 진단 출력. PLY 거부 경로 음성 테스트와 stride 0·x/y/z 없음 거부. 실제 입력 테스트 환경변수를 `SKYLENS_DIR` 하나로 통일하고 README 에.
- 확인 기준: 실제 모듈 inputs 키 변경 변형 → 통합 테스트 실패. RSS 루트만 변형 → heap 테스트 실패. 위 PLY → throw.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 8개 모듈 통합 테스트·PLY 거부 경로·SKYLENS_DIR 통일(b26dfec, cda157c, d705374). 힙 증가분 단언은 50 MiB 로 낮춤(노트 기록) → 2026-10-01 17:50 감독 확인 닫음: tests/integration/run_all_real.test.mjs 가 실제 8개 모듈을 돌림, heap.test.mjs:55 증가분 ≥ 90 MiB, PLY 거부 경로 테스트, SKYLENS_DIR 통일. 남은 단언 공백은 F-024

### F-020 [닫힘] (심각도: 중간) — 빌드·실행 경로의 견고성 (원본 삭제, 타임아웃 없음)
- 위치: bench/baseline/_common/build.mjs:50,56 (work 가 src 를 포함하는 경우 미검사 후 `rm(work)`), :15-31 (spawn 타임아웃·프로세스 그룹 정리 없음); run_all/index.mjs 모듈 실행(모듈별 타임아웃 없음, 멈추면 records.json 미작성); tower_bytes/index.mjs:47,50 (building body 파싱 실패·status 4xx/5xx 를 0동으로 집계)
- 실패 상황(서브에이전트 재현, 감독은 코드 확인): `--out X --skylens-dir X/_build/sky` → 원본 트리 삭제. `buildCmd` 가 멈추면 run_all 무한 대기, 부모 종료 뒤 자식 잔존. `{kind:'building',status:500,body:'{"type":"FeatureColl'}` → building_count 0, 오류 없음.
- 고칠 것: realpath 기준 양방향 포함 검사, 단계별·모듈별 타임아웃(초과 시 failed{stage:'timeout'}), detached 그룹 kill. building 2xx 응답의 파싱 실패는 줄 번호 포함 throw, 비 2xx 는 별도 집계.
- 확인 기준: 위 세 입력 각각 throw/timeout 기록, 원본 파일 보존, `pgrep -x sleep` 비어 있음.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): 작업 경로 겹침 검사·타임아웃·building 파싱 실패 throw(7e6ae53, c109d81) → 2026-10-01 17:50 감독 확인 닫음: 타임아웃 시 프로세스 그룹 kill(손자까지 종료), 작업 경로 겹침 5종 차단·원본 보존, building 파싱 실패 throw(서브에이전트 재현, 감독은 코드·테스트 통과 확인). 남은 견고성은 F-026

### F-021 [닫힘] (심각도: 낮음) — 문서·분리·표기 잔손질
- 위치: README.md:24-26·57-59 (`--only`·`--skip`·`--entry-path`·종료코드·baseline_report `--summary`/`--status`·실제 입력 테스트 환경변수 누락, 한·영 둘 다); bench/baseline/ref_images/testing.mjs:4 (mulberry32 출처·라이선스 표기 없음 — 공개 도메인); 제품 코드 주석·테스트 이름에 연구 판정 어휘(T01.x·"미달"·"감독"·SPEC §) — tower_bytes.test.mjs:2,113-118, asset_bytes/index.mjs:3-5 등; PR #2 본문·노트 39행의 작업 방식 서술("서브에이전트 n개", "이 세션")은 결과 서술로 바꿈; 노트 5행 낡은 실행 명령; STATUS "건너뜀 4"(실제 6); 노트에 "56 B 자산에는 법선이 없고 opacity 는 신뢰도가 아님, step 수준은 Δd LOD 와 무관" 명시(T03·T04·T08 입력 결정 근거)
- 고칠 것: 위 항목 그대로.
- 확인 기준: cli 옵션(modules-dir 제외)·환경변수가 README 한·영 절에 모두 있음, testing.mjs 머리 출처 줄, 노트에 법선 없음 문구.
- 이력: 2026-10-01 13:50 감독 등록 (PR #2 반려) → 2026-10-01 작업자 처리(제품 93407d0, npm test 167건 통과 161·실패 0·건너뜀 6): README 한·영·mulberry32 출처·연구 어휘 제거(6d9266a, bbb2854) → 2026-10-01 17:50 감독 확인 닫음: README 한·영 절에 run_all 옵션·종료코드·baseline_report 옵션·SKYLENS_DIR 모두 있음, testing.mjs 머리 출처, 제품 파일에 연구 어휘 없음

### F-022 [닫힘] (심각도: 중간) — ws_bytes 가 추월된 낮은 수준의 뒤늦은 전송·같은 수준 중복을 정상 합산한다
- 위치: bench/baseline/ws_bytes/index.mjs:6(정책 주석), :73-93, :114-118; 테스트 ws_bytes.test.mjs:158-170 (feat/baseline 93407d0)
- 문제: 도착 순서를 보지 않고 수준 번호로 정렬만 한다. resend 표시 없는 같은 (구간, 수준) 은 분할 프레임으로 합산한다. skylens develop orchestrator.ts:217-226(R3) 는 추월된 수준을 버리므로 [수준3 → 수준1] 순서는 원칙 위반인데 측정이 이를 드러내지 않는다.
- 실패 상황: 구현이 누적 전송으로 퇴행해도 segment_total 만 늘고 오류·지표가 없다.
- 고칠 것: 구간별 도착 순서로 "이미 받은 최고 수준 이하가 resend 없이 다시 옴" 을 `ws_bytes.stale_levels` 로 센다. 분할 프레임은 다른 수준 프레임이 끼기 전 연속 구간만 인정. 미완 구간 판정은 ID 최대가 아니라 마지막 도착 구간 기준.
- 확인 기준: [3, 1(표시 없음)] 입력 → stale 1, [1, 3] → stale 0·skipped [2,3 중 해당], 연속 분할 프레임 → stale 0. 구간 ID 와 도착 순서가 다른 녹화에서 trailing 이 마지막 도착 구간.
- 추가(감독 직접 확인): 최고 수준이 4 로 고정(ws_bytes/index.mjs:15-16 `LEVELS=[0..3]`, `TOP_LEVEL=3`). skylens develop 코어 기본 사다리는 3수준이다(src/skylens_core/server/config.ts:97,134 `1000,7000,30000`, ladder.ts:41-42). 기본 설정 녹화는 마지막 구간이 다 받아도 항상 미완으로 빠지고, 5수준 이상 설정은 거부된다. 고칠 것: 완결 판정을 splat-chunk 의 `final` 필드(orchestrator.ts:343) 또는 입력 `topLevel` 로. 끝부분의 미완 구간이 여럿이면 모두 분리(R1 동시 실행 상한, orchestrator.ts:236-238). 원본 없는 재전송 여러 회차는 한 회차만 세고, 재전송만으로 생긴 공백은 levels_skipped 에서 뺀다(boards.ts:126-150). 확인 기준 추가: 3수준 녹화에서 0~2 를 다 받은 마지막 구간 → trailing null. 구간 1·2 가 수준 0 만, 구간 3 이 완결 → segments 는 구간 3 하나. 40 B 재전송 두 회차 → 40.
- 권장 모델: sonnet
- 이력: 2026-10-01 17:50 감독 등록 (서브에이전트 보고, 감독 코드 확인) → 2026-10-01 작업자 처리(제품 7b34620): stale_levels·도착순서·final/topLevel·재전송 한 회차 → 2026-10-01 18:20 감독 다시 엶(중간 유지): stale·[3,1]·[1,3]·분할·trailing 도착순·3수준 완결·재전송 두 회차는 통과. 미달: ① 끝이 아닌 미완 구간이 segments 에 남음 — 구간 1·2 수준0만, 구간 3 완결 입력 → segment_ids [1,2,3]·segments [10,10,18]·trailing [] (감독 직접 재현, ws_bytes/index.mjs:129-137). 고칠 것: 완결 아닌 구간은 위치와 무관하게 segments 에서 빼 incomplete_segments 로. ② 원본 없는 재전송 한 회차가 여러 프레임이면 첫 프레임만 셈(index.mjs:118, 20 B×2 두 회차 → 20). 고칠 것: 다른 수준이 끼기 전 연속 resend 프레임을 한 회차로 묶음. ③ stale 프레임 바이트가 segment 합·받은 수준에 들어감(index.mjs:100,113-119). 고칠 것: stale 은 total·windows·stale_bytes 에만. ④ final 필드 없는 녹화에서 topLevel 기본 2 를 조용히 씀(index.mjs:19) — 경고를 method 에. 확인 기준: ① segment_ids [3]; ② 20 B resend 4개(두 회차)+수준2 5 B → segments [45]·resend_bytes 40; ③ 수준2 뒤 수준0 → segment_levels 에 0 없음·skipped [1]; ④ method 에 topLevel 가정 문구. 권장 모델: sonnet → 2026-10-01 작업자 처리(제품 695cb6f, PR #3) → 2026-10-01 18:50 감독 다시 엶(중간 유지): ①·②·③·④ 확인 기준 통과(감독 서브에이전트 재현). 미달·퇴행: (가) 원본 없는 relay 재생 2회 [r(1,2,40), r(2,2,30), r(1,2,40), r(2,2,30)] → segments [80,60]·resend_bytes 0 (맞는 값 [40,30]·70, 감독 직접 재현, ws_bytes/index.mjs:101-104 회차 판정이 구간별 직전 프레임만 봄). 테스트 ws_bytes.test.mjs:181-184 가 [r40,r40]→[80] 으로 바뀌어 이전 기준(40)을 뒤집음. skylens boards.ts:127-140 replayFrames 는 재생 1회에 구간당 메시지 1개이므로 "resend 프레임 하나 = 한 회차, 단 녹화 전체에서 바로 앞 프레임이 같은 (구간,수준) resend 일 때만 이어 붙임" 으로 정한다(② 기준 [45]·40 유지). (나) [resend L1, 원본 L1] 에서 원본이 stale 로 셈(index.mjs:105-107) → stale 판정 hi 는 원본 프레임만으로. (다) 합계(total·구간·창) safe integer 검사 없음(:86·:170). (라) final 이 있으면 wsTopLevel 을 말없이 무시(:141·:221-224) → method 에 표기. 확인 기준: (가) 위 입력 → [40,30]·70, ② → [45]·40; (나) [r L1 7, L1 7, L2 1] → stale 0·resend 7·segments [8]; (다) 2^53-1 B 두 프레임 → 오류; (라) method 문구. 권장 모델: opus(같은 항목 두 번째 다시 엶) → 2026-10-01 19:10 감독 확인 닫음: (가) [40,30]·70, ② [45]·40, (나) stale 0·resend 7·[8], (다) safe integer 오류, (라) top_level_ignored·method 문구 직접 재현(제품 cb62409). 새로 찾은 resend 잔여는 F-042

### F-023 [닫힘] (심각도: 중간, 미확인) — 번들 폐포가 풀지 못한 mapDeps·동적 import 를 조용히 건너뛴다
- 위치: bench/baseline/bundle_status/closure.mjs:13(DYNAMIC_IMPORT 정규식), :47-55(resolveMapDep 후보 2개), :90·:96-98(못 풀면 continue), :18·:33-36(3D 판별 키워드) (feat/baseline 93407d0)
- 문제: 진입 HTML 이 dist 하위 디렉터리에 있으면 mapDeps 경로를 못 풀 수 있고 경고 없이 빠진다. `import("./c.js",{with:{}})`·백틱·`new URL(..., import.meta.url)` 미추적. 3D 판별 키워드(three/splat/gaussian)가 UI 문구에도 걸리고 `getContext(\`webgl2\`)`·webgpu 는 놓친다. 실제 develop vite dist 에서는 감독 미확인.
- 실패 상황: three 가 지연 청크에 있고 경로 해석이 실패하면 `bundle_*.3d.gzip_bytes` 가 과소로 나와 S4(≤ 300 KB)가 거짓 통과.
- 고칠 것: 진입 HTML 디렉터리 기준 후보 추가, 못 푼 참조 수를 method 에 기록(0 이 아니면 경고), 정규식 확장, 폐포 밖 dist *.js 목록을 manifest 에. 가능하면 sourcemap sources 의 node_modules/three·splat 경로로 3D 판별.
- 확인 기준: dist/res/static/status.html + dist/res/static/assets/three-a.js 픽스처에서 three-a.js 포함, 위 import 3형태 포함, develop 실제 dist 에서 미해결 0 기록.
- 권장 모델: sonnet
- 이력: 2026-10-01 17:50 감독 등록 (서브에이전트 임시 dist 재현, 감독은 코드만 확인) → 2026-10-01 작업자 처리(제품 7b34620): mapDeps·동적 import·URL 추적, 미해결 수 method·manifest 기록, 실제 dist 미해결 0 → 2026-10-01 18:20 감독 확인 닫음: 실제 dist 포함 bundle 테스트 통과, 미해결 참조 0. 3D 표지 과대 판별 잔여는 F-028

### F-024 [닫힘] (심각도: 중간) — 변형을 못 잡는 테스트 단언
- 위치: ws_bytes.test.mjs:131-148·:135; tower_bytes.test.mjs:45-52·:60-61·:125-128·:138; contracts/ply/ply.test.mjs:36-38; asset_bytes.test.mjs:131·:160-163; tools/baseline_report/report.test.mjs:11-16·:56-67 (feat/baseline 93407d0)
- 문제·실패 상황(서브에이전트 사본 변형으로 확인): ws_bytes index.mjs:118 의 `l < top` 제거·levels_skipped 를 마지막 표본으로 바꿈 → 통과. tower_bytes imagery_bytes 를 dem 합으로·total_bytes 0·익명 feature 0동 → 통과. ply index.mjs:34 element vertex 검사 제거 → 통과(`/vertex/` 정규식이 다른 오류에 맞음). asset_bytes `strides.size === 1` → `>= 1` → 통과. report 정렬·`|` 이스케이프 제거 → 통과.
- 고칠 것: 가운데 구간이 {0,1} 만 받는 녹화, 건너뜀 표본 [1,2](합 3), tower 지표 전부 손계산 단언·id 없는 feature·properties.id 경로, ply 오류 정규식을 `/element vertex missing/` 등으로 좁힘, stride 혼합 입력, report 순서 섞인 summary 와 `a|b` 오류. ws_bytes.test.mjs:58 의 `< 1000 ms` 시간 단언 제거.
- 확인 기준: 위 변형 각각에서 해당 테스트 실패.
- 추가(축 4b, 서브에이전트 사본 변형, 감독 미확인): closure.mjs `if (!isJs(rel)) return false;` 삭제 → bundle 테스트 통과(CSS 픽스처에 3D 표지 없음, bundle_status.test.mjs:91-100). 선택 inputs 키(`entryPath`·heap `canvasSelector`) 이름 변경 → 통과(run_all_real.test.mjs:99-106). run_all_real.test.mjs:25-32 chromium 경로 하드코딩, 없으면 기대 성공 수를 6 으로 낮춰 통과. build.test.mjs:121 `pgrep -x sleep` 이 무관한 sleep 에도 실패. ref_images index.mjs:311 drawn==0 검사 삭제 → 통과(test :357 정규식이 넓음). 분위 round→floor → 통과(점 101개). tests/viewpoints_schema.test.mjs:30 리터럴끼리 비교라 항상 참. heap.test.mjs:55 90 MiB 문턱 여유 약 8 MiB, 근거 주석 없음. 쓰이지 않는 상수 bundle_status.test.mjs:45, bundle_tower.test.mjs:42·:182. 확인 기준: 각 변형에서 테스트 실패, 무관 sleep 이 떠 있어도 build 테스트 통과.
- 권장 모델: sonnet
- 이력: 2026-10-01 17:50 감독 등록 → 2026-10-01 작업자 처리(제품 7b34620): 변형 사본 확인으로 각 테스트 보강 → 2026-10-01 18:20 감독 확인 닫음: 서브에이전트 사본 변형 12개 중 11개 잡힘(tower·ply·asset_bytes·report·closure·입력 키), ws_bytes 마지막 표본 변형 잡힘. 남은 구멍은 F-029

### F-025 [닫힘] (심각도: 낮음) — 노트·PR·주석의 표기 불일치
- 위치: 연구 experiments/baseline.md:52-62(옛 표 머리 "실측(현 코드)" 인데 5a7179a 값, T01.1·T01.2·T01.8 '충족'), :70(힙 보조 단언 "50 MiB 로 낮췄다" — 코드 heap.test.mjs:55 는 90 MiB), "레벨4"(:19·:61·:85, 계약은 수준 0..3 → 수준 3), 재작업 2차 절 "서브에이전트 11개"·"이 세션"(작업 방식 서술); 제품 PR #2 본문 "renderer_basis 이탈: 없음"(56 B/점·법선 없음이 이탈); bench/baseline/ref_images/index.mjs:8-9 "원점의 GeoAnchor"(실제 원점은 sceneFrame 정규화 중심) 와 fixtures/viewpoints/viewpoints.json:2,9; asset_bytes/index.mjs:18 27 B 근거(renderer_basis §7-4) 와 56 B 이탈 사유 주석 삭제됨
- 고칠 것: 옛 표 머리에 "5a7179a 기준, 대체됨" 표시, 힙 문구를 코드와 일치, "수준 3(step 07000)" 으로 통일, 작업 방식 서술은 결과 서술로, PR 본문 이탈 절에 56 B·법선 없음, 원점 설명을 한 가지로(GeoAnchor ENU 원점 아님), asset_bytes method 에 이탈 사유.
- 확인 기준: 노트에서 "레벨4" 0건, "50 MiB" 문구가 코드와 같음, PR 이탈 절이 노트와 일치.
- 권장 모델: haiku
- 이력: 2026-10-01 17:50 감독 등록 → 2026-10-01 작업자 처리(제품 7b34620): 노트 표기 정정(연구 4a684d1), asset_bytes 주석·method 복원 → 2026-10-01 18:20 감독 확인 닫음: 노트 표기·asset_bytes method 이탈 사유 복원 확인. ref_images method 이탈 사유 누락은 F-031

### F-026 [닫힘] (심각도: 중간) — 실행 경로 견고성 잔여 (타임아웃 뒤 모듈 계속 실행, 성공 시 자식 잔존, 지표 이름 충돌)
- 위치: bench/baseline/run_all/index.mjs:94-117(Promise.race 만, 취소 없음); _common/build.mjs:26·:50-51(성공 종료 시 killGroup 없음, SIGINT/SIGTERM 정리 없음); ws_bytes/index.mjs:60·:66(`byKind = {}` 에 `__proto__`), :199(kind 정규화 충돌 `a-b`/`a_b`); tower_bytes/index.mjs:172-174(status "500" 문자열을 성공으로), :198-200(객체 id `[object Object]` 병합); ref_images/index.mjs:185·:247(NaN 좌표가 clip 통과, f_dc NaN 색 조용히 대체) (feat/baseline 93407d0)
- 실패 상황(서브에이전트 재현): 타임아웃된 모듈이 다음 모듈과 동시에 돌며 outDir 에 계속 씀 → first_frame·heap 수치 오염. 빌드가 백그라운드 자식을 남기고 성공하면 고아 잔존. `a-b`·`a_b` → 같은 metric 중복 레코드. `__proto__` kind 5 B 가 by_kind 에서 사라짐.
- 고칠 것: 모듈에 AbortSignal 전달 또는 모듈별 자식 프로세스, 성공 시에도 그룹 kill, 시그널 핸들러, `Map`/`Object.create(null)`, 정규화 충돌 throw, status 정수 검증, 객체 id 는 JSON 키, 비유한 좌표·색 throw 또는 제외 수 보고.
- 확인 기준: 각 재현 입력에서 오류 또는 올바른 값, 타임아웃 후 해당 모듈 파일 쓰기 없음, `pgrep -x sleep` 비어 있음.
- 권장 모델: sonnet
- 이력: 2026-10-01 17:50 감독 등록 → 2026-10-01 작업자 처리(제품 7b34620): 모듈별 자식 프로세스, 성공 시 그룹 kill, 시그널 정리, __proto__·충돌·status·객체 id·NaN → 2026-10-01 18:20 감독 확인 닫음: 정규화 충돌·__proto__·status·객체 id·NaN 재현 입력 모두 오류 또는 올바른 값(서브에이전트 재현). 부모 SIGKILL 시 worker 잔존은 F-030

### F-027 [열림] (심각도: 중간, 미확인) — 실데이터 위아래·앱 로더 대조가 확인되지 않았다 (앱 쪽 질문 포함)
- 위치: bench/baseline/ref_images/ref_images.test.mjs:251-297(appDerive 이식본끼리 비교), :312(지면<지붕은 합성만); fixtures/viewpoints/viewpoints.json sceneFrame.rotate "none" (feat/baseline 7b34620)
- 문제: ① 감독 실측 — develop res/static/demo/step07000_light.ply 를 회전 없이 보면 y 1~99 % 핵심의 아래 1/3 에 17.4 %, 위 1/3 에 49.2 % 가 있다(step00250: 10.1 % / 65.6 %). level_scene.py:40-61 은 "조밀한 쪽이 아래" 로 굽는다고 적었으나 굽기 전 orig/ 는 42.7 % / 39.3 % 다. 앱도 이 파일을 회전 없이 그리므로(sceneSource.ts:342-356) 기준 영상은 앱과 같다. 그러나 앱 자산이 뒤집혔는지는 판정되지 않았다. ② 앱은 .ply 를 SplatLoader.loadFromURL 로 읽는다(sceneSource.ts:298-306). 1e-6 비교는 이식본끼리라 실제 앱 로더 출력의 s·P 와 대조되지 않았다(서브에이전트 보고, 감독 미확인).
- 실패 상황: 앱 자산이 뒤집혀 있으면 기준 영상도 뒤집힌 채로 고정되어 이후 B 렌더 SSIM 비교가 잘못된 장면을 정답으로 삼는다.
- 고칠 것: 실 PLY 로 지면·지붕 높이 분포를 노트에 기록하고 "앱과 같은 방향" 임을 명시. 앱 로더 대조는 [local] 브라우저 실측으로(앱이 실제 구한 s·P 를 콘솔로 받아 비교). 앱 자산 방향이 틀렸다고 판단되면 사람에게 올린다(제품 범위 밖).
- 확인 기준: 노트에 실 PLY 아래/위 1/3 비율과 판정, [local] 실측 s·P 와 이식 결과 차 ≤ 1e-6 또는 차이 원인 기록.
- 권장 모델: opus
- 이력: 2026-10-01 18:20 감독 등록(서브에이전트 보고, ① 감독 직접 측정)

### F-028 [닫힘] (심각도: 중간) — 측정 도구 성능·측정 왜곡 잔여
- 위치: ref_images/index.mjs:350(파일 전체 readFile), :208-209·:222·:274-275(점당 복사 3회), :132·:281-283(점마다 객체); heap/index.mjs:210·:221(statm RSS 합, 페이지 4096 고정); _common/browser.mjs:434-453(감지용 preserveDrawingBuffer·매 프레임 readback); bundle_status/closure.mjs:22(MARKER_3D `[Ss]plat`·`\bthree\b`)
- 문제: 큰 PLY(2 GiB 초과)는 읽기 실패, 수백만 점에서 수 GB 사용. RSS 합은 공유 페이지 중복. 감지 스크립트가 측정 대상 GPU 부하를 늘림. 3D 표지가 앱 문자열에도 걸릴 수 있음. 현재 데모 자산(46만 점)에서는 문제 없음(서브에이전트 보고, 감독은 줄만 확인).
- 고칠 것: 청크 읽기·subarray, smaps_rollup Pss, 시스템 페이지 크기, readback 1회, 3D 판별은 sourcemap 우선·폐포 밖 JS 경고를 method 에.
- 확인 기준: 1천만 점 합성 PLY 완료·피크 RSS ≤ 파일 크기×1.3, heap method 에 PSS, 앱 코드만 있는 청크가 3D 로 분류되지 않는 픽스처 테스트.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:20 감독 등록(축 6 높음 보고를 데모 자산 범위 밖이라 중간으로 낮춤) → 2026-10-01 작업자 처리(제품 84e91e4·b76a964·539572c, PR #3) → 2026-10-01 18:50 감독 확인 닫음: 1천만 점 56 B PLY run 완료, 피크 RSS 402 MiB ≤ 파일×1.3(694 MiB), heap method PSS, 앱 코드만 있는 청크 비3D(서브에이전트 재현, 감독 테스트 통과 확인). 자동 단언 부재 등 잔여는 F-032·F-033

### F-029 [닫힘] (심각도: 중간) — 변형을 못 잡는 테스트 잔여
- 위치: ref_images.test.mjs:277-278(의사난수 곱이 2^53 초과로 표본 값 중복 → 분위 round→floor 변형 생존); ref_images/index.mjs:364(drawn==0 검사가 assertCoverage 에 가려진 죽은 코드); tests/viewpoints_schema.test.mjs:27-34(리터럴 전체 일치·:34 상수끼리 비교, coord 를 "GeoAnchor ENU, 1 unit = 1 m" 로 바꿔도 통과); tools/baseline_report/index.mjs:18(toTable `|` 이스케이프 제거 생존); _common/build.test.mjs:136(install 타임아웃 테스트가 일반 sleep·잔존 확인 없음)
- 실패 상황: 각 변형에서 전 테스트 통과(서브에이전트 사본 재현).
- 고칠 것: Math.imul 기반 생성기와 소수부 ≥ 0.5·이웃 값 상이 단언, 죽은 검사 제거 또는 메시지 단언, 의미 단위 단언과 오도 문구 음성 사례, toTable `a|b` 행 단언, 고유 이름 sleep·pgrep 비어 있음.
- 확인 기준: 위 변형 각각에서 테스트 실패, 문구만 바꾼 coord 는 통과.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:20 감독 등록 → 2026-10-01 작업자 처리(제품 84e91e4·ee06c13, PR #3) → 2026-10-01 18:50 감독 확인 닫음: 분위 floor·옛 LCG·이스케이프 제거·빈 필터 변형 모두 테스트가 잡음(서브에이전트 사본 변형 시험). 새로 생존한 변형은 F-034

### F-030 [닫힘] (심각도: 중간) — 실행 경로 견고성 잔여
- 위치: run_all/worker.mjs:158(disconnect 미처리), run_all/index.mjs:47; ref_images/index.mjs:324-330·:371(vp.id·name 미검증); run_all/cli.mjs:10·index.mjs:105(`--only ,`); ws_bytes/index.mjs:31(bytes safe integer 미검사); tower_bytes/index.mjs:322-325(id 1 과 '1' 병합, 문자열 feature 1동)
- 실패 상황(서브에이전트 재현): 부모 kill -KILL/-HUP 뒤 worker 가 남아 outDir 에 계속 씀. name `x/../../escaped` → outDir 밖 파일, id·name 중복 → 덮어쓰기 통과, null 시점 → TypeError. `--only ,` → 전체 실행. bytes 1e300 통과.
- 고칠 것: worker `process.on('disconnect', ...)`, 부모 SIGHUP, id 정수 고유·name `/^[\w-]+$/`, 빈 필터 오류(종료코드 2), Number.isSafeInteger, id 타입 구분.
- 확인 기준: 부모 KILL 뒤 1 s 안에 worker 없음, 위 입력 각각 오류 또는 올바른 집계.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:20 감독 등록 → 2026-10-01 작업자 처리(제품 ee06c13·84e91e4·c02c901·695cb6f, PR #3) → 2026-10-01 18:50 감독 확인 닫음: 부모 KILL/HUP/TERM 뒤 1 s 안 worker 종료, name 탈출·id/name 중복·null 시점 오류, `--only ,` 종료코드 2, bytes 1e300 오류, id 1/"1" 구분. 동기 루프 중 KILL 잔존은 F-035

### F-031 [닫힘] (심각도: 낮음) — 표기·출처 잔손질
- 위치: ref_images/index.mjs:34-37·:357-359(56 B·법선 없음 이탈 사유가 method·주석에 없음, SPEC "원본 27 B 점군" 과 다름); ref_images/index.mjs:6·:17·:150·:168(skylens sceneSource.ts 알고리즘 참조 — 같은 팀 MIT 저장소, 재구현이나 출처·라이선스 한 줄 표기 권장); heap.test.mjs:55 주석 "여유 약 8 MiB"(실측 98.5~107.0 MiB 범위로); 연구 노트 재작업 3차 절에 제품 해시 7b34620 없음; 관제탑 `#control-view` 첫 프레임 미검증(실제 dist 30 s 미감지)
- 고칠 것: method 에 "renderer_basis §7-4 27 B 와 다름: 56 B 스플랫, 법선 없음, 중심점만 사용", 파일 머리에 "skylens(MIT) sceneSource.ts deriveFromSplat 알고리즘 재구현", 주석·노트 정정, control-view 는 원인 기록 또는 [local] 로.
- 확인 기준: ref_images 테스트가 method `/§7-4/`·`/법선/` 단언, 노트에 해시.
- 권장 모델: haiku
- 이력: 2026-10-01 18:20 감독 등록 → 2026-10-01 작업자 처리(제품 84e91e4·b76a964, PR #3) → 2026-10-01 18:50 감독 확인 닫음: method `/§7-4/`·`/법선/` 단언, 머리 출처 표기, 노트 해시. 표기가 rgb 분기에도 붙는 문제는 F-032

### F-032 [닫힘] (심각도: 중간) — ref_images 표기·검사 잔여 (27 B 입력에도 "56 B 스플랫, 법선 없음", 대형 PLY 테스트에 RSS 단언 없음)
- 위치: bench/baseline/ref_images/index.mjs:451(BASIS_NOTE), :477-478, :256·:344(헤더 1 MiB 자르기), 약 :484(assertCoverage); ref_images.test.mjs:438-443, :646-650, :673-696 (제품 d662be1)
- 문제: ① BASIS_NOTE 가 스플랫 분기와 uchar rgb 분기에 똑같이 붙는다. §7-4 의 27 B dense.ply(법선 있음)를 넣어도 method 가 "56 B 스플랫, 법선 없음" 이 되고, 실제로는 법선을 읽지 않고 버린다는 사실은 적히지 않는다. 248 B 스플랫도 "56 B" 로 적힌다. ② 테스트의 run() 입력은 모두 56 B 스플랫이라 rgb 분기와 청크 경로의 rgb 오프셋이 검증되지 않는다(:646 이름은 "rgb 배치 포함" 인데 본문은 스플랫만). ③ 대형 PLY 테스트는 기본 건너뜀이고 켜도 count 만 단언한다(:695). "피크 RSS ≤ 파일×1.3" 은 수동 1회 측정이다. 15 B rgb PLY 는 decode 만으로 1.32×, run 전체 2.4× 로 문구가 형식에 따라 틀린다(서브에이전트 측정). ④ decodePly(버퍼 전체)도 헤더를 1 MiB 로 잘라 정상 PLY 를 "end_header not found" 로 거부한다. ⑤ 점 0개·전부 NaN 입력이 "점유율 0.000 %" 로만 실패해 원인이 가려진다.
- 실패 상황: dense.ply(27 B) → method "56 B 스플랫, 법선 없음"(사실과 반대). 청크 읽기를 readFile 전체 읽기로 되돌려도 테스트 통과.
- 고칠 것: 표기를 분기별로(스플랫: `${stride} B 스플랫, 법선 없음` / rgb: 헤더에 nx 있으면 "법선 있음·무시", 없으면 "법선 없음"). rgb(법선 있음·없음)·double 좌표·패딩 속성 PLY 로 run()·청크 비교 테스트. 대형 테스트에 자식 프로세스 피크 RSS 단언(형식별 상한을 노트에 적은 값으로). decodePly 는 자르지 않고 decodePlyFile 만 "헤더 1 MiB 상한 초과" 문구. 점 0개면 원본·비유한·clip 제외 수를 담은 오류.
- 확인 기준: 27 B 합성 PLY run → method 에 "27" 과 "법선 … 무시", "56 B" 없음. 청크 읽기→전체 읽기 변형에서 대형 테스트 실패(REF_IMAGES_BIG_POINTS=10000000). 1 MiB 넘는 헤더 PLY 에서 decodePly 성공·decodePlyFile 상한 문구. 점 0개 PLY → 제외 사유 문구.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(축 2·1a·5·6·7 보고, 감독이 :451·:673-696 직접 확인. 축 5 는 ③ 을 높음으로 올렸으나 F-028 확인 기준은 감독 재현으로 충족돼 중간) → 2026-10-01 19:10 감독 확인 닫음: npm test 의 27/15/38 B·스플랫 표기·헤더 상한·점 0개 사유 테스트 통과, REF_IMAGES_BIG_POINTS=10000000 대형 2건 직접 실행 통과(56 B 증가 124.9 MiB, 15 B 120.1 MiB, 상한 196.5 MiB). 표기 잔여는 F-045

### F-033 [닫힘] (심각도: 중간) — heap 테스트가 보고값이 아닌 표본 최솟값으로 판정하고, 지표 의미가 RSS→PSS 로 바뀌었는데 이름이 같다
- 위치: bench/baseline/heap/heap.test.mjs:56-62(Math.min 끼리 차), :60 주석("3회 중앙값"); heap/index.mjs:14·:124(지표 이름 heap.process_rss, 값은 PSS 중앙값, run 간 pssProcs min·rssProcs max), :67-69·:79 (제품 d662be1)
- 문제: 문턱 90 MiB 는 그대로지만 판정 통계가 중앙값 차 → 최솟값 차로 바뀌었다. 보고되는 value 는 여전히 중앙값이다. 주석은 "PSS 합이 두 수준(약 80 MiB 차)으로 갈린다" 고 하지만 감독 서브에이전트 12세트 실측에서 재현되지 않았고, 최솟값은 매번 첫 회차(워밍업)였다. 연구 노트의 "52~88 MiB 관측" 과 주석의 "99~106 MiB" 근거가 정리되지 않았다. 지표 이름이 같아 이전 RSS 기준선과 비교하면 오해한다. PSS·RSS 폴백이 섞인 표본, 0 프로세스(0 B 기록)도 막지 않는다.
- 실패 상황: 두 수준 현상이 실제로 있으면 blank 만 하위 표본을 가질 때 약 10 MiB 상주로도 통과할 수 있다(주석 근거 추론, 미재현). 0 프로세스 → "PSS 사용 … 0개 프로세스", 값 0.
- 고칠 것: 워밍업 1회를 버리고 보고값(value)끼리 비교. 두 수준 현상은 재현 조건을 노트에 기록하거나 주석에서 뺀다. 지표 이름을 heap.process_pss 로 바꾸거나 보고서에 단절 표기. 방식이 섞이면 경고, 0 프로세스면 기록하지 않음.
- 확인 기준: heap 브라우저 테스트가 value 차 ≥ 90 MiB 로 10회 연속 통과, 상주 제거 변형 실패. memoryMethodText({pssProcs:0,rssProcs:0}) 계열 입력이 기록 생략.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(축 4b·5·1b 보고, 감독이 heap.test.mjs diff 직접 확인. 기준 숫자는 낮추지 않았으므로 중간) → 2026-10-01 19:10 감독 확인 닫음: 지표 heap.process_pss, memoryMethodText({pssProcs:0,rssProcs:0}) → null 직접 확인, heap 테스트 npm test 통과. 주석 잔여는 F-045

### F-034 [닫힘] (심각도: 중간) — 변형을 못 잡는 테스트 잔여 (깨진 sourcemap 폴백, 배열 feature, value 만 비교)
- 위치: bench/baseline/bundle_status/bundle_status.test.mjs:84-85, bundle_tower/bundle_tower.test.mjs:85-87(깨진 맵이 짝 JS 없는 unrelated-C.js.map 으로 옮겨져 아무것도 검사하지 않음, deepEqual → value 만); tower_bytes/tower_bytes.test.mjs:206-215·index.mjs:70; _common/browser.test.mjs:116(`/queueMicrotask/` 소스 문자열 단언); run_all/run_all.test.mjs:306(/proc 의존인데 linux 가드 없음); 제품 테스트 이름·주석의 F-xxx 번호(연구 어휘) (제품 d662be1)
- 실패 상황(서브에이전트 사본 재현): 깨진 맵·`sources: []` 맵을 "앱" 으로 판정하는 변형 → 26/26 통과. `Array.isArray(f)` 제외 제거 → 19/19 통과.
- 고칠 것: 표지가 있는 폐포 JS 옆에 깨진 맵과 `{"sources":[]}` 맵을 두고 basis 'heuristic'·is_3d true 단언. method 를 뺀 나머지 필드 비교 + method 는 원래 문구 + 경고. `features: [[1], {id:1}]` → 1. 소스 문자열 단언은 동작 음성 테스트로. linux 가드. 테스트 이름·주석의 F-xxx 를 동작 설명으로.
- 확인 기준: 위 두 변형 각각에서 테스트 실패. `grep -rn 'F-0[0-9][0-9]' bench tests tools` 0건.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(축 4b·11 보고) → 2026-10-01 19:10 감독 확인 닫음: `grep -rn 'F-0[0-9][0-9]' bench tests tools contracts` 0건, 깨진 맵·배열 feature 테스트 추가 확인(축 4b). closure.mjs 정규식 퇴행은 F-044

### F-035 [닫힘] (심각도: 중간) — run_all 실행 경로 견고성 잔여 (동기 루프 중 부모 KILL, 전부 건너뜀 성공)
- 위치: bench/baseline/run_all/worker.mjs:11-14(disconnect 이벤트에만 의존), run_all/index.mjs:93-96·:120-125, cli.mjs:67-70 (제품 d662be1)
- 실패 상황(서브에이전트 재현 /tmp 스크립트): 모듈이 동기 루프로 이벤트 루프를 막는 중 부모 kill -KILL → worker 가 살아 outDir 에 계속 씀. `--skip <8개 전부>` → 종료코드 0, 레코드 0, 빈 records.json. `runAll({only: []})` → 전체 실행.
- 고칠 것: worker 를 별도 감시(Worker thread 에서 부모 PID 확인 후 process.kill(-pid,'SIGKILL'), 또는 PDEATHSIG 래퍼). 어렵다면 한계를 README·method 에 적는다. 실행 대상 0개면 종료코드 2. API 의 only:[] 거부.
- 확인 기준: 동기 루프 모듈 + 부모 KILL 뒤 3 s 안에 worker 없음(또는 문서화된 한계). 전부 건너뜀 → 종료코드 2. runAll({only:[]}) throw.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(축 7 보고, 감독 미재현 — worker.mjs:11-14 코드만 확인) → 2026-10-01 19:10 감독 확인 닫음: runAll({only:[]}) throw 직접 확인, 부모 SIGKILL 뒤 worker 약 1 s 안에 종료(축 7 재현), 0 대상 종료코드 2(코드 확인)

### F-036 [닫힘] (심각도: 낮음) — 측정 도구 부하·표기 잔여
- 위치: bench/baseline/_common/browser.mjs 약 :209-240(첫 프레임 감지 뒤에도 상태 래퍼 11개가 계속 호출마다 해시 갱신), 첫 프레임 전 100 ms 마다 drawImage+getImageData(GPU 동기화 비용이 first_frame 에 들어갈 수 있음, method 미표기); bundle_status/closure.mjs:22·:~55(.map 전체 JSON.parse, `Matrix4` 문구만으로 3D 판정); ref_images/index.mjs:239·:336-337(결과가 큰 버퍼의 subarray) (제품 d662be1)
- 고칠 것: 감지 뒤 원본 함수로 복원 또는 즉시 위임, method 에 감지 비용 표기, 필요하면 sources 만 추출, subarray 는 주석으로 `.buffer` 직접 사용 금지 표기.
- 확인 기준: 감지 뒤 래퍼 위임 단위 테스트, method 문구.
- 권장 모델: haiku
- 이력: 2026-10-01 18:50 감독 등록(축 6·7·1a·1b 보고, 미확인) → 2026-10-01 19:10 감독 다시 엶(낮음 유지): 래퍼 복원 코드는 들어갔으나 wrapper_delegate.test.mjs 는 script.includes 소스 문자열 단언 9개뿐이라 동작 테스트가 아니다(감독 직접 확인). 축 4b 사본에서 browser.mjs:198 복원을 끈 변형이 19/19 통과. 고칠 것: chromium 페이지에서 첫 프레임 감지 뒤 drawArrays.__ffOrig === undefined 등 동작 단언, 문자열 단언 삭제, browser.test.mjs:123-124 거의 항상 참인 단언 삭제. 확인 기준: 복원 끈 변형에서 실패. getContext 미복원은 F-045, 정규식 퇴행은 F-044. 권장 모델: sonnet → 2026-10-01 작업자 처리(제품 7cd47b0, T01.24): wrapper_delegate 를 chromium 동작 단언으로 교체(복원 두 줄 변형 실패), 거의 항상 참인 단언 삭제 → 2026-10-01 19:25 감독 확인 닫음: 사본에서 browser.mjs:200(WebGL 복원) 삭제 변형 → wrapper_delegate 1 실패·건너뜀 0(감독 직접), getContext 복원 삭제 변형도 실패(축 4b). 문자열 단언 0건

### F-037 [닫힘] (심각도: 높음) — T02 사실 오류: FFmpeg 의 NVENC 는 nonfree 가 아니다
- 위치: 연구 experiment/stack 3d9038a experiments/stack/encoder.md:28, :9; license.md:31; decision.md:19, :169(H1), :182
- 문제: encoder.md:28 은 "FFmpeg 는 LGPL 구성에서도 `--enable-nonfree` 를 요구" 라고 적었다. FFmpeg configure(master)에서 nvenc 는 `nvenc_deps="ffnvcodec"` 이고 nonfree 목록(EXTERNAL_LIBRARY_NONFREE_LIST: decklink·libfdk_aac·libmpeghdec, HWACCEL_LIBRARY_NONFREE_LIST: cuda_nvcc·cuda_sdk)에 없다(감독 직접 확인: https://raw.githubusercontent.com/FFmpeg/FFmpeg/master/configure). nv-codec-headers 는 MIT.
- 실패 상황: 2단계 인코더 결정과 사람에게 올리는 쟁점 H1 이 틀린 전제에서 출발한다.
- 고칠 것: encoder.md:28 정정, license.md:31 에 configure·nv-codec-headers 링크, decision.md 의 nonfree 쟁점 삭제. 사람에게 남길 것은 NVIDIA 드라이버/SDK 약관만.
- 확인 기준: `git grep -n 'nonfree' origin/experiment/stack -- experiments/stack` 에서 "NVENC 가 nonfree 요구" 문구 0건, 세 파일에 링크.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(T02 검토 서브에이전트 보고, 감독이 configure 직접 확인) → 2026-10-01 19:10 감독 확인 닫음: encoder.md:28·license.md:31 정정·configure·nv-codec-headers 링크, 'NVENC 가 nonfree 요구' 0건(연구 46bd36a)

### F-038 [닫힘] (심각도: 높음) — T02 클라이언트 추천이 Q1(입력 형식) 결정에 기대는데 확정처럼 적혀 있다
- 위치: experiments/stack/decision.md:17(클라이언트 행 "GaussianSplats3D 제거", three Points), :20(포맷 행만 Q1 에 묶음), :128; client.md:45 (연구 3d9038a)
- 문제: 추천은 입력이 법선 있는 27 B 점이라는 가정 위에 있다. T01 은 실제 자산이 56 B 가우시안·법선 없음임을 확인했다(baseline 노트, F-031). 입력이 가우시안으로 정해지면 three Points 경로와 S9 기준 영상 비교가 맞지 않는다.
- 고칠 것: decision.md 클라이언트 행과 §3 SPEC §8 제안에 "Q1 결정 전 잠정. 가우시안이면 스플랫 렌더 경로를 재평가" 를 적고, 두 경우의 번들·화질 영향 한 줄씩.
- 확인 기준: decision.md:17·:128 에 Q1 조건 명시.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(감독이 decision.md:17·:20 직접 확인) → 2026-10-01 19:10 감독 확인 닫음: decision.md:17·:128 에 Q1 조건·두 경우 영향 명시

### F-039 [닫힘] (심각도: 높음) — T02 자산 처리 서버 '(나) 별도 프로세스' 가 RULES §1.4 경계 변경인데 "변경 없음" 으로 적혔다
- 위치: experiments/stack/decision.md:86, integration.md:93·:98·:101·:105; RULES.md:25-27 (연구 3d9038a)
- 문제: RULES §1.4 는 컴포넌트 추가·데이터 흐름 변경을 경계 변경으로 보고 사람에게 올리게 한다. 새 프로세스·새 포트·모델→자산서버→클라이언트 흐름이 생기는데 integration.md:105 는 "구성 목록 보충" 으로 보고 변경에서 뺐다.
- 고칠 것: integration.md 결론을 "경계 변경 후보 — 사람 결정 필요(Q6)" 로 고치고, 대안 (가) 코어 `server/` 안 모듈·포트 추가 없음 을 같은 깊이로 비교. decision.md Q6 의 결정 주체를 사람으로.
- 확인 기준: integration.md:101 결론과 decision.md Q6 "누가" 칸이 RULES §1.4 문구와 일치.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(감독이 decision.md:86·RULES.md:25-27 직접 확인) → 2026-10-01 19:10 감독 확인 닫음: integration.md:9·:101 '경계 변경 후보 — 사람 결정 필요(Q6)', decision.md Q6 결정 주체 사람. decision.md:85 의 옛 문구 잔여는 F-045

### F-040 [닫힘] (심각도: 중간) — T02 잔여 (Q2 전송 경로, 300 KB 상한 추정, 라이선스 점검 누락, 벤치 소스 미보존)
- 위치: decision.md:86·:153(splat-chunk.url HTTP 경로 vs SPEC §7 ws 단일·S6 정의), client.md:21·:27(번들 하한만), license.md:22-42(ogl·twgl·esbuild·playwright 누락, playwright 버전 1.56.1 vs 1.63.0 불일치), runtime.md:57(벤치 소스 scratchpad 에만), stack.md:121-134(빈칸), decision.md:136·:179(SwiftShader 인자 불일치), encoder.md:36(NVENC 16 ms 출처 조건 미상) (연구 3d9038a)
- 고칠 것: Q2 선택지별 SPEC 영향 정리(HTTP 면 S6 정의 변경은 사람 확인), 상한 시나리오 한 줄, 1단계 스택 전이 의존성 라이선스 실측 목록, 벤치 소스를 노트 부록에, 빈칸은 "해당 없음/미확인", SwiftShader 인자 명시.
- 확인 기준: license.md 표에 행 추가·GPL/AGPL 0건, runtime.md 재현 절이 저장소 자료만으로 실행됨.
- 권장 모델: sonnet
- 이력: 2026-10-01 18:50 감독 등록(T02 검토 서브에이전트 보고, 미확인) → 2026-10-01 19:10 감독 확인 닫음: license.md 에 ogl·twgl·esbuild·playwright 행(GPL/AGPL 0), runtime.md 부록 A 재작성본(동일성 미확인 표기), 빈칸 미확인 표기

### F-041 [닫힘] (심각도: 중간) — ws_bytes·ref_images·viewpoints 테스트가 못 잡는 변형 (이번 PR 의 스칼라 재작성·stale 처리 포함)
- 위치: bench/baseline/ref_images/index.mjs:141(x 이동항 t[0]), :229(축별 clip), :324-326(uchar rgb), :469(run 이 decodePlyFile 사용); ws_bytes/index.mjs:112-115(stale 프레임이 도착 순서에 끼지 않음), :155(incomplete 도착순 정렬), :257(ws_bytes.stale_bytes 레코드); tests/viewpoints_schema.test.mjs:28-29·:44(coordProblems) (제품 d662be1)
- 실패 상황(서브에이전트 사본 변형 시험, 38개 중 생존): `+ t[0]`→`- t[0]` 42/42 통과(픽스처 시점 8곳 모두 t[0]=0). red↔blue 채널 교환 통과. y 축 clip 제거·경계 `>`/`<` 통과(clip 테스트가 NaN 만 넣음). stale 분기에 `s.order = i` 추가 통과([1:0,1:1,1:2,2:0,1:0 stale] 에서 trailing_segment_bytes 8→0). incomplete 를 ID 순 정렬 통과. stale_bytes 레코드 삭제 통과. run 을 readFile 전체 읽기로 되돌려도 통과. viewpoints note 를 "1 unit 은 1 m 이다" 로 바꿔도 통과, "원점은 GeoAnchor ENU 원점이며 … 아니다" 가 부정어 30자 창에 걸려 문제 없음으로 판정.
- 고칠 것: 비대칭 시점(eye [5,3,10], target [2,1,0])에서 rasterize 를 worldToCamera→projectCamera 결과와 대조. uchar rgb PLY 의 colors 를 알려진 값과 비교(decodePly·decodePlyFile 여러 chunkRecords). 축마다 한 축만 밖인 유한 점·경계 위 점으로 count·clipped 단언. 위 stale 입력으로 trailing 단언, ID≠도착순 미완 구간 순서 단언, runText 출력의 stale_bytes 레코드 단언, run 의 읽기 경로 고정. coordProblems 정규식을 절 단위로 좁히거나 핵심 문장 고정을 되살리고 위 문구를 음성 사례로.
- 확인 기준: 위 변형 각각에서 테스트 실패(감독이 사본에서 재실행).
- 권장 모델: opus(투영 대조 테스트 포함)
- 이력: 2026-10-01 18:52 감독 등록(축 4a 보고. 코드 자체는 축 1a 가 옛 경로와 비트 단위 일치를 재현했으므로 중간) → 2026-10-01 19:10 감독 확인 닫음: 사본에서 index.mjs:141 `+ t[0]`→`- t[0]` 변형 시 ref_images 테스트 1건 실패 직접 확인. rgb·clip·stale·incomplete·읽기 경로 테스트 추가 확인. 외부 매개변수(cameraExtrinsics) 변형 생존은 F-043

### F-042 [닫힘] (심각도: 중간) — ws_bytes 재전송 잔여 (추월된 낮은 수준의 resend 를 받은 수준으로 셈, resend 만으로 완결 판정)
- 위치: bench/baseline/ws_bytes/index.mjs:110(resend 프레임도 s.final 설정), :139-143(effective 가 원본 없는 수준의 첫 resend 회차를 받은 수준으로), :147-150(complete 가 resend 전용 수준도 봄), :116(resend 가 같은 수준 원본의 분할 연속을 끊지 않음), :101-102(연속 resend 는 무조건 한 회차) (제품 cb62409)
- 문제: 원본 최고 수준(hi)보다 낮은 수준이 resend 로만 오면 정상 수신으로 합산한다. 원본 낮은 수준은 stale 로 빼면서 resend 낮은 수준은 넣는 비대칭이다(RULES §1.1 추월 건너뛰기). 원본이 하나도 없이 resend 프레임만 final 로 오면 구간을 완결로 보고한다.
- 실패 상황(감독 직접 재현): [수준2 원본 final 10 B, 수준0 resend 99 B] → segments [109]·segment_levels [[1,3]]·skipped [[2]] (맞는 값 [10]·[[3]]·[[1,2]], 99 B 는 resend 또는 stale). [수준2 resend final 99 B] 하나 → segments [99]·incomplete [] (원본 미도착인데 완결). 서브에이전트 보고(감독 미재현): [L1 7, rL1 7, L1 7, L2 1] → [15]·stale 0. 구간 하나뿐인 relay 를 두 번 재생한 [r40, r40] → [80]·resend 0(녹화만으로 분할과 구분 불가).
- 고칠 것: resend 전용 수준이 그 구간 원본 hi 보다 낮으면 합·받은 수준에서 빼 resend_bytes 로, skipped 에 넣는다. 완결 판정은 원본 프레임의 final·수준만으로(resend 전용 구간은 incomplete 또는 resend_only_segments). resend 프레임 뒤의 같은 수준 원본은 분할 연속을 끊는다(s.last = -1). [r40, r40] 모호성은 method 에 적는다.
- 확인 기준: 위 첫 입력 → segments [10]·levels [[3]]·skipped [[1,2]]·resend_bytes 99. 둘째 입력 → segment_ids []·incomplete 1개. [L1 7, rL1 7, L1 7, L2 1] → [8]·stale 1·stale_bytes 7. 기존 F-022 (가)~(라) 값 유지.
- 권장 모델: opus (같은 도구가 F-022 로 세 번 다시 열렸다)
- 이력: 2026-10-01 19:10 감독 등록(축 3·1b 보고, 감독이 앞 두 입력 직접 재현). 신규 항목 → 2026-10-01 작업자 처리(제품 7cd47b0, T01.21): 확인 기준 값 전부와 F-022 (가)~(라) 테스트 통과. 판단 요청: final 필드 없는 녹화의 resend 전용 구간은 F-022 (가) 때문에 집계하고 resend_only_segments 로 표시(노트 참조) → 2026-10-01 19:25 감독 확인 닫음: 확인 기준 세 입력 직접 재현([10]·[[3]]·resend 99 / ids []·incomplete 1 / [8]·stale 1·7 B), F-022 (가)~(라) 테스트 통과. 판단 요청 답: final 필드 없는 녹화의 resend 전용 구간 집계+resend_only_segments·method 표기를 승인(녹화만으로 구분 불가, 표기로 정직하게 드러남). 남은 추월 비대칭은 F-047

### F-043 [닫힘] (심각도: 중간) — 비대칭 시점 테스트가 같은 cameraExtrinsics 로 정답을 만들어 외부 매개변수 오류를 못 잡는다
- 위치: bench/baseline/ref_images/ref_images.test.mjs:734-759(기대값 :752 가 :741 의 같은 R·t 사용), :598 역투영 왕복도 같은 R·t; 구현 index.mjs:62-79(cameraExtrinsics) (제품 cb62409)
- 문제: 테스트는 rasterize 의 스칼라 전개와 worldToCamera→projectCamera 가 같은지만 본다. R·t 를 만드는 단계의 오류는 양쪽에 같이 들어가 통과한다. 픽스처 시점 8곳은 t[0]=0 이라 골든도 못 잡는다.
- 실패 상황(감독 사본 직접 재현): index.mjs:74 `-(xc[0]*eye[0]+…)` → `+(…)` 변형에서 ref_images 테스트 52 통과·0 실패. 비대칭 시점에서 target 이 주점 (W/2,H/2) 에서 벗어나도 통과.
- 고칠 것: R·t 와 무관한 정답 단언 추가: target 투영이 (W/2,H/2) 에서 1e-9 안, x_c 방향으로 1·시선 방향 d 인 점의 u = cx + f/d(손계산), 또는 손으로 계산한 픽셀 좌표 상수. 주석 :734-736 을 실제 범위로 고친다.
- 확인 기준: 위 t[0] 부호 변형과 t[1] 부호 변형 각각에서 테스트 실패(감독이 사본에서 재실행).
- 권장 모델: opus
- 이력: 2026-10-01 19:10 감독 등록(축 1a·4a 보고, 감독 직접 재현). 신규 항목 → 2026-10-01 작업자 처리(제품 7cd47b0, T01.22): 손계산 정답 추가, t[0]·t[1] 부호 변형 각각 실패 확인 → 2026-10-01 19:25 감독 확인 닫음: 사본 index.mjs:74 t[0] 부호 변형 1 실패, :75 t[1] 부호 변형 6 실패(감독 직접). 축 1a 재검산 u=179.553·v=114.134 일치

### F-044 [닫힘] (심각도: 중간) — closure.mjs 의 sources 정규식이 경로 안 `]` 에서 끊겨 sourcemap 판정이 퇴행했다
- 위치: bench/baseline/bundle_status/closure.mjs:57(`/"sources"\s*:\s*\[([^\]]*)\]/`) (제품 cb62409, 이번 PR 에서 추가)
- 문제: JSON.parse 전체 대신 정규식으로 sources 를 잘라 내면서 문자열 안의 `]` 를 배열 끝으로 본다. 파일 전체는 여전히 readFileSync 로 읽으므로 비용 절감도 거의 없다.
- 실패 상황(축 7 재현, 감독은 코드로 확인): sources `["webpack:///./pages/[id].js","node_modules/three/build/three.module.js"]` → mapEvidence null(이전 main 은 sourcemap-3d). 코드 표지 휴리스틱으로 떨어져 bundle_*.3d 분류가 틀릴 수 있다(S4).
- 고칠 것: JSON.parse(mapText).sources 로 되돌리거나 문자열을 인식하는 스캐너. `]` 포함 경로 회귀 테스트.
- 확인 기준: 위 입력에서 sourcemap-3d, bundle_status·bundle_tower 테스트 통과.
- 권장 모델: sonnet
- 이력: 2026-10-01 19:10 감독 등록(축 6·7 보고, 감독 closure.mjs:55-57 직접 확인). 신규 항목 → 2026-10-01 작업자 처리(제품 7cd47b0, T01.23): JSON.parse 복귀·`]` 경로 회귀 테스트 → 2026-10-01 19:25 감독 확인 닫음: closure.mjs 를 main 의 정규식 판으로 되돌린 사본에서 bundle_status 1 실패(감독 직접)

### F-045 [닫힘] (심각도: 낮음) — 표기·주석·문서 잔여
- 위치·문제:
  ① ref_images/index.mjs:473 basisNote 가 stride 27 만 보고 "27 B 와 같은 크기 … x y z·uchar rgb" 로 적는다(double 좌표 27 B 도 같은 문구). :281 법선 형(uchar 법선)을 표기하지 않는다.
  ② heap/heap.test.mjs:57 "약 80 MiB 씩 수준이 바뀐다" 를 사실처럼 씀(노트는 미검증 추정), :60 "표본 최솟값 기준"·:61 "5회 중앙값" 이 실제 판정(:59 value 차)과 다르다.
  ③ 연구 experiments/baseline-fixes-2.md:11·:29 에 RSS 상한 산식(15n×1.15+32 MiB)·계수 근거·기준 교체(파일×1.3 → 산식) 사유와 건너뜀 12건 내역(대형 2건은 REF_IMAGES_BIG_POINTS 별도 실행)이 없다. 대형 RSS 테스트는 기본 npm test 에서 건너뛴다.
  ④ _common/browser.mjs:191-199 감지 뒤 getContext 래퍼는 복원하지 않는다.
  ⑤ ref_images.test.mjs:815 `buf.length - (buf.length - idx - 11)` = `idx + 11`.
  ⑥ 연구 experiments/stack/decision.md:85 "COMPONENTS 경계 변경 없음 — 그 노트의 결론" 이 integration.md 의 새 결론(경계 변경 후보, Q6)과 어긋난다.
- 실패 상황: 문구만 보고 형식·통계·경계 판단을 잘못 읽는다.
- 고칠 것: 각 문구를 실제 동작에 맞춘다. ③ 은 노트에 산식·내역, 가능하면 작은 n 의 상대 기준 RSS 테스트를 기본 실행에.
- 확인 기준: double 좌표 27 B 의 method 에 "double", heap 주석 통계 용어 = :59 판정, 노트 상한 숫자 = 테스트 산식, decision.md:85 가 Q6 을 가리킴.
- 권장 모델: haiku
- 이력: 2026-10-01 19:10 감독 등록(축 2·4a·5·6 보고, 근거 줄 확인). 신규 항목 → 2026-10-01 작업자 처리(제품 7cd47b0, 연구 decision.md 정정·노트 보충): ①~⑥ 반영. ③ 작은 n 상대 기준 RSS 기본 테스트는 하지 못함 → 2026-10-01 19:25 감독 확인 닫음: ①double27 표기 테스트, ②heap 주석, ③노트 산식 = ref_images.test.mjs:716 산식(축 12), ④getContext 복원, ⑤idx+11, ⑥decision.md:85 가 Q6 을 가리킴(experiment/stack 9b4e3ad) 확인. ③의 작은 n 기본 RSS 테스트는 미실시로 남김(필수 아님)

### F-046 [닫힘] (심각도: 중간) — heap 0 프로세스 run 테스트가 방어 줄에 닿지 않는다
- 위치: bench/baseline/heap/heap.test.mjs:116-120(이름은 run 인데 processTreeMemory 만 부르고 index.mjs:56 root===null 에서 끝남), 브라우저 불필요한데 브라우저 없음 사유로 건너뜀 (제품 cb62409)
- 문제: `if (pssProcs + rssProcs === 0) return null` 방어 줄을 지운 변형이 통과한다(축 4b 사본 재현, 감독은 테스트 본문 직접 확인).
- 실패 상황: 방어가 사라져도 0 B 레코드가 다시 나올 수 있는데 테스트는 통과.
- 고칠 것: smaps·statm 을 못 읽는 프로세스를 주입할 수 있게 하고 run 레코드에 heap.process_pss 가 없음을 단언. 건너뜀 조건 제거.
- 확인 기준: 방어 줄 삭제 변형에서 실패.
- 권장 모델: sonnet
- 이력: 2026-10-01 19:10 감독 등록(축 4b 보고). 신규 항목 → 2026-10-01 작업자 처리(제품 7cd47b0, T01.24): /proc 주입·run 테스트·건너뜀 조건 제거, 방어 줄 삭제 변형 실패 → 2026-10-01 19:25 감독 확인 닫음: 사본 heap/index.mjs:71 방어 줄 삭제 변형에서 heap.test.mjs 1 실패(감독 직접)

### F-047 [닫힘] (심각도: 중간) — ws_bytes: resend 로만 받은 높은 수준이 뒤에 온 낮은 resend 를 추월시키지 않고, 새 분기 일부를 테스트가 못 잡는다
- 위치: bench/baseline/ws_bytes/index.mjs:126(`overtaken: f.level < s.hi`, s.hi 는 원본 최고 수준만), :128(`s.last = -1`), :179(resend_only_segments every), :285-288(method 표기); ws_bytes.test.mjs:534-605 (제품 feat/baseline-fixes-3 7cd47b0)
- 문제: ① 원본 없는 수준의 첫 resend 회차는 받은 수준이 되는데(:163-169) 추월 기준 s.hi 는 원본만 올린다. 그래서 같은 도착 순서라도 높은 수준이 원본이냐 resend 냐에 따라 결과가 다르다(RULES §1.1 추월 건너뛰기 비대칭). ② 테스트 변형 생존(축 4a, 사본 실행): overtaken 기준을 s.last 로 바꿈, s.last=-1 을 같은 수준일 때만으로 좁힘, resend_only_segments 의 every→some, run 의 onlyDone segment_ids 필터 삭제, 모호성 문구를 창별 method 에도 붙임.
- 실패 상황(감독 직접 재현 ①): summarize([rL2 40, rL0 5]) → segments [45]·levels [[1,3]]·resend_bytes 0. 같은 순서에서 L2 가 원본이면 [40]·[[3]]·resend 5. ② 입력 예: [L2 10, rL1 5, rL0 7] → 정답 [10]·skipped [[1,2]]·resend 12; [L1 7, rL2 3, L1 7, L2 1] → stale 1·[8]; [L0 4, rL2 9] → resend_only_segments []; [구간1 L2 10 final, 구간2 rL2 9] run → segment_total.method 에 "resend 전용" 없음.
- 고칠 것: 받은 수준 최고(원본 + 추월되지 않은 첫 resend 회차)를 따로 두고 resend 회차의 overtaken 을 그 값과 비교. skipped 의 top 도 같은 기준인지 주석과 함께 정한다. ②의 입력들을 테스트로 추가.
- 확인 기준: [rL2 40, rL0 5] → [40]·[[3]]·resend 5. [L0 1, rL3 40, rL1 5](topLevel 3) → levels [[1,4]]·resend 5. 위 ② 의 다섯 변형이 각각 테스트 실패. F-042 확인 기준·F-022 (가)~(라) 유지.
- 권장 모델: opus (같은 도구가 F-022·F-042 로 거듭 열렸다)
- 이력: 2026-10-01 19:25 감독 등록(축 1b·4a 보고, ① 감독 직접 재현, ② 축 4a 사본 실행 — 감독 미재현). 신규 항목 → 2026-10-01 작업자 처리(제품 2ac92b2, T01.26): 확인 기준 값과 변형 5개 전용 테스트 통과, F-042·F-022 유지. skipped top 은 원본 기준 유지(노트 참조) → 2026-10-01 19:55 감독 확인 닫음: 확인 기준 두 입력([rL2 40, rL0 5] → [40]·[[3]]·resend 5, [L0 1, rL3 40, rL1 5] → [[1,4]]·resend 5)과 F-042 세 입력 감독 직접 재현. 사본에서 추월 기준을 s.hi 로 되돌림 → 2 실패(감독 직접), 다섯 변형 각각 1~3 실패(축 4a 사본 실행). skipped top 원본 기준 유지 판단은 승인(미도착분 메우기 금지와 맞음). 원본 프레임 쪽 남은 비대칭은 F-051

### F-048 [닫힘] (심각도: 낮음) — 측정 도구·노트 잔손질
- 위치·문제:
  ① heap/index.mjs:69 statm 폴백에 유한 검사 없음. smaps_rollup 못 읽고 statm 이 깨졌으면 NaN 이 합산되고 rssProcs++ 로 :71 방어를 통과(축 7 재현, 감독은 코드로 확인. 실제 /proc 에서는 생기기 어려움).
  ② wrapper_delegate.test.mjs withPage·heap.test.mjs fakeProc/runWithProc 가 mkdtemp 디렉터리를 지우지 않음(실행마다 쌓임).
  ③ ref_images/index.mjs:484 basisNote "같은 형식" 판정이 속성 순서(x y z → nx ny nz → r g b, renderer_basis §7-4)를 보지 않음.
  ④ bundle_status/closure.mjs:53-60 큰 .map 전체 JSON.parse — 문자열 한계 초과 시 조용히 heuristic 으로 떨어지는데 method 에 표기 없음.
  ⑤ 연구 experiments/baseline-fixes-3.md 의 건너뜀 12건 분류 개수(실제 트리·SKYLENS_DIR 10, 대형 RSS 2) 미기재. baseline-fixes-2.md 에 붙인 T01H 보충 절의 "측정 결과" 문구는 상한 근거 측정이라고 출처(어느 실행)를 밝힌다.
  ⑥ 실험 브랜치에서 STATUS.md 를 고침(살아 있는 문서는 main 에만). 이번 연구 PR #5 에는 STATUS 변경이 research 에 섞인다.
- 실패 상황: ① NaN 통계, ② tmp 누적, ③ 순서가 다른 27 B 를 기준 형식이라 표기, ④ 판정 근거 오독, ⑤⑥ 기록 혼동.
- 고칠 것: ① Number.isFinite 아니면 그 프로세스 건너뜀 ② try/finally rm ③ 오프셋 조건 추가 ④ 실패 시 method 에 사유 ⑤ 숫자 보충 ⑥ 실험 브랜치에서 STATUS.md 를 고치지 않는다.
- 확인 기준: ① statm "1 abc" 주입 → null 또는 그 프로세스 제외, 테스트가 Number.isFinite 단언 ② 테스트 전후 tmp 항목 수 동일 ③ 순서 바꾼 27 B 픽스처에서 "같은 형식" 아님 ④ 문구 ⑤ 노트 숫자.
- 권장 모델: haiku (① 은 sonnet)
- 이력: 2026-10-01 19:25 감독 등록(축 2·4b·6·7·11·12·3 보고, 근거 줄 확인). 신규 항목 → 2026-10-01 작업자 처리(제품 2ac92b2, T01.27·T01.28·직접): ①~⑤ 처리, ⑥ 은 실험 브랜치에서 STATUS 미수정. closure 변경으로 bundle_tower 테스트 기대 basis 를 파싱 오류 표기로 갱신(노트 참조) → 2026-10-01 19:55 감독 확인 닫음: ① 사본에서 heap/index.mjs:71 isFinite 줄 삭제 → heap 1 실패(감독 직접). ③ 순서 바꾼 27 B 다섯 경우 모두 '같은 형식' 아님(축 1b 실행). ④ badjson-6 테스트로 basis·method 표기. ⑤ baseline-fixes-3.md:20 분류 10·2 기재. ⑥ 연구 diff 에 STATUS.md 없음. bundle_status 의 HTML 맵 입력 삭제·노트 수치 출처는 F-052

### F-049 [열림] (심각도: 중간) — ws_bytes final 판정 잔여 (stale 원본의 final 이 완결을 만들고, resend 프레임의 final 이 final 모드를 켠다)
- 위치: bench/baseline/ws_bytes/index.mjs:117(`if (f.final !== undefined) anyFinal = true` — resend 프레임 포함), :130(`if (f.final === true) s.final = true` 가 :131 stale 판정보다 먼저), :168·:281-283(resend_merged_rounds 를 미완 구간까지 셈) (제품 main 612eeae)
- 문제: 완결은 "받은 원본 final" 로만 판정한다는 F-042 결정과 어긋나는 두 경로. ① 추월돼 집계에서 빠지는 stale 원본의 final 이 구간을 완결시킨다. ② final 필드가 resend 프레임에만 있는 녹화는 final 모드가 켜져 원본 구간이 전부 미완이 된다. ③ 미완 구간의 이어 붙인 resend 회차도 segment_total.method 에 "한 회차의 분할로 합산" 으로 적힌다.
- 실패 상황(감독 직접 재현, summarize): ① [L1 5, L0 3 final:true] → segment_ids [1]·segments [5]·stale 1 (맞는 값: incomplete 1개). ② [L0 1, L1 2, L2 4, 구간2 rL2 4 final:true] → segment_ids []·incomplete [1,2] (final 필드 없으면 구간 1 완결 [7]). ③ [r(1,2,40,final), r(1,2,40,final), (2,2,3,final)] → segments [3]·구간 1 미완인데 resend_merged_rounds 1.
- 고칠 것: :130 을 stale 이 아닐 때만 s.final 을 켜도록 옮긴다. anyFinal 은 원본 프레임에서만 켠다(또는 원본에 final 이 없고 resend 에만 있는 녹화를 형식 오류로 거부하고 method 에 적는다). mergedRounds 는 완결 구간 회차만 센다.
- 확인 기준: ① 입력 → segment_ids []·incomplete 1개. ② 입력 → segments [7](또는 명시적 형식 오류). ③ 입력 → resend_merged_rounds 0, method 에 "분할로 합산" 없음. F-022 (가)~(라)·F-042·F-047 확인 기준 유지.
- 권장 모델: opus (같은 도구가 F-022·F-042·F-047 로 거듭 열렸다)
- 이력: 2026-10-01 19:40 감독 등록(PR #5 중복 감독 실행의 축 1b 보고, 세 입력 모두 감독 직접 재현). 신규 항목. 19:24 실행의 F-047 과 겹치지 않음

### F-050 [열림] (심각도: 낮음) — 테스트 공백·측정 도구 잔여 (PR #5 중복 감독 실행 보충)
- 위치·문제:
  ① ref_images/index.mjs:260 CANON_TYPE 별칭(float32·uint8) 테스트 없음 — 정규화 제거 변형 생존(축 4a 사본 실행). :484 normalType 비교를 `!== 'uchar'` 로 바꾼 변형 생존(float 좌표 + int 법선 27 B 디코드 사례 없음). :486 형 정보 없을 때 "x y z undefined" 를 내는 변형 생존(테스트는 '같은 형식' 부재만 봄). F-048 ③(순서) 과 함께 고친다.
  ② ws_bytes/index.mjs:168 mergedRounds 를 프레임 수−1 로 세는 변형 생존(테스트가 2프레임 회차뿐). [r40, r40, r40] → 1회차 단언 없음.
  ③ _common/wrapper_delegate.test.mjs:11-13 chromium 이 없으면 3건 모두 건너뛰고 exit 0. 브라우저 없이 감지 스크립트 문법을 보던 browser.test.mjs 의 `new Function(buildDetectScript('#c'))` 테스트가 이번에 지워져(F-036 지시의 "거의 항상 참인 단언" 삭제와 함께), 브라우저 없는 환경에서는 감지 스크립트 문법 오류도 통과한다(축 4b 재현).
  ④ bundle_status/closure.mjs:58 UTF-8 BOM 으로 시작하는 .map 은 JSON.parse 실패 → 조용히 heuristic (축 7 재현, 감독 코드 확인).
  ⑤ ws_bytes/index.mjs:285 `segment_ids.includes` 로 O(R·S) (축 6). _common/browser.mjs 상태 메서드 래퍼에 감지 뒤 조기 반환 없음(페이지가 래퍼 참조를 캐시한 경우 감지 뒤에도 해시 비용).
  ⑥ ref_images.test.mjs:762 주석 "u = 120.893…" 실제 120.89497…. 연구 baseline-fixes-2.md T01H 보충의 "이전 기준 파일×1.3" 서술이 2차 노트 본문(이미 출력 버퍼 상한 196.5 MiB)과 시점이 어긋남 — 기준이 바뀐 커밋을 적는다.
- 실패 상황: 각 변형이 테스트를 통과하거나(①②③), 판정 근거가 조용히 바뀐다(④).
- 고칠 것: ① 원시 헤더 `property float32 x`…`uint8 red` 27 B → "같은 형식"·"float32" 없음, N('float','int') 27 B → "같은 형식" 아님, 직접 호출 형 없음 → /undefined/ 없음. ② 3프레임 회차 단언. ③ 브라우저 없이 `new Function(buildDetectScript(sel))` 문법 테스트를 되살리되 단언은 doesNotThrow 하나로(문자열 typeof 단언은 넣지 않음). ④ BOM 제거 뒤 파싱. ⑤ Set 사용, 상태 래퍼 첫 줄 `if (window.__ffMs !== undefined) return orig.apply(this, a)`. ⑥ 주석·노트 정정.
- 확인 기준: ①②의 각 변형에서 테스트 실패(감독이 사본에서 재실행). ③ PLAYWRIGHT_BROWSERS_PATH=/nonexistent 에서 감지 스크립트 문법 오류 변형이 exit≠0. ④ BOM .map → sourcemap-3d/app.
- 권장 모델: sonnet (⑥ 은 haiku)
- 이력: 2026-10-01 19:40 감독 등록(중복 감독 실행 축 1a·4a·4b·5·6·7 보고; ③ ④ 는 감독이 diff·코드 줄 확인, ①② 는 축 4a 사본 실행 — 감독 미재현). 신규 항목

### F-051 [열림] (심각도: 중간) — ws_bytes: resend 로만 받은 높은 수준 뒤에 온 낮은 수준 원본 프레임이 stale 로 처리되지 않는다
- 위치: bench/baseline/ws_bytes/index.mjs:137(`isStale = f.level < s.hi || …`, s.hi 는 원본만), :124-126 주석("높은 수준이 원본이든 재전송이든") (제품 feat/baseline-fixes-4 2ac92b2)
- 문제: F-047 로 resend 회차의 추월은 rhi(받은 수준 최고) 기준이 됐지만 원본 프레임의 추월은 여전히 원본 최고 수준 hi 만 본다. 같은 도착 순서라도 높은 수준이 원본이냐 resend 냐에 따라 낮은 수준 원본이 버려지거나 합산된다(RULES §1.1 추월 건너뛰기·누적 금지 비대칭).
- 실패 상황(감독 직접 재현): summarize([rL2 40, L0 5]) → segments [45]·levels [[1,3]]·stale 0. L2 가 원본이면 [L2 40, L0 5] → [40]·stale 1. 축 3 도 같은 입력으로 보고.
- 고칠 것: 원본 프레임의 isStale 에 `f.level < s.rhi` 를 쓰고, 같은 수준 분할 연속 판정(s.last)은 지금 규칙을 유지한다. 의도적으로 남길 비대칭이면 근거를 주석과 decisions/ 에 적는다.
- 확인 기준: [rL2 40, L0 5] → [40]·[[3]]·stale 1·stale_bytes 5. 사본에서 isStale 을 s.hi 로 되돌리면 테스트 실패. F-022 (가)~(라)·F-042·F-047 확인 기준 유지.
- 권장 모델: opus (같은 도구가 F-022·F-042·F-047 로 거듭 열렸다)
- 이력: 2026-10-01 19:55 감독 등록(축 3 보고, 감독 직접 재현). 신규 항목(F-047 수정 뒤 원본 쪽에 남은 비대칭)

### F-052 [열림] (심각도: 낮음) — PR #6 잔여: 테스트 입력 삭제·파싱 오류 범위·노트 수치 출처
- 위치·문제:
  ① bundle_status/bundle_status.test.mjs:301 `plain-4.js.map` 의 `'<html>404</html>'` 입력을 지우고 "맵 없음" 으로 바꿨다. HTML 맵을 다루는 입력이 이 파일에서 사라졌고 노트(baseline-fixes-4.md:20)는 bundle_tower 변경만 적었다(축 5, 감독 diff 확인).
  ② bundle_status/closure.mjs:61-63 내부 try 가 `JSON.parse(mapText).sources` 전체를 감싸 `.map` 내용이 `null` 이면 TypeError 를 "JSON 파싱 실패" 로 기록한다(감독 코드 확인).
  ③ closure.mjs:86 basisSummary: 근거가 전부 parse-error 이면 heuristic 0 이라 "(no usable sourcemap; heuristic may misclassify)" 경고가 빠지지만 판정은 코드 표지다(감독 코드 확인).
  ④ heap/index.mjs:70-71 statm "1 -5" → bytes −20480(축 7 보고, 감독 미재현).
  ⑤ ref_images/index.mjs:296-297 propertyOrderCorrect 의 앞 항은 뒤 항에 포함되는 중복. basisNote 주석에 순서 조건 없음.
  ⑥ 연구 baseline-fixes-2.md:36 에 새로 단 출처 "T01.18a 대형 RSS 별도 실행" 의 수치(124.9·120.1 MiB)가 같은 파일 :11 T01.18a 행(123.9·117.7 MiB)과 다르다(감독 확인).
  ⑧ heap/heap.test.mjs:182 `assert.ok(m === null || …)` 는 바로 앞 `assert.equal(m, null)` 뒤라 항상 참. 또 깨진 statm 프로세스가 하나뿐이라 `continue` 를 `return null`(트리 전체 버림)로 바꾼 변형이 생존(축 4b 사본 실행, 감독은 줄 확인).
  ⑨ bundle_tower/bundle_tower.test.mjs:277 주석에 FEEDBACK 번호(F-048 ④)가 다시 들어감(T01.20 에서 제품 테스트의 F-xxx 번호를 지웠다). bundle_tower 는 method 의 parse error 요약을 단언하지 않아 basisSummary 변형 2개가 이 파일에서 생존(축 4b).
  ⑦ 제품 커밋 3aa5fcc 메시지에 서브에이전트 임시 작업 트리 브랜치 이름(worktree-agent-…)이 남았다. 금지 문구는 아니지만 다음부터 병합 메시지를 직접 쓴다.
- 실패 상황: ① HTML 맵 회귀를 못 잡음 ②③ 판정 근거 오독 ④ 음수 메모리 ⑥ 기록 혼동.
- 고칠 것: ① HTML 맵 입력을 되살려 `startsWith('sourcemap-parse-error:')` 단언, 맵 없음은 별도 입력 ② try 는 JSON.parse 만, `.sources` 는 `parsed?.sources` ③ 경고 조건에 parseError 포함 ④ `rss >= 0` 함께 검사 ⑤ 한 항으로 줄이고 주석 보충 ⑥ 실제 출처 실행을 적거나 수치를 맞춘다 ⑧ 항상 참 단언 삭제, 정상 statm 프로세스 하나 + 깨진 하나 → rssProcs 1·bytes 유한 ⑨ 번호 삭제, `assert.match(method, /2 sourcemap parse error\(s\)/)` ⑦ 작업 트리 브랜치 병합 시 `git merge -m '<영어 설명>'`.
- 확인 기준: ① HTML 맵 단언 존재 ② `null` 맵 → null(heuristic) ③ 깨진 맵 하나만 있을 때 method 에 경고 문구 ④ statm "1 -5" 주입 → null ⑥ 노트 두 줄 수치 일치 또는 출처 구분 ⑧ `continue`→`return null` 변형에서 heap 테스트 실패 ⑨ `grep -rn 'F-0[0-9][0-9]' bench tests tools` 0건, parse error 요약 삭제 변형에서 bundle_tower 실패. ① 의 HTML 맵 단언은 parse-error 분기 is_3d 를 항상 true 로 바꾼 변형에서 bundle_status 도 실패해야 한다.
- 권장 모델: sonnet (⑥⑦⑨ 의 번호 삭제는 haiku)
- 이력: 2026-10-01 19:55 감독 등록(축 1b·4b·5·6+7·9 보고; ①②③⑥⑧⑨ 감독 줄 확인, ④ 와 변형 생존은 서브에이전트 사본 실행 — 감독 미재현). 신규 항목
