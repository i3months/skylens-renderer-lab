# 원본 코드 대조 — T15.0L · T10.10L · T11.8L(이벤트 모양 절반)

- 수행: 사람이 띄운 로컬 세션, 2026-10-07
- 원본: NET-Challenge-S13/skylens main `0122bd4` (MIT). 모든 줄 번호는 이 커밋 기준이다.
- 제품 브랜치: `feat/local-parity` (하위 작업 브랜치 `feat/local-parity--t15/t10/t11` 은 로컬 전용, 푸시하지 않음)
- 서브에이전트: haiku 1(T15.0L), opus 2(T10.10L·T11.8L), 승격 0. T15.0L 결과는 작업자가 검증 중 고쳤다(아래).
- 하지 못한 것: T07L.1 — 원본 저장소와 로컬 복사본 어디에도 COLMAP 결과(points3D 등)가 없다. 사람 입력 대기.

## 요약

| 작업 | 결과 | 남은 것 |
|---|---|---|
| T15.0L | 대응표 9행 중 7행 checked(원본 줄 기재), 원본 공개 멤버 13개를 조립 행에 정확히 나열하고 시험으로 고정 | input 행: 원본 위치가 towerViewer.ts 가 아니고 속도 상수가 다르다(결정 필요). fallback 은 신규 |
| T10.10L | UNVERIFIED 10항목 → 일치 7·해당 없음 2·불일치 1 | 구간 번호 ≥ 2^30 처리(원본은 상한 없음, 우리는 RangeError). 실제 비행에서는 도달 불가 |
| T11.8L | 원본 코어 메시지와 어댑터 가정 대조. 상태 규칙(교체·추월 건너뛰기·늦은 참여)은 일치 | 구조적 불일치 7건(test.todo). 원본에는 `level_arrived`·`segment_expected` 가 없어 번역 계층이 필요. 실제 녹화 재생은 사람 녹화 뒤 |

## T15.0L — towerViewer.ts 공개 메서드 대조

원본 `src/skylens_core/controlview/towerViewer.ts` 의 `TowerViewer`(:146-811) 공개 멤버:
constructor(:204-267), setDisplay(:293-297), display getter(:299-301), aerialAvailable getter(:304-306),
addStreamedTerrain(:420-441), addSurroundBuildings(:448-498), setRoute(:586-638), debugTopDown(:653-664),
debugScene(:668-670), debugRoute(:674-686), update(:734-752), resize(:789-795), dispose(:797-810). 13개.

| 행 | 원본 줄 | 결과 |
|---|---|---|
| terrain | :204, :220-228, :420-441 | checked |
| drape | :220-240, :318-330 | checked |
| buildings | :293-306, :343-356, :448-498 | checked |
| input | (towerViewer.ts 에 없음) drones/manualControl.ts:13-28, pathFollower.ts:130-143 | **estimated 유지** — 아래 |
| chase | :734-752, :769-787 | checked |
| overlay | :504-574, :586-638, :674-686, :734-752 | checked |
| streaming | :420-441, :448-498, :789-795 | checked |
| fallback | (신규) | estimated(원본 없음) |
| e2e | 공개 멤버 13개 전부 | checked |

**input 행 불일치(결정 필요):**
- 키 입력은 뷰어가 아니라 `drones/manualControl.ts` 의 `createManualInput` 에 있다. 방향키 좌우 = move.x, 위아래 = move.z, E/Q = move.y.
- 의미는 우리 계약과 같다. 좌우는 조향(yaw)이며 pathFollower.ts:130-133 이 `-move.x·manualYawRate·dt` 로 위 축을 돌린다(오른쪽 = 시계 방향, 우리 yawRight + 와 같은 방향). 위아래는 방위 방향 전진·후진, E/Q 는 고도.
- 상수가 다르다: 원본 `shared/viewer/config.ts` manualSpeed 8.0(:71)·manualAltitudeSpeed 5.0(:73)·manualYawRate 0.95(:75), 우리 `TOWER_INPUT_DEFAULTS` speedMps 10·altRateMps 5·yawRateRad 1.0.
- 원본은 같은 프레임에서 방위를 먼저 돌린 뒤 새 방위로 이동한다. 우리는 스텝 중간 방위로 이동한다. dt 가 작으면 차이는 무시할 만하다.
- 원본에는 숫자 1·2·3·Tab 으로 조종할 드론을 바꾸는 키가 있다(manualControl.ts:44-55). 우리 관제탑 입력 계약에는 없다.
- 그래서 input 행은 source 를 원본 위치로 고치고 origin 은 estimated 로 남겼다. 상수를 원본에 맞출지, 드론 전환 키를 범위에 넣을지는 감독이 정한다.

