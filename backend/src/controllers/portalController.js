const prisma = require('../lib/prisma');

const portalController = {
    // Consulta pública: Requiere Documento de Identidad y PIN (Sin JWT requerido)
    consultarCaso: async (req, res) => {
        try {
            const { numero_documento, pin } = req.body;

            if (!numero_documento || !pin) {
                return res.status(400).json({ success: false, message: 'El documento y el PIN son obligatorios.' });
            }

            // Buscar la persona y sus expedientes (como víctima)
            const persona = await prisma.persona.findUnique({
                where: { numero_documento },
                include: {
                    expedientesVictima: {
                        include: {
                            tokenConsulta: true,
                            actuaciones: {
                                orderBy: { fecha: 'asc' }
                            }
                        }
                    }
                }
            });

            if (!persona) {
                return res.status(404).json({ success: false, message: 'No se encontraron registros para este documento.' });
            }

            // Filtrar el expediente correcto usando el PIN
            const expedienteValidado = persona.expedientesVictima.find(exp => 
                exp.tokenConsulta && exp.tokenConsulta.pin === pin && exp.tokenConsulta.activo
            );

            if (!expedienteValidado) {
                return res.status(401).json({ success: false, message: 'Credenciales inválidas o PIN incorrecto.' });
            }

            // Limpiar datos sensibles para la respuesta pública
            // La víctima solo debe ver el estado y el flujo de los pasos.
            const safeResponse = {
                radicado: expedienteValidado.radicado_hs,
                fecha_radicacion: expedienteValidado.fecha_radicacion,
                estado_actual: expedienteValidado.estado,
                nivel_riesgo_asignado: expedienteValidado.nivel_riesgo, // Para que sepan la prioridad
                timeline: expedienteValidado.actuaciones.map(act => ({
                    fecha: act.fecha,
                    tipo: act.tipo,
                    descripcion_corta: obtenerDescripcionCorta(act.tipo)
                }))
            };

            res.json({ success: true, data: safeResponse });

        } catch (error) {
            console.error('Error en portal de consulta:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor de consultas.' });
        }
    }
};

// Utilidad para limpiar descripciones y no filtrar relatos textuales reales
function obtenerDescripcionCorta(tipo) {
    const mapa = {
        'RADICACION': 'El caso fue ingresado al sistema.',
        'RADICACIÓN': 'El caso fue ingresado al sistema.',
        'RECEPCION': 'Documento inicial recepcionado.',
        'EVALUACION': 'Riesgo evaluado por profesionales.',
        'MEDIDA_PROTECCION': 'El Comisario emitió una Medida de Protección.',
        'AUTO_INICIO': 'Se decretó la apertura formal del trámite de protección.',
        'AUDIENCIA_PROGRAMADA': 'Se ha agendado una audiencia o cita.',
        'CIERRE': 'El expediente ha sido archivado/cerrado.'
    };
    return mapa[tipo] || 'Actuación registrada en el sistema.';
}

module.exports = portalController;
