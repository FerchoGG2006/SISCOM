require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { google } = require('googleapis');

async function checkDrive() {
    try {
        const expediente = await prisma.expediente.findUnique({
            where: { id: 3 }
        });
        console.log("Expediente folder ID:", expediente.drive_folder_id);

        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const res = await drive.files.list({
            q: `'${expediente.drive_folder_id}' in parents`,
            fields: 'files(id, name, mimeType)',
        });

        console.log("Archivos en la carpeta:", res.data.files);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDrive();
