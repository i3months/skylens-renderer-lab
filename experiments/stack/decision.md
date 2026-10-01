# T02.11 추천안과 기각안

작업: T02 `stack` 의 종합. 조사 문서이며 코드가 아니다. 작성일 2026-10-01.
근거: 이 디렉터리의 조사 노트 10개([server_native](server_native.md), [server_web](server_web.md), [encoder](encoder.md), [client](client.md), [runtime](runtime.md), [compression](compression.md), [tiling](tiling.md), [integration](integration.md), [license](license.md), [cloud_scope](cloud_scope.md)), 연구 저장소 [SPEC](../../SPEC.md)·[RULES](../../RULES.md)·[renderer_basis](../../renderer_basis.md)·[TASKS](../../TASKS.md), 그리고 T01 노트 [baseline](../baseline.md).
통합 비교표는 [../stack.md](../stack.md) 에 있다.

원칙: 노트에 있는 사실만 옮긴다. 노트가 "미확인"으로 둔 것은 여기서도 미확인이다. 이 문서가 새로 보탠 판단은 "판단"이라고 적고, 사실처럼 쓰지 않는다.
이 문서는 **감독 승인 전의 제안**이다. 승인 전에는 SPEC §8 을 고치지 않고, T03 이후를 시작하지 않는다(TASKS T02).

---

## 0. 한눈에 보기

| 항목 | 추천(잠정) | 확정 조건 |
|---|---|---|
| 자산 처리 서버 언어·런타임 | **Node.js 22 (ESM)**, 무거운 루프는 `worker_threads`. 병목이 측정되면 그 루프만 네이티브로 바꾼다 | 감독 승인. 병렬·실제 코덱 루프 측정은 T07~T09 에서 |
| 클라이언트 경량 래스터라이저(B) | **WebGL2.** 시작은 three.js 최소 구성(GaussianSplats3D 제거), S4 여유가 모자라면 ogl·twgl 또는 직접 구현으로 내린다. **Q1 결정 전 잠정. 가우시안이면 스플랫 렌더 경로 재평가. 점(27 B)이면 GaussianSplats3D 를 빼 약 60 KB(상한 근사)를 덜고 화질은 점 크기·구멍 처리에 달리며(측정 전), 가우시안(56 B)이면 스플랫 렌더 경로를 유지·재구현해야 해 번들이 그만큼 늘 수 있고 화질은 알파 블렌딩 스플랫 기준이 된다(측정 전)** | T01.1·T01.2 번들 실측, T12.8 CI 문턱, Q1 |
| 서버 래스터라이저(2단계 A) | **확정하지 않는다.** 1순위 검토: 헤드리스 Chromium + Playwright 에서 B 의 WebGL2 래스터라이저를 그대로 돌리는 안. 2순위: wgpu(Rust) 또는 Dawn 기반 네이티브 프로세스 | [local] T20 실측(동시 30명, S8). 1단계 감독 확인 뒤 |
| 비디오 인코더(2단계 A) | **하드웨어 인코더 추상화.** NVENC 우선(드라이버 호출만), VAAPI·AMF 대체. FFmpeg 를 쓰면 LGPL 빌드만 | NVIDIA 드라이버/SDK 약관 사람 확인(H1), [local] T21 지연 실측 |
| 자산 포맷 방향(T03 입력) | 자체 소형 양자화 포맷(SPZ 설계 참고), 구간×수준 독립 조각, ENU 사각 격자 타일 + REPLACE 의미 | T03 계약. 입력이 27 B 점인지 56 B 가우시안인지 먼저 결정(§4 쟁점 Q1) |
| 결합 방식 | 1단계 (가)+(나) 혼합: 클라이언트 래스터라이저는 skylens 클라이언트 쪽, 자산 처리·2단계 렌더러는 별도 프로세스 | 저장소 배치 쟁점(§4 Q7) 해소 |
| 빌드·테스트 | 지금 제품 저장소 관례(`npm test` = `node --test`) 유지 + 헤드리스는 기설치 Playwright 브라우저 | 감독 승인 후 ops/WORKER.md §3 기재 |

---

## 1. 추천안

### 1.1 자산 처리 서버 — Node.js 22 (ESM)

근거(runtime.md, integration.md, license.md, baseline.md):
- 같은 알고리즘(100만 점 투영 + 1280×720 z버퍼, 단일 스레드) 측정에서 Node 37.9~49.4 ms, C++ 20.9~25.2 ms, Rust 25.0~31.7 ms, Go 22.7~23.6 ms, Python+numpy 178~252 ms(runtime.md §3, 이 클라우드 세션 4코어). Node 는 네이티브의 약 2배 안쪽이다. CPU 참조 렌더 8장(고정 시점)에는 충분하다는 것이 runtime.md 의 해석이다.
- 결정적 장점은 **코드 공유**다. 양자화·구간/수준 식별자·체크섬·수준 상태 기계(T03.4·T03.5·T09·T10)를 서버·클라이언트가 한 구현으로 쓰면 SPEC §6 의 "원본 복원 최대 오차" 계약에서 불일치 위험이 준다(runtime.md §5).
- skylens 가 TS 단일 저장소이고(integration.md §2(가): `package.json` 하나, `"type":"module"`), 제품 저장소도 이미 Node 로 돌고 있다(제품 `package.json` 의 `"test": "node --test \"**/*.test.mjs\""`, baseline.md 의 `npm test` 기록).
- 라이선스: Node.js MIT, `ws` 8.22.0 MIT(필수 의존성 없음) — license.md §2.

