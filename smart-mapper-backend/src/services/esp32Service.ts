import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { logger } from '../utils/logger';

interface ESP32Command {
  cmd: string;
  data: Record<string, unknown>;
}

interface ESP32Message {
  type: string;
  data: Record<string, unknown>;
}

export class ESP32Service extends EventEmitter {
  private static instance: ESP32Service;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private commandQueue: ESP32Command[] = [];
  private lastHeartbeat: number = 0;

  private constructor() {
    super();
  }

  public static getInstance(): ESP32Service {
    if (!ESP32Service.instance) {
      ESP32Service.instance = new ESP32Service();
    }
    return ESP32Service.instance;
  }

  public async connect(): Promise<void> {
    const host = process.env.ESP32_HOST || '192.168.1.100';
    const port = process.env.ESP32_PORT || '8080';
    const url = `ws://${host}:${port}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          this.connected = true;
          this.lastHeartbeat = Date.now();
          logger.info(`Connected to ESP32 at ${url}`);
          this.emit('connected');
          this.startHeartbeat();
          this.processQueue();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', () => {
          this.handleDisconnect();
        });

        this.ws.on('error', (error) => {
          logger.error('ESP32 WebSocket error:', error);
          if (!this.connected) {
            reject(error);
          }
        });

        setTimeout(() => {
          if (!this.connected) {
            logger.warn('ESP32 connection timeout, will retry...');
            this.scheduleReconnect();
            resolve();
          }
        }, 5000);
      } catch (error) {
        logger.error('Failed to create ESP32 connection:', error);
        this.scheduleReconnect();
        resolve();
      }
    });
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: ESP32Message = JSON.parse(data.toString());
      this.lastHeartbeat = Date.now();

      switch (message.type) {
        case 'sensor':
          this.emit('sensorData', message.data);
          break;
        case 'frame':
          this.emit('frame', message.data);
          break;
        case 'status':
          this.emit('status', message.data);
          break;
        case 'ack':
          logger.debug('Command acknowledged:', message.data);
          break;
        case 'error':
          logger.error('ESP32 error:', message.data);
          this.emit('esp32Error', message.data);
          break;
        case 'calibration':
          this.emit('calibrationComplete', message.data);
          break;
        case 'heartbeat':
          break;
        default:
          logger.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      logger.error('Failed to parse ESP32 message:', error);
    }
  }

  private handleDisconnect(): void {
    this.connected = false;
    this.stopHeartbeat();
    logger.warn('ESP32 disconnected');
    this.emit('disconnected');
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const interval = parseInt(process.env.ESP32_RECONNECT_INTERVAL || '5000');
    this.reconnectTimer = setTimeout(() => {
      logger.info('Attempting to reconnect to ESP32...');
      this.connect().catch((error) => {
        logger.error('Reconnection failed:', error);
      });
    }, interval);
  }

  private startHeartbeat(): void {
    const interval = parseInt(process.env.ESP32_HEARTBEAT_INTERVAL || '3000');
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.sendCommand('heartbeat', {}).catch(() => {});

        const timeout = interval * 3;
        if (Date.now() - this.lastHeartbeat > timeout) {
          logger.warn('ESP32 heartbeat timeout');
          this.ws?.close();
        }
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public async sendCommand(cmd: string, data: Record<string, unknown>): Promise<void> {
    const command: ESP32Command = { cmd, data };

    if (!this.connected || !this.ws) {
      this.commandQueue.push(command);
      logger.debug('Command queued (ESP32 not connected):', cmd);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws!.send(JSON.stringify(command), (error) => {
          if (error) {
            logger.error('Failed to send command:', error);
            this.commandQueue.push(command);
            reject(error);
          } else {
            logger.debug('Command sent:', cmd);
            resolve();
          }
        });
      } catch (error) {
        logger.error('Send command error:', error);
        this.commandQueue.push(command);
        reject(error);
      }
    });
  }

  private async processQueue(): Promise<void> {
    while (this.commandQueue.length > 0 && this.connected) {
      const command = this.commandQueue.shift();
      if (command) {
        try {
          await this.sendCommand(command.cmd, command.data);
        } catch (error) {
          logger.error('Failed to process queued command:', error);
        }
      }
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    logger.info('ESP32 service disconnected');
  }

  public getStatus(): { connected: boolean; queueSize: number; lastHeartbeat: number } {
    return {
      connected: this.connected,
      queueSize: this.commandQueue.length,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}
