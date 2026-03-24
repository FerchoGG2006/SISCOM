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
        const tokenPath = path.join(process.cwd(), 'credentials/token.json');
        const oauthCredsPath = path.join(process.cwd(), 'credentials/oauth-credentials.json');

        // Prioridad 1: OAuth 2.0 (Evita el error de cuota 0 bytes usando cuentas reales de Gmail / Workspace)
        if (fs.existsSync(tokenPath) && fs.existsSync(oauthCredsPath)) {
            const oauthCreds = JSON.parse(fs.readFileSync(oauthCredsPath));
            const { client_secret, client_id, redirect_uris } = oauthCreds.installed || oauthCreds.web;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0] || 'urn:ietf:wg:oauth:2.0:oob');
            
            oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(tokenPath)));
            return google.drive({ version: 'v3', auth: oAuth2Client });
        }

        // Prioridad 2: Cuenta de Servicio (Legacy / Fallback)
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const resolvedCredsPath = credentialsPath ? path.resolve(process.cwd(), credentialsPath) : null;

        // Verificamos si existe el archivo de credenciales o las variables directas
        if (resolvedCredsPath && fs.existsSync(resolvedCredsPath)) {
            const auth = new google.auth.GoogleAuth({
                keyFile: resolvedCredsPath,
                scopes: SCOPES,
            });
            return google.drive({ version: 'v3', auth });
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            // Alternativa: Cargar desde variables de entorno directas
            const auth = new google.auth.JWT(
                process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                null,
                process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                SCOPES
            );
            return google.drive({ version: 'v3', auth });
        }
        
        logger.warn('No se encontraron credenciales de Google Drive (ni OAuth2 ni Service Account).');
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
        const isQuotaError = error.message?.includes('storage quota') ||
            (error.errors && error.errors.some(e => e.reason === 'storageQuota'));

        if (isQuotaError) {
            logger.error(`[DRIVE-QUOTA-ERROR] El Service Account no tiene cuota para crear la carpeta: ${folderName}`);
            return `simulated_folder_quota_${Date.now()}`;
        }

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

/**
 * Sube un archivo a una carpeta específica de Drive
 * @param {string} folderId ID de la carpeta destino
 * @param {string} filePath Ruta local del archivo
 * @param {string} fileName Nombre del archivo en Drive
 * @param {string} mimeType Tipo MIME del archivo
 */
exports.uploadFile = async (folderId, filePath, fileName, mimeType) => {
    const drive = getDriveClient();

    if (!drive) {
        logger.warn(`[DRIVE-SIMULATOR] Modo simulación. Archivo no subido: ${fileName}`);
        return `simulated_file_id_${Date.now()}`;
    }

    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath)
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });

        logger.info(`[DRIVE-REAL] Archivo subido exitosamente: ${fileName} (ID: ${file.data.id})`);
        return file.data;
    } catch (error) {
        const isQuotaError = error.message?.includes('storage quota') ||
            (error.errors && error.errors.some(e => e.reason === 'storageQuota'));

        if (isQuotaError) {
            logger.error(`[DRIVE-QUOTA-ERROR] El Service Account no tiene cuota de almacenamiento para subir "${fileName}".`);
            logger.error(`[SOLUCIÓN] Use un "Shared Drive" (Unidades Compartidas) y agregue el email del Service Account como Administrador.`);

            // Fallback: Simulamos éxito para no bloquear el flujo, devolviendo un objeto dummy
            return {
                id: `quota_fallback_${Date.now()}`,
                webViewLink: '#',
                isSimulated: true
            };
        }

        logger.error(`Error subiendo archivo ${fileName} a Drive:`, error);
        throw error;
    }
};

/**
 * Sube un archivo en formato Base64 a Drive
 * @param {string} folderId ID de la carpeta destino
 * @param {string} base64 Content en base64 (con o sin prefix)
 * @param {string} fileName Nombre del archivo
 * @param {string} mimeType Tipo MIME
 */
exports.uploadBase64 = async (folderId, base64, fileName, mimeType) => {
    const drive = getDriveClient();

    if (!drive) {
        logger.warn(`[DRIVE-SIMULATOR] Modo simulación. Archivo no subido (Base64): ${fileName}`);
        return { webViewLink: '#' };
    }

    try {
        // Remover el prefix del base64 si existe (data:image/png;base64,...)
        const base64Data = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
        const buffer = Buffer.from(base64Data, 'base64');

        const { Readable } = require('stream');
        const readable = new Readable();
        readable._read = () => { };
        readable.push(buffer);
        readable.push(null);

        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: mimeType,
            body: readable
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });

        logger.info(`[DRIVE-REAL] Archivo Base64 subido exitosamente: ${fileName}`);
        return file.data;
    } catch (error) {
        const isQuotaError = error.message?.includes('storage quota') ||
            (error.errors && error.errors.some(e => e.reason === 'storageQuota'));

        if (isQuotaError) {
            logger.error(`[DRIVE-QUOTA-ERROR] El Service Account no tiene cuota para subir Base64 "${fileName}".`);
            logger.error(`[SOLUCIÓN] Utilice Unidades Compartidas y asigne permisos a la cuenta de servicio.`);

            return {
                id: `quota_fallback_b64_${Date.now()}`,
                webViewLink: '#',
                isSimulated: true
            };
        }

        logger.error(`Error subiendo Base64 ${fileName} a Drive:`, error);
        throw error;
    }
};

/**
 * Descarga el contenido de un archivo de Drive como Buffer (para Foliado)
 * @param {string} fileIdOrUrl ID del archivo o WebViewLink
 * @returns {Promise<Buffer|null>}
 */
exports.getFileBuffer = async (fileIdOrUrl) => {
    const drive = getDriveClient();
    if (!drive || fileIdOrUrl.startsWith('simulated_') || fileIdOrUrl === 'PENDING_RETRY') {
        return null;
    }

    let fileId = fileIdOrUrl;
    // Extract ID if it's a webViewLink
    if (fileId.includes('/d/')) {
        const match = fileId.match(/\/d\/(.*?)\//);
        if (match && match[1]) fileId = match[1];
    } else if (fileId.includes('id=')) {
        const urlParams = new URLSearchParams(fileId.substring(fileId.indexOf('?')));
        fileId = urlParams.get('id') || fileId;
    }

    try {
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );
        return Buffer.from(response.data);
    } catch (error) {
        logger.error(`Error descargando archivo ${fileId} como buffer:`, error.message);
        return null; // Fallback silently for simulated files
    }
};

