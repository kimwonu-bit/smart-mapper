import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { ESP32Service } from '../services/esp32Service';
import { MapService } from '../services/mapService';
import { SensorService } from '../services/sensorService';
import { StreamController } from '../controllers/streamController';
import { validateControlCommand } from '../utils/validator';

interface ControlCommand {
  steering: number;
  throttle: number;
  brake: boolean;
}

export function setupWebSocket(io: SocketIOServer, esp32Service: ESP32Service): void {
  const mapService = MapService.getInstance();
  const sensorService = SensorService.getInstance();
  const streamController = new StreamController();

  const connectedClients = new Map<string, Socket>();

  io.on('connection', (socket: Socket) => {
    const clientId = socket.id;
    connectedClients.set(clientId, socket);

    logger.info(`Client connected: ${clientId}, Total clients: ${connectedClients.size}`);

    socket.emit('connected', {
      clientId,
      timestamp: Date.now(),
      status: esp32Service.isConnected() ? 'robot_online' : 'robot_offline'
    });

    socket.on('control', async (command: ControlCommand) => {
      try {
        const validation = validateControlCommand(command);
        if (!validation.valid) {
          socket.emit('error', { message: validation.error });
          return;
        }

        const motorCommand = convertToMotorCommand(command);
        await esp32Service.sendCommand('move', motorCommand);

        logger.debug(`Control command from ${clientId}:`, command);
      } catch (error) {
        logger.error('Control command error:', error);
        socket.emit('error', { message: 'Failed to send control command' });
      }
    });

    socket.on('startMapping', async () => {
      try {
        await mapService.startNewSession(clientId);
        socket.emit('mappingStarted', { sessionId: mapService.getCurrentSessionId() });
        logger.info(`Mapping started by ${clientId}`);
      } catch (error) {
        logger.error('Start mapping error:', error);
        socket.emit('error', { message: 'Failed to start mapping' });
      }
    });

    socket.on('stopMapping', async () => {
      try {
        const map = await mapService.endSession();
        socket.emit('mappingStopped', { mapId: map?._id });
        logger.info(`Mapping stopped by ${clientId}`);
      } catch (error) {
        logger.error('Stop mapping error:', error);
        socket.emit('error', { message: 'Failed to stop mapping' });
      }
    });

    socket.on('requestStream', () => {
      streamController.addViewer(clientId, socket);
      logger.info(`Stream requested by ${clientId}`);
    });

    socket.on('stopStream', () => {
      streamController.removeViewer(clientId);
      logger.info(`Stream stopped by ${clientId}`);
    });

    socket.on('calibrate', async () => {
      try {
        await esp32Service.sendCommand('calibrate', {});
        socket.emit('calibrationStarted');
        logger.info(`Calibration started by ${clientId}`);
      } catch (error) {
        logger.error('Calibration error:', error);
        socket.emit('error', { message: 'Failed to start calibration' });
      }
    });

    socket.on('disconnect', (reason) => {
      connectedClients.delete(clientId);
      streamController.removeViewer(clientId);
      logger.info(`Client disconnected: ${clientId}, Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${clientId}:`, error);
    });
  });

  esp32Service.on('sensorData', (data) => {
    const processedData = sensorService.processSensorData(data);
    mapService.updateMap(processedData);

    io.emit('sensor', {
      ultrasonic: {
        distance: processedData.distance,
        angle: processedData.angle
      },
      position: processedData.position,
      timestamp: Date.now()
    });
  });

  esp32Service.on('frame', (frameData) => {
    streamController.broadcastFrame(frameData);
  });

  esp32Service.on('status', (status) => {
    io.emit('status', {
      battery: status.battery,
      connected: true,
      speed: status.speed || 0
    });
  });

  esp32Service.on('connected', () => {
    io.emit('robotStatus', { connected: true });
    logger.info('ESP32 connected, notifying all clients');
  });

  esp32Service.on('disconnected', () => {
    io.emit('robotStatus', { connected: false });
    logger.warn('ESP32 disconnected, notifying all clients');
  });

  setInterval(() => {
    const mapData = mapService.getCurrentMapData();
    if (mapData) {
      io.emit('map', {
        gridData: mapData.grid,
        timestamp: new Date().toISOString()
      });
    }
  }, 200);
}

function convertToMotorCommand(control: ControlCommand): {
  motor_left: number;
  motor_right: number;
  servo_angle: number;
} {
  const { steering, throttle, brake } = control;

  if (brake) {
    return { motor_left: 0, motor_right: 0, servo_angle: 90 };
  }

  const baseSpeed = (throttle / 100) * 255;
  const steeringFactor = steering / 90;

  let motorLeft = baseSpeed;
  let motorRight = baseSpeed;

  if (steeringFactor > 0) {
    motorRight = baseSpeed * (1 - Math.abs(steeringFactor) * 0.5);
  } else if (steeringFactor < 0) {
    motorLeft = baseSpeed * (1 - Math.abs(steeringFactor) * 0.5);
  }

  const servoAngle = 90 + (steering / 90) * 45;

  return {
    motor_left: Math.round(motorLeft),
    motor_right: Math.round(motorRight),
    servo_angle: Math.round(servoAngle)
  };
}
