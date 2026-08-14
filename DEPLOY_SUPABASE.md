# 🚀 Deploy dengan Supabase - Panduan Lengkap

## ✅ Apakah Supabase Aman?

**YA, Supabase AMAN untuk production!** ✅

### Keuntungan Supabase:
- ✅ **PostgreSQL managed** - Database production-ready
- ✅ **Free tier generous** - 500 MB storage, unlimited API requests
- ✅ **Automatic backups** - Daily backups included
- ✅ **SSL/TLS encryption** - Koneksi aman by default
- ✅ **Row Level Security** - Database security features
- ✅ **Fast setup** - 5 menit siap deploy
- ✅ **No server maintenance** - Fully managed
- ✅ **Global CDN** - Fast worldwide access

### Yang Perlu Diperhatikan:
- ⚠️ **Connection string exposed** - Harus secure di .env
- ⚠️ **API keys** - Jangan commit ke git
- ⚠️ **Direct database access** - Pastikan RLS aktif (optional untuk app ini)
- ⚠️ **Free tier limits** - Monitoring usage penting

---

## 🎯 Setup Supabase (5 Menit)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Login (gratis!)
3. Click "New Project"
4. Fill:
   - **Name:** garment-production
   - **Database Password:** Buat password kuat! (save ini!)
   - **Region:** Singapore / Tokyo (terdekat Indonesia)
   - **Pricing Plan:** Free
5. Click "Create new project"
6. **Wait 2-3 menit** (setup database)

### Step 2: Get Connection String

1. Di Supabase dashboard, click project
2. Settings (⚙️) → Database
3. Scroll ke "Connection string"
4. Copy **Connection string** mode: **URI**

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Step 3: Setup Database Schema

#### Option A: Via SQL Editor (Recommended)

1. Di Supabase dashboard → SQL Editor
2. Click "New query"
3. Copy paste isi file: `database-ready-to-import.sql`
4. Click "Run" (atau Ctrl+Enter)
5. Wait... Done! ✅

#### Option B: Via psql (Command Line)

```bash
# Download connection string dari Supabase
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" -f database-ready-to-import.sql
```

### Step 4: Verify Tables Created

1. Di Supabase → Table Editor
2. Should see 7 tables:
   - User
   - Customer
   - Product
   - Order
   - OrderItem
   - ProductionProgress
   - RejectRecord

---

## ⚙️ Configure Project

### Update .env File

```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true"

# Direct connection (untuk migrations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# JWT Secret (generate baru!)
JWT_SECRET="supabase-production-secret-key-change-this-to-random-32-chars"

# Server
PORT=3000
NODE_ENV=production

# CORS - Update sesuai frontend URL
CORS_ORIGIN="https://your-frontend-url.vercel.app"
```

**PENTING:**
- Ganti `[YOUR-PASSWORD]` dengan password Supabase
- Ganti `db.xxx.supabase.co` dengan host Supabase Anda
- Generate JWT_SECRET baru (jangan pakai default!)

### Generate JWT Secret Baru

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy output ke JWT_SECRET di .env

---

## 🧪 Test Connection

### Test Locally First

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Test connection
npx prisma db pull

# Should show: "Introspecting based on database..."
# If success: Connection OK! ✅
```

### Run Backend Locally with Supabase DB

```bash
npm run dev
```

Should show:
```
🚀 Server is running on http://localhost:3000
✅ Database connected successfully
```

### Test Login

1. Start frontend: `cd frontend && npm run dev`
2. Open: http://localhost:5173
3. Login: admin / admin123
4. Should work! ✅

---

## 🚀 Deploy Backend

### Option 1: Railway (Recommended for Node.js)

**Why Railway:**
- ✅ Easy deployment
- ✅ Free tier ($5 credit/month)
- ✅ Auto SSL
- ✅ Environment variables built-in

**Steps:**

1. Go to https://railway.app
2. Sign up / Login (GitHub recommended)
3. New Project → Deploy from GitHub
4. Select your repo
5. Add service → Node.js
6. Set environment variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true
   JWT_SECRET=your-generated-secret
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
7. Deploy!
8. Copy public URL (e.g., `https://garment-production.up.railway.app`)

