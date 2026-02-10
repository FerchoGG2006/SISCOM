const { initDb } = require('./db');

async function main() {
    try {
        await initDb();
        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

main();
