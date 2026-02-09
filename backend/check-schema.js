const { getDb } = require('./src/config/database');

(async () => {
    try {
        const db = await getDb();
        console.log('--- Schema for expediente_personas ---');
        const info = await db.all("PRAGMA table_info(expediente_personas)");
        console.table(info);

        console.log('\n--- Schema for personas ---');
        const info2 = await db.all("PRAGMA table_info(personas)");
        console.table(info2);

    } catch (e) {
        console.error(e);
    }
})();
