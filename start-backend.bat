@echo off
echo Starting Employee360 Backend on Port 5000...
cd /d %~dp0backend
npm.cmd run dev
