# 0036 T12.S 계약 확장 입력 검사, 시험 전용 옵션

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-250 ①, F-251, F-249 ⑤⑥⑨, F-245 ⑤⑦, F-253 ②③⑥, F-256 ②⑤, 결정 0034, 결정 0035(④ 를 이 결정이 대체, ③ 은 이 결정 5 가 대체), 결정 0037

## 맥락
결정 0037 에서 setArrived 의 지연 경로(`{deferResult: true}`)는 호출 시점에 항목·key 검사를 하고, Worker 타임아웃 시 failAll 로 모든 대기 요청을 거부하며, makeRoom 에서 현재 업로드 key 를 선택에 포함하기로 정했다(F-248 ④, F-250 ①). testHooks 옵션과 onContextRestored 의 둘째 인자 error 가 시험 전용 구현이면서 계약에 남겨졌다(F-249). 이 문서는 그 확장 옵션들의 상태와 운영 경계를 정한다.

## 선택지

| 선택지 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A | 지연 경로도 호출 시점에 key 검사, 실패 시 예외 | 예외가 즉시 드러남 | 도착 루프가 예외 처리 필요(이전 선택) |
| B | 호출 시점 검사 없음, draw·업로드에서 'piece' 오류 | 호출자는 예외 처리 불필요 | 검사 책임을 draw 로 미룸(지연 경로의 의도) |
| C | 호출 시점 얕은 검사(key 형식만), 값 검증은 draw 에서 | 중간 선택: 악의 입력은 거르고 호출자 부담 완화 | 검사 2곳 분산, 비용 |

**선택: A**: 지연 경로도 호출 시점에 항목·key(형식, segmentId·level 일치, level 0..3)를 검사하고 실패하면 'piece' 로 던진다. 던지면 arrived·selectionStale 을 바꾸지 않아 직전 선택으로 draw·업로드가 정상 동작한다(F-250 ①, 잘못된 key 가 draw 를 계속 막고 관계없는 업로드를 거부하던 문제). 검사는 O(key 수)라 지연 경로의 합치기 목표와 상충하지 않는다.

| 선택지 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A | testHooks 를 계약에 올림 | 공개 인터페이스 | 운영에서 그리기 규칙 우회 가능 |
| B | 계약 주석에만 적고 typescript 서명에는 올리지 않음 | 시험 외 접근 불가 | 같은 이름의 임의 옵션으로 우회 가능 |
| C | testHooks 를 폐기하고 단위 시험에서만 확인 | 깨끗함 | 시험 코드가 배포되거나 프로덕션 설정이 시험 코드 경로를 탈 수 있음 |

**선택: B**: 계약 주석에만 명시. 막는 장치는 없으나 운영 빌드는 계약을 정적 검사 도구(typecheck)로 재현해 'testHooks' 문자열이 없는 배포본을 만들 수 있다.

| 선택지 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A | onContextRestored 의 두 번째 인자는 예정된 없음 | 계약 명확 | error 정보를 전달할 수 없음 |
| B | `onContextRestored(error?: Error)` 로 정의 | 복구 오류를 알 수 있음 | 타입 시그니처 확장 |
| C | 계약은 key 배열 1인자, 구현만 2인자(error)를 보내고 계약 주석에 '구현 확장(계약 밖)' 으로 표시 | 호출자가 진단 정보 받음, 계약 서명 불변 | 계약 밖 동작을 호출자가 의존할 수 있음 |

**선택: C**: 계약의 콜백 인자는 key 배열 하나다. 둘째 인자 error 는 계약 밖 구현 확장이며 계약 typedef(:157)와 CLIENT_RASTER_API(:214)가 모두 '구현 확장(시험용)' 으로 적는다(서명에 `error?: Error | null` 을 올리지 않는다). 구현은 복구 중 프로그램 재생성이 실패한 경우(failure)에만 key 목록을 비우고 둘째 인자로 오류를 보낸다. 앞 판의 선택 B(계약 서명에 추가)는 채택되지 않았다.

