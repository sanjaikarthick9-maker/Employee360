@echo off
echo ========================================================
echo   Starting EMPLOYEE360 System (Backend + Frontend)
echo ========================================================
echo.
start "Employee360 Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm.cmd run dev"
timeout /t 2 /nobreak >nul
start "Employee360 Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"
echo.
echo Both services are launching in separate windows:
echo - Backend:  http://localhost:5000/api/health
echo - Frontend: http://localhost:3000
echo.
