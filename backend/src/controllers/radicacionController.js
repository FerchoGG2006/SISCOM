const prisma = require('../lib/prisma');
const riskService = require('../services/riskService');
const driveService = require('../services/driveService');
const pdfGenerator = require('../services/pdfGenerator.service');
const audienciasController = require('./audiencias.controller');
const notificacionesController = require('./notificaciones.controller');
const AuditService = require('./audit.controller');

const radicarCaso = async (req, res) => {
    try {
        const { victima, agresor, respuestas_riesgo, usuario_id, firma, datosHecho } = req.body;

        // --- VALIDACIÓN DE ENTRADA ---
        if (!victima || !victima.numero_documento || !victima.tipo_documento) {
            return res.status(400).json({
                success: false,
                message: 'Datos de la víctima incompletos (requiere documento y tipo)'
            });
        }

        // --- VERIFICACIÓN DE USUARIO ---
        let finalUsuarioId = usuario_id;
        if (!finalUsuarioId) {
            finalUsuarioId = 1;
        }

        const usuarioExiste = await prisma.usuario.findUnique({ where: { id: finalUsuarioId } });
        if (!usuarioExiste) {
            console.warn(`[RADICACION] Usuario ID ${finalUsuarioId} no encontrado. Buscando cualquier usuario activo.`);
            const primerUsuario = await prisma.usuario.findFirst();
            if (primerUsuario) {
                finalUsuarioId = primerUsuario.id;
            } else {
                console.error('[RADICACION] CRITICO: No hay usuarios en el sistema para asociar la actuación.');
                return res.status(500).json({
                    success: false,
                    message: 'Error de integridad: No hay usuarios en el sistema para registrar el caso.'
                });
            }
        }

        // Normalización de nombres
        const victimFullName = `${victima.primer_nombre} ${victima.segundo_nombre || ''}`.trim();
        const victimFullLastName = `${victima.primer_apellido} ${victima.segundo_apellido || ''}`.trim();

        const aggressorFullName = agresor ? `${agresor.primer_nombre} ${agresor.segundo_nombre || ''}`.trim() : null;
        const aggressorFullLastName = agresor ? `${agresor.primer_apellido} ${agresor.segundo_apellido || ''}`.trim() : null;

        // 1. Iniciar transacción con Prisma
        const result = await prisma.$transaction(async (tx) => {

            // 2. Procesar Víctima
            const personaVictima = await tx.persona.upsert({
                where: { numero_documento: victima.numero_documento },
                update: {
                    nombres: victimFullName,
                    apellidos: victimFullLastName,
                    tipo_documento: victima.tipo_documento,
                    telefono: victima.telefono_celular || victima.telefono,
                    direccion: victima.direccion,
                    barrio: victima.barrio,
                    comuna: victima.comuna,
                    latitud: victima.latitud ? parseFloat(victima.latitud) : null,
                    longitud: victima.longitud ? parseFloat(victima.longitud) : null,
                    es_victima: true
                },
                create: {
                    numero_documento: victima.numero_documento,
                    tipo_documento: victima.tipo_documento,
                    nombres: victimFullName,
                    apellidos: victimFullLastName,
                    telefono: victima.telefono_celular || victima.telefono,
                    direccion: victima.direccion,
                    barrio: victima.barrio,
                    comuna: victima.comuna,
                    latitud: victima.latitud ? parseFloat(victima.latitud) : null,
                    longitud: victima.longitud ? parseFloat(victima.longitud) : null,
                    es_victima: true
                },
            });

            // 3. Procesar Agresor
            let personaAgresorId = null;
            if (agresor && agresor.numero_documento) {
                const personaAgresor = await tx.persona.upsert({
                    where: { numero_documento: agresor.numero_documento },
                    update: {
                        nombres: aggressorFullName,
                        apellidos: aggressorFullLastName,
                        direccion: agresor.direccion,
                        barrio: agresor.barrio,
                        comuna: agresor.comuna,
                        es_agresor: true
                    },
                    create: {
                        numero_documento: agresor.numero_documento,
                        tipo_documento: agresor.tipo_documento || 'CC',
                        nombres: aggressorFullName,
                        apellidos: aggressorFullLastName,
                        direccion: agresor.direccion,
                        barrio: agresor.barrio,
                        comuna: agresor.comuna,
                        es_agresor: true
                    },
                });
                personaAgresorId = personaAgresor.id;
            }

            // 4. Calcular Riesgo
            const riskResult = riskService.calculateRisk(respuestas_riesgo || []);

            // 5. Generar Radicado
            const year = new Date().getFullYear();
            const lastExpediente = await tx.expediente.findFirst({
                where: { radicado_hs: { startsWith: `HS-${year}-` } },
                orderBy: { radicado_hs: 'desc' }
            });

            let consecutive = 1;
            if (lastExpediente) {
                const parts = lastExpediente.radicado_hs.split('-');
                if (parts.length === 3) {
                    const lastNum = parseInt(parts[2], 10);
                    if (!isNaN(lastNum)) consecutive = lastNum + 1;
                }
            }

            const radicado = `HS-${year}-${String(consecutive).padStart(5, '0')}`;
            const pinConsultas = Math.floor(100000 + Math.random() * 900000).toString();

            // 6. Crear Expediente
            const expediente = await tx.expediente.create({
                data: {
                    radicado_hs: radicado,
                    id_victima: personaVictima.id,
                    id_agresor: personaAgresorId,
                    nivel_riesgo: riskResult.nivelRiesgo,
                    puntaje_riesgo: riskResult.puntajeTotal,
                    relato_hechos: (datosHecho?.descripcion_hechos) || '',
                    estado: 'Abierto',
                    firma_victima: firma,
                    metadata_firma: JSON.stringify(req.body.metadata_biometrica || {}),
                    drive_folder_id: 'PENDING',
                    tokenConsulta: {
                        create: { pin: pinConsultas }
                    }
                }
            });

            // 7. Guardar Evaluaciones
            if (respuestas_riesgo && Array.isArray(respuestas_riesgo)) {
                await tx.evaluacionRiesgo.createMany({
                    data: respuestas_riesgo.map((resp, index) => ({
                        id_expediente: expediente.id,
                        pregunta_numero: index + 1,
                        respuesta: resp === true || resp === 1,
                        valor_asignado: 0,
                        categoria: 'General'
                    }))
                });
            }

            // 8. Crear Actuación Inicial
            await tx.actuacion.create({
                data: {
                    id_expediente: expediente.id,
                    id_usuario: finalUsuarioId,
                    tipo: 'Radicación',
                    descripcion: `Radicación exitosa del caso ${radicado}. Nivel de riesgo detectado: ${riskResult.nivelRiesgo}.`
                }
            });

            return { expediente, radicado, riskResult, finalUsuarioId, pinConsultas };
        });

        // Registrar Auditoría fuera de la transacción para evitar lock en SQLite
        await AuditService.log({
            id_usuario: result.finalUsuarioId,
            accion: 'RADICACION',
            modulo: 'EXPEDIENTES',
            detalles: `Radicación exitosa de expediente ${result.radicado}`,
            ip: req.ip
        });

        // 9. Operaciones de Salida (Drive + PDF) Robustas
        try {
            const folderId = await driveService.createCaseFolder(result.radicado, `${victimFullName} ${victimFullLastName}`);
            const mockUser = { nombres: 'Comisario', apellidos: 'Principal', cargo: 'Comisario de Familia' };
            const victimaParaPDF = { ...victima, nombres: victimFullName, apellidos: victimFullLastName };
            const agresorParaPDF = agresor ? { ...agresor, nombres: aggressorFullName, apellidos: aggressorFullLastName } : null;

            const pdfInfo = await pdfGenerator.generarAutoInicio(result.expediente, victimaParaPDF, agresorParaPDF, mockUser);

            let driveFileLink = folderId;
            try {
                if (folderId !== 'PENDING_RETRY') {
                    const uploadedFile = await driveService.uploadFile(
                        folderId,
                        pdfInfo.filePath,
                        pdfInfo.fileName,
                        'application/pdf'
                    );
                    if (uploadedFile && uploadedFile.webViewLink) {
                        driveFileLink = uploadedFile.webViewLink;
                    }
                }
            } catch (uploadErr) {
                console.error('Error subiendo PDF a Drive:', uploadErr);
            }

            await prisma.$transaction([
                prisma.expediente.update({
                    where: { id: result.expediente.id },
                    data: { drive_folder_id: folderId }
                }),
                prisma.documento.create({
                    data: {
                        id_expediente: result.expediente.id,
                        nombre: 'Auto de Apertura y Medidas.pdf',
                        tipo: 'Auto de Inicio',
                        url_drive: driveFileLink
                    }
                })
            ]);

            // --- SUBIDA DE EVIDENCIAS MULTIMEDIA ---
            const { evidencias } = req.body;
            if (evidencias && Array.isArray(evidencias) && evidencias.length > 0 && folderId !== 'PENDING_RETRY') {
                console.log(`[EVIDENCIA] Subiendo ${evidencias.length} evidencias a Drive...`);
                for (const ev of evidencias) {
                    try {
                        const uploadedEv = await driveService.uploadBase64(
                            folderId,
                            ev.base64,
                            ev.name,
                            ev.type
                        );
                        if (uploadedEv) {
                            await prisma.documento.create({
                                data: {
                                    id_expediente: result.expediente.id,
                                    nombre: ev.name,
                                    tipo: 'Evidencia',
                                    url_drive: uploadedEv.webViewLink || folderId
                                }
                            });
                        }
                    } catch (evErr) {
                        console.error(`Error subiendo evidencia ${ev.name}:`, evErr);
                    }
                }
            }

            result.drive_folder_id = folderId;
            result.pdf_url = driveFileLink;
        } catch (postError) {
            console.error('Error en post-procesamiento robusto (Drive/PDF):', postError);
        }

        // --- 10. GENERACIÓN AUTOMÁTICA DE MEDIDAS DE PROTECCIÓN ---
        const nivelRiesgo = result.riskResult?.nivelRiesgo?.toLowerCase() || '';
        if (nivelRiesgo === 'alto' || nivelRiesgo === 'extremo') {
            try {
                console.log(`[PROTECCION] Riesgo ${nivelRiesgo} detectado. Generando medidas de protección...`);
                const mockUser = { nombres: 'Comisario', apellidos: 'Principal', cargo: 'Comisario de Familia' };
                const victimaParaPDF = { ...victima, nombres: victimFullName, apellidos: victimFullLastName };
                const agresorParaPDF = agresor ? { ...agresor, nombres: aggressorFullName, apellidos: aggressorFullLastName } : null;

                const pdfMedidas = await pdfGenerator.generarMedidasProteccion(result.expediente, victimaParaPDF, agresorParaPDF, null, mockUser);
                const pdfPolicia = await pdfGenerator.generarOficioPolicia(result.expediente, victimaParaPDF, agresorParaPDF, mockUser);

                let linkMedidas = 'PENDING';
                let linkPolicia = 'PENDING';

                if (result.drive_folder_id && result.drive_folder_id !== 'PENDING_RETRY') {
                    const upMedidas = await driveService.uploadFile(result.drive_folder_id, pdfMedidas.filePath, pdfMedidas.fileName, 'application/pdf');
                    if (upMedidas?.webViewLink) linkMedidas = upMedidas.webViewLink;

                    const upPolicia = await driveService.uploadFile(result.drive_folder_id, pdfPolicia.filePath, pdfPolicia.fileName, 'application/pdf');
                    if (upPolicia?.webViewLink) linkPolicia = upPolicia.webViewLink;
                }

                await prisma.documento.createMany({
                    data: [
                        { id_expediente: result.expediente.id, nombre: 'Resolución Medidas de Protección.pdf', tipo: 'Medidas de Protección', url_drive: linkMedidas },
                        { id_expediente: result.expediente.id, nombre: 'Oficio Policía Nacional.pdf', tipo: 'Oficio', url_drive: linkPolicia }
                    ]
                });
                console.log('[PROTECCION] Documentos generados y registrados exitosamente.');

                // Enviar Notificación de Alerta
                await notificacionesController.crear({
                    id_usuario: finalUsuarioId,
                    titulo: '¡ALERTA DE RIESGO!',
                    mensaje: `El caso ${result.radicado} ha sido calificado como RIESGO ${nivelRiesgo.toUpperCase()}. Se requiere atención inmediata.`,
                    tipo: 'danger'
                });

                // Simulación de WhatsApp / SMS
                console.log(`\n======================================================`);
                console.log(`🚨 [WHATSAPP API SIMULATOR] Alerta Crítica Enviada`);
                console.log(`📱 A: Policía Cuadrante / Comisario de Turno`);
                console.log(`💬 "SISCOM URGENTE: El caso ${result.radicado} presenta RIESGO ${nivelRiesgo.toUpperCase()}. Víctima: ${victimaParaPDF.nombres} ${victimaParaPDF.apellidos}. Requiere acción inmediata."`);
                console.log(`======================================================\n`);

                await AuditService.log(
                    finalUsuarioId,
                    'ALERTA_WHATSAPP_SIMULADA',
                    'Notificaciones',
                    result.expediente.id,
                    { mensaje: `Alerta WhatsApp enviada a celular de turno para caso ${result.radicado}` }
                );

            } catch (proteccionError) {
                console.error('Error generando medidas de protección automáticas:', proteccionError);
            }
        }

        // --- 11. AGENDAMIENTO AUTOMÁTICO DE AUDIENCIA ---
        try {
            console.log('[AUDIENCIAS] Iniciando agendamiento automático...');
            const audiencia = await audienciasController.scheduleHearing(result.expediente.id);

            if (audiencia) {
                const mockUser = { nombres: 'Comisario', apellidos: 'Principal', cargo: 'Comisario de Familia' };
                const victimaParaPDF = { ...victima, nombres: victimFullName, apellidos: victimFullLastName };
                const agresorParaPDF = agresor ? { ...agresor, nombres: aggressorFullName, apellidos: aggressorFullLastName } : null;

                const pdfCitacion = await pdfGenerator.generarCitacionAudiencia(result.expediente, audiencia, victimaParaPDF, agresorParaPDF, mockUser);

                let linkCitacion = 'PENDING';
                if (result.drive_folder_id && result.drive_folder_id !== 'PENDING_RETRY') {
                    const upCitacion = await driveService.uploadFile(result.drive_folder_id, pdfCitacion.filePath, pdfCitacion.fileName, 'application/pdf');
                    if (upCitacion?.webViewLink) linkCitacion = upCitacion.webViewLink;
                }

                await prisma.documento.create({
                    data: {
                        id_expediente: result.expediente.id,
                        nombre: 'Citación Audiencia.pdf',
                        tipo: 'Citación',
                        url_drive: linkCitacion
                    }
                });
                result.audiencia = audiencia;
                console.log('[AUDIENCIAS] Citación generada y registrada.');
            }
        } catch (audienciaError) {
            console.error('Error en módulo de audiencias:', audienciaError);
        }

        res.status(201).json({
            success: true,
            message: 'Expediente radicado y procesado con éxito',
            data: result
        });

    } catch (error) {
        console.error('======= ERROR CRITICO EN RADICACION =======');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.code);
        console.error('Stack:', error.stack);
        console.error('===========================================');

        res.status(500).json({
            success: false,
            message: 'Fallo táctico en la radicación',
            error: error.message,
            code: error.code
        });
    }
};

const calcularRiesgo = async (req, res) => {
    try {
        const answers = req.body;
        // Si viene como objeto con ids de items, convertir a array de 52
        let answersArray = [];
        if (typeof answers === 'object' && !Array.isArray(answers)) {
            answersArray = Array.from({ length: 52 }, (_, i) => {
                const key = `item_${String(i + 1).padStart(2, '0')}`;
                return answers[key] || false;
            });
        } else {
            answersArray = answers;
        }

        const result = riskService.calculateRisk(answersArray);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error calculando riesgo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular el riesgo'
        });
    }
};

module.exports = { radicarCaso, calcularRiesgo };
