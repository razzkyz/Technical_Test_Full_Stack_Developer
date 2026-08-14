import { Product } from '@prisma/client';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductDTO, UpdateProductDTO } from '../types';

/**
 * Product Service
 * Business logic for product management
 */
export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Create new product
   * @throws Error if product ID or code already exists
   */
  async create(data: CreateProductDTO): Promise<Product> {
    // Check for duplicate ID
    const existingById = await this.productRepository.findById(data.id);
    if (existingById) {
      throw new Error(`Product with ID ${data.id} already exists`);
    }

    // Check for duplicate code
    const existingByCode = await this.productRepository.findByCode(data.code);
    if (existingByCode) {
      throw new Error(`Product with code ${data.code} already exists`);
    }

    return this.productRepository.create(data);
  }

  /**
   * Get all products
   */
  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  /**
   * Get product by ID
   * @throws Error if product not found
   */
  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * Update product
   * @throws Error if product not found or code already exists
   */
  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    // Verify product exists
    await this.findById(id);

    // Check for duplicate code (if code is being updated)
    if (data.code) {
      const existingByCode = await this.productRepository.findByCode(data.code);
      if (existingByCode && existingByCode.id !== id) {
        throw new Error(`Product with code ${data.code} already exists`);
      }
    }
    
    return this.productRepository.update(id, data);
  }

  /**
   * Delete product
   * @throws Error if product not found or has order items
   */
  async delete(id: string): Promise<void> {
    // Verify product exists
    await this.findById(id);

    // Check for order items
    const hasOrderItems = await this.productRepository.hasOrderItems(id);
    if (hasOrderItems) {
      throw new Error(`Cannot delete product with existing order items`);
    }

    await this.productRepository.delete(id);
  }
}
