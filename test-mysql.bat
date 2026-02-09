@echo off
cd /d "C:\Program Files\MySQL\MySQL Server 9.5\bin"
mysql.exe -u root -pSiscom2026 -e "SELECT 1 as test;" > "%TEMP%\mysql_test.txt" 2>&1
type "%TEMP%\mysql_test.txt"
pause
