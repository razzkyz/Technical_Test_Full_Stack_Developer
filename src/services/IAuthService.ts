import { AuthResult, TokenPayload } from '../types';

/**
 * Interface for authentication service
 * Handles user authentication, token management, and password hashing
 */
export interface IAuthService {
  /**
   * Authenticate user with username and password
   * @param username - User's username
   * @param password - User's plain text password
   * @returns AuthResult with token and user info on success
   */
  login(username: string, password: string): Promise<AuthResult>;

  /**
   * Validate and decode a JWT token
   * @param token - JWT token string
   * @returns TokenPayload with user information
   * @throws Error if token is invalid or expired
   */
  validateToken(token: string): Promise<TokenPayload>;

  /**
   * Hash a plain text password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password
   * @param plain - Plain text password
   * @param hashed - Hashed password
   * @returns True if passwords match, false otherwise
   */
  comparePassword(plain: string, hashed: string): Promise<boolean>;
}
