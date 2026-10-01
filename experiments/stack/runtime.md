# T02.5 자산 처리 서버 언어·런타임 후보

작업: T02.5 (`experiments/stack/runtime.md`). 조사 문서이며 제품 코드가 아니다. 측정은 2026-10-01 이 클라우드 세션(GPU 없음, 4 코어)에서 했다.

## 1. 가설과 범위

가설: 자산 처리 서버(27 B 점 입출력, LOD·컬링, 양자화·압축, 웹소켓 송출)는 100만 점 규모의 단순 투영·z버퍼 루프에서 Node/TypeScript 도 실용적인 속도를 내며, 클라이언트와의 코드 공유·skylens 와의 스택 일치 이득이 속도 차이보다 크다.
이 노트는 후보 비교만 한다. 추천·기각의 확정은 T02.11 과 감독 승인에서 한다.

## 2. 이 세션에서 실제로 확인한 도구 (설치·실행 가능 여부)

| 런타임 | 확인 결과 | 비고 |
|---|---|---|
| Node | v22.22.0, npm 10.9.4 | 설치됨. 레지스트리 접근 확인: `npm view typescript version` → 7.0.2 |
| Rust | rustc/cargo 1.97.0 | 설치됨. 표준 라이브러리만으로 측정(crates.io 접근은 미확인) |
| Go | go1.24.7 linux/amd64 (`/usr/local/go/bin`, PATH 에는 없음) | 설치됨 |
| Python | 3.11.15 | numpy 는 기본 미설치. `pip install numpy --target` 으로 2.4.6 설치됨 |
| C++ | g++ 13.3.0, clang 18.1.3 | 설치됨 |
| GPU | 없음 | GPU 경로(WebGPU·네이티브 GPU API)는 이 세션에서 검증 불가. T02.10 범위 |

## 3. 마이크로벤치

### 방법

- 같은 알고리즘을 다섯 가지로 구현: 합성 점 100만 개(xorshift32 시드 12345, 상자 x,z∈[-50,50) y∈[0,30), 점당 f32×3 + u8×3 색)를 핀홀로 투영(f=900, 중심 640·360, 카메라 z 앞 60 m 이동)하고 1280×720 z버퍼에 점 하나를 한 픽셀로 쓴다(가까운 것이 이김, 색 기록).
- 시간은 투영+z버퍼+색 기록 루프만(버퍼 초기화 포함, 점 생성 제외). 6회 중 첫 회(워밍업)를 빼고 최솟값. 이것을 프로세스 5회 반복해 최소·중앙값을 적었다.
- 검증: 화면에 들어온 픽셀 수가 C++·Rust·Go·numpy 에서 398,553 으로 같다. Node 는 f64 로 계산해 398,558 (5 픽셀 차이, 부동소수 정밀도 차이로 추정). 이미지 바이트 전체 비교는 하지 않았다(미측정).
- 한계: 삼각형·법선 셰이딩·캐시 친화 정렬 없이 단일 스레드 점 찍기만 본 것이다. 4 코어 병렬(worker_threads, rayon 등)은 미측정. 공유 세션이라 편차가 크다(아래 최소~최대 참조). 이 표는 서로 간의 대략적인 자릿수 비교용이다.

### 결과 (1M 점, 1280×720, 단일 스레드, 단위 ms)

| 런타임 | 컴파일 옵션 | 최소 | 중앙값 | 최대 | 5회 |
|---|---|---|---|---|---|
| C++ (g++ 13.3) | `-O2` | 20.9 | 24.4 | 25.2 | 5 |
| Rust 1.97 | `-O` (표준 라이브러리만) | 25.0 | 27.8 | 31.7 | 5 |
| Go 1.24.7 | 기본 `go build` | 22.7 | 22.8 | 23.6 | 5 |
| Node 22.22 (JS, Float32Array) | 기본 | 37.9 | 47.6 | 49.4 | 5 |
| Python 3.11 + numpy 2.4.6 | 벡터화(argsort 후 마지막 쓰기 우선) | 178 | 192 | 252 | 5 |
| TypeScript | JS 와 같은 엔진(타입 제거만) | 미측정 | | | |
| Node `worker_threads` / Rust `rayon` / Go 고루틴 병렬 | | 미측정 | | | |

참고: 맨 처음 한 번 돌렸을 때는 C++ 40.6, Rust 130, Go 35.9, Node 136, numpy 306 ms 가 나왔다(콜드 상태·세션 잡음으로 추정). 위 표의 5회 반복에서는 재현되지 않았으므로 한 번 측정한 값을 믿지 말 것.