## 결정

1. **setArrived 지연 경로 입력 검사**: 호출 시점에 검사하고 실패 시 상태 불변(선택지 A). 계약 서명·문구는 contracts/client_raster/index.mjs 에 반영(f8f51aa).

2. **testHooks 옵션 지위**: 계약 typedef 주석에 명시하되 typescript 서명(`Renderer` 또는 옵션 interface)에는 올리지 않는다. 이를 통해 정상 배포본(typecheck 통과)은 'testHooks' 문자열 접근을 컴파일러 경고로 제한한다. 구현이 이를 무시하고 받는 것은 시험 경로일 때만 의도된다.

3. **onContextRestored 둘째 인자(결정 0035 ④ 대체)**: 계약 :157 typedef 는 `(keys: string[], error?: Error) => void` 로 쓰고 둘째 인자를 '구현 확장(시험용, 계약 밖)' 으로 표시하며, :214 의 fn 설명도 같다. 구현(client/raster/index.mjs 의 ctx.onRestored)은 복구 중 프로그램 재생성이 실패해 failure 가 생기면 keys 를 빈 배열로, 둘째 인자를 그 ClientRasterError('context') 로 보내고, 실패 중 draw 는 건너뛰며 uploadPiece 는 'context' 로 거부한다. 성공하면 둘째 인자는 없다. 호출자가 error 를 무시해도 계약 동작은 같다. 결정 0035 ④(testHooks·error 인자를 계약 서명표에 올리지 않음)는 error 인자 부분이 이 결정으로 대체됨으로 본다(testHooks 는 결정 2 로 유지).

4. **Worker gpu 평면·타임아웃·makeRoom 규칙**: 계약 밖이며 결정 0037 의 초기 설계에서 출발했다. 코드와 달라진 부분은 아래 5~7 이 정정한다.

5. **복호 시한 뒤 자체 terminate(결정 0035 ③ 대체)**: 맨 앞 요청이 timeoutMs 안에 응답하지 않으면 Worker 클라이언트가 그 요청과 대기 중 나머지를 거부(failAll)하고, 스스로 Worker 를 terminate 하며 terminated 상태로 만들어 이후 decode 는 즉시 'terminated' 로 거부한다. 앞 판은 막힌 Worker 를 살려 두어 새 요청이 처리 중 요청 뒤에 줄 서서 거짓 timeout 을 받았다(0035 ③ 의 연쇄 오탐, F-253 ③). 새 Worker 를 만들어 spawn 하는 것만 호출자 몫이다(client/raster/loop/index.mjs 머리 주석).

6. **checkArrived 분리**: 지연 setArrived 의 호출 시점 검사는 selectDrawable 이 아니라 타일 표 없는 가벼운 검사기 checkArrived(client/raster/arrived_check)가 한다. 거부 기준(항목 모양, key 형식·범위, (segmentId, level) 일치)과 던지는 오류('piece')는 selectDrawable 과 같고, 10만 key 에서 지연 경로가 즉시 경로의 0.21 배(기준 ≤ 0.5)다(F-253 ②, experiments/t12s.md). 시험은 testHooks.checkArrivedKey 로 key 당 단계 수를 센다. 후속(계약은 이 저장소에서 읽기 전용): 계약 :176 의 testHooks 목록 `{selectDrawable?, toGpuPlanes?}` 에 checkArrivedKey 가 빠져 있고, 구현이 받는 onGlUploadStart·onGlUploadEnd·onDrawStart·onDrawEnd(결정 0038)도 없으므로, 계약 :176 에 checkArrivedKey·onGlUploadStart/End·onDrawStart/End 를 추가해야 한다.

