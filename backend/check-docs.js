const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDocs() {
    const docs = await prisma.documento.findMany({
        where: { id_expediente: 3 },
        orderBy: { generado_el: 'desc' },
        take: 3
    });
    console.log(docs.map(d => ({ id: d.id, tipo: d.tipo, url_drive: d.url_drive })));
}

checkDocs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
