const express = require('express');
const router = express.Router();
const radicacionController = require('../controllers/radicacionController');

router.post('/', radicacionController.radicarCaso);
router.post('/valoracion/calcular', radicacionController.calcularRiesgo);

module.exports = router;
