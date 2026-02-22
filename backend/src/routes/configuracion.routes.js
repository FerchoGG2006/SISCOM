const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const configuracionController = require('../controllers/configuracion.controller');

// Solo admin puede gestionar configuración
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', configuracionController.obtener);
router.put('/', configuracionController.actualizar);

module.exports = router;
