# T02.9 라이선스 점검

조사일: 2026-10-01. 근거: RULES.md §4, SPEC.md §9, TASKS.md T02.9.
방법: npm 레지스트리 메타데이터(`license`, `dependencies`), crates.io API, 각 저장소의 LICENSE 원문(raw 파일). 직접 확인하지 못한 것은 **미확인**으로 적는다. 이 문서는 법률 자문이 아니다. 감독이 최종 판단한다.

접근 제한으로 확인 못 한 출처: ffmpeg.org, videolan.org(x264 공식), developer.nvidia.com 은 차단되어 열지 못했다. FFmpeg 은 저장소의 `LICENSE.md` 원문으로, x264 는 GitHub 미러의 `COPYING` 원문으로 대체했다.

## 1. 의무의 차이: 서버 서비스 vs 클라이언트 번들

| 라이선스 | 서버에서 쓰고 결과물(렌더 이미지·영상 스트림)만 내보낼 때 | 클라이언트 번들에 들어가 사용자에게 배포될 때 |
|---|---|---|
| MIT·BSD·ISC·Apache-2.0 | 의무 거의 없음. 소스 재배포 시 고지 유지 | 번들에 저작권·허가 문구 고지 포함(Apache-2.0 은 NOTICE 도) |
| LGPL-2.1+ | 서버 안에서만 쓰고 바이너리를 배포하지 않으면 배포 의무 자체가 생기지 않는다. 바이너리를 외부에 주면 라이브러리 소스 제공·재링크 가능성 필요 | 배포에 해당. 동적 링크(또는 재링크 가능한 형태)·라이브러리 소스 제공·LGPL 고지 필요. 정적 번들·난독화 번들은 재링크 요건과 충돌하기 쉬움 |
| GPL-2.0+ | 서버 내부 사용만으로는 배포가 아니므로 소스 공개 의무가 생기지 않는 것이 일반 해석. 그러나 GPL 바이너리를 외부에 넘기는 순간(컨테이너 이미지 배포 포함) 결합물 전체가 GPL 대상 | 배포 즉시 번들 전체가 GPL 이 되어 소스 공개 대상. RULES §4 로 금지 |
| AGPL-3.0 | **네트워크 조항(§13)**: 수정한 프로그램을 네트워크로 사용자와 상호작용하게 하면 그 사용자에게 대응 소스를 제공해야 한다. 서버 전용이라도 면제되지 않는다. RULES §4 가 OpenMVS 를 "서버가 AGPL 로 전염" 이라 적은 이유 | 배포 의무는 GPL 과 같고, 네트워크 조항이 추가됨 |
| 독점 SDK 약관 | 약관(EULA)에 따름. 이 문서에서는 내용 미확인 | 재배포 가능 여부는 약관에 따름. 미확인 |

요점: 서버에서만 도는 GPL 은 법적으로 배포 의무를 피할 수 있어도, 프로젝트 규칙(RULES §4)은 "AGPL·GPL 계열 차용 금지, 의존성 트리에도 없어야 함" 이므로 위 완화 해석에 기대지 않는다. 아래 표의 판정은 규칙 기준이다.

## 2. 후보별 표

