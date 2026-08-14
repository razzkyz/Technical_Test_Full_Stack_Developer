# 🚀 Deployment Guide - Garment Production System

## 📋 Overview

This is a **monorepo** with:
- **Backend**: Node.js + Express + Prisma (root folder)
- **Frontend**: React + Vite + TypeScript (`frontend/` subfolder)
- **Database**: Supabase PostgreSQL (cloud)

**GitHub Repository**: https://github.com/razzkyz/Technical_Test_Full_Stack_Developer

---

## ✅ Repository Status

```
✅ Git initialized
✅ Remote configured
✅ .gitignore protecting secrets
✅ .env excluded from repository
✅ Code committed and ready
```

---

## 🎯 Deployment Architecture

```
GitHub Repository (monorepo)
    ├── Backend code (root folder)      → Deploy to Railway
    ├── Frontend code (frontend/)       → Deploy to Vercel
    └── Database (Supabase)             → Already deployed ✅
```

---

## 📦 What's Already Done

1. ✅ **Database on Supabase**
   - Project: `mxlsesmnzmvvdgvzgfaj`
   - Region: Singapore
   - URL: `https://mxlsesmnzmvvdgvzgfaj.supabase.co`
   - Data imported and ready

2. ✅ **Code in GitHub**
   - Repository: `Technical_Test_Full_Stack_Developer`
   - Branch: `main`
   - All code committed

3. ✅ **Environment Configuration**
   - `.env` configured for Supabase
   - `.env.example` as template
   - Secrets protected by `.gitignore`

---

## 🚂 Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to: https://railway.app
2. Sign up with GitHub
3. Allow Railway to access your repositories

### Step 2: Create New Project
1. Click "**New Project**"
2. Select "**Deploy from GitHub repo**"
3. Choose: `razzkyz/Technical_Test_Full_Stack_Developer`
4. Railway will auto-detect: **Node.js project** ✅

### Step 3: Configure Root Directory
**IMPORTANT**: Railway should read from **root folder** (backend code)

1. Click on your service
2. Go to **Settings** tab
3. **Root Directory**: Leave empty or set to `/` (root)
4. **Build Command**: `npm install && npx prisma generate && npm run build`
5. **Start Command**: `npm start`

### Step 4: Add Environment Variables
Go to **Variables** tab, add these:

```env
DATABASE_URL=postgresql://postgres.mxlsesmnzmvvdgvzgfaj:Pin8322955@@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.mxlsesmnzmvvdgvzgfaj:Pin8322955@@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

JWT_SECRET=oEeqTPswv5c+VXxcX7bJOaquED3DNk+y38TeTyXVOrOrvQI2dM8SqA8IK235zcM/Wjwy+xbQl9k1TOljs6Rg==

JWT_EXPIRES_IN=2h

NODE_ENV=production

PORT=3000

CORS_ORIGIN=*

BCRYPT_SALT_ROUNDS=10
```

**Note**: Set `CORS_ORIGIN=*` for now, will update after Vercel deployment.

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait 3-5 minutes
3. Check **Deployments** tab for status
4. Once deployed, click "**Generate Domain**" to get public URL
5. **Copy the URL**: `https://your-app.up.railway.app`

### Step 6: Verify Backend
Test the backend:
```bash
curl https://your-app.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## ⚡ Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to: https://vercel.com
2. Sign up with GitHub
3. Allow Vercel to access your repositories

### Step 2: Import Project
1. Click "**Add New...**" → "**Project**"
2. Import: `razzkyz/Technical_Test_Full_Stack_Developer`
3. **Framework Preset**: Vite ✅ (auto-detected)

### Step 3: Configure Root Directory
**IMPORTANT**: Vercel must read from **frontend/** subfolder only!

1. **Root Directory**: `frontend` ← **Critical!**
2. **Build Command**: `npm run build` (auto-filled)
3. **Output Directory**: `dist` (auto-filled)
4. **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables
Add this ONE variable:

```env
VITE_API_URL=https://your-app.up.railway.app/api
```

Replace `your-app.up.railway.app` with your actual Railway domain from Step 6 above.

### Step 5: Deploy
1. Click "**Deploy**"
2. Wait 2-3 minutes
3. Vercel will build and deploy
4. **Copy the URL**: `https://your-app.vercel.app`