작업자 검증 중 고친 것(haiku 결과): 시험이 `source.includes(name)` 부분 문자열 비교라 `display` 가 `setDisplay` 로도 통과했고 console 출력만 있었다. 조립 행 괄호 안 목록을 원본 13개와 `deepEqual` 하고, checked 행은 `towerViewer.ts:<줄>` 로 시작하며 estimated 는 정확히 input·fallback 인지 단언하도록 바꿨다.

## T10.10L — splatScene.ts 기준 UNVERIFIED 10항목


- 원본: NET-Challenge-S13/skylens 0122bd4, `src/skylens_client/statusview/splatScene.ts` (필요한 곳만 splatReveal.ts·statusViewer.ts·boards.ts·orchestrator.ts·serverSource.ts·segmenter.ts·ladder.ts)
- 제품: wt-t10 `feat/local-parity--t10` c3b9c38. 바꾼 파일: `server/levels/parity/cases.mjs`, `parity.test.mjs`, 새 `origin.mjs`
- 목록 출처: 70d4cb3 의 `server/levels/parity/UNVERIFIED.txt`(F-183 으로 연구 저장소 experiments/levels_unverified.md 로 옮김)

### 먼저 알아둘 원본 사실

- 지금 원본은 수준마다 장면을 바꿔 끼우지 않는다. 최종 PLY 하나를 정적으로 한 번 불러오고(splatScene.ts:L8-L16, L84-L86, L125-L148), 도착 메시지는 기록(noteChunk)과 노출(splatReveal)만 움직인다.
- 원본 도착 처리 전부: splatScene.ts:L152-L172
  ```ts
  this._chunks += 1;
  const prev = this.bySegment.get(chunk.segment);
  if (prev) {
    if (chunk.level > prev.level) { prev.level = chunk.level; this._refined += 1; }
    prev.final = prev.final || chunk.final;
    return;
  }
  // 새 구간: order 에 push, bySegment 에 set
  ```
- 수준 번호: 원본은 1부터(ladder.ts:L8-L9, L41-L43), 우리는 0부터. 원본 = 우리 + 1.
- final: 원본은 메시지 깃발(`final = level >= top`, orchestrator.ts:L343)이고 한 번 참이면 계속 참(L160). 우리는 `level === 3`. 4수준 사다리(top=4)에서는 같다. 원본 core 기본 설정은 3수준([1000, 7000, 30000], config.ts:L134)이라 top=3 이지만, 사다리 길이는 설정값이고 우리 계약은 SPEC 대로 4수준으로 고정했다. 논리 차이는 아니다.
- 기준 모형 `origin.mjs` 가 L152-L172 와 splatReveal.ts:L26-L31, L76-L80 을 줄 단위로 옮겼다. 사례 24건 전부를 이 모형과 서버 기계 양쪽에 넣어 기대와 같은지 본다. 기대값은 원본 줄을 보고 손으로 적었다.

### 항목별 결과

