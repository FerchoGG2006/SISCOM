require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- 🚀 SISCOM DB SEEDER ---');

    // Limpiar
    await prisma.evaluacionRiesgo.deleteMany({});
    await prisma.expediente.deleteMany({});
    await prisma.persona.deleteMany({});
    await prisma.usuario.deleteMany({});

    // Crear Usuario Admin
    console.log('Creando usuario admin...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Siscom2026!', 10);
    await prisma.usuario.create({
        data: {
            nombres: 'Comisario',
            apellidos: 'Principal',
            email: 'comisario@siscom.gov.co',
            password: hashedPassword,
            rol: 'comisario',
            cargo: 'Comisario de Familia'
        }
    });


    // Crear Personas
    console.log('Creando personas...');
    const maria = await prisma.persona.create({
        data: {
            numero_documento: '12345678',
            tipo_documento: 'CC',
            nombres: 'María Elena',
            apellidos: 'Gómez Pérez',
            telefono: '3001234567',
            direccion: 'Calle 10 #20-30',
            es_victima: true
        },
    });

    const juan = await prisma.persona.create({
        data: {
            numero_documento: '87654321',
            tipo_documento: 'CC',
            nombres: 'Juan Carlos',
            apellidos: 'Rodríguez',
            es_agresor: true
        },
    });

    // Crear Expedientes
    console.log('Creando expediente...');
    await prisma.expediente.create({
        data: {
            radicado_hs: 'HS-2026-00001',
            id_victima: maria.id,
            id_agresor: juan.id,
            nivel_riesgo: 'Moderado',
            puntaje_riesgo: 75,
            relato_hechos: 'El agresor ha mantenido una conducta hostil y amenazas persistentes.'
        }
    });

    console.log('✅ Base de datos sembrada con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
