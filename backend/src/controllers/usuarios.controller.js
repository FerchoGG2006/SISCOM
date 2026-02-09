/**
 * SISCOM - Controlador de Usuarios
 * Maneja el CRUD de usuarios del sistema
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const logger = require('../config/logger');

const usuariosController = {
    /**
     * Lista todos los usuarios
     */
    async listar(req, res) {
        try {
            const usuarios = await db.query(`
                SELECT id, nombres, apellidos, email, rol, cargo, activo, 
                       ultimo_acceso, fecha_creacion
                FROM usuarios
                ORDER BY nombres ASC
            `);

            res.json({
                success: true,
                data: usuarios.map(u => ({
                    ...u,
                    password: undefined // No enviar password
                }))
            });
        } catch (error) {
            logger.error('Error listando usuarios:', error);
            res.status(500).json({ success: false, message: 'Error al listar usuarios' });
        }
    },

    /**
     * Obtiene un usuario por ID
     */
    async obtener(req, res) {
        const { id } = req.params;

        try {
            const [usuario] = await db.query(
                'SELECT id, nombres, apellidos, email, rol, cargo, activo, ultimo_acceso FROM usuarios WHERE id = ?',
                [id]
            );

            if (!usuario) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            res.json({ success: true, data: usuario });
        } catch (error) {
            logger.error('Error obteniendo usuario:', error);
            res.status(500).json({ success: false, message: 'Error al obtener usuario' });
        }
    },

    /**
     * Crea un nuevo usuario
     */
    async crear(req, res) {
        const { nombres, apellidos, email, password, rol, cargo } = req.body;

        try {
            // Verificar email único
            const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existente) {
                return res.status(400).json({ success: false, message: 'El email ya está registrado' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            const result = await db.insert('usuarios', {
                nombres,
                apellidos,
                email,
                password: passwordHash,
                rol: rol || 'auxiliar',
                cargo,
                activo: true
            });

            // Auditoría
            await db.insert('auditoria', {
                tabla: 'usuarios',
                registro_id: result.insertId,
                accion: 'INSERT',
                usuario_id: req.user.id,
                datos_nuevos: JSON.stringify({ nombres, apellidos, email, rol, cargo })
            });

            logger.info(`Usuario creado: ${email} por ${req.user.email}`);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id: result.insertId }
            });
        } catch (error) {
            logger.error('Error creando usuario:', error);
            res.status(500).json({ success: false, message: 'Error al crear usuario' });
        }
    },

    /**
     * Actualiza un usuario
     */
    async actualizar(req, res) {
        const { id } = req.params;
        const { nombres, apellidos, email, password, rol, cargo, activo } = req.body;

        try {
            const [usuario] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (!usuario) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            // Verificar email único (si cambió)
            if (email !== usuario.email) {
                const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
                if (existente) {
                    return res.status(400).json({ success: false, message: 'El email ya está registrado' });
                }
            }

            const updateData = { nombres, apellidos, email, rol, cargo, activo };

            // Solo actualizar password si se proporciona
            if (password) {
                updateData.password = await bcrypt.hash(password, 12);
            }

            await db.update('usuarios', id, updateData);

            // Auditoría
            await db.insert('auditoria', {
                tabla: 'usuarios',
                registro_id: id,
                accion: 'UPDATE',
                usuario_id: req.user.id,
                datos_anteriores: JSON.stringify({ nombres: usuario.nombres, email: usuario.email }),
                datos_nuevos: JSON.stringify({ nombres, email, rol, cargo })
            });

            logger.info(`Usuario actualizado: ${email} por ${req.user.email}`);

            res.json({ success: true, message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            logger.error('Error actualizando usuario:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
        }
    },

    /**
     * Elimina (desactiva) un usuario
     */
    async eliminar(req, res) {
        const { id } = req.params;

        try {
            // No eliminar, solo desactivar
            await db.update('usuarios', id, { activo: false });

            await db.insert('auditoria', {
                tabla: 'usuarios',
                registro_id: id,
                accion: 'DELETE',
                usuario_id: req.user.id
            });

            logger.info(`Usuario desactivado: ID ${id} por ${req.user.email}`);

            res.json({ success: true, message: 'Usuario desactivado exitosamente' });
        } catch (error) {
            logger.error('Error eliminando usuario:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
        }
    },

    /**
     * Cambia la contraseña de un usuario (el propio usuario)
     */
    async cambiarPassword(req, res) {
        const { passwordActual, passwordNuevo } = req.body;
        const userId = req.user.id;

        try {
            const [usuario] = await db.query('SELECT password FROM usuarios WHERE id = ?', [userId]);

            const passwordValid = await bcrypt.compare(passwordActual, usuario.password);
            if (!passwordValid) {
                return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
            }

            const newHash = await bcrypt.hash(passwordNuevo, 12);
            await db.update('usuarios', userId, { password: newHash });

            logger.info(`Usuario cambió su contraseña: ${req.user.email}`);

            res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            logger.error('Error cambiando contraseña:', error);
            res.status(500).json({ success: false, message: 'Error al cambiar contraseña' });
        }
    }
};

module.exports = usuariosController;
