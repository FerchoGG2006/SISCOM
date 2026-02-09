/**
 * SISCOM - Rutas de Autenticación
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');

router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], validateRequest, AuthController.login);

router.post('/refresh', AuthController.refreshToken);

module.exports = router;
