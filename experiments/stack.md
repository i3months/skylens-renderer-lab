# T02 `stack` — 스택 선정 조사

조사 문서 작업(코드 아님). 연구 `experiment/stack` 의 실험 노트다. 감독 승인 뒤 [SPEC §8](../SPEC.md) 에 옮긴다(TASKS T02).
추천안·기각안·쟁점은 [stack/decision.md](stack/decision.md) 에 있다. 이 문서는 표 틀(T02.0)과 통합 비교표다.

## 1. 비교 표 틀 (T02.0 계약 — 열 고정)

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|

- 열 순서와 이름은 고정이다. 해당하지 않는 칸은 "해당 없음", 노트에서 확인하지 못한 칸은 "미확인"으로 쓴다.
- 결정 근거 칸은 근거 노트 이름과 판정(추천·보류·기각·참고)을 적는다. 판정은 [decision.md](stack/decision.md) 를 따른다.
- 수치는 노트에 있는 것만 옮긴다. 추정은 "추정"으로 표시한다(RULES §3).

## 2. 통합 비교표

각 노트의 후보를 한 줄씩 모았다. 칸 내용은 해당 노트 요약이며 상세·출처는 노트에 있다.

### 2.1 서버 래스터라이저 — 네이티브 GPU API 계열 ([server_native](stack/server_native.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| gsplat | Apache-2.0 | CUDA(NVIDIA 전용) | 서버 라이브러리, 헤드리스 명시는 미확인 | 해당 없음 | CUDA 가우시안 스플랫 래스터 | 별 5.7k, PyPI v1.5.3. 학습 중심 | 참고. CUDA 계열 중 가장 성숙하나 가우시안 전용이라 입력 형식(decision Q1)에 종속 |
| 3DGRUT / 3DGRT | Apache-2.0 | CUDA 11.8+, RT 코어 권장 | 가능(명령줄 렌더) | 해당 없음 | 광선 추적·왜곡 카메라 래스터·하이브리드 | v1.0.0(2025-04), 연구 코드 | 참고(구조만). RT 코어 의존, 요구에 없는 기능 |
| vk_gaussian_splatting | Apache-2.0 | Vulkan 1.4 | 가능(헤드리스 모드) | 해당 없음 | 래스터·RT·하이브리드 | 별 503, 연구 테스트베드 | 참고(구조만). 상용 소프트웨어 아님 |
| wgpu (Rust) | MIT OR Apache-2.0 | Vulkan·Metal·DX12·GL 폴백 | 가능(헤드리스·컴퓨트 명시) | 있음(WebGPU·WebGL2 wasm) | 직접 작성 | Firefox·Servo·Deno 기반 | 2순위 검토(2단계). 벤더 중립, 점 렌더러 직접 작성 비용 |
| Brush | Apache-2.0 | wgpu(Burn 위) | 명령줄 있음, 헤드리스 명시 미확인 | wasm, Chrome 134+ Windows·macOS | 가우시안 스플랫 렌더·학습 | 별 5.1k | 참고. wgpu 로 서버·브라우저 공용 사례. 가우시안 전용 |
| Dawn | BSD-3-Clause | D3D12·Metal·Vulkan·GL 폴백 | 미확인(네이티브 제공) | 크로미움의 WebGPU 구현 | 직접 작성(WGSL, Tint) | "공식 지원 제품 아님" 표기 | 2순위 검토(웹 계열과 함께). C++ 빌드 부담 |
| fast-gaussian-rasterization | MIT(README), 원본 파생 승계 조건 미확인 | OpenGL + CUDA 정렬 | 가능(EGL) | 해당 없음 | 전역 정렬 후 알파 블렌딩, 하드웨어 래스터 | 규모 미확인, 연구 코드 | 열람만(라이선스 승계 미확인) |
| OpenGL/EGL 헤드리스 직접 구현 | API·드라이버(NVIDIA 독점, Mesa 미확인) | NVIDIA EGL | 가능 | 해당 없음 | 점 스프라이트 또는 지오메트리 셰이더 직접 | EGL 은 헤드리스 GL 표준 경로로 소개 | 참고. 가장 단순한 진입, 컴퓨트 정렬은 불편 |
| 원본 3DGS(graphdeco-inria) | Gaussian-Splatting License(상업 이용 금지) | CUDA | 미확인 | 해당 없음 | CUDA 소프트웨어 래스터 | 기준 구현 | **기각**. 열람만, 차용 금지 |

