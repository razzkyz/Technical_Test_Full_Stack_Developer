@echo off
echo ================================================
echo DATABASE IMPORT - Garment Production System
echo ================================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if errorlevel 1 (
    echo ERROR: PostgreSQL not found!
    echo.
    echo Please install PostgreSQL first:
    echo https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found: OK
echo.

REM Set variables
set DB_NAME=garment_production
set DB_USER=postgres
set SQL_FILE=database-ready-to-import.sql

REM Check if SQL file exists
if not exist "%SQL_FILE%" (
    echo ERROR: File not found: %SQL_FILE%
    echo.
    echo Please make sure you have the SQL file in this folder.
    echo.
    pause
    exit /b 1
)

echo SQL file found: OK
echo.
echo ================================================
echo STEP 1: Create Database
echo ================================================
echo.
echo Creating database: %DB_NAME%
echo (You will be prompted for PostgreSQL password)
echo.

REM Create database
psql -U %DB_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create database!
    echo.
    echo Possible reasons:
    echo - Wrong password
    echo - PostgreSQL service not running
    echo.
    pause
    exit /b 1
)

echo.
echo Database created successfully!
echo.

echo ================================================
echo STEP 2: Import Database Schema and Data
echo ================================================
echo.
echo Importing %SQL_FILE%...
echo (This may take a few seconds)
echo.

REM Import SQL file
psql -U %DB_USER% -d %DB_NAME% -f "%SQL_FILE%"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to import database!
    echo.
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo STEP 3: Verify Import
echo ================================================
echo.

REM Verify import
echo Checking tables...
psql -U %DB_USER% -d %DB_NAME% -c "\dt"

echo.
echo Checking admin user...
psql -U %DB_USER% -d %DB_NAME% -c "SELECT username, role FROM \"User\";"

echo.
echo ================================================
echo IMPORT COMPLETED SUCCESSFULLY!
echo ================================================
echo.
echo Database: %DB_NAME%
echo Tables: 7 (User, Customer, Product, Order, OrderItem, ProductionProgress, RejectRecord)
echo Admin User: admin / admin123
echo Sample Data: 3 customers, 8 products, 3 orders
echo.
echo ================================================
echo NEXT STEPS:
echo ================================================
echo.
echo 1. Copy .env.example to .env
echo    copy .env.example .env
echo.
echo 2. Edit .env and update DATABASE_URL with your password:
echo    DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/garment_production"
echo.
echo 3. Install dependencies:
echo    npm install
echo.
echo 4. Generate Prisma Client:
echo    npx prisma generate
echo.
echo 5. Start backend:
echo    npm run dev
echo.
echo 6. Start frontend (new terminal):
echo    cd frontend
echo    npm install
echo    npm run dev
echo.
echo 7. Open browser:
echo    http://localhost:5173
echo.
echo 8. Login:
echo    Username: admin
echo    Password: admin123
echo.
echo ================================================
echo For detailed instructions, see:
echo - FOR_TESTER.md
echo - IMPORT_DATABASE.md
echo - DATABASE_SETUP.md
echo ================================================
echo.
pause
