/**
 * SISCOM - Rutas de Usuarios
 * Endpoints para gestión de usuarios del sistema
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const usuariosController = require('../controllers/usuarios.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar usuarios (solo admin)
router.get('/', roleMiddleware('admin'), usuariosController.listar);

// Obtener usuario por ID
router.get('/:id', roleMiddleware('admin'), usuariosController.obtener);

// Crear usuario
router.post('/',
    roleMiddleware('admin'),
    [
        body('nombres').notEmpty().withMessage('Nombres requeridos'),
        body('apellidos').notEmpty().withMessage('Apellidos requeridos'),
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
        body('rol').isIn(['admin', 'comisario', 'psicologo', 'trabajador_social', 'abogado', 'auxiliar'])
    ],
    validateRequest,
    usuariosController.crear
);

// Actualizar usuario
router.put('/:id',
    roleMiddleware('admin'),
    [
        body('nombres').notEmpty().withMessage('Nombres requeridos'),
        body('apellidos').notEmpty().withMessage('Apellidos requeridos'),
        body('email').isEmail().withMessage('Email inválido')
    ],
    validateRequest,
    usuariosController.actualizar
);

// Eliminar (desactivar) usuario
router.delete('/:id', roleMiddleware('admin'), usuariosController.eliminar);

// Cambiar contraseña propia
router.post('/cambiar-password',
    [
        body('passwordActual').notEmpty(),
        body('passwordNuevo').isLength({ min: 6 })
    ],
    validateRequest,
    usuariosController.cambiarPassword
);

module.exports = router;
