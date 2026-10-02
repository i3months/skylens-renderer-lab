# T02.2 서버 래스터라이저 후보 — 헤드리스 웹 GPU 계열

조사 문서(코드 아님). 조사일 2026-10-01. 근거: SPEC §1·§4·§8·§9, renderer_basis(점 27 B, 법선·색, 투영식), TASKS T02.
표기: 확인한 사실만 쓴다. 확인 못 한 것은 **미확인**. 열람만(AGPL·GPL)에 해당하는 후보는 이 조사에 없다.
이 조사의 후보는 모두 2단계(경로 A, 현황판 저사양) 서버 렌더용이다. 입력은 1단계 경량 자산이다(SPEC §1.4).

## 1. 비교 표

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원 | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| A. 헤드리스 Chromium + Playwright (WebGL2/WebGPU) | Playwright Apache-2.0 [1]. Chromium 본체 BSD 계열(이 조사에서 직접 확인 못 함, **미확인**) | Chromium 의 ANGLE/Dawn 경유: Linux Vulkan·GL, GPU 없으면 SwiftShader(CPU Vulkan) [4][5] | 가능. 헤드리스·헤디드 모두 지원 [1] | Chromium·Firefox·WebKit 모두 구동 [1]. 서버 렌더에는 Chromium 만 쓰면 됨 | WebGL2 `gl.POINTS` + 정점 셰이더 `gl_PointSize`, 또는 WebGPU 인스턴스 사각형/컴퓨트 스플랫. 클라이언트 경량 래스터라이저(B, T12)와 **같은 코드**를 서버에서 재사용 가능 | 높음. Playwright 별 97k [1] | 클라이언트 B 코드 재사용·SwiftShader 로 GPU 없는 CI 검증 가능이 강점. 브라우저 프로세스 1개당 메모리·기동 비용이 약점(수치 **미확인**) |
| B. 헤드리스 Chromium + Puppeteer | Puppeteer Apache-2.0 [2] | A 와 같음(같은 Chromium) | 가능. 기본이 헤드리스 [2] | Chrome·Firefox [2] | A 와 같음 | 높음 | A 와 동급. Playwright 가 다중 브라우저·테스트 도구가 풍부해 A 를 대표로 두고 B 는 대체재로 기록 |
| C. Node 의 Dawn 바인딩(`webgpu` npm, dawn-gpu/node-webgpu) | BSD-3-Clause(Dawn 과 동일) [3] | Vulkan·Metal·D3D12·D3D11·OpenGL·OpenGLES [3] | 가능. 텍스처로 그려 읽어오는 헤드리스 용도 명시 [3] | 브라우저 아님. 웹 플랫폼 통합 없음(캔버스·비디오·이미지 요소 불가) [3] | WebGPU 만. point-list 위상은 점 크기 지정이 없다(WebGPU 사양 일반 지식, 이번 조사에서 별도 출처 미확보)고 알려져 있어 인스턴스 사각형이나 컴퓨트 스플랫 필요 | 중간. 별 112·커밋 162 [3]. 활발하다고 표시됨 [3] | 브라우저 없이 가벼움. 대신 클라이언트 WebGL2 코드 재사용 불가(WebGPU 로 별도 작성). GPU 없는 환경의 소프트웨어 폴백은 **문서에 명시 없음**(lavapipe 같은 소프트웨어 Vulkan 언급만 있음 [3]) |
| D. headless-gl (`gl` npm) | 저장소에 `LICENSES` 파일이 있고 여러 라이선스 포함 [6]. 주 라이선스 이름은 **미확인**(LICENSE 직접 열람 실패) | 호스트의 OpenGL. 리눅스 서버에선 Xvfb + Mesa 소프트웨어 구현 권장 [6] | 가능(윈도우 없이 컨텍스트 생성). 리눅스 헤드리스는 `xvfb-run` 필요 [6][7] | 브라우저 아님. WebGL 1.0.3 지향, WebGL2 는 실험적(`createWebGL2Context`) [6][7] | WebGL1 `gl.POINTS`. 확장은 ANGLE_instanced_arrays·OES_texture_float 등 일부 [7] | 중간. 커밋 1,034, CI 있음, Node 20 이상 프리빌드 [6][7] | GPU 없는 서버(Mesa)에서 단순 설치 가능. 그러나 WebGL2 가 실험적이라 B 경로 코드 재사용·고급 기능에 제약. 라이선스 이름 확인 전에는 후보 보류 |
| E. node-webgl (RenaudRohlinger, ANGLE 기반 Node WebGL1·2) | MIT 기반 + **AI 제한 조항**(AI 시스템 학습·미세조정·평가·개발에 사용 금지, three.js 저장소 예외) [8]. 비표준(OSI 비호환 가능) 조항이라 **쓰지 않는다** 쪽으로 판단, 최종은 감독 | macOS Metal, Windows D3D11, Linux Mesa(llvmpipe·Zink·GPU 드라이버), 폴백 SwiftShader [8] | 가능. 브라우저 없이 three.js 장면 렌더 [8] | 브라우저 아님. WebGL1·2 전체 메서드 커버 주장 [8] | WebGL2 `gl.POINTS` | 낮음~중간. 별 45·커밋 21 [8] | 기술적으론 매력(ANGLE+SwiftShader, WebGL2 완전). 라이선스 조항과 신생성 때문에 기각 후보 |
| F. Deno WebGPU | Deno·wgpu 의 라이선스를 이번 조사에서 확인 못 함, **미확인** | wgpu(Firefox·Servo·Deno 의 WebGPU 핵심)[9]. Linux 는 Vulkan. 소프트웨어 Vulkan(lavapipe)은 wgpu 시험에 쓰임 [9], Deno 에서의 사용 가능 여부 **미확인** | 가능. Deno 의 WebGPU 는 스왑체인 없이 `createCapture`·`copyToBuffer` 로 캡처하는 예제가 있음 [10]. 예제 저장소는 2026-07-30 보관(읽기 전용) [10] | 브라우저 아님. WebGPU 만 | WebGPU. C 와 같은 점 크기 제약 | 중간. 사용 플래그(`--unstable` 여부)는 최신 문서 접근 실패로 **미확인** [10] | Node 로 갈 때보다 런타임을 Deno 로 바꿔야 해 T02.5 결정과 연동. 단독 채택 근거 약함 |

