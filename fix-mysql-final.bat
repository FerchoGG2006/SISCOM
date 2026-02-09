@echo off
echo ============================================
echo   SOLUCION DEFINITIVA v2 - MYSQL SISCOM
echo ============================================
echo.

echo [1/7] Deteniendo MySQL...
net stop MySQL80 2>nul
timeout /t 3 /nobreak >nul

echo [2/7] Agregando skip-grant-tables al archivo my.ini...
echo skip-grant-tables >> "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
echo shared-memory >> "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"

echo [3/7] Iniciando MySQL...
net start MySQL80
timeout /t 8 /nobreak >nul

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo [4/7] Reseteando contrasena de root (via shared memory)...
mysql.exe -u root --protocol=memory -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'Siscom2026'; FLUSH PRIVILEGES;" 2>nul

if %errorlevel% neq 0 (
    echo Intentando via socket...
    mysql.exe -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'Siscom2026'; FLUSH PRIVILEGES;" 2>nul
)

echo [5/7] Quitando skip-grant-tables del my.ini...
powershell -Command "$content = Get-Content 'C:\ProgramData\MySQL\MySQL Server 8.0\my.ini' | Where-Object { $_ -ne 'skip-grant-tables' -and $_ -ne 'shared-memory' }; Set-Content 'C:\ProgramData\MySQL\MySQL Server 8.0\my.ini' -Value $content"

echo [6/7] Reiniciando MySQL normalmente...
net stop MySQL80 2>nul
timeout /t 3 /nobreak >nul
net start MySQL80
timeout /t 8 /nobreak >nul

echo [7/7] Creando base de datos SISCOM...
echo Probando conexion...
mysql.exe -u root -pSiscom2026 -h 127.0.0.1 -P 3308 -e "SELECT 'Conexion OK';" 2>nul

if %errorlevel% equ 0 (
    echo Conexion exitosa! Creando base de datos...
    mysql.exe -u root -pSiscom2026 -h 127.0.0.1 -P 3308 < "c:\Users\telep\OneDrive\Desktop\SISCOM\database\schema.sql"
    echo.
    echo ============================================
    echo   EXITO! BASE DE DATOS CREADA
    echo ============================================
    mysql.exe -u root -pSiscom2026 -h 127.0.0.1 -P 3308 -e "USE siscom_db; SHOW TABLES;"
    echo.
    echo Usuario: root
    echo Contrasena: Siscom2026
    echo Puerto: 3308
) else (
    echo.
    echo ============================================
    echo   AUN NO FUNCIONA - ULTIMA OPCION
    echo ============================================
    echo.
    echo La unica solucion es reinstalar MySQL:
    echo.
    echo 1. Abre "MySQL Installer" del menu inicio
    echo 2. Selecciona MySQL Server y clic en "Remove"
    echo 3. Luego clic en "Add" y selecciona MySQL Server
    echo 4. Durante la instalacion, pon contrasena: Siscom2026
    echo 5. Ejecuta este script de nuevo
    echo.
)

echo.
pause
