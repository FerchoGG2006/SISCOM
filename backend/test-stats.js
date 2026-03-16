require('dotenv').config();
const controller = require('./src/controllers/reportes.prisma.controller');

async function test() {
    try {
        console.log("Iniciando prueba de estadísticas...");
        // Simular req y res
        const req = {};
        const res = {
            json: (data) => console.log("SUCCESS:", JSON.stringify(data, null, 2)),
            status: (code) => ({
                json: (data) => console.log(`ERROR ${code}:`, data)
            })
        };
        await controller.estadisticasGenerales(req, res);
    } catch (e) {
        console.error("FATAL ERROR:", e);
    }
}

test();
