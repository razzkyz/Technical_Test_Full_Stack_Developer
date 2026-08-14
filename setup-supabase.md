# 🚀 Setup Supabase - Quick Guide

## Step 1: Get Supabase Password

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: **mxlsesmnzmvvdgvzgfaj**
3. Settings (⚙️) → Database
4. **Database Password** - Copy password Anda

## Step 2: Update .env File

Edit file `.env` dan ganti `[YOUR-SUPABASE-PASSWORD]`:

```env
DATABASE_URL="postgresql://postgres.mxlsesmnzmvvdgvzgfaj:YOUR_PASSWORD_HERE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.mxlsesmnzmvvdgvzgfaj:YOUR_PASSWORD_HERE@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## Step 3: Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output ke `JWT_SECRET` di `.env`

## Step 4: Import Database ke Supabase

### Option A: Via Supabase SQL Editor (RECOMMENDED)

1. Buka Supabase Dashboard
2. Klik "SQL Editor" di sidebar
3. Click "New query"
4. Copy paste isi file: `database-ready-to-import.sql`
5. Click "Run" (▶️) atau Ctrl+Enter
6. Wait... Done! ✅

### Option B: Via Command Line

```bash
# Install psql if needed, then:
psql "postgresql://postgres.mxlsesmnzmvvdgvzgfaj:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f database-ready-to-import.sql
```

## Step 5: Verify Database

1. Supabase → Table Editor
2. Should see 7 tables:
   - User
   - Customer  
   - Product
   - Order
   - OrderItem
   - ProductionProgress
   - RejectRecord

3. Click table "User" → Should see admin user

## Step 6: Test Connection Locally

```bash
# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db pull

# Should show: "Introspected 7 models..."

# Start backend
npm run dev
```

Should show:
```
🚀 Server is running on http://localhost:3000
✅ Database connected successfully
```

## Step 7: Test Login

```bash
# Start frontend
cd frontend
npm run dev
```

Open http://localhost:5173
- Username: **admin**
- Password: **admin123**

Should login successfully! ✅

## Troubleshooting

### Error: "password authentication failed"
- Check password benar di `.env`
- Get password dari Supabase Dashboard → Settings → Database

### Error: "Connection timeout"
- Check internet connection
- Try DIRECT_URL instead of DATABASE_URL

### Error: "Too many connections"
- Pastikan pakai pooler (port 6543)
- Check `?pgbouncer=true&connection_limit=1` di connection string

---

## Next: Deploy ke Production

Setelah database di Supabase ready:

1. **Deploy Backend** → Railway/Render
2. **Deploy Frontend** → Vercel/Netlify
3. **Update CORS_ORIGIN** di .env production

See `DEPLOY_SUPABASE.md` untuk panduan lengkap deploy!

---

**Total Setup Time: ~10 menit** ⚡
