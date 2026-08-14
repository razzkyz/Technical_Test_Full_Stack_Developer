@echo off
echo ========================================
echo Database Export Script
echo ========================================
echo.

REM Set variables
set DB_NAME=garment_production
set DB_USER=postgres
set BACKUP_DIR=database-backup
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/4] Exporting database schema and data...
pg_dump -U %DB_USER% -d %DB_NAME% -f "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
if errorlevel 1 (
    echo ERROR: Failed to export database!
    echo.
    echo Possible reasons:
    echo - PostgreSQL not installed
    echo - Database does not exist
    echo - Wrong password
    echo.
    pause
    exit /b 1
)

echo [2/4] Exporting compressed backup...
pg_dump -U %DB_USER% -d %DB_NAME% -F c -f "%BACKUP_DIR%\backup_%TIMESTAMP%.dump"

echo [3/4] Exporting schema only...
pg_dump -U %DB_USER% -d %DB_NAME% --schema-only -f "%BACKUP_DIR%\schema_%TIMESTAMP%.sql"

echo [4/4] Creating README for tester...
(
echo DATABASE BACKUP
echo ===============
echo.
echo Created: %date% %time%
echo Database: %DB_NAME%
echo.
echo FILES:
echo ------
echo 1. backup_%TIMESTAMP%.sql    - Full backup ^(schema + data^)
echo 2. backup_%TIMESTAMP%.dump   - Compressed backup
echo 3. schema_%TIMESTAMP%.sql    - Schema only
echo 4. README.txt                - This file
echo.
echo HOW TO IMPORT:
echo --------------
echo.
echo Option 1: Import SQL file
echo   psql -U postgres -d garment_production -f backup_%TIMESTAMP%.sql
echo.
echo Option 2: Import dump file
echo   pg_restore -U postgres -d garment_production backup_%TIMESTAMP%.dump
echo.
echo BEFORE IMPORTING:
echo -----------------
echo 1. Install PostgreSQL from https://www.postgresql.org/download/
echo 2. Create database: CREATE DATABASE garment_production;
echo 3. Run import command above
echo.
echo AFTER IMPORTING:
echo ----------------
echo 1. Copy .env.example to .env
echo 2. Update DATABASE_URL with your PostgreSQL password
echo 3. Run: npm install
echo 4. Run: npm run dev
echo 5. Login with: admin / admin123
echo.
echo For detailed instructions, see DATABASE_SETUP.md
echo.
) > "%BACKUP_DIR%\README.txt"

echo.
echo ========================================
echo Export Complete!
echo ========================================
echo.
echo Files saved to: %BACKUP_DIR%\
echo.
dir "%BACKUP_DIR%"
echo.
echo Next steps:
echo 1. Zip the '%BACKUP_DIR%' folder
echo 2. Send to tester along with:
echo    - DATABASE_SETUP.md
echo    - .env.example
echo    - README.md
echo.
pause
