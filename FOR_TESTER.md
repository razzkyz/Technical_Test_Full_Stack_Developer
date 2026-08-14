# 📦 Panduan untuk Penguji - Garment Production System

## 🎯 Setup Database - 3 Cara

### ⚡ **CARA 1: IMPORT SQL FILE (PALING MUDAH & TERCEPAT!)**

**File tersedia: `database-ready-to-import.sql`**

Ini cara paling mudah! File SQL sudah lengkap dengan schema + admin user + sample data.

#### Option A: Automatic (Double-click!)
```bash
# Windows: Double-click file ini
import-database.bat

# Masukkan password PostgreSQL saat diminta
# Done! Database siap dalam 2 menit!
```

#### Option B: Manual via Command Line
```bash
# 1. Install PostgreSQL (jika belum)
# Download: https://www.postgresql.org/download/

# 2. Create database
psql -U postgres
CREATE DATABASE garment_production;
\q

# 3. Import SQL file
cd C:\path\to\konveksitest
psql -U postgres -d garment_production -f database-ready-to-import.sql

# 4. Verify
psql -U postgres -d garment_production
\dt  # Should show 7 tables
SELECT * FROM "User";  # Should show admin user
\q
```

**Yang Anda dapat:**
- ✅ Database schema (7 tables)
- ✅ Admin user (admin/admin123)
- ✅ Sample data (3 customers, 8 products, 3 orders)
- ✅ Ready to use!

**Total time: ~3 menit** ⚡

