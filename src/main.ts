import express, { Application, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Services
import { AuthService } from './services/AuthService';
import { CustomerService } from './services/CustomerService';
import { ProductService } from './services/ProductService';
import { OrderService } from './services/OrderService';
import { ProductionService } from './services/ProductionService';
import { DashboardService } from './services/DashboardService';

// Repositories
import { CustomerRepository } from './repositories/CustomerRepository';
import { ProductRepository } from './repositories/ProductRepository';
import { OrderRepository } from './repositories/OrderRepository';
import { OrderItemRepository } from './repositories/OrderItemRepository';
import { ProductionProgressRepository } from './repositories/ProductionProgressRepository';
import { RejectRecordRepository } from './repositories/RejectRecordRepository';

// Controllers
import { AuthController } from './controllers/AuthController';
import { CustomerController } from './controllers/CustomerController';
import { ProductController } from './controllers/ProductController';
import { OrderController } from './controllers/OrderController';
import { ProductionController } from './controllers/ProductionController';
import { DashboardController } from './controllers/DashboardController';

// Middleware
import { authenticateRequest, requireRole } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Repositories
const customerRepo = new CustomerRepository(prisma);
const productRepo = new ProductRepository(prisma);
const orderRepo = new OrderRepository(prisma);
const orderItemRepo = new OrderItemRepository(prisma);
const progressRepo = new ProductionProgressRepository(prisma);
const rejectRepo = new RejectRecordRepository(prisma);

// Initialize Services
const authService = new AuthService(prisma);
const customerService = new CustomerService(customerRepo);
const productService = new ProductService(productRepo);
const orderService = new OrderService(orderRepo, orderItemRepo);
const productionService = new ProductionService(prisma, progressRepo, rejectRepo, orderItemRepo);
const dashboardService = new DashboardService(prisma, productionService);

// Initialize Controllers
const authController = new AuthController(authService);
const customerController = new CustomerController(customerService);
const productController = new ProductController(productService);
const orderController = new OrderController(orderService);
const productionController = new ProductionController(productionService, orderService);
const dashboardController = new DashboardController(dashboardService);

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Garment Production System API is running' });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Garment Production Management System API',
    version: '1.0.0'
  });
});

// API Routes
const apiRouter = Router();

// Auth routes (public)
apiRouter.post('/auth/login', authController.login);
apiRouter.post('/auth/logout', authController.logout);

// Customer routes (Admin only)
apiRouter.post('/customers', authenticateRequest(authService), requireRole('ADMIN'), customerController.create);
apiRouter.get('/customers', authenticateRequest(authService), requireRole('ADMIN'), customerController.findAll);
apiRouter.get('/customers/:id', authenticateRequest(authService), requireRole('ADMIN'), customerController.findById);
apiRouter.put('/customers/:id', authenticateRequest(authService), requireRole('ADMIN'), customerController.update);
apiRouter.delete('/customers/:id', authenticateRequest(authService), requireRole('ADMIN'), customerController.delete);

// Product routes (Admin only)
apiRouter.post('/products', authenticateRequest(authService), requireRole('ADMIN'), productController.create);
apiRouter.get('/products', authenticateRequest(authService), requireRole('ADMIN'), productController.findAll);
apiRouter.get('/products/:id', authenticateRequest(authService), requireRole('ADMIN'), productController.findById);
apiRouter.put('/products/:id', authenticateRequest(authService), requireRole('ADMIN'), productController.update);
apiRouter.delete('/products/:id', authenticateRequest(authService), requireRole('ADMIN'), productController.delete);

// Order routes
apiRouter.post('/orders', authenticateRequest(authService), requireRole('ADMIN'), orderController.create);
apiRouter.get('/orders', authenticateRequest(authService), orderController.findAll);
apiRouter.get('/orders/:id', authenticateRequest(authService), orderController.findById);
apiRouter.put('/orders/:id', authenticateRequest(authService), requireRole('ADMIN'), orderController.update);
apiRouter.delete('/orders/:id', authenticateRequest(authService), requireRole('ADMIN'), orderController.delete);

// Production routes
apiRouter.post('/production/progress', authenticateRequest(authService), requireRole('PRODUCTION', 'ADMIN'), productionController.recordProgress);
apiRouter.post('/production/progress/qc', authenticateRequest(authService), requireRole('PRODUCTION', 'ADMIN'), productionController.recordQC);
apiRouter.get('/production/progress/:orderItemId', authenticateRequest(authService), productionController.getProgressHistory);
apiRouter.get('/production/running-orders', authenticateRequest(authService), requireRole('PRODUCTION', 'ADMIN'), productionController.getRunningOrders);

// Dashboard routes (Admin only)
apiRouter.get('/dashboard/metrics', authenticateRequest(authService), requireRole('ADMIN'), dashboardController.getMetrics);

// Mount API router
app.use('/api', apiRouter);

// Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server - bind to 0.0.0.0 to support both IPv4 and IPv6 localhost
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
