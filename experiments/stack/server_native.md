# T02.1 서버 래스터라이저 후보 — 네이티브 GPU API 계열

대상: SPEC §1.2 경로 A(2단계, 현황판 저사양 픽셀 스트리밍)의 서버측 GPU 점/스플랫 렌더.
입력은 1단계 자산(LOD·컬링된 조각, SPEC §1.4)이며 원본 전량 순회는 가정하지 않는다.
조사일: 2026-10-01. 근거는 아래 출처 URL 의 README·라이선스 문서에서 확인한 내용만이다.
확인하지 못한 것은 `미확인`으로 적었다. 수치·버전은 출처에 있는 것만 적었다.
이 저장소 문서 중 renderer_basis.md 는 OpenMVS 밀집 점군 생성 원리 문서이며, 서버 렌더러 스택에 대한 규칙은 담고 있지 않다(해당 문서에서 이 노트에 쓰인 것은 점당 27 B 포맷 근거뿐, §7-4).

범례: **열람만, 차용 금지** = AGPL·GPL 계열 또는 상업 이용 금지 라이선스(SPEC §9, RULES §4). 코드·주석을 가져오지 않는다.

## 비교 표

| 후보 | 라이선스 | GPU 백엔드 | 헤드리스 가능 | 브라우저 지원(해당 시) | 점 렌더 방식 | 성숙도 | 결정 근거 |
|---|---|---|---|---|---|---|---|
| gsplat (nerfstudio-project) | Apache-2.0 | CUDA(NVIDIA 전용) | 서버 코드이므로 디스플레이 불필요하나 헤드리스 지원 명시는 미확인 | 해당 없음(서버 라이브러리). 브라우저 지원 언급 미확인 | CUDA 가속 가우시안 스플래팅 래스터화(희소 래스터화 포함) | 별 5.7k, 커밋 1,220, main 은 v1.6.0(PyPI 미배포), PyPI 는 v1.5.3. 학습 중심 프레임워크이며 추론 전용 API 존재 여부는 미확인 | 라이선스 차용 가능. 후보 중 CUDA 래스터라이저로서 가장 성숙. 단 학습 라이브러리라 서버 상시 렌더 서비스용 의존 크기·파이썬 런타임 부담은 미확인. 3DGRUT README 가 gsplat 을 "production-ready" 로 권함 |
| 3DGRUT / 3DGRT (nv-tlabs) | Apache-2.0 | CUDA 11.8+(13.0 까지 실험적), RT 코어 NVIDIA GPU 권장 | 가능. `render.py`·`train.py` 명령줄 렌더 제공 | 해당 없음 | 3DGRT 광선 추적, 3DGUT 래스터(왜곡 카메라), 하이브리드 | v1.0.0 안정판 2025-04. 연구 코드. README 가 운영용으로는 gsplat 권장 | 차용 가능. 반사·굴절 등은 본 프로젝트 요구(§1.1)에 없고 RT 코어 의존이 커서 주 후보 아님. 참고용 |
| NVIDIA vk_gaussian_splatting | Apache-2.0 | Vulkan(Vulkan 1.4 필요, Windows/Linux, NVIDIA 또는 동급) | 가능. 최근 릴리스에 헤드리스 모드·확장 CLI | 해당 없음 | 래스터(VK3DGSR), 광선 추적, 하이브리드, 빌보드 RT, UT | 별 503, 커밋 59. 저자 설명상 연구용 테스트베드이며 상용 소프트웨어 아님 | 라이선스 차용 가능. Vulkan 직접 구현 사례로 구조 참고 가치가 큼. 그대로 서비스에 쓰기에는 테스트베드라 부적합 |
| wgpu (gfx-rs, Rust) | MIT 또는 Apache-2.0 이중 | Vulkan, Metal, DX12, OpenGL(폴백). 웹에서는 WebGPU·WebGL2(wasm) | 가능. 헤드리스·컴퓨트 전용 사용 지원 명시 | 있음(WebGPU, WebGL2 wasm). 같은 코드로 클라이언트 경량 래스터라이저(경로 B)와 공유 가능성이 있으나 번들 크기는 미확인(T02.4 에서 확인) | 라이브러리이므로 점 렌더는 직접 작성. 공개 구현 사례로 Brush 가 있음 | Firefox·Servo·Deno 의 그래픽 기반(출처 서술). WebGPU 사양은 초안 | 라이선스 차용 가능. 벤더 중립이고 서버 GPU 종류에 얽매이지 않음. 점 렌더러를 직접 짜야 하는 비용이 있음 |
| Brush (ArthurBrussee, wgpu 기반 스플랫 렌더·학습) | Apache-2.0 | wgpu(Burn 프레임워크 위) | 명령줄 제공. 헤드리스 가능성은 시사되나 명시는 미확인 | 있음(WebAssembly). Chrome 134+ Windows·macOS 만 지원한다고 README 가 적음 | 가우시안 스플래팅 렌더·학습. 렌더·학습이 gsplat 보다 대체로 빠르다고 README 가 주장(독립 검증은 미확인) | 별 5.1k, 커밋 1,226, 다중 플랫폼 | 라이선스 차용 가능. wgpu 로 서버와 브라우저를 한 코드로 다룬 공개 사례라 경로 A·B 공용 검토 가치가 있음. 서버 헤드리스 안정성은 실측 필요 |
| Dawn (Google, WebGPU 네이티브) | BSD-3-Clause | D3D12, Metal, Vulkan, OpenGL(폴백) | 네이티브 구현 제공. 헤드리스 사용은 가능해 보이나 명시적 서술은 미확인 | 크로미움의 WebGPU 구현체(출처 서술). 서버 사용 시 브라우저 지원은 해당 없음 | 라이브러리이므로 점 렌더는 직접 작성(webgpu.h, WGSL 컴파일러 Tint 제공) | README 에 성숙도 보증 문구 없고 "공식 지원 제품 아님"이라 적힘. 크로미움에서 쓰임 | 라이선스 차용 가능. C++ 의존·빌드 부담이 크고 wgpu 대비 이점 미확인. T02.2(웹 GPU 계열)와 함께 재검토 |
| fast-gaussian-rasterization (dendenxu) | MIT | OpenGL(지오메트리 셰이더) + CUDA 정렬 | 가능. EGL 로 헤드리스·오프라인 렌더 | 해당 없음 | CUDA 로 전역 정렬 후 뒤에서 앞으로 알파 블렌딩, 하드웨어 래스터 사용 | 별·커밋 등 규모는 미확인. 연구 코드. 원본 diff-gaussian-rasterization 알고리즘에서 출발했다고 서술 | README 상 MIT 이나 원본 파생 관계라 승계 라이선스 조건은 미확인이므로 T02.9 에서 확인 후 차용 판단. 그 전까지는 열람만 |
| OpenGL/EGL 헤드리스(직접 구현, 드라이버 측) | 해당 없음(API·드라이버). 드라이버는 NVIDIA 독점, Mesa 라이선스는 미확인 | NVIDIA 드라이버 331 부터 EGL(OpenGL ES, X 서버 없음), 355 부터 데스크톱 OpenGL 전 GPU 에서 가능(출처 서술) | 가능 | 해당 없음 | 직접 작성(점 스프라이트 또는 지오메트리 셰이더) | EGL 은 X 서버 없는 OpenGL 컨텍스트 관리의 표준으로 소개됨. 일부 환경에서 video 그룹 등 장치 파일 권한 필요 | 가장 단순한 진입 경로. 컴퓨트 정렬 등은 OpenGL 에서 불편 |
| 원본 3DGS 래스터라이저(graphdeco-inria) | Gaussian-Splatting License(Inria·MPII). 연구·평가용만. 명시적 사전 동의 없이 상업 목적 사용·배포 금지 | CUDA(컴퓨트 7.0 이상, CUDA SDK 11), SIBR 뷰어는 OpenGL 4.5 | 렌더 스크립트 가능 여부 미확인(뷰어는 GUI) | 해당 없음 | CUDA 소프트웨어 래스터라이저(diff-gaussian-rasterization) | 가우시안 스플래팅의 원본 구현. 사실상 기준 구현 | **열람만, 차용 금지**(상업 이용 금지 조항). 코드·주석을 가져오지 않는다. 필요하면 감독에게 먼저 올린다 |

