const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const victimas = await prisma.persona.findMany({
        where: { es_victima: true },
        select: { id: true, barrio: true, latitud: true, longitud: true }
    });
    console.log('VICTIMAS:', JSON.stringify(victimas, null, 2));
    process.exit(0);
}

check();
