import { PrismaClient, OrderItem } from '@prisma/client';

/**
 * OrderItem Repository
 * Handles database operations for order items
 */
export class OrderItemRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find all order items for an order
   */
  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
        productionProgress: {
          orderBy: { recordedAt: 'asc' }
        },
        rejectRecords: {
          orderBy: { recordedAt: 'asc' }
        }
      }
    });
  }

  /**
   * Find order item by ID
   */
  async findById(id: number): Promise<OrderItem | null> {
    return this.prisma.orderItem.findUnique({
      where: { id },
      include: {
        product: true,
        order: {
          include: {
            customer: true
          }
        },
        productionProgress: {
          orderBy: { recordedAt: 'asc' }
        },
        rejectRecords: {
          orderBy: { recordedAt: 'asc' }
        }
      }
    });
  }

  /**
   * Update order item current stage
   */
  async updateStage(id: number, stage: string): Promise<OrderItem> {
    return this.prisma.orderItem.update({
      where: { id },
      data: { currentStage: stage as any }
    });
  }
}
