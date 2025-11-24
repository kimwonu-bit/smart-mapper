# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

API 요청에는 다음 중 하나의 인증 방법을 사용합니다:

- **API Key**: `x-api-key` 헤더
- **Bearer Token**: `Authorization: Bearer <token>` 헤더

개발 환경에서는 인증이 비활성화됩니다.

---

## Maps API

### GET /maps

저장된 모든 지도 목록을 조회합니다.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | 페이지 번호 (기본: 1) |
| limit | number | 페이지당 항목 수 (기본: 10) |

**Response**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionId": "session_1234567890_client1",
      "name": "Map_2024-01-01T00:00:00.000Z",
      "width": 100,
      "height": 100,
      "resolution": 10,
      "origin": { "x": -500, "y": -500 },
      "metadata": {
        "duration": 300000,
        "updateCount": 1500,
        "coverage": 45.5
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### GET /maps/:id

특정 지도의 상세 정보를 조회합니다.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 지도 ID |

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "sessionId": "session_1234567890_client1",
    "name": "Map_2024-01-01T00:00:00.000Z",
    "gridData": [[0, 0, -1], [1, 0, 0], [-1, -1, 1]],
    "width": 100,
    "height": 100,
    "resolution": 10,
    "origin": { "x": -500, "y": -500 },
    "metadata": {
      "duration": 300000,
      "updateCount": 1500,
      "coverage": 45.5
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Grid Data Values**

- `-1`: 미탐색 영역
- `0`: 탐색된 빈 공간
- `1`: 장애물

---

### POST /maps/:id/export

지도를 이미지 파일로 내보냅니다.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | 지도 ID |

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | 이미지 형식 (png, svg) |

**Response**

이미지 바이너리 데이터 (Content-Type: image/png)

---

### GET /maps/current

현재 진행 중인 매핑 세션의 데이터를 조회합니다.

**Response**

```json
{
  "success": true,
  "data": {
    "grid": [[0, 0, -1], [1, 0, 0]],
    "width": 100,
    "height": 100,
    "resolution": 10,
    "origin": { "x": -500, "y": -500 }
  }
}
```

---

## Control API

### GET /status

로봇카의 현재 상태를 조회합니다.

**Response**

```json
{
  "success": true,
  "data": {
    "robot": {
      "connected": true,
      "commandQueue": 0,
      "lastHeartbeat": 1704067200000
    },
    "position": {
      "x": 150,
      "y": 200,
      "theta": 45
    },
    "stream": {
      "viewerCount": 2,
      "fps": 15,
      "bufferSize": 5
    }
  }
}
```

---

### POST /calibrate

센서 캘리브레이션을 수행합니다.

**Request Body**

```json
{
  "referenceDistance": 100,
  "measuredDistance": 105
}
```

**Response**

```json
{
  "success": true,
  "message": "Calibration started"
}
```

---

### POST /reset-position

로봇의 위치를 초기화합니다.

**Request Body**

```json
{
  "x": 0,
  "y": 0,
  "theta": 0
}
```

**Response**

```json
{
  "success": true,
  "message": "Position reset successfully"
}
```

---

### POST /emergency-stop

로봇을 긴급 정지시킵니다.

**Response**

```json
{
  "success": true,
  "message": "Emergency stop executed"
}
```

---

## Stream API

### GET /stream

카메라 스트림 URL을 조회합니다.

**Response**

```json
{
  "success": true,
  "data": {
    "url": "ws://localhost:3000/stream",
    "protocol": "websocket"
  }
}
```

---

## Error Responses

모든 API는 다음 형식의 에러 응답을 반환합니다:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 404 | 리소스 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 오류 |
