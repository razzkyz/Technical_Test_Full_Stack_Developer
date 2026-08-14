import { Request, Response } from 'express';
import { ProductionService } from '../services/ProductionService';
import { OrderService } from '../services/OrderService';
import { ProductionStage } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const recordProgressSchema = z.object({
  orderItemId: z.number().int().positive(),
  stage: z.nativeEnum(ProductionStage),
  quantity: z.number().int().positive()
});

const recordQCSchema = z.object({
  orderItemId: z.number().int().positive(),
  passedQuantity: z.number().int().min(0),
  rejectedQuantity: z.number().int().min(0)
});

/**
 * Production Controller
 * Handles HTTP requests for production tracking
 */
export class ProductionController {
  private productionService: ProductionService;
  private orderService: OrderService;

  constructor(productionService: ProductionService, orderService: OrderService) {
    this.productionService = productionService;
    this.orderService = orderService;
  }

  /**
   * Record stage progression
   * POST /api/production/progress
   * Production and Admin
   */
  recordProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = recordProgressSchema.parse(req.body);
      const progress = await this.productionService.recordProgress(
        data.orderItemId,
        data.stage,
        data.quantity
      );

      // Update parent order status if needed
      const orderItem = await this.productionService['orderItemRepo'].findById(data.orderItemId);
      if (orderItem) {
        await this.orderService.checkAndUpdateOrderStatus(orderItem.orderId);
      }

      res.status(201).json(progress);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('Invalid stage') || error.message.includes('Cannot move')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Record QC with pass/reject
   * POST /api/production/progress/qc
   * Production and Admin
   */
  recordQC = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = recordQCSchema.parse(req.body);
      const result = await this.productionService.recordQCProgress(
        data.orderItemId,
        data.passedQuantity,
        data.rejectedQuantity
      );

      // Update parent order status if needed
      const orderItem = await this.productionService['orderItemRepo'].findById(data.orderItemId);
      if (orderItem) {
        await this.orderService.checkAndUpdateOrderStatus(orderItem.orderId);
      }

      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('QC stage') || error.message.includes('Cannot process')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Get progress history for an order item
   * GET /api/production/progress/:orderItemId
   * All users
   */
  getProgressHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderItemId = parseInt(req.params.orderItemId as string);
      if (isNaN(orderItemId)) {
        res.status(400).json({ error: 'Invalid order item ID' });
        return;
      }

      const progress = await this.productionService.getProgressByOrderItem(orderItemId);
      const rejects = await this.productionService.getRejectHistory(orderItemId);
      const summary = await this.productionService.getProgressSummary(orderItemId);

      res.status(200).json({
        progress,
        rejects,
        summary
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get running orders with progress
   * GET /api/production/running-orders
   * Production and Admin
   */
  getRunningOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getRunningOrders();
      
      // Enhance with progress summaries
      const enhancedOrders = await Promise.all(
        orders.map(async (order: any) => {
          const itemsWithProgress = await Promise.all(
            order.items.map(async (item: any) => ({
              ...item,
              progressSummary: await this.productionService.getProgressSummary(item.id)
            }))
          );
          return { ...order, items: itemsWithProgress };
        })
      );

      res.status(200).json(enhancedOrders);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
