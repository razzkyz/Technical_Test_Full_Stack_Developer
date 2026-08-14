import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { z } from 'zod';

// Validation schemas
const createProductSchema = z.object({
  id: z.string().min(1).max(50),
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  color: z.string().min(1).max(50),
  size: z.string().min(1).max(20)
});

const updateProductSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(100).optional(),
  color: z.string().min(1).max(50).optional(),
  size: z.string().min(1).max(20).optional()
});

/**
 * Product Controller
 * Handles HTTP requests for product management
 */
export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Create product
   * POST /api/products
   * Admin only
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await this.productService.create(data);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Get all products
   * GET /api/products
   * Admin only
   */
  findAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.findAll();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get product by ID
   * GET /api/products/:id
   * Admin only
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const product = await this.productService.findById(id);
      res.status(200).json(product);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Update product
   * PUT /api/products/:id
   * Admin only
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = updateProductSchema.parse(req.body);
      const product = await this.productService.update(id, data);
      res.status(200).json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Delete product
   * DELETE /api/products/:id
   * Admin only
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.productService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('order items')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
