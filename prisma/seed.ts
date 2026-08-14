import { PrismaClient, UserRole, ProductionStage } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Setup Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!existingAdmin) {
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: passwordHash,
        role: UserRole.ADMIN
      }
    });
    console.log(`✓ Created admin user: ${adminUser.username}`);
  } else {
    console.log('Admin user already exists. Moving to dummy data...');
  }

  // Check if we already have dummy data
  const existingCustomers = await prisma.customer.count();
  if (existingCustomers > 0) {
    console.log('Dummy data already exists. Skipping dummy seed.');
    return;
  }

  // 2. Setup Customers
  console.log('Creating dummy customers...');
  const customer1 = await prisma.customer.create({
    data: { id: 'CUST-001', name: 'CV. Karya Mandiri', phone: '081234567890', address: 'Jl. Sudirman No. 12, Jakarta' }
  });
  const customer2 = await prisma.customer.create({
    data: { id: 'CUST-002', name: 'PT. Maju Bersama', phone: '081987654321', address: 'Jl. Thamrin No. 45, Bandung' }
  });
  const customer3 = await prisma.customer.create({
    data: { id: 'CUST-003', name: 'Budi Santoso', phone: '085611223344', address: 'Jl. Merdeka No. 8, Surabaya' }
  });

  // 3. Setup Products
  console.log('Creating dummy products...');
  const prod1 = await prisma.product.create({
    data: { id: 'PROD-001', code: 'KMJ-001', name: 'Kemeja PDH Instansi', type: 'KEMEJA', color: 'Biru Dongker', size: 'L' }
  });
  const prod2 = await prisma.product.create({
    data: { id: 'PROD-002', code: 'KAO-002', name: 'Kaos Gathering 2024', type: 'KAOS', color: 'Putih', size: 'XL' }
  });
  const prod3 = await prisma.product.create({
    data: { id: 'PROD-003', code: 'JAK-003', name: 'Jaket Komunitas Motor', type: 'JAKET', color: 'Hitam', size: 'M' }
  });
  const prod4 = await prisma.product.create({
    data: { id: 'PROD-004', code: 'TOP-004', name: 'Topi Rimba Lapangan', type: 'TOPI', color: 'Hijau Army', size: 'All Size' }
  });

  // 4. Setup Orders & Order Items
  console.log('Creating dummy orders...');
  
  // Order 1 - CV. Karya Mandiri (Cutting)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-001',
      customerId: customer1.id,
      orderDate: new Date('2023-11-01'),
      deadline: new Date('2023-12-01'),
      status: ProductionStage.CUTTING,
      items: {
        create: [
          { productId: prod1.id, quantity: 150, currentStage: ProductionStage.SEWING },
          { productId: prod3.id, quantity: 50, currentStage: ProductionStage.CUTTING }
        ]
      }
    },
    include: { items: true }
  });

  // Simulate progress for Order 1
  for (const item of order1.items) {
    if (item.productId === prod1.id) {
      await prisma.productionProgress.create({
        data: { orderItemId: item.id, stage: ProductionStage.CUTTING, quantity: 150 }
      });
      await prisma.productionProgress.create({
        data: { orderItemId: item.id, stage: ProductionStage.SEWING, quantity: 150 }
      });
    } else if (item.productId === prod3.id) {
      await prisma.productionProgress.create({
        data: { orderItemId: item.id, stage: ProductionStage.CUTTING, quantity: 50 }
      });
    }
  }

  // Order 2 - PT. Maju Bersama (Not Processed yet)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-002',
      customerId: customer2.id,
      orderDate: new Date(),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
      status: ProductionStage.NOT_PROCESSED,
      items: {
        create: [
          { productId: prod2.id, quantity: 300, currentStage: ProductionStage.NOT_PROCESSED }
        ]
      }
    }
  });

  // Order 3 - Budi Santoso (QC Stage)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2023-003',
      customerId: customer3.id,
      orderDate: new Date('2023-11-15'),
      deadline: new Date('2023-11-30'),
      status: ProductionStage.QC,
      items: {
        create: [
          { productId: prod4.id, quantity: 100, currentStage: ProductionStage.QC }
        ]
      }
    },
    include: { items: true }
  });

  // Simulate progress for Order 3 up to QC
  const order3Item = order3.items[0];
  await prisma.productionProgress.createMany({
    data: [
      { orderItemId: order3Item.id, stage: ProductionStage.CUTTING, quantity: 100 },
      { orderItemId: order3Item.id, stage: ProductionStage.SEWING, quantity: 100 },
      { orderItemId: order3Item.id, stage: ProductionStage.QC, quantity: 100 }
    ]
  });

  console.log('✓ Dummy data created successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
