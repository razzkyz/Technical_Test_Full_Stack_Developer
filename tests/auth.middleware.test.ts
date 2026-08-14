import { Response, NextFunction } from 'express';
import { authenticateRequest, requireRole, AuthRequest } from '../src/middleware/auth.middleware';
import { IAuthService } from '../src/services/IAuthService';
import { TokenPayload, UserRole } from '../src/types';

/**
 * Test suite for authentication and authorization middleware
 * 
 * **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 9.7, 9.8, 9.9**
 */
describe('Authentication and Authorization Middleware', () => {
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock auth service
    mockAuthService = {
      login: jest.fn(),
      validateToken: jest.fn(),
      hashPassword: jest.fn(),
      comparePassword: jest.fn()
    };

    // Create mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockResponse = {
      status: statusMock,
      json: jsonMock
    };

    // Create mock next function
    nextFunction = jest.fn();

    // Reset request for each test
    mockRequest = {
      headers: {}
    };
  });

  describe('authenticateRequest middleware', () => {
    describe('**Requirement 1.3: Missing token handling**', () => {
      it('should return 401 when Authorization header is missing', async () => {
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should return 401 when Authorization header is empty', async () => {
        mockRequest.headers = { authorization: '' };
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 1.3: Invalid token format**', () => {
      it('should return 401 when Authorization header does not start with Bearer', async () => {
        mockRequest.headers = { authorization: 'InvalidFormat token123' };
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Invalid authorization format. Use: Bearer <token>',
          code: 'INVALID_AUTH_FORMAT'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should return 401 when Bearer token is empty', async () => {
        mockRequest.headers = { authorization: 'Bearer ' };
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Authentication token required',
          code: 'TOKEN_REQUIRED'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 1.3: Invalid token validation**', () => {
      it('should return 401 when token validation fails', async () => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };
        mockAuthService.validateToken.mockRejectedValue(new Error('Invalid token'));
        
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(mockAuthService.validateToken).toHaveBeenCalledWith('invalid-token');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should return 401 when token is expired', async () => {
        mockRequest.headers = { authorization: 'Bearer expired-token' };
        mockAuthService.validateToken.mockRejectedValue(new Error('Token expired'));
        
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Token expired',
          code: 'INVALID_TOKEN'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 9.7: Valid token authentication**', () => {
      it('should attach user to request and call next() with valid token', async () => {
        const validPayload: TokenPayload = {
          userId: 1,
          username: 'admin',
          role: UserRole.ADMIN
        };

        mockRequest.headers = { authorization: 'Bearer valid-token' };
        mockAuthService.validateToken.mockResolvedValue(validPayload);
        
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-token');
        expect(mockRequest.user).toEqual(validPayload);
        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should handle different user roles correctly', async () => {
        const productionPayload: TokenPayload = {
          userId: 2,
          username: 'production_user',
          role: UserRole.PRODUCTION
        };

        mockRequest.headers = { authorization: 'Bearer production-token' };
        mockAuthService.validateToken.mockResolvedValue(productionPayload);
        
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(mockRequest.user).toEqual(productionPayload);
        expect(nextFunction).toHaveBeenCalled();
      });
    });

    describe('Error handling', () => {
      it('should handle unexpected errors gracefully', async () => {
        mockRequest.headers = { authorization: 'Bearer token' };
        mockAuthService.validateToken.mockRejectedValue(new Error('Unexpected error'));
        
        const middleware = authenticateRequest(mockAuthService);
        
        await middleware(
          mockRequest as AuthRequest, 
          mockResponse as Response, 
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });
  });

  describe('requireRole middleware', () => {
    beforeEach(() => {
      // Setup authenticated request by default
      mockRequest.user = {
        userId: 1,
        username: 'testuser',
        role: UserRole.ADMIN
      };
    });

    describe('**Requirement 1.10: Unauthenticated access**', () => {
      it('should return 401 when user is not authenticated', () => {
        delete mockRequest.user; // Remove user
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 1.3, 1.4: Admin role access**', () => {
      it('should allow access when user has ADMIN role', () => {
        mockRequest.user!.role = UserRole.ADMIN;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should allow admin access to routes requiring ADMIN or PRODUCTION', () => {
        mockRequest.user!.role = UserRole.ADMIN;
        
        const middleware = requireRole(UserRole.ADMIN, UserRole.PRODUCTION);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 1.4, 1.5, 1.6: Production user restrictions - Admin-only features**', () => {
      it('should deny PRODUCTION user access to customer management', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          details: {
            required: [UserRole.ADMIN],
            current: UserRole.PRODUCTION
          }
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should deny PRODUCTION user access to product management', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should deny PRODUCTION user access to order management', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 1.7, 1.8, 1.9: Production user allowed features**', () => {
      it('should allow PRODUCTION user to view running orders', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.PRODUCTION, UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should allow PRODUCTION user to update production progress', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.PRODUCTION, UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should allow PRODUCTION user to view production status', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.PRODUCTION, UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });
    });

    describe('**Requirement 9.8, 9.9: HTTP status codes**', () => {
      it('should return 401 for missing authentication', () => {
        delete mockRequest.user;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(401);
      });

      it('should return 403 for insufficient permissions', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(403);
      });

      it('should provide detailed error information for forbidden access', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          details: expect.objectContaining({
            required: [UserRole.ADMIN],
            current: UserRole.PRODUCTION
          })
        }));
      });
    });

    describe('Multiple role scenarios', () => {
      it('should allow access when user has one of multiple required roles', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN, UserRole.PRODUCTION);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
      });

      it('should deny access when user does not have any of the required roles', () => {
        mockRequest.user!.role = UserRole.PRODUCTION;
        
        const middleware = requireRole(UserRole.ADMIN);
        middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });
  });

  describe('Integration: authenticateRequest + requireRole', () => {
    it('should properly chain authentication and authorization', async () => {
      const validPayload: TokenPayload = {
        userId: 1,
        username: 'admin',
        role: UserRole.ADMIN
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockAuthService.validateToken.mockResolvedValue(validPayload);
      
      // First middleware: authenticate
      const authMiddleware = authenticateRequest(mockAuthService);
      await authMiddleware(
        mockRequest as AuthRequest, 
        mockResponse as Response, 
        nextFunction
      );

      expect(mockRequest.user).toEqual(validPayload);
      expect(nextFunction).toHaveBeenCalledTimes(1);

      // Reset next function
      nextFunction = jest.fn();

      // Second middleware: authorize
      const roleMiddleware = requireRole(UserRole.ADMIN);
      roleMiddleware(
        mockRequest as AuthRequest, 
        mockResponse as Response, 
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should block unauthorized user even after successful authentication', async () => {
      const validPayload: TokenPayload = {
        userId: 2,
        username: 'production',
        role: UserRole.PRODUCTION
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockAuthService.validateToken.mockResolvedValue(validPayload);
      
      // First middleware: authenticate
      const authMiddleware = authenticateRequest(mockAuthService);
      await authMiddleware(
        mockRequest as AuthRequest, 
        mockResponse as Response, 
        nextFunction
      );

      expect(mockRequest.user).toEqual(validPayload);
      expect(nextFunction).toHaveBeenCalled();

      // Reset mocks
      nextFunction = jest.fn();
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockResponse.status = statusMock;

      // Second middleware: authorize (require ADMIN only)
      const roleMiddleware = requireRole(UserRole.ADMIN);
      roleMiddleware(
        mockRequest as AuthRequest, 
        mockResponse as Response, 
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
