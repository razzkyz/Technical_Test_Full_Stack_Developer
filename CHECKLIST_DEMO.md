# ✅ Checklist Demo Hari Ini

## 🎯 Current Status

```
✅ JWT_SECRET: Set (2 jam expiry)
✅ Supabase Project: Ready (mxlsesmnzmvvdgvzgfaj)
✅ Anon Key: Set
✅ .env: Configured (tinggal isi password Supabase)
✅ Database SQL: Ready (database-ready-to-import.sql)
✅ Documentation: Complete
```

---

## 📋 TODO List (30 Menit)

### ☐ Step 1: Get Supabase Password (2 min)

1. Go to: https://supabase.com/dashboard
2. Login
3. Select project: **mxlsesmnzmvvdgvzgfaj**
4. Settings (⚙️) → Database
5. **Database Password** - Copy password!

---

### ☐ Step 2: Update .env Password (1 min)

Edit `.env` file, cari baris ini:

```env
DATABASE_URL="postgresql://postgres.mxlsesmnzmvvdgvzgfaj:[YOUR-SUPABASE-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Ganti `[YOUR-SUPABASE-PASSWORD]` dengan password dari Step 1.

Dan juga di:
```env
DIRECT_URL="postgresql://postgres.mxlsesmnzmvvdgvzgfaj:[YOUR-SUPABASE-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

### ☐ Step 3: Import Database ke Supabase (7 min)

1. Supabase Dashboard → **SQL Editor** (di sidebar kiri)
2. Click "**New query**"
3. Buka file: `database-ready-to-import.sql`
4. **Copy semua isi file** (Ctrl+A, Ctrl+C)
5. **Paste** ke SQL Editor (Ctrl+V)
6. Click "**Run**" (▶️ button) atau tekan **Ctrl+Enter**
7. Wait 5-10 detik...
8. Should show: **Success. No rows returned**

**Verify:**
- Supabase → **Table Editor** (sidebar)
- Should see **7 tables**:
  - User
  - Customer
  - Product
  - Order
  - OrderItem
  - ProductionProgress
  - RejectRecord

---

### ☐ Step 4: Test Connection Locally (3 min)

```bash
# Di folder root project
cd C:\Freelance\konveksitest

# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db pull
```

**Expected output:**
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public"
Introspecting based on database...
✔ Introspected 7 models
```

Jika sukses: **Connection OK!** ✅

---

### ☐ Step 5: Start Backend (2 min)

```bash
# Make sure di root folder
npm run dev
```

**Expected output:**
```
🚀 Server is running on http://localhost:3000
✅ Database connected successfully
```

**Jika ada error "Port 3000 in use":**
```bash
netstat -ano | findstr :3000
taskkill /F /PID <PID_NUMBER>
npm run dev
```

---

### ☐ Step 6: Fix Frontend Build (Optional, 3 min)

```bash
cd frontend

# Clear cache
rmdir /s /q dist
rmdir /s /q node_modules\.vite

# Build
npm run build
```

Jika sukses, lanjut step 7.
Jika error, cek duplicate imports di `App.tsx`

---

### ☐ Step 7: Start Frontend (2 min)

```bash
# Di folder frontend
cd C:\Freelance\konveksitest\frontend

npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### ☐ Step 8: Test Login (1 min)

1. Open browser: **http://localhost:5173**
2. Should see **Login page** dengan gradient background
3. Enter credentials:
   - Username: **admin**
   - Password: **admin123**
4. Click **Login**
5. Should redirect to **Dashboard** ✅

**Test quick:**
- ✅ Dashboard loads
- ✅ Click "Tambah Customer" button
- ✅ Create a test customer
- ✅ Search works

---

### ☐ Step 9: Deploy to Railway (Optional, 10 min)

**Jika mau deploy online:**

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. Railway.app:
   - New Project → Deploy from GitHub
   - Select repo: `konveksitest`
   - Add Environment Variables:
     ```
     DATABASE_URL=[copy from .env]
     JWT_SECRET=oEeqTPswv5c+VXxcX7bJOaquED3DNk+y38TeTyXVOrOrvQI2dM8SqA8IK235zcM/Wjwy+xbQl9k1TOljs6Rg==
     JWT_EXPIRES_IN=2h
     PORT=3000
     NODE_ENV=production
     CORS_ORIGIN=*
     ```
   - Deploy!
   - Copy public URL: `https://xxx.up.railway.app`

3. Vercel:
   - Import GitHub repo
   - Root directory: `frontend`
   - Add env: `VITE_API_URL=https://xxx.up.railway.app/api`
   - Deploy!

---

### ☐ Step 10: Prepare Demo (1 min)

**URLs:**
```
Local Frontend:  http://localhost:5173
Local Backend:   http://localhost:3000
Database:        Supabase (cloud)

Login:
  Username: admin
  Password: admin123
```

**Demo Flow:**
1. Login ✅
2. Dashboard → Show metrics & quick actions
3. Create Customer → Show search
4. Create Product → Show enhanced search
5. Create Order → Multi-item form
6. Production → Show tracking & QC

**Talk Points:**
- ✅ Modern UI with gradient design
- ✅ Enhanced search everywhere
- ✅ Production-ready (Supabase database)
- ✅ Real-time tracking
- ✅ Easy to scale

---

## 🎯 Quick Reference

### Supabase Info
```
Project: mxlsesmnzmvvdgvzgfaj
Region: Singapore
URL: https://mxlsesmnzmvvdgvzgfaj.supabase.co
```

### JWT Config
```
Secret: oEeqTPswv5c+VXxcX7bJOaquED3DNk+y38TeTyXVOrOrvQI2dM8SqA8IK235zcM/Wjwy+xbQl9k1TOljs6Rg==
Expiry: 2 hours
```

### Default Login
```
Username: admin
Password: admin123
```

---

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check password benar di .env
# Try connection manual:
psql "postgresql://postgres.mxlsesmnzmvvdgvzgfaj:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Frontend build error
```bash
# Check App.tsx for duplicate imports
# Clear cache: rmdir /s /q dist
# Rebuild: npm run build
```

### Port in use
```bash
# Backend:
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Frontend:
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

---

## ⏰ Time Tracking

| Step | Estimated | Status |
|------|-----------|--------|
| 1. Get password | 2 min | ☐ |
| 2. Update .env | 1 min | ☐ |
| 3. Import database | 7 min | ☐ |
| 4. Test connection | 3 min | ☐ |
| 5. Start backend | 2 min | ☐ |
| 6. Fix build (optional) | 3 min | ☐ |
| 7. Start frontend | 2 min | ☐ |
| 8. Test login | 1 min | ☐ |
| 9. Deploy (optional) | 10 min | ☐ |
| 10. Prepare demo | 1 min | ☐ |
| **TOTAL** | **30 min** | |

---

## ✅ Success Criteria

**Backend Ready:**
- [x] Server running on port 3000
- [x] Database connected message
- [x] No errors in console

**Frontend Ready:**
- [x] Frontend running on port 5173
- [x] Login page loads
- [x] Can login successfully
- [x] Dashboard shows

**Demo Ready:**
- [x] Can create customer
- [x] Can create product
- [x] Can create order
- [x] Search works everywhere
- [x] UI looks modern & professional

---

## 🎉 Ready untuk Demo!

**Setelah semua checklist ✅:**

1. Open: http://localhost:5173
2. Login: admin / admin123
3. Show features to HRD
4. Enjoy! 🚀

**Estimated Total Time: 30 minutes**

**Good luck!** 🎉
