const { testConnection } = require('./src/config/database');
const initDatabase = require('./src/database/init');

(async () => {
    console.log('Testing connection...');
    try {
        const connected = await testConnection();
        console.log('Connected:', connected);

        if (connected) {
            console.log('Initializing database...');
            await initDatabase();
            console.log('Database initialized successfully.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
