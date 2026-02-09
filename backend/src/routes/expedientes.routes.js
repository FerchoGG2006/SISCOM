/**
 * SISCOM - Rutas de Expedientes
 */
const express = require('express');
const router = express.Router();
const { body, query: queryValidator, param } = require('express-validator');
const ExpedientesController = require('../controllers/expedientes.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

// Validaciones para radicación
const radicarValidation = [
    body('victima.primer_nombre').notEmpty().withMessage('El nombre de la víctima es requerido'),
    body('victima.primer_apellido').notEmpty().withMessage('El apellido de la víctima es requerido'),
    body('victima.tipo_documento').isIn(['CC', 'TI', 'CE', 'PA', 'RC', 'NUIP', 'PEP', 'PPT', 'SIN_DOCUMENTO']),
    body('agresor.primer_nombre').notEmpty().withMessage('El nombre del agresor es requerido'),
    body('agresor.primer_apellido').notEmpty().withMessage('El apellido del agresor es requerido'),
    body('datosHecho.tipo_caso').notEmpty().withMessage('El tipo de caso es requerido'),
    body('datosHecho.descripcion_hechos').notEmpty().withMessage('La descripción de los hechos es requerida')
];

// Rutas
router.post('/radicar', authMiddleware, radicarValidation, validateRequest, ExpedientesController.radicar);
router.get('/', authMiddleware, ExpedientesController.listar);
router.get('/:id', authMiddleware, param('id').isInt(), validateRequest, ExpedientesController.obtener);

module.exports = router;
