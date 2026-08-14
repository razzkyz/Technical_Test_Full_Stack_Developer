import { PrismaClient, Order, Prisma } from '@prisma/client';
import { CreateOrderDTO, UpdateOrderDTO, OrderFilters } from '../types';

/**
 * Order Repository
 * Handles database operations for orders
 */
export class OrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new order with items in a transaction
   */
  async create(data: CreateOrderDTO): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerId: data.customerId,
          orderDate: data.orderDate,
          deadline: data.deadline,
          status: 'NOT_PROCESSED'
        }
      });

      // Create order items
      if (data.items && data.items.length > 0) {
        await tx.orderItem.createMany({
          data: data.items.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            currentStage: 'NOT_PROCESSED'
          }))
        });
      }

      // Return order with items
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      }) as Promise<Order>;
    });
  }

  /**
   * Find all orders with optional filters
   */
  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });
  }

  /**
   * Find order by ID with full details
   */
  async findById(id: number): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            productionProgress: {
              orderBy: { recordedAt: 'asc' }
            },
            rejectRecords: {
              orderBy: { recordedAt: 'asc' }
            }
          }
        }
      }
    });
  }

  /**
   * Search orders by order number (case-insensitive)
   */
  async search(orderNumber: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        orderNumber: {
          contains: orderNumber,
          mode: 'insensitive'
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });
  }

  /**
   * Update order
   */
  async update(id: number, data: UpdateOrderDTO): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  /**
   * Delete order (will cascade delete items)
   */
  async delete(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id }
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber }
    });
  }

  /**
   * Check if order has production progress
   */
  async hasProductionProgress(id: number): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productionProgress: true
          }
        }
      }
    });

    if (!order) return false;

    return order.items.some(item => item.productionProgress.length > 0);
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any }
    });
  }
}
