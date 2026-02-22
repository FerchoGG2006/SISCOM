const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class ConfiguracionController {
    /**
     * GET /api/v1/configuracion
     * Obtener la configuración global (siempre devuelve el registro con ID 1)
     */
    static async obtener(req, res) {
        try {
            let config = await prisma.configuracion.findUnique({
                where: { id: 1 }
            });

            // Si no existe, crear el registro por defecto
            if (!config) {
                config = await prisma.configuracion.create({
                    data: { id: 1 }
                });
            }

            res.json({ success: true, data: config });
        } catch (error) {
            logger.error('Error obteniendo configuración:', error);
            res.status(500).json({ success: false, message: 'Error al obtener configuración' });
        }
    }

    /**
     * PUT /api/v1/configuracion
     * Actualizar la configuración global
     */
    static async actualizar(req, res) {
        const data = req.body;

        // No permitir cambiar el ID
        delete data.id;

        try {
            const updated = await prisma.configuracion.update({
                where: { id: 1 },
                data: data
            });

            res.json({ success: true, message: 'Configuración actualizada exitosamente', data: updated });
        } catch (error) {
            logger.error('Error actualizando configuración:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
        }
    }
}

module.exports = ConfiguracionController;