## 2. GPU 없는 환경(소프트웨어 렌더, SwiftShader)

- SwiftShader: CPU 기반 Vulkan 구현. 라이선스 Apache-2.0, Vulkan 1.3 적합성 통과, 활발히 유지 [4].
- 헤드리스 Chromium 은 GPU 가 없으면 SwiftShader 로 WebGL 을 그려 왔다 [5]. 다만 Chromium 이 WebGL 의 SwiftShader 자동 폴백을 폐기해, 최근 버전은 명시적으로 켜지 않으면 컨텍스트 생성이 실패할 수 있다고 한다 [5](검색 요약 출처. 공식 문서 직접 확인은 **미확인**, 막힘).
- 쓰이는 플래그(검색 결과 기준): `--use-gl=angle --use-angle=swiftshader` [5]. 헤드리스에서 WebGPU 는 기본으로 노출되지 않아 `--enable-unsafe-webgpu` 가 필요하다는 보고가 있다 [11]. 정확한 최신 플래그 조합은 로컬 검증 필요(**미확인**).
- headless-gl 은 Mesa 소프트웨어 렌더(+Xvfb)로 GPU 없는 서버에서 동작한다고 문서에 있다 [6]. node-webgl 은 CI 에서 GPU 없이 SwiftShader 로 검증한다고 한다 [8].
- Node Dawn 바인딩은 소프트웨어 폴백이 문서에 명시돼 있지 않다 [3].
- 의미: 정확성·화질(SSIM) 비교·합성 장면 검증은 GPU 없는 [cloud] 세션에서 SwiftShader/Mesa 로 가능성이 높다. **성능(fps·지연·동시 30명)은 소프트웨어 렌더 수치가 GPU 와 무관**하므로 S1·S7·S8 은 [local] GPU 에서만 확정할 수 있다(SPEC §4 측정 방법과 일치).

## 3. 프레임 캡처·인코딩 경로와 비용

수치는 이번 조사에서 확보하지 못했다. 경로 구조와 비용 항목만 적는다. 수치는 **미확인**이며 T16·T20/T21 에서 실측한다.

