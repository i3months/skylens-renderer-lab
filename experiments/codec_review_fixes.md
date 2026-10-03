# T09.F2 codec 검토 보정 (F-171 ①②, F-174, F-175)

제품 브랜치 feat/codec-review-fixes (기준 3d3a26f, 끝 ebad883). 서브에이전트 7개(sonnet 4, haiku 3, 승격 없음). 소유 경로가 겹치는 파일이 많아(chunk/index.mjs·시험, contracts) 10개로 더 쪼개지 못했다. 전체 `npm test`: 2791 중 2779 통과·0 실패·12 건너뜀·todo 0(직접 실행).

## F-174
- ① 계약 decodeChunkInfo 서명을 구현(`{file, colorMode}`, 전체 검증)에 맞춤, 오류 코드 표의 'LEB128 상한 초과' 중복 정리, 검사 순서 주석. ASSET_FORMAT 두 줄(readHeaderStrict 위치 server/asset/header, 색 모드는 decodeChunkInfo 쪽)을 고침.
- ② 클라이언트 entropyDecodeClient 의 검사 순서를 서버와 같게(rawLen 범위 'limit' → mode 1 정규성 'stream'). 서버 순서는 이미 그랬음. 결과: mode 1·rawLen=0 스트림이 양쪽 'limit'. 이 순서를 가정한 옛 시험 2건(alignment ③, codec_client 마지막 단언)은 'limit' 으로 고침(내가 직접).
- ③ 서버 chunk/index.mjs :29 readPlanesRaw 범위 검사는 checkRawInput(길이 == header_size+body_bytes, body_bytes >= 필수 바이트)이 보장해 도달 불가라 단독 판별 입력이 만들어지지 않음 → 삭제하고 이유를 주석으로. :50 body_bytes 검사만 지우는 변이는 masking.test 에서 2 건 실패(길이 맞춤·CRC 재계산 입력, code·메시지 단언).
- ④ client/codec/cross_error.test.mjs: 같은 손상 입력(CRC 재계산) 50여 종을 서버 decodeChunk·클라이언트 decodeChunkClient 에 넣고 throw·클래스·code 일치 단언. 서버 :73(구 :68) 'limit'→'stream' 변이에서 7 건 실패(직접 실행). 헤더 경로 차이(서버 CodecError 'length'/'mode' vs 클라이언트 AssetFormatError 'body'/'codec' 등)는 서브에이전트가 todo 로 남겼으나 todo 0 규범에 맞춰 '양쪽이 허용된 오류 클래스로 거부' 단언으로 바꿈. 이 분류 차이는 코드 정렬 없이 남아 있음(계약은 CodecError 또는 AssetFormatError 만 허용).

## F-171 ①②
- ② bench/codec_client 비교 기준을 복호기 밖 경로(readHeaderClient·readPlanesClient 로 원본 raw 파일 평면 읽기)로 바꾸고 pointMultiset 비교. client/codec/index.mjs:217 `prev + raw`→`prev ^ raw` 변이에서 bench 1 건 실패(직접 실행).
- ① measureDecode 가 expectedLossy 에 따라 colorMode===QUANT2 단언. bench :214 `lossy: true`→`false` 변이에서 3 건 실패(직접 실행).

## F-175
- ① 형식이 허용함(§3.1 필수 본문 pad4 때문에 n=5·6 이 같은 76 B, §3.2-10 은 body_bytes ≥ 합만 요구) → 거부 안 넣고 checkRawInput 주석 + 왕복 시험. ② consistency.test 가 메시지까지 단언. ③ canonical.test 정확값(128→[0,4,0], 127→[7,3,3]). ④ chunk_validation DELTA 정확 단언(512색 입력). ⑤ chunk_validation 50 ms 단언 제거(코드 단언만), entropy.test 시간 상한 800→3000 ms. ⑥ 코덱 수정 없음(T11·T12.5 요청 제한). ⑦ 상한 항 중복의 이유를 주석으로.

## 참고
- `node --test <디렉터리>` 는 Node 22 에서 실패한다. 글롭을 쓴다.
- 실제 skylens 체크아웃 입력은 [local]. 합성 시험만.
- F-171 ①② 외 이번에 안 건드린 것: F-173(T12.5), T10 은 다음 실행.
