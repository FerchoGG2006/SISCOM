const prisma = require('../lib/prisma');
const logger = require('../config/logger');
const { subDays, startOfMonth, format } = require('date-fns');

class ReportesPrismaController {
    /**
     * GET /api/v1/reportes/estadisticas
     * Estadísticas completas para la página de reportes
     */
    static async estadisticasGenerales(req, res) {
        try {
            const today = new Date();
            const last30Days = subDays(today, 30);

            const [
                totalCasos,
                casosNuevos,
                casosCerrados,
                riesgoRaw,
                estadoRaw,
                usuariosRaw
            ] = await Promise.all([
                prisma.expediente.count(),
                prisma.expediente.count({
                    where: { fecha_radicacion: { gte: last30Days } }
                }),
                prisma.expediente.count({
                    where: { estado: 'Cerrado' }
                }),
                prisma.expediente.groupBy({
                    by: ['nivel_riesgo'],
                    _count: { id: true }
                }),
                prisma.expediente.groupBy({
                    by: ['estado'],
                    _count: { id: true }
                }),
                prisma.usuario.findMany({
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                        _count: {
                            select: { actuaciones: true }
                        }
                    },
                    take: 5
                })
            ]);

            // Formatear Riesgos (DB: Bajo, Moderado, Crítico -> UI: bajo, medio, alto, extremo)
            const porRiesgo = { bajo: 0, medio: 0, alto: 0, extremo: 0 };

            riesgoRaw.forEach(r => {
                const level = r.nivel_riesgo;
                if (level === 'Bajo') porRiesgo.bajo = r._count.id;
                else if (level === 'Moderado') porRiesgo.medio = r._count.id;
                else if (level === 'Crítico') porRiesgo.alto = r._count.id;
            });


            // Formatear Estados
            const porEstado = {};
            estadoRaw.forEach(e => {
                const key = e.estado.toLowerCase().replace(/ /g, '_');
                porEstado[key] = e._count.id;
            });

            // Simulación de tendencia (Placeholder para desarrollo)
            const tendenciaMensual = [
                { mes: 'Ene', casos: Math.floor(totalCasos * 0.1) },
                { mes: 'Feb', casos: Math.floor(totalCasos * 0.15) },
                { mes: 'Mar', casos: Math.floor(totalCasos * 0.2) },
                { mes: porEmail(today, 'MMM'), casos: casosNuevos }
            ];

            // Por Tipo (Placeholder ya que no está en esquema)
            const porTipo = {
                violencia_intrafamiliar: Math.floor(totalCasos * 0.6),
                violencia_pareja: Math.floor(totalCasos * 0.3),
                otros: Math.floor(totalCasos * 0.1)
            };

            res.json({
                success: true,
                data: {
                    totalCasos,
                    casosNuevos,
                    casosCerrados,
                    casosPendientes: totalCasos - casosCerrados,
                    porRiesgo,
                    porEstado,
                    porTipo,
                    tendenciaMensual,
                    usuariosSummary: usuariosRaw.map(u => ({
                        nombre: `${u.nombres} ${u.apellidos}`,
                        actuaciones: u._count.actuaciones
                    }))
                }
            });

        } catch (error) {
            logger.error('Error en estadísticas avanzadas (Prisma):', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }
}

// Helper para evitar errores si no está cargado date-fns correctamente en el entorno de ejecución
function porEmail(date, formatStr) {
    try {
        return format(date, formatStr);
    } catch (e) {
        return 'Mes';
    }
}

module.exports = ReportesPrismaController;

