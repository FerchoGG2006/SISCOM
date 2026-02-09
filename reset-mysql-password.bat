@echo off
echo ============================================
echo   SISCOM - Reset de Contraseña MySQL
echo ============================================
echo.

echo [1/4] Deteniendo servicio MySQL...
net stop MySQL80
timeout /t 3

echo.
echo [2/4] Iniciando MySQL sin autenticacion...
echo (Espera 5 segundos...)
start /b "MySQL" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables --shared-memory
timeout /t 5

echo.
echo [3/4] Cambiando contraseña a: Siscom2026
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'Siscom2026';"

echo.
echo [4/4] Reiniciando MySQL normalmente...
taskkill /f /im mysqld.exe 2>nul
timeout /t 2
net start MySQL80

echo.
echo ============================================
echo   COMPLETADO!
echo   Nueva contraseña: Siscom2026
echo ============================================
echo.
pause
