# 📦 Database Setup Guide - Untuk Penguji

## 🎯 Overview

Project ini menggunakan **PostgreSQL** sebagai database. Ada 2 cara untuk setup:

1. **Fresh Install** - Install PostgreSQL dari awal (untuk penguji yang belum punya)
2. **Import Backup** - Import file backup database (jika disediakan)

---

## 🚀 Cara 1: Fresh Install (Recommended)

### Step 1: Install PostgreSQL

#### Windows
1. Download PostgreSQL dari: https://www.postgresql.org/download/windows/
2. Pilih versi: **PostgreSQL 15 atau 17** (latest stable)
3. Jalankan installer
4. Ikuti wizard:
   - Port: `5432` (default)
   - Password: Ingat password ini! (contoh: `postgres`)
   - Locale: Default
5. Selesai instalasi

#### Verify Installation
```bash
# Cek version
psql --version

# Output: psql (PostgreSQL) 17.x
```

### Step 2: Create Database

#### Cara A: Via pgAdmin (GUI - Mudah!)
1. Buka **pgAdmin 4** (sudah terinstall dengan PostgreSQL)
2. Login dengan password yang dibuat saat install
3. Right-click "Databases" → Create → Database
4. Nama database: `garment_production`
5. Owner: `postgres`
6. Click "Save"

#### Cara B: Via Command Line
```bash
# Buka cmd/powershell
psql -U postgres

# Di psql prompt:
CREATE DATABASE garment_production;

# Keluar
\q
```

### Step 3: Setup Project

#### 1. Install Dependencies
```bash
cd C:\Freelance\konveksitest
npm install
```

#### 2. Configure Environment
Copy `.env.example` ke `.env`:
```bash
copy .env.example .env
```

Edit `.env` file:
```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/garment_production"
# Ganti PASSWORD dengan password PostgreSQL Anda!

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"
```

#### 3. Generate Database Schema
```bash
npx prisma generate
npx prisma db push
```

Output yang diharapkan:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

#### 4. Seed Initial Data
```bash
npx ts-node prisma/seed.ts
```

Output:
```
✔ Seed data created successfully
  - Admin user: admin / admin123
```

### Step 4: Test Connection
```bash
# Start backend
npm run dev
```

Jika sukses:
```
🚀 Server is running on http://localhost:3000
✅ Database connected successfully
```

---

## 🗄️ Cara 2: Import Database Backup

### Step 1: Install PostgreSQL
(Sama seperti Cara 1, Step 1)

### Step 2: Create Empty Database
```bash
psql -U postgres
CREATE DATABASE garment_production;
\q
```

### Step 3: Import Backup File

#### Jika file backup format SQL:
```bash
psql -U postgres -d garment_production -f backup.sql
```

#### Jika file backup format custom (.dump):
```bash
pg_restore -U postgres -d garment_production backup.dump
```

#### Jika file backup format tar:
```bash
pg_restore -U postgres -d garment_production -F tar backup.tar
```

### Step 4: Verify Import
```bash
psql -U postgres -d garment_production

# Check tables
\dt

# Expected output:
#  Schema |       Name            | Type  |  Owner
# --------+-----------------------+-------+----------
#  public | Customer              | table | postgres
#  public | Order                 | table | postgres
#  public | OrderItem             | table | postgres
#  public | Product               | table | postgres
#  public | ProductionProgress    | table | postgres
#  public | RejectRecord          | table | postgres
#  public | User                  | table | postgres

# Check admin user
SELECT * FROM "User";

# Keluar
\q
```

---

## 📊 Database Schema

### Tables Created:

```
User
├── id (Int)
├── username (String)
├── password (String - hashed)
├── role (ADMIN / PRODUCTION)
└── createdAt (DateTime)

Customer
├── id (Int)
├── name (String)
├── phone (String)
├── address (String)
└── createdAt (DateTime)

Product
├── id (String)
├── code (String)
├── name (String)
├── type (String)
├── color (String)
├── size (String)
└── createdAt (DateTime)

Order
├── id (Int)
├── orderNumber (String)
├── customerId (Int)
├── orderDate (DateTime)
├── deadline (DateTime)
├── status (NOT_PROCESSED / IN_PROGRESS / COMPLETE)
└── createdAt (DateTime)

OrderItem
├── id (Int)
├── orderId (Int)
├── productId (String)
├── quantity (Int)
├── currentStage (Stage enum)
└── createdAt (DateTime)

ProductionProgress
├── id (Int)
├── orderItemId (Int)
├── stage (Stage enum)
├── quantity (Int)
└── timestamp (DateTime)

RejectRecord
├── id (Int)
├── orderItemId (Int)
├── rejectedQuantity (Int)
├── reason (String)
└── timestamp (DateTime)
```

### Stage Enum:
- NOT_PROCESSED
- CUTTING
- SEWING
- QC
- FINISHING
- PACKING
- COMPLETE

---

## 🔧 Troubleshooting

### Error: "password authentication failed"
```bash
# Reset password PostgreSQL
# Buka pgAdmin → Servers → PostgreSQL → Right-click → Properties → Connection
# Update password di .env sesuai password PostgreSQL
```