주의(노트에 적힌 위험):
- Node 는 f64 로 계산해 C++·Rust·Go·numpy 와 화면 픽셀 수가 5 개 달랐다(398,558 대 398,553). f32 교차 검증은 `Math.fround` 등으로 맞춰야 한다(runtime.md §4). 결정성(SPEC §6 "같은 입력 → 같은 바이트")과 직결되므로 T03 계약에 계산 정밀도 규칙을 넣을 것을 제안한다(판단).
- 병렬 실행·실제 LOD/코덱 루프·67 MB I/O 속도는 미측정(runtime.md §7).
- TypeScript 를 쓸지, 쓴다면 빌드 단계(`tsc`)를 둘지 타입 제거만 할지는 노트가 정하지 않았다. runtime.md 는 "Node/TypeScript" 를 제안하지만 TypeScript 7.0.2 가 레지스트리에 있다는 것만 확인했고 빌드 방식은 비교하지 않았다. → 감독 결정 사항(§4 Q10).

### 1.2 클라이언트 경량 래스터라이저(B) — WebGL2, three.js 최소 구성에서 시작

근거(client.md, cloud_scope.md):
- 모든 후보가 라이브러리 몫만으로 S4(≤ 300 KB gzip) 안이다. esbuild 최소 진입점 기준 gzip: WebGL2 직접 450 B, twgl.js 10.8 KB, ogl 13.5 KB, regl 41.3 KB, three 최소 130.5 KB, three 전체 네임스페이스 190.9 KB, `three/webgpu` 210.7 KB(client.md §2, 하한 추정). 그래서 **크기는 가르는 변수가 아니고, 관제탑이 요구하는 지형 DEM·위성 드레이프·건물 약 6,191동·표시 옵션 3종·픽킹의 구현 비용이 가른다**(client.md §5).
- three.js 는 팀이 이미 쓰는 라이브러리라 메시·텍스처·카메라를 새로 만들 필요가 적다. 경로 B 에서는 GaussianSplats3D 가 필요 없어져 약 60 KB 를 덜어낸다(client.md §3 C, 상한 근사 차).
- WebGL2 는 GPU 없는 클라우드 세션에서 기본 인자로 바로 검증된다(Chromium 141 + SwiftShader, 20만 점 `gl.POINTS` 그리기·`readPixels` 성공 — cloud_scope.md §1.2). T12 의 헤드리스 SSIM 시험이 가능하다.
- 라이선스: three MIT, ogl Unlicense, twgl MIT, regl MIT(client.md §4, license.md §2).

순서 제안(client.md §6 을 따름): three 최소(WebGLRenderer·Points·필요한 머티리얼) → S4 여유가 모자라면 ogl 또는 twgl → 직접 구현.
점 크기: `gl_PointSize` 상한은 구현마다 다르다(미확인). 큰 점은 인스턴스 쿼드가 안전하다(client.md §3 A). 모바일 GPU 의 점 크기 한계는 [local] 확인 대상(cloud_scope.md §4 T12).

### 1.3 서버 래스터라이저(2단계 A) — 후보를 좁히되 확정하지 않는다

확정하지 않는 이유: 이 영역의 결정 변수(동시 30명 처리량, 프레임 캡처·인코딩 경로의 지연, 브라우저 프로세스당 메모리)가 **모든 노트에서 미확인**이다(server_native.md 미확인 절, server_web.md §3, encoder.md §3). cloud_scope.md 는 이 판단이 [local] 이라고 명시한다(§6). TASKS 도 2단계를 "1단계 감독 확인 뒤에 상세화"로 둔다.

좁힌 후보(판단, 근거 노트 병기):

| 순위 | 후보 | 왜 | 남은 위험 |
|---|---|---|---|
| 1 | 헤드리스 Chromium + Playwright 에서 B 의 WebGL2 래스터라이저 재사용 | B 와 **같은 코드**를 서버에서 돌린다(server_web.md §1 A). 클라우드에서 SwiftShader 로 정확성 검증이 실제로 된다(cloud_scope.md §1.2). 1단계 포맷을 그대로 입력으로 쓰는 SPEC §1.4 와 맞는다. Playwright Apache-2.0(license.md) | 브라우저 프로세스당 메모리·기동 비용 미확인, 사용자별 컨텍스트면 메모리가 선형 증가할 가능성(server_web.md §3). 캔버스 → WebCodecs 인코딩이 하드웨어 인코더를 쓰는지 미확인. CDP 스크린캐스트는 영상용으로 부적합할 가능성이 큼(수치 미확인) |
| 2 | wgpu(Rust) 네이티브 프로세스, 또는 Dawn(C++)/Node Dawn 바인딩 | 벤더 중립, 헤드리스·컴퓨트 전용 지원 명시(server_native.md wgpu 행). 한 프로세스가 여러 시점을 그리는 구조에 유리할 수 있음(server_web.md §3, 검증 전). wgpu `MIT OR Apache-2.0`, Dawn BSD-3-Clause(license.md) | 점 렌더러를 직접 작성. WebGPU `point-list` 에 점 크기가 없다는 것은 노트 모두 "일반 지식, 출처 미확보"로 적음. Node Dawn 바인딩은 소프트웨어 폴백이 문서에 없음. 전이 의존성 라이선스 미확인 |
| 참고 | gsplat(CUDA, Apache-2.0), Brush(wgpu, Apache-2.0) | gsplat 은 CUDA 래스터라이저 중 가장 성숙(server_native.md). Brush 는 wgpu 로 서버·브라우저를 한 코드로 다룬 공개 사례 | 둘 다 **가우시안 스플랫** 렌더러다. 1단계 자산이 법선 있는 색 점이면(compression.md §0) 그대로 맞지 않는다. 입력 형식 결정(§4 Q1)에 종속. 의존성 트리 라이선스는 license.md 에서 점검되지 않음 |

