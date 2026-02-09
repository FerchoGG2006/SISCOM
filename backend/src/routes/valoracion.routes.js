/**
 * SISCOM - Rutas de Valoración de Riesgo
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { query, insert } = require('../config/database');
const RiskCalculator = require('../services/riskCalculator.service');

// Calcular riesgo en tiempo real (sin guardar)
router.post('/calcular', authMiddleware, async (req, res) => {
    try {
        const resultado = RiskCalculator.calcular(req.body);
        resultado.recomendaciones = RiskCalculator.getRecomendaciones(resultado.nivelRiesgo);
        res.json({ success: true, data: resultado });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Guardar valoración completa
router.post('/:expedienteId', authMiddleware, async (req, res) => {
    try {
        const { expedienteId } = req.params;
        const resultado = RiskCalculator.calcular(req.body);

        // Verificar si ya existe valoración
        const existing = await query(
            `SELECT id FROM valoracion_riesgo WHERE expediente_id = ?`,
            [expedienteId]
        );

        if (existing.length > 0) {
            // Actualizar
            await query(
                `UPDATE valoracion_riesgo SET ?, puntaje_total = ?, nivel_riesgo = ? WHERE expediente_id = ?`,
                [req.body, resultado.puntajeTotal, resultado.nivelRiesgo, expedienteId]
            );
        } else {
            // Insertar nueva
            await insert('valoracion_riesgo', {
                expediente_id: expedienteId,
                ...req.body,
                puntaje_total: resultado.puntajeTotal,
                nivel_riesgo: resultado.nivelRiesgo,
                usuario_evaluador_id: req.user.id
            });
        }

        // Actualizar expediente
        await query(
            `UPDATE expedientes SET puntaje_riesgo = ?, nivel_riesgo = ?, fecha_valoracion_riesgo = NOW() WHERE id = ?`,
            [resultado.puntajeTotal, resultado.nivelRiesgo, expedienteId]
        );

        res.json({
            success: true,
            data: {
                ...resultado,
                recomendaciones: RiskCalculator.getRecomendaciones(resultado.nivelRiesgo)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