### 1. 추월당한 수준을 건너뛸 때 이벤트·로그·카운터를 남기는가
- 원본 줄: splatScene.ts:L153, L156-L158. 송신 쪽은 orchestrator.ts:L217-L229.
- 원본 동작: 클라이언트는 이벤트도 로그도 남기지 않는다. `_chunks` 는 건너뛴 도착까지 모두 세고, `_refined` 는 수준이 오를 때만 센다. 로그(`[core] drop …`)와 카운터(`dropped`, `reconJobsDropped`)는 송신 쪽 orchestrator 가 큐에서 버린 잡에만 남긴다. 이건 도착 처리가 아니다.
- 우리 동작: 이벤트는 없다. recordHistory 를 켜면 history 에 skip 을 남긴다. history 길이가 원본 chunks 와 같고, replace 개수가 원본 refined 와 같다.
- 결과: 일치. 카운터 대응을 시험으로 고정했다.
- 사례: 「건너뛴 도착도 원본 chunks 에는 세고 refined 에는 세지 않는다(0→3→1→2→3)」. 그 밖에 counters 를 단 사례 15건 전부를 「원본 카운터·노출과 서버 기계 대응」에서 확인한다.

### 2. 추월 버림이 클라이언트에서도 일어나는가, 송신 쪽에서만 일어나는가
- 원본 줄: orchestrator.ts:L217-L229(R3 큐 정리), boards.ts:L146-L149(중계 캐시는 낮은 수준으로 덮어쓰지 않음), splatScene.ts:L156(받는 쪽 비교).
- 원본 동작: 세 곳 모두에서 버린다. 받는 쪽도 `chunk.level > prev.level` 일 때만 수준을 올린다.
- 우리 동작: 기계가 받는 쪽에서 `도착 ≤ 현재` 면 skip 한다.
- 결과: 일치.
- 사례: 「클라이언트도 늦은 낮은 수준을 스스로 버린다(2→1 은 2)」. 기존 추월 사례 5건에도 origin 으로 L156 을 달았다.

### 3. 같은 (구간, 수준)이 두 번 오면 무시하는가, 다시 불러와 교체하는가
- 원본 줄: splatScene.ts:L156(엄격한 `>`), L160. 중계 캐시 boards.ts:L149 는 `>=` 라서 같은 수준이면 캐시 메시지를 새 것으로 바꾸지만, 클라이언트 상태와는 상관없다.
- 원본 동작: 수준·refined·center·arrivedAt 모두 그대로다. chunks 만 1 늘어난다. 다시 불러오지 않는다(애초에 도형을 바꾸지 않는다).
- 우리 동작: 같은 수준은 skip 이다. 상태와 조각이 그대로이고 released 는 [].
- 결과: 일치. 추정이던 사례를 원본 줄 출처로 바꿨다.
- 사례: 「같은 수준 중복 2→2 는 수준 2 그대로다」(이전 이름 끝의 추정 문구를 지웠다).

### 4. 교체 시점: 새 장면을 다 불러온 뒤 지우는가, 도착 즉시 지우는가(빈 화면이 생기는가)
- 원본 줄: splatScene.ts:L8-L16, L84-L86(dynamicScene:false, 장면 하나), L125-L148(첫 도착 때 한 번만 loadFinal), splatReveal.ts:L101-L105(fade 는 오르기만 한다).
- 원본 동작: 지금 원본에는 수준 교체로 장면을 더하거나 빼는 일이 없다. 그래서 그 사이 빈 화면도 생길 수 없다. 장면을 더하고 빼던 이전 설계는 `visitLeaves` null 충돌 때문에 폐기됐다고 L8-L12 주석에 적혀 있다.
- 우리 동작: 서버 기계의 arrive() 는 한 번 호출 안에서 이전 조각을 released 로 내보내고 새 조각을 보관한다. 서버 기계에는 그리기 시점이 없다.
- 결과: 해당 없음(서버 기계 범위 밖). 원본의 단조 노출은 항목 10 에서 대조했다. 클라이언트에서 그리기 순서를 정할 때는 「도형을 바꾸지 않고 노출만 바꾼다」는 원본 결정을 참고할 것.
- 사례: 없음.