**Setelah import, skip ke [Setup Project](#step-3-setup-project)**

---

### 🚀 **CARA 2: FRESH INSTALL (Manual Schema Generation)**

Ini cara paling mudah dan dijamin berhasil!

#### Step 1: Install PostgreSQL (5 menit)
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install dengan double-click installer
3. Saat diminta password, gunakan: **`postgres`** (ingat ini!)
4. Port: **5432** (default, jangan diganti)
5. Selesai!

#### Step 2: Create Database (1 menit)
Buka **pgAdmin 4** (sudah terinstall otomatis):
1. Login dengan password `postgres`
2. Right-click "Databases" → "Create" → "Database"
3. Nama: **`garment_production`**
4. Click "Save"

#### Step 3: Setup Project {#step-3-setup-project}
```bash
# 1. Extract project zip
# 2. Buka folder di terminal
cd C:\path\to\konveksitest

# 3. Install dependencies
npm install

# 4. Copy environment file
copy .env.example .env

# 5. Edit .env file
# Buka .env dengan notepad dan ganti:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/garment_production"
#                              ^^^^^^^^ ganti dengan password PostgreSQL Anda

# 6. Generate database schema
npx prisma generate
npx prisma db push

# 7. Seed initial data (admin user)
npx ts-node prisma/seed.ts
```

#### Step 4: Test! (1 menit)
```bash
# Backend
npm run dev
# Tunggu: "Server is running on http://localhost:3000"

# Frontend (terminal baru)
cd frontend
npm run dev
# Tunggu: "Local: http://localhost:5173/"
```

Buka browser: **http://localhost:5173**
- Login: `admin` / `admin123`
- Selesai! ✅

**Total waktu: ~10 menit**

---

### 📥 **CARA 3: IMPORT BACKUP (Jika disediakan file backup)**

Gunakan cara ini jika developer memberikan file backup database.

#### Step 1: Install PostgreSQL
(Sama seperti Cara 1, Step 1)

#### Step 2: Create Empty Database
```bash
# Buka cmd
psql -U postgres
# Input password saat diminta

# Di prompt psql:
CREATE DATABASE garment_production;

# Keluar
\q
```

#### Step 3: Import Backup

**Jika dapat file .sql:**
```bash
psql -U postgres -d garment_production -f backup.sql
```

**Jika dapat file .dump:**
```bash
pg_restore -U postgres -d garment_production backup.dump
```

#### Step 4: Setup Project
```bash
cd C:\path\to\konveksitest

# Copy and edit .env
copy .env.example .env
# Edit DATABASE_URL dengan password PostgreSQL Anda

# Install dependencies
npm install

# Test connection
npm run dev
```

---

## 🔍 Verify Setup Berhasil

### Check Database:
```bash
psql -U postgres -d garment_production

# Di prompt psql:
\dt
# Should show 7 tables: User, Customer, Product, Order, OrderItem, ProductionProgress, RejectRecord

SELECT * FROM "User";
# Should show admin user

\q
```

### Check Backend:
```bash
npm run dev
# Should show: "Server is running on http://localhost:3000"
# Should show: "Database connected successfully"
```

### Check Frontend:
```bash
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173/"
```

### Check Login:
1. Open: http://localhost:5173
2. Username: **admin**
3. Password: **admin123**
4. Should redirect to Dashboard

---

## 📊 Database Structure

### Tables yang akan dibuat:

```
User           → Admin dan production user
Customer       → Data customer
Product        → Data produk garmen
Order          → Order dari customer
OrderItem      → Item-item dalam order
ProductionProgress → Tracking progres produksi
RejectRecord   → Record barang reject saat QC
```

### Default Users setelah seed:

**Admin:**
- Username: `admin`
- Password: `admin123`
- Akses: Full (semua fitur)

**Production (optional):**
- Username: `production`
- Password: `prod123`
- Akses: Limited (hanya production tracking)

---

## 🐛 Troubleshooting

### Error: "password authentication failed"
```bash
# Solusi: Update password di .env sesuai password PostgreSQL
# Edit .env:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/garment_production"
```

### Error: "database does not exist"
```bash
# Solusi: Create database
psql -U postgres
CREATE DATABASE garment_production;
\q
```

### Error: "Port 5432 already in use"
```bash
# Solusi: PostgreSQL service belum running
# Windows: Services → PostgreSQL → Start
```

### Error: "Port 3000 already in use"
```bash
# Solusi: Backend lama masih running
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Error: "Cannot find module prisma"
```bash
# Solusi: Install dependencies
npm install
npx prisma generate
```

### Loading Forever di Frontend
```bash
# Solusi 1: Hard refresh
# Ctrl + Shift + R

# Solusi 2: Clear cache
# F12 → Console → localStorage.clear()

# Solusi 3: Check backend running
# Backend harus running di port 3000
```

---

## 📝 Testing Checklist

### ✅ Database Setup:
- [ ] PostgreSQL installed
- [ ] Database `garment_production` created
- [ ] 7 tables exist (check dengan `\dt`)
- [ ] Admin user exists (check dengan `SELECT * FROM "User"`)

### ✅ Backend:
- [ ] `npm install` sukses
- [ ] `npm run dev` berjalan tanpa error
- [ ] Server running di http://localhost:3000
- [ ] No database connection errors

### ✅ Frontend:
- [ ] `cd frontend` → `npm install` sukses
- [ ] `npm run dev` berjalan
- [ ] Frontend running di http://localhost:5173
- [ ] No CORS errors di browser console

### ✅ Functionality:
- [ ] Login works (admin/admin123)
- [ ] Dashboard shows metrics
- [ ] Can create customer
- [ ] Can create product
- [ ] Can create order
- [ ] Search works on all pages
- [ ] Quick actions on dashboard work

---

## 🎨 Fitur yang Harus Ditest

### 1. Authentication
- [ ] Login dengan admin/admin123
- [ ] Logout works
- [ ] Protected routes (tidak bisa akses tanpa login)

### 2. Customer Management
- [ ] Create customer
- [ ] Edit customer
- [ ] Delete customer
- [ ] Search customer by name
- [ ] Pagination works

### 3. Product Management
- [ ] Create product (perhatikan field ID wajib diisi!)
- [ ] Edit product
- [ ] Delete product
- [ ] Search product (by name, code, type)
- [ ] Pagination works

### 4. Order Management
- [ ] Create order (bisa multiple items)
- [ ] View order detail
- [ ] Search order by number
- [ ] Filter by status
- [ ] Late order indicator (red badge)

### 5. Production Tracking
- [ ] View running orders
- [ ] Search by order number or customer
- [ ] Filter by stage
- [ ] Update production progress
- [ ] Move quantity to next stage
- [ ] QC process (passed/rejected)

### 6. UI/UX Features (NEW!)
- [ ] Dashboard quick actions (5 buttons)
- [ ] Enhanced search boxes (large, gradient)
- [ ] Clear button (X) on search
- [ ] Result counters
- [ ] Reset filters button
- [ ] Hover animations
- [ ] Mobile responsive

---

## 📚 Documentation Files

Untuk referensi lengkap, baca file-file ini:

1. **README.md** - Full documentation, feature list
2. **DATABASE_SETUP.md** - Detailed database setup
3. **RUNNING_GUIDE.md** - Quick start guide
4. **QUICK_GUIDE.md** - Quick reference card
5. **WHATS_NEW.md** - UI improvements summary
6. **UI_ENHANCEMENTS.md** - Technical UI details
7. **FINAL_CHECKLIST.md** - Project completion status
8. **SECURITY.md** - Security notes
9. **FOR_TESTER.md** - This file

---

## 💡 Testing Tips

### Efficient Testing Flow:
1. **Start:** Login → Dashboard
2. **Setup Data:** 
   - Create 2-3 customers (via quick action)
   - Create 5-10 products (various types)
3. **Create Orders:**
   - Create order dengan multiple items
   - Set deadline besok (untuk test late indicator)
   - Set deadline kemarin (untuk test late alert)
4. **Production:**
   - Go to Production → Running Orders
   - Update progress beberapa items
   - Test QC process
5. **Search & Filter:**
   - Test search di semua pages
   - Test filters
   - Test reset buttons

### Common Test Scenarios:

**Scenario 1: Normal Order Flow**
1. Create customer "PT Jaya"
2. Create product "Kaos Hitam L"
3. Create order: 100 pcs Kaos Hitam
4. Go to Production → Start production
5. Move 50 pcs to Cutting
6. Move 50 pcs to Sewing
7. Move to QC → 48 passed, 2 rejected
8. Complete order

**Scenario 2: Late Order**
1. Create order dengan deadline kemarin
2. Check dashboard → Late Orders count increases
3. Check order list → Red badge "LATE"
4. Check production → Red animated warning

**Scenario 3: Search & Filter**
1. Create 10+ products
2. Search by name, code, type
3. Create multiple orders
4. Filter by status
5. Test reset filters

---

## 📞 Contact & Support

### Jika ada masalah:

1. **Check documentation** di folder project
2. **Check troubleshooting** section di atas
3. **Check browser console** untuk errors (F12)
4. **Check backend terminal** untuk error logs

### Common Errors & Solutions:

| Error | Solution |
|-------|----------|
| Cannot connect database | Check PostgreSQL running & .env correct |
| Port already in use | Kill process: `taskkill /F /PID <PID>` |
| Login failed | Run seed: `npx ts-node prisma/seed.ts` |
| CORS error | Check CORS_ORIGIN in .env = http://localhost:5173 |
| Loading forever | Hard refresh: Ctrl+Shift+R |

---

## ✅ Expected Results

Setelah setup selesai:

### Backend (http://localhost:3000)
```
✅ Server is running on http://localhost:3000
✅ Database connected successfully
✅ CORS enabled for: http://localhost:5173
```

### Frontend (http://localhost:5173)
```
✅ Login page with gradient background
✅ Dashboard with 5 quick action buttons
✅ Animated metric cards
✅ Large gradient search boxes on all list pages
✅ Smooth hover effects and transitions
```

### Functionality
```
✅ Authentication works
✅ All CRUD operations work
✅ Search works everywhere
✅ Filters work with reset
✅ Production tracking works
✅ QC process works
✅ Late order detection works
```

---

## 🎉 Ready to Test!

**Setup Time:** ~10-15 menit  
**Testing Time:** ~30-60 menit untuk full test  
**Difficulty:** ⭐⭐ (Easy with this guide!)

**Good luck testing!** 🚀

Jika ada pertanyaan, cek documentation files yang disediakan.

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Tested On:** Windows 10/11, PostgreSQL 15+, Node.js 18+
