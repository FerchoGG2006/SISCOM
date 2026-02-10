const express = require('express');
const router = express.Router();
const ExpedientesController = require('../controllers/expedientes.prisma.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', ExpedientesController.listar);
router.get('/:id', ExpedientesController.obtener);

module.exports = router;

