const prisma = require('../lib/prisma');
const logger = require('../config/logger');

class ActuacionController {
    /**
     * POST /api/v1/expedientes/:id/actuaciones
     * Registra una nueva actuación en el expediente
     */
    static async crear(req, res) {
        try {
            const { id } = req.params;
            const { tipo, descripcion, nuevoEstado } = req.body;
            const usuarioId = req.user.id;

            const resultado = await prisma.$transaction(async (tx) => {
                // 1. Crear la actuación
                const actuacion = await tx.actuacion.create({
                    data: {
                        id_expediente: parseInt(id),
                        id_usuario: usuarioId,
                        tipo,
                        descripcion,
                        fecha: new Date()
                    },
                    include: {
                        usuario: { select: { nombres: true, apellidos: true } }
                    }
                });

                // 2. Si se solicita cambio de estado, actualizar el expediente
                if (nuevoEstado) {
                    await tx.expediente.update({
                        where: { id: parseInt(id) },
                        data: { estado: nuevoEstado }
                    });
                }

                return actuacion;
            });

            res.status(201).json({
                success: true,
                message: 'Actuación registrada con éxito',
                data: resultado
            });

        } catch (error) {
            logger.error('Error creando actuación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar la actuación'
            });
        }
    }
}

module.exports = ActuacionController;
