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

        // Limpiar campos protegidos generados automáticamente
        delete data.id;
        delete data.created_at;
        delete data.updated_at;

        try {
            const updated = await prisma.configuracion.upsert({
                where: { id: 1 },
                update: data,
                create: {
                    id: 1,
                    ...data
                }
            });

            res.json({ success: true, message: 'Configuración actualizada exitosamente', data: updated });
        } catch (error) {
            logger.error('Error actualizando configuración:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
        }
    }
    /**
     * GET /api/v1/configuracion/preview/:template
     * Generar un PDF de vista previa para una plantilla específica
     */
    static async vistaPrevia(req, res) {
        const { template } = req.params;
        const pdfService = require('../services/pdfGenerator.service');

        try {
            const dummy = pdfService.getDummyData();
            let result;

            switch (template) {
                case 'autoinicio':
                    result = await pdfService.generarAutoInicio(dummy.expediente, dummy.victima, dummy.agresor, dummy.usuario);
                    break;
                case 'medidas':
                    result = await pdfService.generarMedidasProteccion(dummy.expediente, dummy.victima, dummy.agresor, null, dummy.usuario);
                    break;
                case 'oficiopolicia':
                    result = await pdfService.generarOficioPolicia(dummy.expediente, dummy.victima, dummy.agresor, dummy.usuario);
                    break;
                case 'citacion':
                    result = await pdfService.generarCitacionAudiencia(dummy.expediente, dummy.audiencia, dummy.victima, dummy.agresor, dummy.usuario);
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Plantilla no válida' });
            }

            // Devolver la URL del documento generado
            const protocol = req.protocol === 'https' ? 'https' : 'http';
            const fileUrl = `${protocol}://${req.get('host')}/documentos/${result.fileName}`;

            res.json({
                success: true,
                url: fileUrl,
                fileName: result.fileName
            });

        } catch (error) {
            logger.error(`Error generando vista previa para ${template}:`, error);
            res.status(500).json({ success: false, message: 'Error al generar la vista previa' });
        }
    }
}

module.exports = ConfiguracionController;