### 5. 0 을 건너뛰고 1·2 부터 시작하는 구간이 실제로 있는가
- 원본 줄: orchestrator.ts:L123-L140(segmentClosed 는 `deliveredLevel + 1` 을 요청한다. 첫 요청은 원본 수준 1 = 우리 0), boards.ts:L127-L137, L149(중간에 합류한 보드는 구간마다 캐시된 최신 수준 하나만 받는다), splatScene.ts:L163-L171(처음 온 수준이 무엇이든 그 수준으로 기록한다).
- 원본 동작: core 흐름 자체는 늘 원본 수준 1 부터 오른다. 하지만 중간 합류나 새로고침한 보드는 원본 수준 2 이상부터 받으므로, 클라이언트 쪽에서는 이 경우가 실제로 생긴다.
- 우리 동작: 처음 온 수준이 무엇이든 first 로 저장하고, 그 뒤 더 높은 수준이 오면 교체한다.
- 결과: 일치. 추정을 출처 있음으로 바꿨다.
- 사례: 「0 없이 1 부터 시작한 구간도 1→2 로 교체된다」, 「재접속처럼 최신 수준 3 만 받으면 바로 최종이다」(origin 추가).

### 6. 최종 수준 도착 뒤 같은 수준을 다시 받으면 다시 그리는가
- 원본 줄: splatScene.ts:L156, L160. splatReveal.ts:L79 는 같은 목표값이면 바꾸지 않는다.
- 원본 동작: 수준·final 이 그대로이고 refined 도 늘지 않는다. 다시 그리지도 않는다. 노출 목표는 이미 1.0 이다.
- 우리 동작: skip, final 은 참으로 남는다.
- 결과: 일치.
- 사례: 「최종 수준 3 중복 도착 뒤에도 최종 3 이다」(추정에서 원본 출처로 바꿨고 counters·reveal 을 더했다).

### 7. 구간 번호의 범위·형식
- 원본 줄: segmenter.ts:L134-L137(`Math.floor(arcM / segmentMeters)`, 유한하지 않거나 음수면 0), protocol.ts:L176(`segment: number`), splatScene.ts:L74(`Map<number, …>`). 노출은 splatReveal.ts:L77 에서 `coreSegment % regionCount` 로 슬랩을 접는다.
- 원본 동작: 0 이상 정수이고 상한이 없다. 기록은 구간 번호마다 독립이다. 노출만 슬랩 수(최대 8, L22)로 접혀서, 구간 k 와 k+regionCount 가 같은 슬랩을 공유한다.
- 우리 동작: 0 이상 2^30 미만 정수만 받는다. 범위 밖이면 RangeError. 범위 안에서는 구간마다 독립이다.
- 결과: 범위 안은 일치, 2^30 이상에서 **불일치**. 원본은 받아들이고 우리는 거절한다. 실제 비행 거리로는 도달할 수 없는 값(2^30 × 구간 길이)이고, 계약(contracts/asset SEGMENT_ID_LIMIT)이 일부러 정한 상한이다. 제품 코드는 고치지 않았고 test.todo 와 「현재 동작 고정」 시험으로 기록했다. 슬랩 접힘은 렌더링 쪽 일이라 서버 기계와는 해당 없음이다.
- 사례: 「아주 큰 구간 번호와 0 번 구간은 서로 독립이다」(원본 출처로 바꿈), MISMATCHES 「구간 번호 2^30 이상: 원본은 받고(상한 없음) 우리 기계는 RangeError 로 거절한다」.

