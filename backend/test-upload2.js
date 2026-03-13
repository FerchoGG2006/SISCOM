require('dotenv').config();
const driveService = require('./src/services/driveService');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        const dummyPath = path.join(__dirname, 'dummy2.txt');
        fs.writeFileSync(dummyPath, "Test upload for real folder ID");

        console.log("Subiendo archivo a la carpeta validada...");
        const folderId = '10U0ngVLYj_dJIHl4IIeI5oQuPPJ8bQvX';

        const res = await driveService.uploadFile(folderId, dummyPath, 'dummy2.txt', 'text/plain');
        console.log("EXITO:", res);

        fs.unlinkSync(dummyPath);
    } catch (e) {
        console.error("ERROR DE SUBIDA:");
        console.error(e.message);
        if (e.response && e.response.data) {
            console.error(e.response.data.error);
        }
    }
}

testUpload();
