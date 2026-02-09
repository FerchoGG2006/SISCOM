@echo off
echo ============================================
echo   SISCOM - Reset de Contraseña MySQL
echo ============================================
echo.

echo [1/4] Deteniendo servicio MySQL...
net stop MySQL95
timeout /t 3

echo.
echo [2/4] Iniciando MySQL sin autenticacion...
echo (Espera 5 segundos...)
start /b "MySQL" "C:\Program Files\MySQL\MySQL Server 9.5\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 9.5\my.ini" --init-file="C:\Users\Fernando\SISCOM\reset_pass.sql" --console
timeout /t 10

echo.
echo [3/4] La contraseña ha sido cambiada a: Siscom2026
echo.

echo.
echo [4/4] Reiniciando MySQL normalmente...
taskkill /f /im mysqld.exe 2>nul
timeout /t 2
net start MySQL95

echo.
echo ============================================
echo   COMPLETADO!
echo   Nueva contraseña: Siscom2026
echo ============================================
echo.
pause
