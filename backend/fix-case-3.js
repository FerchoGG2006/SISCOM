require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const driveService = require('./src/services/driveService');

async function fixCase3() {
    try {
        const expediente = await prisma.expediente.findUnique({
            where: { id: 3 },
            include: { victima: true }
        });

        if (!expediente) {
            console.log("Expediente 3 no encontrado.");
            return;
        }

        console.log("Creando carpeta real para Expediente 3...");
        const folderId = await driveService.createCaseFolder(
            expediente.radicado_hs,
            `${expediente.victima.nombres} ${expediente.victima.apellidos}`
        );

        if (folderId && folderId !== 'PENDING_RETRY' && !folderId.startsWith('simulated')) {
            console.log("Carpeta creada:", folderId);
            await prisma.expediente.update({
                where: { id: 3 },
                data: { drive_folder_id: folderId }
            });
            console.log("DB actualizada con éxito.");
        } else {
            console.log("Fallo al crear la carpeta:", folderId);
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixCase3();
