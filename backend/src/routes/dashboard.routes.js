const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/stats', verifyToken, dashboardController.getStats);

module.exports = router;