| 후보 | 라이선스(SPDX) | 주요 직접 의존성과 라이선스 | AGPL/GPL 포함 여부 | 우회책(동적 링크·대체) |
|---|---|---|---|---|
| wgpu (Rust, crates.io 30.0.1) | `MIT OR Apache-2.0` (wgpu·wgpu-core·wgpu-hal·naga 모두 동일, crates.io 확인) | wgpu 직접 의존: arrayvec, bitflags, bytemuck, cfg-if, hashbrown, log, parking_lot, portable-atomic, profiling, raw-window-handle, smallvec, static_assertions, wgpu-core/hal/types(naga·web-sys 등은 선택). 이름은 crates.io 로 확인, 각 crate 라이선스는 개별 확인 안 함(**미확인**). 하위 트리(ash 0.38 은 `MIT OR Apache-2.0` 확인) | 직접 의존 목록 기준 AGPL/GPL 없음. 전이 의존성 전체는 `cargo deny`/`cargo license` 로 실측 필요(**미확인**) | 해당 없음. 빌드 때 `cargo deny check licenses` 로 게이트 |
| Dawn (C++, Google) | `BSD-3-Clause` 계열(LICENSE 원문 확인: 2017-2026 The Dawn & Tint Authors 3조항 형태) | 서드파티는 DEPS 로 관리: abseil-cpp, angle, glslang, directx-shader-compiler, spirv-tools 계열, mesa 등 이름 확인. **각 라이선스는 미확인**(mesa 등 일부는 MIT 계열로 알려져 있으나 이 조사에서 확인하지 않음). 상당수는 테스트·빌드 도구 | 런타임 링크 대상 기준 확인 못함 → **미확인**. 테스트·빌드 도구 중 GPL 이 있을 수 있으나 산출물에 링크되지 않음 | 실제 링크되는 서드파티만 `third_party` 별 LICENSE 로 목록화. Dawn 단독 빌드 산출물 기준으로 재점검 |
| Chromium / Playwright | Playwright·playwright-core 1.63.0: `Apache-2.0`(npm·LICENSE 확인). Chromium: BSD-3-Clause 형(LICENSE 원문 확인) | playwright 직접 의존: playwright-core 하나(npm 확인), 선택 의존 fsevents 는 확인 안 함. Chromium 바이너리는 서드파티가 매우 많음(FFmpeg 포함, 아래 참고) | Playwright npm 트리: 없음(직접 의존 1개, Apache-2.0). **Chromium 바이너리**: 번들된 서드파티 전수는 미확인. Chromium 의 FFmpeg 는 별도 설정이라 GPL 여부는 미확인 | 서버에서 헤드리스로만 호출하고 브라우저를 재배포하지 않으면 배포 의무 없음. 브라우저를 이미지에 넣어 배포하면 Chromium 고지(`about:credits`) 포함 |
| FFmpeg (LGPL 빌드) | 기본 `LGPL-2.1-or-later`(LICENSE.md 원문). `--enable-version3` 시 LGPL-3.0+ | 외부 라이브러리 조합에 따라 달라짐(§3 참고) | 기본 빌드는 LGPL(GPL 아님). 외부 라이브러리 때문에 GPL 이 되는 일이 있음 | `--enable-gpl`·`--enable-nonfree` 를 켜지 않는다. 동적 링크(.so)로 쓰거나 별도 프로세스로 호출 |
| FFmpeg (GPL 빌드) | `GPL-2.0-or-later`(`--enable-gpl` 시, LICENSE.md 원문) | libx264·libx265 등 GPLv2 라이브러리와 결합 | **GPL 포함** | 사용 금지. LGPL 빌드 + 다른 인코더로 대체 |
| x264 | `GPL-2.0-only` 계열(GitHub 미러 COPYING 이 GPL v2 전문. "or later" 여부와 상용 듀얼 라이선스 조건은 공식 페이지가 차단되어 **미확인**) | 단독 라이브러리 | **GPL** | 규칙상 사용 금지. 대체: SVT-AV1·NVENC·(FFmpeg 내장 LGPL 인코더). x264 가 꼭 필요하면 감독에게 먼저 올림 |
| SVT-AV1 | `BSD-3-Clause-Clear` + AOM Patent License 1.0(LICENSE.md·PATENTS.md 원문 확인) | 직접 의존성은 확인 안 함(**미확인**) | 확인한 범위에서 없음. 의존성 트리는 미확인 | FFmpeg 에서 `libsvtav1` 로 쓸 때 FFmpeg 문서는 외부 라이브러리 호환 표에서 별도 분류하지 않음(위 인용 목록에 없음). 호환성은 조합 빌드 시 재확인 |
| NVENC (NVIDIA Video Codec SDK) | 독점(proprietary) SDK 라이선스. 약관 원문은 developer.nvidia.com 차단으로 **미확인** | FFmpeg 은 `ffnvcodec` 헤더를 거쳐 호출. 헤더의 라이선스는 **미확인** | OSS GPL 은 아니나 독점이라 재배포 조건 **미확인**. FFmpeg 쪽 `nvenc` 가 `--enable-nonfree` 를 요구하는지는 이 조사에서 확인 못함 | 서버 GPU 에서 드라이버가 제공하는 NVENC 를 호출만 하고 SDK 파일을 재배포하지 않음. 라이선스 확인 전에는 후보로만 둔다 |
| three.js | `MIT`(npm 0.186.1 확인, 직접 의존성 없음) | 없음 | 없음 | 번들에 MIT 고지 포함 |
| GaussianSplats3D (`@mkkellogg/gaussian-splats-3d` 0.4.7) | `MIT`(npm·저장소 LICENSE 확인) | peer 의존: three(>=0.160.0, MIT). 직접 dependencies 없음 | 없음 | 번들에 MIT 고지 포함 |
| regl 2.1.1 | `MIT`(npm 확인, 의존성 없음) | 없음 | 없음 | 번들에 MIT 고지 포함 |
| Draco (C++ / draco3d 1.5.7) | `Apache-2.0`(npm·저장소 LICENSE 확인) | npm 패키지: 직접 의존성 없음. C++ 소스의 서브모듈: googletest, eigen, tinygltf, gulrak/filesystem(라이선스는 **미확인**; eigen 은 MPL-2.0 계열로 알려져 있으나 이 조사에서 확인 안 함) | 확인한 범위에서 없음. 서브모듈 라이선스 미확인 | wasm/JS 디코더(draco3d)를 쓰면 의존성 없음. 번들에 NOTICE 포함 |
| SPZ (Niantic) | `MIT`(저장소 LICENSE 확인) | zlib 필요(빌드 시 시스템 zlib 또는 FetchContent 로 1.3.2). zlib 라이선스는 이 조사에서 확인 안 함(**미확인**) | 없음(확인한 범위) | JS 로더 `@spz-loader/core` 0.3.1 은 `Apache-2.0`(npm 확인) |
| Cesium 3D Tiles | 사양 문서 라이선스는 이 조사에서 **미확인**(저장소 LICENSE 경로가 404). CesiumJS `cesium` 1.145.0 `Apache-2.0`, `@cesium/engine`·`@cesium/widgets`·cesium-native `Apache-2.0`(확인) | `@cesium/engine` 직접 의존 22개 모두 확인(npm): jsep MIT, lerc Apache-2.0, pako MIT AND Zlib, rbush MIT, urijs MIT, earcut ISC, kdbush ISC, dompurify `MPL-2.0 OR Apache-2.0`, ktx-parse MIT, autolinker MIT, bitmap-sdf MIT, protobufjs BSD-3-Clause, meshoptimizer MIT, @zip.js/zip.js BSD-3-Clause, topojson-client ISC, @spz-loader/core Apache-2.0, mersenne-twister MIT, @tweenjs/tween.js MIT, grapheme-splitter MIT, @cesium/wasm-splats Apache-2.0, draco3d Apache-2.0 | 직접 의존 기준 없음. MPL-2.0 은 약한 카피레프트이며 dompurify 는 Apache-2.0 선택 가능 | 사양만 참고하고 구현은 자체 작성하거나, CesiumJS 를 쓰되 번들 크기(T02.4 ≤ 300 KB)가 문제. 전이 의존성은 미확인 |
| ws (npm 8.22.0) | `MIT`(npm 확인) | 선택 peer: bufferutil MIT, utf-8-validate MIT(확인). 필수 dependencies 없음 | 없음 | 해당 없음 |
| Node.js | `MIT`(저장소 LICENSE 확인). 번들된 서드파티(V8, OpenSSL 등)는 LICENSE 에 모아 두며 개별 확인 안 함 | 미확인 | 번들 서드파티 전수는 미확인 | 공식 배포본 사용, LICENSE 동봉 |
| Rust 표준 도구 | `MIT OR Apache-2.0`(rust-lang/rust COPYRIGHT 확인) | 표준 라이브러리·cargo. 일부 서드파티 파일은 별도 라이선스(COPYRIGHT 에 명시, 이 조사에서 전수 확인 안 함) | 확인한 범위에서 없음 | 빌드에 `cargo deny` 사용 |
| ffmpeg-next (Rust 바인딩, 참고) | `WTFPL`(crates.io 확인) | 링크하는 FFmpeg 빌드의 라이선스가 그대로 적용 | FFmpeg 빌드가 GPL 이면 GPL | 위 FFmpeg LGPL 빌드 규칙을 따른다 |
| rav1e (참고) | `BSD-2-Clause`(crates.io 확인) | 미확인 | 확인 못함 | SVT-AV1 의 대체 후보로만 기록 |

