# T08.F·F2·F3 — LOD 검토 잔여(F-096~F-100)

## 한 일(하위 작업 12개: opus 2·sonnet 7·haiku 2, 승격 없음)
1회차 병렬 시도는 서브에이전트 격리 작업 트리가 연구 저장소로 잡혀 전부 실패했다(결과물 없음). 제품 저장소 worktree 를 직접 만들어 같은 지시로 다시 띄워 통과했다.
| 하위 | 모델 | 항목 | 결과 |
|---|---|---|---|
| A | opus | F-097 ①③ | 공용 규칙 server/lod/select/screen_error.mjs(d_eff=d·cMin², f=max(fx,fy)). 모서리 리프 칸 변 최대 0.292 px(화각 90°)·0.268 px(960×540), 옛 규칙 2.314·0.537 px. 변이 3종(cos² 제거·cos 1회·fx 단독) 실패 확인 |
| B | opus | F-097 ②, F-100 ⑧ | 칸 키 (리프, 격자 칸). 모든 단계·칸의 leafOf 하나, 단계 0 법선 단위 길이. 뿌리 정렬안은 inside_100 SSIM 0.9476 으로 폐기 |
| C | sonnet | F-096 ① | 공식 시점 8곳은 단계 0 뿐('해당 없음' 명시), 거친 시점 ×3·×4·×6 추가, terrain 시드 1~4 최소 SSIM 0.9524·0.9578·0.9542·0.9524(≥0.95), 단계 0 고정 변이 음성 |
| D | sonnet | F-096 ② | emptyRatioPreserved 에 filled·noFill, 한 곳만 메운 가짜 LOD 음성, 실제 세 경로 filled 0 |
| E | sonnet | F-096 ③ | 판별 예산 5개(100000·80000·45000·20000·10000) 시점별 비교, 효율식 반전 변이 5개 모두 실패 |
| F(작업자 위임) | sonnet | F-098 ①②④⑤ | 결정 0020 보완 |
| G | sonnet | F-098 ⑥⑤ | §3-6 1위 camF_0054·§3-7 순서 단언, θ₀ 변이 실패, fx 754.32·d 45.28 도 재현 |
| H | sonnet | F-099 ① | progressive 카메라 검사 'lod:' |
| I | sonnet | F-099 ③ | materialize·applyChunks 색인 복사, 바이트 동일 시험 |
| J | haiku | F-099 ②, F-100 ③⑥⑦⑩ | psnr 사례 4 복원·음성, ssim 1e-9, fov 상한, target≠원점 리터럴 |
| K | haiku | F-100 ①②④⑤ | terrain bounds·드론 지터·상수식 단언 삭제·엄격 부등호 |
| L | sonnet | F-100 ⑨ | 시야 판정 공용 view_check.mjs(z>0 로 통일), budget 카메라 오류 'lod:', maxDistanceM 문구 |
통합 후 직접 `npm test`: 1122 중 1110 통과·0 실패·12 건너뜀. (부하 중 한 번 bench/baseline heap PSS 시험이 실패했으나 단독 실행 통과 — 부하성 간헐.)

## 미달·남은 것
- F-099 ③ 목표 '184만 점 materialize < 100 ms': 중앙값 116.6 ms(5회 100.3~138.5, 별도 10회 91~148 ms). 이전 구현은 이 머신에서 약 830 ms 라 약 8배 빨라졌으나 목표선에 걸침. 남은 비용은 입력 위치의 무작위 접근. **미달로 기록**, 기준은 시험에 넣지 않음.
- bench/lod measureSegmentBytes 정수 키로 바꿨으나 cli 전체 약 31 s(그중 16.6 s)로 옛 3.1 s 키 구간과 직접 비교는 안 쟀다.
- contracts/lod 머리 주석 "칸마다 대표점 1개" 는 이제 "리프×칸 조각마다 1개"(README에는 반영, 계약 문구는 감독 확인).
- F-097 ① 보장은 합성 장면 모서리 리프 기준. 실제 skylens 점군에서의 조각 수 증가는 미확인([local]).
- 실제 skylens 체크아웃: 이 환경에 없음(해당 없음, [local]).
- renderer_basis 이탈: 없음(§3-5·§3-1 이탈은 결정 0020 에 기록, 0021 은 단계 선택 보정).
- 결정 0021 제안 작성.
