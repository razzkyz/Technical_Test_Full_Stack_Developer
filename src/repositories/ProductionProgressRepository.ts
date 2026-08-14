import { PrismaClient, ProductionProgress, ProductionStage } from '@prisma/client';

/**
 * Production Progress Repository
 * Handles database operations for production progress (append-only)
 */
export class ProductionProgressRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new production progress record
   */
  async create(orderItemId: number, stage: ProductionStage, quantity: number): Promise<ProductionProgress> {
    return this.prisma.productionProgress.create({
      data: {
        orderItemId,
        stage,
        quantity
      }
    });
  }

  /**
   * Find all progress records for an order item
   */
  async findByOrderItem(orderItemId: number): Promise<ProductionProgress[]> {
    return this.prisma.productionProgress.findMany({
      where: { orderItemId },
      orderBy: { recordedAt: 'asc' }
    });
  }

  /**
   * Find progress records by stage
   */
  async findByStage(stage: ProductionStage): Promise<ProductionProgress[]> {
    return this.prisma.productionProgress.findMany({
      where: { stage },
      orderBy: { recordedAt: 'asc' }
    });
  }
}