### 2.2 서버 래스터라이저 — 헤드리스 웹 GPU 계열 ([server_web](stack/server_web.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| 헤드리스 Chromium + Playwright | Playwright Apache-2.0, Chromium BSD-3-Clause 형 | ANGLE/Dawn → Vulkan·GL, GPU 없으면 SwiftShader | 가능 | Chromium·Firefox·WebKit | WebGL2 `gl.POINTS` 또는 WebGPU 인스턴스 쿼드. B 클라이언트 코드 재사용 | 높음(별 97k) | **1순위 검토(2단계)**. 코드 재사용, 클라우드 SwiftShader 검증 실측(cloud_scope). 프로세스 비용 미확인 |
| 헤드리스 Chromium + Puppeteer | Apache-2.0 | 위와 같음 | 가능(기본) | Chrome·Firefox | 위와 같음 | 높음 | 대체재로 기록 |
| Node Dawn 바인딩(`webgpu` npm) | BSD-3-Clause | Vulkan·Metal·D3D12·D3D11·GL·GLES | 가능 | 브라우저 아님 | WebGPU 만, 인스턴스 쿼드·컴퓨트 스플랫 필요 | 중간(별 112) | 2순위 검토. 가벼우나 소프트웨어 폴백 문서 없음 |
| headless-gl (`gl` npm) | 주 라이선스 미확인 | 호스트 GL(Xvfb + Mesa) | 가능(`xvfb-run`) | 브라우저 아님, WebGL2 실험적 | WebGL1 `gl.POINTS` | 중간 | 보류(WebGL2 실험적, 라이선스 미확인) |
| node-webgl | MIT + AI 제한 조항 | Metal·D3D11·Mesa, SwiftShader 폴백 | 가능 | 브라우저 아님, WebGL1·2 | WebGL2 `gl.POINTS` | 낮음~중간(별 45) | **기각 제안**(라이선스 조항·신생). 최종은 감독·사람(decision Q5) |
| Deno WebGPU | 미확인 | wgpu, Linux Vulkan | 가능(캡처 예제, 저장소 보관됨) | 브라우저 아님, WebGPU 만 | WebGPU | 중간 | 보류(런타임 교체 필요) |

### 2.3 비디오 인코더·전송(2단계) ([encoder](stack/encoder.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| NVENC | 독점 SDK(헤더 라이선스는 노트 간 불일치·미확인) | NVIDIA 하드웨어 인코더(H.264·H.265·AV1) | 해당 없음 | WebCodecs `VideoDecoder` 로 디코드 | 해당 없음 | 저지연 모드 "최저 16 ms"(조건 미확인) | **추천(우선)**, 드라이버 호출만. 약관·nonfree 요건 사람 확인(decision H1) |
| VAAPI | MIT | Intel·AMD(Linux) | 해당 없음 | 위와 같음 | 해당 없음 | 지연 미확인 | 추천(대체). FFmpeg LGPL 빌드에서 사용 |
| AMD AMF | MIT, 코덱 특허는 사용자 부담 | AMD | 해당 없음 | 위와 같음 | 해당 없음 | 저지연 모드 있음, 수치 미확인 | 추천(대체) |
| x264 | GPL-2.0 | 없음(CPU) | 해당 없음 | H.264 | 해당 없음 | 지연 미확인 | **기각**(GPL) |
| SVT-AV1 | BSD-3-Clause-Clear + AOM 특허 | 없음(CPU) | 해당 없음 | AV1, 기기별 디코드 미확인 | 해당 없음 | 지연·부하 미확인 | 폴백 후보 |
| 웹소켓 + WebCodecs(전송) | SPEC §7 부합 | 해당 없음 | 해당 없음 | Chrome 94+ 등(2차 자료) | 해당 없음 | 저사양 안드로이드 동작 미확인 | **기본안**. TCP head-of-line 지연 위험 |
| WebRTC(전송) | SPEC §7 새 규약 | 해당 없음 | 해당 없음 | 브라우저 내장 | 해당 없음 | 지연 수치 출처 상충 | 보류(예비안, 실측 근거 후 감독 승인) |

### 2.4 클라이언트 경량 래스터라이저(B) ([client](stack/client.md))