## 3. FFmpeg 외부 라이브러리 영향(LICENSE.md 원문 요약)

- 기본 FFmpeg 는 LGPL-2.1+ 이며 일부 파일(예: vf_hqdn3d, vf_eq 등 필터 다수)이 GPL 이다. `--enable-gpl` 없이는 켜지지 않는다.
- GPLv2 외부 라이브러리: avisynth, frei0r, libcdio, libdavs2, librubberband, libvidstab, **libx264**, **libx265**, libxavs, libxavs2, libxvid. 결합하려면 `--enable-gpl` 이 필요하고 결과물은 GPL 이 된다.
- LGPLv3: gmp, libaribb24, liblensfun → `--enable-version3`.
- Apache-2.0 계열(mbedTLS 등): LGPLv2.1·GPLv2 와 비호환이라 `--enable-version3` 필요.
- smbclient: GPLv3.
- Fraunhofer FDK AAC·OpenSSL: GPL 과 비호환, LGPL 과는 호환으로 알려져 있음. `--enable-nonfree` 를 켜면 바이너리 재배포 불가.

## 4. "후보 전체에 AGPL·GPL 없음" 이 성립하는 조합

성립 조건(확인된 범위 기준):

1. 렌더러: wgpu(`MIT OR Apache-2.0`) 또는 Dawn(BSD 계열), 헤드리스 브라우저 경로는 Playwright(Apache-2.0).
2. 인코딩: FFmpeg **LGPL 빌드**(`--enable-gpl`·`--enable-nonfree` 없음) + SVT-AV1(BSD-3-Clause-Clear) 또는 NVENC(드라이버 호출만, SDK 약관 확인 전제).
3. 클라이언트: three.js·GaussianSplats3D·regl(MIT).
4. 압축·타일: Draco(Apache-2.0)·SPZ(MIT)·CesiumJS 계열(Apache-2.0, 직접 의존에 MPL-2.0 OR Apache-2.0 하나).
5. 서버 통신·런타임: ws(MIT), Node.js(MIT), Rust(MIT OR Apache-2.0).
6. FFmpeg 의 LGPL 의무: 서버에서 동적 링크하거나 별도 프로세스로 호출하고, 바이너리를 배포하면 LGPL 고지와 소스 제공 방법을 둔다. 클라이언트 번들에는 FFmpeg 을 넣지 않는다.

