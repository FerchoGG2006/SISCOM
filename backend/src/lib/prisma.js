const { PrismaClient } = require('@prisma/client');
const { fieldEncryptionExtension } = require('prisma-field-encryption');

const globalPrisma = new PrismaClient();
const prisma = globalPrisma.$extends(
  fieldEncryptionExtension({
    encryptionKey: process.env.PRISMA_FIELD_ENCRYPTION_KEY
  })
);

module.exports = prisma;
