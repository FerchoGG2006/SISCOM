/**
 * SISCOM - Middleware de Autenticación JWT
 */
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar que el usuario existe y está activo
        const users = await query(
            `SELECT id, cedula, nombres, apellidos, email, rol, cargo, activo FROM usuarios WHERE id = ?`,
            [decoded.userId]
        );

        if (users.length === 0 || !users[0].activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido o inactivo'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para realizar esta acción'
            });
        }
        next();
    };
};

module.exports = { authMiddleware, roleMiddleware };
