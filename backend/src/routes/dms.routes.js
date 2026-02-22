const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth.middleware');
const dmsController = require('../controllers/dms.controller');

// Configuración de almacenamiento temporal para Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // Límite de 25MB por archivo
});

router.use(authMiddleware);

// Ruta para subir evidencias (fotos, videos, audios)
router.post('/subir', upload.single('archivo'), dmsController.subirEvidencia);

module.exports = router;
