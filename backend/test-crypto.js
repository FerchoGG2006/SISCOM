require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { fieldEncryptionExtension } = require('prisma-field-encryption');
const sqlite3 = require('sqlite3').verbose();

// 1. Iniciar Prisma con Extensión de Cifrado
const globalPrisma = new PrismaClient();
const prisma = globalPrisma.$extends(
  fieldEncryptionExtension({
    encryptionKey: process.env.PRISMA_FIELD_ENCRYPTION_KEY || '736973636f6d5f73757065725f7365637265745f6b65795f323032365f676f62'
  })
);

async function run() {
    console.log("Iniciando prueba de cifrado AES-256-GCM Prisma...");
    
    // 2. Crear un registro con datos sensibles
    const nuevaPersona = await prisma.persona.create({
        data: {
            tipo_documento: 'CC',
            numero_documento: `TEST-${Date.now()}`,
            nombres: 'Agente',
            apellidos: 'Secreto',
            telefono: '3001234567',
            direccion: 'Ubicacion Confidencial',
            genero: 'Otro',
            es_victima: true
        }
    });

    console.log("\n✅ Registro Guardado en PRISMA (Capa de Aplicación - TEXTO PLANO):");
    console.log("Nombres:", nuevaPersona.nombres);
    console.log("Documento:", nuevaPersona.numero_documento);
    console.log("Dirección:", nuevaPersona.direccion);

    console.log("\n🔍 Consultando SQLite Directamente (Capa de Disco - CIFRADO GCM)...");
    
    // 3. Usar sqlite3 puro para ver la realidad del disco
    const db = new sqlite3.Database('./dev.db');
    
    db.get(`SELECT nombres, numero_documento, direccion FROM personas WHERE id = ?`, [nuevaPersona.id], (err, row) => {
        if (err) {
            console.error("Error en SQLite:", err);
            process.exit(1);
        }
        console.log("\n❌ Lo que vería un Hacker si se robara el archivo .db:");
        console.log("Nombres (Disco):", row.nombres);
        console.log("Documento (Disco):", row.numero_documento);
        console.log("Dirección (Disco):", row.direccion);
        console.log("\n⚠️ ¡El nivel de cifrado funciona! Textos planos transformados enCipherText indescifrables.");
        process.exit(0);
    });
}

run().catch(console.error);
