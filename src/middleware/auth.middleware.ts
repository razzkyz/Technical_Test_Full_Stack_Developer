import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/IAuthService';
import { TokenPayload, UserRole } from '../types';

/**
 * Extend Express Request to include user information
 */
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Authentication middleware factory
 * Creates middleware that validates JWT tokens and attaches user info to request
 * 
 * @param authService - Authentication service instance
 * @returns Express middleware function
 * 
 * **Validates: Requirements 1.3, 9.7, 9.8**
 * 
 * Behavior:
 * - Extracts JWT token from Authorization header (Bearer token)
 * - Validates token using authService
 * - Attaches decoded token payload to req.user
 * - Returns HTTP 401 if token is missing or invalid
 */
export function authenticateRequest(authService: IAuthService) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Check for Bearer token format
      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          error: 'Invalid authorization format. Use: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT'
        });
        return;
      }

      // Extract token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        res.status(401).json({ 
          error: 'Authentication token required',
          code: 'TOKEN_REQUIRED'
        });
        return;
      }

      // Validate token
      try {
        const payload = await authService.validateToken(token);
        req.user = payload;
        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        res.status(401).json({ 
          error: message,
          code: 'INVALID_TOKEN'
        });
        return;
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(401).json({ 
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
      return;
    }
  };
}

/**
 * Authorization middleware factory
 * Creates middleware that checks if authenticated user has required role(s)
 * 
 * @param roles - One or more roles that are allowed to access the route
 * @returns Express middleware function
 * 
 * **Validates: Requirements 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 9.8, 9.9**
 * 
 * Behavior:
 * - Checks if req.user exists (must be used after authenticateRequest)
 * - Verifies user's role is in the allowed roles list
 * - Returns HTTP 401 if user is not authenticated
 * - Returns HTTP 403 if user lacks required permissions
 * 
 * Usage:
 * ```typescript
 * app.post('/api/customers', 
 *   authenticateRequest(authService),
 *   requireRole(UserRole.ADMIN),
 *   customerController.create
 * );
 * 
 * app.get('/api/production/running-orders',
 *   authenticateRequest(authService),
 *   requireRole(UserRole.PRODUCTION, UserRole.ADMIN),
 *   productionController.getRunningOrders
 * );
 * ```
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Check if user has required role
    const userRole = req.user.role as UserRole;
    
    if (!roles.includes(userRole)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        details: {
          required: roles,
          current: userRole
        }
      });
      return;
    }

    // User has required role, proceed
    next();
  };
}
