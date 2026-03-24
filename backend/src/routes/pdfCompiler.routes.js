const express = require('express');
const router = express.Router();
const pdfCompilerController = require('../controllers/pdfCompiler.controller');

router.post('/:idExpediente', pdfCompilerController.compilarExpediente);

module.exports = router;
