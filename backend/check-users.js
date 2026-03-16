const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.usuario.findMany({ select: { email: true, password: true, rol: true } });
    console.log(users);
}

check().finally(() => prisma.$disconnect());
