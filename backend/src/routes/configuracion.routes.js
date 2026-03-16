const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const configuracionController = require('../controllers/configuracion.controller');

// Solo admin puede gestionar configuración
// La protección por rol se maneja en cada ruta individualmente
router.use(authMiddleware);
// router.use(roleMiddleware('admin')); // Eliminado para permitir GET por comisario

router.get('/', roleMiddleware('admin', 'comisario'), configuracionController.obtener);
router.put('/', roleMiddleware('admin'), configuracionController.actualizar);

module.exports = router;
