const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const statsController = require('../controllers/stats.controller');

router.use(authMiddleware);

router.get('/summary', statsController.getSummary);
router.get('/barrios', statsController.getByBarrio);
router.get('/trends', statsController.getTrends);

module.exports = router;
