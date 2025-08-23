import { Request, Response, NextFunction } from 'express';
import { verifyJWT, generateGuestToken } from '../utils/auth';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  guestToken?: string;
  isGuest?: boolean;
}

// Helper function to check if token is a guest token (UUID format)
const isGuestToken = (token: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
};

// Middleware to verify JWT token and extract user info
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Access token required', 401));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(createError('Invalid or expired token', 401));
  }
};

// Middleware to verify admin role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(createError('Admin access required', 403));
  }

  next();
};

// Middleware to verify user role (both admin and user allowed)
export const requireUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (!['admin', 'user'].includes(req.user.role)) {
    return next(createError('User access required', 403));
  }

  next();
};

// Optional authentication middleware (for endpoints that work both with and without auth)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyJWT(token);
      req.user = decoded;
    } catch (error) {
      // Continue without authentication if token is invalid
    }
  }
  
  next();
};

// Middleware for guest/user/admin access (handles guest tokens and authenticated users)
export const guestOrAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Check if it's a guest token (UUID format)
    if (isGuestToken(token)) {
      req.guestToken = token;
      req.isGuest = true;
      return next();
    }
    
    // Try to verify as JWT token
    try {
      const decoded = verifyJWT(token);
      req.user = decoded;
      return next();
    } catch (error) {
      // Token is invalid, continue as guest without token
    }
  }
  
  // No token provided or invalid token - continue as guest
  req.isGuest = true;
  next();
};

// Middleware that ensures a guest token exists (creates one if needed)
export const ensureGuestToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // If user is authenticated, skip guest token logic
  if (req.user) {
    return next();
  }
  
  // If no guest token provided, generate one and include in response
  if (!req.guestToken) {
    req.guestToken = generateGuestToken();
    // Set a custom header to inform client of the new guest token
    res.setHeader('X-Guest-Token', req.guestToken);
  }
  
  next();
};
