// Export enums from Prisma client
export { UserRole, ProductionStage } from '@prisma/client';

// Common types
export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  error?: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// DTOs will be added as we implement features
export interface CreateCustomerDTO {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  phone?: string;
  address?: string;
}

export interface CreateProductDTO {
  id: string;
  code: string;
  name: string;
  type: string;
  color: string;
  size: string;
}

export interface UpdateProductDTO {
  code?: string;
  name?: string;
  type?: string;
  color?: string;
  size?: string;
}

export interface OrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  orderNumber: string;
  customerId: string;
  orderDate: Date;
  deadline: Date;
  items: OrderItemDTO[];
}

export interface UpdateOrderDTO {
  orderDate?: Date;
  deadline?: Date;
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalOrders: number;
  runningOrders: number;
  completedOrders: number;
  lateOrders: number;
  productionByStage: StageQuantity[];
}

export interface StageQuantity {
  stage: string;
  quantity: number;
}
