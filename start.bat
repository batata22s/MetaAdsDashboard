@echo off
echo ==========================================
echo   META ADS DASHBOARD - Starting...
echo ==========================================
echo.
echo Starting Backend (port 3001)...
start cmd /k "cd /d c:\Users\homid\MetaAdsDashboard\backend && node src/index.js"
echo Starting Frontend (port 5173)...
timeout /t 2 >nul
start cmd /k "cd /d c:\Users\homid\MetaAdsDashboard\frontend && npx vite"
echo.
echo Dashboard: http://localhost:5173
echo API:       http://localhost:3001
echo.
pause
