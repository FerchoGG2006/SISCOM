const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');

// Rutas públicas de consulta
router.post('/consulta', portalController.consultarCaso);

module.exports = router;
