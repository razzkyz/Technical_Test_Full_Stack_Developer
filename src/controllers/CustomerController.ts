import { Request, Response } from 'express';
import { CustomerService } from '../services/CustomerService';
import { z } from 'zod';

// Validation schemas
const createCustomerSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(20),
  address: z.string().min(1)
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(20).optional(),
  address: z.string().min(1).optional()
});

/**
 * Customer Controller
 * Handles HTTP requests for customer management
 */
export class CustomerController {
  private customerService: CustomerService;

  constructor(customerService: CustomerService) {
    this.customerService = customerService;
  }

  /**
   * Create customer
   * POST /api/customers
   * Admin only
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createCustomerSchema.parse(req.body);
      const customer = await this.customerService.create(data);
      res.status(201).json(customer);
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
   * Get all customers or search by name
   * GET /api/customers?search=query
   * Admin only
   */
  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const search = req.query.search as string | undefined;
      
      const customers = search
        ? await this.customerService.search(search)
        : await this.customerService.findAll();

      res.status(200).json(customers);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Get customer by ID
   * GET /api/customers/:id
   * Admin only
   */
  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const customer = await this.customerService.findById(id);
      res.status(200).json(customer);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  /**
   * Update customer
   * PUT /api/customers/:id
   * Admin only
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const data = updateCustomerSchema.parse(req.body);
      const customer = await this.customerService.update(id, data);
      res.status(200).json(customer);
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
   * Delete customer
   * DELETE /api/customers/:id
   * Admin only
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.customerService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('existing orders')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