성립하지 않는 후보와 조건:

| 후보/조건 | 이유 | 판정 |
|---|---|---|
| x264 | GPL v2 전문(COPYING 확인) | 규칙상 제외 |
| FFmpeg `--enable-gpl` 빌드 | libx264·libx265 등과 결합하면 GPL(LICENSE.md 확인) | 제외 |
| OpenMVS | AGPL-3.0(RULES §4) | 열람 전용 |

미확인으로 남아 조합 성립이 "조건부"인 항목(감독 승인 전에 실측 필요):

- Dawn 서드파티 링크 대상, Chromium 번들 서드파티, Draco 서브모듈(eigen 등), SVT-AV1 의존성, SPZ·zlib, Node.js 번들 서드파티: 라이선스 확인 못함.
- NVENC SDK 약관: 접근 차단으로 미확인. 재배포하지 않고 드라이버만 호출한다는 전제가 필요.
- x264 의 "or later" 여부와 상용 듀얼 라이선스: 미확인(어느 쪽이든 규칙상 사용 금지).
- 3D Tiles 사양 문서 라이선스: 미확인(코드가 아니라 사양 참고라면 문제가 적으나 확인 필요).
- wgpu 등 Rust·npm 전이 의존성 전체: 이 조사는 직접 의존까지만 확인. 도입 시 `cargo deny`·`license-checker` 로 실측하고 PR 본문에 적는다(RULES §4).

결론: x264 와 FFmpeg GPL 빌드를 제외하면, 확인된 범위에서 후보 전체가 AGPL·GPL 없이 구성 가능하다. 다만 전이 의존성과 위의 미확인 항목은 실측 전까지 "없음" 이라 단정하지 않는다.
