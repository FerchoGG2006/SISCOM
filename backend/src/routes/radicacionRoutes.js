const express = require('express');
const router = express.Router();
const radicacionController = require('../controllers/radicacionController');

router.post('/', radicacionController.radicarCaso);

module.exports = router;
