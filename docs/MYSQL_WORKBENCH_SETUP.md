# 🗄️ Guía Paso a Paso: Crear Base de Datos SISCOM en MySQL Workbench

Esta guía te llevará paso a paso por el proceso de crear la base de datos del sistema SISCOM.

---

## 📋 Pre-requisitos

- ✅ MySQL Server instalado y funcionando
- ✅ MySQL Workbench instalado
- ✅ Conocer tu contraseña de root de MySQL

---

## Paso 1: Abrir MySQL Workbench

1. Busca **"MySQL Workbench"** en el menú de inicio de Windows
2. Haz clic para abrirlo
3. Espera a que cargue la interfaz principal

![Workbench Home](https://i.imgur.com/workbench-home.png)

---

## Paso 2: Conectarse al Servidor MySQL

1. En la pantalla principal, verás una sección **"MySQL Connections"**
2. Haz clic en tu conexión local (generalmente dice **"Local instance MySQL80"** o similar)
3. Si te pide contraseña, ingresa la contraseña de tu usuario **root**
4. Haz clic en **OK**

```
┌─────────────────────────────────────────────────────────┐
│  MySQL Connections                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🖥️ Local instance MySQL80                      │   │
│  │     localhost:3306                               │   │
│  │     root                                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Paso 3: Abrir el Archivo SQL

Una vez conectado, verás la interfaz del editor SQL.

1. Ve al menú superior: **File** → **Open SQL Script...**
   - O usa el atajo: `Ctrl + Shift + O`

2. En el explorador de archivos, navega a:
   ```
   c:\Users\telep\OneDrive\Desktop\SISCOM\database\
   ```

3. Selecciona el archivo: **schema.sql**

4. Haz clic en **Open**

```
┌─────────────────────────────────────────────────────────┐
│  File   Edit   View   Query   Database   Server   ...   │
├─────────────────────────────────────────────────────────┤
│  ├── Open SQL Script...     Ctrl+Shift+O                │
│  ├── Open SQL Script in New Tab                         │
│  ├── ...                                                │
└─────────────────────────────────────────────────────────┘
```

---

## Paso 4: Revisar el Script

Ahora verás el contenido del archivo `schema.sql` en el editor.

El script contiene:
- ✅ Creación de la base de datos `siscom_db`
- ✅ Creación de todas las tablas (usuarios, personas, expedientes, etc.)
- ✅ Procedimientos almacenados
- ✅ Triggers
- ✅ Usuario de prueba (admin@siscom.gov.co)

```sql
-- =====================================================
-- SISCOM - Base de Datos
-- Sistema de Gestión para Comisarías de Familia
-- =====================================================

DROP DATABASE IF EXISTS siscom_db;
CREATE DATABASE siscom_db;
USE siscom_db;
...
```

---

## Paso 5: Ejecutar TODO el Script

Esta es la parte más importante:

### Opción A: Ejecutar todo (Recomendado)

1. Asegúrate de que **TODO el script esté visible** (no selecciones nada específico)

2. Haz clic en el botón **"Execute"** (icono del rayo ⚡)
   - Está en la barra de herramientas del editor
   - O usa el atajo: `Ctrl + Shift + Enter`

```
┌─────────────────────────────────────────────────────────┐
│  📁  💾  ▶️⚡  ⏹️  🔍  ...                              │
│           ↑                                             │
│     Clic aquí para ejecutar                             │
│     (Execute - Rayo amarillo)                           │
└─────────────────────────────────────────────────────────┘
```

### Opción B: Ejecutar paso a paso

Si prefieres ejecutar por secciones:
1. Selecciona el código que quieres ejecutar
2. Clic en ⚡ Execute (solo ejecutará lo seleccionado)

---

## Paso 6: Verificar la Ejecución

Después de ejecutar, observa la sección **"Action Output"** en la parte inferior:

### ✅ Si fue exitoso, verás:
```
┌─────────────────────────────────────────────────────────┐
│  Action Output                                          │
├─────────────────────────────────────────────────────────┤
│  ✓ 0 row(s) affected                                   │
│  ✓ 1 row(s) affected                                   │
│  ✓ 0 row(s) affected Records: 0  Duplicates: 0        │
│  ...                                                    │
│  ✓ 1 row(s) affected (Usuario admin insertado)         │
└─────────────────────────────────────────────────────────┘
```

### ❌ Si hay errores:
- El texto aparecerá en **rojo**
- Lee el mensaje de error para identificar el problema
- El error más común es intentar ejecutar cuando ya existe la base de datos
  (el script incluye `DROP DATABASE IF EXISTS` para evitar esto)

---

## Paso 7: Refrescar el Panel de Esquemas

1. En el panel izquierdo, busca la sección **"SCHEMAS"**

2. Haz clic derecho en cualquier lugar → **Refresh All**
   - O haz clic en el icono de refrescar 🔄

3. Ahora deberías ver: **siscom_db**

```
┌─────────────────────────┐
│  SCHEMAS                │
│  🔄 Refresh All         │
├─────────────────────────┤
│  📁 siscom_db          │
│  ├── 📁 Tables         │
│  │   ├── actuaciones   │
│  │   ├── auditoria     │
│  │   ├── documentos    │
│  │   ├── expediente... │
│  │   ├── expedientes   │
│  │   ├── notificacion  │
│  │   ├── personas      │
│  │   ├── usuarios      │
│  │   └── valoracion... │
│  ├── 📁 Views          │
│  ├── 📁 Stored Proce...│
│  └── 📁 Functions      │
└─────────────────────────┘
```

---

## Paso 8: Verificar el Usuario de Prueba

Para confirmar que todo está correcto, ejecuta esta consulta:

1. En el editor SQL, escribe:
```sql
USE siscom_db;
SELECT id, nombres, apellidos, email, rol FROM usuarios;
```

2. Ejecuta con `Ctrl + Enter` o clic en ⚡

3. Deberías ver:

| id | nombres | apellidos | email | rol |
|----|---------|-----------|-------|-----|
| 1 | Admin | Sistema | admin@siscom.gov.co | admin |

---

## ✅ ¡Listo! Base de Datos Creada

La base de datos está lista. Ahora necesitas:

### Configurar el Backend

1. Abre el archivo: `c:\Users\telep\OneDrive\Desktop\SISCOM\backend\.env`

2. Edita la línea `DB_PASSWORD` con tu contraseña de MySQL:
```env
DB_PASSWORD=tu_password_de_mysql_aqui
```

3. Guarda el archivo

### Iniciar el Backend

```bash
cd c:\Users\telep\OneDrive\Desktop\SISCOM\backend
npm run dev
```

---

## 🔐 Credenciales de Acceso al Sistema

Una vez que el backend esté funcionando, puedes acceder a:

- **URL**: http://localhost:3000
- **Email**: `admin@siscom.gov.co`
- **Password**: `admin123`

---

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'"
- Verifica que la contraseña sea correcta
- Asegúrate de que MySQL Server esté corriendo

### Error: "Can't connect to MySQL server"
- Abre "Servicios" de Windows
- Busca "MySQL80" y asegúrate de que esté "En ejecución"
- Si no, clic derecho → Iniciar

### Error: "Table already exists"
- El script ya incluye `DROP` antes de `CREATE`
- Si persiste, ejecuta manualmente: `DROP DATABASE siscom_db;` y vuelve a ejecutar todo

---

*Guía creada para SISCOM - Sistema de Gestión para Comisarías de Familia*
