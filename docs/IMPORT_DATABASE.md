# 📥 IMPORT DATABASE - Super Mudah!

## 🎯 File yang Tersedia

```
database-ready-to-import.sql  ← GUNAKAN FILE INI! (Recommended)
```

File ini sudah lengkap dengan:
- ✅ Schema database (7 tables)
- ✅ Admin user (username: admin, password: admin123)
- ✅ Sample data (3 customers, 8 products, 3 orders) - Optional

---

## 🚀 CARA 1: Import via Command Line (Tercepat!)

### Step 1: Install PostgreSQL
Download: https://www.postgresql.org/download/windows/
- Versi: 15 atau 17
- Password: Ingat password ini! (contoh: `postgres`)
- Port: 5432 (default)

### Step 2: Create Database
```bash
# Buka cmd/PowerShell
psql -U postgres
```

Masukkan password, lalu:
```sql
CREATE DATABASE garment_production;
\q
```

### Step 3: Import File SQL
```bash
cd C:\path\to\konveksitest

psql -U postgres -d garment_production -f database-ready-to-import.sql
```

Masukkan password, tunggu selesai.

### Step 4: Verify
```bash
psql -U postgres -d garment_production
```

Check:
```sql
-- Should show 7 tables
\dt

-- Should show 1 admin user
SELECT * FROM "User";

-- Should show 3 customers (sample data)
SELECT * FROM "Customer";

-- Keluar
\q
```

**Done! ✅ Total time: ~5 menit**

---

## 🖱️ CARA 2: Import via pgAdmin (GUI - Mudah!)

### Step 1: Buka pgAdmin
1. Start Menu → pgAdmin 4
2. Login dengan password PostgreSQL

### Step 2: Create Database
1. Right-click "Databases"
2. Create → Database
3. Name: `garment_production`
4. Click "Save"

### Step 3: Open Query Tool
1. Click database "garment_production"
2. Tools → Query Tool (atau F5)

### Step 4: Load & Execute SQL
1. Click folder icon "Open File"
2. Select: `database-ready-to-import.sql`
3. Click "Execute" (▶️ button atau F5)
4. Wait... Done!

### Step 5: Verify
1. Refresh database
2. Expand "Schemas" → "public" → "Tables"
3. Should see 7 tables:
   - Customer
   - Order
   - OrderItem
   - Product
   - ProductionProgress
   - RejectRecord
   - User

**Done! ✅ Total time: ~5 menit**

---

## 🗂️ Database Structure Created

### Tables (7):
```
User                 → Admin & production users
Customer             → Customer data
Product              → Product catalog
Order                → Customer orders
OrderItem            → Items in orders
ProductionProgress   → Production tracking
RejectRecord         → QC reject records
```

### Sample Data Included:

#### Users (1):
```
Username: admin
Password: admin123
Role: ADMIN
```

#### Customers (3):
```
1. PT Garuda Indonesia (Jakarta)
2. CV Jaya Abadi (Bandung)
3. Toko Busana Modern (Surabaya)
```

#### Products (8):
```
1. Kaos Polos Katun - Hitam L (KS-001)
2. Kaos Polos Katun - Putih XL (KS-002)
3. Kaos Polos Katun - Merah M (KS-003)
4. Kemeja Lengan Panjang - Biru L (KM-001)
5. Kemeja Lengan Pendek - Putih M (KM-002)
6. Celana Panjang Kain - Hitam 32 (CL-001)
7. Celana Pendek Casual - Abu-abu 30 (CL-002)
8. Jaket Bomber - Hitam L (JK-001)
```

#### Orders (3):
```
1. ORD-20240101 - PT Garuda (2 items, 150 pcs)
2. ORD-20240102 - CV Jaya Abadi (2 items, 155 pcs)
3. ORD-20240103 - Toko Busana (1 item, 200 pcs)
```

---

## ⚙️ Setup Project After Import

### Step 1: Configure Environment
```bash
cd C:\path\to\konveksitest

# Copy environment template
copy .env.example .env
```

Edit `.env` file (Notepad):
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/garment_production"
#                              ^^^^^^^^^^^^ GANTI dengan password PostgreSQL Anda

JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### Step 2: Install Dependencies
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Start Servers

**Backend:**
```bash
npm run dev
```
Wait for: `🚀 Server is running on http://localhost:3000`

