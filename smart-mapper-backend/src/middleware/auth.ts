import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  if (apiKey && apiKey === process.env.API_KEY) {
    next();
    return;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (validateToken(token)) {
      next();
      return;
    }
  }

  logger.warn('Unauthorized access attempt', {
    ip: req.ip,
    path: req.path,
    method: req.method
  });

  res.status(401).json({
    success: false,
    error: 'Unauthorized'
  });
}

function validateToken(token: string): boolean {
  try {
    return token === process.env.JWT_SECRET;
  } catch {
    return false;
  }
}

export function wsAuthMiddleware(socket: any, next: (err?: Error) => void): void {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  if (token && (token === process.env.API_KEY || token === process.env.JWT_SECRET)) {
    next();
    return;
  }

  logger.warn('Unauthorized WebSocket connection attempt', {
    address: socket.handshake.address
  });

  next(new Error('Unauthorized'));
}
