/**
 * Motor de Valoración de Riesgo - SISCOM
 * Basado en Instrumento del Ministerio de Justicia (52 preguntas)
 */

exports.calculateRisk = (answers) => {
    // validation
    if (!answers || !Array.isArray(answers) || answers.length !== 52) {
        // En producción, esto debería ser estricto. Para MVP, asumimos input correcto.
        // throw new Error('Se requieren 52 respuestas');
    }

    let score = 0;

    // 1. Violencia Psicológica, Económica y Patrimonial (Ítems 1-16) -> 1 punto c/u
    for (let i = 0; i < 16; i++) {
        if (answers[i]) score += 1;
    }

    // 2. Amenazas y Agravantes (Ítems 17-22 y 36-45) -> 10 puntos c/u
    // Indices are 0-based, so item 17 is index 16.
    const mediumRiskIndices = [
        16, 17, 18, 19, 20, 21, // 17-22
        35, 36, 37, 38, 39, 40, 41, 42, 43, 44 // 36-45
    ];

    mediumRiskIndices.forEach(index => {
        if (answers[index]) score += 10;
    });

    // 3. Violencia Física, Sexual y Percepción de muerte (Ítems 23-35 y 46-52) -> 20 puntos c/u
    const highRiskIndices = [
        22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, // 23-35
        45, 46, 47, 48, 49, 50, 51 // 46-52
    ];

    highRiskIndices.forEach(index => {
        if (answers[index]) score += 20;
    });

    // Determine Level
    let level = 'bajo';
    if (score >= 150) level = 'extremo';
    else if (score >= 50) level = 'alto';
    else if (score >= 16) level = 'medio';

    return { puntajeTotal: score, nivelRiesgo: level };
};
