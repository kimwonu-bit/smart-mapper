# System Architecture

## 개요

SMART-MAPPER 백엔드는 ESP32 기반 로봇카와 웹 클라이언트 간의 실시간 양방향 통신을 담당하는 서버 시스템입니다.

## 아키텍처 다이어그램

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Web Client │────▶│   Backend   │◀────│    ESP32    │
│  (Browser)  │◀────│   Server    │────▶│  Robot Car  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       │              ┌────┴────┐              │
       │              │         │              │
       │         ┌────▼───┐ ┌───▼────┐         │
       │         │MongoDB │ │ Redis  │         │
       │         └────────┘ └────────┘         │
       │                                       │
       └───────────WebSocket/HTTP──────────────┘
                     Socket.IO
```

## 컴포넌트 설명

### 1. Server Core (`server.ts`)

메인 서버 엔트리포인트로 다음을 초기화합니다:
- Express HTTP 서버
- Socket.IO WebSocket 서버
- 데이터베이스 연결
- 미들웨어 체인

### 2. Services

#### ESP32Service
- WebSocket을 통한 ESP32 연결 관리
- 명령 큐잉 및 전송
- 재연결 로직 및 하트비트

#### SensorService
- 원시 센서 데이터 처리
- 중앙값 필터링
- 좌표 변환 (극좌표 → 직교좌표)
- 위치 추적

#### MapService
- 2D 그리드 맵 생성 및 관리
- 레이 트레이싱을 통한 빈 공간 마킹
- 장애물 감지 및 맵 업데이트
- 이미지 내보내기

#### StreamController
- 카메라 프레임 버퍼링
- 다중 클라이언트 브로드캐스팅
- FPS 계산 및 통계

### 3. Data Flow

```
[ESP32 Sensor]
      │
      ▼
[SensorService] ─── 필터링/변환 ───▶ [MapService]
      │                                   │
      ▼                                   ▼
[WebSocket Broadcast]            [MongoDB Storage]
      │
      ▼
[Web Clients]
```

### 4. Control Flow

```
[Web Client]
      │
   control event
      │
      ▼
[WebSocket Handler]
      │
   validate
      │
      ▼
[convertToMotorCommand]
      │
      ▼
[ESP32Service.sendCommand]
      │
      ▼
[ESP32 Robot]
```

## 데이터 모델

### Map Schema

```typescript
{
  sessionId: string,      // 세션 식별자
  name: string,           // 지도 이름
  gridData: number[][],   // 2D 그리드 데이터
  width: number,          // 그리드 너비
  height: number,         // 그리드 높이
  resolution: number,     // 셀 크기 (cm)
  origin: { x, y },       // 원점 좌표
  metadata: {
    duration: number,     // 매핑 소요 시간
    updateCount: number,  // 업데이트 횟수
    coverage: number      // 탐색률 (%)
  }
}
```

## 통신 프로토콜

### WebSocket Events

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client → Server | `control` | 조종 명령 |
| Client → Server | `startMapping` | 매핑 시작 |
| Client → Server | `stopMapping` | 매핑 종료 |
| Server → Client | `sensor` | 센서 데이터 |
| Server → Client | `map` | 지도 업데이트 |
| Server → Client | `frame` | 카메라 프레임 |
| Server → Client | `status` | 상태 정보 |

### ESP32 Protocol

| Direction | Message Type | Purpose |
|-----------|--------------|---------|
| Server → ESP32 | `move` | 모터 제어 |
| Server → ESP32 | `calibrate` | 센서 보정 |
| ESP32 → Server | `sensor` | 센서 데이터 |
| ESP32 → Server | `frame` | 카메라 프레임 |

## 확장성 고려사항

### 다중 로봇 지원

현재 구조는 단일 ESP32를 가정하지만, 다음과 같이 확장 가능:

```typescript
// ESP32ServiceManager
class ESP32ServiceManager {
  private robots: Map<string, ESP32Service>;

  registerRobot(robotId: string): ESP32Service;
  getRobot(robotId: string): ESP32Service;
}
```

### 마이크로서비스 분리

필요시 다음과 같이 서비스 분리 가능:

- **Control Service**: 제어 명령 처리
- **Map Service**: 지도 생성 및 저장
- **Stream Service**: 비디오 스트리밍
- **Gateway**: API 게이트웨이

## 성능 최적화

### 지연시간 최소화

- WebSocket 유지 연결
- 메시지 직렬화 최적화
- 명령 우선순위 큐

### 메모리 관리

- 프레임 버퍼 크기 제한
- 그리드 데이터 압축
- 가비지 컬렉션 최적화

### 네트워크 최적화

- 데이터 압축 (gzip)
- 배치 전송
- 적응형 프레임레이트

## 장애 복구

### ESP32 연결 끊김

1. 자동 재연결 시도
2. 명령 큐 유지
3. 클라이언트에 상태 알림

### 서버 재시작

1. 진행 중인 세션 복구
2. Redis에서 상태 복원
3. Graceful shutdown

## 보안

### 인증

- API Key 검증
- JWT 토큰 (선택사항)
- WebSocket 연결 인증

### 입력 검증

- Joi 스키마 검증
- 명령 범위 제한
- Rate limiting

### 데이터 보호

- HTTPS (프로덕션)
- 환경변수 암호화
- XSS/Injection 방지
