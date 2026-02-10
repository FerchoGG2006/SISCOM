const { google } = require('googleapis');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

// Scopes necesarios para administrar archivos
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

/**
 * Inicializa el cliente de Google Drive de forma robusta
 */
const getDriveClient = () => {
    try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        // Verificamos si existe el archivo de credenciales o las variables directas
        if (credentialsPath && fs.existsSync(credentialsPath)) {
            const auth = new google.auth.GoogleAuth({
                keyFile: credentialsPath,
                scopes: SCOPES,
            });
            return google.drive({ version: 'v3', auth });
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            // Alternativa: Cargar desde variables de entorno directas (bueno para Heroku/Docker)
            const auth = new google.auth.JWT(
                process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                null,
                process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                SCOPES
            );
            return google.drive({ version: 'v3', auth });
        }
        return null;
    } catch (error) {
        logger.error('Error inicializando cliente de Google Drive:', error);
        return null;
    }
};

/**
 * Crea una carpeta para un caso específico
 * @param {string} radicado Código de radicado (ej: HS-2026-001)
 * @param {string} victimName Nombre de la víctima
 * @returns {Promise<string>} ID de la carpeta creada o mock_id si falla/simula
 */
exports.createCaseFolder = async (radicado, victimName) => {
    const folderName = `${radicado} - ${victimName}`;
    const drive = getDriveClient();

    if (!drive) {
        logger.warn(`[DRIVE-SIMULATOR] Modo simulación activo. No se pudo conectar a Google Drive. Creando carpeta virtual: ${folderName}`);
        return `simulated_folder_id_${Date.now()}`;
    }

    try {
        const parentFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentFolderId && parentFolderId !== 'your_root_folder_id_here' ? [parentFolderId] : []
        };

        const folder = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, webViewLink'
        });

        logger.info(`[DRIVE-REAL] Carpeta creada exitosamente: ${folderName} (ID: ${folder.data.id})`);

        // Opcional: Dar permisos de visualización a cualquiera con el link (o a un email específico)
        // Por seguridad en Comisarías, lo dejamos privado al Service Account por defecto, 
        // pero se puede habilitar si la entidad lo requiere.

        return folder.data.id;
    } catch (error) {
        logger.error(`Error real al crear carpeta en Drive para ${radicado}:`, error);
        // Fallback robusto: No detenemos la radicación si Drive falla, devolvemos un ID pendiente
        return 'PENDING_RETRY';
    }
};

/**
 * Genera el link público/interno de visualización
 * @param {string} folderId 
 */
exports.getFileLink = async (folderId) => {
    if (folderId.startsWith('simulated_') || folderId === 'PENDING_RETRY') {
        return '#';
    }
    return `https://drive.google.com/drive/folders/${folderId}`;
};

