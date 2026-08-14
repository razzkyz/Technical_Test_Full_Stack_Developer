import { PrismaClient, RejectRecord, ProductionStage } from '@prisma/client';

/**
 * Reject Record Repository
 * Handles database operations for reject records (append-only)
 */
export class RejectRecordRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new reject record
   */
  async create(orderItemId: number, quantity: number, fromStage: ProductionStage = ProductionStage.QC): Promise<RejectRecord> {
    return this.prisma.rejectRecord.create({
      data: {
        orderItemId,
        quantity,
        fromStage
      }
    });
  }

  /**
   * Find all reject records for an order item
   */
  async findByOrderItem(orderItemId: number): Promise<RejectRecord[]> {
    return this.prisma.rejectRecord.findMany({
      where: { orderItemId },
      orderBy: { recordedAt: 'asc' }
    });
  }
}
