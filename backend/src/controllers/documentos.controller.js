const prisma = require('../lib/prisma');
const pdfGenerator = require('../services/pdfGenerator.service');
const driveService = require('../services/driveService');
const logger = require('../config/logger');

class DocumentoController {
    /**
     * POST /api/v1/expedientes/:id/documentos/:tipo
     * Genera un documento PDF específico para el expediente
     */
    static async generar(req, res) {
        try {
            const { id, tipo } = req.params;
            const usuario = req.user;

            const expediente = await prisma.expediente.findUnique({
                where: { id: parseInt(id) },
                include: { victima: true, agresor: true }
            });

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            let result;
            const victimaParaPDF = {
                ...expediente.victima,
                nombres: `${expediente.victima.nombres}`,
                apellidos: `${expediente.victima.apellidos}`,
                primer_nombre: expediente.victima.nombres,
                primer_apellido: expediente.victima.apellidos
            };

            const agresorParaPDF = expediente.agresor ? {
                ...expediente.agresor,
                nombres: `${expediente.agresor.nombres}`,
                apellidos: `${expediente.agresor.apellidos}`,
                primer_nombre: expediente.agresor.nombres,
                primer_apellido: expediente.agresor.apellidos
            } : null;

            switch (tipo) {
                case 'oficio-policia':
                    result = await pdfGenerator.generarOficioPolicia(expediente, victimaParaPDF, agresorParaPDF, usuario);
                    break;
                case 'oficio-salud':
                    result = await pdfGenerator.generarOficioSalud(expediente, victimaParaPDF, usuario);
                    break;
                case 'medidas-proteccion':
                    result = await pdfGenerator.generarMedidasProteccion(expediente, victimaParaPDF, agresorParaPDF, null, usuario);
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Tipo de documento no válido' });
            }

            // Registrar en la base de datos
            const documento = await prisma.documento.create({
                data: {
                    id_expediente: expediente.id,
                    nombre: result.fileName,
                    tipo: tipo.replace('-', ' '),
                    url_drive: expediente.drive_folder_id
                }
            });

            // Registrar actuación de generación
            await prisma.actuacion.create({
                data: {
                    id_expediente: expediente.id,
                    id_usuario: usuario.id,
                    tipo: 'Generación Documento',
                    descripcion: `Se generó el documento: ${documento.tipo}`
                }
            });

            res.json({
                success: true,
                message: 'Documento generado con éxito',
                data: {
                    ...documento,
                    fileName: result.fileName
                }
            });

        } catch (error) {
            logger.error('Error generando documento:', error);
            res.status(500).json({ success: false, message: 'Error al generar el documento PDF' });
        }
    }
}

module.exports = DocumentoController;
