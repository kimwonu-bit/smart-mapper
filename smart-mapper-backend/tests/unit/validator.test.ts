import {
  validateControlCommand,
  validateCalibration,
  validatePosition,
  validateObjectId,
  sanitizeString
} from '../../src/utils/validator';

describe('Validator Utils', () => {
  describe('validateControlCommand', () => {
    it('should validate correct control command', () => {
      const command = {
        steering: 45,
        throttle: 50,
        brake: false
      };

      const result = validateControlCommand(command);

      expect(result.valid).toBe(true);
    });

    it('should reject steering out of range', () => {
      const command = {
        steering: 100,
        throttle: 50,
        brake: false
      };

      const result = validateControlCommand(command);

      expect(result.valid).toBe(false);
    });

    it('should reject negative throttle', () => {
      const command = {
        steering: 0,
        throttle: -10,
        brake: false
      };

      const result = validateControlCommand(command);

      expect(result.valid).toBe(false);
    });

    it('should reject missing fields', () => {
      const command = {
        steering: 0
      };

      const result = validateControlCommand(command);

      expect(result.valid).toBe(false);
    });
  });

  describe('validateCalibration', () => {
    it('should validate correct calibration data', () => {
      const data = {
        referenceDistance: 100,
        measuredDistance: 105
      };

      const result = validateCalibration(data);

      expect(result.valid).toBe(true);
    });

    it('should reject negative distances', () => {
      const data = {
        referenceDistance: -10,
        measuredDistance: 105
      };

      const result = validateCalibration(data);

      expect(result.valid).toBe(false);
    });
  });

  describe('validatePosition', () => {
    it('should validate correct position', () => {
      const data = { x: 100, y: 200, theta: 45 };

      const result = validatePosition(data);

      expect(result.valid).toBe(true);
    });

    it('should reject theta out of range', () => {
      const data = { x: 100, y: 200, theta: 200 };

      const result = validatePosition(data);

      expect(result.valid).toBe(false);
    });
  });

  describe('validateObjectId', () => {
    it('should validate correct MongoDB ObjectId', () => {
      const id = '507f1f77bcf86cd799439011';

      expect(validateObjectId(id)).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      expect(validateObjectId('invalid')).toBe(false);
      expect(validateObjectId('123')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);

      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
    });

    it('should preserve safe characters', () => {
      const input = 'Hello World 123';
      const result = sanitizeString(input);

      expect(result).toBe(input);
    });
  });
});
