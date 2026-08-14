import { PrismaClient, Customer } from '@prisma/client';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../types';

/**
 * Customer Repository
 * Handles database operations for customers
 */
export class CustomerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerDTO): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        address: data.address
      }
    });
  }

  /**
   * Find all customers
   */
  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Find customer by ID
   */
  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id }
    });
  }

  /**
   * Search customers by name (case-insensitive)
   */
  async search(query: string): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data
    });
  }

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id }
    });
  }

  /**
   * Check if customer has orders
   */
  async hasOrders(id: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: { customerId: id }
    });
    return count > 0;
  }
}
