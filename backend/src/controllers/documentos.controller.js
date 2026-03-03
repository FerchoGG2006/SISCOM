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
                case 'auto-inicio':
                    result = await pdfGenerator.generarAutoInicio(expediente, victimaParaPDF, agresorParaPDF, usuario);
                    break;
                default:
                    return res.status(400).json({ success: false, message: 'Tipo de documento no válido' });
            }

            // Subir a Google Drive si ya tiene carpeta
            let driveFileId = null;
            if (expediente.drive_folder_id && expediente.drive_folder_id !== 'PENDING') {
                try {
                    const driveRes = await driveService.uploadFile(
                        expediente.drive_folder_id,
                        result.filePath,
                        result.fileName,
                        'application/pdf'
                    );
                    driveFileId = driveRes.id;
                } catch (driveErr) {
                    logger.error('Error subiendo a Drive desde controlador:', driveErr);
                }
            }

            // Registrar en la base de datos
            const documento = await prisma.documento.create({
                data: {
                    id_expediente: expediente.id,
                    nombre: result.fileName,
                    tipo: tipo.replace('-', ' '),
                    url_drive: driveFileId || expediente.drive_folder_id
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
