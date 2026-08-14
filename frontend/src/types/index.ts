export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'PRODUCTION';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  type: string;
  color: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: string;
  quantity: number;
  currentStage: ProductionStage;
  product?: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  deadline: string;
  status: ProductionStage;
  customer?: Customer;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const ProductionStage = {
  NOT_PROCESSED: 'NOT_PROCESSED',
  CUTTING: 'CUTTING',
  SEWING: 'SEWING',
  QC: 'QC',
  FINISHING: 'FINISHING',
  PACKING: 'PACKING',
  COMPLETE: 'COMPLETE'
} as const;

export type ProductionStage = typeof ProductionStage[keyof typeof ProductionStage];

export interface ProductionProgress {
  id: number;
  orderItemId: number;
  stage: ProductionStage;
  quantity: number;
  recordedAt: string;
}

export interface RejectRecord {
  id: number;
  orderItemId: number;
  quantity: number;
  fromStage: ProductionStage;
  recordedAt: string;
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
