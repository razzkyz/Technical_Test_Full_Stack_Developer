-- ================================================
-- SUPABASE DATABASE SCHEMA
-- Matches Prisma schema exactly
-- ================================================

-- Drop existing tables
DROP TABLE IF EXISTS "reject_records" CASCADE;
DROP TABLE IF EXISTS "production_progress" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "ProductionStage" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PRODUCTION');
CREATE TYPE "ProductionStage" AS ENUM ('NOT_PROCESSED', 'CUTTING', 'SEWING', 'QC', 'FINISHING', 'PACKING', 'COMPLETE');

-- Users table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(100) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "users_username_idx" ON "users"("username");

-- Customers table
CREATE TABLE "customers" (
    "id" VARCHAR(50) PRIMARY KEY,
    "name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "customers_name_idx" ON "customers"("name");

-- Products table
CREATE TABLE "products" (
    "id" VARCHAR(50) PRIMARY KEY,
    "code" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "size" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "products_code_idx" ON "products"("code");
CREATE INDEX "products_type_idx" ON "products"("type");

-- Orders table
CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "order_number" VARCHAR(100) UNIQUE NOT NULL,
    "customer_id" VARCHAR(50) NOT NULL,
    "order_date" DATE NOT NULL,
    "deadline" DATE NOT NULL,
    "status" "ProductionStage" DEFAULT 'NOT_PROCESSED' NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
);

CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_deadline_idx" ON "orders"("deadline");

-- Order Items table
CREATE TABLE "order_items" (
    "id" SERIAL PRIMARY KEY,
    "order_id" INTEGER NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "current_stage" "ProductionStage" DEFAULT 'NOT_PROCESSED' NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");
CREATE INDEX "order_items_current_stage_idx" ON "order_items"("current_stage");

-- Production Progress table
CREATE TABLE "production_progress" (
    "id" SERIAL PRIMARY KEY,
    "order_item_id" INTEGER NOT NULL,
    "stage" "ProductionStage" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE
);

CREATE INDEX "production_progress_order_item_id_idx" ON "production_progress"("order_item_id");
CREATE INDEX "production_progress_stage_idx" ON "production_progress"("stage");
CREATE INDEX "production_progress_recorded_at_idx" ON "production_progress"("recorded_at");

-- Reject Records table
CREATE TABLE "reject_records" (
    "id" SERIAL PRIMARY KEY,
    "order_item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "from_stage" "ProductionStage" DEFAULT 'QC' NOT NULL,
    "recorded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE
);

CREATE INDEX "reject_records_order_item_id_idx" ON "reject_records"("order_item_id");
CREATE INDEX "reject_records_recorded_at_idx" ON "reject_records"("recorded_at");

-- ================================================
-- SEED DATA
-- ================================================

-- Insert admin user
-- Password: admin123 (bcrypt hashed with rounds=10)
INSERT INTO "users" ("username", "password_hash", "role", "created_at") VALUES
('admin', '$2b$10$gEI1iHoEVDpv845PoBwsJ.SfoALBTivIl9XyfNVtVeNat97NsGPmC', 'ADMIN', CURRENT_TIMESTAMP);

-- Insert sample customers
INSERT INTO "customers" ("id", "name", "phone", "address", "created_at", "updated_at") VALUES
('CUST-001', 'PT Garuda Indonesia', '021-12345678', 'Jl. Sudirman No. 123, Jakarta Pusat', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CUST-002', 'CV Jaya Abadi', '022-87654321', 'Jl. Asia Afrika No. 45, Bandung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CUST-003', 'Toko Busana Modern', '031-11223344', 'Jl. Tunjungan No. 67, Surabaya', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample products
INSERT INTO "products" ("id", "code", "name", "type", "color", "size", "created_at", "updated_at") VALUES
('KS-001', 'KS-001', 'Kaos Polos Katun', 'Kaos', 'Hitam', 'L', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KS-002', 'KS-002', 'Kaos Polos Katun', 'Kaos', 'Putih', 'XL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KS-003', 'KS-003', 'Kaos Polos Katun', 'Kaos', 'Merah', 'M', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KM-001', 'KM-001', 'Kemeja Lengan Panjang', 'Kemeja', 'Biru', 'L', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KM-002', 'KM-002', 'Kemeja Lengan Pendek', 'Kemeja', 'Putih', 'M', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CL-001', 'CL-001', 'Celana Panjang Kain', 'Celana', 'Hitam', '32', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CL-002', 'CL-002', 'Celana Pendek Casual', 'Celana', 'Abu-abu', '30', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('JK-001', 'JK-001', 'Jaket Bomber', 'Jaket', 'Hitam', 'L', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ================================================
-- DONE!
-- ================================================
