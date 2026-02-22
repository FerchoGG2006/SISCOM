const aiService = require('../services/ai.service');
const logger = require('../config/logger');

class AIController {
    /**
     * POST /api/v1/ai/analyze
     */
    static async analyze(req, res) {
        const { relato } = req.body;

        if (!relato || relato.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'El relato es demasiado corto para analizar.'
            });
        }

        try {
            const analysis = await aiService.analizarRiesgo(relato);
            res.json({ success: true, data: analysis });
        } catch (error) {
            logger.error('Error en AIController.analyze:', error);
            res.status(500).json({ success: false, message: 'Error interno en el análisis de IA.' });
        }
    }

    /**
     * POST /api/v1/ai/summarize
     */
    static async summarize(req, res) {
        const { data } = req.body;

        try {
            const summary = await aiService.resumirCaso(data);
            res.json({ success: true, summary });
        } catch (error) {
            logger.error('Error en AIController.summarize:', error);
            res.status(500).json({ success: false, message: 'Error al generar resumen.' });
        }
    }
}

module.exports = AIController;
