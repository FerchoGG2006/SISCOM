/**
 * SISCOM - Rutas de Reportes
 * Endpoints para estadísticas y reportes
 */

const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const reportesController = require('../controllers/reportes.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Estadísticas generales (dashboard)
router.get('/estadisticas', reportesController.estadisticasGenerales);

// Reporte por período
router.get('/periodo',
    roleMiddleware('admin', 'comisario'),
    reportesController.reportePeriodo
);

// Reporte por funcionario
router.get('/funcionario',
    roleMiddleware('admin', 'comisario'),
    reportesController.reporteFuncionario
);

// Tendencia mensual
router.get('/tendencia', reportesController.tendenciaMensual);

module.exports = router;
