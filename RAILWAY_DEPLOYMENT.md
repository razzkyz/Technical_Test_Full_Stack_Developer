# 🚂 Railway Deployment Guide - Backend

**Status**: ✅ Code sudah di GitHub, siap deploy!

---

## 🎯 Quick Steps (10 Menit)

### 1. Buka Railway (2 min)
1. Go to: **https://railway.app**
2. Click "**Login**"
3. Login with **GitHub account**
4. Authorize Railway to access your repositories

---

### 2. Create New Project (1 min)
1. Click "**New Project**" (purple button)
2. Select "**Deploy from GitHub repo**"
3. Search & select: `razzkyz/Technical_Test_Full_Stack_Developer`
4. Railway will auto-detect Node.js project ✅

---

### 3. Configure Build Settings (2 min)

Railway should auto-detect, tapi verify:

1. Click on your service card
2. Go to **Settings** tab (⚙️)
3. Scroll to **Build** section
4. Verify:
   - **Builder**: Nixpacks (default)
   - **Root Directory**: `/` (empty = root folder)
   - **Watch Paths**: `/` (leave default)

**Build Command** (jika tidak auto):
```bash
npm install && npx prisma generate && npm run build
```

**Start Command** (jika tidak auto):
```bash
npm start
```

---

### 4. Add Environment Variables (5 min) ⚠️ PENTING

Go to **Variables** tab, click "**+ New Variable**", add satu per satu:

#### DATABASE_URL
```
postgresql://postgres.mxlsesmnzmvvdgvzgfaj:Pin8322955@@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### DIRECT_URL
```
postgresql://postgres.mxlsesmnzmvvdgvzgfaj:Pin8322955@@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### JWT_SECRET
```
oEeqTPswv5c+VXxcX7bJOaquED3DNk+y38TeTyXVOrOrvQI2dM8SqA8IK235zcM/Wjwy+xbQl9k1TOljs6Rg==
```

#### JWT_EXPIRES_IN
```
2h
```

#### NODE_ENV
```
production
```

#### PORT
```
3000
```

#### CORS_ORIGIN (temporary, akan diupdate setelah deploy Vercel)
```
*
```

#### BCRYPT_SALT_ROUNDS
```
10
```

**Tips**: 
- Copy paste satu per satu dengan hati-hati
- Jangan ada spasi di awal/akhir
- Railway akan auto-restart setelah add variables

---

### 5. Deploy! (Automatic)

Railway akan otomatis deploy setelah environment variables ditambahkan.

**Progress**:
1. Building... (2-3 min)
2. Deploying... (1 min)
3. Running ✅

**Cek logs**:
- Go to **Deployments** tab
- Click latest deployment
- View logs, should see:
  ```
  🚀 Server is running on port 3000
  ✅ Database connected successfully
  ```

---

### 6. Generate Public URL (1 min)

1. Go to **Settings** tab
2. Scroll to **Networking** section
3. Click "**Generate Domain**"
4. Railway will create: `your-app-name-production.up.railway.app`
5. **Copy this URL!** You'll need it for Vercel

**Your Backend URL**:
```
https://your-app-name-production.up.railway.app
```

---

### 7. Test Backend API (1 min)

Open browser or use curl:

```bash
# Test health endpoint
curl https://your-app-name-production.up.railway.app/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-14T..."
}
```

If you see this, **Backend is LIVE!** 🎉

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Build completed successfully (no errors in logs)
- [ ] Service is running (green status)
- [ ] Public domain generated
- [ ] Health endpoint responds
- [ ] Database connection working
- [ ] No errors in deployment logs

---

## 🔧 Troubleshooting

### Build Failed: "Cannot find module 'prisma'"

**Solution**: Update Build Command in Settings:
```bash
npm install && npx prisma generate && npm run build
```

### Build Failed: "tsc not found"

**Solution**: Make sure `typescript` is in `dependencies` not `devDependencies` in `package.json`, or add to Build Command:
```bash
npm install && npm install -D typescript @types/node && npx prisma generate && npm run build
```

### Service Crashed: "Port already in use"

**Solution**: Railway auto-assigns PORT via environment variable. Verify your `src/main.ts` reads:
```typescript
const PORT = process.env.PORT || 3000;
```

### Database Connection Error

**Solution**: 
1. Verify `DATABASE_URL` is correct in Variables tab
2. Check Supabase database is running
3. Test connection string locally first
4. Make sure password has `@` escaped as `%40` if needed (tapi di Supabase biasanya tidak perlu)

### CORS Error in Browser

**Solution**: Update `CORS_ORIGIN` in Railway Variables tab after Vercel deployment:
```
https://your-app.vercel.app
```

No trailing slash!

---

## 🎯 Expected Deployment Output

### In Railway Logs:
```
[Build] Installing dependencies...
[Build] npm install
[Build] Generating Prisma Client...
[Build] npx prisma generate
[Build] Building TypeScript...
[Build] npm run build
[Build] ✅ Build completed

[Deploy] Starting application...
[Deploy] npm start
[Deploy] 🚀 Server is running on port 3000
[Deploy] ✅ Database connected successfully
```

### Environment Status:
```
✅ DATABASE_URL: Set
✅ JWT_SECRET: Set
✅ NODE_ENV: production
✅ PORT: 3000
✅ CORS_ORIGIN: Set
```

---

## 📊 Railway Free Tier

Railway provides:
- **$5 free credits per month**
- ~**500 hours** of runtime
- **Sufficient for demo/testing**

Your app should use ~1-2 hours per day if running 24/7.

**Monitor usage**:
- Railway Dashboard → Project → **Usage** tab
- Shows credits used and remaining

---

## 🔄 Auto-Deploy from GitHub

Railway is now connected to your GitHub repo!

**Future updates**:
```bash
# Make changes to backend code
git add .
git commit -m "Update backend feature"
git push origin main

# Railway automatically detects push and redeploys!
# Wait 2-3 minutes
```

No manual deployment needed! 🎉

---

## 📝 Save These URLs

After deployment, note down:

```
GitHub Repo:
https://github.com/razzkyz/Technical_Test_Full_Stack_Developer

Railway Dashboard:
https://railway.app/project/[your-project-id]

Backend API:
https://[your-app]-production.up.railway.app

Supabase Dashboard:
https://supabase.com/dashboard/project/mxlsesmnzmvvdgvzgfaj
```

---

## ⏭️ Next Step: Deploy Frontend to Vercel

After backend is live:
1. Open `VERCEL_DEPLOYMENT.md`
2. Follow the guide
3. Use your Railway URL as `VITE_API_URL`
4. Update `CORS_ORIGIN` on Railway after Vercel deployment

---

## 🎉 Backend Deployed Successfully!

When you see:
- ✅ Green status in Railway
- ✅ Public domain generated
- ✅ Health endpoint responding
- ✅ Database connected

**You're ready for frontend deployment!** 🚀

Total time: **~10 minutes**
