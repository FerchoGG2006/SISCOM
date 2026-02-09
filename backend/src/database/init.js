/**
 * SISCOM - Inicialización de Base de Datos SQLite
 */
const db = require('../config/database');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

async function initDatabase() {
    try {
        logger.info('Iniciando configuración de SQLite...');

        // Habilitar claves foráneas
        await db.query('PRAGMA foreign_keys = ON');

        // =====================================================
        // TABLA: usuarios
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cedula TEXT UNIQUE NOT NULL,
                nombres TEXT NOT NULL,
                apellidos TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                rol TEXT CHECK(rol IN ('admin', 'comisario', 'psicologo', 'trabajador_social', 'secretario', 'auxiliar')) NOT NULL,
                cargo TEXT,
                telefono TEXT,
                activo INTEGER DEFAULT 1,
                ultimo_acceso DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // =====================================================
        // TABLA: personas
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS personas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo_documento TEXT NOT NULL,
                numero_documento TEXT,
                primer_nombre TEXT NOT NULL,
                segundo_nombre TEXT,
                primer_apellido TEXT NOT NULL,
                segundo_apellido TEXT,
                fecha_nacimiento DATE,
                edad INTEGER,
                sexo TEXT,
                genero TEXT,
                orientacion_sexual TEXT,
                grupo_etnico TEXT,
                pueblo_indigena TEXT,
                comunidad_etnica TEXT,
                lengua_materna TEXT,
                habla_espanol INTEGER DEFAULT 1,
                departamento TEXT,
                municipio TEXT,
                zona TEXT,
                comuna TEXT,
                barrio TEXT,
                direccion TEXT,
                estrato INTEGER,
                tipo_vivienda TEXT,
                telefono_fijo TEXT,
                telefono_celular TEXT,
                telefono_alterno TEXT,
                email TEXT,
                contacto_emergencia_nombre TEXT,
                contacto_emergencia_telefono TEXT,
                contacto_emergencia_parentesco TEXT,
                nivel_escolaridad TEXT,
                ultimo_grado_aprobado TEXT,
                ocupacion TEXT,
                situacion_laboral TEXT,
                ingresos_mensuales REAL,
                fuente_ingresos TEXT,
                regimen_salud TEXT,
                eps TEXT,
                sisben_puntaje REAL,
                sisben_grupo TEXT,
                estado_civil TEXT,
                numero_hijos INTEGER DEFAULT 0,
                hijos_menores_edad INTEGER DEFAULT 0,
                personas_a_cargo INTEGER DEFAULT 0,
                cabeza_hogar INTEGER DEFAULT 0,
                tipo_familia TEXT,
                discapacidad INTEGER DEFAULT 0,
                tipo_discapacidad TEXT,
                grado_discapacidad TEXT,
                certificado_discapacidad INTEGER DEFAULT 0,
                cuidador_principal INTEGER DEFAULT 0,
                mujer_gestante INTEGER DEFAULT 0,
                semanas_gestacion INTEGER,
                adulto_mayor INTEGER DEFAULT 0,
                victima_conflicto_armado INTEGER DEFAULT 0,
                registro_ruv INTEGER DEFAULT 0,
                migrante INTEGER DEFAULT 0,
                nacionalidad TEXT DEFAULT 'Colombiana',
                estatus_migratorio TEXT,
                antecedentes_violencia_familiar INTEGER DEFAULT 0,
                denuncias_previas INTEGER DEFAULT 0,
                medidas_proteccion_previas INTEGER DEFAULT 0,
                consumo_sustancias INTEGER DEFAULT 0,
                tipo_sustancia TEXT,
                tratamiento_salud_mental INTEGER DEFAULT 0,
                diagnostico_salud_mental TEXT,
                ideacion_suicida INTEGER DEFAULT 0,
                intento_suicidio INTEGER DEFAULT 0,
                rol_en_caso TEXT NOT NULL,
                foto_url TEXT,
                huella_digital BLOB,
                firma_digital BLOB,
                observaciones TEXT,
                usuario_registro_id INTEGER,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                usuario_actualizacion_id INTEGER,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                activo INTEGER DEFAULT 1,
                FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),
                FOREIGN KEY (usuario_actualizacion_id) REFERENCES usuarios(id)
            )
        `);

        // =====================================================
        // TABLA: expedientes
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS expedientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                radicado TEXT UNIQUE NOT NULL,
                anio INTEGER NOT NULL,
                consecutivo INTEGER NOT NULL,
                tipo_caso TEXT NOT NULL,
                subtipo_violencia TEXT,
                modalidad_violencia TEXT,
                frecuencia_violencia TEXT,
                puntaje_riesgo INTEGER DEFAULT 0,
                nivel_riesgo TEXT DEFAULT 'sin_evaluar',
                fecha_valoracion_riesgo DATETIME,
                usuario_valoracion_id INTEGER,
                estado TEXT DEFAULT 'radicado',
                subestado TEXT,
                prioridad TEXT DEFAULT 'normal',
                fecha_hechos DATE,
                hora_hechos TIME,
                descripcion_hechos TEXT,
                lugar_hechos TEXT,
                zona_hechos TEXT,
                departamento_hechos TEXT,
                municipio_hechos TEXT,
                armas_involucradas INTEGER DEFAULT 0,
                tipo_arma TEXT,
                lesiones_visibles INTEGER DEFAULT 0,
                descripcion_lesiones TEXT,
                requiere_atencion_medica INTEGER DEFAULT 0,
                medidas_proteccion_solicitadas INTEGER DEFAULT 0,
                medidas_proteccion_otorgadas TEXT,
                fecha_medidas_proteccion DATE,
                remision_fiscalia INTEGER DEFAULT 0,
                numero_noticia_criminal TEXT,
                remision_icbf INTEGER DEFAULT 0,
                remision_salud INTEGER DEFAULT 0,
                remision_otra_entidad TEXT,
                requiere_audiencia INTEGER DEFAULT 0,
                fecha_audiencia DATETIME,
                sala_audiencia TEXT,
                resultado_audiencia TEXT,
                carpeta_drive_id TEXT,
                carpeta_drive_url TEXT,
                documentos_generados TEXT,
                fecha_proximo_seguimiento DATE,
                observaciones_seguimiento TEXT,
                usuario_radicacion_id INTEGER NOT NULL,
                fecha_radicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                usuario_ultima_actualizacion_id INTEGER,
                fecha_ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_radicacion TEXT,
                FOREIGN KEY (usuario_radicacion_id) REFERENCES usuarios(id),
                FOREIGN KEY (usuario_valoracion_id) REFERENCES usuarios(id),
                FOREIGN KEY (usuario_ultima_actualizacion_id) REFERENCES usuarios(id)
            )
        `);

        // =====================================================
        // TABLA: expediente_personas
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS expediente_personas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expediente_id INTEGER NOT NULL,
                persona_id INTEGER NOT NULL,
                rol TEXT NOT NULL,
                parentesco_con_victima TEXT,
                convivencia_actual INTEGER DEFAULT 0,
                dependencia_economica INTEGER DEFAULT 0,
                observaciones TEXT,
                fecha_vinculacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(expediente_id, persona_id, rol),
                FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
                FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
            )
        `);

        // =====================================================
        // TABLA: valoracion_riesgo
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS valoracion_riesgo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expediente_id INTEGER NOT NULL UNIQUE,
                item_01_insultos INTEGER DEFAULT 0,
                item_02_gritos INTEGER DEFAULT 0,
                item_03_criticas INTEGER DEFAULT 0,
                item_04_intimidacion INTEGER DEFAULT 0,
                item_05_aislamiento INTEGER DEFAULT 0,
                item_06_celos INTEGER DEFAULT 0,
                item_07_control_movimientos INTEGER DEFAULT 0,
                item_08_destruccion_objetos INTEGER DEFAULT 0,
                item_09_control_dinero INTEGER DEFAULT 0,
                item_10_niega_recursos INTEGER DEFAULT 0,
                item_11_impide_trabajar INTEGER DEFAULT 0,
                item_12_quita_ingresos INTEGER DEFAULT 0,
                item_13_oculta_patrimonio INTEGER DEFAULT 0,
                item_14_destruye_documentos INTEGER DEFAULT 0,
                item_15_deudas_nombre INTEGER DEFAULT 0,
                item_16_amenaza_despojar INTEGER DEFAULT 0,
                item_17_amenaza_muerte INTEGER DEFAULT 0,
                item_18_amenaza_hijos INTEGER DEFAULT 0,
                item_19_amenaza_familia INTEGER DEFAULT 0,
                item_20_amenaza_suicidio INTEGER DEFAULT 0,
                item_21_persigue_acosa INTEGER DEFAULT 0,
                item_22_amenaza_quitarle_hijos INTEGER DEFAULT 0,
                item_23_empujones INTEGER DEFAULT 0,
                item_24_cachetadas INTEGER DEFAULT 0,
                item_25_punos_patadas INTEGER DEFAULT 0,
                item_26_estrangulamiento INTEGER DEFAULT 0,
                item_27_quemaduras INTEGER DEFAULT 0,
                item_28_arma_blanca INTEGER DEFAULT 0,
                item_29_arma_fuego INTEGER DEFAULT 0,
                item_30_golpea_embarazo INTEGER DEFAULT 0,
                item_31_relaciones_forzadas INTEGER DEFAULT 0,
                item_32_actos_no_deseados INTEGER DEFAULT 0,
                item_33_grabaciones INTEGER DEFAULT 0,
                item_34_prostitucion INTEGER DEFAULT 0,
                item_35_violencia_sexual_hijos INTEGER DEFAULT 0,
                item_36_antecedentes_violencia INTEGER DEFAULT 0,
                item_37_incumple_medidas INTEGER DEFAULT 0,
                item_38_consumo_alcohol INTEGER DEFAULT 0,
                item_39_consumo_drogas INTEGER DEFAULT 0,
                item_40_acceso_armas INTEGER DEFAULT 0,
                item_41_trastorno_mental INTEGER DEFAULT 0,
                item_42_violencia_incrementa INTEGER DEFAULT 0,
                item_43_separacion_reciente INTEGER DEFAULT 0,
                item_44_embarazo_actual INTEGER DEFAULT 0,
                item_45_ninos_testigos INTEGER DEFAULT 0,
                item_46_cree_capaz_matarla INTEGER DEFAULT 0,
                item_47_miedo_por_vida INTEGER DEFAULT 0,
                item_48_violencia_extrema INTEGER DEFAULT 0,
                item_49_intento_homicidio INTEGER DEFAULT 0,
                item_50_amenaza_si_denuncia INTEGER DEFAULT 0,
                item_51_vigilancia_constante INTEGER DEFAULT 0,
                item_52_sin_red_apoyo INTEGER DEFAULT 0,
                puntaje_seccion_1 INTEGER DEFAULT 0,
                puntaje_seccion_2 INTEGER DEFAULT 0,
                puntaje_seccion_3 INTEGER DEFAULT 0,
                puntaje_seccion_4 INTEGER DEFAULT 0,
                puntaje_seccion_5 INTEGER DEFAULT 0,
                puntaje_seccion_6 INTEGER DEFAULT 0,
                puntaje_seccion_7 INTEGER DEFAULT 0,
                puntaje_total INTEGER DEFAULT 0,
                nivel_riesgo TEXT NOT NULL,
                observaciones_valoracion TEXT,
                factores_proteccion TEXT,
                factores_riesgo_adicionales TEXT,
                recomendaciones TEXT,
                firma_digital_victima BLOB,
                firma_digital_funcionario BLOB,
                fecha_firma_victima DATETIME,
                ip_firma_victima TEXT,
                dispositivo_firma TEXT,
                hash_documento TEXT,
                usuario_evaluador_id INTEGER NOT NULL,
                fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                duracion_evaluacion_minutos INTEGER,
                version_instrumento TEXT DEFAULT '2026.1',
                FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_evaluador_id) REFERENCES usuarios(id)
            )
        `);

        // =====================================================
        // TABLA: documentos
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS documentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expediente_id INTEGER NOT NULL,
                tipo_documento TEXT NOT NULL,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                nombre_archivo TEXT NOT NULL,
                drive_file_id TEXT,
                drive_file_url TEXT,
                drive_folder_id TEXT,
                ruta_local TEXT,
                mime_type TEXT DEFAULT 'application/pdf',
                tamano_bytes INTEGER,
                hash_sha256 TEXT,
                requiere_firma INTEGER DEFAULT 0,
                firmado INTEGER DEFAULT 0,
                fecha_firma DATETIME,
                firmante_nombre TEXT,
                firmante_documento TEXT,
                version INTEGER DEFAULT 1,
                estado TEXT DEFAULT 'generado',
                fecha_envio DATETIME,
                destinatario TEXT,
                usuario_generacion_id INTEGER NOT NULL,
                fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_generacion_id) REFERENCES usuarios(id)
            )
        `);

        // =====================================================
        // TABLA: actuaciones
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS actuaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expediente_id INTEGER NOT NULL,
                tipo_actuacion TEXT NOT NULL,
                descripcion TEXT NOT NULL,
                fecha_actuacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                documento_id INTEGER,
                usuario_id INTEGER NOT NULL,
                ip_actuacion TEXT,
                FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
                FOREIGN KEY (documento_id) REFERENCES documentos(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        // =====================================================
        // TABLA: notificaciones
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS notificaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                expediente_id INTEGER,
                tipo TEXT NOT NULL,
                titulo TEXT NOT NULL,
                mensaje TEXT NOT NULL,
                prioridad TEXT DEFAULT 'media',
                leida INTEGER DEFAULT 0,
                fecha_lectura DATETIME,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_expiracion DATETIME,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE
            )
        `);

        // =====================================================
        // TABLA: configuracion_sistema
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS configuracion_sistema (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clave TEXT UNIQUE NOT NULL,
                valor TEXT,
                tipo TEXT DEFAULT 'string',
                descripcion TEXT,
                editable INTEGER DEFAULT 1,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // =====================================================
        // TABLA: auditoria
        // =====================================================
        await db.query(`
            CREATE TABLE IF NOT EXISTS auditoria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                accion TEXT NOT NULL,
                tabla_afectada TEXT,
                registro_id INTEGER,
                datos_anteriores TEXT,
                datos_nuevos TEXT,
                ip_address TEXT,
                user_agent TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        // Crear usuario admin por defecto si no existe
        const adminExists = await db.query("SELECT * FROM usuarios WHERE email = 'admin@siscom.gov.co'");
        if (adminExists.length === 0) {
            const hashedPassword = await bcrypt.hash('Siscom2026', 10);
            await db.query(`
                INSERT INTO usuarios (cedula, nombres, apellidos, email, password_hash, rol, cargo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ['admin', 'Administrador', 'Sistema', 'admin@siscom.gov.co', hashedPassword, 'admin', 'Administrador del Sistema']);
            logger.info('Usuario administrador creado');
        }

        // Insertar configuración inicial
        await db.query(`
            INSERT OR IGNORE INTO configuracion_sistema (clave, valor, tipo, descripcion) VALUES
            ('PREFIJO_RADICADO', 'HS', 'string', 'Prefijo para los números de radicado'),
            ('GOOGLE_DRIVE_ROOT_FOLDER', '', 'string', 'ID de la carpeta raíz en Google Drive'),
            ('DIAS_VENCIMIENTO_AUDIENCIA', '10', 'number', 'Días para programar audiencia después de radicación'),
            ('UMBRAL_RIESGO_BAJO', '16', 'number', 'Puntaje máximo para riesgo bajo'),
            ('UMBRAL_RIESGO_MEDIO', '50', 'number', 'Puntaje máximo para riesgo medio'),
            ('UMBRAL_RIESGO_ALTO', '150', 'number', 'Puntaje máximo para riesgo alto')
        `);

        logger.info('Base de datos SQLite inicializada correctamente');
        return true;

    } catch (error) {
        logger.error('Error inicializando base de datos:', error);
        throw error;
    }
}

module.exports = initDatabase;
