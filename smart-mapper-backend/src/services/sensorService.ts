import { logger } from '../utils/logger';

interface RawSensorData {
  ultrasonic: number;
  servo_angle: number;
  battery?: number;
  timestamp: number;
}

interface ProcessedSensorData {
  distance: number;
  angle: number;
  position: { x: number; y: number };
  cartesian: { x: number; y: number };
  battery: number;
  timestamp: number;
}

interface Position {
  x: number;
  y: number;
  theta: number;
}

export class SensorService {
  private static instance: SensorService;
  private currentPosition: Position = { x: 0, y: 0, theta: 0 };
  private calibrationOffset: number = 0;
  private filterBuffer: number[] = [];
  private readonly bufferSize = 5;

  private constructor() {}

  public static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }

  public processSensorData(data: RawSensorData): ProcessedSensorData {
    const filteredDistance = this.applyMedianFilter(data.ultrasonic);
    const calibratedDistance = filteredDistance - this.calibrationOffset;
    const angleRad = ((data.servo_angle - 90) * Math.PI) / 180;

    const cartesian = this.polarToCartesian(calibratedDistance, angleRad);
    const worldCoords = this.transformToWorld(cartesian);

    return {
      distance: calibratedDistance,
      angle: data.servo_angle,
      position: {
        x: Math.round(this.currentPosition.x),
        y: Math.round(this.currentPosition.y)
      },
      cartesian: worldCoords,
      battery: data.battery || 0,
      timestamp: data.timestamp
    };
  }

  private applyMedianFilter(value: number): number {
    this.filterBuffer.push(value);
    if (this.filterBuffer.length > this.bufferSize) {
      this.filterBuffer.shift();
    }

    const sorted = [...this.filterBuffer].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private polarToCartesian(distance: number, angle: number): { x: number; y: number } {
    return {
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle)
    };
  }

  private transformToWorld(local: { x: number; y: number }): { x: number; y: number } {
    const cos = Math.cos(this.currentPosition.theta);
    const sin = Math.sin(this.currentPosition.theta);

    return {
      x: Math.round(this.currentPosition.x + local.x * cos - local.y * sin),
      y: Math.round(this.currentPosition.y + local.x * sin + local.y * cos)
    };
  }

  public updatePosition(deltaX: number, deltaY: number, deltaTheta: number): void {
    this.currentPosition.x += deltaX;
    this.currentPosition.y += deltaY;
    this.currentPosition.theta += deltaTheta;
    this.currentPosition.theta = this.normalizeAngle(this.currentPosition.theta);
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  public setPosition(x: number, y: number, theta: number): void {
    this.currentPosition = { x, y, theta };
    logger.info('Position set:', this.currentPosition);
  }

  public getPosition(): Position {
    return { ...this.currentPosition };
  }

  public calibrate(referenceDistance: number, measuredDistance: number): void {
    this.calibrationOffset = measuredDistance - referenceDistance;
    logger.info(`Sensor calibrated with offset: ${this.calibrationOffset}`);
  }

  public reset(): void {
    this.currentPosition = { x: 0, y: 0, theta: 0 };
    this.filterBuffer = [];
    this.calibrationOffset = 0;
    logger.info('Sensor service reset');
  }
}
