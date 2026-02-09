/**
 * SISCOM - Rutas de Personas
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { query } = require('../config/database');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { rol, documento, nombre } = req.query;
        let sql = `SELECT * FROM personas WHERE activo = 1`;
        const params = [];

        if (rol) {
            sql += ` AND rol_en_caso = ?`;
            params.push(rol);
        }
        if (documento) {
            sql += ` AND numero_documento LIKE ?`;
            params.push(`%${documento}%`);
        }
        if (nombre) {
            sql += ` AND (primer_nombre LIKE ? OR primer_apellido LIKE ?)`;
            params.push(`%${nombre}%`, `%${nombre}%`);
        }

        sql += ` LIMIT 50`;
        const personas = await query(sql, params);

        res.json({ success: true, data: personas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const personas = await query(`SELECT * FROM personas WHERE id = ?`, [req.params.id]);
        if (personas.length === 0) {
            return res.status(404).json({ success: false, message: 'Persona no encontrada' });
        }
        res.json({ success: true, data: personas[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
