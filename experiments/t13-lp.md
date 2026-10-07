# T13.LP — 원본 대조 정밀도 후속 (F-611·F-612·F-610)

- 제품 브랜치 feat/t13-lp, 원본 skylens 0122bd4(공개 저장소를 클라우드에서 clone 해 직접 대조).
- 서브에이전트 5개: sonnet 3(parity·controlview·original_shapes)·haiku 2(blue_noise 주석·seed_table 상한). 승격 0. 소유 파일이 5묶음뿐이라 10개 미만(겹침 방지).

## F-611
1. parity: 원본 top 은 설정 사다리 길이(기본 3칸, config.ts:97). 표는 4칸 가정으로 머리말 정정, MISMATCHES 에 'final 판정' 추가(top 4 와 top 3 에서 수준 2 의 final·alpha 가 갈림).
2. streaming 행: streamSource.ts:23-36,85,99 인용, 원본 상수(LOAD 34·EVICT 74.8·동시 2·주기 900 ms)와 우리 값(maxDistM 1500·maxInflight 16·타이머 없음)이 달라 estimated 로 바꾸고 시험 deepEqual 도 수정.
3. origin 단언을 ['checked','estimated'] 포함으로 — 'chekced' 변이에서 실패 확인.
4. original_shapes: 구간 1·2 final=false 단언 — state/index.mjs:52 를 level >= 2 로 바꾼 사본에서 2건 실패 확인.
5. 서버 노출 묶음 이름에 origin alphaForLevel 사용을 드러냄.

## F-612
머리말 갱신, distributor.ts:134-143·README.md:161-190 인용 정정, 슬랩 접힘·float32 는 NOT_MODELED 로 기록, 상한 단언은 2^30 이상 차별 값으로(상한을 넣은 사본에서 실패 확인), 재연결 인용에 statusViewer.ts:L524-L525, 빈 suite 제거, todo 2건은 실행 가능한 불일치 고정으로(하트비트 MISSING 반복은 todo), 줄 번호 비자동 검증 주석·input 행 pathFollower.ts:130-144·manualAltitudeSpeed 5.0.

## F-610
blue_noise_thinner.test.mjs 구간 주석에 부동소수 단서·변이 기준 한정 문구, seed_table_args 상한 120→240 s.
F-610③(병합 커밋 이름)은 이번 PR 에서 영어 제목 커밋으로 병합해 해소.
