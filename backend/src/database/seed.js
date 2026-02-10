const { getDb } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const db = await getDb();

        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE email = ?', ['comisario@siscom.gov.co']);

        if (user) {
            console.log('Default user exists. Updating password...');
            const hashedPassword = await bcrypt.hash('Siscom2026!', 10);
            await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'comisario@siscom.gov.co']);
            console.log('✅ Password updated successfully.');
            return;
        }

        // Create default user
        // Password: Siscom2026!
        const hashedPassword = await bcrypt.hash('Siscom2026!', 10);

        await db.run(
            `INSERT INTO users (nombre, email, password, rol, estado) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Comisario Principal', 'comisario@siscom.gov.co', hashedPassword, 'comisario', 'activo']
        );

        console.log('✅ Default user created successfully.');
        console.log('Email: comisario@siscom.gov.co');
        console.log('Password: Siscom2026!');

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seed();
