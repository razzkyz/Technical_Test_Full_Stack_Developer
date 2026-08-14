# 🚀 QUICK GUIDE - Garment Production System

## 📋 Quick Reference Card

### 🏃‍♂️ Start Servers

```bash
# Backend
cd C:\Freelance\konveksitest
npm run dev

# Frontend (new terminal)
cd C:\Freelance\konveksitest\frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: `admin` / `admin123`

---

## 🎯 NEW! Quick Actions (Dashboard)

Setelah login, di Dashboard ada 5 tombol untuk akses cepat:

| Button | Action | Shortcut |
|--------|--------|----------|
| 📦 Buat Order | Create new order | Dashboard → Click |
| 🏷️ Tambah Produk | Add new product | Dashboard → Click |
| 👥 Tambah Customer | Add new customer | Dashboard → Click |
| 🏭 Produksi | View running orders | Dashboard → Click |
| 📋 Lihat Order | View all orders | Dashboard → Click |

**No need to navigate menu!** ⚡

---

## 🔍 NEW! Enhanced Search

### Product Search (`/products`)
```
🔍 Cari produk berdasarkan nama, kode, atau jenis...
   (contoh: Kaos, TK001, Kemeja)
```
- Search by: nama, kode, jenis
- Clear button: X
- Shows: "12 produk ditemukan"

### Customer Search (`/customers`)
```
🔍 Cari customer berdasarkan nama...
   (contoh: PT Garuda, Budi, Toko Jaya)
```
- Search by: nama
- Real-time filtering
- Result counter

### Order Search (`/orders`)
```
🔍 Cari nomor order...          | Filter Status ▼
   (contoh: ORD-001)            | [All Status]
```
- Search by: order number
- Filter by: status
- Reset button to clear all

### Production Search (`/production/running`)
```
🔍 Cari nomor order atau customer...  | Filter Stage ▼
   (contoh: ORD-001, PT Jaya)         | [All Stages]
```
- Search by: order number OR customer name
- Filter by: production stage
- Reset button available

---

## 📱 Common Tasks

### Add New Customer
1. Dashboard → Click "👥 Tambah Customer"
2. Fill: Name, Phone, Address
3. Click "Simpan"

### Add New Product
1. Dashboard → Click "🏷️ Tambah Produk"
2. Fill: ID, Code, Name, Type, Color, Size
3. Click "Simpan"

### Create Order
1. Dashboard → Click "📦 Buat Order"
2. Select customer
3. Add items (can add multiple)
4. Set order date & deadline
5. Click "Buat Order"

### Update Production
1. Dashboard → Click "🏭 Produksi"
2. Find order (use search!)
3. Click "Update Progress" on item
4. Enter quantity to move
5. Click "Update"

### Quality Control
1. Go to Production → Running Orders
2. Find item with stage "QC"
3. Click "Perform QC"
4. Enter passed/rejected quantities
5. Submit

---

## 🎨 UI Features

### Search Tips
- **Large gradient box** = search here!
- **X button** = clear search instantly
- **Badge** shows result count
- **Examples** in placeholder text

### Filter Tips
- Use search + filter together
- Click "Reset Filter" to clear all
- Result count updates automatically
- Emoji icons help identify stages

### Navigation Tips
- Quick actions on Dashboard = fastest
- Menu sidebar = full navigation
- Back buttons on all forms
- Breadcrumbs show current location

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
netstat -ano | findstr :3000
taskkill /F /PID <PID>
npm run dev
```

### Frontend Loading Forever
1. Check backend running: http://localhost:3000/health
2. Hard refresh: Ctrl + Shift + R
3. Clear cache: F12 → Console → `localStorage.clear()`

### Login Failed
```bash
npx ts-node prisma/seed.ts
```
Then clear browser cache.

### CORS Error
Check `.env`:
```
CORS_ORIGIN="http://localhost:5173"
```
Restart backend after change.

---

## 📊 Production Flow

```
Order Created
    ↓
NOT_PROCESSED → Start Production
    ↓
CUTTING → Move quantity to next stage
    ↓
SEWING → Move quantity to next stage
    ↓
QC → Perform quality control
    ├─ PASSED → FINISHING
    └─ REJECTED → back to SEWING
         ↓
    FINISHING → Move to packing
         ↓
    PACKING → Move to complete
         ↓
    COMPLETE → Order done!
```

**Key Points:**
- Can split quantities (move 10 from 20)
- QC separates passed/rejected
- Rejected items go back to sewing
- All quantities tracked per stage

---

## 🎯 Status Indicators

### Order Status
- ⏳ **NOT_PROCESSED** = Belum mulai
- 🔄 **IN_PROGRESS** = Sedang dikerjakan
- ✅ **COMPLETE** = Selesai

### Production Stages
- ⏳ **NOT_PROCESSED** = Belum diproses
- ✂️ **CUTTING** = Potong kain
- 🧵 **SEWING** = Jahit
- 🔍 **QC** = Quality control
- ✨ **FINISHING** = Finishing touches
- 📦 **PACKING** = Packing
- ✔️ **COMPLETE** = Selesai

### Late Orders
- 🚨 **Red animated badge** = Order terlambat
- Check deadline vs today
- Visible on Orders & Production pages

---

## 💡 Pro Tips

1. **Use Dashboard Quick Actions** = Fastest way!
2. **Search is your friend** = Big gradient box, hard to miss
3. **Combine search + filter** = More powerful filtering
4. **Reset button** = Clear all filters instantly
5. **Result counter** = Always know how many items
6. **Emoji icons** = Quick visual recognition
7. **Hover effects** = Interactive feedback

---

## 📞 Need Help?

### Documentation Files
- `README.md` = Full documentation
- `WHATS_NEW.md` = UI improvements summary
- `UI_ENHANCEMENTS.md` = Technical details
- `FINAL_CHECKLIST.md` = Completion status
- `QUICK_GUIDE.md` = This file

### Check Status
```bash
# Backend health
curl http://localhost:3000/health

# Database connection
npx prisma db push
```

---

## ✅ Quick Checklist

**Before Starting:**
- [ ] PostgreSQL service running
- [ ] Backend port 3000 free
- [ ] Frontend port 5173 free

**After Starting:**
- [ ] Backend shows: "Server is running on http://localhost:3000"
- [ ] Frontend shows: "Local: http://localhost:5173/"
- [ ] Login works with admin/admin123
- [ ] Dashboard shows quick actions
- [ ] Search boxes visible and large

**Working Features:**
- [ ] Can create customers
- [ ] Can create products
- [ ] Can create orders
- [ ] Can update production
- [ ] Can perform QC
- [ ] Search works everywhere
- [ ] Filters work correctly

---

## 🎉 You're Ready!

**Everything is set up and working!**

**UI is super easy now:**
- ✅ Big search boxes
- ✅ Quick action buttons
- ✅ Clear filters
- ✅ Result counters
- ✅ Beautiful gradients

**Start using and enjoy!** 🚀

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  

**Made with ❤️ for easy management!**
