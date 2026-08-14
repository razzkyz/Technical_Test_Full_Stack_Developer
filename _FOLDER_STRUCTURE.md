# 📁 FOLDER STRUCTURE

Project ini sudah dirapihkan dengan struktur yang jelas dan terorganisir.

---

## 📂 ROOT STRUCTURE

```
konveksitest/
├── 📄 README.md                    # Main documentation - START HERE!
├── 📄 _FOLDER_STRUCTURE.md         # This file - explains folder structure
│
├── 📁 config/                      # Application configuration
│   ├── app.ts                     # App settings
│   ├── database.ts                # Database config
│   └── index.ts
│
├── 📁 database/                    # SQL files & database scripts
│   ├── database-complete.sql      # Complete database export
│   ├── database-ready-to-import.sql  # Ready-to-import version
│   └── supabase-schema.sql        # ⭐ MAIN: Use this for Supabase
│
├── 📁 docs/                        # Documentation files
│   ├── _START_HERE.md             # Quick start guide
│   ├── AUDIT_SUMMARY.md           # Project audit results
│   ├── FINAL_AUDIT_REPORT.md      # Detailed audit report
│   ├── QUANTITY_TRACKING_EXPLAINED.md  # How quantity tracking works
│   ├── URGENT_FIXES_NOW.md        # Critical fixes needed
│   ├── DEPLOYMENT_GUIDE.md        # How to deploy
│   ├── RAILWAY_DEPLOYMENT.md      # Railway specific
│   ├── VERCEL_DEPLOYMENT.md       # Vercel specific
│   ├── API_DOCUMENTATION.md       # API endpoints
│   └── ... (other documentation)
│
├── 📁 frontend/                    # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 prisma/                      # Prisma ORM
│   ├── schema.prisma              # Database schema
│   └── seed.ts
│
├── 📁 scripts/                     # Utility scripts
│   ├── export-database.bat        # Export DB to SQL
│   ├── import-database.bat        # Import SQL to DB
│   ├── start-servers.bat          # Start dev servers
│   ├── generate-sql-with-hash.js  # Generate SQL with hashed passwords
│   └── test-postgres-connection.ps1  # Test DB connection
│
├── 📁 src/                         # Backend source code
│   ├── controllers/               # Request handlers
│   ├── services/                  # Business logic
│   ├── repositories/              # Database access
│   ├── middleware/                # Auth, validation
│   ├── types/                     # TypeScript types
│   └── main.ts                    # Entry point
│
├── 📁 tests/                       # Test files
│
├── 📄 package.json                 # Node dependencies
├── 📄 tsconfig.json                # TypeScript config
├── 📄 .env.example                 # Environment template
└── 📄 .gitignore                   # Git ignore rules
```

---

## 🎯 QUICK ACCESS

### **For Developers:**
1. **Start Here:** `README.md`
2. **Database Setup:** `database/supabase-schema.sql`
3. **API Docs:** `docs/API_DOCUMENTATION.md`
4. **Deploy Guide:** `docs/DEPLOYMENT_GUIDE.md`

### **For Reviewers:**
1. **Project Overview:** `README.md`
2. **Audit Report:** `docs/FINAL_AUDIT_REPORT.md`
3. **Quick Summary:** `docs/AUDIT_SUMMARY.md`
4. **Technical Details:** `docs/QUANTITY_TRACKING_EXPLAINED.md`

### **For Production:**
1. **Deploy Backend:** `docs/RAILWAY_DEPLOYMENT.md`
2. **Deploy Frontend:** `docs/VERCEL_DEPLOYMENT.md`
3. **Setup Database:** `database/supabase-schema.sql`

---

## 📋 FILE TYPES EXPLAINED

### **📁 /database/**
SQL files untuk database setup dan migration.

**Main File:** `supabase-schema.sql`
- Complete schema
- Sample data
- Users with hashed passwords
- Ready to execute in Supabase SQL Editor

### **📁 /docs/**
Semua dokumentasi project:
- Deployment guides
- API documentation
- Audit reports
- Technical explanations
- Quick start guides

### **📁 /scripts/**
Utility scripts untuk development:
- `.bat` - Windows batch scripts
- `.js` - Node.js scripts
- `.ps1` - PowerShell scripts

### **📁 /frontend/**
React application (Vite + TypeScript + Tailwind CSS)

### **📁 /src/**
Backend application (Express + TypeScript + Prisma)

---

## 🚀 GETTING STARTED

### 1️⃣ **Setup Database**
```bash
# Open Supabase SQL Editor
# Copy & paste content from: database/supabase-schema.sql
# Execute
```

### 2️⃣ **Install Dependencies**
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### 3️⃣ **Configure Environment**
```bash
# Copy .env.example to .env
# Update DATABASE_URL, JWT_SECRET, etc.
```

### 4️⃣ **Run Development**
```bash
# Backend (root folder)
npm run dev

# Frontend (frontend folder)
npm run dev
```

---

## 📝 NOTES

- `.kiro/` folder is for Kiro AI agent only (gitignored)
- `.env` contains secrets (gitignored)
- `node_modules/` is gitignored
- `dist/` and `build/` are gitignored (generated files)

---

**Last Updated:** August 14, 2026  
**Structure Version:** 2.0