### Step 6: Update CORS on Railway
Now that you have the Vercel URL:

1. Go back to **Railway**
2. Go to **Variables** tab
3. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
4. Railway will auto-redeploy

### Step 7: Test Frontend
1. Open: `https://your-app.vercel.app`
2. Should see **Login page**
3. Login:
   - Username: `admin`
   - Password: `admin123`
4. Should see **Dashboard** ✅

---

## 🔄 Future Updates

### Update Backend Code
```bash
# Make changes to backend code
git add .
git commit -m "Update backend feature"
git push origin main

# Railway auto-deploys from GitHub
# Wait 2-3 minutes
```

### Update Frontend Code
```bash
# Make changes to frontend code
git add .
git commit -m "Update frontend UI"
git push origin main

# Vercel auto-deploys from GitHub
# Wait 1-2 minutes
```

Both platforms have **automatic deployments** from GitHub! 🎉

---

## 🐛 Troubleshooting

### Railway Build Fails
**Error**: `Cannot find module 'prisma'`
**Fix**: Add to Build Command:
```bash
npm install && npx prisma generate && npm run build
```

**Error**: `Port already in use`
**Fix**: Railway auto-assigns PORT, make sure backend reads `process.env.PORT`

### Vercel Build Fails
**Error**: `Root directory not found`
**Fix**: Set **Root Directory** to `frontend` in project settings

**Error**: `VITE_API_URL is not defined`
**Fix**: Add environment variable in Vercel dashboard

### CORS Errors in Browser
**Error**: `Access-Control-Allow-Origin`
**Fix**: Update `CORS_ORIGIN` in Railway to match Vercel domain exactly:
```
CORS_ORIGIN=https://your-app.vercel.app
```

No trailing slash!

### Database Connection Issues
**Error**: `Connection timeout`
**Fix**: Verify `DATABASE_URL` in Railway matches Supabase exactly:
- Check password is correct
- Use pooler port 6543 (not 5432)
- Include `?pgbouncer=true&connection_limit=1`

---

## 📊 Deployment Checklist

### Before Deploying
- [x] Git repository initialized
- [x] Code committed to GitHub
- [x] .env excluded from git
- [x] Database on Supabase ready
- [x] .gitignore configured

### Railway Deployment
- [ ] Account created
- [ ] Project imported from GitHub
- [ ] Root directory set correctly (root folder)
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Public URL generated
- [ ] Backend API tested

### Vercel Deployment
- [ ] Account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] `VITE_API_URL` environment variable added
- [ ] Deployment successful
- [ ] Frontend loads
- [ ] Login works
- [ ] Can access dashboard

### Final Steps
- [ ] Update CORS_ORIGIN on Railway
- [ ] Test full flow: Login → Create Customer → Create Order
- [ ] Share URLs with tester/HRD

---

## 🎯 Final URLs

After deployment, you'll have:

```
Frontend:  https://your-app.vercel.app
Backend:   https://your-app.up.railway.app
Database:  Supabase (already deployed)

Login:
  Username: admin
  Password: admin123
```

---

## 💡 Tips

### Free Tier Limits
- **Railway**: $5 free credit/month (~500 hours)
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database free

All should be fine for demo/testing!

### Monitoring
- **Railway**: Check logs in Deployments tab
- **Vercel**: Check logs in Deployments → View Function Logs
- **Supabase**: Check Table Editor for data

### Security
- Keep `.env` file local only
- Never commit secrets to git
- Use different JWT_SECRET for production
- Change default admin password after demo

---

## 📞 Need Help?

**Common Issues**:
1. Build fails → Check build logs
2. CORS errors → Verify CORS_ORIGIN matches
3. 404 errors → Check root directory settings
4. Database errors → Verify DATABASE_URL

**Estimated Deployment Time**: 
- Railway: 5-10 minutes
- Vercel: 3-5 minutes
- **Total: 15 minutes** ⚡

---

## ✅ Success!

When everything works:
- ✅ Backend API responding
- ✅ Frontend loads
- ✅ Login successful
- ✅ Can create/read/update/delete data
- ✅ Production tracking works

**You're live! 🚀**

Share the Vercel URL with your HRD/tester and enjoy! 🎉
