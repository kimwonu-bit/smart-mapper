import { SensorService } from '../../src/services/sensorService';

describe('SensorService', () => {
  let sensorService: SensorService;

  beforeEach(() => {
    sensorService = SensorService.getInstance();
    sensorService.reset();
  });

  describe('processSensorData', () => {
    it('should process raw sensor data correctly', () => {
      const rawData = {
        ultrasonic: 100,
        servo_angle: 90,
        battery: 3.7,
        timestamp: Date.now()
      };

      const result = sensorService.processSensorData(rawData);

      expect(result.distance).toBeDefined();
      expect(result.angle).toBe(90);
      expect(result.position).toBeDefined();
      expect(result.cartesian).toBeDefined();
      expect(result.battery).toBe(3.7);
    });

    it('should apply median filter to distance readings', () => {
      const readings = [100, 105, 102, 108, 103];
      let lastResult: any;

      readings.forEach(reading => {
        lastResult = sensorService.processSensorData({
          ultrasonic: reading,
          servo_angle: 90,
          timestamp: Date.now()
        });
      });

      expect(lastResult.distance).toBeGreaterThanOrEqual(100);
      expect(lastResult.distance).toBeLessThanOrEqual(108);
    });

    it('should convert polar to cartesian coordinates', () => {
      const rawData = {
        ultrasonic: 100,
        servo_angle: 0,
        timestamp: Date.now()
      };

      const result = sensorService.processSensorData(rawData);

      expect(result.cartesian.x).toBeCloseTo(100, 0);
      expect(result.cartesian.y).toBeCloseTo(0, 0);
    });
  });

  describe('position management', () => {
    it('should update position correctly', () => {
      sensorService.setPosition(0, 0, 0);
      sensorService.updatePosition(10, 5, Math.PI / 4);

      const position = sensorService.getPosition();

      expect(position.x).toBe(10);
      expect(position.y).toBe(5);
      expect(position.theta).toBeCloseTo(Math.PI / 4);
    });

    it('should normalize angle after update', () => {
      sensorService.setPosition(0, 0, 0);
      sensorService.updatePosition(0, 0, Math.PI * 3);

      const position = sensorService.getPosition();

      expect(position.theta).toBeGreaterThanOrEqual(-Math.PI);
      expect(position.theta).toBeLessThanOrEqual(Math.PI);
    });

    it('should reset position to origin', () => {
      sensorService.setPosition(100, 200, Math.PI);
      sensorService.reset();

      const position = sensorService.getPosition();

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
      expect(position.theta).toBe(0);
    });
  });

  describe('calibration', () => {
    it('should apply calibration offset', () => {
      sensorService.calibrate(100, 105);

      const rawData = {
        ultrasonic: 110,
        servo_angle: 90,
        timestamp: Date.now()
      };

      const result = sensorService.processSensorData(rawData);

      expect(result.distance).toBe(105);
    });
  });
});
