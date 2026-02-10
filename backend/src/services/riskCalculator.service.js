/**
 * SISCOM - Motor de Cálculo de Riesgo
 * Basado en el Instrumento Técnico del Ministerio de Justicia
 * 
 * Ponderación:
 * - 1 punto: Ítems 1-16 (Violencia Psicológica, Económica y Patrimonial)
 * - 10 puntos: Ítems 17-22 y 36-45 (Amenazas y Agravantes)
 * - 20 puntos: Ítems 23-35 y 46-52 (Violencia Física, Sexual y Percepción de muerte)
 */

const PONDERACIONES = {
    // Sección 1: Violencia Psicológica (1 punto cada uno)
    psicologica: {
        items: [1, 2, 3, 4, 5, 6, 7, 8],
        puntaje: 1
    },
    // Sección 2: Violencia Económica y Patrimonial (1 punto cada uno)
    economica: {
        items: [9, 10, 11, 12, 13, 14, 15, 16],
        puntaje: 1
    },
    // Sección 3: Amenazas y Coerción (10 puntos cada uno)
    amenazas: {
        items: [17, 18, 19, 20, 21, 22],
        puntaje: 10
    },
    // Sección 4: Violencia Física (20 puntos cada uno)
    fisica: {
        items: [23, 24, 25, 26, 27, 28, 29, 30],
        puntaje: 20
    },
    // Sección 5: Violencia Sexual (20 puntos cada uno)
    sexual: {
        items: [31, 32, 33, 34, 35],
        puntaje: 20
    },
    // Sección 6: Circunstancias Agravantes (10 puntos cada uno)
    agravantes: {
        items: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        puntaje: 10
    },
    // Sección 7: Percepción de Muerte y Letalidad (20 puntos cada uno)
    letalidad: {
        items: [46, 47, 48, 49, 50, 51, 52],
        puntaje: 20
    }
};

// Umbrales para determinar nivel de riesgo
const UMBRALES = {
    BAJO: 16,
    MEDIO: 50,
    ALTO: 150
};

class RiskCalculator {
    /**
     * Calcula el puntaje y nivel de riesgo
     * @param {Object} respuestas - Objeto con las 52 respuestas (true/false)
     * @returns {Object} Resultado con puntajes por sección y nivel de riesgo
     */
    static calcular(respuestas) {
        const resultado = {
            secciones: {},
            puntajeTotal: 0,
            nivelRiesgo: 'bajo',
            alertasEspeciales: []
        };

        // Calcular puntaje por sección
        for (const [seccion, config] of Object.entries(PONDERACIONES)) {
            let puntajeSeccion = 0;
            const itemsPositivos = [];

            for (const itemNum of config.items) {
                // Construir el prefijo del item (ej: "item_01")
                const prefix = `item_${String(itemNum).padStart(2, '0')}`;

                // Buscar la clave completa en las respuestas que empiece con el prefijo
                // Esto maneja tanto "item_01" como "item_01_insultos"
                const key = Object.keys(respuestas).find(k => k.startsWith(prefix));

                // Verificar si el valor es verdadero (true o 1)
                if (key && (respuestas[key] === true || respuestas[key] === 1 || respuestas[key] === '1')) {
                    puntajeSeccion += config.puntaje;
                    itemsPositivos.push(itemNum);
                }
            }

            resultado.secciones[seccion] = {
                puntaje: puntajeSeccion,
                itemsPositivos: itemsPositivos,
                maximo: config.items.length * config.puntaje
            };

            resultado.puntajeTotal += puntajeSeccion;
        }

        // Determinar nivel de riesgo
        if (resultado.puntajeTotal <= UMBRALES.BAJO) {
            resultado.nivelRiesgo = 'bajo';
        } else if (resultado.puntajeTotal <= UMBRALES.MEDIO) {
            resultado.nivelRiesgo = 'medio';
        } else if (resultado.puntajeTotal <= UMBRALES.ALTO) {
            resultado.nivelRiesgo = 'alto';
        } else {
            resultado.nivelRiesgo = 'extremo';
        }

        // Detectar alertas especiales (indicadores de letalidad)
        resultado.alertasEspeciales = this.detectarAlertas(respuestas);

        return resultado;
    }

    /**
     * Detecta situaciones que requieren atención inmediata
     */
    static detectarAlertas(respuestas) {
        const alertas = [];

        // Estrangulamiento (alto riesgo de homicidio)
        if (respuestas.item_26) {
            alertas.push({
                tipo: 'CRITICA',
                codigo: 'ESTRANGULAMIENTO',
                mensaje: 'Intento de estrangulamiento detectado - Alto riesgo de letalidad'
            });
        }

        // Arma de fuego
        if (respuestas.item_29 || respuestas.item_40) {
            alertas.push({
                tipo: 'CRITICA',
                codigo: 'ARMA_FUEGO',
                mensaje: 'Presencia o acceso a arma de fuego'
            });
        }

        // Amenaza de muerte
        if (respuestas.item_17) {
            alertas.push({
                tipo: 'ALTA',
                codigo: 'AMENAZA_MUERTE',
                mensaje: 'Amenaza directa de muerte'
            });
        }

        // Víctima cree que puede matarla
        if (respuestas.item_46) {
            alertas.push({
                tipo: 'CRITICA',
                codigo: 'PERCEPCION_MUERTE',
                mensaje: 'La víctima cree que el agresor es capaz de matarla'
            });
        }

        // Violencia sexual
        if (respuestas.item_31 || respuestas.item_35) {
            alertas.push({
                tipo: 'CRITICA',
                codigo: 'VIOLENCIA_SEXUAL',
                mensaje: 'Violencia sexual detectada'
            });
        }

        // Embarazo
        if (respuestas.item_44 || respuestas.item_30) {
            alertas.push({
                tipo: 'ALTA',
                codigo: 'EMBARAZO',
                mensaje: 'Víctima embarazada o golpeada durante embarazo'
            });
        }

        return alertas;
    }

    /**
     * Obtiene recomendaciones según el nivel de riesgo
     */
    static getRecomendaciones(nivelRiesgo) {
        const recomendaciones = {
            bajo: [
                'Orientación y asesoría legal',
                'Información sobre rutas de atención',
                'Seguimiento preventivo a 30 días'
            ],
            medio: [
                'Medidas de protección de atención',
                'Remisión a psicología',
                'Plan de seguridad con la víctima',
                'Seguimiento a 15 días'
            ],
            alto: [
                'Medidas de protección URGENTES',
                'Remisión a Fiscalía',
                'Activación de redes de apoyo',
                'Notificación a Policía Nacional',
                'Seguimiento semanal'
            ],
            extremo: [
                'MEDIDAS DE PROTECCIÓN INMEDIATAS',
                'Remisión URGENTE a Fiscalía',
                'Notificación a Policía 24/7',
                'Evaluación de reubicación temporal',
                'Activación protocolo de emergencia',
                'Seguimiento diario'
            ]
        };

        return recomendaciones[nivelRiesgo] || [];
    }
}

module.exports = RiskCalculator;
