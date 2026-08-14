import { Customer } from '@prisma/client';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../types';

/**
 * Customer Service
 * Business logic for customer management
 */
export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  /**
   * Create new customer
   * @throws Error if customer ID already exists
   */
  async create(data: CreateCustomerDTO): Promise<Customer> {
    // Check for duplicate ID
    const existing = await this.customerRepository.findById(data.id);
    if (existing) {
      throw new Error(`Customer with ID ${data.id} already exists`);
    }

    return this.customerRepository.create(data);
  }

  /**
   * Get all customers
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  /**
   * Get customer by ID
   * @throws Error if customer not found
   */
  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  /**
   * Search customers by name
   */
  async search(query: string): Promise<Customer[]> {
    return this.customerRepository.search(query);
  }

  /**
   * Update customer
   * @throws Error if customer not found
   */
  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    // Verify customer exists
    await this.findById(id);
    
    return this.customerRepository.update(id, data);
  }

  /**
   * Delete customer
   * @throws Error if customer not found or has orders
   */
  async delete(id: string): Promise<void> {
    // Verify customer exists
    await this.findById(id);

    // Check for orders
    const hasOrders = await this.customerRepository.hasOrders(id);
    if (hasOrders) {
      throw new Error(`Cannot delete customer with existing orders`);
    }

    await this.customerRepository.delete(id);
  }
}
