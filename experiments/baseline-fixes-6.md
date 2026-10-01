# baseline-fixes-6 (T01K)

제품 브랜치 feat/baseline-fixes-6(main 1c99f60 위). F-053(중간)과 F-054(낮음) ①②③④⑤⑥ 을 처리했다.
서브에이전트 2개(opus 1·haiku 1), 승격 없음. 하위 작업이 TASKS 의 T01.33·T01.34 둘뿐이고 소유 경로가 ws_bytes / heap·ref_images 로 갈려 10개에 못 미쳤다. 한 파일을 여럿이 고치면 충돌만 늘어 경로 분리를 우선했다.

## 하위 작업

| 하위 | 항목 | 모델 | 결과 |
|---|---|---|---|
| T01.33 | F-053, F-054 ①②⑤ | opus | final 은 `f.level >= s.rhi` 일 때만 켠다(추월된 낮은 수준만 무시). [L2 5, L1 3, L2 5 final] → ids [1]·segments [5], [L2 5, rL2 5, L2 5 final] → [1]·[5], [L2 5 final, rL2 5, L2 5] 완결 유지, [L1 5, L0 3 final] → 미완 유지. 같은 프레임 집합의 6개 순열을 모두 완결로 고정(바이트 합은 순서에 따라 달라 순서별로 박음). `:147` 을 `!isStale` 로 되돌리면 3개 테스트 실패(작업자 직접 확인). 의도된 순서 의존 하나(`[L1 5, L0 3 final]` 미완 vs `[L0 3 final, L1 5]` 완결)도 테스트로 고정 |
| 〃 | F-054 ① | 〃 | 지표 의미를 method 에 밝히는 쪽으로 처리: levels_received·segment_levels_mask 는 "받은 수준 전부(교체된 낮은 수준 포함)". [L0 10, L2 30] → [[1,3]]·마스크 5, [L2 30, L0 10] → [[3]]·마스크 4 |
| 〃 | F-054 ② | 〃 | 요약 필드 final_resend_only 추가. final 필드가 resend 에만 있으면 경고가 "final 필드가 resend 에만 있음", 아예 없을 때만 "final 필드 없음" |
| 〃 | F-054 ⑤ | 〃 | [rL2 9, L0 4] 단언에 segment_levels [[3]]·resend_bytes 0 추가 |
| T01.34 | F-054 ③ | haiku | statm 을 `trim().split(/\s+/)`, `/^\d+$/` 검사. "100  5"·"100 5\n" 변형 테스트 2건 |
| 〃 | F-054 ④ | 〃 | basisNote 주석 정정, 10속성 PLY → '와 다름' 테스트 |
| (작업자) | F-054 ⑥ | — | 병합 전 base(1c99f60)에서 `npm test` 10회: 매회 290 통과·0 실패·12 건너뜀. 실패 재현 안 됨 |

## 판단·한계

- F-053: 끊긴 같은 최고 수준 final 을 완결로 보는 쪽으로 정했다. 바이트 쪽 stale 판정은 그대로라 stale_levels·stale_bytes 는 변하지 않는다.
- F-054 ⑥: 실패는 재현되지 않았다. 원인 미특정이므로 감독이 닫을지 판단해 달라.
- renderer_basis 이탈 없음, 새 의존성 없음, README 변경 없음.
- 실제 skylens develop 체크아웃 대조는 이번에도 하지 못했다(벤치는 합성 입력 중심).

## 검증 (작업자 직접)

- 병합 뒤 `npm test`: 310건 중 298 통과·0 실패·12 건너뜀(실제 트리·대형 RSS).
- 위 세 입력을 ws_bytes summarize 로 직접 실행해 [[1],[5]]·[[1],[5]]·[[],[]] 확인.
- 제품 트리의 F-번호 grep 0건, 생성 도구 문구 grep 0건.
