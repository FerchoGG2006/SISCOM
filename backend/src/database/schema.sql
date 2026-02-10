-- SISCOM 2.0 SQLite Schema

-- Enable Foreign Keys
PRAGMA foreign_keys = ON;

-- Users (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('comisario', 'secretario', 'psicologo', 'trabajador_social')) NOT NULL,
    estado TEXT DEFAULT 'activo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Personas (Victims & Aggressors)
-- Note: Simplified for MVP, but includes core demographics. 
-- 'detalles_json' stores the 118+ sociological fields to avoid rigid schemas.
CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_doc TEXT NOT NULL,
    num_doc TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    fecha_nacimiento DATE,
    genero TEXT,
    direccion TEXT,
    telefono TEXT,
    barrio TEXT,
    comuna TEXT,
    escolaridad TEXT,
    ocupacion TEXT,
    detalles_json TEXT, -- JSON for extended sociodemographic data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expedientes (Cases)
CREATE TABLE IF NOT EXISTS expedientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    radicado TEXT UNIQUE NOT NULL, -- Format: HS-2026-XXX
    id_victima INTEGER NOT NULL,
    id_agresor INTEGER,
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'en_recepcion' CHECK(estado IN ('en_recepcion', 'en_medidas', 'en_seguimiento', 'cerrado')),
    nivel_riesgo TEXT DEFAULT 'no_evaluado',
    drive_folder_id TEXT, -- Google Drive Folder ID
    created_by INTEGER,
    FOREIGN KEY (id_victima) REFERENCES personas(id),
    FOREIGN KEY (id_agresor) REFERENCES personas(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Respuestas Riesgo (Risk Assessment)
CREATE TABLE IF NOT EXISTS respuestas_riesgo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_expediente INTEGER NOT NULL,
    respuestas_json TEXT NOT NULL, -- 52 boolean answers
    puntaje INTEGER NOT NULL,
    nivel_calculado TEXT NOT NULL,
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES expedientes(id)
);

-- Seguimientos (Timeline)
CREATE TABLE IF NOT EXISTS seguimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_expediente INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo TEXT NOT NULL, -- 'auto', 'audiencia', 'visita', 'llamada'
    descripcion TEXT NOT NULL,
    archivos_json TEXT, -- JSON array of file URLs/IDs
    privado BOOLEAN DEFAULT 0,
    FOREIGN KEY (id_expediente) REFERENCES expedientes(id),
    FOREIGN KEY (id_usuario) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personas_doc ON personas(num_doc);
CREATE INDEX IF NOT EXISTS idx_expedientes_radicado ON expedientes(radicado);
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
