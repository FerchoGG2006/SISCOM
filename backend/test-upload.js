require('dotenv').config();
const driveService = require('./src/services/driveService');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // Create a dummy file
        const dummyPath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyPath, "Hello World from SISCOM");

        console.log("Intentando subir archivo a Drive...");
        // Use expediency 3's folder ID
        const folderId = '10U0ngVLvX_dJIHl4IIeI5oQuPPJ8bQv';

        const res = await driveService.uploadFile(folderId, dummyPath, 'dummy.txt', 'text/plain');
        console.log("EXITO:", res);

        fs.unlinkSync(dummyPath);
    } catch (e) {
        console.error("ERROR DE SUBIDA A DRIVE:");
        console.error(e.message);
        if (e.response && e.response.data) {
            console.error(e.response.data.error);
        }
    }
}

testUpload();
