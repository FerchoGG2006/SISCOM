const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class NotificationService {
    /**
     * Crea una notificación y la emite vía Socket.io
     * @param {Object} io Objeto Socket.io Server
     * @param {Object} data { id_usuario, titulo, mensaje, tipo }
     */
    static async notify(io, data) {
        try {
            const notification = await prisma.notificacion.create({
                data: {
                    id_usuario: data.id_usuario,
                    titulo: data.titulo,
                    mensaje: data.mensaje,
                    tipo: data.tipo || 'info',
                    leida: false
                }
            });

            // Emitir al usuario específico
            io.to(`user_${data.id_usuario}`).emit('notification', notification);

            // Si es crítica o global (tipo danger/warning), emitir a todos
            if (data.tipo === 'danger') {
                io.emit('global_alert', notification);
            }

            return notification;
        } catch (error) {
            logger.error('Error creating notification:', error);
            return null;
        }
    }

    /**
     * Notifica a todos los usuarios con un rol específico
     */
    static async notifyRole(io, rol, data) {
        try {
            const usuarios = await prisma.usuario.findMany({
                where: { rol, activo: true }
            });

            for (const user of usuarios) {
                await this.notify(io, { ...data, id_usuario: user.id });
            }
        } catch (error) {
            logger.error('Error in notifyRole:', error);
        }
    }
}

module.exports = NotificationService;
