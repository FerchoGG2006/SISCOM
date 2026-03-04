const express = require('express');
const router = express.Router();
const personasController = require('../controllers/personas.controller');
// const { authMiddleware } = require('../middleware/auth.middleware'); // Optional: Add if auth is required

router.get('/', personasController.getPersonas);
router.get('/buscar/:documento', personasController.getPersonaByDocumento);
router.get('/:id', personasController.getPersonaById);

module.exports = router;

