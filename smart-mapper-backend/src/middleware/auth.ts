import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
}

// Original auth middleware (API key or simple token)
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
    const decoded = verifyToken(token);
    if (decoded) {
      (req as any).userId = decoded.userId;
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

// JWT-specific auth middleware
export function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided'
    });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
    return;
  }

  (req as any).userId = decoded.userId;
  next();
}

// Verify JWT token
function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    logger.debug('Token verification failed:', error);
    return null;
  }
}

// WebSocket auth middleware
export function wsAuthMiddleware(socket: any, next: (err?: Error) => void): void {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  if (token) {
    // Check API key
    if (token === process.env.API_KEY) {
      next();
      return;
    }

    // Check JWT
    const decoded = verifyToken(token);
    if (decoded) {
      socket.userId = decoded.userId;
      next();
      return;
    }
  }

  logger.warn('Unauthorized WebSocket connection attempt', {
    address: socket.handshake.address
  });

  next(new Error('Unauthorized'));
}
