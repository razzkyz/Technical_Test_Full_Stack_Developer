import { Order, ProductionStage } from '@prisma/client';
import { OrderRepository } from '../repositories/OrderRepository';
import { OrderItemRepository } from '../repositories/OrderItemRepository';
import { CreateOrderDTO, UpdateOrderDTO, OrderFilters } from '../types';

/**
 * Order Service
 * Business logic for order management
 */
export class OrderService {
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;

  constructor(
    orderRepository: OrderRepository,
    orderItemRepository: OrderItemRepository
  ) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
  }

  /**
   * Create new order with items
   * @throws Error if order number already exists
   */
  async create(data: CreateOrderDTO): Promise<Order> {
    // Check for duplicate order number
    const existing = await this.orderRepository.findByOrderNumber(data.orderNumber);
    if (existing) {
      throw new Error(`Order with order number ${data.orderNumber} already exists`);
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate quantities
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new Error('Order item quantity must be greater than 0');
      }
    }

    // Create order with items in transaction
    return this.orderRepository.create(data);
  }

  /**
   * Get all orders with optional filters
   */
  async findAll(filters?: OrderFilters): Promise<Order[]> {
    return this.orderRepository.findAll(filters);
  }

  /**
   * Get order by ID
   * @throws Error if order not found
   */
  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return order;
  }

  /**
   * Search orders by order number
   */
  async search(orderNumber: string): Promise<Order[]> {
    return this.orderRepository.search(orderNumber);
  }

  /**
   * Update order
   * @throws Error if order not found
   */
  async update(id: number, data: UpdateOrderDTO): Promise<Order> {
    // Verify order exists
    await this.findById(id);
    
    return this.orderRepository.update(id, data);
  }

  /**
   * Delete order
   * @throws Error if order not found or has production progress
   */
  async delete(id: number): Promise<void> {
    // Verify order exists
    await this.findById(id);

    // Check for production progress
    const hasProgress = await this.orderRepository.hasProductionProgress(id);
    if (hasProgress) {
      throw new Error(`Cannot delete order with production progress`);
    }

    await this.orderRepository.delete(id);
  }

  /**
   * Check and update order status based on all items
   * Updates to COMPLETE when all items are COMPLETE
   */
  async checkAndUpdateOrderStatus(orderId: number): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return;

    // Get order items
    const items = await this.orderItemRepository.findByOrderId(orderId);

    // Check if all items are complete
    const allComplete = items.every(
      (item: any) => item.currentStage === ProductionStage.COMPLETE
    );

    if (allComplete && order.status !== ProductionStage.COMPLETE) {
      await this.orderRepository.updateStatus(orderId, ProductionStage.COMPLETE);
    }
  }

  /**
   * Get running orders (status != COMPLETE)
   */
  async getRunningOrders(): Promise<Order[]> {
    const allOrders = await this.orderRepository.findAll();
    return allOrders.filter(order => order.status !== ProductionStage.COMPLETE);
  }
}
