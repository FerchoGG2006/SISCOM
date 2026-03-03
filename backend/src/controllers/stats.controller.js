const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class StatsController {
    /**
     * GET /api/v1/stats/summary
     */
    static async getSummary(req, res) {
        try {
            const [totalCasos, casosAbiertos, casosCerrados] = await Promise.all([
                prisma.expediente.count(),
                prisma.expediente.count({ where: { estado: 'Abierto' } }),
                prisma.expediente.count({ where: { estado: 'Cerrado' } })
            ]);

            // Agrupar por nivel de riesgo
            const riesgoStats = await prisma.expediente.groupBy({
                by: ['nivel_riesgo'],
                _count: { _all: true }
            });

            res.json({
                success: true,
                data: {
                    totalCasos,
                    casosAbiertos,
                    casosCerrados,
                    riesgoStats: riesgoStats.map(r => ({
                        label: r.nivel_riesgo,
                        value: r._count._all
                    }))
                }
            });
        } catch (error) {
            logger.error('Error in getSummary stats:', error);
            res.status(500).json({ success: false, message: 'Error al generar estadísticas' });
        }
    }

    /**
     * GET /api/v1/stats/by-barrio
     */
    static async getByBarrio(req, res) {
        try {
            // Unir expedientes con personas para agrupar por barrio de la víctima
            const barrios = await prisma.persona.groupBy({
                by: ['barrio'],
                where: { es_victima: true, barrio: { not: null } },
                _count: { _all: true }
            });

            res.json({
                success: true,
                data: barrios.map(b => ({
                    name: b.barrio,
                    value: b._count._all
                }))
            });
        } catch (error) {
            logger.error('Error in getByBarrio stats:', error);
            res.status(500).json({ success: false, message: 'Error al generar mapa de calor' });
        }
    }

    /**
     * GET /api/v1/stats/trends
     */
    static async getTrends(req, res) {
        try {
            // Agrupar por mes (SQLite format)
            const cases = await prisma.expediente.findMany({
                select: { fecha_radicacion: true }
            });

            const months = cases.reduce((acc, c) => {
                const date = new Date(c.fecha_radicacion);
                const month = date.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

            const data = Object.keys(months).map(m => ({ month: m, total: months[m] }));

            res.json({ success: true, data });
        } catch (error) {
            logger.error('Error in getTrends stats:', error);
            res.status(500).json({ success: false, message: 'Error al generar tendencias' });
        }
    }
}

module.exports = StatsController;