### 1.4 비디오 인코더(2단계 A) — 하드웨어 인코더 추상화

근거(encoder.md, license.md):
- 구조: 서버 GPU 벤더에 종속되므로 "인코더 추상화 + NVENC 우선, VAAPI/AMF 대체"(encoder.md §5).
- NVENC 저지연 모드 "최저 16 ms" 는 NVIDIA 문서를 검색 요약으로 본 값이며 해상도·GPU 조건 미확인(encoder.md §3). 그 밖의 인코더 지연은 전부 미확인. S7(A ≤ 150 ms) 달성 여부는 인코드 단독 수치로 판단할 수 없다.
- FFmpeg 를 쓴다면 `--enable-gpl` 없이 LGPL 빌드, 동적 링크 또는 별도 프로세스 호출(license.md §4). NVENC 는 SDK 파일을 재배포하지 않고 드라이버가 제공하는 것을 호출만 한다는 전제(license.md §2). 약관 원문은 미확인.
- SVT-AV1(BSD-3-Clause-Clear + AOM 특허 라이선스)은 라이선스상 가능하나 CPU 지연·부하가 미확인이라 폴백 후보로만(encoder.md §5).
- 브라우저 디코드: 웹소켓 + WebCodecs `VideoDecoder` 가 SPEC §7(ws 단일)을 지키는 기본안(encoder.md §1 F). 저사양 안드로이드에서의 하드웨어 디코드 동작·지연은 미확인.

### 1.5 자산 포맷·타일링 방향(T03 에 넘길 입력)

근거(compression.md, tiling.md). T03 계약이 정할 일이며 여기서는 방향만 제안한다.
- 포맷: 자체 소형 양자화 포맷 — 위치는 조각 상자 기준 정수 격자, 법선 팔면체, 색 8비트, 구간×수준당 독립 조각, 그 위에 zstd 또는 브라우저 내장 압축. SPZ(MIT)의 속성별 독립 스트림·고정소수 위치 설계를 참고한다(compression.md §4). 엔트로피 이득이 더 필요하면 Draco(Apache-2.0)를 수준별 조각에 적용하는 안을 비교하되, WASM 디코더 크기를 먼저 잰다(미확인).
- 구간당 3 MB(S6)는 압축보다 **수준별 점 수 감축(LOD)** 이 좌우한다는 것이 compression.md 의 판단이다. 11 B/점 양자화(약 2.5배 축소)는 compression.md 의 "우리 추정"이며 측정 전이다.
- 타일: 3D Tiles 개념(타일 트리, REPLACE, geometricError(m) 기반 SSE)을 아이디어로 가져와 ENU 사각 격자 (i, j, 구간, 수준) 색인으로 단순화. REPLACE 는 RULES §1.1 "교체·누적 금지"와 같은 의미다(tiling.md §2-1).
- 선택 기준: SSE 를 기본, 거리 제곱 근거(Δd ≈ d²/(f·b), renderer_basis §3-7·§9)는 수준별 geometricError 표에 반영(tiling.md §3, 그 노트의 추정).
- 관제탑 DEM 은 quantized-mesh 식 16비트 상대 양자화를 참고(타일 512 m 이면 약 1.6 cm 단계 — tiling.md §2-3 의 계산).
- 코드 차용 후보: CesiumJS(Apache-2.0), Potree·PotreeConverter(BSD-2-Clause 형식, tiling.md 가 LICENSE 원문 확인). 아이디어만: 3D Tiles 명세, quantized-mesh 문서, I3S(CC BY-ND 4.0), Nanite.

### 1.6 결합 방식

integration.md §5 를 따른다(COMPONENTS 경계 변경 없음 — 그 노트의 결론).
- 자산 처리 서버: (나) 별도 프로세스. 입력은 `splat-chunk.url` 이 가리키는 모델 결과, 코어 연결은 `orchestrator.ts` `onChunk` 전후의 "자산 준비됨" 메시지 하나(기존 `splat-chunk` 필드 추가 또는 새 kind).
- 클라이언트 경량 래스터라이저: (가) 구조상 `statusview/`(`statusViewer.ts` `ingestSplatChunk`, `splatScene.ts` `loadFinal`) 교체 지점과 관제탑의 `shared/viewer/sources/` 쪽.
- 2단계 서버 렌더러: (나). 코어 `ws /viewer` 에 뷰어로 붙어 `splat-chunk` 를 받는 데까지가 기존 규약 안이다.
- 단, 이 배치는 RULES §2 의 저장소 분리(제품 코드는 `i3months/skylens-renderer`)와 어떻게 맞물리는지 노트가 다루지 않았다(§4 Q7).

