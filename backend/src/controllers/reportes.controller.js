/**
 * SISCOM - Controlador de Reportes
 * Genera estadísticas y reportes del sistema
 */

const db = require('../config/database');
const logger = require('../config/logger');

const reportesController = {
    /**
     * Obtiene estadísticas generales del dashboard
     */
    async estadisticasGenerales(req, res) {
        try {
            // Total de expedientes
            const [totalResult] = await db.query('SELECT COUNT(*) as total FROM expedientes');

            // Expedientes por estado
            const porEstado = await db.query(`
                SELECT estado, COUNT(*) as cantidad 
                FROM expedientes 
                GROUP BY estado
            `);

            // Expedientes por nivel de riesgo
            const porRiesgo = await db.query(`
                SELECT nivel_riesgo, COUNT(*) as cantidad 
                FROM expedientes 
                GROUP BY nivel_riesgo
            `);

            // Expedientes nuevos este mes
            const [nuevosMes] = await db.query(`
                SELECT COUNT(*) as cantidad 
                FROM expedientes 
                WHERE MONTH(fecha_radicacion) = MONTH(CURRENT_DATE())
                AND YEAR(fecha_radicacion) = YEAR(CURRENT_DATE())
            `);

            // Expedientes cerrados este mes
            const [cerradosMes] = await db.query(`
                SELECT COUNT(*) as cantidad 
                FROM expedientes 
                WHERE estado = 'cerrado'
                AND MONTH(fecha_actualizacion) = MONTH(CURRENT_DATE())
                AND YEAR(fecha_actualizacion) = YEAR(CURRENT_DATE())
            `);

            res.json({
                success: true,
                data: {
                    totalExpedientes: totalResult.total,
                    nuevosEsteMes: nuevosMes.cantidad,
                    cerradosEsteMes: cerradosMes.cantidad,
                    porEstado: porEstado.reduce((acc, item) => {
                        acc[item.estado] = item.cantidad;
                        return acc;
                    }, {}),
                    porRiesgo: porRiesgo.reduce((acc, item) => {
                        acc[item.nivel_riesgo] = item.cantidad;
                        return acc;
                    }, {})
                }
            });
        } catch (error) {
            logger.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }
    },

    /**
     * Reporte por período
     */
    async reportePeriodo(req, res) {
        const { fechaInicio, fechaFin } = req.query;

        try {
            // Expedientes en el período
            const expedientes = await db.query(`
                SELECT 
                    e.id,
                    e.radicado,
                    e.tipo_caso,
                    e.nivel_riesgo,
                    e.estado,
                    e.fecha_radicacion,
                    CONCAT(pv.primer_nombre, ' ', pv.primer_apellido) as victima
                FROM expedientes e
                LEFT JOIN expediente_personas epv ON e.id = epv.expediente_id AND epv.tipo_interviniente = 'victima'
                LEFT JOIN personas pv ON epv.persona_id = pv.id
                WHERE e.fecha_radicacion BETWEEN ? AND ?
                ORDER BY e.fecha_radicacion DESC
            `, [fechaInicio, fechaFin]);

            // Resumen
            const [resumen] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN nivel_riesgo = 'bajo' THEN 1 ELSE 0 END) as riesgo_bajo,
                    SUM(CASE WHEN nivel_riesgo = 'medio' THEN 1 ELSE 0 END) as riesgo_medio,
                    SUM(CASE WHEN nivel_riesgo = 'alto' THEN 1 ELSE 0 END) as riesgo_alto,
                    SUM(CASE WHEN nivel_riesgo = 'extremo' THEN 1 ELSE 0 END) as riesgo_extremo
                FROM expedientes
                WHERE fecha_radicacion BETWEEN ? AND ?
            `, [fechaInicio, fechaFin]);

            res.json({
                success: true,
                data: {
                    periodo: { fechaInicio, fechaFin },
                    resumen,
                    expedientes
                }
            });
        } catch (error) {
            logger.error('Error generando reporte:', error);
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    },

    /**
     * Reporte por funcionario
     */
    async reporteFuncionario(req, res) {
        const { funcionarioId, fechaInicio, fechaFin } = req.query;

        try {
            const reporte = await db.query(`
                SELECT 
                    u.id,
                    u.nombres,
                    u.apellidos,
                    u.cargo,
                    COUNT(e.id) as total_expedientes,
                    SUM(CASE WHEN e.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
                    SUM(CASE WHEN e.nivel_riesgo IN ('alto', 'extremo') THEN 1 ELSE 0 END) as alto_riesgo,
                    AVG(DATEDIFF(e.fecha_actualizacion, e.fecha_radicacion)) as promedio_dias
                FROM usuarios u
                LEFT JOIN expedientes e ON e.funcionario_asignado = u.id
                    AND e.fecha_radicacion BETWEEN ? AND ?
                WHERE u.activo = 1
                ${funcionarioId ? 'AND u.id = ?' : ''}
                GROUP BY u.id
                ORDER BY total_expedientes DESC
            `, funcionarioId ? [fechaInicio, fechaFin, funcionarioId] : [fechaInicio, fechaFin]);

            res.json({
                success: true,
                data: reporte
            });
        } catch (error) {
            logger.error('Error en reporte funcionario:', error);
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    },

    /**
     * Tendencia mensual
     */
    async tendenciaMensual(req, res) {
        const { meses = 6 } = req.query;

        try {
            const tendencia = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha_radicacion, '%Y-%m') as mes,
                    COUNT(*) as total,
                    SUM(CASE WHEN nivel_riesgo IN ('alto', 'extremo') THEN 1 ELSE 0 END) as criticos
                FROM expedientes
                WHERE fecha_radicacion >= DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH)
                GROUP BY DATE_FORMAT(fecha_radicacion, '%Y-%m')
                ORDER BY mes ASC
            `, [parseInt(meses)]);

            res.json({
                success: true,
                data: tendencia
            });
        } catch (error) {
            logger.error('Error en tendencia mensual:', error);
            res.status(500).json({ success: false, message: 'Error al obtener tendencia' });
        }
    }
};

module.exports = reportesController;