gzip 은 esbuild 최소 진입점 기준 하한 추정(client.md §1).

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| WebGL2 직접 | 해당 없음(자체 코드) | WebGL2 | 가능(SwiftShader, cloud_scope 실측) | WebGL2 브라우저(점유율 미확인) | `gl.POINTS` 또는 인스턴스 쿼드 | 해당 없음 | 하위 대안. 450 B, 관제탑 메시·텍스처 자체 구현량 최대 |
| twgl.js | MIT | WebGL | 가능(WebGL2 와 같음) | 위와 같음 | 직접 그리기(래퍼) | 유지보수 미확인 | 하위 대안. 10.8 KB |
| regl | MIT | WebGL(1 중심) | 가능 | 위와 같음 | 선언형 `primitive:'points'` | 유지보수 미확인 | 기각 제안(41.3 KB, WebGL1 유산) |
| ogl | Unlicense | WebGL | 가능 | 위와 같음 | `Mesh` mode `POINTS`, 인스턴싱 | 유지보수 미확인 | 하위 대안. 13.5 KB, 씬·카메라 포함 |
| three.js 최소 | MIT | WebGL2 | 가능 | 위와 같음 | `Points` + `ShaderMaterial`/인스턴싱 | 팀이 이미 사용 | **추천(시작점)**. 130.5 KB, GaussianSplats3D 제거 |
| three.js 전체 네임스페이스 | MIT | WebGL2 | 가능 | 위와 같음 | 위와 같음 | 위와 같음 | 상한 근사(190.9 KB) |
| WebGPU 직접 | 해당 없음 | WebGPU | 인자 필요, 소프트웨어 어댑터만(cloud_scope) | Chrome 113+, Android 121+, Linux 일부, Firefox·Safari 일부 | 인스턴스 쿼드(점 크기 없음, 출처 미확보), 컴퓨트 | 해당 없음 | **기각(1단계)**. 지원 공백·폴백 비용 |
| three.js `three/webgpu` | MIT | WebGPU(+WebGL2 폴백) | 위와 같음 | 위와 같음 | TSL 노드 머티리얼 | 해당 없음 | **기각**. 210.7 KB, 이득 없음 |
| (참고) 기존 three + GaussianSplats3D | MIT | WebGL2 | 가능 | 위와 같음 | 가우시안 스플랫(정렬 + 인스턴스 쿼드) | 현행 | 기준선(상한 근사 251.9 KB) |

### 2.5 자산 처리 서버 언어·런타임 ([runtime](stack/runtime.md))

100만 점 투영 + z버퍼, 단일 스레드, 클라우드 4코어, 5회 반복 최소~최대(runtime.md §3).

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| Node.js 22 / TypeScript | Node MIT, TypeScript Apache-2.0 | 해당 없음(CPU) | 해당 없음 | 클라이언트와 같은 언어 | CPU 점 찍기 37.9~49.4 ms | 제품 저장소 현행 | **추천**. 서버·클라이언트 코드 공유 |
| Rust 1.97 | MIT OR Apache-2.0 | 해당 없음 | 해당 없음 | wasm 가능(번들 영향 미측정) | 25.0~31.7 ms | 해당 없음 | 보류(병목 루프 교체용) |
| Go 1.24 | BSD-3-Clause | 해당 없음 | 해당 없음 | wasm 불리 추정 | 22.7~23.6 ms | 해당 없음 | 보류(코드 공유 없음) |
| C++ (g++ 13.3) | 해당 없음 | 해당 없음 | 해당 없음 | emscripten 미측정 | 20.9~25.2 ms | 해당 없음 | 기각(이점 작음, 빌드·안전 부담) |
| Python 3.11 + numpy | numpy BSD-3-Clause(미확인) | 해당 없음 | 해당 없음 | 없음 | 벡터화 178~252 ms | 해당 없음 | 기각(서버), 지표 도구 용도만 |

### 2.6 점 압축 포맷 선행 사례 ([compression](stack/compression.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| 자체 양자화 포맷(SPZ 설계 참고) | 자체 | 해당 없음 | 해당 없음 | JS 디코더(자체) | 위치 격자 정수·법선 팔면체·색 8비트, 구간×수준 독립 조각 | 해당 없음 | **추천(1차)**. 11 B/점은 추정 |
| Draco | Apache-2.0 | 해당 없음 | 해당 없음 | WASM 디코더(크기 미확인) | 속성별 비트(위치 기본 11), kD-tree 점군 | 성숙 | 비교 후보. 디코더 바이트 먼저 측정 |
| SPZ | MIT | 해당 없음 | 해당 없음 | 미확인(Spark 등 지원) | 위치 24비트 고정소수, 속성별 독립 스트림 + ZSTD | 가우시안용, 법선 없음 | 설계 참고 |
| .ksplat / .splat | MIT | 해당 없음 | 해당 없음 | GaussianSplats3D | 16/8비트 절삭 | 유지보수 종료 | **기각** |
| SOG / Compressed PLY | MIT(도구) | 해당 없음 | 해당 없음 | 이미지 디코더 활용 | 무손실 WebP 격자 | 세부 미확인 | 참고 |
| KHR_gaussian_splatting | Khronos 규격 | 해당 없음 | 해당 없음 | CesiumJS 등 구현 | glTF POINTS 프리미티브, 압축은 확장 위임 | 비준 | 보류(가우시안 전용, Adopter 절차 사람 확인) |
| Potree / LAZ | Potree BSD-2-Clause 형(tiling 확인), LAZ 미확인 | 해당 없음 | 해당 없음 | 미확인 | 다중 해상도 옥트리, LAZ 무손실 | 대용량 사례 | 구조 참고(누적 방식은 규칙 충돌) |
| G-PCC (TMC13) | 미확인 | 해당 없음 | 해당 없음 | 미확인(무거울 것) | 옥트리·RAHT | 표준 참조 구현 | 기각(기준선 용도만) |

