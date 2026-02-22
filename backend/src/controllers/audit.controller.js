const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class AuditService {
    /**
     * Registra una acción en los logs de auditoría
     * @param {Object} data - Datos de la auditoría
     */
    static async log(data) {
        try {
            const { id_usuario, accion, modulo, detalles, ip } = data;

            await prisma.auditLog.create({
                data: {
                    id_usuario: id_usuario || null,
                    accion,
                    modulo,
                    detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
                    ip: ip || '0.0.0.0'
                }
            });

            logger.info(`[AUDIT] ${accion} en ${modulo} por usuario ${id_usuario || 'SISTEMA'}`);
        } catch (error) {
            logger.error('Error al registrar log de auditoría:', error);
        }
    }
}

module.exports = AuditService;
