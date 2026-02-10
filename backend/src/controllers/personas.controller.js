const prisma = require('../lib/prisma');

const getPersonas = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (search) {
            where.OR = [
                { nombres: { contains: search } },
                { apellidos: { contains: search } },
                { numero_documento: { contains: search } }
            ];
        }

        if (role === 'victima') where.es_victima = true;
        if (role === 'agresor') where.es_agresor = true;

        const [personas, total] = await Promise.all([
            prisma.persona.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { nombres: 'asc' },
                include: {
                    _count: {
                        select: {
                            expedientesVictima: true,
                            expedientesAgresor: true
                        }
                    }
                }
            }),
            prisma.persona.count({ where })
        ]);

        res.json({
            success: true,
            data: personas,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching personas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener personas' });
    }
};

const getPersonaById = async (req, res) => {
    try {
        const { id } = req.params;
        const persona = await prisma.persona.findUnique({
            where: { id: parseInt(id) },
            include: {
                expedientesVictima: {
                    select: { radicado_hs: true, fecha_radicacion: true, nivel_riesgo: true, estado: true }
                },
                expedientesAgresor: {
                    select: { radicado_hs: true, fecha_radicacion: true, nivel_riesgo: true, estado: true }
                }
            }
        });

        if (!persona) {
            return res.status(404).json({ success: false, message: 'Persona no encontrada' });
        }

        res.json({ success: true, data: persona });
    } catch (error) {
        console.error('Error fetching persona detail:', error);
        res.status(500).json({ success: false, message: 'Error al obtener detalle de la persona' });
    }
};

module.exports = { getPersonas, getPersonaById };
