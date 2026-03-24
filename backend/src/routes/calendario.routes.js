const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendarioController');
// const { verifyToken } = require('../middlewares/auth'); // Opcional, si está activo

router.get('/', calendarioController.getEventos);
router.post('/', calendarioController.createEvento);
router.put('/:id', calendarioController.updateEvento);
router.delete('/:id', calendarioController.deleteEvento);

module.exports = router;
