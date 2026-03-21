/**
 * SISCOM - Script de Verificación Autónoma de Radicación y Google Drive
 * Este script simula un proceso completo de radicación y verifica la subida a la nube.
 */
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:3001/api/v1';

async function verifyRadication() {
    console.log('🔍 INICIANDO REVISIÓN DEL PROCESO DE RADICACIÓN...');

    try {
        // 1. AUTENTICACIÓN
        console.log('\n[1/4] Paso: Autenticación...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testdrive@siscom.com',
                password: 'TestDrive2026!'
            })
        });

        const authData = await loginRes.json();
        if (!authData.success) {
            console.error('❌ Error de autenticación:', authData.message);
            return;
        }
        const token = authData.data.token;
        console.log('✅ Login exitoso. Conectado como:', authData.data.user.email);

        // 2. PREPARAR PAYLOAD DE PRUEBA
        console.log('\n[2/4] Paso: Preparando expediente de prueba robusto...');
        const payload = {
            victima: {
                tipo_documento: 'CC',
                numero_documento: 'V-' + Date.now(),
                primer_nombre: 'MARIA',
                segundo_nombre: 'E.',
                primer_apellido: 'PRUEBA',
                segundo_apellido: 'DRIVE',
                telefono_celular: '3100000000',
                direccion: 'Calle Ficticia 123',
                barrio: 'VALLE MEZA',
                comuna: 'Comuna 3',
                municipio: 'Valledupar'
            },
            agresor: {
                primer_nombre: 'JUAN',
                primer_apellido: 'CONFLICTO',
                parentesco_con_victima: 'Ex-pareja',
                direccion: 'Barrio El Páramo'
            },
            datosHecho: {
                descripcion_hechos: 'Este es un caso de prueba generado automáticamente para verificar la sincronización con Google Drive el día ' + new Date().toLocaleString(),
                tipo_caso: 'violencia_psicologica'
            },
            respuestas_riesgo: Array(52).fill(false).map((_, i) => i < 10), // Simular riesgo moderado
            firma: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhAFGA76uzwAAAABJRU5ErkJggg==', // Pixel transparente
            usuario_id: 1
        };

        // 3. EJECUTAR RADICACIÓN
        console.log('[3/4] Paso: Ejecutando radicación en el servidor...');
        const radicarRes = await fetch(`${API_URL}/radicar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await radicarRes.json();
        if (!result.success) {
            console.error('❌ ERROR AL RADICAR:', result.message);
            return;
        }

        const data = result.data;
        console.log('✅ Radicación exitosa en Base de Datos!');
        console.log('📋 Radicado:', data.radicado);

        const folderId = data.drive_folder_id;
        console.log('📁 Carpeta en Drive ID:', folderId || 'No devuelta');

        // 4. VERIFICAR EN GOOGLE DRIVE (OPCIONAL/EXTRA)
        console.log('\n[4/4] Paso: Verificando integridad en la nube (Google Drive API)...');
        if (folderId && folderId !== 'PENDING' && folderId !== 'PENDING_RETRY' && !folderId.startsWith('simulated_')) {
            const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const auth = new google.auth.GoogleAuth({
                keyFile: path.resolve(process.cwd(), credentialsPath),
                scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
            });
            const drive = google.drive({ version: 'v3', auth });

            try {
                const folder = await drive.files.get({
                    fileId: folderId,
                    fields: 'id, name, webViewLink'
                });
                console.log('✨ CONFIRMACIÓN NUBE: La carpeta existe en Drive.');
                console.log('🔗 Link:', folder.data.webViewLink);
            } catch (driveErr) {
                console.error('❌ Error verificando en Drive:', driveErr.message);
            }
        } else {
            console.warn('⚠️ No se obtuvo ID real de carpeta de Drive (Estado:', folderId, ')');
        }

        // 5. TEST DE CAPACIDAD (QUOTA TEST)
        console.log('\n[5/4] Paso extra: Test de cuota metadata...');
        try {
            const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const auth = new google.auth.GoogleAuth({
                keyFile: path.resolve(process.cwd(), credentialsPath),
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
            const drive = google.drive({ version: 'v3', auth });
            const parentFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

            const testFolder = await drive.files.create({
                resource: {
                    name: 'Test de Cuota - ' + Date.now(),
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentFolderId]
                },
                fields: 'id'
            });
            console.log('✅ TEST METADATA EXITOSO: El Service Account PUEDE crear carpetas en el Root.');

            // Intentar borrarla
            await drive.files.delete({ fileId: testFolder.data.id });
            console.log('🧹 Limpieza completada.');
        } catch (qErr) {
            console.error('❌ FALLO TEST METADATA:', qErr.message);
        }

    } catch (err) {
        console.error('❌ ERROR FATAL DURANTE LA REVISIÓN:', err.message);
    }
}

verifyRadication();
