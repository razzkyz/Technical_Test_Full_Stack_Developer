import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard metrics
 */
export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  /**
   * Get dashboard metrics
   * GET /api/dashboard/metrics
   * Admin only
   */
  getMetrics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.dashboardService.getMetrics();
      res.status(200).json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