AGPL·GPL 계열로 확인된 후보: 없음. 다만 위 마지막 행은 AGPL 은 아니지만 상업 이용을 막는 비자유 라이선스라 같은 취급(열람만, 차용 금지)으로 표시했다.
gsplat·3DGRUT·vk_gaussian_splatting·Brush 의 의존성 트리 라이선스는 미확인이며 T02.9 에서 점검한다.

## 미확인·남은 질문

- 서버 상시 서비스에서 후보별 프레임 처리량·동시 30명(S8) 수치: 출처에 없음. [local] 실측 필요(SPEC §4).
- gsplat 의 추론 전용 경로와 헤드리스 서술, Brush 의 헤드리스 서술은 README 에서 확인하지 못했다.
- Mesa EGL 문서(docs.mesa3d.org)와 NVIDIA 블로그 원문은 이 환경에서 접근이 막혀 있어, EGL 항목은 검색 요약에만 근거한다.
- dawn.googlesource.com 은 접근이 막혀 GitHub 미러 README 만 확인했다.
- 가우시안 스플래팅이 아닌 단순 점(점 스프라이트) 렌더 전용 공개 구현은 이 조사에서 확인하지 못했다. 현재 skylens 의 점군이 스플랫인지 점인지는 SPEC §1.1 상 스플랫 씬이다.