해석: 네이티브 계열(C++·Rust·Go)은 서로 20~30 ms 안쪽으로 구분하기 어렵고, Node 는 약 1.6~2배, numpy 는 약 8배 느리다. 100만 점 한 장 기준 Node 의 40~50 ms 는 테스트·화질 기준 영상(고정 시점 8곳)을 만드는 데 충분하다(8장이면 1초 미만). 구간당 약 250만 점(SPEC §1)이면 선형으로 2.5배, 즉 Node 100~120 ms 로 추정(미측정).

재현: 저장소 자료만으로 돌릴 수 있도록 벤치 소스를 이 노트 끝의 부록 A 에 담았다. 원 측정에 쓴 소스는 세션 임시 디렉터리에만 있었고 지금은 남아 있지 않아, 부록의 소스는 위 "방법" 절과 이 표의 설명으로 **다시 쓴 재작성본이며 원 측정과 동일하다고 확인하지 못했다(동일성 미확인)**. 재작성본으로 다시 잰 값은 부록 A 끝에 따로 적었고, 위 표의 값은 원 측정 그대로 둔다. 두 값은 합쳐 쓰지 않는다.

## 4. 후보 비교

| 후보 | CPU 참조 래스터·테스트 속도 | 클라이언트와 코드 공유 | 이 세션 설치·실행 | 라이선스·의존성 | 이 작업에서의 주의점 |
|---|---|---|---|---|---|
| Node/TypeScript | 100만 점 약 40~50 ms (§3). 네이티브 대비 약 2배 | 최대. 양자화·ID 인코딩·체크섬·수준 상태(T10)를 같은 TS 모듈로 서버·클라이언트가 공유하고, 같은 테스트로 왕복·교차 검증 가능. skylens 도 TS 라 `geo.ts` 의 ENU 식(RULES §1.3)을 그대로 재사용 가능(이 노트에서는 파일을 열어보지 않았다) | 가능(v22.22.0) | Node MIT, TypeScript Apache-2.0, `ws` MIT 로 알고 있음(이 노트에서 확인 안 함, 라이선스는 T02.9) | 단일 스레드 이벤트 루프라 무거운 가공은 `worker_threads` 로 분리해야 함. 결정적 바이트 출력은 부동소수 f64 계산 순서를 고정하면 가능하나 f32 교차 검증은 `Math.fround` 필요(5 픽셀 차이 사례) |
| Rust | 약 25~30 ms | 직접 공유 불가. 같은 양자화 규칙을 문서로 두고 두 번 구현하거나, wasm 으로 컴파일해 클라이언트에서 재사용(번들 크기 S4 ≤ 300 KB 와 충돌 여부 미측정) | 가능(1.97.0). crates.io 접근은 미확인 | Rust 자체 MIT/Apache-2.0. crate 별 점검 필요 | 안전성·병렬(rayon)이 강점이나 skylens 팀 스택과 다르다. 팀 학습 비용·두 언어 CI 유지 비용 |
| Go | 약 23 ms | 직접 공유 불가(위와 같음). wasm 은 런타임이 커서 번들 한도에 불리할 것으로 추정(미측정) | 가능(1.24.7, PATH 에 없음) | Go BSD-3-Clause. 표준 라이브러리 위주 시 의존성 적음, 웹소켓은 서드파티 필요(미확인) | 고루틴으로 30명 동시 송출 모델이 단순. 코드 공유 이득 없음 |
| Python + numpy | 벡터화해도 약 180~250 ms. 점 하나씩 루프는 훨씬 느릴 것으로 추정(미측정) | 없음 | 가능(3.11.15, numpy 는 pip 설치 필요) | numpy BSD-3-Clause 로 알고 있음(미확인) | 프로토타이핑·화질 지표 스크립트(SSIM)에는 편하나 서버 런타임으로는 부적합. 도구 용도로만 |
| C++ | 약 21~25 ms | 직접 공유 불가. wasm(emscripten) 가능하나 미측정 | 가능(g++ 13.3, clang 18.1) | 컴파일러·표준 라이브러리 라이선스 해당 없음. 의존성 관리가 가장 무거움 | 메모리 안전 부담, 빌드 체계 CMake 등 추가. 이 프로젝트에 이점이 작음 |

## 5. 판단 근거 요약