**Frontend (new terminal):**
```bash
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Step 5: Test Login
1. Open: http://localhost:5173
2. Username: **admin**
3. Password: **admin123**
4. Should see Dashboard

**Done! ✅ Ready to use!**

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
```bash
# Solusi: Database kosong, import ulang
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Error: "password authentication failed"
```bash
# Solusi: Update .env dengan password PostgreSQL yang benar
# Edit .env:
DATABASE_URL="postgresql://postgres:CORRECT_PASSWORD@localhost:5432/garment_production"
```

### Error: "database already exists"
```bash
# Solusi 1: Drop dulu (HATI-HATI! Data akan hilang)
psql -U postgres
DROP DATABASE garment_production;
CREATE DATABASE garment_production;
\q

# Then import again
psql -U postgres -d garment_production -f database-ready-to-import.sql

# Solusi 2: Import ke database yang sudah ada (akan replace data)
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Error: "cannot find module bcrypt"
```bash
# Solusi: Install dependencies
npm install
```

### Error: "Prisma Client not generated"
```bash
# Solusi: Generate Prisma Client
npx prisma generate
```

### Login Failed
```bash
# Cek admin user ada
psql -U postgres -d garment_production
SELECT * FROM "User";
# Should show admin user

# Jika tidak ada, import ulang
\q
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

---

## ✅ Verification Checklist

### Database Import Success:
- [ ] 7 tables created
- [ ] 1 admin user exists
- [ ] 3 customers exist (sample)
- [ ] 8 products exist (sample)
- [ ] 3 orders exist (sample)

### Verify Commands:
```sql
-- Connect to database
psql -U postgres -d garment_production

-- Check tables (should be 7)
\dt

-- Check counts
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Customers', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Products', COUNT(*) FROM "Product"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Order"
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM "OrderItem";

-- Expected output:
--  table_name | count
-- ------------+-------
--  Users      |     1
--  Customers  |     3
--  Products   |     8
--  Orders     |     3
--  OrderItems |     5

-- Check admin
SELECT username, role FROM "User";

-- Exit
\q
```

### Project Setup Success:
- [ ] `.env` configured with correct password
- [ ] `npm install` completed
- [ ] `npx prisma generate` completed
- [ ] Backend starts: `npm run dev`
- [ ] Frontend starts: `cd frontend && npm run dev`
- [ ] Login works: admin / admin123

---

## 📊 What You Get

### Empty Database:
If you want clean database without sample data:
1. Use file: `database-schema-only.sql` (if provided)
2. OR delete sample data after import:
```sql
DELETE FROM "ProductionProgress";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product";
DELETE FROM "Customer";
-- Keep User table (admin remains)
```

### Full Database:
Using `database-ready-to-import.sql` gives you:
- Complete schema
- Admin user for login
- Sample customers, products, orders for testing

**Recommended:** Use full database untuk immediate testing!

---

## 🎓 Pro Tips

### Tip 1: Backup Before Import
```bash
# If you have existing data
pg_dump -U postgres -d garment_production -f backup-before-import.sql
```

### Tip 2: Reset Database
```bash
# Drop all tables and recreate
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Tip 3: Check Import Logs
During import, watch for:
- ✅ "CREATE TABLE" for each table
- ✅ "INSERT" for data
- ✅ "CREATE INDEX" for indexes
- ❌ Any "ERROR" messages

### Tip 4: pgAdmin Refresh
After import in pgAdmin:
- Right-click database → Refresh
- Expand Tables to see all 7 tables

---

## 📞 Need Help?

### Check These Files:
1. `FOR_TESTER.md` - Complete testing guide
2. `DATABASE_SETUP.md` - Detailed database setup
3. `README.md` - Full documentation
4. `QUICK_GUIDE.md` - Quick reference

### Common Issues:
| Issue | File to Check |
|-------|---------------|
| Import fails | DATABASE_SETUP.md |
| Login fails | SECURITY.md |
| Connection fails | .env configuration |
| Port issues | RUNNING_GUIDE.md |

---

## 🎉 Success!

After successful import:
1. ✅ Database ready
2. ✅ Admin user ready
3. ✅ Sample data ready (optional)
4. ✅ Ready to start testing!

**Next Steps:**
1. Setup `.env` file
2. `npm install`
3. `npx prisma generate`
4. `npm run dev`
5. Login & test!

**Total Setup Time: ~15 minutes** ⚡

---

**Last Updated:** 2024  
**Database:** PostgreSQL 15+  
**Status:** ✅ Ready to Import!
