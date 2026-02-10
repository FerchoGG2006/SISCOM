const express = require('express');
const router = express.Router();
const ExpedientesController = require('../controllers/expedientes.prisma.controller');
const ActuacionController = require('../controllers/actuaciones.controller');
const DocumentoController = require('../controllers/documentos.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', ExpedientesController.listar);
router.get('/:id', ExpedientesController.obtener);
router.post('/:id/actuaciones', ActuacionController.crear);
router.post('/:id/documentos/:tipo', DocumentoController.generar);

module.exports = router;



