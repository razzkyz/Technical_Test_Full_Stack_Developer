# ⚡ Vercel Deployment Guide - Frontend

**Prerequisite**: ✅ Backend sudah deploy di Railway

---

## 🎯 Quick Steps (5 Menit)

### 1. Buka Vercel (1 min)
1. Go to: **https://vercel.com**
2. Click "**Sign Up**" atau "**Login**"
3. Login with **GitHub account**
4. Authorize Vercel to access your repositories

---

### 2. Import Project (1 min)
1. Click "**Add New...**" → "**Project**"
2. Find & select: `razzkyz/Technical_Test_Full_Stack_Developer`
3. Click "**Import**"
4. Vercel will auto-detect **Vite** framework ✅

---

### 3. Configure Project Settings (2 min) ⚠️ CRITICAL

**IMPORTANT**: Vercel harus baca dari subfolder `frontend/` saja!

#### Framework Preset
- Should auto-detect: **Vite** ✅

#### Root Directory ⚠️ PALING PENTING
- Click "**Edit**" next to Root Directory
- Set to: `frontend`
- **JANGAN DIKOSONGKAN!**

#### Build Settings (should auto-fill)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Node.js Version
- Leave default (18.x or 20.x)

---

### 4. Add Environment Variable (1 min)

Scroll to **Environment Variables** section.

Add ONE variable:

**Key**: `VITE_API_URL`

**Value**: (ganti dengan Railway URL kamu)
```
https://[your-app]-production.up.railway.app/api
```

**Example**:
```
https://technical-test-production-a1b2.up.railway.app/api
```

⚠️ **IMPORTANT**:
- Must end with `/api`
- No trailing slash after `/api`
- Use HTTPS (not HTTP)
- Copy from Railway domain exactly

---

### 5. Deploy! (Automatic)

1. Click "**Deploy**"
2. Vercel will start building
3. Wait 2-3 minutes...
4. Should show **"Congratulations!"** when done ✅

**Build Process**:
```
[Building] Detected framework: Vite
[Building] Installing dependencies...
[Building] Running build command...
[Building] Build completed successfully
[Deploying] Uploading build outputs...
[Deploying] Deployment ready
```

---

### 6. Get Your Frontend URL (30 sec)

After deployment succeeds:

1. Vercel shows your live URL
2. Should be: `https://[your-repo-name].vercel.app`
3. **Copy this URL!**

**Example**:
```
https://technical-test-full-stack-developer.vercel.app
```

---

### 7. Test Frontend (1 min)

1. Click "**Visit**" or open the URL in browser
2. Should see **Login Page** with gradient design ✨
3. Try login:
   - Username: `admin`
   - Password: `admin123`
4. Should redirect to **Dashboard** ✅

If you can login and see dashboard, **Frontend is LIVE!** 🎉

---

## 🔄 Update CORS on Railway

**IMPORTANT**: Sekarang backend tahu frontend URL!

### Step 1: Go to Railway
1. Open Railway dashboard
2. Select your backend service
3. Go to **Variables** tab

### Step 2: Update CORS_ORIGIN
1. Find variable: `CORS_ORIGIN`
2. Click **Edit** (pencil icon)
3. Change from `*` to your Vercel URL:
   ```
   https://technical-test-full-stack-developer.vercel.app
   ```
4. **No trailing slash!**
5. Save

### Step 3: Railway Auto-Redeploys
- Railway will restart backend (~1 min)
- CORS now only allows your frontend
- More secure! 🔒

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Build completed successfully
- [ ] Frontend loads in browser
- [ ] Login page displays correctly
- [ ] Can login with admin/admin123
- [ ] Dashboard loads after login
- [ ] Can navigate to other pages
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console
- [ ] Create/Read operations work

---

## 🧪 Full System Test

Test complete flow on LIVE URLs:

### 1. Login
- Open: `https://your-app.vercel.app`
- Username: `admin`
- Password: `admin123`
- Should redirect to Dashboard ✅

### 2. Dashboard
- Should show metrics (if any data)
- Quick action buttons visible
- No console errors

### 3. Create Customer
- Click "Tambah Customer" or navigate to Customers
- Fill form:
  - Name: `Test Customer`
  - Phone: `08123456789`
  - Address: `Test Address`
- Click Save
- Should show success message ✅

### 4. Search Customer
- Type in search box
- Should filter results ✅

### 5. Create Product
- Navigate to Products
- Click "Tambah Produk"
- Fill form and save
- Should work ✅

### 6. Create Order
- Navigate to Orders
- Create new order with test customer/product
- Should save successfully ✅

If all tests pass, **SYSTEM FULLY FUNCTIONAL!** 🎉

---

## 🔧 Troubleshooting

### Build Failed: "Root directory not found"

**Solution**:
1. Go to Vercel Project Settings
2. Find **Root Directory** setting
3. Make sure it's set to: `frontend`
4. Redeploy

### Build Failed: "Command failed: npm run build"

