import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/services/AuthService';
import { UserRole } from '../src/types';

describe('AuthService', () => {
  let prisma: PrismaClient;
  let authService: AuthService;
  const TEST_JWT_SECRET = 'test-secret-key';

  beforeAll(() => {
    prisma = new PrismaClient();
    authService = new AuthService(prisma, TEST_JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashed = await authService.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
      expect(hashed).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashed = await authService.hashPassword(password);
      const result = await authService.comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashed = await authService.hashPassword(password);
      const result = await authService.comparePassword(wrongPassword, hashed);

      expect(result).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const password = 'testPassword123';
      const hashed = await authService.hashPassword(password);
      const result = await authService.comparePassword('', hashed);

      expect(result).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token successfully', async () => {
      // First, create a test user and login to get a token
      const testUser = {
        username: `testuser_${Date.now()}`,
        password: 'password123'
      };

      const hashedPassword = await authService.hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          username: testUser.username,
          passwordHash: hashedPassword,
          role: UserRole.ADMIN
        }
      });

      try {
        const loginResult = await authService.login(testUser.username, testUser.password);
        expect(loginResult.success).toBe(true);
        expect(loginResult.token).toBeDefined();

        // Now validate the token
        const payload = await authService.validateToken(loginResult.token!);
        expect(payload.userId).toBe(user.id);
        expect(payload.username).toBe(testUser.username);
        expect(payload.role).toBe(UserRole.ADMIN);
        expect(payload.iat).toBeDefined();
        expect(payload.exp).toBeDefined();
      } finally {
        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
      }
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      await expect(authService.validateToken(invalidToken))
        .rejects.toThrow('Invalid token');
    });

    it('should throw error for malformed token', async () => {
      const malformedToken = 'not-even-a-jwt';
      
      await expect(authService.validateToken(malformedToken))
        .rejects.toThrow();
    });

    it('should throw error for expired token', async () => {
      const testUser = {
        username: `testuser_expired_${Date.now()}`,
        password: 'password123'
      };

      const hashedPassword = await authService.hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          username: testUser.username,
          passwordHash: hashedPassword,
          role: UserRole.PRODUCTION
        }
      });

      try {
        // Create an expired token manually using jwt
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          TEST_JWT_SECRET,
          { expiresIn: '0s' } // Already expired
        );

        // Wait a moment to ensure expiration
        await new Promise(resolve => setTimeout(resolve, 100));

        await expect(authService.validateToken(expiredToken))
          .rejects.toThrow('Token expired');
      } finally {
        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
      }
    });
  });

  describe('login', () => {
    const testUser = {
      username: `testuser_login_${Date.now()}`,
      password: 'password123'
    };
    let userId: number;

    beforeAll(async () => {
      const hashedPassword = await authService.hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          username: testUser.username,
          passwordHash: hashedPassword,
          role: UserRole.ADMIN
        }
      });
      userId = user.id;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: userId } });
    });

    it('should login successfully with valid credentials', async () => {
      const result = await authService.login(testUser.username, testUser.password);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(userId);
      expect(result.user?.username).toBe(testUser.username);
      expect(result.user?.role).toBe(UserRole.ADMIN);
      expect(result.error).toBeUndefined();
    });

    it('should generate a valid JWT token on login', async () => {
      const result = await authService.login(testUser.username, testUser.password);
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      // Validate the token
      const payload = await authService.validateToken(result.token!);
      expect(payload.userId).toBe(userId);
      expect(payload.username).toBe(testUser.username);
      expect(payload.role).toBe(UserRole.ADMIN);
    });

    it('should fail login with invalid username', async () => {
      const result = await authService.login('nonexistentuser', testUser.password);

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should fail login with invalid password', async () => {
      const result = await authService.login(testUser.username, 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should fail login with empty username', async () => {
      const result = await authService.login('', testUser.password);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should fail login with empty password', async () => {
      const result = await authService.login(testUser.username, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should include user ID, username, and role in token payload', async () => {
      const result = await authService.login(testUser.username, testUser.password);
      
      expect(result.success).toBe(true);
      const payload = await authService.validateToken(result.token!);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('role');
      expect(payload.userId).toBe(userId);
      expect(payload.username).toBe(testUser.username);
      expect(payload.role).toBe(UserRole.ADMIN);
    });

    it('should work for PRODUCTION role user', async () => {
      const prodUser = {
        username: `produser_${Date.now()}`,
        password: 'prodpass123'
      };

      const hashedPassword = await authService.hashPassword(prodUser.password);
      const user = await prisma.user.create({
        data: {
          username: prodUser.username,
          passwordHash: hashedPassword,
          role: UserRole.PRODUCTION
        }
      });

      try {
        const result = await authService.login(prodUser.username, prodUser.password);

        expect(result.success).toBe(true);
        expect(result.token).toBeDefined();
        expect(result.user?.role).toBe(UserRole.PRODUCTION);

        const payload = await authService.validateToken(result.token!);
        expect(payload.role).toBe(UserRole.PRODUCTION);
      } finally {
        await prisma.user.delete({ where: { id: user.id } });
      }
    });
  });

  describe('Token expiration configuration', () => {
    it('should set token expiration to 8 hours', async () => {
      const testUser = {
        username: `testuser_expiry_${Date.now()}`,
        password: 'password123'
      };

      const hashedPassword = await authService.hashPassword(testUser.password);
      const user = await prisma.user.create({
        data: {
          username: testUser.username,
          passwordHash: hashedPassword,
          role: UserRole.ADMIN
        }
      });

      try {
        const result = await authService.login(testUser.username, testUser.password);
        expect(result.success).toBe(true);

        const payload = await authService.validateToken(result.token!);
        expect(payload.iat).toBeDefined();
        expect(payload.exp).toBeDefined();

        // Verify expiration is 8 hours (28800 seconds) from issued time
        const expirationDuration = payload.exp! - payload.iat!;
        expect(expirationDuration).toBe(8 * 60 * 60); // 8 hours in seconds
      } finally {
        await prisma.user.delete({ where: { id: user.id } });
      }
    });
  });

  describe('Password hashing configuration', () => {
    it('should use bcrypt with 10 salt rounds', async () => {
      const password = 'testPassword123';
      const hashed = await authService.hashPassword(password);

      // Bcrypt hash format: $2a$rounds$salt+hash
      // Extract rounds from hash
      const hashParts = hashed.split('$');
      expect(hashParts[0]).toBe(''); // Empty before first $
      expect(hashParts[1]).toMatch(/^2[aby]$/); // Bcrypt version
      expect(hashParts[2]).toBe('10'); // Salt rounds
      expect(hashParts[3]).toBeDefined(); // Salt and hash
    });
  });
});