1. 속도: 100만 점 점 찍기에서 네이티브는 Node 의 약 1/2 수준이다. 이 차이는 서버 가공 작업에서 의미가 있을 수 있으나(구간 250만 점 × 4수준 × 구간 수), 가공은 오프라인 배치로 보면 Node 로도 감당 가능한 규모로 추정된다. 실제 LOD·양자화·압축 루프 측정은 이 노트 범위 밖이다(미측정).
2. 코드 공유: 클라이언트(브라우저)는 JS/TS 만 직접 돌린다. 양자화·ID·체크섬(T03.4·T03.5, T09, T10)을 한 구현으로 유지하면 서버·클라이언트 불일치 위험(원본 복원 오차 계약, SPEC §6)이 줄어든다. 이것은 Node/TS 의 결정적 장점이다.
3. 2단계 GPU 서버 래스터라이저(T20)는 별도 후보 조사(T02.1·T02.2)이며, 자산 처리 서버와 같은 언어일 필요는 없다. 네이티브 GPU 계열이 정해지면 그쪽에 맞춘 도구 프로세스를 따로 두는 구성이 가능하다.
4. 병목이 측정으로 드러나면 해당 루프만 Rust/C++ → wasm 이나 네이티브 애드온으로 바꾸는 길이 열려 있다(미측정).

## 6. renderer_basis 에서 벗어난 점

없다. 투영식은 §2-1 의 핀홀 모델(회전 없는 단순 카메라)을 쓴 벤치용 약식이며, 렌더 품질·화질 지표 비교가 아니다.

## 7. 남은 문제

- 병렬 실행(worker_threads·rayon·고루틴) 미측정. 4 코어에서 몇 배 나오는지.
- 실제 LOD·컬링·양자화·압축 코드에서의 속도 미측정(T07·T08·T09 이후).
- 250만 점·27 B 입출력(67 MB 읽기·파싱) I/O 속도 미측정.
- Node 의 f32 교차 검증 일치 방식(`Math.fround` 전면 사용 시 비용).
- Rust/wasm 번들 크기의 S4 한도 영향, 웹소켓 라이브러리별 라이선스는 T02.8·T02.9 에서.
- 이미지 바이트 단위 일치 확인은 안 했다(픽셀 수만 비교).

## 8. 잠정 의견

자산 처리 서버는 Node/TypeScript 로 시작하는 것이 유리해 보인다. 100만 점 점 찍기가 Node 에서 약 40~50 ms 로 C++·Rust·Go(약 21~30 ms)의 2배 안쪽이고 CPU 참조 래스터라이저·테스트(고정 시점 8곳)에는 충분하며, 클라이언트와 양자화·ID 인코딩·수준 상태 코드를 그대로 공유하고 skylens 와 스택·도구를 맞출 수 있는 이점이 속도 차이보다 크다. Python+numpy 는 약 8배 느려 서버로는 부적합하고 화질 지표 보조 도구 정도가 알맞다. Rust·Go·C++ 는 속도가 가장 좋지만 코드 공유 이득이 없어, 실제 가공 루프에서 병목이 측정으로 확인될 때 그 부분만 교체하는 방향을 남겨 둔다. 이는 잠정이며 병렬 측정과 실제 코덱 루프 측정 뒤에 T02.11 에서 확정한다.

## 부록 A. 마이크로벤치 소스 (재작성본, 원 측정과 동일성 미확인)

작업 디렉터리를 하나 만들고 아래 파일을 `b.cpp`, `b.rs`, `b.go`, `b.js`, `b.py` 로 저장한 뒤 다음을 실행한다.

```
g++ -O2 b.cpp -o bcpp && ./bcpp
rustc -O b.rs -o brs && ./brs
go build -o bgo b.go && ./bgo
node b.js
pip install numpy --target ./pylib && PYTHONPATH=./pylib python3 b.py
```

알고리즘은 §3 방법 절과 같다(xorshift32 시드 12345, 점당 f32×3 + u8×3, 핀홀 f=900·중심 640,360, 깊이 = z+60, 1280×720 z버퍼, 6회 중 첫 회 제외 최솟값). 투영의 세로 부호(`360 - 900*y/d`)와 xorshift 의 난수 소비 순서(x, y, z, 색 r, g, b)는 원본을 확인할 수 없어 이 재작성본에서 정한 것이다.

### b.cpp

