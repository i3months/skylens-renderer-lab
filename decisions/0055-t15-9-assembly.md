# 0055 T15.9 관제탑 화면 조립(createControlView)과 T15.8f 정정

- 상태: 제안
- 날짜: 2026-10-05
- 결정한 사람: 작업자(제안)
- 관련: TASKS T15.9·T15.8f, 계약 contracts/controlview/e2e.mjs, 실험 노트 experiments/t15-9.md, FEEDBACK F-443·F-444·F-445·F-446

## 맥락

T15.0~T15.8 모듈을 한 객체로 묶어 녹화 재생 상태 일치를 시험해야 한다. 폴백 퇴화 입력(F-443)과 행 좁히기 비용(F-444 ③)도 함께 정한다. renderer_basis 는 해당 없음(로컬 조립·2D 지도·타일 계획이라 점군 생성과 무관).

## 선택지

| 선택지 | 장점 | 단점 | 근거 |
|---|---|---|---|
| 조립 step 순서: 입력 → 추적 → 카메라 → 스트리밍(채택) | 같은 프레임에서 카메라 갱신 반영 | 데이터가 step 뒤에 들어가면 그 프레임엔 추적 대상 없음 | state_match.test 손계산 |
| 폴백일 때 camera·overlay·streaming 을 null 로(채택) | 3D 층과 함께 그리지 않는다는 계약 | 폴백 중에도 step 은 streaming.update 를 부름 | state_match 시험 3 |
| 폴백 여백 m = min(max(marginPx,1), min(w,h)/4)(채택) | marginPx 0 에서도 끝 점 visible, 1 px 붕괴 없음 | FEEDBACK 이 제시한 (min−1)/2 는 avail 이 1 이 돼 붕괴(서브에이전트 확인) | view.test 크기 스윕 min 2~120 단조 |
| metersPerPx 하한 1e-6 m/px 를 계약에 둠(채택) | 언더플로 NaN 차단 | 이보다 작은 축척 불가 | TOWER_FALLBACK_LIMITS.minMetersPerPx |
| visible 행 좁히기를 16각형 반공간 대신 2D 다각형·원 교차 y 범위로(채택) | 기본값 호출 비용 옛 구현의 1.0배, 고고도 최대 230 행 | 코드 늘어남 | experiments/t15-9.md 수치 |

## 결정

위 채택안으로 한다. 시험 문턱은 낮추지 않았고 F-446 의 'marginPx 0·100×100·점 하나 → mpp 10' 기대는 여백 하한 1 px 때문에 1000/98 로 바뀌었다(감독 판단 필요).

## 대가·다시 볼 조건

- 폴백 자동 맞춤 frame p90 ≤ 8 ms 는 미달(p90 11.5 ms, setView frame 도 14.7 ms): 출력 객체 약 10 만 개 생성 GC 가 원인이라 출력 형식 변경이 필요. 총 점 상한(maxPaths 64 × maxPathPoints 100000 = 640 만 점)을 계약에 둘지 감독 판단.
- 조립 clear() 는 overlay·fallback 데이터만 비운다(입력 자세·타일 상태 유지, reset 없음). 필요하면 계약에 reset 추가.
- 실제 skylens 체크아웃 대조는 [local] T15.0L.
