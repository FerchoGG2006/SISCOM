const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const prisma = require('../lib/prisma');
const driveService = require('../services/driveService');
const logger = require('../config/logger');

const pdfCompilerController = {
    /**
     * POST /api/v1/compile/:idExpediente
     * Compila todos los documentos PDF de un expediente en uno solo y añade foliado.
     */
    compilarExpediente: async (req, res) => {
        try {
            const { idExpediente } = req.params;

            const expediente = await prisma.expediente.findUnique({
                where: { id: parseInt(idExpediente) },
                include: { documentos: true }
            });

            if (!expediente) {
                return res.status(404).json({ success: false, message: 'Expediente no encontrado.' });
            }

            // Filtrar solo documentos que parecen PDFs
            const pdfDocs = expediente.documentos.filter(doc => 
                doc.nombre.toLowerCase().endsWith('.pdf') || doc.url_drive.includes('drive.google.com')
            );

            if (pdfDocs.length === 0) {
                return res.status(400).json({ success: false, message: 'No hay documentos PDF válidos para compilar en este expediente.' });
            }

            logger.info(`[FOLIADO] Iniciando compilación de ${pdfDocs.length} documentos para ${expediente.radicado_hs}`);

            // Crear un PDF vacío y maestro
            const masterPdf = await PDFDocument.create();
            const font = await masterPdf.embedFont(StandardFonts.HelveticaBold);

            let addedPages = 0;

            for (const doc of pdfDocs) {
                logger.debug(`[FOLIADO] Descargando buffer de ${doc.nombre}`);
                const buffer = await driveService.getFileBuffer(doc.url_drive);

                if (!buffer) {
                    logger.warn(`[FOLIADO] No se pudo descargar el buffer de ${doc.nombre}, saltando...`);
                    continue;
                }

                try {
                    // Cargar el documento individual
                    const currentPdf = await PDFDocument.load(buffer);
                    const currentPages = await masterPdf.copyPages(currentPdf, currentPdf.getPageIndices());

                    currentPages.forEach(page => {
                        masterPdf.addPage(page);
                        addedPages++;
                    });
                } catch (pdfErr) {
                    logger.error(`[FOLIADO] Error procesando las páginas de ${doc.nombre}:`, pdfErr);
                }
            }

            if (addedPages === 0) {
                return res.status(500).json({ success: false, message: 'No se pudo compilar ninguna página válida.' });
            }

            // --- PROCESO DE FOLIADO (Numeración en la esquina superior) ---
            const pages = masterPdf.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const folioText = `Folio: ${i + 1}`;
                
                page.drawText(folioText, {
                    x: width - 90,
                    y: height - 40,
                    size: 14,
                    font: font,
                    color: rgb(0.8, 0.1, 0.2), // Rojo oscuro institucional
                });
            }

            // Guardar el Master PDF localmente primero
            const masterBytes = await masterPdf.save();
            const masterFileName = `COMPILADO_${expediente.radicado_hs}_Folios_${pages.length}.pdf`;
            const tempPath = path.join(__dirname, '../../tmp', masterFileName);
            
            // Asegurar que el directorio tmp existe
            if (!fs.existsSync(path.dirname(tempPath))) {
                fs.mkdirSync(path.dirname(tempPath), { recursive: true });
            }

            fs.writeFileSync(tempPath, masterBytes);

            // Subir el master PDF al Drive del expediente
            let downloadLink = '#';
            if (expediente.drive_folder_id && expediente.drive_folder_id !== 'PENDING_RETRY') {
                const driveUpload = await driveService.uploadFile(
                    expediente.drive_folder_id,
                    tempPath,
                    masterFileName,
                    'application/pdf'
                );
                
                downloadLink = driveUpload.webViewLink || '#';

                // Registrar el compilado en la DB
                await prisma.documento.create({
                    data: {
                        id_expediente: expediente.id,
                        nombre: masterFileName,
                        tipo: 'Compilación/Foliado',
                        url_drive: downloadLink
                    }
                });
            }

            // Registrar Actuación de foliado
            await prisma.actuacion.create({
                data: {
                    id_expediente: expediente.id,
                    id_usuario: req.user?.id || 1, // Fallback si no hay auth middleware activo
                    tipo: 'Actuación Administrativa',
                    descripcion: `Se realizó la compilación electrónica y foliado del expediente. Total folios: ${pages.length}.`
                }
            });

            // Limpiar Temp
            fs.unlinkSync(tempPath);

            res.json({
                success: true,
                message: 'Expediente compilado y foliado exitosamente.',
                data: {
                    folios: pages.length,
                    fileName: masterFileName,
                    url: downloadLink
                }
            });

        } catch (error) {
            logger.error('Error Crítico en Compilación PDF:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor al compilar PDFs.', error: error.message });
        }
    }
};

module.exports = pdfCompilerController;
