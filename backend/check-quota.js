require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function checkQuota() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.about.get({
        fields: 'storageQuota',
    });

    // Find biggest files
    const resFiles = await drive.files.list({
        fields: 'files(id, name, quotaBytesUsed, mimeType)',
        pageSize: 10
    });

    fs.writeFileSync('quota.json', JSON.stringify({
        quota: res.data.storageQuota,
        files: resFiles.data.files
    }, null, 2));
}

checkQuota().catch(console.error);
