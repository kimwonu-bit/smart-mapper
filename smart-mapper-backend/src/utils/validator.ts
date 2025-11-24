import Joi from 'joi';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const controlCommandSchema = Joi.object({
  steering: Joi.number().min(-90).max(90).required(),
  throttle: Joi.number().min(0).max(100).required(),
  brake: Joi.boolean().required()
});

export function validateControlCommand(command: unknown): ValidationResult {
  const { error } = controlCommandSchema.validate(command);
  if (error) {
    return { valid: false, error: error.message };
  }
  return { valid: true };
}

const calibrationSchema = Joi.object({
  referenceDistance: Joi.number().min(0).max(1000),
  measuredDistance: Joi.number().min(0).max(1000)
});

export function validateCalibration(data: unknown): ValidationResult {
  const { error } = calibrationSchema.validate(data);
  if (error) {
    return { valid: false, error: error.message };
  }
  return { valid: true };
}

const positionSchema = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required(),
  theta: Joi.number().min(-180).max(180)
});

export function validatePosition(data: unknown): ValidationResult {
  const { error } = positionSchema.validate(data);
  if (error) {
    return { valid: false, error: error.message };
  }
  return { valid: true };
}

export function validateObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export function sanitizeString(str: string): string {
  return str.replace(/[<>\"\'&]/g, '');
}
