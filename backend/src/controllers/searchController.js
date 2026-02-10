const prisma = require('../lib/prisma');

const searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ results: [] });
        }

        // Búsqueda en Personas
        const personas = await prisma.persona.findMany({
            where: {
                OR: [
                    { nombres: { contains: q } },
                    { apellidos: { contains: q } },
                    { numero_documento: { contains: q } }
                ]
            },
            take: 5
        });

        // Búsqueda en Expedientes
        const expedientes = await prisma.expediente.findMany({
            where: {
                radicado_hs: { contains: q }
            },
            include: {
                victima: true
            },
            take: 5
        });

        // Formatear resultados para el Spotlight
        const results = [
            ...personas.map(p => ({
                id: p.id,
                type: 'persona',
                title: `${p.nombres} ${p.apellidos}`,
                subtitle: `Documento: ${p.numero_documento}`,
                url: `/personas/${p.id}`
            })),
            ...expedientes.map(e => ({
                id: e.id,
                type: 'expediente',
                title: e.radicado_hs,
                subtitle: `Víctima: ${e.victima.nombres} ${e.victima.apellidos}`,
                url: `/expedientes/${e.id}`
            }))
        ];

        res.json({ results });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { searchAll };
