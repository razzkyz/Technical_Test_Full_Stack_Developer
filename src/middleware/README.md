# Authentication and Authorization Middleware

This directory contains middleware for JWT-based authentication and role-based authorization.

## Middleware Functions

### `authenticateRequest(authService: IAuthService)`

Factory function that creates Express middleware to validate JWT tokens.

**Behavior:**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Validates token using the provided `authService`
- Attaches decoded token payload to `req.user`
- Returns HTTP 401 if token is missing, invalid, or expired

**Usage:**
```typescript
import { authenticateRequest } from './middleware';
import { authService } from './services';

app.use('/api/*', authenticateRequest(authService));
```

### `requireRole(...roles: UserRole[])`

Factory function that creates Express middleware to enforce role-based access control.

**Behavior:**
- Checks if `req.user` exists (must be used after `authenticateRequest`)
- Verifies user's role is in the allowed roles list
- Returns HTTP 401 if user is not authenticated
- Returns HTTP 403 if user lacks required permissions

**Usage:**
```typescript
import { authenticateRequest, requireRole } from './middleware';
import { UserRole } from './types';

// Admin-only route
app.post('/api/customers', 
  authenticateRequest(authService),
  requireRole(UserRole.ADMIN),
  customerController.create
);

// Route accessible by both ADMIN and PRODUCTION
app.get('/api/production/running-orders',
  authenticateRequest(authService),
  requireRole(UserRole.PRODUCTION, UserRole.ADMIN),
  productionController.getRunningOrders
);

// Public route (no authentication required)
app.post('/api/auth/login', authController.login);
```

## Type Extensions

### `AuthRequest`

Extended Express `Request` interface that includes user information:

```typescript
interface AuthRequest extends Request {
  user?: TokenPayload;
}
```

Use this type in your controllers to access authenticated user information:

```typescript
import { AuthRequest } from './middleware';

export function myController(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  // ...
}
```

## Error Responses

### 401 Unauthorized

Returned when:
- Authorization header is missing
- Token format is invalid (not "Bearer <token>")
- Token is invalid or expired
- User is not authenticated

```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden

Returned when:
- User is authenticated but lacks required permissions

```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "details": {
    "required": ["ADMIN"],
    "current": "PRODUCTION"
  }
}
```

## Role-Based Access Control

### Admin Role (`UserRole.ADMIN`)
- Full access to all system features
- Can manage customers, products, and orders
- Can view dashboard metrics
- Can update production progress

### Production Role (`UserRole.PRODUCTION`)
- Limited access to production-related features
- **Can access:**
  - View running orders
  - Update production progress
  - View production status
- **Cannot access:**
  - Customer management
  - Product management
  - Order management (create/edit/delete)
  - Dashboard metrics

## Requirements Validation

This middleware validates the following requirements:

- **1.3**: Missing/invalid tokens return HTTP 401 Unauthorized
- **1.4**: Admin users have full system access
- **1.5**: Production users cannot access customer management
- **1.6**: Production users cannot access product management
- **1.7**: Production users can view running orders
- **1.8**: Production users can update production progress
- **1.9**: Production users can view production status
- **1.10**: Unauthenticated users are denied access to protected features
- **9.7**: Valid authentication credentials are processed correctly
- **9.8**: Missing credentials return HTTP 401
- **9.9**: Insufficient permissions return HTTP 403

## Testing

Run middleware tests:
```bash
npm test -- auth.middleware.test.ts
```

All 25 tests validate the middleware behavior against the requirements.