### 8. 재접속 때 최신 수준만 보내는 일이 클라이언트 상태 초기화와 함께 일어나는가, 이미 가진 구간에 더 낮은 수준이 올 수 있는가
- 원본 줄: boards.ts:L127-L141(replayFrames: 구간 오름차순, 구간마다 하나), L143-L150(캐시는 `msg.level >= prev.level` 일 때만 갱신), L174-L194(attach 때 재전송), serverSource.ts:L136-L143(소켓이 끊기면 다시 연결만 하고 상태는 비우지 않는다), statusViewer.ts:L524-L525(SplatScene 은 페이지에서 한 번만 만든다).
- 원본 동작: 같은 페이지에서 재연결하면 클라이언트 상태를 초기화하지 않는다. 초기화는 페이지를 새로 열 때뿐이다. 캐시는 내려가지 않으므로, 재전송 수준은 클라이언트가 이미 본 수준 이상이다. 같으면 무시되고(L156), 높으면 교체된다. 이미 가진 구간에 더 낮은 수준이 오는 경로는 없다. 와도 L156 이 막는다.
- 우리 동작: 같은 수준은 skip, 높은 수준은 replace.
- 결과: 일치.
- 사례: 「재연결 재전송: 이미 가진 수준은 무시하고 더 높은 최신 수준만 교체한다」.

### 9. 도착하지 않은 구간을 splatScene 이 어떻게 「없음」으로 표시하는가
- 원본 줄: splatScene.ts:L154, L163-L171(도착해야 키가 생긴다), L253-L271(loadedChunks·scenes·segmentLevels 에 그 구간이 없다), splatReveal.ts:L40, L178-L181(pending 기본 0, 노출이 0.004 미만이면 그 점을 화면 밖으로 보낸다).
- 원본 동작: 「없음」 표지 값은 따로 없다. 기록에 키가 없을 뿐이고, 그 슬랩은 노출 0 이라 그리지 않는다. 메우지도 꾸미지도 않는다.
- 우리 동작: snapshot 이 level -1, missing true 를 돌려준다. expect() 로 미리 등록할 수 있지만 상태는 여전히 없음이다. 원본에는 미리 등록하는 길이 없다. 등록 여부는 segments() 목록에만 차이를 낸다.
- 결과: 일치(의미가 같다: 미도착은 수준 없음이고 그리지 않는다). 명시적인 missing 표지와 expect() 는 우리 쪽에서 더한 것이다.
- 사례: 「도착 전 구간은 없음이다」, 「한 구간만 도착하면 다른 구간은 없음으로 남는다」, 「expect 로 등록만 한 구간은 …」. 세 사례에 origin 과 reveal 0 을 달았다.

### 10. splatReveal 의 도착 기준 노출이 수준 교체와 어떻게 맞물리는가
- 원본 줄: statusViewer.ts:L551-L552(도착마다 noteChunk 와 noteArrival 을 둘 다 부른다), splatReveal.ts:L26-L31(alphaForLevel), L76-L80(pending 은 큰 값만 남긴다), L88-L106(앞 슬랩 게이트를 지나야 targets 로 넘어가고, fade 는 오르기만 한다).
- 원본 동작: 노출 중에 교체가 오면 목표만 올라가고 이어서 페이드한다. 늦은 낮은 수준이 와도 목표는 내려가지 않는다. 그래서 노출 목표는 늘 「지금까지 온 최고 수준」의 함수이고, 이는 noteChunk 의 level 과 같다.
- 우리 동작: 서버 기계에는 노출이 없다. 대신 현재 수준(level, final)만으로 원본 alphaForLevel 을 계산하면 원본 pending 과 같은지 시험한다. 시간에 따른 fade 와 슬랩 게이트는 렌더 쪽 일이라 대조하지 않았다.
- 결과: 일치(상태 쪽). 시간 페이드와 게이트는 해당 없음.
- 사례: 「노출 중 교체: 노출 목표는 오르기만 하고 늦은 낮은 수준은 내리지 못한다(0→2→1)」. reveal 을 단 사례 9건 전부를 「노출 목표는 현재 수준만으로 정해진다」에서 확인한다.

### 시험

- `node --test server/levels/parity/parity.test.mjs`: tests 82, pass 81, fail 0, todo 1
- `node --test server/levels/*/*.test.mjs`: tests 120, pass 118, fail 1, todo 1
  - 실패 1건은 이번 변경과 상관없는 기존 문제다. no_timer.test.mjs:114 「검사 대상 목록에 levels 소스 7개」가 Windows 에서 `fileURLToPath` 의 역슬래시 경로와 `/` 접두사를 비교해 `client/levels/index.mjs` 를 못 찾는다. parity/ 밖이라 손대지 않았다.