### Error: "database does not exist"
```bash
# Create database manually
psql -U postgres
CREATE DATABASE garment_production;
\q
```

### Error: "Port 5432 already in use"
```bash
# PostgreSQL service tidak running
# Windows: Services → PostgreSQL → Start
# Atau restart service
```

### Error: "Prisma schema validation failed"
```bash
# Re-generate Prisma client
npx prisma generate
npx prisma db push
```

### Error: "Cannot connect to PostgreSQL"
```bash
# 1. Check PostgreSQL service running
# Services → postgresql-x64-XX → Status: Running

# 2. Check connection string di .env
# DATABASE_URL format:
# postgresql://username:password@localhost:5432/database_name

# 3. Test connection
psql -U postgres -d garment_production
```

---

## 📥 Export Database (Untuk Developer)

### Cara 1: Export Schema + Data (Full Backup)

#### Format SQL (Readable):
```bash
pg_dump -U postgres -d garment_production -f backup.sql
```

#### Format Custom (Compressed):
```bash
pg_dump -U postgres -d garment_production -F c -f backup.dump
```

#### Format Tar:
```bash
pg_dump -U postgres -d garment_production -F tar -f backup.tar
```

### Cara 2: Export Schema Only (No Data):
```bash
pg_dump -U postgres -d garment_production --schema-only -f schema.sql
```

### Cara 3: Export Data Only (No Schema):
```bash
pg_dump -U postgres -d garment_production --data-only -f data.sql
```

### Cara 4: Export Specific Tables:
```bash
pg_dump -U postgres -d garment_production -t "User" -t "Customer" -f users_customers.sql
```

---

## 📤 Cara Kirim Database ke Penguji

### Option 1: Kirim Backup File + Instructions

**File yang dikirim:**
1. `backup.sql` atau `backup.dump`
2. `DATABASE_SETUP.md` (file ini)
3. `.env.example`

**Instructions untuk penguji:**
```
1. Install PostgreSQL (lihat DATABASE_SETUP.md)
2. Create database: garment_production
3. Import backup: pg_restore -U postgres -d garment_production backup.dump
4. Copy .env.example ke .env
5. Update DATABASE_URL di .env dengan password PostgreSQL Anda
6. npm install
7. npm run dev
```

### Option 2: Docker (Advanced - Not Required)

Jika penguji familiar dengan Docker:

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: garment_production
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup.sql:/docker-entrypoint-initdb.d/backup.sql

volumes:
  postgres_data:
```

**Start:**
```bash
docker-compose up -d
```

### Option 3: Cloud Database (untuk testing online)

**Supabase (Free tier):**
1. Go to https://supabase.com
2. Create project
3. Copy connection string
4. Update .env
5. Run `npx prisma db push`

---

## 🎓 Default Credentials

Setelah seed data:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: ADMIN (full access)

**Production Account:**
- Username: `production`
- Password: `prod123`
- Role: PRODUCTION (limited access)

⚠️ **PENTING:** Ganti password ini di production!

---

## ✅ Verification Checklist

### Database Setup Complete:
- [ ] PostgreSQL installed and running
- [ ] Database `garment_production` created
- [ ] Tables created (7 tables)
- [ ] Admin user exists
- [ ] Connection string correct in .env

### Test Queries:
```sql
-- Check tables
SELECT COUNT(*) FROM "User"; -- Should be 1 (admin)
SELECT COUNT(*) FROM "Customer"; -- Should be 0 (empty)
SELECT COUNT(*) FROM "Product"; -- Should be 0 (empty)
SELECT COUNT(*) FROM "Order"; -- Should be 0 (empty)

-- Check admin
SELECT username, role FROM "User"; -- admin | ADMIN
```

### Backend Connection:
- [ ] `npm run dev` works
- [ ] No database errors
- [ ] Can login with admin/admin123
- [ ] Can create customer/product/order

---

## 📞 Support

### Common Issues:

**Q: Port 5432 already used**
A: Another PostgreSQL instance running. Stop it atau gunakan port lain.

**Q: Permission denied**
A: Run as administrator atau check user permissions.

**Q: Password wrong**
A: Reset via pgAdmin atau edit pg_hba.conf.

**Q: Tables not created**
A: Run `npx prisma db push` lagi.

### Contact:
Jika ada masalah, cek:
1. README.md
2. TROUBLESHOOTING.md
3. SECURITY.md (untuk masalah credentials)

---

## 📚 Additional Resources

**PostgreSQL Documentation:**
- Download: https://www.postgresql.org/download/
- Docs: https://www.postgresql.org/docs/

**Prisma Documentation:**
- Setup: https://www.prisma.io/docs/getting-started
- CLI: https://www.prisma.io/docs/reference/cli-reference

**Project Documentation:**
- README.md - Full documentation
- RUNNING_GUIDE.md - Quick start guide
- QUICK_GUIDE.md - Quick reference

---

**Last Updated:** 2024  
**Database Version:** PostgreSQL 15+  
**ORM:** Prisma 5.x  
**Status:** ✅ Production Ready
