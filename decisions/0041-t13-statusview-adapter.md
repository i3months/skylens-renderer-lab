# 0041 현황판 어댑터: 모듈 주입 조립, 도착 요청 시점, 대응표는 추정 상태

- 상태: 제안
- 날짜: 2026-10-04
- 결정한 사람: 작업자(제안)
- 관련: TASKS T13, 실험 노트 experiments/t13.md, 결정 0029(수준 상태 기계), 0040

## 맥락
현황판(skylens statusview)의 역할을 경로 B 위에 다시 얹는 어댑터를 8개 모듈로 나눠 만들었다. skylens 체크아웃은 [cloud] 에서 열 수 없어 splatScene.ts·splatReveal.ts·cameraSync.ts 의 실제 메서드를 대조하지 못했다.

## 선택지와 결정

| 쟁점 | 선택지 | 채택 | 대가 |
|---|---|---|---|
| 조립 방식 | A. 어댑터가 모듈을 정적 import / B. modules 를 인자로 주입, 기본은 loadDefaultModules() 동적 import | B | 호출자가 한 줄 더 쓴다. 모듈별 가짜로 시험할 수 있다 |
| 조각 요청 입력 | A. 수준 도착 때 그 창의 키(이미 받은 것)를 요청 / B. 호출자가 넘기는 자산 색인 pieceIndex, MISSING 구간이 도착 전일 때 색인 중 받지 않은 key 만 | B | pieceIndex 를 안 넘기면 requests() 는 늘 빈 배열. 선 메시지에 아직 받지 않은 PieceKey 를 알리는 것이 없어 호출자 색인이 필요하다. A 는 이미 받은 조각만 되요청해 대역폭 중복(F-291) |
| 교체 해제 키 출처 | arrive 결과의 released / levels.released() | levels.released()(돌려준 뒤 비움) | 어댑터가 받아들인 arrive 직후 불러 levels 쪽 누적이 쌓이지 않게 한다. 가짜 모듈도 같은 의미 |
| WELCOME resumed=false | 색인만 비움 / 수준 상태·planner·색인을 모두 새로 만들고 이전 그리던 key 를 releasedKeys 로 내보냄 | 후자(F-288) | 새 세션 도착분이 (구간, 수준) 키로 교체, 도착시키지 않은 칸은 비운다(server/ws/session/contract.mjs). 앞 세션에서 알던 구간은 도착 전 표시. 새 세션이 같은 key 를 도착시키면 같은 frame 의 releasedKeys 에서 빼고, PIECE 만 오고 LEVEL_ARRIVED 전에 frame 이 불리면 앞 세션 해제 목록에 그 key 가 나간다(호출자 보관 규칙 필요, 미결) |
| 대응표 원본 열 | 추정으로 표시 / 비워 둠 | 'estimated' | T13L [local] 에서 skylens 와 한 줄씩 대조해 'verified' 로 바꾼다 |

## 다시 볼 조건
- skylens 원본 대조(T13L)에서 메서드 이름·인자가 다르면 대응표를 고친다.
- 서버가 구간 도착 이벤트·자산 색인을 선에 싣게 되면 pieceIndex 를 선 입력으로 바꾼다.
- 추월로 건너뛴 창의 pieceSeq 색인이 세션 동안 남는 것은 미해결.