### 불일치 요약

1. 구간 번호 2^30 이상: 원본은 받고 우리는 RangeError 로 거절한다(계약 상한). test.todo 로 기록했다.
2. 불일치는 아니지만 기록해 둘 것:
   - final 출처. 원본은 메시지 깃발(level >= top)을 쓰고, 우리는 level === 3 이다. 4수준 사다리에서 같다. 원본 core 기본 설정은 3수준이다.
   - expect()·missing 표지는 우리 쪽에서 더한 것이다.
   - 원본 노출 슬랩은 `segment % regionCount` 로 접힌다. 클라이언트 렌더를 대조할 때 다시 볼 것.

## T11.8L — 원본 코어 이벤트 모양 대조(녹화 재생 전 절반)


- 대상: 우리 `server/adapter/core/index.mjs` (원본을 보지 않고 가정으로 작성)
- 원본: NET-Challenge-S13/skylens 커밋 0122bd4 (읽기 전용)
- 작업 브랜치: feat/local-parity--t11, 커밋 1450cb2 (`server/adapter/core/original_shapes.test.mjs` 추가만, index.mjs 는 고치지 않음)
- 시험: `node --test server/adapter/core/*.test.mjs` → 94건, 통과 87, 실패 0, todo 7 (새 파일: 16건 = 통과 9 + todo 7)

### 1. 원본 이벤트 목록 (파일:줄, 0122bd4)

원본 코어가 뷰어 쪽(관제탑·현황판 릴레이)으로 미는 것은 전부 `Envelope<ViewerMessage>` JSON 텍스트 프레임 하나씩이다.

| 무엇 | 위치 | 내용 |
|---|---|---|
| Envelope | src/shared/protocol.ts:34-43 | `{seq(송신자 단조 증가), originTs(unix ms), from:'core', payload}` |
| 감싸기·송출 | src/skylens_core/server/distributor.ts:126-130, 185-194 | broadcast 마다 seq+1, JSON.stringify |
| ViewerMessage 합집합 | src/shared/protocol.ts:341-353, 366-375 | assign-route, splat-chunk, detection, telemetry, camera-feed, mission-status, server-status, link-status |
| **SplatChunk (재구성 도착 — 유일)** | src/shared/protocol.ts:172-188 | `{kind:'splat-chunk', id, segment, level, steps, label, final, url, bytes, align}` |
| SplatAlign | src/shared/protocol.ts:164-170 | `{anchor: Gps\|null, position[3], rotation[4] 쿼터니언, scale[3]}` |
| chunk 생성 | src/skylens_core/server/orchestrator.ts:336-361 | id=`seg{segment}-l{level}`, `final = level >= top` |
| 송출 배선 | src/skylens_core/server/index.ts:80 | `onChunk → distributor.broadcast(chunk)` |
| 수준 사다리 | src/skylens_core/server/ladder.ts:8-9, 41-51 | level 은 **1부터 세는 칸 번호**, top = 칸 수 |
| 기본 사다리 | src/skylens_core/server/config.ts:97-101, 134 | `SKYLENS_CORE_LEVEL_STEPS` 기본 `1000,7000,30000` (3칸) |
| SegmentStatus / ServerStatus | src/shared/protocol.ts:211-219, 252-261 | `segments[]: {index, level(0=대기·처리 중), levels, steps, label}` |
| server-status 생성·주기 | src/skylens_core/server/index.ts:113-129, 293-297; store.ts:209-219 | 주기 하트비트(statusMs) |
| 늦은 뷰어 재생 | src/skylens_core/server/index.ts:133-148; store.ts:200-207 | mission → telemetry → route → 구간마다 최신 chunk(구간 오름차순) → detection → camera → server-status |
| 구간 생성·닫힘 | src/skylens_core/server/ingest.ts:247-283; segmenter.ts:133-141 | 구간 = floor(호 길이/구간 길이). 닫힘은 뷰어 메시지가 없고 로그만 |
| 구간 기록 | src/skylens_core/server/types.ts:35, 42-62; store.ts:142-164, 183-191 | deliveredLevel 0 시작, putChunk 가 갱신 |
| R1~R3 스케줄 | src/skylens_core/server/orchestrator.ts:129-139, 217-226, 365-367 | 한 구간에 복원 잡 하나, 추월 수준은 버림 |
| 받는 쪽(관제탑) | src/skylens_core/coreLink.ts:121-123 | `onSplatChunk` |
| 받는 쪽(현황판) | src/skylens_client/statusview/splatScene.ts:152-172; status.ts:162-168 | 구간마다 최고 level 만, final 은 OR |
| 릴레이 재생 캐시 | src/skylens_client/server/boards.ts:145-150 | `level >= prev.level` 이면 갈아끼움 |

