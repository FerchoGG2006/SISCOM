@echo off
echo ============================================
echo   CREANDO BASE DE DATOS SISCOM
echo   Puerto: 3306 (nuevo)
echo ============================================
echo.

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo Conectando a MySQL...
mysql.exe -u root -pSiscom2026 -e "SELECT 'Conexion OK' as Estado;"

if %errorlevel% equ 0 (
    echo.
    echo Conexion exitosa! Creando base de datos...
    mysql.exe -u root -pSiscom2026 < "c:\Users\telep\OneDrive\Desktop\SISCOM\database\schema.sql"
    
    if %errorlevel% equ 0 (
        echo.
        echo ============================================
        echo   BASE DE DATOS CREADA EXITOSAMENTE!
        echo ============================================
        echo.
        echo Tablas creadas:
        mysql.exe -u root -pSiscom2026 -e "USE siscom_db; SHOW TABLES;"
        echo.
        echo Usuario admin:
        mysql.exe -u root -pSiscom2026 -e "USE siscom_db; SELECT id, nombres, apellidos, email, rol FROM usuarios;"
        echo.
        echo ============================================
        echo   LISTO PARA USAR!
        echo   Usuario MySQL: root
        echo   Contrasena: Siscom2026
        echo   Puerto: 3306
        echo ============================================
    ) else (
        echo ERROR al ejecutar el script SQL
    )
) else (
    echo ERROR: No se pudo conectar a MySQL
    echo Verifica que la contrasena sea correcta
)

echo.
pause
