# T16.18 실제 소켓 30명 30초 부하 측정

## 실행 명령
```bash
cd /home/user/skylens-renderer && node bench/load/socket/run.mjs /home/user/scratch_out 30
```

## 측정 정보
- 실행 일시: 2026-10-06 19:57 UTC
- 제품 저장소 커밋: 0272cf26b2a596d475c174535f786a696a61cb0a
- 클라이언트 수: 30명
- 실행 시간: 30초

## 관찰된 값 (1회 실행)
- **first_frame p95**: 0 ms (connect 이벤트 기준, S5 정의 아님)
- **CPU**: 최대 3.99%, 평균 대부분 0% (첫 초에 2.01%, 9초에 3.99%)
- **RSS**: 59.31 MiB(첫)에서 57.68 MiB(마지막)로 변화

## 주의
- 값은 재실행할 때마다 달라질 수 있음
- 이는 1회 실행값이며, 통계적 변동을 대표하지 않음
- loopback 네트워크이므로 실제 WAN/LAN 조건과 다름

## 결과 파일
- `socket30.json`: 클라이언트별 상세 측정값 및 지표
- `socket30.server.json`: 서버 프로세스 샘플 (1초 간격, CPU/RSS)