| 경로 | 후보 | 비용 항목 |
|---|---|---|
| 브라우저 안에서 캔버스 → WebCodecs 인코딩 → 웹소켓 | A·B | GPU→CPU 복사 없이 브라우저 GPU 프로세스에서 인코딩 가능성(하드웨어 인코더 사용 여부는 **미확인**). 페이지↔Node 사이로는 인코딩된 청크만 오감 |
| CDP 스크린캐스트·스크린샷(JPEG/PNG)으로 프레임 받기 | A·B | 프레임마다 픽셀 복사+이미지 인코딩+IPC. 지연·CPU 부담이 커 영상 스트리밍에는 부적합할 가능성이 큼(수치 **미확인**, CDP 문서 접근 막혀 확인 못 함) |
| Node 프로세스에서 `readPixels`/`copyTextureToBuffer` → ffmpeg·NVENC 입력 | C·D·E·F | GPU→CPU 복사(프레임 크기×fps) + 외부 인코더로 파이프. 복사량은 1080p RGBA 기준 프레임당 약 8.3 MB(2048×1080×4 와 같은 산술. 실측 아님) |

- 인코더 후보와 지연 수치는 T02.3 소관이므로 여기서는 연결 지점만 적는다.
- 동시 30명(S8)에서 사용자별 브라우저 컨텍스트를 두면 메모리가 선형으로 늘 가능성이 있다(수치 **미확인**). 렌더러 하나가 여러 시점을 그리는 구조는 Node 바인딩(C)이 유리할 수 있으나 검증 전이다.

## 4. 라이선스 요약 (SPEC §9)

- Apache-2.0: Playwright [1], Puppeteer [2], SwiftShader [4]. 차용 가능, 고지 유지.
- BSD-3-Clause: Node Dawn 바인딩(Dawn 과 동일) [3].
- 불명: headless-gl 주 라이선스 이름, Chromium·Deno·wgpu. 의존성 트리 전수 점검은 T02.9 소관이다.
- 특수 조항: node-webgl 의 AI 제한 조항 [8]. 채택하지 않는 쪽을 권고하며 감독 판단 사항으로 올린다.
- AGPL·GPL 후보: 없음. Mesa(소프트웨어 렌더 계층)의 라이선스는 이번에 확인하지 못함, **미확인**. T02.9 에서 확인.

## 5. 잠정 의견

현 시점 근거로는 헤드리스 Chromium + Playwright(A)를 1순위 검토 대상으로, Node Dawn 바인딩(C)을 2순위로 둔다. A 는 클라이언트 경량 래스터라이저(B 경로, T12)가 WebGL2/WebGPU 로 정해질 경우 같은 코드를 서버에 재사용할 수 있고, GPU 없는 환경에서 SwiftShader 로 정확성 검증이 가능해 [cloud] 세션과 맞는다. 단 브라우저 프로세스 비용과 프레임 캡처 경로(스크린캐스트 대 WebCodecs)가 동시 30명 기준(S8)을 못 맞출 위험이 있어, 이는 로컬 GPU 실측 전에는 판정할 수 없다. C 는 브라우저 없이 가볍지만 WebGPU 전용이라 점 크기 처리를 직접 짜야 하고 소프트웨어 폴백이 문서에 없다. D 는 WebGL2 가 실험적이고 라이선스 확인이 남아 보류, E 는 AI 제한 조항과 낮은 성숙도로 기각 권고, F 는 런타임 결정(T02.5)에 종속된다. 이 의견은 2단계용이며 1단계(B) 자산 포맷을 바꾸지 않는다. 최종 결정은 T02.11 과 감독 승인에 따른다.

## 출처

[1] https://github.com/microsoft/playwright
[2] https://github.com/puppeteer/puppeteer
[3] https://github.com/dawn-gpu/node-webgpu
[4] https://github.com/google/swiftshader
[5] https://www.soft8soft.com/topic/load-3d-model-in-chrome-headless-mode/ , https://issues.chromium.org/issues/40471892 (검색 결과 요약 기준, 본문 직접 열람 못 함)
[6] https://github.com/stackgl/headless-gl
[7] https://github.com/stackgl/headless-gl/blob/master/README.md
[8] https://github.com/RenaudRohlinger/node-webgl
[9] https://gfx-rs.github.io/2021/09/16/deno-webgpu.html (검색 결과 요약 기준)
[10] https://github.com/denoland/webgpu-examples
[11] https://blog.promaton.com/testing-3d-applications-with-playwright-on-gpu-1e9cfc8b54a9 , https://michelkraemer.com/enable-gpu-for-slow-playwright-tests-in-headless-mode/ (검색 결과 요약 기준)

접근 실패로 직접 확인하지 못한 곳: docs.deno.com, developer.chrome.com, chromedevtools.github.io, npmjs.com, screenshotneo.com, barthpaleologue.github.io.