### 2.7 3D 타일·LOD 표준 사례 ([tiling](stack/tiling.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| OGC 3D Tiles 1.x | 명세 문서 라이선스 미확인 | 해당 없음 | 해당 없음 | 해당 없음 | 타일 트리, REPLACE/ADD, geometricError(m) 기반 SSE | OGC 표준 | **아이디어 채택**. ENU 격자 (i, j, 구간, 수준)로 단순화, REPLACE = 수준 교체 |
| CesiumJS | Apache-2.0 | WebGL | 해당 없음 | 있음 | 3D Tiles·지형 타일 순회, SSE 임계 | 성숙 | 순회·SSE 부분만 참고·차용 가능. 엔진 전체는 S4 초과로 기각 |
| quantized-mesh | 미확인 | 해당 없음 | 해당 없음 | 해당 없음 | 쿼드트리, 16비트 u·v·높이 양자화 | 지형 표준적 사례 | 관제탑 DEM 양자화 참고 |
| I3S | CC BY-ND 4.0 | 해당 없음 | 해당 없음 | 해당 없음 | 노드 트리·노드 페이지 | OGC 커뮤니티 표준 | 아이디어만(수정 재배포 불가) |
| Potree | BSD-2-Clause 형 | WebGL(three.js) | 해당 없음 | 있음 | 옥트리 노드 점 부분집합, 화면 크기 + 점 예산 | 수십억 점 사례 | 참고·차용 가능. ADD 형은 누적 금지와 충돌, 변형 필요 |
| Nanite 류 | 오픈소스 아님(미확인) | 해당 없음 | 해당 없음 | 해당 없음 | 클러스터 DAG, 화면공간 오차 | 미확인(열람 차단) | 아이디어만, 2단계 이후 |

### 2.8 결합 방식 ([integration](stack/integration.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| (가) skylens 저장소 안 패키지 | skylens 의존성 전체 점검 필요 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 클라이언트 래스터라이저에 채택 제안. 컴파일 검사로 프로토콜 묶임 |
| (나) 별도 서비스(ws `/viewer` 에 뷰어로 접속) | 서비스에 격리 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 자산 처리 서버·2단계 렌더러에 채택 제안. 포트 맵 행 추가 쟁점(decision Q6). COMPONENTS 경계 변경 없음(노트 결론) |

### 2.9 라이선스 점검 ([license](stack/license.md))

후보별 판정 요약. 상세 의존성 목록은 노트에 있다.

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| wgpu | MIT OR Apache-2.0 | (2.1 참조) | | | | | 직접 의존 GPL 없음, 전이 의존성 미확인(`cargo deny` 필요) |
| Dawn | BSD-3-Clause | | | | | | 링크 대상 서드파티 미확인 |
| Chromium / Playwright | Apache-2.0 / BSD-3-Clause 형 | | | | | | Playwright 트리 GPL 없음, Chromium 번들 서드파티 미확인 |
| FFmpeg LGPL 빌드 | LGPL-2.1-or-later | | | | | | 허용(`--enable-gpl`·`--enable-nonfree` 없이, 동적 링크 또는 별도 프로세스) |
| FFmpeg GPL 빌드 | GPL-2.0-or-later | | | | | | **제외** |
| x264 | GPL-2.0 계열 | | | | | | **제외** |
| SVT-AV1 | BSD-3-Clause-Clear + AOM 특허 | | | | | | 확인 범위 GPL 없음, 의존성 미확인 |
| NVENC SDK | 독점, 약관 미확인 | | | | | | 재배포 없이 드라이버 호출만 전제, 사람 확인 |
| three.js / GaussianSplats3D / regl | MIT | | | | | | 없음 |
| Draco | Apache-2.0 | | | | | | 서브모듈 라이선스 미확인, 디코더만 쓰면 의존성 없음 |
| SPZ | MIT | | | | | | zlib 미확인 |
| CesiumJS 계열 | Apache-2.0 | | | | | | 직접 의존 22개 확인, dompurify `MPL-2.0 OR Apache-2.0` |
| ws | MIT | | | | | | 없음 |
| Node.js / Rust | MIT / MIT OR Apache-2.0 | | | | | | 번들 서드파티 미확인 |

