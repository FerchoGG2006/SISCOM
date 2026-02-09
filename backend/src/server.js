/**
 * SISCOM - Sistema de Gestión para Comisarías de Familia
 * Servidor Principal Express.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar configuraciones
// Importar configuraciones
const { testConnection } = require('./config/database');
const initDatabase = require('./database/init');
const logger = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const expedientesRoutes = require('./routes/expedientes.routes');
const personasRoutes = require('./routes/personas.routes');
const valoracionRoutes = require('./routes/valoracion.routes');
const documentosRoutes = require('./routes/documentos.routes');
const driveRoutes = require('./routes/drive.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const reportesRoutes = require('./routes/reportes.routes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// =====================================================
// MIDDLEWARES GLOBALES
// =====================================================

// Seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Demasiadas solicitudes. Por favor, intente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging de requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// =====================================================
// RUTAS
// =====================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SISCOM API está funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/expedientes`, expedientesRoutes);
app.use(`${API_PREFIX}/personas`, personasRoutes);
app.use(`${API_PREFIX}/valoracion`, valoracionRoutes);
app.use(`${API_PREFIX}/documentos`, documentosRoutes);
app.use(`${API_PREFIX}/drive`, driveRoutes);
app.use(`${API_PREFIX}/usuarios`, usuariosRoutes);
app.use(`${API_PREFIX}/reportes`, reportesRoutes);

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        path: req.path
    });
});

// Error handler global
app.use((err, req, res, next) => {
    logger.error('Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors
        });
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

async function startServer() {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        // Inicializar base de datos SQLite
        await initDatabase();
        logger.info('✅ Conexión a SQLite establecida y base de datos inicializada');

        // Iniciar servidor
        app.listen(PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏛️  SISCOM - Sistema de Gestión de Comisarías          ║
║                                                           ║
║   📍 Servidor: http://localhost:${PORT}                    ║
║   📍 API: http://localhost:${PORT}${API_PREFIX}              ║
║   📍 Entorno: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        logger.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
