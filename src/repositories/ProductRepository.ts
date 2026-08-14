import { PrismaClient, Product } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO } from '../types';

/**
 * Product Repository
 * Handles database operations for products
 */
export class ProductRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductDTO): Promise<Product> {
    return this.prisma.product.create({
      data: {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        color: data.color,
        size: data.size
      }
    });
  }

  /**
   * Find all products
   */
  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id }
    });
  }

  /**
   * Find product by code
   */
  async findByCode(code: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { code }
    });
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data
    });
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id }
    });
  }

  /**
   * Check if product has order items
   */
  async hasOrderItems(id: string): Promise<boolean> {
    const count = await this.prisma.orderItem.count({
      where: { productId: id }
    });
    return count > 0;
  }
}
