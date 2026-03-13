require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function testDrive() {
    try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        console.log("Credentials Path:", credentialsPath);
        console.log("Exists?", fs.existsSync(credentialsPath));

        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const parentFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
        console.log("Target Parent Folder:", parentFolderId);

        const fileMetadata = {
            name: "TEST_FOLDER_SISCOM_" + Date.now(),
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        console.log("Attempting to create folder...");
        const folder = await drive.files.create({
            resource: fileMetadata,
            fields: 'id, webViewLink'
        });

        console.log("SUCCESS! Folder ID:", folder.data.id);
        console.log("Link:", folder.data.webViewLink);
    } catch (error) {
        console.error("DRIVE ERROR:");
        console.error(error.message);
        if (error.response && error.response.data) {
            console.error(error.response.data.error);
        }
    }
}

testDrive();
