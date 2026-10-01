# T02.3 비디오 인코더 후보 (2단계 경로 A: 서버 GPU 렌더 → 영상)

범위: SPEC §3·§7 의 제약(웹소켓 TCP 단일 전송, 새 규약은 SPEC §7 에 근거를 쓰고 감독 승인 뒤에 추가)과 SPEC §4 의 경로 A 목표(S6 대역폭 ≤ 8 Mbps, S7 입력→화면 ≤ 150 ms, 동시 30명)를 전제로 한다. 조사 문서이며 코드가 아니다. 웹 검색으로 확인한 사실만 적고, 출처가 없는 수치는 "미확인"으로 둔다. 조사일 2026-10-01. 검색 요약 수준의 확인이므로 채택 전에 원문 재확인이 필요하다.

## 1. 비교 표

| 후보 | 라이선스 | 하드웨어 인코더 | 지연 | 브라우저 디코드 경로 |
|---|---|---|---|---|
| A. NVENC (NVIDIA Video Codec SDK 직접 또는 FFmpeg 경유) | SDK 헤더는 MIT, 런타임에 NVIDIA 독점 바이너리 필요. FFmpeg 쪽은 아래 §2 참조 | NVIDIA GPU 전용. H.264, H.265, AV1 | 저지연 모드에서 "최저 16 ms" (NVIDIA 문서 기술, 조건 미상). 우리 해상도·GPU 기준 실측은 미확인 | H.264/AV1 영상 → WebCodecs `VideoDecoder` 또는 `<video>` (§4) |
| B. VAAPI (libva, FFmpeg `h264_vaapi` 등) | VAAPI 는 MIT. FFmpeg 쪽은 §2 | Linux 의 Intel, 그리고 AMD(Mesa 드라이버, GCN 이상). 코덱 범위는 GPU 세대에 따라 다름 | 미확인 | 위와 동일 |
| C. AMD AMF (FFmpeg `h264_amf` 등) | AMF SDK 는 MIT. 코덱 특허 라이선스는 AMD 가 주지 않으며 사용자가 부담 | AMD GPU. FFmpeg 로 low latency / ultralowlatency 사용 모드 지원 | "저지연 모드는 첫 프레임 인코딩 직후 출력 가능"(정성적). 수치는 미확인 | 위와 동일 |
| D. x264 (소프트웨어, H.264) | GPL v2 또는 x264 LLC 상용 라이선스. 사용 시 MPEG-LA 특허 라이선스가 필요할 수 있음. **GPL 이므로 열람만, 코드·바이너리를 우리 쪽에 들이지 않는다** | 없음(CPU) | 미확인 | H.264 → 위와 동일 (디코드는 브라우저 하드웨어 사용 가능) |
| E. SVT-AV1 (소프트웨어, AV1) | v0.9 이후 BSD-3-Clause-Clear + AOM 특허 라이선스 1.0 (BSD-3-Clause-Clear 자체는 특허 권리를 명시 허여하지 않음) | 없음(CPU) | 미확인 | AV1 → WebCodecs. 브라우저·기기별 AV1 디코드 지원은 별도 확인 필요(미확인) |

### 전송·디코드 구성 (인코더와 독립)

| 구성 | 라이선스·규약 | 지연 | 비고 |
|---|---|---|---|
| F. 웹소켓(TCP) + WebCodecs 디코드 | SPEC §7 부합. 새 규약 없음 | 아래 §3 | 패킷 손실 시 TCP 재전송 대기(head-of-line blocking)가 영상 지연으로 이어짐 |
| G. WebRTC(UDP, 브라우저 내장 디코드) | **SPEC §7 상 새 규약. 감독 승인과 §7 근거 기재 필요** | 일반 소개글 기준 유리하나 출처가 블로그 수준 | 코덱 협상·지터·대역폭 적응을 브라우저가 처리. 서버에 WebRTC 스택 필요 |

## 2. FFmpeg 빌드 구분 (라이선스 주의)

출처: https://www.ffmpeg.org/doxygen/4.0/md_LICENSE.html (검색 결과 요약, 4.0 문서)

