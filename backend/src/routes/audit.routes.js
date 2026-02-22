const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin'])); // Solo administradores pueden ver logs

router.get('/', async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                usuario: { select: { nombres: true, apellidos: true, email: true } }
            },
            orderBy: { timestamp: 'desc' },
            take: 100 // MVP: Carga los últimos 100
        });
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener logs' });
    }
});

module.exports = router;
