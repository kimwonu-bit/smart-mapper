# SMART-MAPPER Backend

ESP32 기반 자율 지도 제작 로봇카를 위한 실시간 백엔드 시스템입니다.

## 주요 기능

- **실시간 제어**: WebSocket을 통한 로봇카 원격 조종
- **지도 생성**: 초음파 센서 데이터를 2D 그리드 맵으로 변환
- **카메라 스트리밍**: ESP32 CAM에서 실시간 영상 수신 및 전송
- **데이터 저장**: MongoDB를 통한 지도 이력 관리

## 기술 스택

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Database**: MongoDB
- **Cache**: Redis
- **Monitoring**: Prometheus metrics

## 시작하기

### 사전 요구사항

- Node.js 18.0.0 이상
- MongoDB 7.0 이상
- Redis 7.0 이상
- Docker & Docker Compose (선택사항)

### 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 설정 수정
```

### 개발 모드 실행

```bash
# 개발 서버 실행
npm run dev

# 또는 Docker Compose 사용
docker-compose up -d
docker-compose --profile dev up -d  # Mongo Express 포함
```

### 프로덕션 빌드

```bash
# TypeScript 컴파일
npm run build

# 프로덕션 실행
npm start
```

## API 문서

### REST API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/maps` | 저장된 지도 목록 |
| GET | `/api/maps/:id` | 특정 지도 조회 |
| POST | `/api/maps/:id/export` | 지도 이미지 내보내기 |
| GET | `/api/status` | 로봇카 상태 |
| POST | `/api/calibrate` | 센서 캘리브레이션 |
| GET | `/api/stream` | 스트림 URL |
| POST | `/api/emergency-stop` | 긴급 정지 |

### WebSocket 이벤트

#### 클라이언트 → 서버

```javascript
// 제어 명령
socket.emit('control', {
  steering: -90 to 90,
  throttle: 0 to 100,
  brake: boolean
});

// 매핑 시작/중지
socket.emit('startMapping');
socket.emit('stopMapping');

// 스트림 요청
socket.emit('requestStream');
socket.emit('stopStream');
```

#### 서버 → 클라이언트

```javascript
// 센서 데이터
socket.on('sensor', {
  ultrasonic: { distance, angle },
  position: { x, y },
  timestamp
});

// 지도 데이터
socket.on('map', {
  gridData: number[][],
  timestamp
});

// 로봇 상태
socket.on('status', {
  battery: number,
  connected: boolean,
  speed: number
});

// 카메라 프레임
socket.on('frame', {
  data: string,  // base64 encoded JPEG
  frameId: number,
  timestamp: number
});
```

## 프로젝트 구조

```
smart-mapper-backend/
├── src/
│   ├── server.ts              # 메인 엔트리포인트
│   ├── config/                # 설정 파일
│   ├── controllers/           # 요청 핸들러
│   ├── services/              # 비즈니스 로직
│   ├── models/                # 데이터 모델
│   ├── routes/                # API 라우트
│   ├── utils/                 # 유틸리티
│   └── middleware/            # 미들웨어
├── tests/                     # 테스트 파일
├── docs/                      # 문서
└── docker-compose.yml         # Docker 설정
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PORT` | 서버 포트 | 3000 |
| `MONGODB_URI` | MongoDB 연결 URI | mongodb://localhost:27017/smart-mapper |
| `REDIS_HOST` | Redis 호스트 | localhost |
| `ESP32_HOST` | ESP32 IP 주소 | 192.168.1.100 |
| `ESP32_PORT` | ESP32 WebSocket 포트 | 8080 |
| `JWT_SECRET` | JWT 시크릿 키 | - |
| `CORS_ORIGIN` | 허용된 CORS 오리진 | * |

## 테스트

```bash
# 단위 테스트 실행
npm test

# 커버리지 포함
npm run test -- --coverage

# 워치 모드
npm run test:watch
```

## 모니터링

Prometheus 형식의 메트릭이 `/metrics` 엔드포인트에서 제공됩니다:

- `http_requests_total` - HTTP 요청 수
- `http_request_duration_seconds` - 요청 처리 시간
- `websocket_connections` - WebSocket 연결 수
- `sensor_data_received_total` - 센서 데이터 수신 수
- `map_updates_total` - 지도 업데이트 수

## ESP32 통신 프로토콜

### 서버 → ESP32

```json
{
  "cmd": "move",
  "data": {
    "motor_left": -255 to 255,
    "motor_right": -255 to 255,
    "servo_angle": 0 to 180
  }
}
```

### ESP32 → 서버

```json
{
  "type": "sensor",
  "data": {
    "ultrasonic": 25.5,
    "servo_angle": 90,
    "battery": 3.7,
    "timestamp": 1234567890
  }
}
```

## 배포

### Docker 배포

```bash
# 이미지 빌드
docker build -t smart-mapper-backend .

# 실행
docker run -p 3000:3000 --env-file .env smart-mapper-backend
```

### Docker Compose 배포

```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

## 라이선스

MIT License
