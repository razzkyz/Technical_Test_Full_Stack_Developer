# ✅ FINAL TEST CHECKLIST - Deadline 1 Jam

## 🎯 URLs
```
Frontend: https://technical-test-full-stack-developer-ten.vercel.app
Backend:  https://technicaltestfullstackdeveloper-production.up.railway.app
Login:    admin / admin123
```

---

## 📋 Test Checklist (15 Minutes)

### 1. Login ✅
- [ ] Open frontend URL
- [ ] Enter: admin / admin123
- [ ] Click Login
- [ ] Redirects to Dashboard
- **Expected**: Success, see dashboard

---

### 2. Dashboard ✅
- [ ] Dashboard loads
- [ ] Shows metrics cards
- [ ] Quick action buttons visible
- **Expected**: No errors, UI loads

---

### 3. Customers CRUD ✅
- [ ] Navigate to Customers
- [ ] Should see 3 customers (PT Garuda, CV Jaya, Toko Busana)
- [ ] Test search box (type "Garuda")
- [ ] Click "Tambah Customer"
- [ ] Create new: Name="Test Customer", Phone="08123456789", Address="Test"
- [ ] Click Save
- [ ] Should appear in list
- [ ] Click "Edit" on test customer
- [ ] Change name to "Test Customer Updated"
- [ ] Save
- [ ] Click "Hapus" (Delete)
- [ ] Confirm delete
- **Expected**: All CRUD operations work

---

### 4. Products CRUD ✅
- [ ] Navigate to Products
- [ ] Should see 8 products (no duplicates!)
- [ ] Test search box (type "Jaket")
- [ ] Should filter to show only Jaket Bomber
- [ ] Click "Tambah Produk"
- [ ] Create new: Code="TEST-001", Name="Test Product", Type="Test", Color="Blue", Size="L"
- [ ] Save
- [ ] Should appear in list
- [ ] Click "Edit" on test product
- [ ] Change color to "Red"
- [ ] Save
- [ ] Click "Hapus"
- [ ] Confirm
- **Expected**: All CRUD operations work

---

### 5. Orders CRUD ✅
- [ ] Navigate to Orders
- [ ] Should see 3 orders
- [ ] Click "Tambah Order"
- [ ] Select customer: "PT Garuda Indonesia"
- [ ] Order date: today
- [ ] Deadline: 30 days from now
- [ ] Add item: Product="Jaket Bomber", Quantity=50
- [ ] Click "+ Tambah Item" 
- [ ] Add another: Product="Kaos Polos Katun", Quantity=100
- [ ] Total should calculate automatically
- [ ] Click "Save Order"
- [ ] Should appear in list
- [ ] Click order to view detail
- [ ] Should show 2 items
- **Expected**: Create and view order works

---

### 6. Production Tracking ✅
- [ ] Navigate to Production → Running Orders
- [ ] Should see orders with status NOT_PROCESSED or in progress
- [ ] Find order with "Jaket Bomber" item
- [ ] Click "Update Progress" button
- [ ] Should open ProductionUpdate page
- [ ] Should show order details
- [ ] Should show "Move to Next Stage" form
- [ ] Enter quantity (e.g., 30)
- [ ] Click "Update Progress"
- [ ] Should show success message
- [ ] Go back to Running Orders
- [ ] Status should update
- **Expected**: Production tracking works

---

### 7. Search & Filters ✅
- [ ] Test search on Customers page
- [ ] Test search on Products page  
- [ ] Test search on Orders page
- [ ] All should filter in real-time
- **Expected**: Search works everywhere

---

### 8. Logout ✅
- [ ] Click "Logout" button (top right)
- [ ] Should redirect to login page
- [ ] Try accessing dashboard URL directly
- [ ] Should redirect back to login (protected route)
- **Expected**: Auth protection works

---

## 🐛 Common Issues & Quick Fixes

### Issue: Products still showing duplicates
**Fix**: Run clean SQL in Supabase (provided in chat above)

### Issue: Orders page empty
**Fix**: Create 1-2 orders via UI

### Issue: Production update 404
**Fix**: Vercel auto-deploy in progress, wait 2 minutes

### Issue: Login 401
**Fix**: Check Railway logs, verify DATABASE_URL

---

## ⏰ Timeline (Total: 15-20 minutes)

| Test | Time | Status |
|------|------|--------|
| Login | 1 min | ⏳ |
| Dashboard | 1 min | ⏳ |
| Customers CRUD | 3 min | ⏳ |
| Products CRUD | 3 min | ⏳ |
| Orders CRUD | 4 min | ⏳ |
| Production | 4 min | ⏳ |
| Search | 2 min | ⏳ |
| Logout | 1 min | ⏳ |
| **TOTAL** | **19 min** | |

---

## 📸 Demo Flow (for HRD - 10 minutes)

### Flow 1: Basic CRUD (5 min)
1. Login
2. Show Customers list → Search
3. Show Products list → Search  
4. Create new customer
5. Create new product
6. Show search working

### Flow 2: Order Management (5 min)
1. Create new order
2. Add multiple products
3. Show order detail
4. Navigate to Production
5. Show running orders
6. Update production progress
7. Show progress tracking

### Key Talking Points:
- ✅ Modern UI with gradient design
- ✅ Real-time search on all pages
- ✅ Complete CRUD operations
- ✅ Production tracking system
- ✅ Cloud-based (Supabase + Railway + Vercel)
- ✅ Auto-deploy from GitHub
- ✅ Mobile responsive
- ✅ Secure authentication

---

## 🎯 Success Criteria

System is **PRODUCTION READY** if:
- ✅ Login works
- ✅ All CRUD operations work
- ✅ Search works on all pages
- ✅ Production tracking loads (even if empty)
- ✅ No console errors on main flows
- ✅ Can create order with multiple items
- ✅ UI looks professional

---

## 🚀 Deployment Status

```
✅ Backend:   DEPLOYED (Railway)
✅ Frontend:  DEPLOYED (Vercel) 
✅ Database:  LIVE (Supabase)
✅ CORS:      CONFIGURED
✅ Auth:      WORKING
⏳ Production: Deploying fix...
```

---

## 📞 If Something Breaks

### Quick Diagnosis:
1. **F12** → Console → Check error
2. **Network tab** → Check API calls
3. **Railway logs** → Check backend errors

### Most Likely Issues:
- **404**: Wrong endpoint (check Railway logs)
- **401**: Auth problem (re-login)
- **500**: Backend error (check Railway logs)
- **CORS**: Update CORS_ORIGIN in Railway

---

## ✅ Final Verification

Before demo, verify:
- [ ] Can login
- [ ] Can create customer
- [ ] Can create product
- [ ] Can create order
- [ ] Search works
- [ ] UI looks good
- [ ] No major console errors

**If all checked**: ✅ **READY FOR DEMO!**

**Good luck!** 🎉🚀
