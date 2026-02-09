/**
 * SISCOM - Controlador de Documentos
 * Maneja la generación, almacenamiento y descarga de documentos
 */

const pdfGenerator = require('../services/pdfGenerator.service');
const driveService = require('../services/googleDrive.service');
const db = require('../config/database');
const logger = require('../config/logger');
const fs = require('fs');

const documentosController = {
    /**
     * Genera el formato de recepción de un expediente
     */
    async generarFormatoRecepcion(req, res) {
        const { expedienteId } = req.params;

        try {
            // Obtener datos del expediente
            const [expediente] = await db.query(
                'SELECT * FROM expedientes WHERE id = ?',
                [expedienteId]
            );

            if (!expediente) {
                return res.status(404).json({
                    success: false,
                    message: 'Expediente no encontrado'
                });
            }

            // Obtener víctima
            const [victima] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'victima'
            `, [expedienteId]);

            // Obtener agresor
            const [agresor] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'agresor'
            `, [expedienteId]);

            // Generar PDF
            const result = await pdfGenerator.generarFormatoRecepcion(
                expediente,
                victima,
                agresor,
                req.user
            );

            // Registrar documento en BD
            await db.insert('documentos', {
                expediente_id: expedienteId,
                tipo_documento: 'formato_recepcion',
                nombre_archivo: result.fileName,
                ruta_local: result.filePath,
                generado_por: req.user.id
            });

            // Subir a Drive si está configurado
            if (expediente.carpeta_drive_id) {
                try {
                    const driveResult = await driveService.uploadFile(
                        result.filePath,
                        result.fileName,
                        expediente.carpeta_drive_id
                    );

                    // Actualizar con URL de Drive
                    await db.query(
                        'UPDATE documentos SET url_drive = ? WHERE expediente_id = ? AND nombre_archivo = ?',
                        [driveResult.webViewLink, expedienteId, result.fileName]
                    );
                } catch (driveError) {
                    logger.warn('No se pudo subir a Drive:', driveError.message);
                }
            }

            res.json({
                success: true,
                message: 'Formato de recepción generado exitosamente',
                data: {
                    fileName: result.fileName,
                    downloadUrl: `/api/v1/documentos/download/${expedienteId}/${result.fileName}`
                }
            });

        } catch (error) {
            logger.error('Error generando formato de recepción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar el documento'
            });
        }
    },

    /**
     * Genera documento de valoración de riesgo
     */
    async generarValoracionRiesgo(req, res) {
        const { expedienteId } = req.params;

        try {
            const [expediente] = await db.query('SELECT * FROM expedientes WHERE id = ?', [expedienteId]);

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            const [victima] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'victima'
            `, [expedienteId]);

            const [valoracion] = await db.query(
                'SELECT * FROM valoracion_riesgo WHERE expediente_id = ? ORDER BY fecha_valoracion DESC LIMIT 1',
                [expedienteId]
            );

            if (!valoracion) {
                return res.status(404).json({ success: false, message: 'No hay valoración de riesgo registrada' });
            }

            const result = await pdfGenerator.generarValoracionRiesgo(
                expediente,
                victima,
                valoracion,
                req.user
            );

            await db.insert('documentos', {
                expediente_id: expedienteId,
                tipo_documento: 'valoracion_riesgo',
                nombre_archivo: result.fileName,
                ruta_local: result.filePath,
                generado_por: req.user.id
            });

            res.json({
                success: true,
                message: 'Valoración de riesgo generada exitosamente',
                data: {
                    fileName: result.fileName,
                    downloadUrl: `/api/v1/documentos/download/${expedienteId}/${result.fileName}`
                }
            });

        } catch (error) {
            logger.error('Error generando valoración:', error);
            res.status(500).json({ success: false, message: 'Error al generar el documento' });
        }
    },

    /**
     * Genera medidas de protección
     */
    async generarMedidasProteccion(req, res) {
        const { expedienteId } = req.params;
        const { medidas } = req.body; // Array opcional de medidas personalizadas

        try {
            const [expediente] = await db.query('SELECT * FROM expedientes WHERE id = ?', [expedienteId]);

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            const [victima] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'victima'
            `, [expedienteId]);

            const [agresor] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'agresor'
            `, [expedienteId]);

            const result = await pdfGenerator.generarMedidasProteccion(
                expediente,
                victima,
                agresor,
                medidas,
                req.user
            );

            await db.insert('documentos', {
                expediente_id: expedienteId,
                tipo_documento: 'medidas_proteccion',
                nombre_archivo: result.fileName,
                ruta_local: result.filePath,
                generado_por: req.user.id
            });

            // Actualizar estado del expediente
            await db.update('expedientes', expedienteId, {
                estado: 'medidas_proteccion'
            });

            // Registrar actuación
            await db.insert('actuaciones', {
                expediente_id: expedienteId,
                tipo_actuacion: 'medidas_proteccion',
                descripcion: 'Se generó resolución de medidas de protección',
                usuario_id: req.user.id
            });

            res.json({
                success: true,
                message: 'Medidas de protección generadas exitosamente',
                data: {
                    fileName: result.fileName,
                    downloadUrl: `/api/v1/documentos/download/${expedienteId}/${result.fileName}`
                }
            });

        } catch (error) {
            logger.error('Error generando medidas de protección:', error);
            res.status(500).json({ success: false, message: 'Error al generar el documento' });
        }
    },

    /**
     * Genera oficio para Policía
     */
    async generarOficioPolicia(req, res) {
        const { expedienteId } = req.params;

        try {
            const [expediente] = await db.query('SELECT * FROM expedientes WHERE id = ?', [expedienteId]);

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            const [victima] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'victima'
            `, [expedienteId]);

            const [agresor] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'agresor'
            `, [expedienteId]);

            const result = await pdfGenerator.generarOficioPolicia(
                expediente,
                victima,
                agresor,
                req.user
            );

            await db.insert('documentos', {
                expediente_id: expedienteId,
                tipo_documento: 'oficio_policia',
                nombre_archivo: result.fileName,
                ruta_local: result.filePath,
                generado_por: req.user.id
            });

            res.json({
                success: true,
                message: 'Oficio para Policía generado exitosamente',
                data: {
                    fileName: result.fileName,
                    downloadUrl: `/api/v1/documentos/download/${expedienteId}/${result.fileName}`
                }
            });

        } catch (error) {
            logger.error('Error generando oficio policía:', error);
            res.status(500).json({ success: false, message: 'Error al generar el documento' });
        }
    },

    /**
     * Genera oficio para Sector Salud
     */
    async generarOficioSalud(req, res) {
        const { expedienteId } = req.params;

        try {
            const [expediente] = await db.query('SELECT * FROM expedientes WHERE id = ?', [expedienteId]);

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
            }

            const [victima] = await db.query(`
                SELECT p.* FROM personas p
                JOIN expediente_personas ep ON p.id = ep.persona_id
                WHERE ep.expediente_id = ? AND ep.tipo_interviniente = 'victima'
            `, [expedienteId]);

            const result = await pdfGenerator.generarOficioSalud(
                expediente,
                victima,
                req.user
            );

            await db.insert('documentos', {
                expediente_id: expedienteId,
                tipo_documento: 'oficio_salud',
                nombre_archivo: result.fileName,
                ruta_local: result.filePath,
                generado_por: req.user.id
            });

            res.json({
                success: true,
                message: 'Oficio para Salud generado exitosamente',
                data: {
                    fileName: result.fileName,
                    downloadUrl: `/api/v1/documentos/download/${expedienteId}/${result.fileName}`
                }
            });

        } catch (error) {
            logger.error('Error generando oficio salud:', error);
            res.status(500).json({ success: false, message: 'Error al generar el documento' });
        }
    },

    /**
     * Descarga un documento
     */
    async descargarDocumento(req, res) {
        const { expedienteId, fileName } = req.params;

        try {
            const [documento] = await db.query(
                'SELECT * FROM documentos WHERE expediente_id = ? AND nombre_archivo = ?',
                [expedienteId, fileName]
            );

            if (!documento) {
                return res.status(404).json({ success: false, message: 'Documento no encontrado' });
            }

            if (!fs.existsSync(documento.ruta_local)) {
                return res.status(404).json({ success: false, message: 'Archivo no encontrado en el servidor' });
            }

            res.download(documento.ruta_local, documento.nombre_archivo);

        } catch (error) {
            logger.error('Error descargando documento:', error);
            res.status(500).json({ success: false, message: 'Error al descargar el documento' });
        }
    },

    /**
     * Lista todos los documentos de un expediente
     */
    async listarDocumentos(req, res) {
        const { expedienteId } = req.params;

        try {
            const documentos = await db.query(`
                SELECT d.*, u.nombres as generado_por_nombre
                FROM documentos d
                LEFT JOIN usuarios u ON d.generado_por = u.id
                WHERE d.expediente_id = ?
                ORDER BY d.fecha_creacion DESC
            `, [expedienteId]);

            res.json({
                success: true,
                data: documentos
            });

        } catch (error) {
            logger.error('Error listando documentos:', error);
            res.status(500).json({ success: false, message: 'Error al listar documentos' });
        }
    }
};

module.exports = documentosController;
