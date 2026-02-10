const { getDb } = require('./src/config/database');

(async () => {
    try {
        const db = await getDb();
        console.log('--- Table Definition ---');
        const row = await db.get("SELECT sql FROM sqlite_master WHERE name='expediente_personas'");
        console.log(row ? row.sql : 'Table not found');

    } catch (e) {
        console.error(e);
    }
})();
