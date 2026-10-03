# T08.F20·T08.F22 일부 — 컬링 검토 잔여(F-128~F-130, F-132, F-133, 낮음 일부)

제품 브랜치 feat/cull-review-fixes. 모델별 서브에이전트: opus 2·sonnet 8·haiku 3(승격 없음). 첫 투입은 격리 작업 트리가 연구 저장소로 만들어져 전부 막혔고, 작업자가 제품 저장소 작업 트리 13개를 직접 만들어 같은 지시로 재투입했다.

## F-132 (결정 0025)
- 구조 오류(객체 아님·width/height 비수·K 필드 누락·R/t 가 일반 배열 아님·길이 틀림·문자열 수)는 모든 서버 단계(frustum·backface·occlusion·distance·predict·priority·combine)와 클라이언트가 같은 'cull:' 오류로 던진다. 값 퇴화는 빈 결과. degenerate/index.mjs 에 assertCameraShape·degenerateCamera.
- 시험: camera_shape_unified.test.mjs 12개 진입점 × 구조 오류 7종 던짐 + 값 퇴화 3종 빈 결과(120건). 이전 시험 중 구조 오류를 빈 결과로 고정한 것은 던짐으로 정정(distance·client·backface·predict·occlusion).
- 의도한 동작 변화: Float32Array R·t, 문자열 수는 오류.

## F-128
- ① 법선 원뿔 캐시를 모듈 최상위 WeakMap 으로. 같은 계층에 cullAndSelectDefault 2회 → 원뿔 계산 1회(Proxy 로 법선 읽기 횟수 단언). 캐시 제거 변이 → 실패.
- ② 마스크 0 리프 건너뛰기는 하지 않음: 마스크로 제거된 리프도 거친 깊이 버퍼에서 가림막으로 작용하므로 건너뛰면 남은 리프의 순위가 바뀐다(건너뛰기 변이 → priority_mask_skip 시험 실패). 마스크별 순서 = 전체 마스크 순서를 해당 리프로 거른 것임을 시험으로 고정.
- ③ 벤치: 뒷면·가림 제거가 모두 > 0 인 장면(flat_boxes 1/30, pointSizeM 0.06), cold/warm 분리, 단계 팩토리 주입으로 각 단계가 {pointSizeM} 을 받았는지 단언, 모듈 직접 호출 결과와 비교. 한계: 가짜 시계는 busy-wait 에 여전히 1.00 이므로 실시간 1000 ms 상한만 잡는다(작은 지연은 결정적으로 못 잡음).

## F-130
- backface·occlusion 의 딱 맞는 상자 캐시에 levels[0].positions·leafStart·leafCount 를 함께 저장해 불일치 시 다시 계산(옵션 a). stale_box_cache.test.mjs: Object.assign 으로 배열 교체 뒤 새 객체 결과와 차이 0. 수정 되돌림 변이 → 실패.

## F-129
- ① predict 상한·음성·고속 수직·작은 걸음 직선 시험(변이 3종 검출). ② 네 가장자리 점 원판 여유(래스터 기준 ≥1 픽셀) 시험, 지름 ×0.75·×0.9 변이 검출(−r+0.5 는 래스터에서 동점이라 −r+0.75 사용). ③ 지문 31개 항목 중 25개가 변이로 검출, 6개는 동치 변이(객체 참조 4·levels.length·lv.level — 다른 지문 항목이나 오류 문구에만 영향)라 구분 불가. ④ andMasks 두 번째 마스크 검사. ⑤ occluderPoints 정확값으로 continue→break 변이 검출. ⑥ 한 점 장면 cullAndSelect pointSizeM 있음 → 그려짐, 없음 → NOT_DRAWN.

## F-133
- ① 구조 오류 던짐 목록, 예측 시점만 퇴화하는 입력(v=1e10, horizon 1e300)으로 predict :112 검사 변이 검출. ② distance cameraBad 에 해상도 부여·전부 0 단언·주석 정정, 일반 배열 R. ③ backfaceCull 직접 호출 {} → 0, {pointSizeM:0.05} → >0, 폴백 변이 검출. ④ 격자 틈 합성 장면(시드 1~12, 반경 ×(1∓0.004)): ×1.01 변이가 occlusion·backface 에서 12/12 시드 모두 실패. ⑤ backface 퇴화 시험에 뒷면 후보가 생기는 배치.
- 미처리: (아래 '남은 일' 참조)

## F-131·F-134 처리분
F-131 ①②③④⑦(계약 문구), ⑤ 는 코드가 아닌 계약 문구를 '그려질 리프 수(chunks 길이)' 로 정정(combine_splat 시험이 kept = 그려진 수를 이미 고정). F-134 ①②③④⑦⑧, ⑤ 일부.
F-131⑧ 미처리: 구조 논증으로 더 높은 하한을 세울 근거를 못 찾음(occlusion 장면 시험 하한 유지).

## 검증
npm test(통합 브랜치): 1908 중 1896 통과·0 실패·12 건너뜀. 실제 skylens 체크아웃 입력은 [local].
