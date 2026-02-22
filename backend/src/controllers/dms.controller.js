const prisma = require('../lib/prisma');
const driveService = require('../services/driveService');
const logger = require('../config/logger');
const fs = require('fs');

class DMSController {
    /**
     * POST /api/v1/dms/subir
     * Sube un archivo a la carpeta del expediente en Drive y lo registra en la DB
     */
    static async subirEvidencia(req, res) {
        const { id_expediente, tipo } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
        }

        try {
            const expediente = await prisma.expediente.findUnique({
                where: { id: parseInt(id_expediente) }
            });

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            // Subir a Google Drive
            const driveFile = await driveService.uploadFile(
                expediente.drive_folder_id,
                file.path,
                file.originalname,
                file.mimetype
            );

            // Registrar en la tabla de documentos de SISCOM
            const documento = await prisma.documento.create({
                data: {
                    id_expediente: parseInt(id_expediente),
                    nombre: file.originalname,
                    tipo: tipo || 'Evidencia Digital',
                    url_drive: driveFile.webViewLink || driveFile.id || driveFile
                }
            });

            // Registrar actuación de carga de evidencia
            await prisma.actuacion.create({
                data: {
                    id_expediente: parseInt(id_expediente),
                    id_usuario: req.user?.id || 1,
                    tipo: 'Carga de Evidencia',
                    descripcion: `Se ha cargado un nuevo archivo de evidencia: ${file.originalname}`
                }
            });

            // Eliminar archivo temporal
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            res.status(201).json({
                success: true,
                message: 'Archivo cargado y registrado con éxito',
                data: documento
            });
        } catch (error) {
            logger.error('Error en DMS Upload Service:', error);
            // Intentar limpiar temporal en caso de error
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            res.status(500).json({
                success: false,
                message: 'Error crítico al procesar la evidencia',
                error: error.message
            });
        }
    }
}

module.exports = DMSController;
