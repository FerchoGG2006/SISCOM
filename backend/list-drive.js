require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function listFiles() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
        fields: 'files(id, name, mimeType, parents)',
    });
    fs.writeFileSync('drive-files.json', JSON.stringify(res.data.files, null, 2));
}

listFiles().catch(console.error);
