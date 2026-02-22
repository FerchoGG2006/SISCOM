const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class NotificacionesController {
    /**
     * Obtener todas las notificaciones de un usuario
     */
    static async obtenerTodas(req, res) {
        const usuarioId = req.user.id;
        try {
            const notifs = await prisma.notificacion.findMany({
                where: { id_usuario: usuarioId },
                orderBy: { created_at: 'desc' },
                take: 50
            });
            res.json({ success: true, data: notifs });
        } catch (error) {
            logger.error('Error obteniendo notificaciones:', error);
            res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
        }
    }

    /**
     * Marcar una notificación como leída
     */
    static async marcarLeida(req, res) {
        const { id } = req.params;
        try {
            await prisma.notificacion.update({
                where: { id: parseInt(id) },
                data: { leida: true }
            });
            res.json({ success: true, message: 'Notificación marcada como leída' });
        } catch (error) {
            logger.error('Error actualizando notificación:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar notificación' });
        }
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    static async marcarTodasLeidas(req, res) {
        const usuarioId = req.user.id;
        try {
            await prisma.notificacion.updateMany({
                where: { id_usuario: usuarioId, leida: false },
                data: { leida: true }
            });
            res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
        } catch (error) {
            logger.error('Error al marcar todas como leídas:', error);
            res.status(500).json({ success: false, message: 'Error en la operación' });
        }
    }

    /**
     * Utilidad para crear una notificación (interna)
     */
    static async crear(datos) {
        try {
            return await prisma.notificacion.create({
                data: {
                    id_usuario: datos.id_usuario,
                    titulo: datos.titulo,
                    mensaje: datos.mensaje,
                    tipo: datos.tipo || 'info'
                }
            });
        } catch (error) {
            logger.error('Error creando notificación:', error);
        }
    }
}

module.exports = NotificacionesController;
