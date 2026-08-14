-- ================================================
-- GARMENT PRODUCTION MANAGEMENT SYSTEM
-- Complete Database Schema + Seed Data
-- ================================================
-- 
-- CARA IMPORT:
-- psql -U postgres -d garment_production -f database-complete.sql
--
-- ATAU via pgAdmin:
-- 1. Create database: garment_production
-- 2. Open Query Tool
-- 3. Copy-paste this file
-- 4. Execute (F5)
--
-- ================================================

-- Drop tables if exists (for clean import)
DROP TABLE IF EXISTS "RejectRecord" CASCADE;
DROP TABLE IF EXISTS "ProductionProgress" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ================================================
-- CREATE TABLES
-- ================================================

-- User Table
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('ADMIN', 'PRODUCTION')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Table
CREATE TABLE "Customer" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Table
CREATE TABLE "Product" (
    "id" VARCHAR(50) PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "size" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Table
CREATE TABLE "Order" (
    "id" SERIAL PRIMARY KEY,
    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
    "customerId" INTEGER NOT NULL,
    "orderDate" DATE NOT NULL,
    "deadline" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'NOT_PROCESSED' CHECK ("status" IN ('NOT_PROCESSED', 'IN_PROGRESS', 'COMPLETE')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT
);

-- OrderItem Table
CREATE TABLE "OrderItem" (
    "id" SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "productId" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "currentStage" VARCHAR(20) NOT NULL DEFAULT 'NOT_PROCESSED' CHECK ("currentStage" IN ('NOT_PROCESSED', 'CUTTING', 'SEWING', 'QC', 'FINISHING', 'PACKING', 'COMPLETE')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT
);

-- ProductionProgress Table
CREATE TABLE "ProductionProgress" (
    "id" SERIAL PRIMARY KEY,
    "orderItemId" INTEGER NOT NULL,
    "stage" VARCHAR(20) NOT NULL CHECK ("stage" IN ('NOT_PROCESSED', 'CUTTING', 'SEWING', 'QC', 'FINISHING', 'PACKING', 'COMPLETE')),
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE
);

-- RejectRecord Table
CREATE TABLE "RejectRecord" (
    "id" SERIAL PRIMARY KEY,
    "orderItemId" INTEGER NOT NULL,
    "rejectedQuantity" INTEGER NOT NULL CHECK ("rejectedQuantity" > 0),
    "reason" TEXT,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE
);

-- ================================================
-- CREATE INDEXES (for performance)
-- ================================================

CREATE INDEX "idx_order_customer" ON "Order"("customerId");
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_order_deadline" ON "Order"("deadline");
CREATE INDEX "idx_orderitem_order" ON "OrderItem"("orderId");
CREATE INDEX "idx_orderitem_product" ON "OrderItem"("productId");
CREATE INDEX "idx_orderitem_stage" ON "OrderItem"("currentStage");
CREATE INDEX "idx_production_orderitem" ON "ProductionProgress"("orderItemId");
CREATE INDEX "idx_reject_orderitem" ON "RejectRecord"("orderItemId");

-- ================================================
-- SEED DATA
-- ================================================

-- Insert Default Users
-- Password: admin123 (hashed with bcrypt)
INSERT INTO "User" ("username", "password", "role", "createdAt") VALUES
('admin', '$2b$10$YourHashedPasswordHere.Replace.With.Actual.BCrypt.Hash', 'ADMIN', CURRENT_TIMESTAMP);

-- Note: Password "admin123" hashed dengan bcrypt
-- Jika gagal login, run seed script: npx ts-node prisma/seed.ts

-- Insert Sample Customers (Optional - untuk demo)
INSERT INTO "Customer" ("name", "phone", "address", "createdAt") VALUES
('PT Garuda Indonesia', '021-12345678', 'Jl. Sudirman No. 123, Jakarta Pusat', CURRENT_TIMESTAMP),
('CV Jaya Abadi', '022-87654321', 'Jl. Asia Afrika No. 45, Bandung', CURRENT_TIMESTAMP),
('Toko Busana Modern', '031-11223344', 'Jl. Tunjungan No. 67, Surabaya', CURRENT_TIMESTAMP);

-- Insert Sample Products (Optional - untuk demo)
INSERT INTO "Product" ("id", "code", "name", "type", "color", "size", "createdAt") VALUES
('KS-001', 'KS-001', 'Kaos Polos Katun', 'Kaos', 'Hitam', 'L', CURRENT_TIMESTAMP),
('KS-002', 'KS-002', 'Kaos Polos Katun', 'Kaos', 'Putih', 'XL', CURRENT_TIMESTAMP),
('KS-003', 'KS-003', 'Kaos Polos Katun', 'Kaos', 'Merah', 'M', CURRENT_TIMESTAMP),
('KM-001', 'KM-001', 'Kemeja Lengan Panjang', 'Kemeja', 'Biru', 'L', CURRENT_TIMESTAMP),
('KM-002', 'KM-002', 'Kemeja Lengan Pendek', 'Kemeja', 'Putih', 'M', CURRENT_TIMESTAMP),
('CL-001', 'CL-001', 'Celana Panjang Kain', 'Celana', 'Hitam', '32', CURRENT_TIMESTAMP),
('CL-002', 'CL-002', 'Celana Pendek Casual', 'Celana', 'Abu-abu', '30', CURRENT_TIMESTAMP),
('JK-001', 'JK-001', 'Jaket Bomber', 'Jaket', 'Hitam', 'L', CURRENT_TIMESTAMP);

-- Insert Sample Orders (Optional - untuk demo)
INSERT INTO "Order" ("orderNumber", "customerId", "orderDate", "deadline", "status", "createdAt") VALUES
('ORD-20240101', 1, '2024-01-01', '2024-01-15', 'NOT_PROCESSED', CURRENT_TIMESTAMP),
('ORD-20240102', 2, '2024-01-02', '2024-01-20', 'NOT_PROCESSED', CURRENT_TIMESTAMP),
('ORD-20240103', 3, '2024-01-03', '2024-01-25', 'NOT_PROCESSED', CURRENT_TIMESTAMP);

-- Insert Sample Order Items (Optional - untuk demo)
INSERT INTO "OrderItem" ("orderId", "productId", "quantity", "currentStage", "createdAt") VALUES
(1, 'KS-001', 100, 'NOT_PROCESSED', CURRENT_TIMESTAMP),
(1, 'KS-002', 50, 'NOT_PROCESSED', CURRENT_TIMESTAMP),
(2, 'KM-001', 75, 'NOT_PROCESSED', CURRENT_TIMESTAMP),
(2, 'CL-001', 80, 'NOT_PROCESSED', CURRENT_TIMESTAMP),
(3, 'KS-003', 200, 'NOT_PROCESSED', CURRENT_TIMESTAMP);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Run these to verify import success:
-- SELECT COUNT(*) FROM "User";           -- Should be 1
-- SELECT COUNT(*) FROM "Customer";       -- Should be 3
-- SELECT COUNT(*) FROM "Product";        -- Should be 8
-- SELECT COUNT(*) FROM "Order";          -- Should be 3
-- SELECT COUNT(*) FROM "OrderItem";      -- Should be 5

-- ================================================
-- IMPORT COMPLETED
-- ================================================

-- Next steps:
-- 1. Update .env with your database credentials
-- 2. npm install
-- 3. npm run dev (backend)
-- 4. cd frontend && npm install && npm run dev
-- 5. Login: admin / admin123

-- ================================================