**Solution**: Check if TypeScript errors in frontend code. Fix errors locally first:
```bash
cd frontend
npm run build
# Fix any errors
git add .
git commit -m "Fix build errors"
git push origin main
# Vercel will auto-redeploy
```

### Frontend Loads but API Calls Fail

**Check 1**: Verify `VITE_API_URL` in Vercel
- Go to Project Settings → Environment Variables
- Make sure it ends with `/api`
- Make sure it's HTTPS

**Check 2**: Check browser console for errors
- Open DevTools (F12)
- Check Console tab
- Look for CORS or network errors

**Check 3**: Verify Railway backend is running
- Test: `curl https://your-railway-url/api/health`
- Should return JSON

### CORS Error in Browser Console

```
Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy
```

**Solution**: Update `CORS_ORIGIN` in Railway
1. Railway → Variables tab
2. Set `CORS_ORIGIN` to exact Vercel URL
3. No trailing slash
4. Wait for Railway to restart

### Login Doesn't Work (401 Unauthorized)

**Possible causes**:
1. Backend not connected to database
2. Wrong API URL in Vercel
3. Seeded data not in Supabase

**Solution**:
1. Check Railway logs for database connection
2. Verify Supabase has User table with admin user
3. Re-import `database-ready-to-import.sql` if needed

### Page Loads but Shows Empty Data

This is normal if database is empty!

**Solution**: Create test data using the UI:
1. Create a customer
2. Create a product  
3. Create an order
4. Now dashboard should show metrics

---

## 🔄 Auto-Deploy from GitHub

Vercel is now connected to your GitHub repo!

**Future updates**:
```bash
# Make changes to frontend code
cd frontend
# ... edit files ...
git add .
git commit -m "Update frontend UI"
git push origin main

# Vercel automatically detects push and redeploys!
# Wait 1-2 minutes
```

**Pro tip**: Vercel also creates preview deployments for every push! Check the Deployments tab.

---

## 📊 Vercel Free Tier

Vercel provides:
- **100GB bandwidth per month**
- **Unlimited deployments**
- **Automatic HTTPS**
- **Global CDN**

More than enough for demo/testing! 🎉

**Monitor usage**:
- Vercel Dashboard → Project → **Usage** tab

---

## 🎯 Final Architecture

After both deployments:

```
┌─────────────────────────────────────────┐
│  USER BROWSER                           │
│  https://your-app.vercel.app            │
└───────────────┬─────────────────────────┘
                │
                │ HTTPS Requests
                ▼
┌─────────────────────────────────────────┐
│  VERCEL (Frontend)                      │
│  - React + Vite                         │
│  - Static files served via CDN          │
│  - VITE_API_URL → Railway               │
└───────────────┬─────────────────────────┘
                │
                │ API Calls (/api/*)
                ▼
┌─────────────────────────────────────────┐
│  RAILWAY (Backend)                      │
│  - Node.js + Express + Prisma           │
│  - REST API endpoints                   │
│  - JWT authentication                   │
└───────────────┬─────────────────────────┘
                │
                │ SQL Queries
                ▼
┌─────────────────────────────────────────┐
│  SUPABASE (Database)                    │
│  - PostgreSQL (Singapore)               │
│  - 7 tables with production data        │
└─────────────────────────────────────────┘
```

**All in the cloud!** ☁️

---

## 📝 Save These URLs

**Production URLs**:
```
Frontend: https://[your-app].vercel.app
Backend:  https://[your-app].up.railway.app
Database: Supabase (mxlsesmnzmvvdgvzgfaj)

Login:
  Username: admin
  Password: admin123
```

**Dashboards**:
```
Vercel:   https://vercel.com/dashboard
Railway:  https://railway.app/dashboard
Supabase: https://supabase.com/dashboard/project/mxlsesmnzmvvdgvzgfaj
GitHub:   https://github.com/razzkyz/Technical_Test_Full_Stack_Developer
```

---

## 🎉 Frontend Deployed Successfully!

When you see:
- ✅ Frontend loads on Vercel URL
- ✅ Login works
- ✅ Dashboard displays
- ✅ Can create/edit data
- ✅ No console errors

**FULL SYSTEM IS LIVE!** 🚀🎉

---

## 📤 Share with HRD/Tester

Send them:

```
Hi! The Garment Production System is now live:

🌐 Frontend: https://your-app.vercel.app

📖 Login:
   Username: admin
   Password: admin123

Features to test:
✅ Dashboard with metrics
✅ Customer management with search
✅ Product catalog with filters
✅ Order creation (multi-item)
✅ Production tracking & QC
✅ Modern UI with gradient design

Tech Stack:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL (Supabase)
- Hosting: Vercel + Railway

Feel free to explore! 🚀
```

---

## 🎯 Total Deployment Time

- Railway (Backend): ~10 min
- Vercel (Frontend): ~5 min
- Testing & CORS update: ~5 min
- **Total: 20 minutes**

**Not bad!** ⚡🎉

---

## ✅ Success!

You now have a **fully deployed, production-ready** garment production management system! 

**Congratulations!** 🎊🚀
