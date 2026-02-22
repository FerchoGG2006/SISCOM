const prisma = require('../lib/prisma');
const logger = require('../config/logger');
const driveService = require('../services/driveService');


class ExpedientesPrismaController {
    /**
     * GET /api/v1/expedientes
     * Lista expedientes con Prisma
     */
    static async listar(req, res) {
        try {
            const { nivel_riesgo, page = 1, limit = 20 } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {};
            if (nivel_riesgo) {
                where.nivel_riesgo = nivel_riesgo;
            }

            const [expedientes, total] = await Promise.all([
                prisma.expediente.findMany({
                    where,
                    include: {
                        victima: true,
                        agresor: true
                    },
                    orderBy: {
                        fecha_radicacion: 'desc'
                    },
                    skip,
                    take: parseInt(limit)
                }),
                prisma.expediente.count({ where })
            ]);

            res.json({
                success: true,
                data: expedientes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total
                }
            });
        } catch (error) {
            logger.error('Error listando expedientes (Prisma):', error);
            res.status(500).json({
                success: false,
                message: 'Error al listar expedientes'
            });
        }
    }

    /**
     * GET /api/v1/expedientes/:id
     * Obtiene detalle de un expediente con Prisma
     */
    static async obtener(req, res) {
        try {
            const { id } = req.params;

            const expediente = await prisma.expediente.findUnique({
                where: { id: parseInt(id) },
                include: {
                    victima: true,
                    agresor: true,
                    evaluaciones: true,
                    actuaciones: {
                        include: { usuario: { select: { nombres: true, apellidos: true } } },
                        orderBy: { fecha: 'desc' }
                    },
                    documentos: true
                }
            });


            if (!expediente) {
                return res.status(404).json({
                    success: false,
                    message: 'Expediente no encontrado'
                });
            }

            res.json({
                success: true,
                data: expediente
            });
        } catch (error) {
            logger.error('Error obteniendo expediente (Prisma):', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener expediente'
            });
        }
    }
    /**

     * POST /api/v1/expedientes/:id/sync-drive
     * Repara o crea la carpeta de Drive si está en PENDING
     */
    static async syncDrive(req, res) {
        try {
            const { id } = req.params;
            const expediente = await prisma.expediente.findUnique({
                where: { id: parseInt(id) },
                include: { victima: true }
            });

            if (!expediente) return res.status(404).json({ success: false, message: 'Expediente no encontrado' });

            const victimName = `${expediente.victima.nombres} ${expediente.victima.apellidos}`;
            const folderId = await driveService.createCaseFolder(expediente.radicado_hs, victimName);

            await prisma.expediente.update({
                where: { id: expediente.id },
                data: { drive_folder_id: folderId }
            });

            res.json({ success: true, message: 'Carpeta sincronizada', folderId });
        } catch (error) {
            logger.error('Error sincronizando drive:', error);
            res.status(500).json({ success: false, message: 'Error en sincronización' });
        }
    }

    /**
     * PATCH /api/v1/expedientes/:id/estado
     * Actualiza el estado de un expediente y registra la actuación
     */
    static async actualizarEstado(req, res) {
        const { id } = req.params;
        const { estado } = req.body;
        const usuarioId = req.user?.id || 1; // Fallback to 1 if not auth (should be protected)

        try {
            const expediente = await prisma.expediente.update({
                where: { id: parseInt(id) },
                data: { estado }
            });

            // Registrar actuación del cambio de estado
            await prisma.actuacion.create({
                data: {
                    id_expediente: parseInt(id),
                    id_usuario: usuarioId,
                    tipo: 'Cambio de Estado',
                    descripcion: `El expediente cambió su estado a: ${estado}`
                }
            });

            res.json({ success: true, data: expediente });
        } catch (error) {
            logger.error('Error actualizando estado:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar estado' });
        }
    }
}



module.exports = ExpedientesPrismaController;
