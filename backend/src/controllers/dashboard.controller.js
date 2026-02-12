const prisma = require('../lib/prisma');
const { startOfDay, endOfDay } = require('date-fns');

const getStats = async (req, res) => {
    try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Ejecutar consultas en paralelo para mayor velocidad
        const [
            totalExpedientes,
            expedientesAbiertos,
            expedientesCerrados,
            riesgoAlto,
            riesgoCritico,
            radicadosHoy,
            actividadReciente,
            totalUsuarios
        ] = await Promise.all([
            prisma.expediente.count(),
            prisma.expediente.count({ where: { estado: 'Abierto' } }),
            prisma.expediente.count({ where: { estado: 'Cerrado' } }),
            prisma.expediente.count({ where: { nivel_riesgo: 'Alto' } }),
            prisma.expediente.count({ where: { nivel_riesgo: { in: ['Critico', 'Extremo', 'Crítico'] } } }),
            prisma.expediente.count({
                where: {
                    fecha_radicacion: {
                        gte: todayStart,
                        lte: todayEnd
                    }
                }
            }),
            prisma.actuacion.findMany({
                take: 5,
                orderBy: { fecha: 'desc' },
                include: {
                    usuario: { select: { nombres: true, apellidos: true } },
                    expediente: { select: { radicado_hs: true } }
                }
            }),
            prisma.usuario.count()
        ]);

        res.json({
            success: true,
            data: {
                counts: {
                    total: totalExpedientes,
                    abiertos: expedientesAbiertos,
                    cerrados: expedientesCerrados,
                    usuarios: totalUsuarios,
                    hoy: radicadosHoy
                },
                risk: {
                    alto: riesgoAlto,
                    critico: riesgoCritico
                },
                recentActivity: actividadReciente.map(act => ({
                    id: act.id,
                    user: `${act.usuario.nombres} ${act.usuario.apellidos}`,
                    action: act.tipo,
                    target: act.expediente?.radicado_hs || 'N/A',
                    time: act.fecha
                }))
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar estadísticas'
        });
    }
};

module.exports = {
    getStats
};
