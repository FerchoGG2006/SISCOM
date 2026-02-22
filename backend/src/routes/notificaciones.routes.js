const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const notificacionesController = require('../controllers/notificaciones.controller');

router.use(authMiddleware);

router.get('/', notificacionesController.obtenerTodas);
router.put('/:id/leer', notificacionesController.marcarLeida);
router.put('/leer-todas', notificacionesController.marcarTodasLeidas);

module.exports = router;
