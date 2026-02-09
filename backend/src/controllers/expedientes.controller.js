/**
 * SISCOM - Controlador de Expedientes
 * Maneja la radicación de casos y gestión de expedientes
 */
const { query, transaction, insert } = require('../config/database');
const logger = require('../config/logger');
const googleDrive = require('../services/googleDrive.service');
const RiskCalculator = require('../services/riskCalculator.service');

class ExpedientesController {
    /**
     * POST /radicar
     * Radica un nuevo caso, crea personas, carpeta en Drive y calcula riesgo
     */
    static async radicar(req, res) {
        try {
            const { victima, agresor, datosHecho, valoracionRiesgo } = req.body;
            const usuarioId = req.user.id;

            // Ejecutar todo en una transacción
            const resultado = await transaction(async (connection) => {
                // 1. Generar radicado único
                const radicado = await ExpedientesController.generarRadicado(connection);

                // 2. Guardar datos de la víctima
                const victimaData = {
                    ...victima,
                    rol_en_caso: 'victima',
                    usuario_registro_id: usuarioId
                };
                const [victimaResult] = await connection.execute(
                    `INSERT INTO personas SET ?`,
                    [victimaData]
                );
                const victimaId = victimaResult.insertId;

                // 3. Guardar datos del agresor
                const agresorData = {
                    ...agresor,
                    rol_en_caso: 'agresor',
                    usuario_registro_id: usuarioId
                };
                const [agresorResult] = await connection.execute(
                    `INSERT INTO personas SET ?`,
                    [agresorData]
                );
                const agresorId = agresorResult.insertId;

                // 4. Calcular riesgo si se proporcionaron respuestas
                let resultadoRiesgo = null;
                if (valoracionRiesgo) {
                    resultadoRiesgo = RiskCalculator.calcular(valoracionRiesgo);
                }

                // 5. Crear el expediente
                const expedienteData = {
                    radicado: radicado.radicado,
                    anio: radicado.anio,
                    consecutivo: radicado.consecutivo,
                    tipo_caso: datosHecho.tipo_caso || 'violencia_intrafamiliar',
                    subtipo_violencia: datosHecho.subtipo_violencia,
                    fecha_hechos: datosHecho.fecha_hechos,
                    descripcion_hechos: datosHecho.descripcion_hechos,
                    lugar_hechos: datosHecho.lugar_hechos,
                    puntaje_riesgo: resultadoRiesgo?.puntajeTotal || 0,
                    nivel_riesgo: resultadoRiesgo?.nivelRiesgo || 'sin_evaluar',
                    estado: 'radicado',
                    prioridad: ExpedientesController.determinarPrioridad(resultadoRiesgo),
                    usuario_radicacion_id: usuarioId,
                    ip_radicacion: req.ip
                };

                const [expedienteResult] = await connection.execute(
                    `INSERT INTO expedientes SET ?`,
                    [expedienteData]
                );
                const expedienteId = expedienteResult.insertId;

                // 6. Vincular personas al expediente
                await connection.execute(
                    `INSERT INTO expediente_personas (expediente_id, persona_id, rol, parentesco_con_victima) VALUES (?, ?, 'victima_principal', NULL)`,
                    [expedienteId, victimaId]
                );
                await connection.execute(
                    `INSERT INTO expediente_personas (expediente_id, persona_id, rol, parentesco_con_victima) VALUES (?, ?, 'agresor_principal', ?)`,
                    [expedienteId, agresorId, agresor.parentesco_con_victima]
                );

                // 7. Guardar valoración de riesgo si existe
                if (valoracionRiesgo && resultadoRiesgo) {
                    const valoracionData = {
                        expediente_id: expedienteId,
                        ...valoracionRiesgo,
                        puntaje_total: resultadoRiesgo.puntajeTotal,
                        nivel_riesgo: resultadoRiesgo.nivelRiesgo,
                        usuario_evaluador_id: usuarioId
                    };
                    await connection.execute(
                        `INSERT INTO valoracion_riesgo SET ?`,
                        [valoracionData]
                    );
                }

                // 8. Registrar actuación
                await connection.execute(
                    `INSERT INTO actuaciones (expediente_id, tipo_actuacion, descripcion, usuario_id, ip_actuacion) VALUES (?, 'radicacion', ?, ?, ?)`,
                    [expedienteId, `Radicación de caso ${radicado.radicado}`, usuarioId, req.ip]
                );

                return {
                    expedienteId,
                    radicado: radicado.radicado,
                    victimaId,
                    agresorId,
                    resultadoRiesgo
                };
            });

            // 9. Crear carpeta en Google Drive (fuera de la transacción)
            let driveInfo = null;
            try {
                const nombreVictima = `${victima.primer_nombre} ${victima.primer_apellido}`;
                driveInfo = await googleDrive.createExpedienteFolder(resultado.radicado, nombreVictima);

                if (driveInfo) {
                    await query(
                        `UPDATE expedientes SET carpeta_drive_id = ?, carpeta_drive_url = ? WHERE id = ?`,
                        [driveInfo.folderId, driveInfo.folderUrl, resultado.expedienteId]
                    );
                }
            } catch (driveError) {
                logger.error('Error creando carpeta en Drive:', driveError);
            }

            // 10. Generar notificación si riesgo alto/extremo
            if (resultado.resultadoRiesgo?.nivelRiesgo === 'extremo' || resultado.resultadoRiesgo?.nivelRiesgo === 'alto') {
                await ExpedientesController.crearAlertaRiesgo(resultado.expedienteId, resultado.resultadoRiesgo);
            }

            logger.info(`Caso radicado: ${resultado.radicado}`, {
                expedienteId: resultado.expedienteId,
                nivelRiesgo: resultado.resultadoRiesgo?.nivelRiesgo
            });

            res.status(201).json({
                success: true,
                message: 'Caso radicado exitosamente',
                data: {
                    expedienteId: resultado.expedienteId,
                    radicado: resultado.radicado,
                    nivelRiesgo: resultado.resultadoRiesgo?.nivelRiesgo || 'sin_evaluar',
                    puntajeRiesgo: resultado.resultadoRiesgo?.puntajeTotal || 0,
                    alertas: resultado.resultadoRiesgo?.alertasEspeciales || [],
                    recomendaciones: RiskCalculator.getRecomendaciones(resultado.resultadoRiesgo?.nivelRiesgo),
                    carpetaDrive: driveInfo
                }
            });

        } catch (error) {
            logger.error('Error en radicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al radicar el caso',
                error: error.message
            });
        }
    }

    /**
     * Genera un radicado único con formato HS-2026-XXXXX
     */
    static async generarRadicado(connection) {
        const prefijo = process.env.RADICADO_PREFIX || 'HS';
        const anio = new Date().getFullYear();

        const [rows] = await connection.execute(
            `SELECT COALESCE(MAX(consecutivo), 0) + 1 as siguiente FROM expedientes WHERE anio = ?`,
            [anio]
        );

        const consecutivo = rows[0].siguiente;
        const radicado = `${prefijo}-${anio}-${String(consecutivo).padStart(5, '0')}`;

        return { radicado, anio, consecutivo };
    }

    /**
     * Determina prioridad según nivel de riesgo
     */
    static determinarPrioridad(resultadoRiesgo) {
        if (!resultadoRiesgo) return 'normal';

        switch (resultadoRiesgo.nivelRiesgo) {
            case 'extremo': return 'inmediata';
            case 'alto': return 'urgente';
            default: return 'normal';
        }
    }

    /**
     * Crear alerta para casos de riesgo alto/extremo
     */
    static async crearAlertaRiesgo(expedienteId, resultadoRiesgo) {
        const titulo = resultadoRiesgo.nivelRiesgo === 'extremo'
            ? '🚨 ALERTA: Riesgo EXTREMO detectado'
            : '⚠️ Alerta: Riesgo ALTO detectado';

        // Notificar a todos los usuarios con rol comisario
        await query(
            `INSERT INTO notificaciones (usuario_id, expediente_id, tipo, titulo, mensaje, prioridad)
             SELECT id, ?, 'alerta_riesgo', ?, ?, 'critica'
             FROM usuarios WHERE rol IN ('comisario', 'admin') AND activo = 1`,
            [expedienteId, titulo, JSON.stringify(resultadoRiesgo.alertasEspeciales)]
        );
    }

    /**
     * GET /expedientes
     * Lista expedientes con filtros
     */
    static async listar(req, res) {
        try {
            const { estado, nivel_riesgo, fecha_inicio, fecha_fin, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            let sql = `
                SELECT e.*, 
                       v.primer_nombre as victima_nombre, v.primer_apellido as victima_apellido,
                       a.primer_nombre as agresor_nombre, a.primer_apellido as agresor_apellido,
                       u.nombres as funcionario_nombre
                FROM expedientes e
                LEFT JOIN expediente_personas epv ON e.id = epv.expediente_id AND epv.rol = 'victima_principal'
                LEFT JOIN personas v ON epv.persona_id = v.id
                LEFT JOIN expediente_personas epa ON e.id = epa.expediente_id AND epa.rol = 'agresor_principal'
                LEFT JOIN personas a ON epa.persona_id = a.id
                LEFT JOIN usuarios u ON e.usuario_radicacion_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (estado) {
                sql += ` AND e.estado = ?`;
                params.push(estado);
            }

            if (nivel_riesgo) {
                sql += ` AND e.nivel_riesgo = ?`;
                params.push(nivel_riesgo);
            }

            if (fecha_inicio) {
                sql += ` AND DATE(e.fecha_radicacion) >= ?`;
                params.push(fecha_inicio);
            }

            if (fecha_fin) {
                sql += ` AND DATE(e.fecha_radicacion) <= ?`;
                params.push(fecha_fin);
            }

            sql += ` ORDER BY e.fecha_radicacion DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const expedientes = await query(sql, params);

            // Contar total
            const [countResult] = await query(
                `SELECT COUNT(*) as total FROM expedientes`
            );

            res.json({
                success: true,
                data: expedientes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total
                }
            });

        } catch (error) {
            logger.error('Error listando expedientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al listar expedientes'
            });
        }
    }

    /**
     * GET /expedientes/:id
     * Obtiene detalle de un expediente
     */
    static async obtener(req, res) {
        try {
            const { id } = req.params;

            const expedientes = await query(
                `SELECT * FROM expedientes WHERE id = ?`,
                [id]
            );

            if (expedientes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Expediente no encontrado'
                });
            }

            const expediente = expedientes[0];

            // Obtener personas vinculadas
            const personas = await query(
                `SELECT p.*, ep.rol, ep.parentesco_con_victima
                 FROM expediente_personas ep
                 JOIN personas p ON ep.persona_id = p.id
                 WHERE ep.expediente_id = ?`,
                [id]
            );

            // Obtener valoración de riesgo
            const valoraciones = await query(
                `SELECT * FROM valoracion_riesgo WHERE expediente_id = ?`,
                [id]
            );

            // Obtener actuaciones
            const actuaciones = await query(
                `SELECT a.*, u.nombres as usuario_nombre
                 FROM actuaciones a
                 LEFT JOIN usuarios u ON a.usuario_id = u.id
                 WHERE a.expediente_id = ?
                 ORDER BY a.fecha_actuacion DESC`,
                [id]
            );

            // Obtener documentos
            const documentos = await query(
                `SELECT * FROM documentos WHERE expediente_id = ? ORDER BY fecha_generacion DESC`,
                [id]
            );

            res.json({
                success: true,
                data: {
                    ...expediente,
                    personas,
                    valoracionRiesgo: valoraciones[0] || null,
                    actuaciones,
                    documentos
                }
            });

        } catch (error) {
            logger.error('Error obteniendo expediente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener expediente'
            });
        }
    }
}

module.exports = ExpedientesController;
