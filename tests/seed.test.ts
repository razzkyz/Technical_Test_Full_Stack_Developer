import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '../src/services/AuthService';

const prisma = new PrismaClient();

describe('Database Seed - Admin User', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService(prisma, 'test-secret-key');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Seeded Admin User', () => {
    it('should have created an admin user with username "admin"', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { username: 'admin' }
      });

      expect(adminUser).not.toBeNull();
      expect(adminUser?.username).toBe('admin');
      expect(adminUser?.role).toBe(UserRole.ADMIN);
    });

    it('should allow login with default credentials', async () => {
      const result = await authService.login('admin', 'admin123');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('admin');
      expect(result.user?.role).toBe(UserRole.ADMIN);
    });

    it('should reject login with incorrect password', async () => {
      const result = await authService.login('admin', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should have properly hashed password', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { username: 'admin' }
      });

      expect(adminUser?.passwordHash).not.toBe('admin123');
      expect(adminUser?.passwordHash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('Seed Idempotency', () => {
    it('should not create duplicate admin users', async () => {
      const adminUsers = await prisma.user.findMany({
        where: { username: 'admin' }
      });

      expect(adminUsers).toHaveLength(1);
    });
  });
});