## 잠정 의견

잠정 의견(감독 승인 전, 확정 아님): 2단계 서버 래스터라이저는 NVIDIA GPU 를 가정하면 Apache-2.0 인 gsplat(CUDA)이 성숙도 면에서 가장 안전한 출발점이고, 벤더 중립과 경로 B 코드 공유를 중시하면 wgpu(MIT/Apache-2.0)와 그 위의 공개 사례 Brush(Apache-2.0)가 유망하다. 다만 wgpu 계열은 점 렌더러를 직접 작성해야 하고 헤드리스 서버 안정성은 실측이 필요하다. vk_gaussian_splatting 과 3DGRUT 는 구조 참고용으로 두는 것이 낫고, 원본 graphdeco 구현은 상업 이용 금지라 열람만 한다. 어느 쪽이든 T02.2(웹 GPU 계열)·T02.3(인코더)·T02.9(의존성 라이선스)와 [local] 실측 뒤에 결론을 내려야 한다.

## 출처

- gsplat: https://github.com/nerfstudio-project/gsplat
- 원본 3DGS: https://github.com/graphdeco-inria/gaussian-splatting
- 원본 3DGS 라이선스: https://raw.githubusercontent.com/graphdeco-inria/gaussian-splatting/main/LICENSE.md
- wgpu: https://github.com/gfx-rs/wgpu
- Brush: https://github.com/ArthurBrussee/brush
- vk_gaussian_splatting: https://github.com/nvpro-samples/vk_gaussian_splatting
- 3DGRUT: https://github.com/nv-tlabs/3dgrut
- Dawn(미러): https://github.com/google/dawn
- fast-gaussian-rasterization: https://github.com/dendenxu/fast-gaussian-rasterization
- EGL 헤드리스 검색 결과(NVIDIA 블로그 포함): https://developer.nvidia.com/blog/egl-eye-opengl-visualization-without-x-server/
- gsplat 문서 색인: https://github.com/nerfstudio-project/gsplat/blob/main/docs/source/index.rst
