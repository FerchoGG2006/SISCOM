const express = require('express');
const router = express.Router();
const redesController = require('../controllers/redesController');

router.get('/grafos', redesController.getGrafos);

module.exports = router;
