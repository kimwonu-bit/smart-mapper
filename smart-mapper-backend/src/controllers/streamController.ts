import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface FrameData {
  data: string;
  frame_id: number;
}

export class StreamController {
  private viewers: Map<string, Socket> = new Map();
  private frameBuffer: FrameData[] = [];
  private readonly maxBufferSize: number;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fps: number = 0;

  constructor() {
    this.maxBufferSize = parseInt(process.env.CAMERA_BUFFER_SIZE || '10');
  }

  public addViewer(clientId: string, socket: Socket): void {
    this.viewers.set(clientId, socket);
    logger.info(`Viewer added: ${clientId}, Total viewers: ${this.viewers.size}`);

    if (this.frameBuffer.length > 0) {
      const latestFrame = this.frameBuffer[this.frameBuffer.length - 1];
      socket.emit('frame', latestFrame);
    }
  }

  public removeViewer(clientId: string): void {
    this.viewers.delete(clientId);
    logger.info(`Viewer removed: ${clientId}, Total viewers: ${this.viewers.size}`);
  }

  public broadcastFrame(frameData: FrameData): void {
    this.frameBuffer.push(frameData);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    this.viewers.forEach((socket, clientId) => {
      try {
        socket.emit('frame', {
          data: frameData.data,
          frameId: frameData.frame_id,
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error(`Failed to send frame to ${clientId}:`, error);
        this.viewers.delete(clientId);
      }
    });
  }

  public getStats(): { viewerCount: number; fps: number; bufferSize: number } {
    return {
      viewerCount: this.viewers.size,
      fps: this.fps,
      bufferSize: this.frameBuffer.length
    };
  }

  public getStreamUrl(): string {
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    return `ws://${host}:${port}/stream`;
  }
}
