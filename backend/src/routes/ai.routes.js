const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

// Todas las rutas de AI requieren autenticación
router.use(authMiddleware);

router.post('/analyze', aiController.analyze);
router.post('/summarize', aiController.summarize);

module.exports = router;
