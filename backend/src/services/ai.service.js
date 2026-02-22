const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');

class AIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            this.enabled = true;
        } else {
            logger.warn('GEMINI_API_KEY no configurada. SISCOM AI operará en modo simulado.');
            this.enabled = false;
        }
    }

    /**
     * Analiza un relato de hechos para predecir riesgo
     */
    async analizarRiesgo(relato) {
        if (!this.enabled) return this.fallbackRiesgo(relato);

        try {
            const prompt = `
                Eres un asistente legal experto en Comisarías de Familia y violencia intrafamiliar en Colombia.
                Analiza el siguiente relato de hechos y responde ÚNICAMENTE en formato JSON con la siguiente estructura:
                {
                  "nivel": "Bajo" | "Medio" | "Alto" | "Extremo",
                  "puntos_estimados": número de 0 a 100,
                  "justificacion": "breve explicación legal",
                  "recomendacion": "medida de protección sugerida"
                }

                Relato: "${relato}"
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extraer JSON de la respuesta (a veces Gemini pone markdown)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No se pudo parsear el JSON de la IA');
        } catch (error) {
            logger.error('Error en SISCOM AI (Analizar Riesgo):', error);
            return this.fallbackRiesgo(relato);
        }
    }

    /**
     * Genera un resumen ejecutivo de un caso
     */
    async resumirCaso(datos) {
        if (!this.enabled) return "Resumen no disponible (IA desactivada).";

        try {
            const prompt = `
                Resume los aspectos clave de este caso de violencia intrafamiliar para un Comisario de Familia.
                Incluye: Perfil de la víctima, hechos principales y nivel de riesgo.
                Máximo 400 caracteres.
                Datos del caso: ${JSON.stringify(datos)}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            logger.error('Error en SISCOM AI (Resumir):', error);
            return "Error al generar resumen.";
        }
    }

    /**
     * Simulación simplificada si no hay API Key
     */
    fallbackRiesgo(relato) {
        let nivel = "Bajo";
        let puntos = 10;

        const relatoLower = relato.toLowerCase();
        if (relatoLower.includes('arma') || relatoLower.includes('muerte') || relatoLower.includes('matar')) {
            nivel = "Extremo";
            puntos = 95;
        } else if (relatoLower.includes('golpe') || relatoLower.includes('herida') || relatoLower.includes('sangre')) {
            nivel = "Alto";
            puntos = 75;
        } else if (relatoLower.includes('grito') || relatoLower.includes('insulto')) {
            nivel = "Medio";
            puntos = 40;
        }

        return {
            nivel,
            puntos_estimados: puntos,
            justificacion: "Análisis basado en heurísticas locales (Modo Simulado).",
            recomendacion: nivel === "Extremo" ? "Medida de desalojo inmediata y escolta policial." : "Orientación y medida de no agresión."
        };
    }
}

module.exports = new AIService();
