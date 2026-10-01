# T02.4 클라이언트 경량 래스터라이저 후보 (경로 B)

범위: SPEC §1.2 경로 B 의 "경량 래스터라이저" 후보. 판정 기준은 SPEC §4 S4(클라이언트 3D 번들, 압축 후 ≤ 300 KB, gzip, 3D 관련 청크만 = three·splat 라이브러리·렌더러 코드).
작성일 2026-10-01. 조사 [cloud] 세션: 번들 수치는 이 세션에서 직접 빌드해 잰 값이고, 브라우저 점유율은 외부 출처를 못 열어 확인된 범위만 적는다.

## 1. 측정 방법 (재현 가능)

- 대상 버전: three 0.185.1(skylens develop 의 package.json 과 같은 계열), regl 2.1.1, twgl.js 7.0.0, ogl 1.0.11, @mkkellogg/gaussian-splats-3d 0.4.7. npm 레지스트리(https://registry.npmjs.org/<패키지>/latest)에서 받아 설치.
- 번들러: esbuild 0.28.2, `--bundle --minify --format=esm`(트리셰이킹 켜짐), gzip -9. 후보마다 "점 1개를 그리는 최소 코드"만 진입점으로 썼다.
- 한계: 진입점이 최소 예제이므로 실제 렌더러 코드(LOD·카메라·셰이더·로더)가 더해진다. 아래 수치는 **라이브러리 몫의 하한 추정**이다. skylens 가 쓰는 Vite 8(Rollup 계열)은 esbuild 와 결과가 몇 % 다를 수 있다. 확정 값은 T01.1·T01.2 의 실제 번들 측정과 T12.8 CI 검사가 낸다.
- 출처 URL 로 직접 쓴 것은 패키지 레지스트리(위)뿐이다. bundlephobia·cdn.jsdelivr.net·caniuse.com·MDN 은 이 세션의 네트워크 정책으로 열리지 않았다(차단). 따라서 bundlephobia 수치는 전부 **미확인**이다.

## 2. 후보 비교

| 후보 | gzip 추정(최소 점 렌더 진입점) | brotli | ≤ 300 KB 가능 | 라이선스 | 점 렌더 방식 |
|---|---|---|---|---|---|
| A. WebGL2 직접(점 스프라이트·인스턴스) | 라이브러리 0. 최소 예제 450 B(gzip). 실제 렌더러 자체 코드는 5~30 KB 로 **추정**(근거 없는 가정이므로 T12 에서 실측) | 미측정 | 가능, 여유 최대(≥ 270 KB) | 해당 없음(자체 코드. 의존성 없음) | `gl.POINTS` + `gl_PointSize`, 또는 인스턴스 쿼드(`drawArraysInstanced`)로 원근 크기·원형 스프라이트·법선 셰이딩 |
| B-1. twgl.js(얇은 래퍼) | 10.8 KB | 9.6 KB | 가능 | MIT(레지스트리 license 필드) | 래퍼는 버퍼·프로그램·유니폼 보일러플레이트만 줄인다. 그리기는 A 와 같다 |
| B-2. regl(함수형 래퍼) | 41.3 KB | 36.4 KB | 가능 | MIT(레지스트리) | 선언형 커맨드(`primitive:'points'`, `instances`). WebGL1 중심 설계(WebGL2 전용 기능은 확장 필요, 확인하지 않음). 마지막 릴리스 2.1.1 의 최신성은 미확인 |
| B-3. ogl(소형 3D 라이브러리) | 13.5 KB | 11.5 KB | 가능 | Unlicense(레지스트리). 퍼블릭 도메인 헌정이라 의존성 라이선스 점검(T02.9)에서 별도 확인 필요 | `Mesh` mode `POINTS`, Geometry 인스턴싱 속성. 씬 그래프·카메라 포함 |
| C. three.js 최소(WebGLRenderer+Points+ShaderMaterial, 트리셰이킹) | **130.5 KB** | 108.2 KB | 가능하나 여유 약 170 KB. 이 몫이 라이브러리만이므로 렌더러 코드·로더·UI 를 합쳐도 대체로 안쪽일 가능성이 높지만 T01 실측으로 확정 | MIT(레지스트리) | `Points` + `PointsMaterial` 또는 `ShaderMaterial`/`InstancedBufferGeometry`. 트리셰이킹이 WebGLRenderer 를 대부분 남긴다(점 1개 예제도 130 KB) |
| C'. three.js 전체 네임스페이스(`import * as THREE` 를 전역에 노출) + OrbitControls | 190.9 KB | 156.6 KB | 가능(트리셰이킹을 못 받을 때의 상한 근사) | MIT | 위와 같음 |
| D. WebGPU 직접(`navigator.gpu`) | 라이브러리 0. WGSL·파이프라인 자체 코드 10~40 KB 로 **추정**(근거 없는 가정) | 미측정 | 가능 | 해당 없음 | 포인트 프리미티브는 크기가 1 px 고정(WebGPU `point-list` 에 point size 없음 — 이 세션에서 출처 미확인, 일반 지식) → 스프라이트는 인스턴스 쿼드로 그려야 함. 컴퓨트 컬링·정렬이 가능 |
| D'. three.js `three/webgpu`(WebGPURenderer) | 210.7 KB (WebGL2 폴백 포함) | 미측정 | 가능하나 여유 약 90 KB, 위험 높음 | MIT | TSL 노드 머티리얼. 번들이 커서 이득 대비 부담 |
| 참고. 기존 skylens: three + GaussianSplats3D | 251.9 KB (두 라이브러리 전체 네임스페이스 노출 상한 근사, 앱 코드 제외). GS 라이브러리만 진입 시 197.6 KB | 206.1 KB | **지금도 라이브러리 몫만으론 300 KB 안**. 앱 코드·OrbitControls·peerjs 등이 더해져 실제 값은 T01.1·T01.2 가 낸다 | MIT(레지스트리 license 필드) | Gaussian splat(정렬 + 인스턴스 쿼드). 점 래스터가 아님 |

(주의) 표의 gzip 은 하한 추정이다. S4 는 "3D 관련 청크 전체"이므로 렌더러 코드·셰이더·압축 해제 코드(점 압축 포맷의 디코더 — T02.6)·워커가 따로 더해진다. 압축 디코더가 WASM 이면 그 크기도 3D 청크에 넣는지 감독이 정해야 한다(SPEC §4 측정 방법에는 없음, 미결).

## 3. 후보별 설명

### A. WebGL2 직접
- 장점: 번들 최소, 점 파이프라인(27 B 양자화 파생, renderer_basis §7-4)을 그대로 셰이더에 맞출 수 있다. 법선 기반 뒷면 제거·셰이딩(SPEC §2)을 정점 셰이더에서 처리.
- 단점: 컨텍스트 손실 처리·리사이즈·카메라·텍스처 로딩(관제탑의 위성 드레이프, DEM, 건물 약 6,191동 메시)·픽킹을 전부 자체 구현. 관제탑은 점뿐 아니라 지형·건물 메시와 텍스처도 그려야 해서 자체 구현량이 가장 많다.
- 점 크기: `gl_PointSize` 는 구현마다 상한이 있다(미확인). 큰 점은 인스턴스 쿼드가 안전.

### B. 얇은 래퍼(twgl·regl·ogl)
- twgl 은 래퍼가 가장 얇고(10.8 KB), 상태 관리를 숨기지 않아 A 에 가깝다. ogl 은 카메라·씬·메시·텍스처·OBJ 아닌 최소 기능을 포함해 관제탑 메시 렌더에 더 가깝다(13.5 KB).
- regl 은 41 KB 로 이 셋 중 가장 크고 WebGL1 설계 유산이 있다. 유지보수 활동은 이 세션에서 확인하지 않았다(미확인).
- 유지보수 상태(최근 릴리스 날짜·이슈 처리)는 모두 미확인이므로 후보 확정 전에 확인한다.

### C. three.js 최소
- 이미 팀이 쓰는 라이브러리라 지형·건물·텍스처·카메라·픽킹을 새로 만들 필요가 적다. 점·메시·텍스처 모두 같은 틀.
- 번들 130 KB(최소) ~ 190 KB(전체 네임스페이스) 가 라이브러리 몫. 300 KB 안이지만 SPEC 의 지향("클라이언트에 남는 부담 최소화")으로는 가장 무겁다.
- skylens develop 은 18개 파일이 `import * as THREE from 'three'` 를 쓰고 OrbitControls 와 `@mkkellogg/gaussian-splats-3d` 를 쓴다(소스 `src/` 의 import 집계, 읽기 전용). 네임스페이스 import 자체는 Rollup/esbuild 가 멤버 단위로 트리셰이킹할 수 있으나, 클래스 간 연결 때문에 최소 예제의 130 KB 아래로는 내려가지 않는다.
- 경로 B 에서 GaussianSplats3D 는 불필요해진다(서버가 점 LOD 를 주므로 splat 정렬 불필요). 빼면 약 60 KB 절감(gs 상한 근사 251.9 KB vs three 전체 190.9 KB 의 차).

### D. WebGPU
- 브라우저 지원(확인된 출처만):
  - gpuweb 구현 현황 위키 https://github.com/gpuweb/gpuweb/wiki/Implementation-Status : Chrome 113(Mac·Windows x86/x64·ChromeOS), Android 121(ARM/Qualcomm/Intel, Android 12+), Linux 는 144(Intel Gen12+)·147(NVIDIA 최신 드라이버), 그 밖은 플래그. Firefox 141(Windows), macOS 145~147, Linux·Android 는 Nightly(2026 안정 예정). Safari 26(macOS·iOS·iPadOS·visionOS 기본 활성). 열람 시점 2026-10-01.
  - 점유율(%)은 caniuse·MDN 이 이 세션에서 막혀 **확인된 출처를 못 얻었다 → 미확인.** 웹 검색 결과에 82%·85% 같은 수치를 쓰는 2차 블로그가 있었으나 서로 다르고 1차 출처가 아니어서 채택하지 않는다. 확정 전에 https://caniuse.com/webgpu 를 직접 볼 것.
- 실질 문제: Linux·구형 Android·구형 iOS 가 빠진다. 저사양 모바일은 어차피 경로 A 대상이므로, 경로 B 를 쓰는 고사양 기기만 보면 부담이 줄지만 "고사양 데스크톱 Linux" 같은 케이스가 남는다. WebGL2 폴백을 두면 번들이 늘어 이득이 사라진다.
- WebGL2 점유율도 같은 이유로 미확인(caniuse 차단). 다만 WebGPU 보다 훨씬 넓다는 것은 위 브라우저 구현 현황(WebGPU 가 최신 OS 에만 열림)과 일관된다.

## 4. 라이선스 요약
three·regl·twgl.js·@mkkellogg/gaussian-splats-3d 는 npm 레지스트리 license 필드가 MIT, ogl 은 Unlicense. AGPL·GPL 없음. 의존성 트리 전체 점검은 T02.9 몫이다(이 문서는 직접 의존만 봄).

## 5. 판정 근거 (≤ 300 KB)
- 모든 후보가 라이브러리 몫만으로는 300 KB 안이다. 가장 큰 후보(three/webgpu 210.7 KB)도 안쪽이지만 여유 90 KB 로 렌더러 코드·디코더가 들어가면 위험하다.
- 실질 선택 변수는 "300 KB 가능 여부"가 아니라 관제탑이 필요한 기능(지형 DEM 드레이프, 건물 메시 약 6,191동, 표시 옵션 3종, 픽킹)을 직접 구현할 비용이다.
- S4 의 현재값이 T01 에서 아직 안 정해졌다. 이 문서의 수치는 그 결과가 나오면 다시 대조한다.

## 6. 잠정 의견
번들 크기만 보면 WebGL2 직접(A)과 얇은 래퍼(twgl 또는 ogl)가 가장 여유 있고, three 최소(C)도 라이브러리 몫 약 130 KB 로 300 KB 안에 들어온다. 그래서 크기는 후보를 가르는 결정 요인이 아니고, 구현 비용과 지원 범위가 가른다. 잠정으로는 경로 B 를 WebGL2 기반으로 두고, 관제탑의 지형·건물·텍스처 때문에 처음에는 three 최소 번들(WebGLRenderer, Points, 필요한 머티리얼만, GaussianSplats3D 제거)로 시작해 S4 여유가 부족해지면 ogl 또는 직접 구현으로 내려가는 순서를 제안한다. WebGPU 는 점유율 출처를 확인하지 못했고 Linux·구형 모바일 공백과 폴백 비용 때문에 1단계에서는 기각하고, 번들 이득이 없는 `three/webgpu` 도 기각 후보로 둔다. 이 의견은 최소 예제 기반 추정에 근거하므로 T01.1·T01.2 실측과 T12.8 CI 검사 결과로 확정한다. 최종 결정은 T02.11 과 감독 승인에 맡긴다.