---

## 2. 기각안과 이유

| 기각(또는 보류) | 영역 | 이유 | 근거 노트 |
|---|---|---|---|
| x264, FFmpeg `--enable-gpl` 빌드 | 인코더 | GPL. RULES §4 "AGPL·GPL 계열 차용 금지, 의존성 트리에도 없어야" | encoder.md §2, license.md §4 |
| 원본 3DGS 래스터라이저(graphdeco-inria) | 서버 래스터 | 상업 이용 금지 비자유 라이선스. 열람만 | server_native.md |
| node-webgl(RenaudRohlinger) | 서버 래스터(웹) | MIT 기반에 AI 시스템 사용 금지 조항이 붙은 비표준 라이선스, 별 45·커밋 21 로 신생. 최종은 감독(§4 Q5) | server_web.md §1 E·§4 |
| WebGPU 직접 / `three/webgpu` (1단계 클라이언트) | 클라이언트 | Linux·구형 Android·구형 iOS 공백(gpuweb 구현 현황 위키), WebGL2 폴백을 두면 번들 이득이 사라짐. `three/webgpu` 는 210.7 KB 로 여유 약 90 KB. 클라우드에서는 인자를 줘야 소프트웨어 어댑터만 얻음 | client.md §3 D·§6, cloud_scope.md §6 |
| regl | 클라이언트 | 크기 자체는 통과(41.3 KB)지만 셋 중 가장 크고 WebGL1 설계 유산, 유지보수 미확인. ogl·twgl 이 더 작다 | client.md §3 B |
| Python + numpy (서버 런타임) | 런타임 | 네이티브의 약 8배 느림. 화질 지표 보조 도구 정도로만 | runtime.md §3·§8 |
| C++ (서버 런타임) | 런타임 | 속도 이점이 Rust·Go 와 구분되지 않고, 코드 공유 이득 없음·메모리 안전·빌드 체계 부담 | runtime.md §4 |
| Rust·Go (자산 처리 서버 주 언어) | 런타임 | 속도는 Node 의 약 2배이나 클라이언트와 코드 공유가 안 됨. 병목이 측정되면 그 루프만 교체하는 길로 **보류** | runtime.md §5·§8 |
| headless-gl (`gl` npm) | 서버 래스터(웹) | WebGL2 가 실험적, 주 라이선스 이름 미확인 → **보류** | server_web.md §1 D |
| Deno WebGPU | 서버 래스터(웹) | 런타임을 Deno 로 바꿔야 하고 예제 저장소가 보관(읽기 전용)됨. 단독 채택 근거 약함 → **보류** | server_web.md §1 F |
| 3DGRUT, vk_gaussian_splatting | 서버 래스터 | 라이선스는 가능(Apache-2.0)하나 각각 RT 코어 의존·연구 테스트베드. 구조 참고용 | server_native.md |
| fast-gaussian-rasterization | 서버 래스터 | README 는 MIT 이나 원본 파생 관계라 승계 조건 미확인. license.md 도 점검하지 않음 → 열람만 | server_native.md |
| CDP 스크린캐스트로 프레임 받기 | 2단계 캡처 | 프레임마다 픽셀 복사·이미지 인코딩·IPC. 영상용으로 부적합할 가능성이 큼(수치 미확인) | server_web.md §3 |
| .ksplat | 압축 | 비트 절삭만, 엔트로피 코딩 없음. 저장소 유지보수 종료 | compression.md §1-3 |
| G-PCC(TMC13) | 압축 | 디코드가 무겁고 브라우저 이식 불확실. 라이선스 조건 미확인. 서버 측 기준선 용도만 | compression.md §1-7 |
| KHR_gaussian_splatting | 압축·타일 | 가우시안 전용, Khronos Adopter 절차 문제는 사람 확인 필요 → **보류**(타일링과 함께 재검토) | compression.md §1-5 |
| CesiumJS 엔진 전체를 클라이언트에 | 타일 | WebGL 지구본 전체라 S4 300 KB 에 맞지 않음. 순회·SSE 부분만 읽고 직접 구현 | tiling.md §2-2 |
| Potree 옥트리를 그대로(ADD 형) | 타일 | 상위 점을 하위가 재사용하는 누적 방식이 RULES §1.1 "누적 금지"와 충돌. 수준별 완전 교체 + 점 ID 중복 제거 변형 필요 | tiling.md §2-5 |
| I3S·Nanite 코드 | 타일 | CC BY-ND 4.0 / 오픈소스 아님. 아이디어만 | tiling.md |
| WebRTC 전송 | 2단계 전송 | SPEC §7 상 새 규약. TCP 지연이 S7 을 못 맞춘다는 실측이 나오기 전에는 **보류**(예비안) | encoder.md §1 G·§5 |

---

## 3. SPEC §8 표에 채울 구체 제안

감독 승인 전이므로 SPEC 은 고치지 않는다. 승인되면 아래를 SPEC §8 에 옮기고 ops/WORKER.md §3·ops/SUPERVISOR.md 명령 자리를 채운다(TASKS T02 "완료 후").