### 2. 우리 가정과 대조

| 항목 | 우리 가정 (index.mjs) | 원본 | 판정 |
|---|---|---|---|
| 이벤트 이름 | `level_arrived` | `splat-chunk` (Envelope.payload) | 불일치 (변환 필요) |
| "구간 올 예정" | `segment_expected` | 전용 이벤트 없음. server-status.segments 의 level 0 으로만 보임 | 불일치 |
| 구간 필드 | `segmentId` (0..2^30-1 정수) | `segment` (0 이상 정수) | 이름 불일치, 값 범위 일치 |
| 수준 번호 | 0..3, LEVEL_STEPS 색인 | 1부터 칸 번호, 0 = 아직 없음 | 불일치 (L → L-1, 단 사다리가 같을 때만) |
| 수준 스텝 | 250/1000/3500/7000 고정 4칸 | 설정값. 기본 1000/7000/30000(3칸), README 데모 250/1000/3500(3칸) | 불일치 (30000 없음, 칸 수 다름) |
| final | level === 3 에서 파생 | chunk 에 명시 `final = level >= top` | 4칸 사다리에서만 일치 |
| 내용 | 조각 배열 `{key{segmentId,level,lod,chunkIndex,tileX,tileY}, bytes:Uint8Array}` | `url`(PLY 파일 하나) + `bytes`(파일 크기, 바이트 수) | 불일치 (받기·자르기 없음) |
| 배치 | 없음 | `align` (GPS anchor, position, 쿼터니언 rotation, scale) | 불일치 (정보 유실) |
| 순서 | 동기 호출, 순서 검사 없음 | Envelope.seq 단조, originTs ms | 어댑터는 안 봄 (변환 계층 몫) |
| 첫 도착 | first | 새 구간 chunk 그대로 표시 | 일치 |
| 교체 | 높은 수준이 낮은 수준 교체 | protocol.ts:177 "higher one REPLACES" | 일치 |
| 중복(같은 수준) | skip, 송출 0 | 현황판 상태 그대로(캐시는 갈아끼움) | 상태 일치 |
| 추월(늦은 낮은 수준) | skip | R3 로 코어가 안 보냄, 받는 쪽도 무시 | 일치 |
| 늦은 합류 | 어떤 수준이든 first | 구간마다 최신 chunk 하나만 재생 | 일치 |
| 없음 → MISSING | expect 뒤 없음이면 MISSING | level 0 구간 = 대기·처리 중 | 의미 일치 (변환 가정) |

### 3. 고친 것

- index.mjs 는 고치지 않았다. 불일치가 필드 이름·단위 수준이 아니라 구조(url vs 조각, 사다리 칸 vs 색인, final 출처, 배치 정보)라서 "작은 모양 수정" 범위가 아니다.
- `server/adapter/core/original_shapes.test.mjs` 추가:
  - 원본 타입을 손으로 옮긴 픽스처(SplatChunk, Envelope, ServerStatus) — 줄 번호 주석 포함.
  - 시험 전용 변환 가정(bridge): splat-chunk → level_arrived(steps 로 색인 찾기, 자리표시 조각 한 개), server-status level 0 → segment_expected.
  - 일치 시험 9건: 4칸 사다리 매핑, README §4.3 실측 순서(구간 2 정제 중 구간 3 수준 1), 늦은 합류 재생, 중복, 추월, MISSING, 구간 0, 원본 모양 직접 투입 거부, 계약 상수.
  - 불일치 todo 7건(위 표의 불일치 항목).

