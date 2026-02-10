/**
 * SISCOM - Controlador de Autenticación
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuario via Prisma
            const user = await prisma.usuario.findUnique({
                where: { email, activo: true }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token
            const token = jwt.sign(
                { userId: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
            );

            logger.info(`Login exitoso: ${user.email}`);

            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    token,
                    refreshToken,
                    user: {
                        id: user.id,
                        nombre: `${user.nombres} ${user.apellidos}`,
                        email: user.email,
                        rol: user.rol
                    }
                }
            });

        } catch (error) {
            logger.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el inicio de sesión'
            });
        }
    }

    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token requerido'
                });
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret_key');

            const user = await prisma.usuario.findUnique({
                where: { id: decoded.userId, activo: true }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no válido'
                });
            }

            const newToken = jwt.sign(
                { userId: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
            );

            res.json({
                success: true,
                data: { token: newToken }
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
    }
}

module.exports = AuthController;

