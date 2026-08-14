import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { z } from 'zod';

// Validation schemas
const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
});

const createOrderSchema = z.object({
  orderNumber: z.string().min(1).max(100),
  customerId: z.string().min(1),
  orderDate: z.string().transform(str => new Date(str)),
  deadline: z.string().transform(str => new Date(str)),
  items: z.array(orderItemSchema).min(1)
});

const updateOrderSchema = z.object({
  orderDate: z.string().transform(str => new Date(str)).optional(),
  deadline: z.string().transform(str => new Date(str)).optional()
});

/**
 * Order Controller
 * Handles HTTP requests for order management
 */
export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create order with items
   * POST /api/orders
   * Admin only
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await this.orderService.create(data);
      res.status(201).json(order);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes('must have')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Get all orders with optional filters
   * GET /api/orders?status=CUTTING&search=ORD-001
   * All users
   */
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, customerId, search } = req.query;

      let orders;
      if (search) {
        orders = await this.orderService.search(search as string);
      } else {
        const filters: any = {};
        if (status) filters.status = status;
        if (customerId) filters.customerId = customerId;
        
        orders = await this.orderService.findAll(filters);
      }

      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get order by ID with full details
   * GET /api/orders/:id
   * All users
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      const order = await this.orderService.findById(id);
      res.status(200).json(order);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Update order
   * PUT /api/orders/:id
   * Admin only
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      const data = updateOrderSchema.parse(req.body);
      const order = await this.orderService.update(id, data);
      res.status(200).json(order);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Delete order
   * DELETE /api/orders/:id
   * Admin only
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      await this.orderService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('production progress')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Get running orders (status != COMPLETE)
   * GET /api/orders/running
   * Production and Admin
   */
  getRunningOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getRunningOrders();
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
