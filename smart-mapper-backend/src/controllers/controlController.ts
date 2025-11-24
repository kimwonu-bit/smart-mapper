import { Request, Response, NextFunction } from 'express';
import { ESP32Service } from '../services/esp32Service';
import { SensorService } from '../services/sensorService';
import { StreamController } from './streamController';
import { logger } from '../utils/logger';

export class ControlController {
  private esp32Service: ESP32Service;
  private sensorService: SensorService;
  private streamController: StreamController;

  constructor() {
    this.esp32Service = ESP32Service.getInstance();
    this.sensorService = SensorService.getInstance();
    this.streamController = new StreamController();
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const esp32Status = this.esp32Service.getStatus();
      const position = this.sensorService.getPosition();
      const streamStats = this.streamController.getStats();

      res.json({
        success: true,
        data: {
          robot: {
            connected: esp32Status.connected,
            commandQueue: esp32Status.queueSize,
            lastHeartbeat: esp32Status.lastHeartbeat
          },
          position: {
            x: position.x,
            y: position.y,
            theta: (position.theta * 180) / Math.PI
          },
          stream: streamStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async calibrate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { referenceDistance, measuredDistance } = req.body;

      if (referenceDistance !== undefined && measuredDistance !== undefined) {
        this.sensorService.calibrate(referenceDistance, measuredDistance);
      }

      await this.esp32Service.sendCommand('calibrate', {
        reference: referenceDistance,
        measured: measuredDistance
      });

      logger.info('Calibration command sent');
      res.json({
        success: true,
        message: 'Calibration started'
      });
    } catch (error) {
      next(error);
    }
  }

  public async getStreamUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = this.streamController.getStreamUrl();
      res.json({
        success: true,
        data: {
          url,
          protocol: 'websocket'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async resetPosition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { x = 0, y = 0, theta = 0 } = req.body;
      this.sensorService.setPosition(x, y, (theta * Math.PI) / 180);

      logger.info(`Position reset to: (${x}, ${y}, ${theta})`);
      res.json({
        success: true,
        message: 'Position reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public async emergencyStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.esp32Service.sendCommand('emergency_stop', {});

      logger.warn('Emergency stop triggered');
      res.json({
        success: true,
        message: 'Emergency stop executed'
      });
    } catch (error) {
      next(error);
    }
  }
}
