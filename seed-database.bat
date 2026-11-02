@echo off
echo Seeding Employee360 Database with demo data...
cd /d %~dp0backend
npm.cmd run seed
pause
