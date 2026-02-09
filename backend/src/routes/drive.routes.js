/**
 * SISCOM - Rutas de Google Drive
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const googleDrive = require('../services/googleDrive.service');

router.post('/crear-carpeta/:radicado', authMiddleware, async (req, res) => {
    try {
        const { radicado } = req.params;
        const { nombreVictima } = req.body;

        const result = await googleDrive.createExpedienteFolder(radicado, nombreVictima);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