- FFmpeg 대부분은 LGPL v2.1+. 선택적 일부는 GPL v2+ 이며 `--enable-gpl` 을 줄 때만 켜지고, 이때 빌드 전체가 GPL v2+ 가 된다.
- libx264·libx265 는 GPL 이라 FFmpeg 에 붙이려면 `--enable-gpl` 이 필요하다. 즉 "FFmpeg + x264" 빌드는 GPL 빌드다. RULES 의 GPL 은 열람만 원칙에 따라 후보 D 는 쓰지 않는다.
- NVENC: 헤더는 MIT 이나 런타임에 독점 바이너리가 필요하고 GPL 과 비호환으로 본다. LGPL 과의 호환은 불확실해서 FFmpeg 는 LGPL 구성에서도 `--enable-nonfree` 를 요구한다. `--enable-nonfree` 빌드는 재배포 불가일 수 있다. 서버 내부에서만 쓰고 배포하지 않는 구성이면 영향이 작을 수 있으나, 이는 법률 판단이 아니므로 사람 확인 필요.
- 따라서 FFmpeg 를 쓴다면 다음이 갈린다: (a) LGPL 빌드에서 하드웨어 인코더만(VAAPI, AMF) 사용, (b) NVENC 는 nonfree 빌드 또는 FFmpeg 를 거치지 않고 NVIDIA SDK/NvPipe 직접 사용. 각 경우 FFmpeg 정적/동적 링크 방식에 따른 LGPL 의무는 T02.9 에서 점검한다.
- 참고: NVIDIA NvPipe(https://github.com/NVIDIA/NvPipe)는 상호작용형 원격 렌더링용 NVENC 래퍼로 소개된다. 라이선스는 이번에 확인하지 않았다(미확인).

## 3. 지연 수치와 출처

| 수치 | 값 | 출처 | 확실도 |
|---|---|---|---|
| NVENC 저지연 모드 인코드 지연 | 최저 16 ms. 저지연 모드는 B-프레임 끔, CBR, VBV 버퍼 매우 작게 | NVIDIA NVENC Video Encoder API Programming Guide https://docs.nvidia.com/video-technologies/video-codec-sdk/13.0/nvenc-video-encoder-api-prog-guide/index.html (검색 결과 요약으로 확인, 해상도·GPU 조건 미확인) | 중간 |
| WebRTC glass-to-glass | 일반 통화 기준 20~100 ms 라는 주장과 0.2~0.5 s 라는 주장이 블로그에 공존 | https://antmedia.io/webrtc-vs-websockets-what-are-the-differences/ , https://getstream.io/blog/webrtc-websocket-av-sync/ 등 상업 블로그 | 낮음. 상충하므로 인용하지 않고 직접 측정 필요 |
| TCP 손실 시 지연 | 손실 한 번에 최소 1 RTT(예: RTT 100 ms 면 100 ms) 대기 | https://getstream.io/blog/webrtc-websocket-av-sync/ 류 블로그 설명 | 원리상 타당, 우리 망 수치는 미확인 |
| VAAPI, AMF, x264, SVT-AV1 인코드 지연 | 미확인 | 이번 조사에서 신뢰할 출처를 찾지 못함 | 미확인 |
| WebCodecs 디코드 지연 | 미확인(구현·OS 별로 다름. macOS H.264 디코드 지연 이슈가 보고됨: https://github.com/w3c/webcodecs/issues/899) | 위 이슈 | 사례만 |

SPEC §4 S7(입력→화면 ≤ 150 ms)은 인코드 외에 렌더, 네트워크, 디코드, 표시를 합친 값이므로, 위 인코드 단독 수치로 달성 여부를 판단할 수 없다. T24 실측 대상.

## 4. 브라우저 디코드 경로

- WebCodecs `VideoDecoder`: Chrome 94+, Edge 94+, Firefox 130+(데스크톱), Opera 80+, Samsung Internet 17+, Safari 26.0+ 에서 지원. Safari 16.4~18.7 은 비디오 인터페이스만 제공. 출처 https://www.testmuai.com/learning-hub/webcodecs-browser-support/ (2차 자료), 규격 https://www.w3.org/TR/webcodecs/ , 문서 https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API .
- 설정 힌트: `hardwareAcceleration`(하드웨어 가속 힌트), `optimizeForLatency`(출력까지 디코드해야 하는 청크 수를 줄이는 힌트). 출처 W3C 규격.
- WebCodecs 는 디코드 큐를 앱이 직접 쥐기 때문에 웹소켓으로 받은 인코딩 청크를 바로 넣어 지연을 줄일 수 있다는 설명이 있으나 출처가 업체 블로그(https://www.stormstreaming.com/blog/webcodecs-low-level-media-encoding-and-decoding-in-the-browser/)라 참고만 한다.
- 저사양 안드로이드(SPEC §5 기준 기기)에서의 WebCodecs 하드웨어 디코드 실제 동작과 지연은 미확인. T24 [local] 실측 필요.
- TASKS T22 는 "클라이언트 `<video>` 화면"으로 적혀 있다. 웹소켓 단일 전송을 유지하면 `<video>` 단독으로는 웹소켓 바이트를 직접 먹일 수 없어(MSE 경유 또는 WebCodecs 필요) T22 문구와 어긋난다. 이 부분은 감독 확인 필요. (MSE 경로는 이번에 조사하지 않았다: 미확인)
- 클라이언트 3D 번들 0(S4 경로 A)은 WebCodecs/브라우저 내장 디코더 사용 시 유지된다.

## 5. 잠정 의견

잠정으로, 인코더는 서버 GPU 벤더에 종속되므로 하나로 못 박지 않고 "하드웨어 인코더 추상화 + NVENC 우선, VAAPI/AMF 대체" 구조를 후보로 둔다. 라이선스 면에서는 x264 가 GPL 이라 제외하고, FFmpeg 는 LGPL 빌드에서 VAAPI/AMF 만 쓰거나, NVENC 는 nonfree 문제를 피해 NVIDIA SDK 직접 호출 쪽이 안전해 보이나 법률 확인은 T02.9 와 사람에게 넘긴다. SVT-AV1 은 BSD 계열이라 라이선스상 가능하나 CPU 인코드 지연·부하(동시 30명)가 미확인이라 폴백 후보로만 둔다. 전송은 SPEC §7 에 따라 웹소켓 + WebCodecs 를 기본안으로 하고, WebRTC 는 TCP 지연이 S7 을 못 맞출 때를 대비한 예비안으로 근거(실측)를 모은 뒤 감독 승인을 요청한다. 모든 지연 수치는 GPU 가 있는 [local] 환경(T21, T24)에서 실측하기 전에는 확정할 수 없다.