| 항목 | 결정(제안) | 근거 |
|---|---|---|
| 서버 언어·런타임 | Node.js 22, ESM(`"type":"module"`). 무거운 가공은 `worker_threads`. 웹소켓은 `ws`(MIT). 측정으로 병목이 드러난 루프에 한해 Rust 또는 C++ 네이티브·wasm 교체를 허용(별도 승인). TypeScript 채택 방식은 감독 결정(§4 Q10) | runtime.md §3·§5·§8 (100만 점 Node 37.9~49.4 ms, 네이티브 약 2배 안쪽, 코드 공유), license.md(Node·ws MIT), 제품 `package.json`·baseline.md(이미 Node 로 운영) |
| 서버 래스터라이저(2단계) | **보류(T20 [local] 에서 확정).** 1순위 검토: 헤드리스 Chromium + Playwright 로 B 클라이언트 래스터라이저 재사용. 2순위: wgpu(Rust) 또는 Dawn 기반 네이티브. 인코더는 하드웨어 인코더 추상화(NVENC 우선, VAAPI·AMF 대체, FFmpeg 는 LGPL 빌드만, x264 금지) | server_web.md §5, server_native.md 잠정 의견, encoder.md §5, license.md §4, cloud_scope.md §6(성능 근거는 [local]) |
| 클라이언트 경량 래스터라이저(B) | WebGL2. three.js 최소 구성(WebGLRenderer·Points·필요한 머티리얼, GaussianSplats3D 제거)으로 시작, S4 여유 부족 시 ogl 또는 twgl 또는 직접 구현. WebGPU 는 1단계 제외. **Q1 결정 전 잠정. 가우시안이면 스플랫 렌더 경로 재평가. 점(27 B)이면 GaussianSplats3D 를 빼 약 60 KB(상한 근사)를 덜고 화질은 점 크기·구멍 처리에 달리며(측정 전), 가우시안(56 B)이면 스플랫 렌더 경로를 유지·재구현해야 해 번들이 그만큼 늘 수 있고 화질은 알파 블렌딩 스플랫 기준이 된다(측정 전)** | client.md §2·§6 (three 최소 130.5 KB gzip 하한), cloud_scope.md §1.2(WebGL2 SwiftShader 검증 가능) |
| 빌드·테스트 명령 | 아래 소표 | 제품 `package.json`, baseline.md, client.md §1, cloud_scope.md §1.2·§5, license.md §4 |

빌드·테스트 명령 소표(제안). "있음"은 이미 제품 저장소·노트에서 실제로 쓴 명령, "제안"은 아직 아무도 돌려 보지 않은 것이다.

| 용도(ops/WORKER.md §3) | 명령 | 상태 |
|---|---|---|
| 단위 테스트 | `npm test` (= `node --test "**/*.test.mjs"`) | 있음(제품 `package.json`). baseline.md: Node 22 에서 `node --test <디렉터리>` 가 동작하지 않아 글롭을 쓴다 |
| 헤드리스 클라이언트 테스트 | `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm test` (기설치 Chromium, `playwright install` 안 함). WebGPU 가 필요한 시험만 localhost 출처 + `--enable-unsafe-webgpu --enable-features=Vulkan --use-angle=swiftshader --enable-unsafe-swiftshader`. WebGL2 시험도 기본 인자에 기대지 않고 SwiftShader 인자 `--use-angle=swiftshader --enable-unsafe-swiftshader` 를 명시한다(판단, 아래 §4.3) | 있음(baseline.md, cloud_scope.md §1.2·§5) |
| 번들 크기 검사 | esbuild `--bundle --minify --format=esm` 후 gzip -9, 3D 관련 청크만 합산, 문턱 300 KB(T12.8) | 제안. client.md §1 의 측정 방법. skylens 는 Vite 8 이라 수치가 몇 % 다를 수 있음 — 어느 번들러를 기준으로 할지 감독 결정(§4 Q9) |
| 벤치 | `node bench/<모듈>/...` (T01 의 `node bench/baseline/run_all/cli.mjs` 형식을 따름) | 형식만 있음(baseline.md) |
| 라이선스 점검 | npm 트리는 `license-checker` 류, Rust 를 들이면 `cargo deny check licenses` | 제안. license.md §2·§4 가 이름만 언급, 아직 실행 안 함 |
| 형식 검사·린트 | 미정 | 어느 노트도 다루지 않았다. 감독이 정하거나 T03 계약 때 정한다 |

[cloud]/[local] 표기(cloud_scope.md §5): 소프트웨어 렌더로 낸 시간·fps 는 "참고값(SwiftShader, CPU 4코어)"으로 적고 SPEC §4 판정에 넣지 않는다. GPU 가 필요한 시험은 [cloud] 에서 건너뛴다는 사실을 실행 결과에 보이게 한다(RULES §7).

---

## 4. 쟁점 목록 — 노트 간 모순·미확인·감독/사람에게 올릴 것

### 4.1 감독에게 올릴 쟁점

