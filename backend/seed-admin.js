require('dotenv').config();
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

async function seed() {
    console.log('Conectando a SQLite directamente...');
    
    const hash = await bcrypt.hash('Admin2026!', 10);
    
    try {
        // Primero intenta actualizar si ya existe
        const existing = db.prepare("SELECT id FROM usuarios WHERE email = ?").get('admin@siscom.gov');
        
        if (existing) {
            db.prepare("UPDATE usuarios SET password = ?, activo = 1, rol = 'administrador' WHERE email = ?")
              .run(hash, 'admin@siscom.gov');
            console.log('✅ Contraseña del admin actualizada!');
        } else {
            db.prepare("INSERT INTO usuarios (nombres, apellidos, email, password, rol, activo) VALUES (?, ?, ?, ?, ?, 1)")
              .run('Admin', 'Seguridad', 'admin@siscom.gov', hash, 'administrador');
            console.log('✅ Admin creado desde cero!');
        }
        
        console.log('');
        console.log('📧 Email: admin@siscom.gov');
        console.log('🔑 Password: Admin2026!');
        console.log('');
    } finally {
        db.close();
    }
}

seed().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
