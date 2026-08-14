import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { IAuthService } from './IAuthService';
import { AuthResult, TokenPayload } from '../types';

/**
 * Authentication service implementation
 * Handles user authentication, JWT token generation/validation, and password hashing
 */
export class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly TOKEN_EXPIRATION = '8h';
  private readonly jwtSecret: string;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient, jwtSecret?: string) {
    this.prisma = prisma;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'default-secret-key';
    
    if (!jwtSecret && !process.env.JWT_SECRET) {
      console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable in production.');
    }
  }

  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<AuthResult> {
    try {
      // Find user by username
      const user = await this.prisma.user.findUnique({
        where: { username }
      });

      // User not found
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Verify password
      const passwordMatch = await this.comparePassword(password, user.password);
      
      if (!passwordMatch) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Generate JWT token with user info
      const payload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.TOKEN_EXPIRATION
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Validate and decode a JWT token
   */
  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token validation failed');
    }
  }

  /**
   * Hash a plain text password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