7. **makeRoom 업로드 key 포함 규칙과 이번 수정에 포함된 두 가지**: (가) 한도 여유가 있으면 선택을 만들지 않고 돌아간다. 한도를 넘으면 지금 올리는 key 가 도착 집합에 들고 아직 상주하지 않을 때만 그 key 를 넣은 지역 선택(저장하지 않음, 같은 meta 세대·도착 객체·key 면 직전 결과 재사용)으로 희생을 정하고, 아니면 현재 선택(낡았으면 한 번 다시 돈 것)을 쓴다. 희생은 그 선택의 draw 조각과 올리는 key 를 제외한 오래된 상주 조각이다(0037 의 '현재 올리는 key 는 항상 포함' 서술을 이 규칙으로 정정). (나) 업로드 실패 시 희생이 있었으면 selectionStale=true 로 두어 다음 draw 에서 한 번 다시 돈다(F-256 ②: 희생은 해제됐는데 새 조각이 없어 선택이 해제된 key 를 가리키던 문제). (다) Worker 의 messageerror 도 onerror 처럼 대기 중 전부를 거부하고 Worker 를 terminate 하며 terminated 로 둔다(F-256 ②, F-253 ③ 과 같은 이유로 살려 두면 거짓 timeout).

## 근거

- **입력 검사**: 지연 경로의 목표는 고빈도 도착 이벤트를 합쳐 프레임당 1회만 선택을 돌리는 것(0037 결정 1)이다. 입력 검사는 O(key 수)로 합치기와 상충하지 않고, 호출자는 던진 예외를 어댑터 경계에서 한 번만 처리하면 된다.
- **testHooks**: 계약에 올리면 정상 배포본도 그리기 규칙을 우회할 수 있다. 계약 주석으로 제한하고 타입 서명에서 빼면 정적 분석이 이 옵션을 사용하는 코드를 경고할 수 있다. 구현에서 받는 것은 시험 경로에서만 의도되기 때문이다.
- **error 인자**: 계약 :157·:214 는 둘 다 error 를 계약 밖 구현 확장(시험용)으로 적고, 구현은 복구 중 프로그램 재생성 실패(failure)일 때만 key 목록을 비우고 error 를 보낸다. 서명에 올리지 않는 것은 testHooks 와 같은 이유(계약 표면을 늘리지 않음)이고, 호출자는 실패 때 빈 key 배열과 error 로 복구 실패를 알아볼 수 있다.
- **시한 뒤 terminate**: 살려 둔 Worker 는 버려진 요청을 계속 처리하므로 새 요청이 거짓 timeout 을 받는다(0035 ③ 대가, F-253 ③). 스스로 terminate 하면 이후 요청은 즉시 'terminated' 로 거부되어 영구 미결도 없다.
- **checkArrived**: selectDrawable 은 타일 표·LOD 고르기까지 만들어 10만 key 에 150~210 ms 가 든다(F-253 ②). 지연 경로는 결과가 필요 없으므로 같은 거부 기준만 검사한다.

## 대가

- **호출자 예외 처리**: 지연 경로 호출자가 'piece' 예외를 처리해야 한다. 대신 잘못된 입력이 상태를 오염시키지 않는다.
- **testHooks 타입 누락**: 시험 코드에서 `as any` 또는 `@ts-ignore` 를 써야 할 수 있다. 그러나 이는 시험 정당성의 신호이기도 하다.
- **error 인자 추가**: 기존 호출자는 ignore 하면 되므로 하위 호환.

## 다시 볼 조건

1. 호출자(ws 핸드오프, F-238 ④)가 도착 이벤트 도중에 key 검사 결과가 필요하면 F-250 ①에서 `validateLevelArrivedKeys(list): Error[]` 등 검사 전용 메서드를 만들고 이 결정을 다시 연다.
2. 정상 배포본에서 testHooks 를 우회하는 코드가 발견되면 runtime check 를 추가하거나 옵션을 완전히 제거한다.
3. Worker 타임아웃이 실제 운영에서 문제가 되거나 makeRoom 규칙을 손봐야 하면 이 결정의 5·7 과 결정 0037 을 다시 본다.
4. 계약 :176 이 갱신되지 않은 채 testHooks 목록이 구현과 계속 어긋나면 결정 2 를 다시 본다.
