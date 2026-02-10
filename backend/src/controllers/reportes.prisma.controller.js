const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class ReportesPrismaController {
    /**
     * GET /api/v1/reportes/estadisticas
     * Estadísticas para el dashboard
     */
    static async estadisticasGenerales(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [total, critical, pending, todayCount] = await Promise.all([
                prisma.expediente.count(),
                prisma.expediente.count({ where: { nivel_riesgo: 'Crítico' } }),
                prisma.expediente.count({ where: { nivel_riesgo: 'Moderado' } }), // Assuming moderate as pending
                prisma.expediente.count({
                    where: {
                        fecha_radicacion: {
                            gte: today
                        }
                    }
                })
            ]);

            const recentCases = await prisma.expediente.findMany({
                take: 5,
                orderBy: { fecha_radicacion: 'desc' },
                include: {
                    victima: {
                        select: { nombres: true, apellidos: true }
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    total,
                    critical,
                    pending,
                    today: todayCount,
                    recentCases: recentCases.map(c => ({
                        id: c.id,
                        radicado: c.radicado_hs,
                        victima: `${c.victima.nombres} ${c.victima.apellidos}`,
                        riesgo: c.nivel_riesgo,
                        fecha: c.fecha_radicacion
                    }))
                }
            });
        } catch (error) {
            logger.error('Error en estadísticas (Prisma):', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }
}

module.exports = ReportesPrismaController;