---

### Option 2: Render

**Steps:**

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
5. Add environment variables (same as Railway)
6. Create Web Service
7. Wait deployment...
8. Copy public URL

---

### Option 3: Vercel (untuk Serverless)

**Note:** Vercel lebih cocok untuk frontend. Backend butuh always-on server.

**Alternative:** Deploy backend di Railway/Render, frontend di Vercel.

---

## 🌐 Deploy Frontend

### Option 1: Vercel (Recommended)

1. Go to https://vercel.com
2. Import Git repository
3. Framework: Vite
4. Root directory: `frontend`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
8. Deploy!

### Option 2: Netlify

1. Go to https://netlify.com
2. New site from Git
3. Base directory: `frontend`
4. Build command: `npm run build`
5. Publish directory: `frontend/dist`
6. Environment:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
7. Deploy!

---

## 🔒 Security Checklist

### ✅ Database Security:

- [ ] **Strong password** - Minimal 16 karakter, random
- [ ] **Connection string** - Tidak di-commit ke git (.env di .gitignore)
- [ ] **SSL mode** - Pastikan `?ssl=true` atau `?sslmode=require`
- [ ] **Rotate password** - Ganti password berkala
- [ ] **Backup enabled** - Supabase auto backup daily

### ✅ Application Security:

- [ ] **JWT_SECRET** - Generate random, tidak hardcode
- [ ] **CORS** - Restrict ke domain frontend only
- [ ] **Rate limiting** - Add di production (optional)
- [ ] **Input validation** - Sudah ada di controllers
- [ ] **Password hashing** - Sudah pakai bcrypt ✅

### ✅ Deployment Security:

- [ ] **HTTPS only** - Railway/Vercel auto SSL ✅
- [ ] **Environment variables** - Store di platform, bukan di code
- [ ] **Secrets management** - Jangan print di logs
- [ ] **Error messages** - Jangan expose stack trace di production

---

## 🔐 Row Level Security (Optional tapi Recommended)

Supabase support RLS untuk extra security.

### Enable RLS:

```sql
-- Run di Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductionProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RejectRecord" ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all for authenticated backend service
-- (Karena app kita pakai backend API, bukan direct Supabase client)
CREATE POLICY "Allow backend service" ON "User" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "Customer" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "Product" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "Order" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "OrderItem" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "ProductionProgress" FOR ALL USING (true);
CREATE POLICY "Allow backend service" ON "RejectRecord" FOR ALL USING (true);
```

**Note:** RLS optional karena app ini pakai backend API, bukan direct database access dari frontend.

---

## 📊 Monitoring & Maintenance

### Supabase Dashboard

Monitor di Supabase:
- **Database** → Check storage usage
- **Database** → Check table rows
- **Reports** → API requests
- **Logs** → Database logs

### Free Tier Limits:

- Storage: 500 MB
- Bandwidth: 2 GB/month
- API requests: Unlimited

**Monitor usage** untuk pastikan tidak exceed!

### Backup Strategy:

**Automatic (Supabase):**
- Daily backups (included)
- 7 days retention

**Manual (Recommended):**
```bash
# Weekly backup ke local
pg_dump "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" -f backup-weekly.sql

# Store di cloud (Google Drive, OneDrive, etc)
```

---

## 💰 Cost Estimation

### Free Tier (Good for Testing/Small Business):
```
Supabase: FREE
  - 500 MB storage
  - 2 GB bandwidth
  - Unlimited API requests
  
Railway: FREE ($5 credit/month)
  - 500 hours usage
  - Good untuk 1 app

Vercel: FREE
  - 100 GB bandwidth
  - Perfect untuk frontend

Total: $0/month ✅
```

### Paid (When You Grow):
```
Supabase Pro: $25/month
  - 8 GB storage
  - 50 GB bandwidth
  - Daily backups
  
Railway: $20/month
  - More resources
  - Better performance

Vercel: $20/month
  - More bandwidth
  - Better DDoS protection

Total: ~$65/month
```

**Start with free tier!** Upgrade when needed.

