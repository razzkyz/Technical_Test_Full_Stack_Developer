@echo off
echo ========================================
echo  Garment Production System
echo  Starting Backend and Frontend Servers
echo ========================================
echo.

REM Kill any existing node processes first
echo [0/2] Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend in new window with QuickEdit DISABLED
echo [1/2] Starting Backend Server...
start "Backend Server" powershell -NoExit -Command "$host.UI.RawUI.WindowTitle='Backend Server (port 3000)'; Set-ItemProperty 'HKCU:\Console' QuickEdit 0 -ErrorAction SilentlyContinue; cd '%~dp0'; npm run dev"
timeout /t 5 /nobreak >nul

REM Start Frontend in new window with QuickEdit DISABLED
echo [2/2] Starting Frontend Server...
start "Frontend Server" powershell -NoExit -Command "$host.UI.RawUI.WindowTitle='Frontend Server (port 5173)'; Set-ItemProperty 'HKCU:\Console' QuickEdit 0 -ErrorAction SilentlyContinue; cd '%~dp0frontend'; npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  Servers are starting!
echo ========================================
echo  Backend:  http://localhost:3000
echo  Frontend: http://localhost:5173
echo.
echo  Login: admin / admin123
echo.
echo  JANGAN klik di dalam window server!
echo  Klik di sini tidak apa-apa.
echo ========================================
echo.
pause