```cpp
#include <cstdio>
#include <cstdint>
#include <vector>
#include <chrono>
#include <algorithm>
using namespace std;
static uint32_t s = 12345;
static uint32_t xs() { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s; }
static float rnd() { return xs() / 4294967296.0f; }
int main() {
  const int N = 1000000, W = 1280, H = 720;
  vector<float> p(3 * N); vector<uint8_t> c(3 * N);
  for (int i = 0; i < N; i++) {
    p[3*i] = rnd() * 100 - 50; p[3*i+1] = rnd() * 30; p[3*i+2] = rnd() * 100 - 50;
    for (int k = 0; k < 3; k++) c[3*i+k] = xs() & 255;
  }
  vector<float> zb(W * H); vector<uint8_t> img(W * H * 3);
  double best = 1e9; long cnt = 0;
  for (int r = 0; r < 6; r++) {
    auto t0 = chrono::steady_clock::now();
    fill(zb.begin(), zb.end(), 1e30f); fill(img.begin(), img.end(), 0); cnt = 0;
    for (int i = 0; i < N; i++) {
      float d = p[3*i+2] + 60.0f; if (d <= 0) continue;
      int u = (int)(640 + 900.0f * p[3*i] / d), v = (int)(360 - 900.0f * p[3*i+1] / d);
      if (u < 0 || u >= W || v < 0 || v >= H) continue;
      int o = v * W + u;
      if (d < zb[o]) { zb[o] = d; for (int k = 0; k < 3; k++) img[3*o+k] = c[3*i+k]; }
      cnt++;
    }
    double ms = chrono::duration<double, milli>(chrono::steady_clock::now() - t0).count();
    if (r > 0) best = min(best, ms);
  }
  printf("cpp min %.1f ms, in-screen %ld\n", best, cnt);
}
```

### b.rs

```rust
use std::time::Instant;
fn main() {
    const N: usize = 1_000_000; const W: usize = 1280; const H: usize = 720;
    let mut s: u32 = 12345;
    let mut xs = || { s ^= s << 13; s ^= s >> 17; s ^= s << 5; s };
    let mut p = vec![0f32; 3 * N]; let mut c = vec![0u8; 3 * N];
    for i in 0..N {
        p[3*i] = xs() as f32 / 4294967296.0 * 100.0 - 50.0;
        p[3*i+1] = xs() as f32 / 4294967296.0 * 30.0;
        p[3*i+2] = xs() as f32 / 4294967296.0 * 100.0 - 50.0;
        for k in 0..3 { c[3*i+k] = (xs() & 255) as u8; }
    }
    let mut zb = vec![0f32; W * H]; let mut img = vec![0u8; W * H * 3];
    let mut best = 1e9f64; let mut cnt = 0u64;
    for r in 0..6 {
        let t0 = Instant::now();
        zb.iter_mut().for_each(|z| *z = 1e30); img.iter_mut().for_each(|b| *b = 0); cnt = 0;
        for i in 0..N {
            let d = p[3*i+2] + 60.0; if d <= 0.0 { continue; }
            let u = (640.0 + 900.0 * p[3*i] / d) as i32; let v = (360.0 - 900.0 * p[3*i+1] / d) as i32;
            if u < 0 || u >= W as i32 || v < 0 || v >= H as i32 { continue; }
            let o = v as usize * W + u as usize;
            if d < zb[o] { zb[o] = d; for k in 0..3 { img[3*o+k] = c[3*i+k]; } }
            cnt += 1;
        }
        let ms = t0.elapsed().as_secs_f64() * 1000.0;
        if r > 0 && ms < best { best = ms; }
    }
    println!("rust min {:.1} ms, in-screen {}", best, cnt);
}
```

