import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const wsConnectionsGauge = new client.Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections'
});

const mapUpdateCounter = new client.Counter({
  name: 'map_updates_total',
  help: 'Total number of map updates'
});

const sensorDataCounter = new client.Counter({
  name: 'sensor_data_received_total',
  help: 'Total number of sensor data points received'
});

const frameCounter = new client.Counter({
  name: 'camera_frames_total',
  help: 'Total number of camera frames processed'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(wsConnectionsGauge);
register.registerMetric(mapUpdateCounter);
register.registerMetric(sensorDataCounter);
register.registerMetric(frameCounter);

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });

  next();
}

export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
}

export const metrics = {
  wsConnectionsGauge,
  mapUpdateCounter,
  sensorDataCounter,
  frameCounter,
  incrementMapUpdates: () => mapUpdateCounter.inc(),
  incrementSensorData: () => sensorDataCounter.inc(),
  incrementFrames: () => frameCounter.inc(),
  setWsConnections: (count: number) => wsConnectionsGauge.set(count)
};
