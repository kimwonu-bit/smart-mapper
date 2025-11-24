import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { setupWebSocket } from './config/websocket';
import { connectRedis } from './config/redis';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { ESP32Service } from './services/esp32Service';
import { metricsMiddleware, metricsEndpoint } from './utils/metrics';

dotenv.config();

class SmartMapperServer {
  private app: Application;
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private esp32Service: ESP32Service;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '20000')
    });
    this.esp32Service = ESP32Service.getInstance();
  }

  private setupMiddleware(): void {
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
    this.app.use(metricsMiddleware);
    this.app.use(rateLimiter);
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    this.app.get('/metrics', metricsEndpoint);
    this.app.use('/api', apiRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await connectDatabase();
      logger.info('Database connected successfully');

      await connectRedis();
      logger.info('Redis connected successfully');

      this.setupMiddleware();
      this.setupRoutes();

      setupWebSocket(this.io, this.esp32Service);
      logger.info('WebSocket server initialized');

      await this.esp32Service.connect();
      logger.info('ESP32 connection established');

      const port = parseInt(process.env.PORT || '3000');
      const host = process.env.HOST || '0.0.0.0';

      this.httpServer.listen(port, host, () => {
        logger.info(`Server running on http://${host}:${port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      this.httpServer.close(() => {
        logger.info('HTTP server closed');
      });

      this.io.close(() => {
        logger.info('WebSocket server closed');
      });

      await this.esp32Service.disconnect();
      logger.info('ESP32 connection closed');

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });
  }
}

const server = new SmartMapperServer();
server.start();

export default server;
