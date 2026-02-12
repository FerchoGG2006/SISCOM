const prisma = require('../lib/prisma');
const { addDays, isWeekend, format, startOfHour, setHours, addHours } = require('date-fns');

/**
 * Calcula la próxima fecha hábil para audiencia
 * Lógica Sencilla: Busca el siguiente espacio disponible a X días
 */
const calculateNextHearingDate = async () => {
    // Regla: Audiencias se programan mínimo a 3 días hábiles
    let date = addDays(new Date(), 3);

    // Si cae finde, mover al Lunes
    while (isWeekend(date)) {
        date = addDays(date, 1);
    }

    // Hora defecto: 8:00 AM
    date = setHours(startOfHour(date), 8);

    // Verificar disponibilidad (Simulada: máximo 5 audiencias por día)
    // En el futuro, esto consultaría la tabla Audiencias

    return date;
};

/**
 * Agenda automáticamente una audiencia para un expediente
 */
const scheduleHearing = async (expedienteId) => {
    try {
        const nextDate = await calculateNextHearingDate();

        const audiencia = await prisma.audiencia.create({
            data: {
                id_expediente: expedienteId,
                fecha_programada: nextDate,
                lugar: 'Sala de Audiencias Comisaría de Familia',
                estado: 'Programada',
                observaciones: 'Agendamiento automático por sistema'
            }
        });

        // Registrar actuación
        await prisma.actuacion.create({
            data: {
                id_expediente: expedienteId,
                id_usuario: 1, // Sistema/Admin
                tipo: 'Audiencia',
                descripcion: `Audiencia programada automáticamente para el ${format(nextDate, 'dd/MM/yyyy HH:mm')}`
            }
        });

        console.log(`[AUDIENCIAS] Audiencia programada para expediente ${expedienteId} el ${nextDate}`);
        return audiencia;

    } catch (error) {
        console.error('Error agendando audiencia:', error);
        return null;
    }
};

module.exports = {
    scheduleHearing,
    calculateNextHearingDate
};
