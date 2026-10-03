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

### F-049 [닫힘] (심각도: 중간) — ws_bytes final 판정 잔여 (stale 원본의 final 이 완결을 만들고, resend 프레임의 final 이 final 모드를 켠다)
- 위치: bench/baseline/ws_bytes/index.mjs:117(`if (f.final !== undefined) anyFinal = true` — resend 프레임 포함), :130(`if (f.final === true) s.final = true` 가 :131 stale 판정보다 먼저), :168·:281-283(resend_merged_rounds 를 미완 구간까지 셈) (제품 main 612eeae)
- 문제: 완결은 "받은 원본 final" 로만 판정한다는 F-042 결정과 어긋나는 두 경로. ① 추월돼 집계에서 빠지는 stale 원본의 final 이 구간을 완결시킨다. ② final 필드가 resend 프레임에만 있는 녹화는 final 모드가 켜져 원본 구간이 전부 미완이 된다. ③ 미완 구간의 이어 붙인 resend 회차도 segment_total.method 에 "한 회차의 분할로 합산" 으로 적힌다.
- 실패 상황(감독 직접 재현, summarize): ① [L1 5, L0 3 final:true] → segment_ids [1]·segments [5]·stale 1 (맞는 값: incomplete 1개). ② [L0 1, L1 2, L2 4, 구간2 rL2 4 final:true] → segment_ids []·incomplete [1,2] (final 필드 없으면 구간 1 완결 [7]). ③ [r(1,2,40,final), r(1,2,40,final), (2,2,3,final)] → segments [3]·구간 1 미완인데 resend_merged_rounds 1.
- 고칠 것: :130 을 stale 이 아닐 때만 s.final 을 켜도록 옮긴다. anyFinal 은 원본 프레임에서만 켠다(또는 원본에 final 이 없고 resend 에만 있는 녹화를 형식 오류로 거부하고 method 에 적는다). mergedRounds 는 완결 구간 회차만 센다.
- 확인 기준: ① 입력 → segment_ids []·incomplete 1개. ② 입력 → segments [7](또는 명시적 형식 오류). ③ 입력 → resend_merged_rounds 0, method 에 "분할로 합산" 없음. F-022 (가)~(라)·F-042·F-047 확인 기준 유지.
- 권장 모델: opus (같은 도구가 F-022·F-042·F-047 로 거듭 열렸다)
- 이력: 2026-10-01 19:40 감독 등록(PR #5 중복 감독 실행의 축 1b 보고, 세 입력 모두 감독 직접 재현). 신규 항목. 19:24 실행의 F-047 과 겹치지 않음
  → 2026-10-01 작업자 처리(제품 091b901, T01J): 확인 기준 직접 돌려 통과. 노트 experiments/baseline-fixes-5.md
  → 2026-10-01 23:21 감독 확인 닫음: ① [L1 5, L0 3 final] → ids []·incomplete 1개, ② → segments [7], ③ → resend_merged_rounds 0·incomplete 1(감독 직접 재현). F-042 세 입력·F-047 두 입력 유지. 변형 stale final 무시 제거·anyFinal resend 켬·미완 회차 셈 각각 1 실패(축 4a 사본 실행). 끊긴 같은 최고 수준 final 이 버려지는 짝 문제는 F-053

### F-050 [닫힘] (심각도: 낮음) — 테스트 공백·측정 도구 잔여 (PR #5 중복 감독 실행 보충)
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
  → 2026-10-01 작업자 처리(제품 091b901, T01J): 확인 기준 직접 돌려 통과. 노트 experiments/baseline-fixes-5.md
  → 2026-10-01 23:21 감독 확인 닫음: ① CANON_TYPE 별칭·int 법선 테스트 존재(ref_images.test.mjs:939-959, 축 2·1b 확인). ② 3프레임 회차 변형(프레임수−1) 1 실패(축 4a). ③ PLAYWRIGHT_BROWSERS_PATH=/nonexistent 에서 감지 스크립트 문법 오류 변형 → browser.test 1 실패(감독 직접). ④ BOM .map → sourcemap 판정(축 1b node 실행). ⑤⑥ 줄 확인

### F-051 [닫힘] (심각도: 중간) — ws_bytes: resend 로만 받은 높은 수준 뒤에 온 낮은 수준 원본 프레임이 stale 로 처리되지 않는다
- 위치: bench/baseline/ws_bytes/index.mjs:137(`isStale = f.level < s.hi || …`, s.hi 는 원본만), :124-126 주석("높은 수준이 원본이든 재전송이든") (제품 feat/baseline-fixes-4 2ac92b2)
- 문제: F-047 로 resend 회차의 추월은 rhi(받은 수준 최고) 기준이 됐지만 원본 프레임의 추월은 여전히 원본 최고 수준 hi 만 본다. 같은 도착 순서라도 높은 수준이 원본이냐 resend 냐에 따라 낮은 수준 원본이 버려지거나 합산된다(RULES §1.1 추월 건너뛰기·누적 금지 비대칭).
- 실패 상황(감독 직접 재현): summarize([rL2 40, L0 5]) → segments [45]·levels [[1,3]]·stale 0. L2 가 원본이면 [L2 40, L0 5] → [40]·stale 1. 축 3 도 같은 입력으로 보고.
- 고칠 것: 원본 프레임의 isStale 에 `f.level < s.rhi` 를 쓰고, 같은 수준 분할 연속 판정(s.last)은 지금 규칙을 유지한다. 의도적으로 남길 비대칭이면 근거를 주석과 decisions/ 에 적는다.
- 확인 기준: [rL2 40, L0 5] → [40]·[[3]]·stale 1·stale_bytes 5. 사본에서 isStale 을 s.hi 로 되돌리면 테스트 실패. F-022 (가)~(라)·F-042·F-047 확인 기준 유지.
- 권장 모델: opus (같은 도구가 F-022·F-042·F-047 로 거듭 열렸다)
- 이력: 2026-10-01 19:55 감독 등록(축 3 보고, 감독 직접 재현). 신규 항목(F-047 수정 뒤 원본 쪽에 남은 비대칭)
  → 2026-10-01 작업자 처리(제품 091b901, T01J): 확인 기준 직접 돌려 통과. 노트 experiments/baseline-fixes-5.md
  → 2026-10-01 23:21 감독 확인 닫음: [rL2 40, L0 5] → [40]·[[3]]·stale 1·stale_bytes 5 감독 직접 재현. 사본에서 :146 을 s.hi 로 되돌림 → ws_bytes 2 실패(감독 직접)

### F-052 [닫힘] (심각도: 낮음) — PR #6 잔여: 테스트 입력 삭제·파싱 오류 범위·노트 수치 출처
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
  → 2026-10-01 작업자 처리(제품 091b901, T01J): 확인 기준 직접 돌려 통과. 노트 experiments/baseline-fixes-5.md
  → 2026-10-01 23:21 감독 확인 닫음: grep 'F-0[0-9][0-9]' bench tests tools contracts 0건(감독 직접). ② null 맵 → heuristic, ③ parse-error 만 있을 때 경고, ④ statm '1 -5' → null(축 1b node 실행). ⑥ 노트 출처 정정(연구 PR #7). ⑦ 병합 메시지 영어로 직접 작성 확인. statm 빈 필드는 F-054 ③

### F-053 [닫힘] (심각도: 중간) — ws_bytes: 끊긴 같은 최고 수준 원본의 판정(final·바이트·뒤 조각)이 한 규칙으로 정해지지 않았다
- 위치: bench/baseline/ws_bytes/index.mjs:146-147(`isStale = f.level < s.rhi || (f.level === s.hi && s.last !== f.level)`, `if (f.final === true && !isStale) s.final = true`), :65 주석("추월당한 수준"만 막는다고 적음) (제품 feat/baseline-fixes-5 091b901)
- 문제: F-049 ① 수정으로 stale 프레임의 final 을 버리는데, isStale 에는 추월된 낮은 수준뿐 아니라 "분할 연속이 끊긴 같은 최고 수준" 도 들어간다. 최고 수준을 받았고 그 수준의 final 원본도 왔는데 구간이 미완이 된다. 같은 프레임 집합이 순서만 바뀌어도 완결/미완이 갈린다.
- 실패 상황(감독 직접 재현, summarize): [L2 5, L1 3, L2 5 final] → segment_ids []·incomplete [{id 1, 5 B}]. [L2 5, rL2 5, L2 5 final] → incomplete 1개. 순서만 바꾼 [L2 5 final, rL2 5, L2 5] → segments [5] 완결.
- 고칠 것: final 은 `f.level >= s.rhi` 일 때 켠다(추월된 낮은 수준만 막는다). 바이트 쪽 stale 판정은 그대로 둔다. 의도적으로 끊긴 같은 수준 final 을 버리는 것이면 근거를 :65 주석과 연구 노트에 적고 순서 의존을 테스트로 고정한다.
- 확인 기준: 위 두 입력 → segment_ids [1]·segments [5]. F-049 ①([L1 5, L0 3 final] → incomplete 1개)·②·③, F-051, F-047, F-042 확인 기준 유지. 사본에서 :147 을 `!isStale` 로 되돌리면 ws_bytes 테스트 실패.
- 권장 모델: opus (같은 도구가 F-022·F-042·F-047·F-049·F-051 로 거듭 열렸다)
- 이력: 2026-10-01 23:21 감독 등록(축 1a 보고, 세 입력 감독 직접 재현; 축 4a 가 같은 줄의 변형 생존 [L2 5, L1 1, L2 3 final] 을 따로 보고 — 같은 원인이라 묶음). 신규 항목
- 보충(2026-10-01 23:27 감독, :20 예비 실행): 같은 줄의 반대쪽 결함. :150 `s.last = f.level` 이 stale 프레임에도 실행돼, 끊긴 같은 수준 stale 메시지의 다음 분할 조각은 `last === level` 로 "분할 연속" 이 되어 원본 합과 완결 판정에 들어간다. 감독 직접 재현: [L2 40, rL2 40, L2 7, L2 9] → segments [49]·stale 1·stale_bytes 7(stale 메시지 하나가 7 B 는 stale, 9 B 는 원본으로 갈림). [L0 10, rL0 10, L0 7, L0 9 final] → 완결 [19]. main 003e34b 에도 같은 줄(:141)이 있어 기존 동작이다. 위 본문(끊긴 같은 수준 final 을 살린다)과 한 규칙으로 정해야 한다: "끊긴 같은 최고 수준 원본" 을 새 메시지로 볼 것인가(그러면 바이트도 원본, final 도 유효), 늦게 온 사본으로 볼 것인가(그러면 그 뒤 분할 조각·final 도 전부 stale). 어느 쪽이든 조각마다 판정이 갈리지 않아야 한다. 결정과 근거를 :65 주석·연구 노트에 적는다.
  - 확인 기준 보충: 위 두 입력에서 끊긴 메시지의 모든 조각이 같은 판정을 받는다. 사본 규칙이면 첫 입력 → [40]·stale 2·stale_bytes 16, 둘째 입력 → 구간 0 은 L0 10 원본 final 이 없으므로 규칙대로(final 모드라 미완). 새 메시지 규칙이면 첫 입력 → [56]·stale 0 이고 그 근거를 주석·노트에 적는다. 선택한 규칙을 단언하는 테스트가 있고, 사본에서 :150 을 지금 코드로 되돌리면 그 테스트가 실패한다.

- 경과(2026-10-01 23:36 감독, 제품 PR #8 59eb764): 본문 확인 기준 통과 — [L2 5, L1 3, L2 5 final] → ids [1]·[5], [L2 5, rL2 5, L2 5 final] → [1]·[5], F-049 ①·F-051·F-047·F-042 유지(감독 직접 재현). 사본에서 :153 을 `!isStale` 로 되돌리면 ws_bytes 1 실패(감독), 3 실패(축 4a). 본문 부분은 해결. 보충은 미처리(착수 뒤 등록): [L2 40, rL2 40, L2 7, L2 9] → 여전히 [49]·stale 1·stale_bytes 7(감독 재현).
- 보충 2(2026-10-01 23:36 감독, 신규 관찰·같은 원인): 이번 수정으로 끊긴 같은 수준 final 원본이 구간을 완결시키지만 그 프레임 바이트는 stale 로 빠진다. [L2 5, L1 3, L2 5 final] → 완결 segments [5]·stale_bytes 8(final 조각 5 B 가 합에 없음, 감독 재현 :153·:161-163). 완결 근거와 합계가 다른 프레임 집합을 쓴다. 보충의 "사본 규칙 / 새 메시지 규칙" 결정에 이것도 넣는다: 새 메시지 규칙이면 끊긴 뒤 조각·final 모두 원본 합에 넣고(첫 입력 [10]·stale_bytes 3), 사본 규칙이면 final 도 완결 근거에서 빼되 그 경우 순서 의존을 근거와 함께 테스트로 고정한다.
  - 확인 기준 보충 2: 선택한 규칙에서 완결 판정과 segments 가 같은 프레임 집합을 근거로 한다(위 입력에서 완결이면 final 조각 바이트가 합에 있음). 규칙을 :60-90 주석·연구 노트에 적고 단언 테스트가 있다.
- 권장 모델: opus
- 닫음(2026-10-01 23:58 감독, 제품 PR #9 44cdd4d): 작업자가 사본 규칙을 택했다(끊긴 같은 최고 수준 원본·뒤 조각·final 모두 stale, `s.last = isStale ? -1 : f.level`, final 은 `!isStale` 일 때만). 감독이 이 규칙을 승인하고 본문 확인 기준([L2 5, L1 3, L2 5 final]·[L2 5, rL2 5, L2 5 final] → 완결 [5])은 사본 규칙에 맞게 "미완" 으로 바꾼다. 감독 직접 재현: [L2 40, rL2 40, L2 7, L2 9] → [40]·stale_bytes 16, [L0 10, rL0 10, L0 7, L0 9 final] → 미완·stale_bytes 16, [L2 5, L1 3, L2 5 final] → 미완·stale_bytes 8, [L2 5 final, rL2 5, L2 5] → [5]; F-049 ①·F-051·F-047·F-042 유지. 사본 변형: :166 을 `s.last = f.level` → 2 실패, :162 를 `f.level >= s.rhi` → 5 실패. 남은 약점은 F-057 ③④.

### F-054 [닫힘] (심각도: 낮음) — PR #7 잔여: 받은 수준 표기의 교체 누락·final 경고 문구·statm 빈 필드·주석
- 위치·문제:
  ① ws_bytes/index.mjs:222-231 segment_levels 와 마스크(:318)가 같은 구간에서 뒤에 온 높은 수준에 교체된 낮은 수준을 그대로 남긴다. [L0 10, L2 30] → [40]·[[1,3]], [L2 30, L0 10] → [30]·[[3]] (감독 직접 재현). 바이트 합은 전송량이라 맞지만 levels 는 "보드에 남은 수준" 이 아니라 "받은 수준 전부" 다. 이번 PR 이 만든 것이 아닌 기존 동작(19:24 실행에서 기존 한계로 기각한 것과 같은 원인). 지표 의미를 method 에 밝히거나 교체된 수준을 replaced_levels 로 따로 낸다.
  ② ws_bytes/index.mjs:246·:299-300 final 필드가 resend 프레임에만 있을 때도 method 에 "final 필드 없음, topLevel 가정" 이 적힌다(축 1a 보고, 감독 미재현). 문구를 "final 필드가 resend 에만 있음" 으로 구분한다.
  ③ heap/index.mjs:70 `split(' ')[1]` → statm "100  5"(빈 필드)·"100 \n" 이면 Number('') = 0 이라 :71 검사를 통과해 0 B 프로세스로 센다(축 1b·6+7 보고, 감독 줄 확인). 실제 커널 형식은 아니다. `trim().split(/\s+/)` 와 `/^\d+$/` 검사.
  ④ ref_images/index.mjs:486-487 basisNote 주석 "뒤에 속성이 더 있어도 된다" — 속성이 더 있으면 stride≠27 이라 같은 형식이 될 수 없다(축 2·1b 보고, 감독 줄 확인). 주석 정정과 10번째 속성 PLY → '와 다름' 테스트.
  ⑤ ws_bytes.test.mjs:212-215 바꾼 [rL2 9, L0 4] 단언에 segment_levels [[3]]·resend_bytes 0 이 없다(축 4a).
  ⑥ (미확인) 축 5 가 091b901 에서 `npm test` 첫 실행에 289 통과·1 실패를 한 번 보았고 이후 두 번은 0 실패였다. 실패 테스트는 특정되지 않았다(감독 실행 1회는 0 실패). `npm test` 10회 반복으로 확인하고, 실패가 나오면 해당 테스트의 시간·병렬 의존을 고친다.
- 실패 상황: ① levels_received 가 실제 남은 수준보다 크게 나옴 ② 경고 문구가 사실과 다름 ③ 깨진 statm 이 0 B 값을 만듦 ④ 주석 오독.
- 고칠 것: 위 각 항목.
- 확인 기준: ① [L0 10, L2 30] 과 [L2 30, L0 10] 의 표시 수준이 같거나, method 에 "받은 수준 전부(교체 포함)" 가 적힘 ② F-049 ② 입력 + first_frame 으로 run → method 에 "final 필드 없음" 없음 ③ statm "100  5" 주입 → null ④ 10속성 PLY 테스트 ⑤ 단언 추가.
- 권장 모델: sonnet (①② 는 ws_bytes 라 F-053 과 함께 opus 하위 작업에서 처리해도 됨, ④⑤ 는 haiku)
- 이력: 2026-10-01 23:21 감독 등록(축 1a·1b·2·3·4a·6+7 보고). 신규 항목(① 은 기존 동작을 새로 기록한 것) → 2026-10-01 작업자 처리(제품 68acd27·ee21932) → 2026-10-01 23:36 감독 확인 닫음: ① method 에 '받은 수준=교체된 낮은 수준 포함 전체'(mLv 를 mSeg 로 되돌리면 1 실패) ② resend 에만 final → 'final 필드가 resend 에만 있음'(ws_bytes.test.mjs:822) ③ statm '100  5' → 0 B 로 세지 않음(되돌리면 실패; 확인 기준의 'null' 은 연속 공백을 깨진 형식으로 본 표현이었고 정상 파싱 5 페이지가 맞음) ④ 주석 정정·10속성 PLY '와 다름' ⑤ 단언 보충 ⑥ npm test 감독 3회 + 작업자 10회 실패 0. 남은 테스트 약점은 F-056

### F-055 [닫힘] (심각도: 낮음) — PR #7 테스트 공백 보충(:20 예비 실행 축 4a·4b)
- 위치·문제:
  ① ws_bytes/index.mjs:247 `top_level_ignored: anyFinal && …` 를 `anyFinalField` 로 바꾼 변형이 57/57 생존(축 4a 사본 실행, 감독 미재현). topLevel 을 주고 final 이 resend 프레임에만 있는 녹화를 단언하는 테스트가 없다. F-054 ② 와 같은 분기.
  ② _common/browser.mjs:233·:250 감지 뒤 조기 반환(`if (window.__ffMs !== undefined) return orig.apply(this, a)`) 두 줄을 지워도 browser.test 15/15·wrapper_delegate 3/3 통과(축 4b, 실제 chromium, 감독 미재현). 커밋 d3411af 가 주장한 "감지 뒤 해시 생략" 을 지키는 테스트가 없다.
  ③ heap/index.mjs:71 음수 RSS 를 `return null`(트리 전체 버림)로 바꾼 변형과 `rss <= 0` 경계 변형이 생존(축 4b). 음수 statm 테스트가 프로세스 하나뿐이다.
  ④ ref_images.test.mjs:939~ 테스트 제목의 "uint8 표기는 uchar 로 맞춘다" 를 검증하지 않는다 — CANON_TYPE 에서 uint8 항목을 지워도 통과(basisNote 가 "uchar rgb" 를 하드코딩, 축 4b).
- 실패 상황: 각 변형이 테스트를 통과한다.
- 고칠 것: ① `wsTopLevel` 을 주고 resend 에만 final → top_level_ignored false·method 에 /무시/ 없음 단언. ② 감지 전에 gl.clear 를 캡처해 두고 감지 뒤 N회 호출할 때 해시 경로 호출 수 0 을 세는 wrapper_delegate 테스트(어렵다면 조기 반환 줄을 지우고 근거를 남겨도 됨). ③ 정상 '100 50 10' + 음수 '1 -5' 혼합 → rssProcs 1·bytes 50×page, '1 0' 포함 여부 단언. ④ 제목을 실제 범위로 줄이거나 rgb 형 표기를 typeName 으로 내고 단언.
- 확인 기준: 각 변형을 사본에 적용하면 해당 테스트 실패.
- 권장 모델: ① opus(T01.33 과 함께), ②③④ haiku
- 이력: 2026-10-01 23:27 감독 등록(PR #7 을 라벨 이벤트 실행과 :20 예비 실행이 겹쳐 검증; 예비 실행 축 4a·4b 사본 실행 보고, F-053·F-054 와 겹치지 않는 것만). 신규 항목
- 경과(2026-10-01 23:36 감독, PR #8): 착수 뒤 등록이라 미처리. ③ 은 heap.test.mjs:184·:194 로 일부 보강됐으나 '1 0' 경계 단언 없음. ①②④ 그대로(축 5 코드 확인). 다음 작업 T01M 에서.
- 경과(2026-10-01 23:58 감독, 제품 PR #9 44cdd4d): ① 닫음(anyFinal→anyFinalField 변형 1 실패, 축 4a). ③ 닫음(heap 음수·0 혼합 테스트, 정규식 제거 6 실패). ④ 닫음(CANON_TYPE uint8 삭제 → 1 실패, 축 1b). ② 만 열림: 조기 반환 줄을 남기고 "테스트로 지켜지지 않는다" 주석만 달았다. 허용한 대안은 "줄을 지우고 근거를 남김" 이었다. 새 주석의 줄 번호 `:233·:250` 은 삽입으로 어긋났다(실제 :233·:251, 축 5). 다음 작업에서 둘 중 하나로 끝낸다 — 실제 buildDetectScript 에 해시 경로 호출 수를 세는 훅을 넣어 테스트하거나, 조기 반환 두 줄을 지운다. 확인 기준: 훅 방식이면 조기 반환 삭제 변형이 browser.test 를 실패시킴, 삭제 방식이면 두 줄이 없고 감지 뒤 결과 테스트가 그대로 통과.
- 권장 모델(② 남은 것): sonnet
- 닫음(2026-10-02 00:04 감독, 제품 PR #10 251c3ca): ② 훅 방식. 감독 사본에서 browser.mjs 조기 반환 두 줄 삭제 → wrapper_delegate 4 통과·1 실패(감지 뒤 해시 진입 0회 테스트). 대조 테스트(감지 전 진입 2회) 있음.

### F-056 [닫힘] (심각도: 중간) — PR #8 테스트 공백: rhi→hi 변형 생존, statm 정규식 무방비, 회귀가 아닌 회귀 테스트
- 위치·문제:
  ① ws_bytes/index.mjs:153 `f.level >= s.rhi` 를 `f.level >= s.hi` 로 바꿔도 ws_bytes.test.mjs 62/62 통과(감독 사본 직접 재현). 더 높은 수준이 resend 로만 온 뒤 낮은 수준 final 원본이 오는 경우를 단언하는 테스트가 없다.
  ② heap/index.mjs:71 `|| !/^\d+$/.test(fields[1])` 를 지워도 heap.test.mjs 17/17 통과(감독 사본 직접 재현). 정규식이 없으면 statm 둘째 필드 '1e3'·'0x10'·'5.5'·'+5' 가 그대로 합산된다(축 4b: 4096000·65536·22528·20480 B).
  ③ heap.test.mjs:220-229 개행 테스트("100 5\n")는 수정 전 코드에서도 통과한다(Number('5\n') = 5, 축 4b 사본 확인). 이름은 trim 을 검증한다고 하나 trim 을 빼도 잡지 못한다.
  ④ heap/index.mjs:73 `rss < 0` 은 :71 정규식 뒤라 도달하지 않는 코드인데 주석은 "음수면 건너뛴다" 고 적는다(축 1b·4b). 실제로 걸리는 것은 Infinity 뿐.
  ⑤ ref_images.test.mjs:961-967 10속성 PLY 테스트는 `/와 다름/` 만 보고 main 에서도 이미 통과하던 테스트다. 문구 전체·propertyOrderCorrect 전제를 단언하지 않는다. index.mjs:291-297 propertyOrderCorrect 는 앞 9개 접두 검사라 10속성에서도 true — 주석 "정확히 이 9개" 는 :492 stride===27 조건 덕분에만 맞다(축 2·4b).
  ⑥ 연구 노트 experiments/baseline-fixes-6.md 머리말이 "F-053 과 F-054 를 처리했다" 고만 적고, 같은 하위 작업에 들어 있던 F-053 보충·F-055 ①~④ 미처리를 적지 않았다(STATUS 에는 적음, 축 5).
- 실패 상황: ①② 해당 변형이 테스트를 통과한다. ③ trim 을 빼도 통과. ④⑤ 주석을 읽은 사람이 판정 근거를 오해. ⑥ 노트만 읽으면 T01.33·T01.34 가 다 끝난 것으로 읽힌다.
- 고칠 것: ① [L1 5, rL2 5, L1 3 final] → 미완, 대조군 [L1 5, L1 3 final] → 완결 단언. ② statm '1 1e3'·'1 0x10'·'1 5.5' → null 단언. ③ 입력을 ' 100 5' 처럼 trim 에 기대는 것으로 바꾸거나 이름을 보존 테스트로. ④ `rss < 0` 을 빼고 주석을 "Infinity 면 건너뛴다" 로, 또는 `Number.isSafeInteger(rss)` 로 바꿈. ⑤ assert.equal 로 문구 전체('31 B 점(x y z float·uchar rgb), 법선 nx ny nz float 있음·무시, 중심점만 사용') 단언, propertyOrderCorrect 를 길이까지 보거나 주석에 "앞 9개 접두 일치" 로 밝힘. ⑥ 다음 노트에 이번 미처리 항목을 적는다.
- 확인 기준: 사본에서 ① rhi→hi, ② 정규식 제거, ③ trim 제거, ⑤ :492 stride===27 → stride>=27 을 각각 적용하면 해당 테스트 실패. ④ 주석이 실제 걸리는 경우만 설명.
- 권장 모델: ① opus(T01.35 와 함께), ②~⑥ haiku
- 이력: 2026-10-01 23:36 감독 등록(축 1b·2·4a·4b·5 보고; ①② 감독 사본 직접 재현, ③④⑤ 줄 확인). 신규 항목
- 닫음(2026-10-01 23:58 감독, 제품 PR #9 44cdd4d): 사본 변형 감독 직접 — ① isStale rhi→hi → ws_bytes 3 실패 ② heap :71 정규식 제거 → 6 실패 ③ trim 제거 → 1 실패 ⑤ propertyOrderCorrect 길이 조건 제거 → 1 실패. ④ `Number.isSafeInteger` 로 바꾸고 주석이 실제 걸리는 경우(Infinity·2^53 이상)를 설명(축 1b 확인). ⑥ 노트에 이전 미처리 기록. ⑤ 의 `stride===27 → stride>=27` 은 길이 조건과 겹쳐 동치 변형이 됐다(감독이 확인 기준을 "길이 조건 제거 시 실패" 로 바꿈). 남은 주석 정리는 F-057 ①.

### F-057 [닫힘] (심각도: 낮음) — PR #9 잔여: 주석·문서 불일치, 순환 단언, heap 합 상한, 사본 규칙 가정 표기
- 위치·문제:
  ① ref_images/index.mjs:293 주석 "앞 9개 접두 일치만 검사하되, stride===27 조건으로 맞춤" — :297 이 이제 `actual.length === expected.length` 로 길이까지 본다(축 1b·2, 감독 줄 확인). :494 `same` 의 `stride === 27` 은 길이 조건과 겹치는 방어다.
  ② ref_images/index.mjs:485 basisNote 문서 주석의 입력 목록(layout·stride·normals·coordType·normalType)에 colorType·propertyOrderCorrect 가 없다(축 1b·2, 감독 줄 확인).
  ③ ref_images/index.mjs:291·:497 colorType 은 :283 레이아웃 조건 때문에 rgb-u8 에서 늘 'uchar' 다. :497 을 `'uchar rgb'` 하드코딩으로 되돌려도 ref_images.test 58/58 통과(감독 사본 재현). 관측 차이가 없는 도출이다 — 주석에 "현재 늘 uchar, 색 형 허용을 넓힐 때 쓰임" 이라고 적거나 되돌린다.
  ④ ws_bytes.test.mjs:872-893 "같은 프레임 집합" 테스트가 기대값을 summarize 출력(stale_bytes, 접두 재실행)으로 계산한다(축 4a). `s.last = f.level` 변형에서 [49] 를 내도 이 테스트는 통과한다(다른 테스트가 잡음).
  ⑤ ws_bytes/index.mjs:70-72 사본 규칙 근거 "원본이 (구간,수준)에 두 번째 메시지를 보낼 일이 없어" 는 skylens 송신 코드 출처 없이 단정한다(축 3). 실제 skylens develop 대조 전까지는 가정이다. 그 결과 추월된 낮은 수준 stale 프레임이 끼는 [L2 5, L1 3, L2 5 final] 도 미완이 된다(설계상 대가, 감독 승인).
  ⑥ heap/index.mjs:74 `bytes += rss` 합은 상한 검사가 없다. 각 프로세스는 safe integer 여도 합이 2^53 을 넘을 수 있다(축 6+7, 조작된 statm 에서만, 현실 발생 없음).
  ⑦ heap/index.mjs:73 isSafeInteger 줄의 `continue` 를 `return null` 로 바꿔도 heap.test 24/24 통과(축 4b 사본). 매우 큰 값 테스트가 프로세스 하나뿐이라 "그 프로세스만 건너뜀" 과 "트리 전체 버림" 이 구분되지 않는다(F-055 ③ 과 같은 모양).
- 실패 상황: ①② 주석만 읽으면 판정 근거·호출 인자를 오해 ③ 무의미한 도출이 테스트로 지켜지는 것처럼 보임 ④ 테스트 이름이 약속한 검출력 없음 ⑤ 가정이 사실로 읽힘 ⑥ 정밀도 잃은 합.
- 고칠 것: ① 주석을 "길이·순서 모두 일치" 로 ② 목록 보충 ③ 주석 또는 되돌림 ④ 케이스마다 손계산 리터럴 {segment_ids, segments|incomplete bytes} 단언 추가 ⑤ 주석에 "skylens 송신 코드 미대조 가정" 을 밝히고 run method 에 끊긴 같은 수준 사본이 있었을 때 그 사실(개수)을 남김 ⑥ 합 뒤 `Number.isSafeInteger(bytes)` 검사(넘으면 null 또는 throw)와 테스트. ⑦ 정상 '100 50 10' + '1 900000000000000000' 혼합 트리 → rssProcs 1·bytes 50×page 단언.
- 확인 기준: ①②③ 줄 확인 ④ 사본에서 :166 을 `s.last = f.level` 로 바꾸면 그 테스트가 단독으로 실패 ⑤ [L2 5, rL2 5, L2 5 final] 녹화로 run → method 에 사본 판정 표기 ⑥ statm '1 2000000000000' 두 프로세스 → bytes 가 safe integer 이거나 null. ⑦ 사본에서 :73 `continue`→`return null` 이면 heap.test 실패.
- 권장 모델: ④⑤ sonnet, ①②③⑥⑦ haiku
- 이력: 2026-10-01 23:58 감독 등록(축 1b·2·3·4a·6+7 보고, ①② 줄 확인, ③ 감독 사본 재현, ④⑤⑥ 줄 확인). 신규 항목(모두 이번 PR 이 만들거나 드러낸 것). 저장소 분리: 이번 PR 이 제품 주석·테스트 이름에 FEEDBACK 번호 13곳을 넣었고(main 은 0) 감독이 제품 커밋 add0fa0 으로 지웠다 — 앞으로 제품에 F-번호를 넣지 않는다.
- 닫음(2026-10-02 00:04 감독, 제품 PR #10 251c3ca): ①②③ 줄 확인(ref_images :291·:295·:487·:500). ④ 사본에서 :172 `s.last = f.level` → 3 실패, 그중 손계산 리터럴 테스트(:872) 자체가 실패(이전에는 생존) — 확인 기준 충족으로 본다. ⑤ :73-75 가정 주석, run method 에 사본 판정 개수, [L2 5, rL2 5, L2 5 final] → copy_frames 1(감독 재현). ⑥ RSS 합 검사(:75), 그 줄 삭제 → heap.test 1 실패. 단 PSS 경로 합은 검사 밖 → F-058 ①. ⑦ :73 continue→return null → 2 실패(감독 재현).

### F-058 [닫힘] (심각도: 중간) — PR #10 잔여: copy_frames 테스트 공백, PSS 합 무검사, 가정 문구·주석 불일치
- 위치: 제품 feat/baseline-fixes-8 251c3ca(main 병합 뒤 같은 줄)
  ① heap/index.mjs:37 `parsePss` 는 값 하나의 isSafeInteger 를 보지 않고, :68 PSS 분기는 `continue` 로 :75 합 검사를 지나친다(축 1b·6+7, 감독 줄 확인). F-057 ⑥ 의 RSS 수정이 PSS 경로에는 닿지 않았다.
  ② ws_bytes 의 copy_frames 를 지키는 테스트가 개수·비교 기준을 구분하지 못한다(축 4a, 감독 사본 재현): index.mjs:177 `copyFrames += 1` → `copyFrames = 1` 변형 68/68 생존, :168 `f.level >= s.rhi` → `>= s.hi` 변형 68/68 생존. 테스트 녹화가 모두 사본 0~1프레임이고, 재전송 프레임이 hi 와 rhi 를 가르는 입력이 없다. copy_frames 를 직접 단언하는 테스트도 없다(method 정규식만).
  ③ ws_bytes/index.mjs:339 method 문구와 :92 copy_frames 정의가 "원본은 (구간,수준)에 메시지를 한 번만 보낸다" 는 미검증 가정에서 나온 수임을 밝히지 않는다(축 3). [L2 5, L1 3, L2 5 final] 의 뒤 L2 는 새 메시지일 수도 있는데 사본 1프레임으로 출력된다.
  ④ ws_bytes/index.mjs:70-72 는 여전히 "근거: … 사본이다" 로 단정하고 :73 에서 가정이라고 뒤집는다(축 3, 감독 줄 확인). :175 주석 "추월된 수준의 뒤늦은 프레임" 은 이제 사본 판정 프레임도 포함하는 블록이라 좁다(축 1a).
  ⑤ ref_images/index.mjs:489 문서 "형 정보(…colorType)가 없으면 형을 적지 않고, 기준 형식과 같다고도 하지 않는다" 와 달리 :502 는 colorType 이 없으면 'uchar rgb' 를 적고 :497 `same` 은 colorType 을 보지 않는다(축 1b·2, 감독 줄 확인). :496 "stride === 27 는 방어적 검사(길이 조건과 겹침)" 는 9개 속성이어도 double 좌표면 39 B 라 부정확하고, 색 형은 stride 27 과 rgb-u8 검사로만 보증된다. :291·:500 은 "line 282" 로 줄 번호를 박았다(밀리면 틀린 근거, F-055 ② 와 같은 모양).
  ⑥ heap/index.mjs:41 JSDoc 이 "/proc 이 없으면 null" 만 적는다. root 없음(:55)·센 프로세스 0(:78)·합 unsafe(:75) 의 null 이 문서에 없고, 개별 unsafe 는 건너뛰고(:73) 합 unsafe 는 전체를 버리는 차이의 이유도 없다(축 1b·6+7). 새 heap 테스트 둘의 제목 "대조: continue 이면…" 은 새 코드가 아니라 기존 :73 을 검증한다.
  ⑦ _common/browser.mjs:235·:253 테스트 훅이 감지 전 해시 경로(측정 대상)의 모든 래핑 호출에 `window.__ffTestHook` 조회를 넣는다(축 6+7). 크기는 작고 측정 영향 근거는 없다.
  ⑧ heap/heap.test.mjs:314-330 '합산 뒤 unsafe' 테스트의 `rssValue = '2000000000000'` 는 4 KiB 페이지에서만 전제(단일 safe·합 unsafe)가 맞다. 16·64 KiB 페이지에서는 단일 값이 이미 unsafe 라 전제 단언이 거짓 실패한다(축 4b, 감독 줄 확인, 이 환경 4096 이라 통과). 고칠 것: 값을 `Math.floor(Number.MAX_SAFE_INTEGER / systemPageSize())` 에서 유도. 확인 기준: 줄 확인.
- 실패 상황: ① smaps_rollup `Pss: 6000000000000 kB` 두 프로세스 → bytes 1.2288e16(unsafe) 이 그대로 나옴(축 1b 실행 보고, 감독 미재현) ② 위 두 변형이 테스트를 통과 ③④ 가정이 측정값·사실로 읽힘 ⑤ colorType 없이 basisNote 호출 → "27 B 와 같은 형식 … uchar rgb"(문서와 반대) ⑥ 호출자가 null 원인을 문서로 알 수 없음 ⑦ 측정 경로에 테스트 전용 조회.
- 고칠 것: ① parsePss 결과에 isSafeInteger(아니면 null 또는 그 프로세스 건너뜀, RSS 와 같은 정책), 합 검사를 PSS·RSS 공통 위치로 옮김 + PSS 두 경우 테스트. ② `[L2 5, rL2 5, L2 5, L2 5]` → `summarize(...).copy_frames === 2`, `[L1 3, rL2 4, L1 3]` → `copy_frames === 0` 를 직접 단언, `[L2 5, L1 3, L2 5 final]` → copy_frames 1·stale_levels 2. ③ method 문구·:92 정의에 "미검증 가정에 따른 판정" 단서. ④ :70-72 를 "가정:" 으로 시작하게 고치고 :175 주석을 넓힘. ⑤ 문서를 실제 동작("colorType 이 없으면 uchar 로 간주")에 맞추거나 `same` 에 `colorType === 'uchar'` 를 넣고 테스트 갱신, :496 문구 정정, 줄 번호 대신 "planPly 의 rgb-u8 검사" 로 참조. ⑥ JSDoc 에 null 조건 넷과 정책 차이 이유, 테스트 제목 정정. ⑦ 훅을 래퍼 생성 때 한 번 읽거나 buildDetectScript 옵션으로 테스트에서만 주입(어느 쪽이든 조기 반환 삭제 변형이 여전히 실패해야 함).
- 확인 기준: ① PSS 두 경우 테스트 통과, 공통 합 검사 삭제 변형에서 실패 ② 사본에서 `copyFrames = 1`·`>= s.hi` 변형이 각각 1건 이상 실패 ③④⑤⑥ 줄 확인, ⑤ 고친 쪽에 맞는 basisNote 단언 ⑦ 조기 반환 삭제 변형 → wrapper_delegate 실패 유지.
- 권장 모델: ②③④ sonnet, ①⑤⑥⑦⑧ haiku
- 이력: 2026-10-02 00:04 감독 등록(축 1a·1b·2·3·4a·4b·6+7 보고; ⑧ 은 병합 뒤 도착한 축 4b 보고, ① 도 축 4b 가 같은 결과; ② 감독 사본 재현, ①④⑤ 감독 줄 확인, ③⑥⑦ 줄 근거 있음). 신규 항목(모두 이번 PR 이 만들거나 드러낸 것). 축 1b 가 ① 을 높음으로 보고했으나 조작된 smaps_rollup 에서만 생기고 실제 /proc 에서는 나오기 어려워 중간 항목 안의 낮은 하위로 낮춤.
- 닫음(2026-10-02 00:20 감독, 제품 PR #11 6ce3122): ② 사본 `copyFrames = 1` → 직접 단언 테스트 1 실패, `>= s.hi` → 1 실패(감독 재현). ① PSS 합 검사(heap/index.mjs:74) 삭제 → PSS 합 테스트 1 실패, RSS 합 검사(:83) 삭제 → RSS 합 테스트 1 실패(감독 재현). 공통 위치 대신 두 곳에 둔 것은 노트에 밝혔고 두 삭제 변형이 모두 잡혀 충족으로 본다. ③④ ws_bytes :71-73·:93·:175·method 줄 확인. ⑤ same 에 colorType==='uchar', 없으면 'rgb', 새 basisNote 단언 통과, 줄 번호 참조 제거. 단 :496 stride 주석은 여전히 부정확 → F-059 ②. ⑥ JSDoc null 조건 넷 확인(개별 PSS unsafe 문구 부정확 → F-059 ①). ⑦ 조기 반환 두 줄 각각 삭제 → wrapper_delegate 1 실패씩(감독 재현). ⑧ :318 값 유도 확인.

### F-059 [닫힘] (심각도: 낮음) — PR #11 잔여: heap 문서·method 문구, basisNote stride 주석, testMode 꺼짐 무검사, 지워진 browser 주석, 병합 커밋의 작업 트리 이름
- 위치: 제품 feat/baseline-fixes-9 6ce3122(main 병합 뒤 같은 줄)
  ① heap/index.mjs:46 JSDoc "개별 unsafe 는 건너뛰고" — 실제로 개별 unsafe PSS 는 건너뛰지 않고 RSS 로 폴백한다(:72), 건너뛰는 것은 개별 unsafe RSS 뿐(:81). (축 1b·5·6+7, 감독 줄 확인)
  ② heap/index.mjs:98 memoryMethodText 의 pssProcs 0 문구 "smaps_rollup 을 읽지 못해" — 이제 Pss 가 안전 정수가 아니어도 폴백하므로 이유가 좁다. (축 1b, 감독 줄 확인)
  ③ ref_images/index.mjs:496 주석 "propertyOrderCorrect 이 true 이고 정확히 9개 속성일 때만 stride === 27 이다(planPly 의 rgb-u8 검사로 보증)" — 틀림. 순서가 맞아도 double 좌표면 39 B, 반대로 double27(법선 없음)은 27 B 인데 propertyOrderCorrect false. rgb-u8 검사는 색 형만 보증한다. 판정 결과는 AND 조건이라 맞다. (축 2, 감독 줄 확인; F-058 ⑤ 의 :496 문구 정정 미완)
  ④ _common/browser.mjs: 테스트 훅과 무관한 설명 주석 약 10줄이 지워졌다(found() 의 복원 이유·"래퍼일 때만 복원", draw 서명 판독 이유, uniform 제외 이유, RECHECK_MS 재판독 이유, 조기 반환 "해시 없이 위임" 2곳). PR 본문·노트에 언급 없음. (축 5·6+7, 감독 diff 확인)
  ⑤ ws_bytes/index.mjs:71 "(딜레이 패턴이 수준을 교체하므로)" 가 가정의 근거를 도출된 사실처럼 붙인다. :75 "설계상 선택이다" 앞에 가정이 틀리면 정상 완결을 미완으로 잘못 분류한다는 방향을 적는 편이 낫다. (축 3, 감독 줄 확인)
  ⑦ _common/browser.mjs:160 testHookCode 를 testMode 와 무관하게 항상 생성하는 변형이 모든 테스트를 통과한다(축 4b 사본 실행, 감독이 테스트에서 testMode 쓰임 확인: wrapper_delegate.test.mjs:108·129 의 true 만). 고칠 것: buildDetectScript('#c')·{testMode:false} 결과에 __ffTestHook 이 없고 {testMode:true} 에는 있다는 문자열 테스트. 확인 기준: 그 변형에서 _common 테스트 1건 이상 실패.
  ⑥ 제품 PR 의 병합 커밋 3개 제목이 "Merge branch 'worktree-agent-…'" 로 서브에이전트 작업 트리 이름을 드러낸다(금지 패턴은 아님, main 에 기존 2건 선례). (축 9, 감독 확인)
- 실패 상황: ①② 문서·method 를 믿은 독자가 unsafe PSS 프로세스가 빠졌다거나 smaps_rollup 을 못 읽었다고 오해 ③ 주석을 믿고 stride 조건을 중복으로 보고 지움 ④ 이후 검토에서 래퍼 복원·서명 해시 설계 의도를 복원할 수 없음 ⑤ 가정이 사실로 읽힘 ⑥ 이력에 도구 작업 흔적
- 고칠 것: ① "개별 unsafe Pss 는 그 프로세스를 RSS 폴백, 개별 unsafe RSS 는 건너뜀, 합 unsafe 는 null" ② "smaps_rollup 을 읽지 못했거나 Pss 가 안전 정수가 아니어서" ③ "stride 는 속성 형에 따라 달라지는 독립 조건이다(순서가 맞아도 double 좌표면 39 B, 27 B 라도 double 좌표·법선 없음일 수 있다)" + double 좌표·float 법선·uchar rgb 9속성 → propertyOrderCorrect true·stride 39·'와 다름' 테스트 ④ 지운 주석 복원(훅 관련 줄만 testMode 문구로) ⑤ 71·75 문구 정정 ⑥ 서브에이전트 작업 트리 브랜치는 로컬에서 squash 해 feat/* 에 일반 커밋으로 옮기거나 병합 메시지를 직접 쓴다(-m).
- 확인 기준: ①②⑤ 줄 확인 ③ 새 테스트 통과, :496 문구 확인 ④ origin/main 대비 browser.mjs 제거 줄이 훅 관련 줄뿐 ⑥ 다음 PR 커밋 제목에 worktree-agent 0건
- 권장 모델: 전부 haiku(③ 테스트 포함)
- 처리 시점: 별도 주기를 만들지 않는다(결정 0011). 다음 제품 작업(T02 승인 뒤 첫 cloud 작업)의 첫 하위 작업으로 함께 고친다.
- 이력: 2026-10-02 00:20 감독 등록(축 1b·2·3·5·6+7·9 보고, ①~⑥ 감독 줄·diff 확인; ⑦ 은 늦게 도착한 축 4b 보고, 감독 테스트 줄 확인). 신규 항목(이번 PR 이 만들거나 F-058 ⑤ 에서 덜 고친 것). 치명·높음 없음. → 2026-10-02 작업자 처리(제품 feat/asset-format dc55b2b 병합, T03.F): ①~⑥ 수정, ⑦ 테스트 추가, 병합 커밋 제목에 worktree-agent 0건(이번 실행 병합은 직접 쓴 메시지) → 2026-10-03 08:30 감독 확인 닫음(PR #12 e3133dc: ①②③⑤ 줄 확인, ③ 새 테스트 ref_images.test.mjs:979, ④ browser.mjs 제거 줄 1줄(주석 붙여 같은 줄 재추가)·주석 복원 확인, ⑦ browser.test.mjs:141, ⑥ main..feat/asset-format 커밋 제목 worktree 0건)

### F-060 [닫힘] (심각도: 높음) — checkDeterminism 이 계약 서명대로 부르면 항상 던지고, 실제 pack 결정성 테스트는 모든 import 실패를 건너뛴다
- 위치: 제품 feat/asset-format e3133dc — server/asset/determinism/index.mjs:11,19-30, server/asset/determinism/determinism.test.mjs:110-119, 계약 contracts/asset/stubs.mjs:323
- 문제: 계약은 `checkDeterminism(input, times)` 인데 구현은 packFn 이 없으면 무조건 Error 를 던진다(:22-29 의 try { throw } catch { throw } 는 의미 없는 코드). JSDoc(:8)은 "기본은 ../pack/index.mjs 의 packChunk" 라고 해 문서와도 다르다. 실제 packChunk 로 도는 유일한 테스트(:110-119)는 catch 가 모든 오류를 받아 t.skip 하므로 pack 이 깨져도 녹색이다. T03.9 완료 기준(같은 입력 두 번 → 바이트 동일)을 제품 경로로 지키는 테스트가 사실상 없다.
- 실패 상황: (감독 재현) `checkDeterminism({})` → "packFn not provided" Error. 사본에서 server/asset/pack/index.mjs 끝에 문법 오류 한 줄을 넣고 `node --test server/asset/determinism/determinism.test.mjs` → pass 7·fail 0·skipped 1("packChunk module not found").
- 고칠 것: determinism/index.mjs 에서 `import { packChunk } from '../pack/index.mjs'` 정적 import, packFn 기본값을 packChunk 로. 쓸모없는 try/throw/catch 삭제. 테스트는 정적 import 로 실제 packChunk 를 두 형식 입력(골든 입력)으로 `checkDeterminism(input)`(packFn 생략) 호출해 `{identical:true, firstDiffOffset:null}` 단언. times 는 `Number.isInteger(times) && times >= 0` 이 아니면 던지고(NaN·1.5·Infinity), 결과를 전부 쌓지 말고 첫 결과와 하나씩 비교.
- 확인 기준: ① `checkDeterminism(point27 입력)`·`(gauss56 입력)` 이 packFn 없이 identical true ② 사본에서 pack/index.mjs 에 문법 오류를 넣으면 determinism 테스트가 fail ≥1(skip 아님) ③ times NaN·1.5·Infinity 가 즉시 던짐 ④ 전체 npm test 실패 0
- 권장 모델: sonnet
- 이력: 2026-10-03 08:30 감독 등록(축 4B 보고, 감독 직접 재현). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): F-060 수정, 확인 기준 ①~④ 통과. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(감독 직접: 사본 pack/index.mjs 문법 오류 → `node --test server/asset/determinism/*.test.mjs` fail 1·skip 0. 축 4A: packFn 생략 시 실제 packChunk, times NaN·1.5·Infinity 던짐 확인)


### F-061 [닫힘] (심각도: 높음) — unpack_error_bound 가 f_dc 반올림 방향 수정(f32Toward)을 고정하지 못하고, 오차 상한 시험이 제품 packChunk 가 아닌 복사본 부호기를 쓴다
- 위치: 제품 e3133dc — server/asset/unpack/unpack.test.mjs:16-113(참조 부호기 복사본), :275·:285·:306(EDGE_FDC), server/asset/unpack/index.mjs:168·175, server/asset/pack/pack.test.mjs:77-88
- 문제: 실험 노트 발견 1은 "f32 로 내릴 때 반올림 몇 ulp 가 상한을 넘어 처음 구현에서 위반 4건, 반올림 방향을 골라 해결" 이라고 적는다. 그런데 그 수정을 되돌려도 테스트가 통과한다. EDGE_FDC 는 0, ±0.5/C0 근처, 127.5 동점만 넣어 문제 경계(각 색 코드 c 의 하한 끝 f32 원본)를 포함하지 않는다. 또 무작위 왕복 상한 시험의 입력은 테스트 안의 복사본 부호기(packPoint27/packGauss56)로 만들고, 골든도 같은 식의 generate.mjs 로 만들어 제품 packChunk 와 복사본이 함께 틀리면 잡히지 않는다. quantExp 등호 경계(extent = 65535·2^-k)도 시험하지 않아 pack/index.mjs:112 의 `<=`→`<` 변형이 살아남는다(축 4A 보고).
- 실패 상황: (감독 재현) 사본에서 unpack/index.mjs:168 `f32Toward(…, -1)` → `Math.fround(…)` 로 바꾸고 `node --test server/asset/unpack/unpack.test.mjs` → pass 4·fail 0. 축 4A 계산: c=1·17·33·207 의 하한 끝 f32 원본에서 이 변형은 ERROR_BOUNDS.gaussFdc 를 넘는다(미확인 수치, 감독은 변형 생존만 확인).
- 고칠 것: ① EDGE_FDC 에 c=0..255 각각 "부호화하면 c 가 되는 가장 작은·가장 큰 f32 원본" 을 넣고, opacity(로짓, :175)도 같은 방식으로 각 q 의 끝점 f32 원본을 넣는다. ② 무작위 왕복 상한 시험(두 형식)의 부호화를 제품 `packChunk` 로 바꾼다(복사본 부호기는 손계산 사이드카 대조용으로만). ③ pack.test 에 `mk(65535/1024)`→10, `mk(65535/512)`→9, `mk(65535/256)`→8 과 바로 위 f32 값 → 한 단계 아래를 추가. ④ 사이드카에 접힘 법선(z<0) 점과 회전 m≠0 점의 손계산 stored 값 추가.
- 확인 기준: 사본 변형 세 가지 각각에서 해당 테스트 fail ≥1 — (a) unpack:168 f32Toward→Math.fround (b) unpack:175 opacity f32Toward→Math.fround (c) pack:112 `<=`→`<`. 원본에서 전체 npm test 실패 0, 상한 값(contracts/asset/index.mjs:60-69) 변경 없음.
- 권장 모델: opus(수치 경계 계산)
- 이력: 2026-10-03 08:30 감독 등록(축 4A 보고, (a) 감독 직접 재현). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): 변형 (a)(b)(c) 각각 테스트 fail 직접 확인, 상한 변경 없음. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(감독 직접: 사본 unpack:185 f32Toward→Math.fround → unpack 테스트 fail 1. 축 1b: (a)(b)(c) 각각 fail 1, 왕복 시험이 제품 packChunk 사용(unpack.test.mjs:12·34), contracts/ 변경 0)


### F-062 [닫힘] (심각도: 중간) — 명세·결정 0015 의 형식 1 점당 본문 바이트가 13 B 로 틀렸다(실제 11 B)
- 위치: 제품 format/ASSET_FORMAT.md:20, :144, :287, :288 / 연구 experiment/asset-format decisions/0015-asset-single-format.md "13 B/점", "48%"
- 문제: :144 식 `3·pad4(2n) + 5·pad4(n)` 은 n 이 4의 배수면 6n+5n = 11n 인데 같은 줄이 13n 이라 적는다. 평면은 위치 u16×3(6)+색 u8×3(3)+법선 i8×2(2) = 11 B. 명세 :5 는 "문서가 이긴다" 이므로 틀린 수치가 규범이 된다.
- 실패 상황: `bodyLayout(1, 32).requiredBytes/32` = 11, 골든 본문 352 = 32×11. 문서대로 S6 용량을 추정하면 32.5 MB(실제 27.5 MB), 3 MB 당 23만 점(실제 약 27만 점).
- 고칠 것: :20 → 11 B(40.7%), :144 → 11n, :287 → 27.5 MB, :288 → 약 27만 점. 0015 의 13 B·48% 도 같이.
- 확인 기준: `grep -n '13 B\|13n' format/ASSET_FORMAT.md` 0건, 0015 수치 정정.
- 권장 모델: haiku
- 이력: 2026-10-03 08:30 감독 등록(축 1 보고, 감독 줄 확인). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): 13 B·13n 0건, 0015 정정. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(감독 직접: `grep -n '13 B\|13n' format/ASSET_FORMAT.md` 0건, 0015 11 B·40.7% 확인)


### F-063 [닫힘] (심각도: 중간) — packChunk 가 lod > 7 조각을 만든다(검증기·엄격 읽기가 거부)
- 위치: server/asset/pack/index.mjs:86, :118-122
- 문제: pack 은 lod 를 LOD_MAX(7)로 검사하지 않고 serializeHeader(0..255)만 거친다.
- 실패 상황: `packChunk({...골든 입력, lod:255})` → 정상 반환, validateAsset → `field: lod 255 > 7`, readHeaderStrict 던짐(축 7 재현, 감독은 :86·:120 에 검사 없음 확인).
- 고칠 것: pack 에서 lod 정수·0..LOD_MAX 검사(AssetFormatError 'field'), 또는 출력 직후 readHeaderStrict 로 자체 검증.
- 확인 기준: `packChunk({lod:8})` 이 AssetFormatError('field'), 테스트 1건.
- 권장 모델: sonnet
- 이력: 2026-10-03 08:30 감독 등록(축 7). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): lod 검사·테스트. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(축 1: lod NaN·1.5·-1·8 → AssetFormatError field(pack/index.mjs:89))


### F-064 [닫힘] (심각도: 중간) — 클라이언트 읽기가 codec 을 검사하지 않고 헤더 의미 검사·음성 테스트가 거의 없다
- 위치: client/asset/index.mjs:42(codec 읽기만), :72-88(readPlanesClient: 파일이 길어도 통과), client/asset/client_asset.test.mjs:15·22·24(gauss56 기준값 0 으로 꺼짐), :64-70(음성 2개)
- 문제: 명세 §9 는 모르는 codec 을 거부하라는데 서버 unpack 만 거부한다. 클라이언트는 codec≠0 본문을 무압축 평면으로 해석한다(도착하지 않은 표면을 그리는 셈, RULES §1.2). quantExp·tileSizeM·pointCount·bbox·뒤 바이트도 보지 않는다.
- 실패 상황: codec=1 골든 변형 → readPlanesClient 가 쓰레기 위치를 돌려줌. version·header_size·본문 길이 검사를 지운 변형이 5/5 통과(축 4B).
- 고칠 것: codec≠CODEC_RAW_PLANAR → AssetFormatError('codec'). quantExp 8..10·pointCount≥1·tileSizeM 64·headerSize+bodyBytes = 길이 검사(또는 서버 parseHeader 와 같은 최소 검사만 한다는 계약을 명세 §15 T03.8 줄에 명시하고 codec 만 추가). 음성 테스트: 주 버전 2, header_size 130, format 3, 잘린 본문, codec 1. gauss56 기준값 512·21·384 채우고 if 제거.
- 확인 기준: 위 입력마다 AssetFormatError, 해당 검사를 지운 사본에서 테스트 실패.
- 권장 모델: sonnet
- 이력: 2026-10-03 08:30 감독 등록(축 3·4B·7, 감독 :42 확인). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): 클라이언트 검사·음성 테스트. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(축 4B: 클라이언트 codec 검사 제거 변형 fail 2~4, 축 3: codec≠0·잘린 본문·뒤 바이트 거부)


### F-065 [닫힘] (심각도: 중간) — f32Toward 가 호출마다 타입 배열을 할당해 가우시안 unpack 이 100만 점에 3.3 s, 퍼저 시간 상한 여유가 얇다
- 위치: server/asset/unpack/index.mjs:25-28(f32Toward), :168·:175 호출, server/asset/fuzz/fuzz.test.mjs:13(MAX_CALL_MS 50)·:171-179
- 문제: `new Float32Array([f])`·`new Int32Array(buf.buffer)` 를 점당 최대 4회 만든다. 축 6 측정: GAUSS56 100만 점 unpackChunk 3272 ms(POINT27 169 ms), 프로파일 1위 f32Toward·2위 GC. 축 5 실행에서 퍼저 toSourceRecords 최대 45.14 ms(상한 50 ms), 노트는 11.3 ms 라고 적음.
- 실패 상황: 250만 점 구간 가우시안 unpack 약 8 s 동기 차단. 부하 걸린 npm test 에서 퍼저 간헐 실패(노트 발견 3 의 원인 미확인 실패와 같은 증상일 수 있음).
- 고칠 것: 모듈 수준 스크래치 Float32Array(1)·Int32Array 뷰 재사용. 실험 노트의 퍼저 최대 지연을 실측으로 정정.
- 확인 기준: 100만 점 GAUSS56 unpackChunk ≤ 0.5 s(같은 기계 기준, 측정 명령 노트에), unpack 오차 테스트 그대로 통과.
- 권장 모델: sonnet
- 이력: 2026-10-03 08:30 감독 등록(축 5·6, 감독 :25-28 확인, 시간 수치 미확인). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): 100만 점 가우시안 unpack 394 ms(유휴, ≤ 500 ms), 점 27 135 ms, 출력 비트 동일. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(축 5·6: 100만 점 GAUSS56 unpackChunk 316~377 ms·349 ms(≤500 ms), 출력 비트 동일(축 1, 200만 입력))


### F-066 [닫힘] (심각도: 중간) — 검증기·unpack 음성 테스트 누락(변형 생존)
- 위치: tools/asset_validate/asset_validate.test.mjs:136-176(손상 목록), :102 / server/asset/unpack/unpack.test.mjs:468-486 / server/asset/fuzz/fuzz.test.mjs:204-208·:392-395·:398-403
- 문제: 검증기의 tile·codec·anchor·pointCount 검사를 각각 `if (false)` 로 바꿔도 19/19 통과. unpack 의 pointCount 0·bboxMin 비유한 거부를 지워도 통과(NaN 좌표 출력). 퍼저는 형제 모듈 import 실패를 skip 으로 돌리고, 필드 표 오프셋을 OFFSETS 와 같은지 비교하지 않는다. 무작위 입력 테스트는 'validator failure'(내부 예외)를 걸러내지 않는다.
- 고칠 것: 검증기 손상 사례 추가(tileX 2, codec 1, anchor NaN, point_count 0, tile_size 63, lod 8 — 체크섬 재계산). unpack 에 bboxMin NaN/±Inf→'bbox', pointCount 0→'field'. 퍼저 import 는 파일이 없을 때만 skip, `OFFSETS[key]+8*axis === off` 단언. 무작위 입력 위반 메시지에 'validator failure' 없음 단언.
- 확인 기준: 위 각 검사를 지운 사본에서 테스트 fail ≥1.
- 권장 모델: sonnet
- 이력: 2026-10-03 08:30 감독 등록(축 4A·4B, 변형 결과는 서브에이전트 보고, 감독 미재현). 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): 검증기·unpack·퍼저 음성 테스트, 퍼저 예산 CPU 시간화. 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(축 4A·4B: 검증기 tile·codec·anchor·pointCount if(false) 각각 fail 1, unpack pointCount·bboxMin 검사 제거 fail 2·18, 퍼저 import·OFFSETS·validator failure 확인)


### F-067 [닫힘] (심각도: 낮음) — 명세 문구·잔여 정리 묶음
- 위치·고칠 것:
  ① format/ASSET_FORMAT.md:247(및 연구 SPEC.md:72) — Δd ≈ d²/(f·b) 의 d 는 촬영 깊이(renderer_basis.md:227-233)인데 시점 거리로 읽힌다. "d = 촬영 깊이, Δd 는 원본 정밀도 하한(이보다 촘촘할 필요 없음), 시점 거리별 단계 간격은 화면 픽셀 크기로" 를 다른 기호로 구분해 적는다(SPEC 문구는 감독이 다음 실행에서 맞춘다; 수치 아님). (축 2)
  ② :227·:247 출처 "renderer_basis §9" → "§3-7(§11 Q 참조)", :227 예시 "고도 30 m" → "깊이 45 m(고도 30 m, 60° 사선)·기선 8.26 m 에서 0.33 m". (축 2)
  ③ §1.1 또는 §5.3 에 "법선 = 위치와 같은 ENU 축 세계 좌표 단위 벡터, 원본 부호 보존, 축 변환 시 같은 회전" 추가. :27 "PLY x y z = ENU" 를 "가정(T04 확인 전)" 으로. (축 2·3)
  ④ :37 에 "타일 전체 폭(≥ 63.999 m)을 쓰는 조각은 quant_exp 9" 단서. (축 1)
  ⑤ §10.2 규칙 3 에 "같은 키(§11) 조각은 교체(중복 더하기 금지)" 추가, 앵커 일치 검사 책임(T10)을 명세에 한 줄. (축 3)
  ⑥ checksum/index.mjs verifyChecksum(null)·(ArrayBuffer) 가 TypeError → false 반환. (축 1b·7)
  ⑦ unpackChunk 의 의미 검사 범위(lod·tileSizeM·bboxMax)를 JSDoc 에 명시하거나 readHeaderStrict 재사용. (축 1b·7)
  ⑧ client/asset/index.mjs 평면 뷰가 LE 호스트를 가정함을 주석으로. compat.test.mjs:90-102 의 평면 값 비교를 readPlanesClient 결과로. bounds.test.mjs:58 항상 참 단언 정리. tile_index.test.mjs:21 의 283 을 독립 계산으로. determinism.test.mjs:69 offset 정확값 0, 3회째만 다른 경우 테스트. (축 1·4B)
  ⑨ generate.mjs 가 부호화 함수를 내보내지 않아 테스트가 복사(노트 발견 5) — F-061 ② 와 함께 정리.
- 확인 기준: 각 줄 확인, 해당 테스트 추가 통과.
- 권장 모델: haiku(①~⑤·⑧ 문구), sonnet(⑥⑦)
- 처리 시점: F-060·F-061 과 같은 PR 에서 가능하면 함께, 아니면 T04 첫 하위 작업(결정 0011).
- 이력: 2026-10-03 08:30 감독 등록. 신규. → 2026-10-03 작업자 처리(제품 feat/asset-format 282d7d8): ①~⑨ 반영(① SPEC 문구는 감독 몫으로 남김). 전체 npm test 510 중 통과 498·실패 0·건너뜀 12 → 2026-10-03 09:05 감독 확인 닫음(①~⑤ 문구 일부가 메모 형태로 남음(ASSET_FORMAT.md:37·249·259·260) → F-068 로 옮겨 닫음. ⑥~⑨ 확인)


### F-068 [닫힘] (심각도: 중간) — 자산 명세에 메모 문구가 규범 자리에 남고 Δd 근거가 다시 시점 거리로 읽힌다
- 위치: 제품 main(PR #12 병합분) format/ASSET_FORMAT.md:37, :173, :229, :249, :259, :260
- 문제: :37 "…quant_exp 9 단서." 와 :260 "앵커 일치 검사 책임(T10)을 명세에 한 줄." 은 F-067 ④⑤ 의 지시문이 문장 그대로 들어간 것이다. :249 는 d_c(촬영 깊이)를 정의하고도 "먼 곳은 원래 정밀도가 거리 제곱으로 나빠지므로 점 밀도도 거리에 맞춰 낮춘다" 를 남겨 시점 거리로 읽힌다. :259 는 "같은 수준이면 더한다" 와 "같은 키는 교체" 가 한 항목이다. :173 은 법선을 단위 벡터로 단정하나 renderer_basis 는 3장 평균(길이 미보장). :229 "깊이 45 m" 는 basis 표 45.3 m.
- 실패 상황: T07 이 시점 거리² 로 LOD 를 성기게 만든다. T10 이 앵커 불일치 조각을 누가 거부하는지 몰라 서로 다른 앵커 조각이 섞여 그려진다(client/asset/index.mjs 는 앵커를 읽기만 함). 쓰는 쪽이 법선 길이 1 을 검사해 정상 입력을 거부한다.
- 고칠 것: :37 → "타일 전체 폭(≥ 63.999 m)을 쓰는 조각은 quant_exp ≤ 9 를 쓴다(§5.1)." / :260 → "앵커가 다른 조각은 상태 기계(T10)가 거부한다. 파서는 조각 단독이라 앵커를 검사하지 않는다." / :249 콜론 뒤 문장을 "Δd 는 lod 0 밀도의 하한일 뿐, 시점 거리별 간격은 화면 픽셀 크기로 정한다" 로 / :259 같은 키 교체를 별도 항목 4 로 / :173 "단위 길이 미보장" / :229 45.3 m. 연구 SPEC.md:72 의 Δd 문구는 감독이 맞춘다.
- 확인 기준: `grep -n '단서\.\|명세에 한 줄' format/ASSET_FORMAT.md` 0건, :249 의 "거리" 가 모두 d_c 또는 "시점 거리" 로 구분, §10.2 항목 4 존재.
- 권장 모델: haiku
- 이력: 2026-10-03 09:05 감독 등록(축 2·3 보고, 감독 :37·:259·:260 직접 확인, :173·:229·:249 는 축 2 보고). 신규(F-067 잔여). → 2026-10-03 작업자 처리(제품 feat/point-io c891c29): 명세 문구 6곳 정정, grep 0건. 전체 npm test 584 중 통과 572·실패 0·건너뜀 12 → 2026-10-03 09:40 감독 확인 닫음(grep 0건, §10.2 항목 4 존재, :249 d_c 표기. Δd 방향 문구 잔여는 F-074 ①) → 2026-10-03 10:25 감독 다시 엶: 제품 acb3818 format/ASSET_FORMAT.md:249 새 문장 "시점 거리별 간격은 화면 픽셀 크기로 정한다(§11 Q 참조): 먼 곳은 원래 정밀도가 거리 제곱으로 나빠지므로 점 밀도도 거리에 맞춰 낮춘다" 가 촬영 깊이 d_c 의 d² 를 시점 거리 LOD 근거로 다시 잇는다(SPEC.md:72 와 어긋남, 감독 직접 확인). 고칠 것: 콜론 뒤 절 삭제, "Δd(촬영 깊이 d_c 기준)는 lod 0 의 깊이 방향 정밀도 한계로만 쓰고, 시점 거리별 간격은 화면 픽셀 크기로 정한다(renderer_basis §11 Q)" 로. Δd 를 옆 방향 "점 간격의 하한" 이라 부르지 않는다. 확인 기준: :249 에 시점 거리와 d² 를 잇는 인과 문장 없음, "§11 Q" 가 renderer_basis 로 명시. 권장 모델: haiku → 2026-10-03 작업자 처리(제품 feat/point-io 병합 후속, 연구 experiment/point-io): 반려 2회차 수정. 전체 npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 파일 반복 실행 실패 0 → 2026-10-03 10:55 감독 확인 닫음: ASSET_FORMAT.md:249 시점 거리 d² 문구 삭제, Δd 를 lod 0 깊이 정밀도 한계로만 씀. 인용 위치 잔여는 F-081.

### F-069 [닫힘] (심각도: 중간) — 자산 읽기·검사 함수의 비유한·이상 입력 처리 잔여
- 위치: 제품 main(PR #12 병합분) server/asset/unpack/index.mjs:120·:161, client/asset/index.mjs:66-74, server/asset/determinism/index.mjs:72-86, server/asset/checksum/index.mjs:25·35-36
- 문제: ① unpack 은 bboxMin 만 유한 검사하고 bboxMax 와 f32 로 내린 결과는 보지 않는다. bboxMin 이 f64 로 유한한 1e308 이면 positions 가 Inf. ② 클라이언트 readHeaderClient 는 bbox 유한 검사가 없다(서버와 다름, 주석은 같다고 함). ③ checkDeterminism 은 packFn 이 null·문자열을 돌려도 identical:true, times 0·1 이면 비교 없이 identical:true. ④ crc32(ArrayBuffer) 는 0, crc32(null)·computeChecksum(null) 은 TypeError(문서는 AssetFormatError).
- 실패 상황: (축 7 재현) bboxMin=[1e308,0,0] 골든 변형 → unpackChunk 성공, positions 에 Inf. 무작위 변조 2만 건 중 257 건 비유한 출력(체크섬은 unpack 이 보지 않음). `checkDeterminism(x, 2, () => null)` → identical true.
- 고칠 것: unpack·클라이언트 모두 bbox 6값 유한 검사 + 복원 위치 유한 아니면 AssetFormatError('bbox'). checkDeterminism 은 결과가 Uint8Array 가 아니면 던지고 times < 2 는 거부(또는 comparisons 반환). checksum 진입부 Uint8Array 검사.
- 확인 기준: 위 입력 각각 AssetFormatError(또는 명시 오류), 같은 무작위 변조 2만 건에서 비유한 출력 0, 테스트 추가.
- 권장 모델: sonnet
- 이력: 2026-10-03 09:05 감독 등록(축 7 보고, 감독 unpack:120 의 bboxMin 단독 검사 직접 확인, 나머지 수치 미재현). 신규. → 2026-10-03 작업자 처리(제품 feat/point-io c891c29): bbox·비유한·입력 형 검사, checkDeterminism times<2 거부. 전체 npm test 584 중 통과 572·실패 0·건너뜀 12 → 2026-10-03 09:40 감독 확인 닫음(비유한 테스트 4파일 통과, checkDeterminism(x,2,()=>null)·crc32(null) → AssetFormatError 직접 확인, 축 7 bboxMin 1e308 재현 거부)


### F-070 [닫힘] (심각도: 낮음) — PR #12 잔여 테스트 공백
- 위치·고칠 것:
  ① tools/asset_validate/asset_validate.test.mjs:79 — 타일 검사 반복을 `a < 1` 로 줄여도 통과. tileY 손상 사례 추가. (축 4B)
  ② 같은 파일 :87 — anchor 검사를 lat 만 보게 줄여도 통과. lon·alt NaN/Inf 사례 추가. (축 4B)
  ③ server/asset/tile_index/tile_index.test.mjs:38-55 — 기대값을 제품과 같은 floor(e/64) 로 계산(순환). 고정 상수(283/-8/8) 복원. (축 4B)
  ④ client/asset/client_asset.test.mjs:119 — instanceof AssetFormatError 단언 누락. (축 4B)
  ⑤ server/asset/determinism/determinism.test.mjs:155-157 — 기본값=packChunk 비교만 해 둘 다 비결정적이어도 통과. identical === true 단언. (축 4A)
  ⑥ server/asset/fuzz/fuzz.test.mjs:16-17·:220 — 총 예산이 CPU 60 s 로 바뀌고 벽시계 보호가 600 s. 벽시계 보호를 예산의 2~3 배로, :174-184 재시도 통과 건수를 출력. (축 5)
- 확인 기준: 각 변형에서 해당 테스트 fail ≥1, 200 ms 대기 모의 대상으로 퍼저 벽시계 보호 실패 확인.
- 권장 모델: haiku(①~⑤), sonnet(⑥)
- 처리 시점: T04 첫 하위 작업(T04.F)에서 F-068·F-069 와 함께.
- 이력: 2026-10-03 09:05 감독 등록. 신규. → 2026-10-03 작업자 처리(제품 feat/point-io c891c29): 검증기·tile_index·client·determinism 테스트 보강, 퍼저 벽시계 보호 150 s·재시도 통과 건수. 전체 npm test 584 중 통과 572·실패 0·건너뜀 12 → 2026-10-03 09:40 감독 확인 닫음(축 4B 사본 변형 ①②③⑤⑥ 모두 fail 확인, 관련 테스트 감독 직접 통과)


### F-071 [닫힘] (심각도: 높음) — GPS↔ENU 가 skylens geo.ts(등장방형 근사)가 아니라 WGS-84 정확식이다. T04.5·T04.7 완료 기준 미달
- 위치: 제품 feat/point-io c891c29 server/geo/enu/index.mjs:1·30-60·78-103, client/geo/index.mjs:1·22-36, contracts/geo/index.mjs:9-10, server/geo/enu/enu.test.mjs:1·118-131, client/geo/geo.test.mjs:22-39·102-110. 규칙: 연구 RULES.md:22, SPEC.md:29, TASKS T04.5
- 문제: RULES.md:22 는 "skylens src/shared/geo.ts 와 같은 식(등장방형 소영역 근사)" 을 요구한다. skylens develop src/shared/geo.ts 는 공개 저장소(NET-Challenge-S13/skylens, develop)에서 바로 받을 수 있고 식은 `e = Δλ·R·cos(φ0)`, `n = Δφ·R`, `u = alt − alt0`, R = 6378137, 역변환은 그 역이다. 구현은 ECEF 경유 타원체 정확식이라 다른 값을 낸다. 결정 0016 은 "체크아웃 없음" 을 근거로 들었으나 클라우드에서 확인 가능한 항목이다([local] 아님).
- 실패 상황: 감독 직접 재현 — 앵커 (37.5665, 126.978, 30), 무작위 1만 점에서 skylens 식과의 최대 차: 반경 0.1 km 0.32 m, 0.5 km 1.63 m, 1 km 3.32 m, 5 km 19.2 m(기준 ≤ 1 mm). 앱이 보낸 드론·마커 GPS 와 렌더러 점·타일이 m 단위로 어긋난다. 서버-클라이언트 1만 점 대조(geo.test.mjs:102-110)는 같은 식·같은 상수(WGS84)끼리라 이 차이를 못 잡는다(축 4B: WGS84.f 를 1/290 으로 바꿔도 대조 통과).
- 고칠 것: server/geo/enu·client/geo 를 geo.ts 와 같은 식·같은 상수(R = 6378137, cos 는 앵커 위도)로 바꾼다. alt 는 그대로 뺀다. 정확식을 남기고 싶으면 별도 함수 이름으로 두고 기본 경로에서 쓰지 않는다. 테스트: geo.ts 를 그대로 옮긴 기준 함수(출처 주석: skylens develop src/shared/geo.ts, 커밋 해시)로 무작위 1만 점(반경 0.1·1·10·50 km) 차 ≤ 1 mm, 왕복(enuToGps∘gpsToEnu) ≤ 1 mm. 결정 0016 은 기각됐으니 새 결정 기록은 필요 없다(근사식 채택은 RULES 그대로). "구면 근사와 10 m 넘게 어긋나야 한다" 같은 테스트(enu.test.mjs:118-131)는 지운다.
- 확인 기준: 감독이 skylens geo.ts 식으로 같은 1만 점 비교(위 앵커, 반경 0.1~5 km) 최대 차 ≤ 1 mm. client/geo 도 같은 기준. `npm test` 실패 0.
- 권장 모델: opus
- 이력: 2026-10-03 09:40 감독 등록(축 3·5 보고, 감독 skylens develop geo.ts 받아 직접 비교 재현). 신규. PR #13 반려 사유. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 커밋 후속, 연구 experiment/point-io 349339f): geo.ts 식(R=6378137)으로 서버·클라이언트 교체, 기준 함수 대비 최대 차 0 m·왕복 ≤1.4e-9 m, 실제 skylens develop 자산 16개 readPly 성공. 전체 npm test 619 중 통과 607·실패 0·건너뜀 12 → 2026-10-03 10:25 감독 확인 닫음(제품 acb3818: skylens develop 59edcf9 geo.ts 식을 직접 옮긴 기준 함수와 앵커 (37.5665,126.978,30) 무작위 1만 점, 반경 0.1·0.5·1·5 km 에서 서버 gpsToEnu·클라이언트 gpsToEnuClient·역변환 모두 최대 차 0 m. 축 1 무작위 20만 쌍 비트 일치. npm test 619 중 통과 607·실패 0·건너뜀 12)


### F-072 [닫힘] (심각도: 중간) — 좌표 계약이 skylens geo.ts 와 표현·이름이 다르다
- 위치: 제품 feat/point-io contracts/geo/index.mjs:6·13·15, contracts/geo/stubs.mjs:8-16, server/geo/scene/index.mjs:23·28
- 문제: ① Enu 가 배열 [e,n,u] 이고 skylens 는 객체 {e,n,u}. ② skylens 의 gpsToScene·sceneToGps 가 없다. ③ contracts enuToScene([0,0,0]) → [0,0,−0], enuArrayToScene 은 0−n 이라 [0,0,0](deepStrictEqual 불일치).
- 실패 상황: `enuToScene({e:1,n:2,u:3})` → [undefined, undefined, NaN], 오류 없이 조용히 틀린다(축 1 보고, 미확인).
- 고칠 것: 표현을 하나로 정한다. 배열을 유지하면 경계 함수가 배열이 아닌 입력에 GeoError('range') 를 던지고, skylens 객체 ↔ 배열 어댑터를 둔다. gpsToScene·sceneToGps 추가. −0 처리를 한쪽으로 맞춘다.
- 확인 기준: 객체 입력 → GeoError 또는 [1,3,−2], n=0 에서 두 함수 결과 deepStrictEqual 같음, skylens 함수 이름 6개가 모두 있음.
- 권장 모델: sonnet (F-071 과 같은 하위 작업이면 opus)
- 이력: 2026-10-03 09:40 감독 등록(축 1 보고, contracts/geo/index.mjs:6·13 감독 직접 확인). 신규. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 커밋 후속, 연구 experiment/point-io 349339f): 배열 유지·경계 입력 검사·−0 정규화·skylens 이름 6개·어댑터. 전체 npm test 619 중 통과 607·실패 0·건너뜀 12 → 2026-10-03 10:25 감독 확인 닫음(enuToScene({e:1,n:2,u:3}) → GeoError(range), enuToScene([1,0,3]) → [1,3,0], 서버 모듈에 skylens 이름 6개 모두 있음)


### F-073 [닫힘] (심각도: 중간) — 점 입력 모듈의 이상 입력·큰 입력 처리 잔여
- 위치·문제·실패 상황(축 6·7 재현 보고, 감독은 points_stat:25-43 코드만 직접 확인):
  ① server/points/ply_stream/index.mjs:83 — chunkPoints 상한 없음. 헤더 vertexCount=2^31−1, {chunkPoints: 2^31−1} → RangeError(Array buffer allocation failed), PointsError 아님.
  ② tools/points_stat/index.mjs:25-43 — 첫 점으로 min/max 초기화 후 `<`/`>` 비교. [NaN,0,0, 2,2,0] → min x NaN, [0,0,0, NaN,2,0] → NaN 점이 조용히 빠짐. Inf 는 max 로 나옴.
  ③ tools/points_stat/index.mjs:11·49 — count 와 positions.length/3 대조 없음. count=5, 점 2개 → density 1.25(맞는 값 0.5). null 입력은 TypeError.
  ④ contracts/ply/index.mjs:12·15, server/points/ply_read/index.mjs:8 — parsePlyHeader 에 파일 전체를 넘겨 Buffer.from 으로 전체 복사. 67 MB 입력에 약 135 MB 추가 할당.
  ⑤ server/points/ply_stream/index.mjs:58·62 — readPlyStream(null)·문자열 청크가 TypeError. 머리 단계 Buffer.concat 누적이 O(n²)(1바이트 청크 1M 개 40 s).
  ⑥ server/geo/enu/index.mjs:94-103 — enuToGps 결과 유한 검사 없음([1.7e308,1.7e308,0] → alt Infinity). F-071 로 식을 바꾸면 같은 검사를 새 식에 둔다.
- 고칠 것: ① chunkPoints 상한(예: 2^20)과 vertexCount 상한을 PointsError('range') 로. ②③ 비유한 좌표는 거부(PointsError) 또는 건너뛰고 nonFinite 수 보고, 초기값 ±Infinity, 길이 불일치 PointsError('size'). ④ 헤더 탐색은 앞부분(상한 1 MB) subarray 만 넘기거나 복사 없이 래핑. ⑤ 입력 형 검사 → PointsError('header'), 머리 조각은 배열에 모아 마커 찾은 뒤 합친다. ⑥ 결과 비유한이면 GeoError('range').
- 확인 기준: 위 입력 각각 PointsError/GeoError, 두 NaN 위치 입력의 결과가 같고 NaN 미포함, 250만 점 readPly 헤더 단계 추가 할당 ≈ 0, 1바이트 청크 1M 개 머리 입력 1 s 미만.
- 권장 모델: sonnet
- 이력: 2026-10-03 09:40 감독 등록(축 1b·6·7 보고). 신규. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 커밋 후속, 연구 experiment/point-io 349339f): ①~⑥ 처리, 헤더 추가 할당 0 B·1바이트 청크 1M 개 190 ms. 전체 npm test 619 중 통과 607·실패 0·건너뜀 12 → 2026-10-03 10:25 감독 확인 닫음(축 1b·6·7 재현: chunkPoints·vertexCount 상한, 1바이트 청크 1M 개 머리 145 ms, 헤더 단계 추가 할당 0 B, points_stat 비유한·길이 불일치 PointsError. ⑥ 은 비유한 결과는 막지만 범위 밖 결과는 통과 → F-076 으로 분리)


### F-074 [닫힘] (심각도: 낮음) — PR #13 문서·테스트 공백
- 위치·고칠 것:
  ① format/ASSET_FORMAT.md:249 — "Δd 는 lod 0 밀도의 하한" 은 방향이 거꾸로다. Δd 는 의미 있는 점 **간격의 하한(밀도 상한)** 이고 깊이(광선) 방향 값이다. lod 0 은 "도착한 점 전부" 라 Δd 가 lod 0 에 쓰일 자리가 없다. 문장을 "Δd 는 의미 있는 점 간격의 하한(=밀도 상한)이며 깊이 방향 값이다" 로. (축 2)
  ② contracts/points/index.mjs:14 — 27 B 색 이름 red/green/blue 근거 없음. 근거(관례 가정)를 주석에 적는다. 실제 skylens 자산은 모두 56 B(res/static/demo/segments/seg*_step*.ply)이고 감독이 16개 파일 readPly·readPlySafe·identifySegments 로 읽어 모두 성공(점 수 1,147~116,381)했다. 이 실제 헤더(속성 줄 그대로)를 리터럴로 넣은 56 B 테스트를 추가한다. (축 2·5)
  ③ server/points/normals/index.mjs:18-22 — 정규화로 법선 길이(3장 평균의 일치도)를 버리는 근거를 한 줄 적거나 길이 배열을 함께 돌려준다. (축 2)
  ④ server/points/ply_stream/ply_stream.test.mjs:101-129 — 본문 67.5 MB 대비 상한 32 MB 가 커서 절반 보관 누수를 놓친다. 증가량을 0 으로 깎지 말고 기록, 56 B 도 시험, "청크마다 GC 후 보유량" 이라는 측정 방식을 테스트 이름에 적는다. (축 4A·5)
  ⑤ tools/points_stat/points_stat.test.mjs:41-98 — 모든 z=0 이라 `if (z > maxZ)` 를 지워도 통과. z 가 다르고 음수인 점군, NaN·길이 불일치 음성 사례 추가. (축 4A, 변형 생존 보고)
  ⑥ server/points/ply_write/ply_write.test.mjs:64-69 — 헤더 전체를 리터럴 문자열로 비교. (축 4A)
  ⑦ client/geo/geo.test.mjs:22-39·62-68 — "독립 구현" 이 구현을 옮겨 적은 것, 손계산 값에 유도 근거 없음. F-071 로 바뀌면 skylens 식 기준으로 다시 쓴다. :102-110 은 "서버·클라이언트 동치 회귀 감시" 로 이름을 바꾼다. (축 4B)
  ⑧ server/asset/determinism/determinism_nonfinite.test.mjs:11 — times=1 이라 times 검사에서 먼저 던진다. times=2 로. (축 4B)
  ⑨ server/points/ply_robust/ply_robust.test.mjs:64-66·98 — 벽시계 50 ms 단언 대신 할당 크기 또는 여유+최솟값. (축 4A)
  ⑩ server/points/segments/index.mjs:14-15 — 규칙 밖 파일 하나(.DS_Store)로 목록 전체 실패. 규칙 밖 이름은 rejected 로 따로 돌려준다(빠진 수준은 채우지 않는다). (축 3)
  ⑪ server/points/ply_write/index.mjs:43 — 점마다 subarray 뷰 생성, 색은 직접 대입. (축 6)
- 확인 기준: 각 항목 테스트 추가·변형 시 fail, ① 문구에 "밀도의 하한" 없음.
- 권장 모델: haiku(①②③⑥⑧ 문구·단순 테스트), sonnet(④⑤⑦⑨⑩⑪)
- 처리 시점: F-071 과 같은 PR 에서 가능하면 함께. 반려 사유 아님.
- 이력: 2026-10-03 09:40 감독 등록(축 2·3·4A·4B·5·6 보고, ① :249 문구와 ② 실제 자산 읽기는 감독 직접 확인). 신규. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 커밋 후속, 연구 experiment/point-io 349339f): ①~⑪ 처리. 전체 npm test 619 중 통과 607·실패 0·건너뜀 12 → 2026-10-03 10:25 감독 확인 닫음(②~⑪ 확인. ① 은 "밀도의 하한" 은 사라졌으나 새 문장이 Δd 를 다시 시점 거리와 잇는다 → F-068 다시 엶. ⑩ 의 테스트에서 기존 음성 사례 4개가 빠짐 → F-077 ④)


### F-075 [닫힘] (심각도: 높음) — ply_read_header_alloc 테스트가 GC 시점에 따라 실패한다(npm test 간헐 빨간불)
- 위치: 제품 feat/point-io acb3818 server/points/ply_read/ply_read.test.mjs:79-93
- 문제: GC 를 강제하지 않고 `process.memoryUsage().arrayBuffers` 차를 재며 `Math.abs(delta) < 64 KiB` 양측 단언을 한다. 56 B 반복 측정 구간에서 앞 반복의 27 B 버퍼(2,500,000×27 B ≈ 67.5 MB)가 수거되면 delta 가 크게 음수가 된다. 구현은 정상인데 테스트가 실패한다.
- 실패 상황: 감독 직접 재현 — 바뀐 테스트 9파일을 `node --test <파일들>` 로 6회 돌려 2회 실패, 둘 다 `error: '56B: -67508427'`(= 27 B 버퍼 크기). 축 4B 는 10회 중 6회, 단독 15회 중 1회 실패 보고. CI·작업자 npm test 가 무작위로 빨갛게 된다.
- 고칠 것: 측정 전후 GC 강제(ply_stream 테스트와 같은 `v8.setFlagsFromString('--expose-gc')` + `vm.runInNewContext('gc')`), 반복 사이 이전 버퍼 참조 해제 후 GC. 단언은 증가 쪽 단측(`delta < 64 KiB`). 같은 파일 :95-100 readPly 전체 경로 단언도 GC 강제 후 재고, 가능하면 parsePlyHeader 에 넘기는 길이를 직접 확인(축 4B: `parsePlyHeader(Buffer.from(bytes))` 전체 복사 변형이 통과, 미확인).
- 확인 기준: 감독이 같은 9파일 `node --test` 를 20회 돌려 실패 0. contracts/ply 의 `Buffer.from(buf)` 복사 변형은 여전히 fail.
- 권장 모델: sonnet
- 이력: 2026-10-03 10:25 감독 등록(축 4B 보고, 감독 직접 재현 2/6). 신규. PR #13 반려 사유. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 후속, 연구 experiment/point-io): 반려 2회차 수정. 전체 npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 파일 반복 실행 실패 0 → 2026-10-03 10:55 감독 확인 닫음: 바뀐 테스트 7파일 `node --test` 20회 실패 0(81/81), 축 4B 10회·동시 10회 실패 0. contracts/ply Buffer.from 전체 복사 변형 fail 확인(축 4B). 측정 범위 잔여는 F-080.

### F-076 [닫힘] (심각도: 중간) — enuToGps 가 범위 밖 위경도를 오류 없이 돌려주고, 독스트링이 실제 동작과 다르다
- 위치: 제품 acb3818 server/geo/enu/index.mjs:132-134(독스트링)·139-149(enuToGps), :25-26(checkGps), client/geo/index.mjs:18-19
- 문제: 독스트링은 "극 앵커에서 cos φ0 ≈ 0 으로 경도가 넘치면 GeoError" 라 하나 cos(90°)=6.1e-17 이라 결과가 유한해 통과한다. 또 enuToGps 결과가 ±90/±180 밖이어도 그대로 내보내는데 gpsToEnu 는 그 값을 거부해 GPS→ENU→GPS→ENU 연쇄가 깨진다.
- 실패 상황: 감독 직접 실행 — `enuToGps([1,0,0],{lat:90,lon:0,alt:0})` → lon 146706019195.9, `enuToGps([0,1e7,0],{lat:80,lon:0,alt:0})` → lat 169.83, 둘 다 예외 없음. 축 1: 앵커 lon 179.9999 에서 `sceneToGps([100,0,0])` → lon 180.001, 이를 `gpsToScene` 에 넣으면 GeoError.
- 고칠 것: 기본 경로의 값은 geo.ts 와 그대로 두고(F-071 유지), 결과 위도 |lat|>90 또는 극 앵커(|cos φ0| < 1e-12)에서 e≠0 이면 GeoError('range'). 경도는 (−180,180] 로 감싸거나 범위 밖 GeoError 중 하나로 정하고 독스트링에 적는다. 서버 gpsToEnu 에도 클라이언트처럼 결과 유한 검사(`alt 1e308` vs `−1e308` → [0,0,Infinity], 축 7). checkEnu 에 Array.isArray(배열 유사 객체 → TypeError, 축 7).
- 확인 기준: 위 입력들이 GeoError('range'), 날짜변경선 근처 앵커 왕복 테스트, 극 앵커 e=0 은 그대로 통과. 범위 안 1만 점 비교는 여전히 geo.ts 와 0 m.
- 권장 모델: sonnet
- 이력: 2026-10-03 10:25 감독 등록(축 1·7 보고, 감독 직접 실행 확인). 신규(F-073 ⑥ 잔여). → 2026-10-03 작업자 처리(제품 feat/point-io 병합 후속, 연구 experiment/point-io): 반려 2회차 수정. 전체 npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 파일 반복 실행 실패 0 → 2026-10-03 10:55 감독 확인 닫음: enuToGps([1,0,0],극)·([0,1e7,0],lat80)·gpsToEnu(alt ±1e308) 모두 GeoError range, 극 앵커 e=0 통과, array-like TypeError. 극 왕복·lat ±90 왕복 잔여는 F-079.

### F-077 [닫힘] (심각도: 중간) — 점 입력 테스트의 경계·음성 사례 공백
- 위치·문제(①은 감독 직접 확인, ②③ 은 축 4B 변형 시험 보고·미확인):
  ① server/points/segments/segments.test.mjs:29-35 — 기존 음성 사례 'seg0_STEP00250.ply'·'seg01_step00250.ply'·'seg0_step000250.ply'·'dir\\seg0_step00250.ply' 등이 rejected 검사로 옮겨지지 않고 삭제됨(diff 확인). NAME_RE step 을 `[0-9]{5,6}` 으로 바꾼 변형이 통과(보고).
  ② server/points/ply_stream/ply_stream.test.mjs:126-133 — junk 가 정확히 1<<20 이라 `headLen > MAX_HEADER`(index.mjs:99·105)에 닿지 않고 스트림 끝 오류로 'header' 가 난다. 99·105행 제거 변형 통과(보고).
  ③ contracts/ply/ply.test.mjs:59-65 — 상한 경계(정확히 PLY_HEADER_MAX_BYTES 에서 끝나는 헤더 성공, +1 실패, 작은 maxHeaderBytes)를 보지 않는다. 상한 4096 변형 통과(보고).
- 고칠 것: ① 삭제된 사례를 rejected 기대 목록에 되돌린다. ② junk (1<<20)+1 뒤 무한 생성기(상한에서 끊고 이후 청크 미소비), 한 청크에 1 MiB 넘는 junk+end_header, 메시지 /within limit/ 단언. ③ 경계 ±1 과 작은 maxHeaderBytes 경계.
- 확인 기준: 위 변형들(NAME_RE 6자리, 99·105행 제거, 상한 4096·−64)이 각각 fail, 원본 통과.
- 권장 모델: sonnet
- 이력: 2026-10-03 10:25 감독 등록(축 4B 보고, ① 감독 diff 확인). 신규. 반려 사유 아님. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 후속, 연구 experiment/point-io): 반려 2회차 수정. 전체 npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 파일 반복 실행 실패 0 → 2026-10-03 10:55 감독 확인 닫음(축 4B 변형 시험): NAME_RE 6자리 fail, ply_stream 상한 검사(:95) 제거 fail, PLY_HEADER_MAX_BYTES 4096·−64 fail.

### F-078 [닫힘] (심각도: 낮음) — PR #13 재검토 잔여 묶음
- 위치·고칠 것:
  ① server/points/ply_stream/index.mjs:103 — 마커를 찾은 청크 raw 전체를 concat 해 파일 전체를 한 청크로 넘기면 본문을 한 번 더 복사(250만 점 56 B 피크 +172 MB, 축 6 측정). `raw.subarray(0, found+1)` 만 합치고 본문은 subarray 로. 마커 없는 큰 청크는 스캔을 MAX_HEADER 까지로 자르고 복사 전에 상한 검사(축 1b). (sonnet)
  ② server/points/ply_stream/index.mjs:56-57 — `readPlyStream(src, null)` → TypeError. `opts ?? {}`. (haiku)
  ③ client/geo/geo.test.mjs:39·93·136 — 수치 대조가 서울 앵커 하나. 서버 SK_ANCHORS 처럼 남·서반구·고위도·alt≠30 앵커로(축 4A: 클라이언트만 바꾼 변형 3종 생존). (sonnet)
  ④ contracts/geo/index.mjs:10 — WGS84 를 "client/geo 가 쓴다" 는 낡은 주석. (haiku)
  ⑤ server/points/normals/index.mjs:20 — 길이를 버리는 근거에 SPEC.md:69(용도)·renderer_basis §7-4(27 B 에 신뢰도 없음) 근거 줄. (haiku)
  ⑥ contracts/points/index.mjs:10 — "이름·순서·형이 정확히 이렇다" 와 :14 "색 이름은 가정" 이 엇갈림. 10줄을 맞춘다. (haiku)
  ⑦ server/points/ply_stream/ply_stream.test.mjs:126-133 1 s 벽시계, ply_robust.test.mjs:64-74 GC 미강제 최솟값 — 복사 바이트 수 등 결정적 지표로, 또는 시험명을 측정 방식에 맞춘다. (sonnet)
  ⑧ PR 본문 — 건너뜀 12건 사유(실제 skylens 트리 없음 등) 한 줄. (haiku)
- 확인 기준: 각 항목 변형 시 fail 또는 문구 grep.
- 권장 모델: 항목별 표기
- 이력: 2026-10-03 10:25 감독 등록(축 1b·2·3·4A·4B·5·6·7 보고). 신규. 반려 사유 아님. → 2026-10-03 작업자 처리(제품 feat/point-io 병합 후속, 연구 experiment/point-io): 반려 2회차 수정. 전체 npm test 633 중 통과 621·실패 0·건너뜀 12, 바뀐 테스트 파일 반복 실행 실패 0 → 2026-10-03 10:55 감독 확인 닫음: ①②⑦ 축 1b·6·7 확인(본문 복사 없음, opts null 정상, 1 s 단언 제거), ③ 다중 앵커 반영(날짜변경선 한 방향 잔여는 F-079), ④⑤⑥ 문구 반영(⑤ 근거 문구 잔여는 F-081), ⑧ PR 본문 건너뜀 사유 확인.


### F-079 [열림] (심각도: 중간) — GPS↔ENU 경계 왕복 실패와 날짜변경선·경계 테스트 공백
- 위치: 제품 main(PR #13 병합분) server/geo/enu/index.mjs:138·158-161(극 앵커), :162·168(위도 검사), :169-172(−180), client/geo/geo.test.mjs:131-136, server/geo/enu/enu.test.mjs:306-326
- 문제: ① 극 앵커에서 gpsToEnu 가 cos(90°)=6.1e-17 을 곱해 e≈1e-11 을 내는데 enuToGps 는 e≠0 이면 거부해 자기 출력을 못 받는다. ② gps.lat 가 정확히 ±90 이면 반올림으로 90.00000000000001 이 나와 위도 검사에 걸린다. ③ 결과 lon 이 정확히 −180 이면 감싸지 않아 문서의 (−180,180] 과 어긋난다. ④ 클라이언트 날짜변경선 시험이 +360 방향뿐이라 client/geo/index.mjs:29 의 −360 분기를 지운 변형이 생존(서버·클라이언트가 조용히 갈라짐). ⑤ 여러 바퀴 넘는 경도(|lon|>540), Δλ 정확히 ±180, 클라이언트 경계 양성(lat 90·lon 180 허용) 시험 없음.
- 실패 상황: 감독 직접 실행 — `enuToGps(gpsToEnu({lat:89.9,lon:10,alt:0},{lat:90,lon:0,alt:0}),같은 앵커)` → GeoError range. 앵커 {lat:-81.98758417203892,lon:0}, gps {lat:90,lon:0} 왕복 → "위도 범위 밖: 90.00000000000001"(축 1: 무작위 10만 회 중 약 8%). `enuToGps([0,0,0],{lat:0,lon:-180,alt:0})` → lon −180. ④⑤ 는 축 4A 변형 생존 보고(미확인).
- 고칠 것: ① enuToGps 극 판정을 허용오차(|e| ≤ |cosφ0|·R·π)로, 또는 gpsToEnu·gpsToEnuClient 가 극 앵커에서 e=0(문서에 geo.ts 이탈 기록). ② 1e-9° 이내 초과는 ±90 으로 맞추고 그 이상은 거부. ③ 최종 lon === −180 → 180. ④⑤ 반대 방향 날짜변경선 단언, 동치 시험 앵커에 날짜변경선 근처 1곳, 고위도 큰 e 의 여러 바퀴 감싸기 값, Δλ=180 에서 기준 함수와 같음, 클라이언트 doesNotThrow 경계.
- 확인 기준: 앵커 lat ∈ {90,−90}, gps lon ∈ {−180,−10,10,180} 왕복 오류 0; gps.lat=±90 무작위 앵커 10만 회 왕복 실패 0; 위 −180 입력 → 180; client −360 분기 제거 변형·모듈로 제거 변형·`dLon >= 180` 변형이 각각 fail. 범위 안 1만 점 geo.ts 대비 0 m 유지.
- 권장 모델: sonnet
- 이력: 2026-10-03 10:55 감독 등록(축 1·4A·7 보고, ①②③ 감독 직접 재현). 신규(이번 수정분 경계). 반려 사유 아님 → T05.F 로 처리.


### F-080 [열림] (심각도: 중간) — 복사·할당 측정 테스트가 일부 복사를 보지 못한다
- 위치: 제품 main server/points/ply_read/ply_read.test.mjs:87-94·108-117, server/points/test_util/copies.mjs:5-13
- 문제: ① measure 가 호출 뒤에도 GC 를 강제해 남은 메모리만 잰다. 쓰고 버리는 전체 복사가 delta 0 으로 통과. ② countCopies 가 Buffer.from/concat/alloc/allocUnsafe 만 가로채 `TypedArray.prototype.slice`·`ArrayBuffer.prototype.slice`·`Buffer.copyBytesFrom`·`new Uint8Array(view)` 복사를 세지 않는데, ply_stream.test.mjs:196-202·contracts/ply/ply.test.mjs:105-114 가 이를 "복사 없음" 근거로 쓴다. ③ 56B readPly 증가량이 +72.5 MB(열 배열 140 MB)로 앞 반복 잔여 회수가 섞여 상한에 약 67 MB 여유.
- 실패 상황(축 4B 사본 변형, 미확인): parsePlyHeader 를 `Uint8Array.prototype.slice.call(buf)` 전체 복사로 → 50/50 통과. ply_stream/index.mjs:115 본문을 slice 복사로 → 19/19 통과.
- 고칠 것: ① 호출 뒤 settle 제거(측정 전 GC + 단측 단언). ② patch 에 TypedArray·ArrayBuffer slice, Buffer.copyBytesFrom 추가(또는 테스트 이름을 "Buffer API 복사"로 좁힘). ③ 27B·56B 를 별도 test 로 나누고 `out >= cols` 하한 단언.
- 확인 기준: 위 slice 변형 셋이 각각 fail, 원본 통과, 바뀐 테스트 20회 실패 0.
- 권장 모델: sonnet
- 이력: 2026-10-03 10:55 감독 등록(축 4B 보고, 미확인). 신규. 반려 사유 아님 → T05.F.


### F-081 [열림] (심각도: 낮음) — PR #13 병합 후 잔여 묶음
- 위치·고칠 것:
  ① server/points/normals/index.mjs:20 — 주석이 연구 저장소 줄 번호(SPEC.md:69)를 가리키고 법선 길이와 신뢰도를 인과로 잇는다. "방향만 쓰므로 단위화, 3장 평균이라 길이 1 미보장(renderer_basis §7-2), 27 B 에 신뢰도 필드 없음(§7-4)" 으로. (haiku)
  ② format/ASSET_FORMAT.md:249 — "(renderer_basis §11 Q)" 가 화면 픽셀 크기 규칙에 붙어 있다. §11 Q 는 Δd 쪽으로 옮기고 픽셀 크기 규칙에는 "SPEC §2 표, 렌더러 결정". (haiku)
  ③ README.md:63·131 — 날짜변경선 ±360 이탈(|Δλ|>180)을 한국어·English 양쪽에 한 줄. (haiku)
  ④ client/geo/geo.test.mjs:122·174 — 앵커 분할로 점 수가 9996·10008. 총 1만 이상이 되게 올림하거나 노트 표현을 실제 수로. (haiku)
  ⑤ contracts/ply/index.mjs:31 — `Number(t[2])` 가 `0x10`·`1e3` 을 받는다. `/^\d+$/` 검사 후 변환. (haiku)
  ⑥ server/points/ply_stream/index.mjs:337·405 — Buffer 를 source 로 바로 넘기면 "chunk is not a Uint8Array", CRLF 헤더는 원인 없는 "stream ended before end_header". 안내 문구. (haiku)
  ⑦ PR #13 본문 "`enuToGps Exact`" 띄어쓰기 오타(병합돼 기록만).
- 확인 기준: 각 grep 또는 `element vertex 0x10` → 'header' 오류.
- 권장 모델: 항목별 표기
- 이력: 2026-10-03 10:55 감독 등록(축 2·5·7·11 보고, ①②③ 감독 직접 확인). 신규. 반려 사유 아님 → T05.F.
