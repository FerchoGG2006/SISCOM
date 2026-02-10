const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Database wrapper for async/await
let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;

    try {
        dbInstance = await open({
            filename: path.join(__dirname, '../../database.sqlite'), // Root of backend
            driver: sqlite3.Database
        });

        // Enable foreign keys
        await dbInstance.run('PRAGMA foreign_keys = ON');

        console.log('Connected to SQLite database.');
        return dbInstance;
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

async function initDb() {
    const fs = require('fs');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const db = await getDb();
    await db.exec(schema);
    console.log('Database initialized with schema.');
}

module.exports = { getDb, initDb };
