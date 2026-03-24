const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Scopes requeridos (Igual que en SISCOM)
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

// Rutas de archivos
const CREDENTIALS_DIR = path.join(__dirname, 'credentials');
const OAUTH_CREDS_PATH = path.join(CREDENTIALS_DIR, 'oauth-credentials.json');
const TOKEN_PATH = path.join(CREDENTIALS_DIR, 'token.json');

// Crear directorio de credenciales si no existe
if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}

function startOAuthFlow() {
    if (!fs.existsSync(OAUTH_CREDS_PATH)) {
        console.error('❌ ERROR: El archivo oauth-credentials.json no existe.');
        console.error(`👉 Debes descargar tu Cliente OAuth 2.0 desde Google Cloud Console y guardarlo en:\n${OAUTH_CREDS_PATH}`);
        console.error('\nInstrucciones Google Cloud:');
        console.error('1. Ve a "APIs & Services" > "Credentials".');
        console.error('2. Click en "Create Credentials" > "OAuth client ID".');
        console.error('3. Si te pide configurar la pantalla de consentimiento (Consent Screen), ponla en interno o añade tu mail en testing.');
        console.error('4. Tipo de App: "Desktop app" (o App de Escritorio).');
        console.error('5. Descarga el JSON y renómbralo a oauth-credentials.json en la carpeta credentials/.');
        process.exit(1);
    }

    const { client_secret, client_id, redirect_uris } = JSON.parse(fs.readFileSync(OAUTH_CREDS_PATH)).installed || JSON.parse(fs.readFileSync(OAUTH_CREDS_PATH)).web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob');

    // Revisar si ya hay token
    if (fs.existsSync(TOKEN_PATH)) {
        console.log('✅ Ya existe un token.json. El sistema está autenticado.');
        console.log('Para generar uno nuevo, borra credentials/token.json y vuelve a correr este script.');
        process.exit(0);
    }

    getAccessToken(oAuth2Client);
}

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    
    console.log('\n=============================================');
    console.log('🔐 AUTENTICACIÓN GOOGLE DRIVE (SISCOM)');
    console.log('=============================================');
    console.log('1. Abre este enlace en cualquier navegador web:');
    console.log('\n' + authUrl + '\n');
    console.log('2. Inicia sesión con la cuenta de Gmail (o institucional) cuyo almacenamiento se usará para SISCOM.');
    console.log('3. Autoriza los permisos (Si sale "App no verificada", dale a "Avanzado" > "Ir a SISCOM").');
    console.log('4. Copia el código que Google te arrojará al final.');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('\n👉 Pega el CÓDIGO aquí: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('❌ Error obteniendo el token:', err.response?.data?.error || err);
                return;
            }
            oAuth2Client.setCredentials(token);
            // Guardar el token en el disco para ejecuciones futuras
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log('\n✅ ¡ÉXITO! Credenciales guardadas correctamente en credentials/token.json.');
            console.log('SISCOM ahora usará esta cuenta personal/institucional para subir los archivos y no sufrirá errores de cuota.');
        });
    });
}

startOAuthFlow();
