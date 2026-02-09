/**
 * SISCOM - Configuración de Base de Datos SQLite (Compatible con MySQL Syntax)
 */
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const logger = require('./logger');
const fs = require('fs');

let dbInstance = null;

// Ensure database directory exists
const dir = path.join(__dirname, '../../database');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

async function getDb() {
    if (dbInstance) return dbInstance;

    try {
        dbInstance = await open({
            filename: path.join(__dirname, '../../database/siscom.db'),
            driver: sqlite3.Database
        });
        return dbInstance;
    } catch (error) {
        logger.error('Error conectando a SQLite:', error);
        throw error;
    }
}

// Helper to transform MySQL query syntax to SQLite
function normalizeQuery(sql, params) {
    let newSql = sql;
    let newParams = [...params];

    // Replace NOW() with datetime('now', 'localtime')
    newSql = newSql.replace(/NOW\(\)/gi, "datetime('now', 'localtime')");

    // Handle SET ? for INSERT and UPDATE
    if (newSql.includes('SET ?')) {
        // Find the index of the object in params corresponding to ? in SET ?
        // This is tricky if there are multiple ? before SET ?.
        // Simple heuristic: assume SET ? is the first or we count ?
        // Detailed approach: split by ?, count parts.

        // However, most usages are `SET ?` as the first param or specific param.
        // Let's iterate params. If we find an object where a scalar is expected, and the sql has SET ?, it's likely it.
        // But the ? is a placeholder.

        const parts = newSql.split('?');
        let paramIndex = 0;
        let builtSql = '';

        for (let i = 0; i < parts.length - 1; i++) {
            builtSql += parts[i];
            const context = parts[i].toUpperCase();

            if (context.trim().endsWith('SET')) {
                // This ? corresponds to SET
                const data = newParams[paramIndex];
                if (typeof data === 'object' && data !== null) {
                    // Check if it's INSERT or UPDATE
                    if (context.includes('INSERT')) {
                        // Transform to (cols) VALUES (vals)
                        // But wait, "INSERT INTO table SET ?" -> "INSERT INTO table (a,b) VALUES (?,?)"
                        // We need to replace "SET" with nothing, and append the rest?
                        // "INSERT INTO table SET ?"
                        // regex replacement is safer for the specific pattern "SET ?"

                        const keys = Object.keys(data);
                        const values = Object.values(data);
                        const setClause = `(${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

                        // Replace the last "SET" in builtSql with nothing (or handle partial)
                        // Actually, easier to replace "SET ?" in the original string if it is unique.
                        // But let's build it.

                        // Remove "SET" from the end of builtSql
                        builtSql = builtSql.replace(/SET\s*$/, '');
                        builtSql += setClause;

                        // Replace the param object with its values
                        newParams.splice(paramIndex, 1, ...values);
                        // Adjust paramIndex for the inserted values
                        paramIndex += values.length - 1;
                    } else {
                        // UPDATE
                        const keys = Object.keys(data);
                        const values = Object.values(data);
                        const setClause = keys.map(k => `${k} = ?`).join(', ');

                        // Use setClause
                        builtSql += setClause;

                        newParams.splice(paramIndex, 1, ...values);
                        paramIndex += values.length - 1;
                    }
                } else {
                    builtSql += '?'; // Was not an object, treat as normal ?
                }
            } else {
                builtSql += '?';
            }
            paramIndex++;
        }
        builtSql += parts[parts.length - 1];
        newSql = builtSql;
    }

    // Replace SET ? using regex if the above loop logic is too complex/risky?
    // The loop logic above attempts to handle it properly.

    return { sql: newSql, params: newParams };
}

async function query(sql, params = []) {
    const db = await getDb();

    // Normalize params
    if (!Array.isArray(params)) {
        params = [params];
    }

    const { sql: normSql, params: normParams } = normalizeQuery(sql, params);

    try {
        if (normSql.trim().toUpperCase().startsWith('SELECT') || normSql.trim().toUpperCase().startsWith('PRAGMA')) {
            return await db.all(normSql, normParams);
        } else {
            const result = await db.run(normSql, normParams);
            // Simulate MySQL result (insertId, affectedRows)
            return {
                insertId: result.lastID,
                affectedRows: result.changes,
                ...result
            };
        }
    } catch (error) {
        logger.error(`Error en Query: ${normSql}`, error);
        throw error;
    }
}

// Wrapper to simulate MySQL Connection object for transactions
class ConnectionWrapper {
    constructor(db) {
        this.db = db;
    }

    async execute(sql, params = []) {
        // execute in mysql2 returns [rows, fields]
        // we reuse query() logic but wrapped.

        // Normalize
        const { sql: normSql, params: normParams } = normalizeQuery(sql, params || []);

        try {
            if (normSql.trim().toUpperCase().startsWith('SELECT')) {
                const rows = await this.db.all(normSql, normParams);
                return [rows, []]; // [rows, fields]
            } else {
                const result = await this.db.run(normSql, normParams);
                return [{
                    insertId: result.lastID,
                    affectedRows: result.changes,
                    ...result
                }, []];
            }
        } catch (error) {
            logger.error(`Error en Execute: ${normSql}`, error);
            throw error;
        }
    }

    async query(sql, params) {
        return this.execute(sql, params);
    }

    release() {
        // No-op for sqlite single connection
    }
}

async function transaction(callback) {
    const db = await getDb();
    const connection = new ConnectionWrapper(db);

    try {
        await db.run('BEGIN TRANSACTION');
        const result = await callback(connection);
        await db.run('COMMIT');
        return result;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
}

async function testConnection() {
    try {
        const db = await getDb();
        await db.get('SELECT 1');
        return true;
    } catch (error) {
        logger.error('Error probando conexión SQLite:', error);
        return false;
    }
}

async function insert(table, data) {
    const db = await getDb();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    const result = await db.run(sql, values);
    return result.lastID;
}

module.exports = {
    getDb,
    testConnection,
    query,
    transaction,
    insert
};
