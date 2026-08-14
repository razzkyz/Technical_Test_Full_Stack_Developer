# 📁 Database Files - Mana yang Harus Dipakai?

## 🎯 Quick Answer

**Untuk Penguji: Gunakan file ini** 👇

```
database-ready-to-import.sql  ← PAKAI INI!
import-database.bat           ← atau double-click ini (Windows)
```

**Simple:**
1. Double-click `import-database.bat`
2. Masukkan password PostgreSQL
3. Done! 🎉

---

## 📚 Semua File Database

### 1. `database-ready-to-import.sql` ⭐ **RECOMMENDED**

**Untuk siapa:** Penguji / User yang mau langsung pakai

**Isi:**
- ✅ Database schema lengkap (7 tables)
- ✅ Admin user dengan password hash yang benar
- ✅ Sample data (customers, products, orders)
- ✅ Indexes untuk performance

**Cara pakai:**
```bash
# Option A: Automatic
import-database.bat

# Option B: Manual
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

**Hasil:**
- Database siap pakai
- Login: admin / admin123
- Ada 3 customers, 8 products, 3 orders untuk testing

**File size:** ~10-15 KB

---

### 2. `import-database.bat` ⚡ **EASIEST**

**Untuk siapa:** Windows users yang mau cara termudah

**Isi:**
- Script otomatis import database
- Create database
- Import SQL file
- Verify hasil

**Cara pakai:**
```bash
# Double-click file ini di Windows Explorer
# Atau run dari cmd:
import-database.bat
```

**Yang dilakukan:**
1. Check PostgreSQL installed
2. Create database `garment_production`
3. Import `database-ready-to-import.sql`
4. Verify tables & admin user
5. Show next steps

**Time:** ~2 menit

---

### 3. `database-complete.sql` 🔧 **TEMPLATE**

**Untuk siapa:** Developer (bukan untuk penguji)

**Isi:**
- Schema + seed data
- Password placeholder (needs replacement)

**NOTE:** Jangan pakai file ini! File ini hanya template.
Gunakan `database-ready-to-import.sql` yang sudah siap.

---

### 4. `prisma/schema.prisma` 📐 **SCHEMA DEFINITION**

**Untuk siapa:** Developer yang pakai Prisma ORM

**Isi:**
- Database schema dalam Prisma format
- Model definitions
- Relations

**Cara pakai:**
```bash
npx prisma generate
npx prisma db push
```

**Kapan pakai:**
- Fresh install tanpa SQL file
- Development mode
- Schema changes

---

### 5. `prisma/seed.ts` 🌱 **SEEDER SCRIPT**

**Untuk siapa:** Developer yang pakai Prisma

**Isi:**
- TypeScript script untuk seed data
- Create admin user dengan bcrypt
- Optional sample data

**Cara pakai:**
```bash
npx ts-node prisma/seed.ts
```

**Kapan pakai:**
- Setelah `npx prisma db push`
- Reset data
- Development

---

### 6. `export-database.bat` 📤 **EXPORT TOOL**

**Untuk siapa:** Developer yang mau backup/export database

**Isi:**
- Script untuk export database
- Creates multiple backup formats

**Cara pakai:**
```bash
export-database.bat
```

**Output:**
- `database-backup/backup_TIMESTAMP.sql`
- `database-backup/backup_TIMESTAMP.dump`
- `database-backup/schema_TIMESTAMP.sql`

---

## 🎯 Pilih Berdasarkan Kebutuhan

### Saya Penguji, Mau Setup Cepat
**Gunakan:** `import-database.bat` atau `database-ready-to-import.sql`
```bash
# Windows: Double-click
import-database.bat