---

## 🐛 Troubleshooting

### Error: "Connection timeout"

**Problem:** Supabase connection limit
**Solution:** Use connection pooling

Update .env:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
# Note: Port 6543 (dengan pgbouncer)
```

### Error: "SSL connection required"

**Solution:** Add SSL mode
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

### Error: "Too many connections"

**Problem:** Prisma tidak close connections
**Solution:** 
1. Use `$disconnect()` properly
2. Or use Supabase pooler (port 6543)

### Error: "CORS policy blocked"

**Solution:** Update backend CORS

Edit `src/main.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

---

## 📝 Deployment Checklist

### Pre-Deploy:

- [ ] Test locally with Supabase DB
- [ ] All features work
- [ ] No hardcoded values
- [ ] Environment variables ready
- [ ] .gitignore includes .env
- [ ] JWT_SECRET generated (random)

### Deploy Backend:

- [ ] Railway/Render account created
- [ ] Repo connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passes: `/health`
- [ ] Public URL noted

### Deploy Frontend:

- [ ] Vercel/Netlify account created
- [ ] Repo connected
- [ ] VITE_API_URL set to backend URL
- [ ] Build successful
- [ ] Can access frontend URL
- [ ] Login works

### Post-Deploy:

- [ ] Test login on production
- [ ] Test CRUD operations
- [ ] Check CORS working
- [ ] Monitor Supabase usage
- [ ] Setup monitoring/alerts
- [ ] Document URLs

---

## 🎯 Production URLs Example

```
Backend (Railway):
https://garment-production-api.up.railway.app

Frontend (Vercel):
https://garment-production.vercel.app

Database (Supabase):
db.abc123.supabase.co

Login:
https://garment-production.vercel.app
Username: admin
Password: admin123 (GANTI DI PRODUCTION!)
```

---

## 🔄 Update Production Database

### Option 1: Via Supabase Dashboard

1. SQL Editor → New query
2. Paste SQL changes
3. Run

### Option 2: Via Prisma Migrations

```bash
# Local
npx prisma migrate dev --name add_new_field

# Deploy to production
npx prisma migrate deploy
```

### Option 3: Manual SQL

```bash
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" -c "ALTER TABLE..."
```

---

## ✅ Is Supabase Safe? - Summary

**YES! ✅** Supabase aman untuk production, bahkan untuk bisnis.

**Proof:**
- ✅ Trusted by 1M+ developers
- ✅ Used by production apps
- ✅ ISO 27001 certified
- ✅ SOC 2 Type 2 compliant
- ✅ GDPR compliant
- ✅ Daily backups
- ✅ 99.9% uptime SLA (paid tier)

**Best Practices:**
1. Strong password
2. Secure connection string (.env tidak di-commit)
3. Use SSL/TLS
4. Enable RLS (optional)
5. Monitor usage
6. Regular backups
7. Update dependencies

**Supabase vs Self-Hosted PostgreSQL:**

| Feature | Supabase | Self-Hosted |
|---------|----------|-------------|
| Setup | 5 min ⚡ | 1-2 hours 🐌 |
| Maintenance | None ✅ | Manual 🔧 |
| Backups | Auto ✅ | Manual 📦 |
| SSL | Free ✅ | Setup required 🔐 |
| Monitoring | Built-in 📊 | Install tools 🛠️ |
| Cost | Free/$25 💵 | Server + time 💰 |
| Security | Professional ✅ | Your responsibility ⚠️ |

**Recommendation:** Use Supabase! Professional, aman, dan gratis untuk mulai.

---

## 🎉 Quick Start Summary

```bash
# 1. Create Supabase project (web)
# 2. Get connection string
# 3. Import database-ready-to-import.sql via SQL Editor
# 4. Update .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# 5. Test locally
npm install
npx prisma generate
npm run dev

# 6. Deploy backend to Railway
# 7. Deploy frontend to Vercel
# 8. Done! 🚀
```

**Total time: ~30 menit**

---

**Last Updated:** 2024  
**Tested On:** Supabase Free Tier  
**Status:** ✅ Production Ready & Safe!
