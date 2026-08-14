import { PrismaClient, ProductionStage } from '@prisma/client';
import { DashboardMetrics, StageQuantity } from '../types';
import { ProductionService } from './ProductionService';

/**
 * Dashboard Service
 * Business logic for dashboard metrics
 */
export class DashboardService {
  private prisma: PrismaClient;
  private productionService: ProductionService;

  constructor(prisma: PrismaClient, productionService: ProductionService) {
    this.prisma = prisma;
    this.productionService = productionService;
  }

  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    // Count customers
    const totalCustomers = await this.prisma.customer.count();

    // Count orders
    const totalOrders = await this.prisma.order.count();

    // Count running orders (status != COMPLETE)
    const runningOrders = await this.prisma.order.count({
      where: {
        status: {
          not: ProductionStage.COMPLETE
        }
      }
    });

    // Count completed orders
    const completedOrders = await this.prisma.order.count({
      where: {
        status: ProductionStage.COMPLETE
      }
    });

    // Count late orders (deadline < now AND status != COMPLETE)
    const now = new Date();
    const lateOrders = await this.prisma.order.count({
      where: {
        deadline: {
          lt: now
        },
        status: {
          not: ProductionStage.COMPLETE
        }
      }
    });

    // Aggregate production by stage
    const productionByStage = await this.aggregateProductionByStage();

    return {
      totalCustomers,
      totalOrders,
      runningOrders,
      completedOrders,
      lateOrders,
      productionByStage
    };
  }

  /**
   * Aggregate production quantities by stage across all order items
   */
  private async aggregateProductionByStage(): Promise<StageQuantity[]> {
    // Get all order items
    const orderItems = await this.prisma.orderItem.findMany();

    // Initialize stage totals
    const stages = [
      ProductionStage.NOT_PROCESSED,
      ProductionStage.CUTTING,
      ProductionStage.SEWING,
      ProductionStage.QC,
      ProductionStage.FINISHING,
      ProductionStage.PACKING,
      ProductionStage.COMPLETE
    ];

    const stageTotals: { [key: string]: number } = {};
    stages.forEach(stage => {
      stageTotals[stage] = 0;
    });

    // Sum available quantities for each order item
    for (const item of orderItems) {
      for (const stage of stages) {
        const available = await this.productionService.getAvailableQuantity(item.id, stage);
        stageTotals[stage] += available;
      }
    }

    // Convert to array format
    return stages.map(stage => ({
      stage,
      quantity: stageTotals[stage]
    }));
  }
}
