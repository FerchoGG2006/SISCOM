/**
 * SISCOM - Configuración de Base de Datos MySQL
 */
const mysql = require('mysql2/promise');
const logger = require('./logger');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'siscom_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 10,
    queueLimit: 0,
    timezone: '-05:00',
    dateStrings: true
});

async function testConnection() {
    const connection = await pool.getConnection();
    logger.info('Conexión a MySQL exitosa');
    connection.release();
    return true;
}

async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(sql, values);
    return result.insertId;
}

module.exports = { pool, testConnection, query, transaction, insert };
