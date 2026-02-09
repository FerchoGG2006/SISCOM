@echo off
echo ============================================
echo   SOLUCION COMPLETA MYSQL - SISCOM
echo ============================================
echo.

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo [1/6] Deteniendo servicio MySQL...
net stop MySQL80 2>nul
timeout /t 3 /nobreak >nul

echo [2/6] Eliminando archivos de autenticacion antiguos...
del /f /q "C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.pid" 2>nul

echo [3/6] Iniciando MySQL en modo seguro...
start /b mysqld.exe --skip-grant-tables --skip-networking --shared-memory
timeout /t 8 /nobreak >nul

echo [4/6] Reseteando contraseña root...
mysql.exe -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'Siscom2026'; FLUSH PRIVILEGES;"

echo [5/6] Cerrando MySQL modo seguro...
taskkill /f /im mysqld.exe 2>nul
timeout /t 3 /nobreak >nul

echo [6/6] Iniciando MySQL normalmente...
net start MySQL80
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   PROBANDO CONEXION...
echo ============================================
mysql.exe -u root -pSiscom2026 -e "SELECT 'CONEXION EXITOSA!' as RESULTADO;"

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   EXITO! MySQL esta listo
    echo   Contrasena: Siscom2026
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   FALLO - Intentando crear usuario nuevo...
    echo ============================================
    net stop MySQL80
    timeout /t 2 /nobreak >nul
    start /b mysqld.exe --skip-grant-tables --skip-networking --shared-memory
    timeout /t 5 /nobreak >nul
    mysql.exe -u root -e "FLUSH PRIVILEGES; DROP USER IF EXISTS 'siscom'@'localhost'; CREATE USER 'siscom'@'localhost' IDENTIFIED BY 'Siscom2026'; GRANT ALL PRIVILEGES ON *.* TO 'siscom'@'localhost' WITH GRANT OPTION; FLUSH PRIVILEGES;"
    taskkill /f /im mysqld.exe 2>nul
    timeout /t 2 /nobreak >nul
    net start MySQL80
    echo.
    echo USUARIO ALTERNATIVO CREADO:
    echo   Usuario: siscom
    echo   Contrasena: Siscom2026
)

echo.
pause
