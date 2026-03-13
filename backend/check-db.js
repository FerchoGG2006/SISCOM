const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function check() {
    const expediente = await prisma.expediente.findUnique({ where: { id: 3 } });
    fs.writeFileSync('db-id.json', JSON.stringify({ id: expediente.drive_folder_id }, null, 2));
}

check().finally(() => prisma.$disconnect());