# Manual:
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Saya Developer, Mau Setup dari Prisma
**Gunakan:** `prisma/schema.prisma` + `prisma/seed.ts`
```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### Saya Mau Export Database
**Gunakan:** `export-database.bat`
```bash
export-database.bat
```

### Saya Mau Clean Database (No Sample Data)
**Gunakan:** `database-ready-to-import.sql` lalu delete sample data
```sql
-- After import:
DELETE FROM "ProductionProgress";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product";
DELETE FROM "Customer";
-- Admin user tetap ada
```

---

## 📊 Comparison

| File | Method | Time | Data | Best For |
|------|--------|------|------|----------|
| `import-database.bat` | Automatic | 2 min | Full | Penguji (Windows) |
| `database-ready-to-import.sql` | SQL Import | 3 min | Full | Penguji (All OS) |
| `schema.prisma` + `seed.ts` | Prisma | 5 min | Full | Developer |
| `export-database.bat` | Export | 1 min | Backup | Developer |

---

## 🚀 Recommended Workflow

### Untuk Penguji:

**Step 1: Import Database**
```bash
import-database.bat
# atau
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

**Step 2: Setup Project**
```bash
copy .env.example .env
# Edit .env dengan password database
npm install
npx prisma generate
```

**Step 3: Start**
```bash
npm run dev
cd frontend && npm run dev
```

**Done! ✅**

---

### Untuk Developer:

**Development Mode:**
```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

**Export for Tester:**
```bash
export-database.bat
# Kirim: database-backup/backup.sql
```

**Schema Changes:**
```bash
# Edit prisma/schema.prisma
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## 🐛 Troubleshooting

### Error: "cannot execute binary file"
**Problem:** Trying to import .bat file on Linux/Mac
**Solution:** Use SQL file directly
```bash
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Error: "relation already exists"
**Problem:** Tables already exist
**Solution:** Drop database first
```bash
psql -U postgres
DROP DATABASE garment_production;
CREATE DATABASE garment_production;
\q
psql -U postgres -d garment_production -f database-ready-to-import.sql
```

### Error: "password authentication failed"
**Problem:** Wrong password in .env
**Solution:** Check password correct
```env
DATABASE_URL="postgresql://postgres:CORRECT_PASSWORD@localhost:5432/garment_production"
```

---

## 📝 What Each File Creates

### Database Structure:

```sql
-- Tables (7)
User                    -- Admin & production users
Customer                -- Customer data
Product                 -- Product catalog
Order                   -- Customer orders
OrderItem               -- Order line items
ProductionProgress      -- Production tracking
RejectRecord            -- QC reject records

-- Indexes (8)
idx_order_customer      -- Fast customer lookup
idx_order_status        -- Fast status filter
idx_order_deadline      -- Fast deadline sort
idx_orderitem_order     -- Fast order items
idx_orderitem_product   -- Fast product lookup
idx_orderitem_stage     -- Fast stage filter
idx_production_orderitem -- Fast progress lookup
idx_reject_orderitem    -- Fast reject lookup

-- Data
1 admin user
3 sample customers
8 sample products
3 sample orders
5 sample order items
```

---

## ✅ Verification

### After Import, Check:

```bash
psql -U postgres -d garment_production

-- Tables count
\dt
-- Should show 7 tables

-- Data count
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Customer") as customers,
  (SELECT COUNT(*) FROM "Product") as products,
  (SELECT COUNT(*) FROM "Order") as orders,
  (SELECT COUNT(*) FROM "OrderItem") as order_items;
  
-- Expected:
-- users: 1
-- customers: 3
-- products: 8
-- orders: 3
-- order_items: 5

-- Admin check
SELECT username, role FROM "User";
-- Should show: admin | ADMIN

\q
```

---

## 🎉 Summary

**For Testing (Quickest):**
```
1. import-database.bat          ← Double-click
2. Setup .env
3. npm install
4. npm run dev
```

**For Development:**
```
1. npx prisma db push
2. npx ts-node prisma/seed.ts
3. npm run dev
```

**For Export:**
```
1. export-database.bat
2. Send backup files
```

---

**Last Updated:** 2024  
**Files Version:** 1.0  
**Status:** ✅ Ready to Use