(이 표는 라이선스 판정만 모은 것이라 나머지 열은 해당 영역 표를 따른다.)

### 2.10 GPU 없는 클라우드 세션 검증 범위 ([cloud_scope](stack/cloud_scope.md))

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| Chromium 141 + SwiftShader(WebGL2, 기본 인자) | (2.2 참조) | SwiftShader(CPU Vulkan) | 가능(실측) | 해당 없음 | 20만 점 `gl.POINTS` + `readPixels` 성공 | 실측 1회 | 정확성·SSIM·바이트는 [cloud] 완결, 속도는 참고값만 |
| Chromium 141 + SwiftShader(WebGPU, 인자 필요) | (2.2 참조) | SwiftShader | 어댑터·장치 획득까지(실측) | 해당 없음 | 파이프라인 미시험 | 실측 1회 | 계획에 넣기 전 재확인 |
| 하드웨어 GPU 경로(Vulkan·CUDA·NVENC) | 해당 없음 | 없음(`nvidia-smi`·`/dev/dri` 없음) | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | [local] 전용(T20·T21·T24) |

## 3. 노트 목록

| 하위 | 노트 | 요지 |
|---|---|---|
| T02.1 | [stack/server_native.md](stack/server_native.md) | 네이티브 GPU 계열 9개. 잠정: gsplat(성숙) 또는 wgpu/Brush(벤더 중립) |
| T02.2 | [stack/server_web.md](stack/server_web.md) | 헤드리스 웹 GPU 계열 6개. 잠정: Chromium + Playwright 1순위, Node Dawn 2순위 |
| T02.3 | [stack/encoder.md](stack/encoder.md) | 인코더 5개 + 전송 2안. 잠정: 하드웨어 인코더 추상화, ws + WebCodecs |
| T02.4 | [stack/client.md](stack/client.md) | 번들 실측(esbuild). 모든 후보 ≤ 300 KB, 잠정: WebGL2·three 최소에서 시작 |
| T02.5 | [stack/runtime.md](stack/runtime.md) | 5개 런타임 마이크로벤치. 잠정: Node/TS |
| T02.6 | [stack/compression.md](stack/compression.md) | 압축 사례 7개. 잠정: 자체 양자화(SPZ 참고), Draco 비교 |
| T02.7 | [stack/tiling.md](stack/tiling.md) | 타일·LOD 사례 6개. 잠정: 3D Tiles 개념 + ENU 격자 단순화 |
| T02.8 | [stack/integration.md](stack/integration.md) | 결합 지점 파일·줄 근거. 경계 변경 없음, (가)+(나) 혼합 |
| T02.9 | [stack/license.md](stack/license.md) | 후보별 의존성 라이선스. x264·FFmpeg GPL 빌드 제외 시 성립(조건부) |
| T02.10 | [stack/cloud_scope.md](stack/cloud_scope.md) | [cloud]/[local] 경계표. S4·S6(B)·S9(B) 만 클라우드 확정 가능 |
| T02.11 | [stack/decision.md](stack/decision.md) | 추천·기각·SPEC §8 제안·쟁점 목록 |

## 4. 이번 실행의 서브에이전트 구성

| 하위 | 모델 | 개수 | 비고 |
|---|---|---|---|
| T02.1 ~ T02.10 조사 노트 | sonnet | 10 | 하위 작업 하나에 하나씩, 소유 파일 하나씩 |
| T02.0 표 틀 + T02.11 종합(이 문서와 decision.md) | opus | 1 | |
| 승격 | — | 0 | 승격 없음 |

## 5. 상태

- 감독 승인 전. SPEC §8·ops 명령 자리는 고치지 않았다.
- 감독·사람에게 올릴 쟁점은 [decision.md §4](stack/decision.md) 에 있다(입력 점 형식, `SplatChunk.url` 대 ws 단일, 영상 전달 규약, 현황판 입력 역방향, AI 제한 조항, NVENC/FFmpeg 법률 판단 등).
