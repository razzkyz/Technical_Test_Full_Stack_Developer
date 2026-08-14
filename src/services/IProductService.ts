import { Product } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO } from '../types';

/**
 * Product Service Interface
 * Defines contract for product business logic operations
 */
export interface IProductService {
  create(data: CreateProductDTO): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<void>;
}
