# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build TypeScript to dist/
npm run build

# Production server
npm start

# Run all tests with coverage
npm test

# Run single test file
npx jest tests/unit/sensorService.test.ts

# Run tests matching pattern
npx jest --testNamePattern="should process raw sensor data"

# Watch mode for tests
npm run test:watch

# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Docker development
docker-compose up -d
docker-compose --profile dev up -d  # includes Mongo Express on :8081
```

## Architecture Overview

This is a real-time backend for an ESP32-based autonomous mapping robot car. The system bridges web clients and the robot through bidirectional WebSocket communication.

### Core Data Flow

```
ESP32 Robot → [ESP32Service] → [SensorService] → [MapService] → MongoDB
                                      ↓
                              [WebSocket Broadcast] → Web Clients
```

Control commands flow in reverse: Web Client → WebSocket → ESP32Service → Robot

### Key Services (Singleton Pattern)

All services use `getInstance()` pattern:

- **ESP32Service** (`src/services/esp32Service.ts`): WebSocket connection to robot, command queuing, auto-reconnect, heartbeat monitoring
- **SensorService** (`src/services/sensorService.ts`): Median filtering, polar-to-cartesian conversion, position tracking
- **MapService** (`src/services/mapService.ts`): 2D grid map generation using ray tracing, session management, image export via Sharp

### WebSocket Event Handling

WebSocket setup is in `src/config/websocket.ts`. Key events:
- Client sends `control` → validates → converts to motor command → ESP32Service
- ESP32Service emits `sensorData` → processed → broadcast to all clients
- Map data broadcasts every 200ms when session active

### Control Command Conversion

Steering/throttle from client (-90 to 90, 0-100) converts to differential drive motor values (-255 to 255) in `convertToMotorCommand()`.

### Grid Map Values

- `-1`: Unexplored
- `0`: Free space (visited)
- `1`: Obstacle (occupied count > 3)

## Environment Configuration

Copy `.env.example` to `.env`. Key variables:
- `ESP32_HOST/PORT`: Robot WebSocket endpoint
- `MAP_GRID_SIZE`: Default 100x100 grid
- `MAP_CELL_SIZE`: 10cm per cell
- `CAMERA_BUFFER_SIZE`: Frame buffer limit

## Test Structure

Tests in `tests/unit/` use Jest with ts-jest. Mock MongoDB models when testing services. Coverage threshold is 70%.

## API Endpoints

REST API mounted at `/api` (see `src/routes/api.ts`). Health check at `/health`, Prometheus metrics at `/metrics`.

Authentication via `x-api-key` header or Bearer token. Disabled in development mode.
