/**
 * SISCOM - Rutas de Documentos
 * Endpoints para generación y descarga de documentos PDF
 */

const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const documentosController = require('../controllers/documentos.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Generación de documentos
router.post(
    '/:expedienteId/formato-recepcion',
    roleMiddleware('admin', 'comisario', 'psicologo', 'trabajador_social'),
    documentosController.generarFormatoRecepcion
);

router.post(
    '/:expedienteId/valoracion-riesgo',
    roleMiddleware('admin', 'comisario', 'psicologo', 'trabajador_social'),
    documentosController.generarValoracionRiesgo
);

router.post(
    '/:expedienteId/medidas-proteccion',
    roleMiddleware('admin', 'comisario'),
    documentosController.generarMedidasProteccion
);

router.post(
    '/:expedienteId/oficio-policia',
    roleMiddleware('admin', 'comisario', 'trabajador_social'),
    documentosController.generarOficioPolicia
);

router.post(
    '/:expedienteId/oficio-salud',
    roleMiddleware('admin', 'comisario', 'trabajador_social'),
    documentosController.generarOficioSalud
);

// Listar documentos de un expediente
router.get('/:expedienteId', documentosController.listarDocumentos);

// Descargar documento
router.get('/download/:expedienteId/:fileName', documentosController.descargarDocumento);

module.exports = router;
