const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BARRIOS = [
    { n: 'San Joaquín', lat: 10.478, lng: -73.255, c: '6' },
    { n: 'La Popa', lat: 10.472, lng: -73.265, c: '5' },
    { n: 'Centro', lat: 10.463, lng: -73.245, c: '1' },
    { n: 'Fundadores', lat: 10.455, lng: -73.260, c: '4' },
    { n: '12 de Octubre', lat: 10.468, lng: -73.235, c: '2' },
    { n: 'Mareigua', lat: 10.435, lng: -73.240, c: '3' }
];

async function migrate() {
    const victimas = await prisma.persona.findMany({ where: { es_victima: true } });

    for (let i = 0; i < victimas.length; i++) {
        const barrio = BARRIOS[i % BARRIOS.length];
        await prisma.persona.update({
            where: { id: victimas[i].id },
            data: {
                barrio: barrio.n,
                comuna: barrio.c,
                latitud: barrio.lat,
                longitud: barrio.lng
            }
        });
    }

    console.log(`Migración completada: ${victimas.length} víctimas actualizadas.`);
    process.exit(0);
}

migrate();
