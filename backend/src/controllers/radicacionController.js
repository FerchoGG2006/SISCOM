const { getDb } = require('../database/db');
const riskService = require('../services/riskService');
const driveService = require('../services/driveService');
const { v4: uuidv4 } = require('uuid');

async function radicarCaso(req, res) {
    const db = await getDb();

    // Start Transaction (SQLite default mode is serialized, but explicit is better)
    await db.run('BEGIN TRANSACTION');

    try {
        const { victima, agresor, respuestas_riesgo, usuario_id } = req.body;

        // 1. Process Victim
        // Check if exists by doc number
        let victimaId;
        const existingVictima = await db.get('SELECT id FROM personas WHERE num_doc = ?', [victima.num_doc]);

        if (existingVictima) {
            victimaId = existingVictima.id;
            // Update details if needed (omitted for MVP brevity)
        } else {
            const result = await db.run(
                `INSERT INTO personas (tipo_doc, num_doc, nombres, apellidos, direccion, telefono, detalles_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [victima.tipo_doc, victima.num_doc, victima.nombres, victima.apellidos, victima.direccion, victima.telefono, JSON.stringify(victima)]
            );
            victimaId = result.lastID;
        }

        // 2. Process Aggressor (Optional)
        let agresorId = null;
        if (agresor && agresor.num_doc) {
            const existingAgresor = await db.get('SELECT id FROM personas WHERE num_doc = ?', [agresor.num_doc]);
            if (existingAgresor) {
                agresorId = existingAgresor.id;
            } else {
                const result = await db.run(
                    `INSERT INTO personas (tipo_doc, num_doc, nombres, apellidos, direccion, telefono, detalles_json)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [agresor.tipo_doc, agresor.num_doc, agresor.nombres, agresor.apellidos, agresor.direccion || '', agresor.telefono || '', JSON.stringify(agresor)]
                );
                agresorId = result.lastID;
            }
        }

        // 3. Calculate Risk
        const riskResult = riskService.calculateRisk(respuestas_riesgo);

        // 4. Generate Radicado
        const year = new Date().getFullYear();
        const count = await db.get('SELECT COUNT(*) as count FROM expedientes');
        const radicado = `HS-${year}-${String(count.count + 1).padStart(5, '0')}`;

        // 5. Create Drive Folder
        const folderId = await driveService.createCaseFolder(radicado, `${victima.nombres} ${victima.apellidos}`);

        // 6. Create Expediente
        const expResult = await db.run(
            `INSERT INTO expedientes (radicado, id_victima, id_agresor, nivel_riesgo, drive_folder_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [radicado, victimaId, agresorId, riskResult.level, folderId, usuario_id || 1] // Default user 1 for MVP
        );
        const expedienteId = expResult.lastID;

        // 7. Store Risk Answers
        await db.run(
            `INSERT INTO respuestas_riesgo (id_expediente, respuestas_json, puntaje, nivel_calculado)
             VALUES (?, ?, ?, ?)`,
            [expedienteId, JSON.stringify(respuestas_riesgo), riskResult.score, riskResult.level]
        );

        await db.run('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Caso radicado exitosamente',
            data: {
                radicado,
                riesgo: riskResult,
                expediente_id: expedienteId,
                drive_folder: folderId
            }
        });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error en radicacion:', error);
        res.status(500).json({ success: false, message: 'Error interno al radicar el caso', error: error.message });
    }
}

module.exports = { radicarCaso };
