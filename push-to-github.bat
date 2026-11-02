@echo off
cd /d "%~dp0"
echo ===================================================
echo Pushing Employee360 to GitHub (main branch)...
echo If prompted, select "Sign in with your browser".
echo ===================================================
git push -u origin main
echo.
pause
