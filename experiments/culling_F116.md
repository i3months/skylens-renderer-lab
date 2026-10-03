# F-116 절두체 판정의 점 원판 여유 — 결정 0023 에 합칠 메모

## 무엇을 바꿨나
- 래스터(server/raster_ref/zbuffer)는 점을 반경 r = fx·sizeM/(2z) px 원판으로 그리고 u+r<0·v+r<0·u−r>W·v−r>H 일 때만 건너뛴다(위·아래 반경도 fx 로 잰다).
- z>0 에서 양변에 z 를 곱하면 좌·우·위·아래 판정이 `fx·x + cx·z + m ≥ 0`, `fx·x + (cx−W)·z − m ≤ 0`, `fy·y + cy·z + m ≥ 0`, `fy·y + (cy−H)·z − m ≤ 0` (m = fx·sizeM/2) 로 바뀐다. X_c 의 1차식이라 상자 8 꼭짓점 판정이 그대로 정확한 보수 판정이다. 리프 최소 깊이에서 r_max 를 쓰거나 상자를 sizeM/2 부풀리는 근사가 필요 없고, 그 근사들보다 덜 남긴다(더 정확하다).
- `frustumCull(hierarchy, camera, {pointSizeM?})`, `clientFrustumCull(leafBoxes, camera, {pointSizeM?})`. pointSizeM 이 없으면 원판 크기를 모르므로 좌·우·위·아래로는 아무것도 버리지 않는다(앞 z>0 만). pointSizeM = 0 은 기존 원판 중심 규칙과 같다.

## boxMayBeVisible 을 바꿀지: 바꾸지 않고 같은 파일에 컬링용 변형을 둔다
- `server/lod/select/view_check.mjs` 에 `boxMayBeVisibleSplat(camera, mn, mx, pointSizeM)` 를 추가했다. 기존 `boxMayBeVisible(camera, mn, mx)` 는 같은 내부 함수를 m = 0 으로 부르는 것으로, 동작이 그대로다.
- 이유 1: LOD 의 selectLevels·selectWithBudget·progressiveChunks 는 서명에 pointSizeM 이 없다(thresholdPx 만). 공용 함수의 기본값을 '원판 크기 모름 = 좌·우·위·아래 제거 없음' 으로 바꾸면 LOD 선택이 화면 밖 리프를 모두 그리게 되어 점 수·예산 결과와 LOD 쪽 구운 시험 값이 한꺼번에 바뀐다. 이는 LOD 소유자의 결정이다.
- 이유 2: 규칙(식)은 한 파일·한 내부 함수에 남으므로 F-100 ⑨ 의 '경계 규칙 한 곳' 원칙은 지켜진다. LOD 가 옮겨 올 때는 호출만 `boxMayBeVisibleSplat(..., pointSizeM)` 으로 바꾸면 된다.
- 남은 위험(후속 작업 필요): LOD 선택도 같은 가장자리 문제를 가진다. combine 의 cullAndSelect 는 selectLevels 결과를 쓰므로, 절두체 마스크가 1 이어도 selectLevels 가 원판 중심 규칙으로 NOT_DRAWN 을 주면 결합 결과에서 가장자리 리프가 여전히 빠진다. predict(predictiveMask)도 boxMayBeVisible 을 직접 써서 같은 문제가 있다. 둘 다 pointSizeM 을 받아 boxMayBeVisibleSplat 으로 옮겨야 F-116 이 파이프라인 전체에서 닫힌다.

## 확인(구운 값, 사후 문턱 없음)
- 반례 960×540, K=(754.32, 753.85, 480, 270), R=I, t=0, 깊이 1 m·u=−1, sizeM 0.05 (r = 18.858 px): 래스터 524 픽셀, 서버·클라이언트 마스크 1. 원판 여유 0 이면 0. 반경 바로 바깥(u = −r−0.5)은 래스터 0 픽셀·마스크 0.
- 가장자리 바깥 0~r px 장면(리프 1500, 꼭 맞는 상자, 20% 미끼) 시드 11/12/13: 보이는 리프 318/291/333, 거짓 제거 0(서버·클라이언트), 남김 1218/1211/1194. 원판 여유를 지운 변이(pointSizeM 0, 그리고 소스에서 여유 항 삭제)의 거짓 제거 107/98/127 → 시험 실패.
- 회전 카메라(y 축 0.4 rad, t ≠ 0): 보이는 리프 300, 거짓 제거 0, 변이 97.
- 참고: buildHierarchy 의 octree 칸 상자는 점보다 커서(단일 점이면 1 m 정육면체) 반례가 상자 단위로는 가려진다. 감독 재현처럼 꼭 맞는 상자에서 문제가 드러나므로 시험은 꼭 맞는 AABB 리프로 했다.