| # | 쟁점 | 내용 | 근거 | 누가 |
|---|---|---|---|---|
| Q1 | **입력 점 형식: 27 B 점인가 56 B 가우시안인가** | SPEC §2·§6 과 renderer_basis §7-4 는 입력을 27 B 점(위치·법선·색)으로 둔다. compression.md 도 "우리 점은 가우시안이 아니라 법선 있는 색 점"이라 전제한다. 그러나 T01 은 skylens 데모 자산이 **56 B/점 가우시안 스플랫 PLY**(`x y z f_dc_0..2 opacity scale_0..2 rot_0..3`)임을 확인했다. server_native.md 도 "현재 skylens 의 점군은 스플랫 씬"이라 적고, client.md 는 "경로 B 에서는 GaussianSplats3D 불필요(서버가 점 LOD 를 주므로)"라고 가정한다. 입력이 무엇이냐에 따라 2단계 후보(gsplat·Brush 는 가우시안 전용), 압축 사례(SPZ·SOG 의 필드 적합성), S9 기준 영상(baseline.md: 중심점만 그린 임시본)이 모두 갈린다 | baseline.md 발견 1, server_native.md 미확인 절, compression.md §0, client.md §3 C | 감독 → 사람(앱 자산 방향, F-027 과 같은 축) |
| Q2 | **`SplatChunk.url`(HTTP) 대 웹소켓 단일** | 지금 자산 바이트는 `url` 로 HTTP GET 하고 ws 에는 메타데이터만 흐른다(`protocol.ts` 185~186행). 브라우저는 문자열 프레임만 받고 바이너리 프레임을 버린다(`serverSource.ts` 126행). 선택지: (i) 기존처럼 `url` HTTP — "추가된 규약 없음"으로 볼 수 있는지, (ii) ws 바이너리 프레임 허용(`serverSource.ts`·`distributor.ts`·`upstream.ts`·`boards.ts` 4곳). SPEC §4 측정 방법은 대역폭을 "웹소켓 프레임 바이트 합"으로 정의하므로, (i) 이면 S6 측정 정의도 손봐야 한다(판단). **선택지별 SPEC 영향(판단):** (i) HTTP 를 택하면 SPEC §4 S6 의 측정 정의(웹소켓 프레임 바이트 합)를 HTTP 바이트까지 포함하도록 바꾸는 것이므로 **S6 정의 변경은 사람 확인 사안**이다(RULES §1.4·§1.5). (ii) ws 바이너리를 택하면 S6 정의는 그대로이나 4곳 코드 변경과 SPEC §7 근거 기재가 따른다. 구간당 3 MB 상한(S6)과 별개로, 두 경우 모두 S4 의 300 KB 상한 시나리오를 따로 본다: 바이너리 프레임 수신·조립 코드를 더하면 번들이 늘어 3D 청크가 300 KB(gzip)를 넘을 수 있으므로 T12.8 문턱 실측 전에는 (ii) 의 번들 영향은 미확인이다 | integration.md §3.1-1, SPEC §3·§4·§7 | 감독(SPEC §7 해석), S6 정의 변경은 사람 |
| Q3 | **영상 전달 규약(2단계 A)** | 코어 `ws` 에 메시지 종류를 더하는 것만으로는 영상을 보낼 수 없다(`distributor.ts` 는 텍스트 JSON 만). TASKS T22 의 "클라이언트 `<video>` 화면"은 ws 단일과 바로 맞지 않는다: `<video>` 에 ws 바이트를 먹이려면 MSE 또는 WebCodecs 가 필요하다(MSE 는 미조사). WebRTC 는 SPEC §7 새 규약. COMPONENTS 는 `Distributor` 뒤로 WebRTC 교체 가능성을 열어 두었다(integration.md §1.1) | integration.md §3.1-2, encoder.md §1 G·§4 | 감독(T22 문구, SPEC §7) |
| Q4 | **현황판 입력 역방향** | 경로 A 는 입력을 서버로 보내야 하는데, 릴레이는 보드→코어 방향을 의도적으로 버린다(`boards.ts` 201행, COMPONENTS 189행). integration.md 가 유일하게 **"경계 변경 후보"** 로 표시한 항목이다. RULES §1.4 상 감독이 사람에게 올릴 사안 | integration.md §3.1-3 | 감독 → 사람 |
| Q5 | **AI 제한 조항 라이선스(node-webgl)** | MIT 기반에 "AI 시스템 학습·미세조정·평가·개발에 사용 금지(three.js 저장소 예외)" 조항. RULES §4 표(MIT·BSD·Apache 허용, AGPL·GPL 금지)에 맞는 칸이 없다. 이 문서는 기각을 제안하나, 같은 류의 조항을 일반적으로 어떻게 다룰지(허용·금지·사안별) 규칙이 없다. 이번 작업 방식 자체가 그 조항의 "AI 시스템 개발·평가"에 걸리는지도 판단이 필요하다(판단) | server_web.md §1 E·§4 | 감독 → 사람(규칙 변경은 사람만, RULES 머리) |
| Q6 | **포트 맵 행 추가가 경계 변경인가** | (나) 별도 서비스로 가면 COMPONENTS §7 포트 맵에 행이 하나 는다. integration.md 는 "구성 목록 보충"이라 변경으로 세지 않았지만 엄격히 읽으면 경계 변경이라 열어 두었다. RULES §1.4 는 경계 변경을 감독이 사람에게 올리도록 하므로 **결정 주체는 사람**이다(감독은 올리는 쪽). 코어 `server/` 안 모듈로 두는 대안 (가) 와의 비교는 [integration.md](integration.md) 가 다룬다(여기서는 참조만) | integration.md §3 | 사람(감독이 올림, RULES §1.4) |
| Q7 | **코드가 들어갈 저장소** | integration.md 는 클라이언트 래스터라이저를 skylens `statusview/` 안((가))에 두자고 하지만, RULES §2 는 제품 코드를 `i3months/skylens-renderer` 에 둔다. 제품 저장소에서 만든 모듈을 skylens 가 어떻게 가져가는지(패키지 게시·서브모듈·복사)는 어느 노트도 다루지 않았다. integration.md §4 는 `protocol.ts` 를 두 저장소에 복제하면 과거의 "kind 목록 복제" 사고가 재발할 수 있다고 경고한다 | integration.md §2·§4·§5, RULES §2 | 감독 |
| Q8 | **WASM 디코더를 S4 의 "3D 청크"에 넣는가** | Draco 등 WASM 디코더를 쓸 때 그 바이트를 S4 에 넣는지 SPEC §4 측정 방법에 없다 | client.md §2 주의 | 감독 |
| Q9 | **번들 크기 기준 번들러** | client.md 수치는 esbuild, skylens 는 Vite 8(Rollup 계열). baseline.md 의 앞선 측정도 esbuild 근사였다. CI 문턱(T12.8)을 어느 번들러 산출물로 잴지 | client.md §1, baseline.md | 감독 |
| Q10 | **TypeScript 채택 방식** | runtime.md 는 "Node/TypeScript" 를 제안하나 빌드 단계·타입 제거 방식은 비교하지 않았다. 제품 저장소는 지금 `.mjs` 만 쓴다. 서버·클라이언트 공유 모듈과 skylens(TS) 사이 타입 공유 여부도 걸린다 | runtime.md §4, 제품 `package.json` | 감독 |
| Q11 | **ADD 형 증분 조각 허용 여부** | 3D Tiles ADD·Potree 처럼 겹치지 않는 부분집합을 보내면 대역폭을 아낄 수 있으나 RULES §1.1 "누적 금지"와 충돌할 수 있다. 수준 교체에서 "증분 조각"을 쓸지는 T03 결정(미결) | tiling.md §2-1·§2-5 | 감독(T03 계약 전) |
| Q12 | **계산 정밀도와 결정성** | Node(f64)와 네이티브(f32)의 픽셀 수 5개 차이. SPEC §6 "같은 입력 → 같은 바이트"를 서버·클라이언트·참조 래스터라이저 사이에서 어떤 정밀도로 보장할지 | runtime.md §3·§4 | 감독(T03·T06 계약) |

