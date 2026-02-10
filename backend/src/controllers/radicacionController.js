const prisma = require('../lib/prisma');
const riskService = require('../services/riskService');
const driveService = require('../services/driveService');

const radicarCaso = async (req, res) => {
    try {
        const { victima, agresor, respuestas_riesgo, usuario_id } = req.body;

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
            const count = await tx.expediente.count();
            const radicado = `HS-${year}-${String(count + 1).padStart(5, '0')}`;

            // 6. Crear Expediente
            const expediente = await tx.expediente.create({
                data: {
                    radicado_hs: radicado,
                    id_victima: personaVictima.id,
                    id_agresor: personaAgresorId,
                    nivel_riesgo: riskResult.level,
                    puntaje_riesgo: riskResult.score,
                    relato_hechos: req.body.relato_hechos || '',
                    drive_folder_id: 'PENDING', // Se actualizará después o se maneja asíncrono
                }
            });

            // 7. Guardar Evaluaciones individuales
            if (respuestas_riesgo && Array.isArray(respuestas_riesgo)) {
                await tx.evaluacionRiesgo.createMany({
                    data: respuestas_riesgo.map((resp, index) => ({
                        id_expediente: expediente.id,
                        pregunta_numero: index + 1,
                        respuesta: resp === true || resp === 1,
                        valor_asignado: 0, // Podría calcularse aquí si el service lo da por ítem
                        categoria: 'General'
                    }))
                });
            }

            return { expediente, radicado, riskResult };
        });

        // 8. Operación Drive (Fuera de la tx de DB para evitar bloqueos largos)
        try {
            const folderId = await driveService.createCaseFolder(result.radicado, `${victima.nombres} ${victima.apellidos}`);
            await prisma.expediente.update({
                where: { id: result.expediente.id },
                data: { drive_folder_id: folderId }
            });
            result.drive_folder_id = folderId;
        } catch (driveErr) {
            console.error('Error Drive (non-blocking):', driveErr);
        }

        res.status(201).json({
            success: true,
            message: 'Expediente radicado artesanalmente con éxito',
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
