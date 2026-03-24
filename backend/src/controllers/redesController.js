const prisma = require('../lib/prisma');

const redesController = {
    getGrafos: async (req, res) => {
        try {
            // Obtener todos los expedientes con sus actores
            const expedientes = await prisma.expediente.findMany({
                include: {
                    victima: true,
                    agresor: true
                }
            });

            const nodesMap = new Map();
            const links = [];

            expedientes.forEach(exp => {
                // Nodo Expediente
                const expId = `EXP_${exp.id}`;
                if (!nodesMap.has(expId)) {
                    nodesMap.set(expId, {
                        id: expId,
                        name: exp.radicado_hs,
                        group: 'expediente',
                        val: 15,
                        color: exp.nivel_riesgo === 'Crítico' ? '#ef4444' : '#3b82f6',
                        riesgo: exp.nivel_riesgo
                    });
                }

                // Nodo Víctima
                if (exp.victima) {
                    const victimId = `PER_${exp.victima.id}`;
                    if (!nodesMap.has(victimId)) {
                        nodesMap.set(victimId, {
                            id: victimId,
                            name: `${exp.victima.nombres} ${exp.victima.apellidos}`,
                            group: 'victima',
                            val: 10,
                            color: '#10b981' // Verde
                        });
                    } else {
                        // Aumentar tamaño si aparece repetido
                        nodesMap.get(victimId).val += 2;
                    }

                    links.push({
                        source: victimId,
                        target: expId,
                        label: 'víctima de'
                    });
                }

                // Nodo Agresor
                if (exp.agresor) {
                    const agresorId = `PER_${exp.agresor.id}`;
                    if (!nodesMap.has(agresorId)) {
                        nodesMap.set(agresorId, {
                            id: agresorId,
                            name: `${exp.agresor.nombres} ${exp.agresor.apellidos}`,
                            group: 'agresor',
                            val: 20, // Más grandes para resaltar
                            color: '#fb923c' // Naranja/Rojo
                        });
                    } else {
                        // REINCIDENCIA: Agresor repetido!
                        nodesMap.get(agresorId).val += 15; // Crece mucho
                        nodesMap.get(agresorId).color = '#b91c1c'; // Se vuelve rojo oscuro
                        nodesMap.get(agresorId).reincidente = true;
                    }

                    links.push({
                        source: agresorId,
                        target: expId,
                        label: 'agresor en'
                    });
                }
            });

            res.json({
                success: true,
                data: {
                    nodes: Array.from(nodesMap.values()),
                    links: links
                }
            });

        } catch (error) {
            console.error('Error generando grafos de redes:', error);
            res.status(500).json({ success: false, message: 'Error interno procesando los grafos.' });
        }
    }
};

module.exports = redesController;
