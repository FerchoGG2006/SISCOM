# Guía de Configuración de Google Drive para SISCOM

Esta guía detalla paso a paso cómo configurar la integración con Google Drive para el almacenamiento automático de documentos.

## 📋 Pre-requisitos

- Cuenta de Google (preferiblemente institucional)
- Acceso a Google Cloud Console
- Permisos para crear proyectos y cuentas de servicio

## 🔧 Paso 1: Crear Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com)

2. Hacer clic en el selector de proyectos (parte superior)

3. Clic en **"Nuevo Proyecto"**:
   - **Nombre del proyecto**: `SISCOM-DriveIntegration`
   - **Organización**: Seleccionar la de su entidad (o ninguna)
   - Clic en **"Crear"**

4. Esperar a que se cree el proyecto y seleccionarlo

## 🔌 Paso 2: Habilitar la API de Google Drive

1. En el menú lateral, ir a **"APIs y servicios"** > **"Biblioteca"**

2. Buscar **"Google Drive API"**

3. Clic en el resultado y luego en **"Habilitar"**

4. Esperar a que se active (puede tomar unos segundos)

## 🔐 Paso 3: Crear Cuenta de Servicio

1. Ir a **"APIs y servicios"** > **"Credenciales"**

2. Clic en **"+ Crear credenciales"** > **"Cuenta de servicio"**

3. Completar el formulario:
   ```
   Nombre: siscom-drive-service
   ID: siscom-drive-service
   Descripción: Cuenta de servicio para SISCOM - Gestión de documentos
   ```

4. Clic en **"Crear y continuar"**

5. En "Otorgar acceso...", seleccionar el rol:
   - **"Básico"** > **"Editor"**
   
6. Clic en **"Continuar"** y luego **"Listo"**

## 🔑 Paso 4: Generar Clave JSON

1. En la lista de cuentas de servicio, clic en la que acabamos de crear

2. Ir a la pestaña **"Claves"**

3. Clic en **"Agregar clave"** > **"Crear clave nueva"**

4. Seleccionar **"JSON"** y clic en **"Crear"**

5. Se descargará automáticamente un archivo `.json` - **¡GUÁRDELO DE FORMA SEGURA!**

6. Renombrar el archivo a: `google-service-account.json`

7. Mover el archivo a la carpeta del proyecto:
   ```
   SISCOM/
   └── backend/
       └── credentials/
           └── google-service-account.json
   ```

## 📁 Paso 5: Crear Carpeta Raíz en Drive

1. Ir a [Google Drive](https://drive.google.com)

2. Crear una nueva carpeta llamada: **"SISCOM - Expedientes"**

3. Clic derecho en la carpeta > **"Compartir"**

4. Agregar el email de la cuenta de servicio (aparece en el archivo JSON como `client_email`, ejemplo: `siscom-drive-service@proyecto.iam.gserviceaccount.com`)

5. Dar permiso de **"Editor"**

6. Obtener el ID de la carpeta:
   - Abrir la carpeta
   - Ver la URL: `https://drive.google.com/drive/folders/XXXXXXXXXXXXXXXXXXXXX`
   - El ID es la parte `XXXXXXXXXXXXXXXXXXXXX`

## ⚙️ Paso 6: Configurar Variables de Entorno

Editar el archivo `.env` del backend:

```env
# Google Drive Configuration
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=XXXXXXXXXXXXXXXXXXXXX
```

Reemplazar `XXXXXXXXXXXXXXXXXXXXX` con el ID de la carpeta obtenido en el paso anterior.

## ✅ Paso 7: Verificar Conexión

Ejecutar el siguiente comando para verificar que todo funciona:

```bash
cd backend
node -e "
const driveService = require('./src/services/googleDrive.service');

async function test() {
    try {
        const result = await driveService.createExpedienteFolder('TEST-2026-00001');
        console.log('✅ Conexión exitosa!');
        console.log('Carpeta creada:', result.folderUrl);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}
test();
"
```

Si ves "Conexión exitosa!", la configuración está completa.

## 📂 Estructura de Carpetas Creadas

Cuando se radica un caso, el sistema crea automáticamente:

```
SISCOM - Expedientes/
└── HS-2026-00001/
    ├── 01_Recepcion/
    ├── 02_Valoracion_Riesgo/
    ├── 03_Medidas_Proteccion/
    ├── 04_Audiencias/
    ├── 05_Oficios/
    └── 06_Anexos/
```

## 🔒 Consideraciones de Seguridad

1. **NUNCA** subir el archivo `google-service-account.json` a repositorios públicos

2. Agregar al `.gitignore`:
   ```
   credentials/
   *.json
   ```

3. En producción, usar variables de entorno o servicios de gestión de secretos

4. Limitar los permisos de la cuenta de servicio solo a las carpetas necesarias

## 🐛 Solución de Problemas

### Error: "The caller does not have permission"
- Verificar que la cuenta de servicio tiene acceso a la carpeta
- Confirmar que el ID de la carpeta es correcto

### Error: "API not enabled"
- Ir a Cloud Console y habilitar Google Drive API

### Error: "Invalid credentials"
- Verificar la ruta del archivo de credenciales
- Regenerar las claves si es necesario

### Los archivos no aparecen en Drive
- Los archivos subidos por cuentas de servicio solo son visibles si están en carpetas compartidas
- Verificar que la carpeta raíz está compartida con usuarios humanos

## 📞 Soporte

Para problemas con la configuración de Google Cloud:
- [Documentación oficial de Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Cloud Support](https://cloud.google.com/support)

---

*Última actualización: Febrero 2026*
