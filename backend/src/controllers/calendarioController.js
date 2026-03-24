const prisma = require('../lib/prisma');

const calendarioController = {
    // Obtener todos los eventos (Citas y Audiencias)
    getEventos: async (req, res) => {
        try {
            const eventos = await prisma.audiencia.findMany({
                include: {
                    expediente: {
                        include: {
                            victima: true,
                            agresor: true
                        }
                    }
                },
                orderBy: {
                    fecha_programada: 'asc'
                }
            });

            // Mapear al formato que FullCalendar o React Big Calendar requiera
            const eventosFormat = eventos.map(ev => ({
                id: ev.id,
                title: `${ev.tipo} - ${ev.expediente.radicado_hs} (${ev.expediente.victima.nombres} ${ev.expediente.victima.apellidos})`,
                start: ev.fecha_programada,
                extendedProps: {
                    tipo: ev.tipo,
                    estado: ev.estado,
                    lugar: ev.lugar,
                    observaciones: ev.observaciones,
                    radicado: ev.expediente.radicado_hs,
                    id_expediente: ev.id_expediente
                }
            }));

            res.json(eventosFormat);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            res.status(500).json({ message: 'Error al obtener eventos del calendario' });
        }
    },

    // Crear un nuevo evento
    createEvento: async (req, res) => {
        try {
            const { id_expediente, fecha_programada, tipo, lugar, observaciones } = req.body;

            const nuevoEvento = await prisma.audiencia.create({
                data: {
                    id_expediente: parseInt(id_expediente),
                    fecha_programada: new Date(fecha_programada),
                    tipo: tipo || "Audiencia",
                    lugar: lugar || "Sala de Audiencias Comisaría",
                    observaciones,
                    estado: "Programada"
                }
            });

            res.status(201).json(nuevoEvento);
        } catch (error) {
            console.error('Error creating calendar event:', error);
            res.status(500).json({ message: 'Error al crear la cita/audiencia', details: error.message });
        }
    },

    // Actualizar un evento existente
    updateEvento: async (req, res) => {
        try {
            const { id } = req.params;
            const { fecha_programada, tipo, lugar, observaciones, estado } = req.body;

            const updateData = {};
            if (fecha_programada) updateData.fecha_programada = new Date(fecha_programada);
            if (tipo) updateData.tipo = tipo;
            if (lugar) updateData.lugar = lugar;
            if (observaciones !== undefined) updateData.observaciones = observaciones;
            if (estado) updateData.estado = estado;

            const eventoActualizado = await prisma.audiencia.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.json(eventoActualizado);
        } catch (error) {
            console.error('Error updating calendar event:', error);
            res.status(500).json({ message: 'Error al actualizar la cita/audiencia' });
        }
    },

    // Eliminar un evento
    deleteEvento: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.audiencia.delete({
                where: { id: parseInt(id) }
            });
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            res.status(500).json({ message: 'Error al eliminar la cita/audiencia' });
        }
    }
};

module.exports = calendarioController;
