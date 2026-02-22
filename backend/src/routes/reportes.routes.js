const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const reportesController = require('../controllers/reportes.prisma.controller');

router.use(authMiddleware);

router.get('/estadisticas', reportesController.estadisticasGenerales);
router.get('/exportar-excel', reportesController.exportarExcel);

module.exports = router;

