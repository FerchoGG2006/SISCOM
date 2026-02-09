# SISCOM - Sistema de Gestión para Comisarías de Familia

Sistema integral para digitalizar y automatizar el flujo de casos en Comisarías de Familia, diseñado para reemplazar procesos manuales en Excel y papel por una plataforma web centralizada.

## 🏛️ Descripción

SISCOM es una solución tecnológica que permite:

- **Radicación automatizada** de casos con generación de números únicos (HS-2026-XXXXX)
- **Valoración de riesgo** en tiempo real con las 52 preguntas del instrumento técnico del Ministerio de Justicia
- **Integración con Google Drive** para almacenamiento automático de documentos
- **Módulo de firma digital** para validación de instrumentos
- **Generación automática de PDFs** para oficios y notificaciones

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + Express.js
- **MySQL** para persistencia de datos
- **Google APIs** para integración con Drive
- **PDFKit** para generación de documentos
- **JWT** para autenticación

### Frontend
- **React 18** con Vite
- **React Router** para navegación
- **Zustand** para gestión de estado
- **React Signature Canvas** para firma digital
- **Lucide React** para iconografía

## 📁 Estructura del Proyecto

```
SISCOM/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuraciones (DB, logger)
│   │   ├── controllers/      # Controladores
│   │   ├── middleware/       # Middlewares (auth, validación)
│   │   ├── routes/           # Rutas de la API
│   │   ├── services/         # Servicios (Drive, Riesgo, PDF)
│   │   └── server.js         # Punto de entrada
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   └── steps/        # Pasos del formulario
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── services/         # Cliente API
│   │   ├── store/            # Estado global (Zustand)
│   │   └── styles/           # Estilos CSS
│   ├── index.html
│   └── package.json
│
└── database/
    └── schema.sql            # Script de base de datos
```

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- Cuenta de Google Cloud con API de Drive habilitada

### 1. Base de Datos

```bash
# Crear la base de datos
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo
npm run dev
```

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno (Backend)

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=siscom_db

# JWT
JWT_SECRET=tu_secreto_jwt

# Google Drive
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=id_carpeta_raiz

# Prefijo de radicados
RADICADO_PREFIX=HS
```

### Configuración de Google Drive

1. Crear un proyecto en Google Cloud Console
2. Habilitar la API de Google Drive
3. Crear una cuenta de servicio
4. Descargar las credenciales JSON
5. Compartir la carpeta de Drive con el email de la cuenta de servicio

## 📊 Motor de Cálculo de Riesgo

El sistema implementa el instrumento técnico del Ministerio de Justicia con 52 preguntas divididas en 7 secciones:

| Sección | Descripción | Puntos |
|---------|-------------|--------|
| 1-8 | Violencia Psicológica | 1 c/u |
| 9-16 | Violencia Económica y Patrimonial | 1 c/u |
| 17-22 | Amenazas y Coerción | 10 c/u |
| 23-30 | Violencia Física | 20 c/u |
| 31-35 | Violencia Sexual | 20 c/u |
| 36-45 | Circunstancias Agravantes | 10 c/u |
| 46-52 | Percepción de Muerte | 20 c/u |

### Niveles de Riesgo

- **Bajo**: 0-16 puntos
- **Medio**: 17-50 puntos
- **Alto**: 51-150 puntos
- **Extremo**: 151+ puntos

## 📱 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Refrescar token

### Expedientes
- `POST /api/v1/expedientes/radicar` - Radicar nuevo caso
- `GET /api/v1/expedientes` - Listar expedientes
- `GET /api/v1/expedientes/:id` - Detalle de expediente

### Valoración de Riesgo
- `POST /api/v1/valoracion/calcular` - Calcular riesgo en tiempo real
- `POST /api/v1/valoracion/:expedienteId` - Guardar valoración

### Personas
- `GET /api/v1/personas` - Listar personas
- `GET /api/v1/personas/:id` - Detalle de persona

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting para prevenir ataques
- Validación de inputs con express-validator
- Logs de auditoría para todas las acciones
- Encriptación de contraseñas con bcrypt

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncion`)
3. Commit tus cambios (`git commit -m 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/NuevaFuncion`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**SISCOM** - Sistema de Gestión para Comisarías de Familia
Desarrollado con ❤️ para la protección de víctimas de violencia
