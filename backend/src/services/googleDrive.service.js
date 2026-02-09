/**
 * SISCOM - Servicio de Google Drive
 * Maneja la creación de carpetas y subida de documentos
 */
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    }

    async initialize() {
        try {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            if (!credPath || !fs.existsSync(credPath)) {
                logger.warn('Credenciales de Google Drive no configuradas');
                return;
            }

            const auth = new google.auth.GoogleAuth({
                keyFile: credPath,
                scopes: ['https://www.googleapis.com/auth/drive']
            });

            this.drive = google.drive({ version: 'v3', auth });
            logger.info('Google Drive API inicializada');
        } catch (error) {
            logger.error('Error inicializando Google Drive:', error.message);
        }
    }

    async createExpedienteFolder(radicado, nombreVictima) {
        if (!this.drive) await this.initialize();
        if (!this.drive) return null;

        try {
            const folderName = `${radicado} - ${nombreVictima}`;

            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [this.rootFolderId]
            };

            const folder = await this.drive.files.create({
                resource: folderMetadata,
                fields: 'id, webViewLink'
            });

            // Crear subcarpetas
            const subcarpetas = ['Formatos', 'Oficios', 'Notificaciones', 'Firmas'];
            for (const sub of subcarpetas) {
                await this.drive.files.create({
                    resource: {
                        name: sub,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [folder.data.id]
                    }
                });
            }

            logger.info(`Carpeta creada en Drive: ${folderName}`);
            return {
                folderId: folder.data.id,
                folderUrl: folder.data.webViewLink
            };
        } catch (error) {
            logger.error('Error creando carpeta en Drive:', error.message);
            throw error;
        }
    }

    async uploadFile(folderId, fileName, filePath, mimeType = 'application/pdf') {
        if (!this.drive) await this.initialize();
        if (!this.drive) return null;

        try {
            const fileMetadata = {
                name: fileName,
                parents: [folderId]
            };

            const media = {
                mimeType: mimeType,
                body: fs.createReadStream(filePath)
            };

            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink'
            });

            logger.info(`Archivo subido a Drive: ${fileName}`);
            return {
                fileId: file.data.id,
                fileUrl: file.data.webViewLink
            };
        } catch (error) {
            logger.error('Error subiendo archivo a Drive:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleDriveService();