### b.go

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	const N, W, H = 1000000, 1280, 720
	s := uint32(12345)
	xs := func() uint32 { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return s }
	p := make([]float32, 3*N)
	c := make([]uint8, 3*N)
	for i := 0; i < N; i++ {
		p[3*i] = float32(xs())/4294967296.0*100 - 50
		p[3*i+1] = float32(xs()) / 4294967296.0 * 30
		p[3*i+2] = float32(xs())/4294967296.0*100 - 50
		for k := 0; k < 3; k++ {
			c[3*i+k] = uint8(xs() & 255)
		}
	}
	zb := make([]float32, W*H)
	img := make([]uint8, W*H*3)
	best := 1e9
	cnt := 0
	for r := 0; r < 6; r++ {
		t0 := time.Now()
		for i := range zb {
			zb[i] = 1e30
		}
		for i := range img {
			img[i] = 0
		}
		cnt = 0
		for i := 0; i < N; i++ {
			d := p[3*i+2] + 60
			if d <= 0 {
				continue
			}
			u := int32(640 + 900*p[3*i]/d)
			v := int32(360 - 900*p[3*i+1]/d)
			if u < 0 || u >= W || v < 0 || v >= H {
				continue
			}
			o := int(v)*W + int(u)
			if d < zb[o] {
				zb[o] = d
				for k := 0; k < 3; k++ {
					img[3*o+k] = c[3*i+k]
				}
			}
			cnt++
		}
		ms := float64(time.Since(t0).Microseconds()) / 1000
		if r > 0 && ms < best {
			best = ms
		}
	}
	fmt.Printf("go min %.1f ms, in-screen %d\n", best, cnt)
}
```

### b.js

```js
const N = 1000000, W = 1280, H = 720;
let s = 12345;
const xs = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; };
const p = new Float32Array(3 * N), c = new Uint8Array(3 * N);
for (let i = 0; i < N; i++) {
  p[3*i] = xs() / 4294967296 * 100 - 50; p[3*i+1] = xs() / 4294967296 * 30; p[3*i+2] = xs() / 4294967296 * 100 - 50;
  for (let k = 0; k < 3; k++) c[3*i+k] = xs() & 255;
}
const zb = new Float32Array(W * H), img = new Uint8Array(W * H * 3);
let best = 1e9, cnt = 0;
for (let r = 0; r < 6; r++) {
  const t0 = performance.now();
  zb.fill(1e30); img.fill(0); cnt = 0;
  for (let i = 0; i < N; i++) {
    const d = p[3*i+2] + 60; if (d <= 0) continue;
    const u = Math.trunc(640 + 900 * p[3*i] / d), v = Math.trunc(360 - 900 * p[3*i+1] / d);
    if (u < 0 || u >= W || v < 0 || v >= H) continue;
    const o = v * W + u;
    if (d < zb[o]) { zb[o] = d; for (let k = 0; k < 3; k++) img[3*o+k] = c[3*i+k]; }
    cnt++;
  }
  const ms = performance.now() - t0;
  if (r > 0) best = Math.min(best, ms);
}
console.log(`node min ${best.toFixed(1)} ms, in-screen ${cnt}`);
```

### b.py

```python
import time
import numpy as np
N, W, H = 1000000, 1280, 720
s = 12345
def xs():
    global s
    s ^= (s << 13) & 0xFFFFFFFF; s ^= s >> 17; s ^= (s << 5) & 0xFFFFFFFF
    return s
p = np.empty((N, 3), np.float32); c = np.empty((N, 3), np.uint8)
for i in range(N):
    p[i, 0] = xs() / 4294967296 * 100 - 50; p[i, 1] = xs() / 4294967296 * 30; p[i, 2] = xs() / 4294967296 * 100 - 50
    c[i] = (xs() & 255, xs() & 255, xs() & 255)
best = 1e9
for r in range(6):
    t0 = time.perf_counter()
    d = p[:, 2] + np.float32(60)
    ok = d > 0
    dd = np.where(ok, d, np.float32(1))
    u = (640 + 900 * p[:, 0] / dd).astype(np.int32); v = (360 - 900 * p[:, 1] / dd).astype(np.int32)
    ok &= (u >= 0) & (u < W) & (v >= 0) & (v < H)
    idx = np.nonzero(ok)[0]
    o = v[idx] * W + u[idx]
    order = np.argsort(-d[idx], kind='stable')   # 먼 것부터 쓰고 가까운 것이 마지막에 이김
    img = np.zeros((W * H, 3), np.uint8)
    img[o[order]] = c[idx[order]]
    ms = (time.perf_counter() - t0) * 1000
    if r > 0: best = min(best, ms)
print(f"numpy min {best:.1f} ms, in-screen {len(idx)}")
```

### 재작성본 재측정 결과 (이 세션, 공유 환경, 단일 스레드, 5회 반복 아님·1회 실행의 5회 중 최솟값)

| 런타임 | 최소(ms) | 화면 안 점 수 |
|---|---|---|
| C++ (g++ -O2) | 15.4 | 615,850 |
| Rust (-O) | 13.6 | 615,850 |
| Go | 18.5 | 615,850 |
| Node 22 | 31.7 | 615,850 |
| Python + numpy | 123.8 | 615,850 |

다섯 구현이 같은 화면 안 점 수를 내므로 재작성본끼리는 서로 일관된다. 그러나 원 측정의 398,553(Node 398,558)과는 다르다. 즉 재작성본의 기하(좌표 부호·난수 순서)가 원본과 다르다는 뜻이고, 이 표를 §3 표와 직접 비교하면 안 된다. 상대 순서(네이티브 < Node < numpy)만 재현된 것으로 본다. 이미지 바이트 비교는 하지 않았다(미측정).
