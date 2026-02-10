const prisma = require('../lib/prisma');
const logger = require('../config/logger');

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
}

module.exports = ExpedientesPrismaController;