### 4.2 사람에게 올릴 쟁점(법률·약관·외부 자료)

| # | 쟁점 | 내용 | 근거 |
|---|---|---|---|
| H1 | **NVIDIA 드라이버/SDK 약관** | 사람에게 남기는 것은 이것뿐이다. NVENC 를 드라이버 호출로만 쓰고 SDK 파일을 재배포하지 않는다는 전제가 약관에 맞는지는 원문이 접근 차단으로 미확인이다(license.md §2). 법률 판단은 두 노트 모두 하지 않았다. RULES §4 는 GPL 을 서버 전용이라도 금지하므로 완화 해석에 기대지 않는다(license.md §1) | encoder.md §2, license.md §2·§4 |
| H2 | **AI 제한 조항**(Q5 와 같음) | 규칙 표에 없는 유형의 라이선스. 규칙을 바꾸는 것은 사람만 한다 | server_web.md, RULES 머리 |
| H3 | **특허·표준 관련** | AMF: 코덱 특허 라이선스는 사용자 부담(encoder.md). x264: MPEG-LA 특허 가능성. SVT-AV1: BSD-3-Clause-Clear 는 특허 허여를 명시하지 않고 AOM 특허 라이선스가 따로 붙음. KHR_gaussian_splatting: Khronos Adopter 절차(상표·특허). G-PCC: 표준 특허 가능성·COPYING 조건 미확인 | encoder.md §1, compression.md §1-5·§1-7 |
| H4 | **기준 기기·폴백** | SPEC §5 는 STATUS 상 사람이 그대로 받아들였다고 적혀 있으나, cloud_scope.md §7 은 "사람 확인 전 제안값이라 [local] 기기가 확정되지 않았다"고 적었다. 확정 여부를 SPEC §5 표기에 반영할지 확인 필요(**문서 간 불일치**) | cloud_scope.md §7, STATUS.md, SPEC §5 |

### 4.3 노트 간 모순과 정리