### 4. 남은 것

1. **원본 → 어댑터 변환 계층** (설계 결정 필요): splat-chunk 를 받아 url 의 PLY 를 가져와 .skla 조각으로 자르고 PieceKey 부여, steps → 수준 색인, final·align 전달 방법 결정. 어댑터 소유 경로 밖(자산 파이프라인)과 엮이므로 별도 작업으로 올리는 것을 제안.
2. **사다리 맞추기**: 우리 LEVEL_STEPS 를 설정 가능하게 하거나, 원본 코어를 `SKYLENS_CORE_LEVEL_STEPS=250,1000,3500,7000` 로 띄우는 것을 시연 조건으로 고정.
3. **segment_expected 출처**: server-status 하트비트에서 파생할지, 원본에 구간 닫힘 메시지를 추가 요청할지 결정.
4. **실제 녹화 재생으로 상태 일치 확인** — 사람 녹화 뒤.

### 녹화 방법 제안

- 코어 띄우기: `SKYLENS_CORE_LEVEL_STEPS=250,1000,3500,7000` (4칸, 우리 LEVEL_STEPS 와 같게). 3칸 기본값 녹화도 하나 따로 있으면 불일치 todo 를 실데이터로 확인할 수 있다. 탐지 등 나머지 설정은 기본.
- **캡처 지점 1 (필수)**: 코어의 뷰어 WebSocket(`SKYLENS_CORE_VIEWER_PATH` 경로)에 뷰어 하나를 더 붙여 받은 **텍스트 프레임을 그대로** 한 줄씩 JSONL 로 저장. 각 줄에 수신 시각(ms)만 덧붙이고 프레임 내용은 고치지 않는다. `src/test/core/fakeViewer.ts` 의 수신부(on 'message')에서 `data.toString()` 을 파일에 append 하도록 고친 복사본이면 된다. **비행 시작 전에** 붙여야 첫 chunk 부터 실시간 순서가 잡힌다. 중간에 붙인 녹화(재생 묶음 확인용)도 하나 있으면 좋다.
- **캡처 지점 2 (필수)**: 각 splat-chunk 의 `url` 이 가리키는 PLY 를 녹화 중에 바로 받아 `seg{segment}-l{level}.ply` 로 저장(모델 API 가 재시작하면 사라질 수 있음). 받은 파일 길이가 chunk 의 `bytes` 와 같은지 기록.
- **캡처 지점 3 (권장)**: 코어 표준출력 로그 전체(`[core] segment N closed at …`, `segment N level L/top … → viewers`) — 구간 닫힘은 뷰어 메시지가 없어서 로그가 유일한 근거. 녹화 시작·끝에 `GET /health` 응답(ladder 항목 포함, index.ts:234) 저장.
- 대안 캡처 지점: 현황판 릴레이(`src/skylens_client/server/upstream.ts`)가 코어에서 받는 프레임도 같은 모양이다(relayProtocol.ts:3-7, 그대로 전달). 다만 릴레이 VIEWER_KINDS(relayProtocol.ts:69-76)에는 assign-route·camera-feed 가 빠져 있어 코어 직접 캡처가 낫다.
- 녹화 파일에 서버 주소·포트·자격 증명이 들어가지 않게 url 은 경로 부분만 남기고 호스트는 지운다.
- 재생 시험: JSONL 을 읽어 Envelope.payload 중 splat-chunk·server-status 만 변환 계층에 넣고, 끝 상태(구간별 수준·final)를 원본 받는 쪽 규칙(splatScene.ts:152-172)으로 계산한 값과 비교. 마지막 server-status.segments 의 level 과도 비교(원본 store 상태 그대로).
