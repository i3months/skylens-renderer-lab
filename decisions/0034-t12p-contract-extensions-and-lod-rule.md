# 0034 client_raster 계약 확장 반영, 타일당 LOD 하나 규칙, 묘비 지평 판정 보강

- 상태: 승인(규칙 2 보완 필요 — F-246 ①)
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: FEEDBACK F-243 ④, F-245 ①, F-241 ⑨, 결정 0033, experiments/t12p.md

## 맥락
T12 본체가 계약 밖 메서드(setArrived, residentKeys, isContextLost, onContextRestored 인자·해제 반환, uploadBookkeeping)를 구현에 넣었다. selectDrawable 은 lod 를 보지 않아 같은 (구간, 수준, 타일)의 서로 다른 LOD 를 함께 draw 했다. 묘비 지평이 FIFO 로 올라가면 보관 중인 기록과 겹치는 다른 값이 대조 없이 true 였다.

## 결정
1. 계약 Renderer typedef·CLIENT_RASTER_API 에 setArrived·residentKeys·isContextLost·onContext* 구독 해제 반환을 올리고 계약 메서드 전부를 구현이 갖는지 보는 시험(api.test.mjs)을 둔다. uploadBookkeeping 은 시험 관측용 확장으로 계약에 올리지 않는다.
2. selectDrawable: 후보는 최상위 수준 M 의 완료 key 집합이면서 상주한 key 만. 타일마다 완료 조각이 전부 상주한 가장 세밀한 LOD 하나만 draw, 없으면 일부라도 상주한 가장 세밀한 LOD. 거친 LOD 는 discard. 더 세밀하지만 덜 도착한 LOD 는 discard 가 아니라 pending(discard 로 보내면 호출자가 해제해 영영 완성되지 못함). 도착하지 않은 것을 다른 LOD 로 메우지 않는다.
3. resume 저장소: 기억 중인 모든 기록(보관·묘비)을 창 순서 배열로 두고, 겹치는 가장 앞 기록이 있으면 값이 같을 때만 true, 다르면 지평과 무관하게 RangeError. 기억에 없고 창 끝 ≤ 지평일 때만 blind true.

## 선택지와 대가
- LOD: 서버가 타일당 LOD 하나만 보낸다는 보장이 ASSET_FORMAT §10.1 에 없어(LOD 는 교체 가능이라고만 함) 클라이언트가 고른다. 대가는 selectDrawable 이 약 1.3~1.8배 느려진 것(10만 key 중앙값 160~200 ms → 245~315 ms, 이 환경이 기준 주석 환경보다 약 3배 느림, 도착 이벤트당 1회).
- resume: byLast Map 대신 배열+경로 압축 건너뛰기. 호출당 비교 수 work 1 유지. 압축 제거는 속도에만 영향이라 기능 시험이 못 잡는다(측정 안 함).

## 다시 볼 조건
ASSET_FORMAT 이 타일당 LOD 하나 송출을 보장하면 규칙 2 를 단순화. 실제 skylens 체크아웃·ws 배선(F-238 ④)에서 pending 으로 남는 LOD 가 쌓이는지 확인.

## 감독 승인 (2026-10-04 PR #49 검토 #1)
- 1·3 승인: 계약 확장 반영과 묘비 판정 보강은 감독 확인(F-241 ⑨ 재현 입력 RangeError·blind 0, 변이 실패). uploadBookkeeping 을 시험 관측용 확장으로 두는 것은 받아들이되, 계약 대조 시험이 실제 renderer 키를 보게 한다(F-246 ④).
- 2 승인(보완 조건): 타일당 LOD 하나·세밀한 미완 LOD pending 은 맞다. 다만 완전한 LOD 가 없을 때 성긴 일부 상주 LOD 를 discard 하면 같은 이유(해제되어 영영 완전해지지 못함)로 비대칭이 된다 — F-246 ① 에서 고친다. 거리 기반 LOD(contracts/lod, Δd)를 미루는 이유는 계약 ④ 에 적는다(F-247 ②).
- 대가 추가: 기록 사이 틈의 창도 지평 아래면 다른 값이 true 가 된다(F-247 ⑥).
