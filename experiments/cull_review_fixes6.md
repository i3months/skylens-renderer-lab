# T08.F32·F33 — PR #28 검토 반영 (제품 feat/cull-review-fixes6)

## 한 일
- F-147(opus): predict.test.mjs 를 교정. 하한 = 8·steps 등분 촘촘한 시각에서 부풀림 없이 실제로 보이는 리프의 합집합, 상한 H = hh. 교차항을 '필수 하한' 으로 보던 전제와 주석을 유도(p'−p = (Qᵀ−I)(p−C−vδ) − vδ ⇒ 변위 ≤ |v|δ + 2·far·sin(ωδ/2))로 정정. 상한은 호장(|v|·hh + ω·hh·(far + |v|·hh)) 형태를 쓴다(H = hh 에서 현 형태는 구현 자신의 부풀림보다 작아 구현이 무작위 120 사례 중 약 1/12 에서 허용 집합을 벗어남; 호장은 현 이상이므로 여전히 유효한 상한). 회전 위주 사례 3개·고속 급강하 1개 추가, '허용 ≤ 0.9·leafCount 조합 ≥ 8' 전제, Mup ≥ M 항등 단언 삭제, 주석 수치를 단언으로 고정(×1.2 허용 밖 합 ≥ 20(실제 26), 회전 ×1.5 ≥ 50(실제 59), h/2 누락 ≥ 6). F-149 ⑤(노트 '63' 과 주석 '3 개' 불일치)는 이 단언으로 대체돼 해소.
  변이: 교차항 제거 → 통과(올바른 구현), h/2·전체 ×1.2·회전 ×1.5 → 실패, 원본 통과.
- F-148(sonnet 6): 공용 래퍼 server/cull/degenerate/hierarchy_guard.mjs(guardHierarchyRead)를 계약으로 먼저 푸시. distance·priority·occlusion·predict·combine(cullAndSelect·cachedNormalCones)의 계층 읽기를 감쌈. priority 의 coarseWins 읽기(levels[0] 접근자)는 통합 중 발견해 추가로 감쌈. clientFrustumCull 은 상자 0 개면 cull: 오류. zero_leaf_all_stages 고정 계층을 buildHierarchy 결과에서 leafCount 만 0 으로 바꾼 것으로 교체, 메시지 정규식·양성 대조·predictiveMask 사례 추가, accessor_all_stages 신설(10 단계×7 입력 + leafBoxesOf 4). leafCount<1→<0 변이가 각 단계의 사례를 실패시킴(lod:95 포함).
- F-149: ① frustum_zero_leaf 양성 대조 deepEqual [1]; ② priority 타입배열·levels 검사; ③ occlusion NaN positions 통과로 정책 통일(frustum·distance·backface 가 통과하는 다수 정책); ④ frustum leafIndex 일대일 검사(이 검사표가 퇴화 경로 할당을 n 칸 늘려 degenerate_unified 합계 문턱을 2n→3n 으로 올림, 올리기만); ⑤ 위 F-147 로 해소.
- F-146 ⑥ 잔여: trackAlloc 주석 정정(배열·ArrayBuffer 인자도 construct 를 타나 첫 인자가 숫자가 아니라 세지 않음). ⑦ 은 원문 위치를 못 찾아 계속 열림.

## 검증
npm test 2166 중 2154 통과·0 실패·12 건너뜀(직접 실행). 실제 skylens 체크아웃 입력은 [local].
통합 중 발견: 서브에이전트 보고만으로는 priority 의 levels[0].leafStart 접근자 사례 2건과 퇴화 할당 합계 시험 1건이 병합 후 실패 — 직접 전체 시험으로 잡아 고침.

## 실행 기록
서브에이전트 10개: opus 1·sonnet 8·haiku 1, 모두 첫 시도 성공, 승격 없음. 같은 하위 작업 재기동 없음.
참고: 이 환경 Node 22 에서 `node --test <디렉터리>` 는 MODULE_NOT_FOUND — glob 으로 돌릴 것.
