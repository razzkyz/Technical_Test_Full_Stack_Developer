import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * User login
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const result = await this.authService.login(username, password);

      if (result.success) {
        res.status(200).json({
          token: result.token,
          user: result.user
        });
      } else {
        res.status(401).json({ error: result.error || 'Invalid credentials' });
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * User logout (client-side handling primarily)
   * POST /api/auth/logout
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    // In a JWT-based system, logout is primarily client-side (remove token)
    // This endpoint can be used for logging or token blacklisting if needed
    res.status(200).json({ message: 'Logged out successfully' });
  };
}