| 항목 | 노트 A | 노트 B | 정리 |
|---|---|---|---|
| Potree 라이선스 | compression.md: "본체 라이선스 확인 못함(미확인)" | tiling.md: "BSD-2-Clause 형식(LICENSE 본문 확인)", PotreeConverter 도 확인 | tiling.md 가 원문을 읽었으므로 그쪽을 따른다. 단 본체 LICENSE 의 포함 라이브러리 항목은 tiling.md 도 전부 읽지 못함(미확인) |
| 헤드리스 Chromium 의 SwiftShader 자동 폴백 | server_web.md: Chromium 이 자동 폴백을 폐기해 명시적으로 켜지 않으면 실패할 수 있다(검색 요약, 미확인) | cloud_scope.md: Chromium 141 기본 인자에서 WebGL2 가 SwiftShader 로 바로 동작(실측) | 이 환경의 Playwright 기설치 Chromium 141 에서는 기본 인자로 된다. 다른 버전·배포본에서도 같은지는 미확인. 시험 틀은 `--use-angle=swiftshader --enable-unsafe-swiftshader` 를 명시하는 쪽이 안전(판단) |
| 헤드리스 WebGPU 인자 | server_web.md: `--enable-unsafe-webgpu` 필요하다는 보고, 최신 조합 미확인 | cloud_scope.md: 두 인자 조합으로 어댑터·장치 획득 실측(렌더·컴퓨트 파이프라인은 미시험) | cloud_scope.md 의 실측을 따른다. 파이프라인 동작은 여전히 미확인 |
| three.js 버전 | client.md: 0.185.1 로 측정 | license.md: npm 0.186.1 확인 | 측정 시점의 레지스트리 차이로 보인다(추정). 라이선스(MIT)는 같다. 번들 수치는 0.185.1 기준임을 유지 |
| 2단계 서버 래스터라이저 1순위 | server_native.md: gsplat(CUDA) 또는 wgpu/Brush | server_web.md: 헤드리스 Chromium + Playwright | 두 노트는 범위가 달라(네이티브 대 웹) 직접 모순은 아니다. 이 문서는 B 코드 재사용·클라우드 검증 가능성 때문에 Chromium 을 1순위 검토로, 가우시안 전용 후보는 Q1 에 종속으로 둔다(판단) |
| 자산 처리 서버의 결합 방식과 언어 | integration.md: "서버 래스터라이저가 Node 에서 돌 수 있다면 (가)로 기울 수 있다" | runtime.md: 자산 처리는 Node | 자산 처리 서버는 Node 라도 integration.md 는 (나) 별도 프로세스를 제안한다. 언어와 프로세스 배치는 별개 축이며 모순은 아니다 |
| SPEC §4 S6 "현재" 값 | SPEC: 구간당 약 67 MB | baseline.md: 데모 구간 전 수준 합 41.97 MB(56 B/점) | 67 MB 는 실데이터 기준이라 T01.12 [local] 확인 대상. Q1 과 함께 정리 |

### 4.4 미확인으로 남은 것(결정에 걸리는 것만)

- 2단계 성능 전부: 후보별 동시 30명 처리량, 브라우저 프로세스당 메모리, WebCodecs 인코딩의 하드웨어 사용 여부, 1080p `readPixels` 복사 비용의 실측(server_web.md 의 8.3 MB/프레임은 산술일 뿐), 모든 인코더의 실제 지연. → [local] T20·T21·T24.
- WebGPU `point-list` 의 점 크기 부재: 세 노트(server_web, client, server_native 간접)가 모두 "일반 지식, 출처 미확보"로 적음.
- 클라이언트 점유율(WebGL2·WebGPU): caniuse·MDN 차단으로 미확인(client.md §3 D).
- 압축: Draco 점군 압축률·WASM 디코더 바이트, SPZ 정량 오차, SOG 세부 양자화, 11 B/점 추정 — 전부 측정 전.
- 라이선스: wgpu·npm 전이 의존성 전체, Dawn 링크 대상 서드파티, Chromium 번들 서드파티, Draco 서브모듈(eigen 등), SVT-AV1 의존성, SPZ 의 zlib, Node.js 번들 서드파티, NVENC SDK 약관, 3D Tiles 사양 문서 라이선스, Mesa, headless-gl 주 라이선스. **license.md 가 다루지 않은 후보**: gsplat·Brush·3DGRUT·vk_gaussian_splatting·fast-gaussian-rasterization 의 의존성 트리, ogl(Unlicense)·twgl, Puppeteer·SwiftShader 의 트리. → 도입 시 실측 후 PR 본문에 적는다(RULES §4).
- 운영 환경: 코어 쪽 KOREN 내부망에서 자식 프로세스·네이티브 애드온이 허용되는지(integration.md §6).
- 관제탑 B 의 세부 훅: `terrainSource.ts`·`buildingSource.ts` 내부 로드 로직은 읽지 않음(integration.md §6). 건물 6,191동 녹화는 아직 없음(baseline.md T01.5 미달).
- 병렬 실행·실제 LOD/코덱 루프·67 MB I/O 속도(runtime.md §7).

---

## 5. renderer_basis 에서 벗어난 점

없다. 이 문서는 renderer_basis 의 규칙을 바꾸지 않는다. 투영식(§2)을 모든 래스터라이저가 같은 식으로 쓴다는 SPEC §2 의 요구는 추천안(WebGL2 셰이더, CPU 참조, 2단계 서버 렌더)에 그대로 적용된다. 다만 입력이 27 B 점(§7-4)이 아닐 수 있다는 T01 발견은 Q1 로 올렸다.

## 6. 남은 문제와 다음 단계

1. 감독이 §0·§3 을 승인하거나 고친다. 승인 전에는 T03 을 시작하지 않는다.
2. Q1(입력 형식)이 T03 계약의 전제이므로 가장 먼저 정해야 한다(판단).
3. Q2·Q3·Q4 는 SPEC §7·COMPONENTS 와 맞닿으므로 1단계 프로토콜(T11) 전에 정해야 한다.
4. H1·H2·H3 은 2단계 착수 전까지 사람 확인을 받는다. 1단계(경로 B)의 추천 스택(Node·`ws`·three.js/WebGL2·자체 포맷)은 이 항목들에 걸리지 않는다.
5. 2단계 서버 래스터라이저·인코더는 1단계 감독 확인 뒤 [local] 세션에서 1순위·2순위 후보를 같은 1단계 자산으로 실측해 정한다.
