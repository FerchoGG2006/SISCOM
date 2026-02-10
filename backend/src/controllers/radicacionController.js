const prisma = require('../lib/prisma');
const riskService = require('../services/riskService');
const driveService = require('../services/driveService');
const pdfGenerator = require('../services/pdfGenerator.service');

const radicarCaso = async (req, res) => {
    try {
        const { victima, agresor, respuestas_riesgo, usuario_id, firma, datosHecho } = req.body;
        const finalUsuarioId = usuario_id || 1; // Fallback for MVP

        // 1. Iniciar transacción con Prisma
        const result = await prisma.$transaction(async (tx) => {

            // 2. Procesar Víctima (Upsert)
            const personaVictima = await tx.persona.upsert({
                where: { numero_documento: victima.numero_documento },
                update: {
                    nombres: victima.nombres,
                    apellidos: victima.apellidos,
                    tipo_documento: victima.tipo_documento,
                    telefono: victima.telefono,
                    direccion: victima.direccion,
                    es_victima: true
                },
                create: {
                    numero_documento: victima.numero_documento,
                    tipo_documento: victima.tipo_documento,
                    nombres: victima.nombres,
                    apellidos: victima.apellidos,
                    telefono: victima.telefono,
                    direccion: victima.direccion,
                    es_victima: true
                },
            });

            // 3. Procesar Agresor (Opcional)
            let personaAgresorId = null;
            if (agresor && agresor.numero_documento) {
                const personaAgresor = await tx.persona.upsert({
                    where: { numero_documento: agresor.numero_documento },
                    update: {
                        nombres: agresor.nombres,
                        apellidos: agresor.apellidos,
                        es_agresor: true
                    },
                    create: {
                        numero_documento: agresor.numero_documento,
                        tipo_documento: agresor.tipo_documento || 'CC',
                        nombres: agresor.nombres,
                        apellidos: agresor.apellidos,
                        es_agresor: true
                    },
                });
                personaAgresorId = personaAgresor.id;
            }

            // 4. Calcular Riesgo
            const riskResult = riskService.calculateRisk(respuestas_riesgo || []);

            // 5. Generar Radicado
            const year = new Date().getFullYear();
            const count = await tx.expediente.count({ where: { fecha_radicacion: { gte: new Date(`${year}-01-01`) } } });
            const radicado = `HS-${year}-${String(count + 1).padStart(5, '0')}`;

            // 6. Crear Expediente
            const expediente = await tx.expediente.create({
                data: {
                    radicado_hs: radicado,
                    id_victima: personaVictima.id,
                    id_agresor: personaAgresorId,
                    nivel_riesgo: riskResult.level,
                    puntaje_riesgo: riskResult.score,
                    relato_hechos: (datosHecho?.descripcion_hechos) || '',
                    estado: 'Abierto',
                    firma_victima: firma, // Guardamos el base64
                    drive_folder_id: 'PENDING',
                }
            });

            // 7. Guardar Evaluaciones individuales
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
                    descripcion: `Radicación exitosa del caso ${radicado}. Nivel de riesgo detectado: ${riskResult.level}.`
                }
            });

            return { expediente, radicado, riskResult };
        });

        // 9. Operaciones de Salida (Drive + PDF)
        try {
            // A. Crear Carpeta Drive
            const folderId = await driveService.createCaseFolder(result.radicado, `${victima.nombres} ${victima.apellidos}`);

            // B. Generar PDF Auto de Inicio
            const mockUser = { nombres: 'Comisario', apellidos: 'Principal', cargo: 'Comisario de Familia' };

            const victimaParaPDF = {
                ...victima,
                nombres: `${victima.primer_nombre} ${victima.segundo_nombre || ''}`.trim(),
                apellidos: `${victima.primer_apellido} ${victima.segundo_apellido || ''}`.trim(),
                numero_documento: victima.numero_documento
            };

            const agresorParaPDF = agresor ? {
                ...agresor,
                nombres: `${agresor.primer_nombre} ${agresor.segundo_nombre || ''}`.trim(),
                apellidos: `${agresor.primer_apellido} ${agresor.segundo_apellido || ''}`.trim(),
            } : null;

            const pdfInfo = await pdfGenerator.generarAutoInicio(result.expediente, victimaParaPDF, agresorParaPDF, mockUser);


            // C. Actualizar Expediente y Registrar Documento
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
                        url_drive: folderId // Podría ser el ID del archivo específico si el service lo da
                    }
                })
            ]);

            result.drive_folder_id = folderId;
            result.pdf_url = pdfInfo.fileName;
        } catch (error) {
            console.error('Error en post-procesamiento (Drive/PDF):', error);
        }

        res.status(201).json({
            success: true,
            message: 'Expediente radicado y procesado con éxito',
            data: result
        });

    } catch (error) {
        console.error('Error en radicacion Prisma:', error);
        res.status(500).json({
            success: false,
            message: 'Fallo táctico en la radicación',
            error: error.message
        });
    }
};

module.exports = { radicarCaso };

