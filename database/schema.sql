-- =====================================================
-- SISCOM - Sistema de Gestión para Comisarías de Familia
-- Script de Base de Datos MySQL
-- Versión: 1.0.0 | Basado en RECEPCIÓN 2026
-- =====================================================

-- Crear base de datos
DROP DATABASE IF EXISTS siscom_db;
CREATE DATABASE siscom_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE siscom_db;

-- =====================================================
-- TABLA: usuarios (Funcionarios del sistema)
-- =====================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'comisario', 'psicologo', 'trabajador_social', 'secretario', 'auxiliar') NOT NULL,
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: personas (Víctimas, Agresores y otros intervinientes)
-- Incluye los 118 campos sociodemográficos de RECEPCIÓN 2026
-- =====================================================
CREATE TABLE personas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- === DATOS DE IDENTIFICACIÓN ===
    tipo_documento ENUM('CC', 'TI', 'CE', 'PA', 'RC', 'NUIP', 'PEP', 'PPT', 'SIN_DOCUMENTO') NOT NULL,
    numero_documento VARCHAR(30),
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE,
    edad INT,
    sexo ENUM('M', 'F', 'I') COMMENT 'M: Masculino, F: Femenino, I: Intersexual',
    genero ENUM('masculino', 'femenino', 'trans_masculino', 'trans_femenino', 'no_binario', 'otro', 'prefiere_no_decir'),
    orientacion_sexual ENUM('heterosexual', 'homosexual', 'bisexual', 'pansexual', 'asexual', 'otro', 'prefiere_no_decir'),
    
    -- === DATOS ÉTNICOS Y CULTURALES ===
    grupo_etnico ENUM('ninguno', 'indigena', 'rom_gitano', 'raizal', 'palenquero', 'afrodescendiente', 'otro'),
    pueblo_indigena VARCHAR(100),
    comunidad_etnica VARCHAR(100),
    lengua_materna VARCHAR(50),
    habla_espanol BOOLEAN DEFAULT TRUE,
    
    -- === DATOS DE UBICACIÓN ===
    departamento VARCHAR(50),
    municipio VARCHAR(100),
    zona ENUM('urbana', 'rural', 'centro_poblado'),
    comuna VARCHAR(50),
    barrio VARCHAR(100),
    direccion VARCHAR(200),
    estrato INT CHECK (estrato >= 0 AND estrato <= 6),
    tipo_vivienda ENUM('propia', 'arrendada', 'familiar', 'invasion', 'inquilinato', 'calle', 'albergue', 'otro'),
    
    -- === DATOS DE CONTACTO ===
    telefono_fijo VARCHAR(20),
    telefono_celular VARCHAR(20),
    telefono_alterno VARCHAR(20),
    email VARCHAR(150),
    contacto_emergencia_nombre VARCHAR(150),
    contacto_emergencia_telefono VARCHAR(20),
    contacto_emergencia_parentesco VARCHAR(50),
    
    -- === DATOS SOCIOECONÓMICOS ===
    nivel_escolaridad ENUM('ninguno', 'preescolar', 'primaria_incompleta', 'primaria_completa', 'secundaria_incompleta', 'secundaria_completa', 'tecnico', 'tecnologico', 'universitario_incompleto', 'universitario_completo', 'posgrado'),
    ultimo_grado_aprobado VARCHAR(20),
    ocupacion VARCHAR(100),
    situacion_laboral ENUM('empleado', 'desempleado', 'independiente', 'informal', 'pensionado', 'estudiante', 'hogar', 'incapacitado', 'otro'),
    ingresos_mensuales DECIMAL(12,2),
    fuente_ingresos VARCHAR(100),
    regimen_salud ENUM('contributivo', 'subsidiado', 'especial', 'excepcion', 'no_afiliado', 'vinculado'),
    eps VARCHAR(100),
    sisben_puntaje DECIMAL(5,2),
    sisben_grupo VARCHAR(10),
    
    -- === DATOS FAMILIARES ===
    estado_civil ENUM('soltero', 'casado', 'union_libre', 'separado', 'divorciado', 'viudo'),
    numero_hijos INT DEFAULT 0,
    hijos_menores_edad INT DEFAULT 0,
    personas_a_cargo INT DEFAULT 0,
    cabeza_hogar BOOLEAN DEFAULT FALSE,
    tipo_familia ENUM('nuclear', 'extensa', 'monoparental', 'recompuesta', 'unipersonal', 'otro'),
    
    -- === CONDICIONES ESPECIALES ===
    discapacidad BOOLEAN DEFAULT FALSE,
    tipo_discapacidad ENUM('fisica', 'sensorial_visual', 'sensorial_auditiva', 'intelectual', 'psicosocial', 'multiple', 'otra'),
    grado_discapacidad ENUM('leve', 'moderada', 'severa'),
    certificado_discapacidad BOOLEAN DEFAULT FALSE,
    cuidador_principal BOOLEAN DEFAULT FALSE,
    mujer_gestante BOOLEAN DEFAULT FALSE,
    semanas_gestacion INT,
    adulto_mayor BOOLEAN DEFAULT FALSE,
    victima_conflicto_armado BOOLEAN DEFAULT FALSE,
    registro_ruv BOOLEAN DEFAULT FALSE,
    migrante BOOLEAN DEFAULT FALSE,
    nacionalidad VARCHAR(50) DEFAULT 'Colombiana',
    estatus_migratorio VARCHAR(100),
    
    -- === ANTECEDENTES RELEVANTES ===
    antecedentes_violencia_familiar BOOLEAN DEFAULT FALSE,
    denuncias_previas INT DEFAULT 0,
    medidas_proteccion_previas BOOLEAN DEFAULT FALSE,
    consumo_sustancias BOOLEAN DEFAULT FALSE,
    tipo_sustancia VARCHAR(100),
    tratamiento_salud_mental BOOLEAN DEFAULT FALSE,
    diagnostico_salud_mental VARCHAR(200),
    ideacion_suicida BOOLEAN DEFAULT FALSE,
    intento_suicidio BOOLEAN DEFAULT FALSE,
    
    -- === DATOS DEL SISTEMA ===
    rol_en_caso ENUM('victima', 'agresor', 'testigo', 'denunciante', 'representante_legal', 'acudiente', 'otro') NOT NULL,
    foto_url VARCHAR(500),
    huella_digital BLOB,
    firma_digital BLOB,
    observaciones TEXT,
    
    -- === METADATOS ===
    usuario_registro_id INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_actualizacion_id INT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_documento (tipo_documento, numero_documento),
    INDEX idx_nombres (primer_nombre, primer_apellido),
    INDEX idx_municipio (departamento, municipio),
    INDEX idx_rol (rol_en_caso),
    
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_actualizacion_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: expedientes (Radicados con formato HS-2026-XXX)
-- =====================================================
CREATE TABLE expedientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- === RADICACIÓN AUTOMÁTICA ===
    radicado VARCHAR(20) UNIQUE NOT NULL COMMENT 'Formato: HS-YYYY-XXXXX',
    anio INT NOT NULL,
    consecutivo INT NOT NULL,
    
    -- === CLASIFICACIÓN DEL CASO ===
    tipo_caso ENUM(
        'violencia_intrafamiliar',
        'violencia_genero',
        'inasistencia_alimentaria',
        'custodia_cuidado_personal',
        'regulacion_visitas',
        'permiso_salida_pais',
        'conciliacion_familiar',
        'violencia_pareja',
        'violencia_nna',
        'violencia_adulto_mayor',
        'violencia_discapacidad',
        'otro'
    ) NOT NULL,
    
    subtipo_violencia SET(
        'fisica',
        'psicologica',
        'sexual',
        'economica',
        'patrimonial',
        'negligencia',
        'abandono'
    ),
    
    modalidad_violencia ENUM('episodica', 'cronica', 'ciclica'),
    frecuencia_violencia ENUM('primera_vez', 'ocasional', 'frecuente', 'diaria'),
    
    -- === NIVEL DE RIESGO (Calculado automáticamente) ===
    puntaje_riesgo INT DEFAULT 0,
    nivel_riesgo ENUM('sin_evaluar', 'bajo', 'medio', 'alto', 'extremo') DEFAULT 'sin_evaluar',
    fecha_valoracion_riesgo DATETIME,
    usuario_valoracion_id INT,
    
    -- === ESTADO PROCESAL ===
    estado ENUM(
        'radicado',
        'en_valoracion',
        'citacion_audiencia',
        'audiencia_programada',
        'medidas_proteccion',
        'seguimiento',
        'remitido',
        'archivado',
        'cerrado'
    ) DEFAULT 'radicado',
    
    subestado VARCHAR(100),
    prioridad ENUM('normal', 'urgente', 'inmediata') DEFAULT 'normal',
    
    -- === DETALLES DEL HECHO ===
    fecha_hechos DATE,
    hora_hechos TIME,
    descripcion_hechos TEXT,
    lugar_hechos VARCHAR(300),
    zona_hechos ENUM('urbana', 'rural'),
    departamento_hechos VARCHAR(50),
    municipio_hechos VARCHAR(100),
    armas_involucradas BOOLEAN DEFAULT FALSE,
    tipo_arma VARCHAR(100),
    lesiones_visibles BOOLEAN DEFAULT FALSE,
    descripcion_lesiones TEXT,
    requiere_atencion_medica BOOLEAN DEFAULT FALSE,
    
    -- === MEDIDAS Y ACTUACIONES ===
    medidas_proteccion_solicitadas BOOLEAN DEFAULT FALSE,
    medidas_proteccion_otorgadas TEXT,
    fecha_medidas_proteccion DATE,
    remision_fiscalia BOOLEAN DEFAULT FALSE,
    numero_noticia_criminal VARCHAR(50),
    remision_icbf BOOLEAN DEFAULT FALSE,
    remision_salud BOOLEAN DEFAULT FALSE,
    remision_otra_entidad VARCHAR(200),
    
    -- === AUDIENCIAS ===
    requiere_audiencia BOOLEAN DEFAULT FALSE,
    fecha_audiencia DATETIME,
    sala_audiencia VARCHAR(50),
    resultado_audiencia TEXT,
    
    -- === DOCUMENTACIÓN Y DRIVE ===
    carpeta_drive_id VARCHAR(100) COMMENT 'ID de la carpeta en Google Drive',
    carpeta_drive_url VARCHAR(500),
    documentos_generados JSON COMMENT 'Lista de documentos PDF generados',
    
    -- === SEGUIMIENTO ===
    fecha_proximo_seguimiento DATE,
    observaciones_seguimiento TEXT,
    
    -- === METADATOS ===
    usuario_radicacion_id INT NOT NULL,
    fecha_radicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_ultima_actualizacion_id INT,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_radicacion VARCHAR(45),
    
    INDEX idx_radicado (radicado),
    INDEX idx_anio_consecutivo (anio, consecutivo),
    INDEX idx_tipo_caso (tipo_caso),
    INDEX idx_estado (estado),
    INDEX idx_nivel_riesgo (nivel_riesgo),
    INDEX idx_fecha_radicacion (fecha_radicacion),
    INDEX idx_prioridad (prioridad),
    
    FOREIGN KEY (usuario_radicacion_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_valoracion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_ultima_actualizacion_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: expediente_personas (Relación N:M entre expedientes y personas)
-- =====================================================
CREATE TABLE expediente_personas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    persona_id INT NOT NULL,
    rol ENUM('victima_principal', 'victima_secundaria', 'agresor_principal', 'agresor_secundario', 'testigo', 'denunciante', 'representante', 'acudiente') NOT NULL,
    parentesco_con_victima VARCHAR(50),
    convivencia_actual BOOLEAN DEFAULT FALSE,
    dependencia_economica BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    fecha_vinculacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_expediente_persona_rol (expediente_id, persona_id, rol),
    INDEX idx_expediente (expediente_id),
    INDEX idx_persona (persona_id),
    
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: valoracion_riesgo (52 preguntas del Instrumento Técnico)
-- =====================================================
CREATE TABLE valoracion_riesgo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    
    -- === SECCIÓN 1: VIOLENCIA PSICOLÓGICA (1 punto c/u) - Ítems 1-8 ===
    item_01_insultos BOOLEAN DEFAULT FALSE COMMENT 'La insulta, humilla o menosprecia',
    item_02_gritos BOOLEAN DEFAULT FALSE COMMENT 'Le grita o usa tono amenazante',
    item_03_criticas BOOLEAN DEFAULT FALSE COMMENT 'Críticas constantes a su apariencia',
    item_04_intimidacion BOOLEAN DEFAULT FALSE COMMENT 'La intimida con gestos o miradas',
    item_05_aislamiento BOOLEAN DEFAULT FALSE COMMENT 'La aísla de familia y amigos',
    item_06_celos BOOLEAN DEFAULT FALSE COMMENT 'Celos excesivos o acusaciones de infidelidad',
    item_07_control_movimientos BOOLEAN DEFAULT FALSE COMMENT 'Controla sus movimientos y actividades',
    item_08_destruccion_objetos BOOLEAN DEFAULT FALSE COMMENT 'Destruye objetos de valor sentimental',
    
    -- === SECCIÓN 2: VIOLENCIA ECONÓMICA Y PATRIMONIAL (1 punto c/u) - Ítems 9-16 ===
    item_09_control_dinero BOOLEAN DEFAULT FALSE COMMENT 'Controla todo el dinero del hogar',
    item_10_niega_recursos BOOLEAN DEFAULT FALSE COMMENT 'Le niega recursos para necesidades básicas',
    item_11_impide_trabajar BOOLEAN DEFAULT FALSE COMMENT 'Le impide trabajar o estudiar',
    item_12_quita_ingresos BOOLEAN DEFAULT FALSE COMMENT 'Le quita su dinero o ingresos',
    item_13_oculta_patrimonio BOOLEAN DEFAULT FALSE COMMENT 'Oculta bienes o patrimonio común',
    item_14_destruye_documentos BOOLEAN DEFAULT FALSE COMMENT 'Destruye sus documentos de identidad',
    item_15_deudas_nombre BOOLEAN DEFAULT FALSE COMMENT 'Ha adquirido deudas a su nombre sin consentimiento',
    item_16_amenaza_despojar BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con despojarla de la vivienda',
    
    -- === SECCIÓN 3: AMENAZAS Y COERCIÓN (10 puntos c/u) - Ítems 17-22 ===
    item_17_amenaza_muerte BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con matarla',
    item_18_amenaza_hijos BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con dañar a los hijos',
    item_19_amenaza_familia BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con dañar a su familia',
    item_20_amenaza_suicidio BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con suicidarse si lo deja',
    item_21_persigue_acosa BOOLEAN DEFAULT FALSE COMMENT 'La persigue o acosa constantemente',
    item_22_amenaza_quitarle_hijos BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con quitarle los hijos',
    
    -- === SECCIÓN 4: VIOLENCIA FÍSICA (20 puntos c/u) - Ítems 23-30 ===
    item_23_empujones BOOLEAN DEFAULT FALSE COMMENT 'Empujones, zarandeos o sacudidas',
    item_24_cachetadas BOOLEAN DEFAULT FALSE COMMENT 'Cachetadas o golpes en la cara',
    item_25_punos_patadas BOOLEAN DEFAULT FALSE COMMENT 'Puños, patadas o golpes fuertes',
    item_26_estrangulamiento BOOLEAN DEFAULT FALSE COMMENT 'Intentos de estrangulamiento o asfixia',
    item_27_quemaduras BOOLEAN DEFAULT FALSE COMMENT 'Quemaduras intencionadas',
    item_28_arma_blanca BOOLEAN DEFAULT FALSE COMMENT 'Agresión con arma blanca',
    item_29_arma_fuego BOOLEAN DEFAULT FALSE COMMENT 'Agresión o amenaza con arma de fuego',
    item_30_golpea_embarazo BOOLEAN DEFAULT FALSE COMMENT 'La ha golpeado estando embarazada',
    
    -- === SECCIÓN 5: VIOLENCIA SEXUAL (20 puntos c/u) - Ítems 31-35 ===
    item_31_relaciones_forzadas BOOLEAN DEFAULT FALSE COMMENT 'Relaciones sexuales forzadas',
    item_32_actos_no_deseados BOOLEAN DEFAULT FALSE COMMENT 'Actos sexuales no deseados',
    item_33_grabaciones BOOLEAN DEFAULT FALSE COMMENT 'Grabaciones o fotos íntimas sin consentimiento',
    item_34_prostitucion BOOLEAN DEFAULT FALSE COMMENT 'Obligada a prostituirse',
    item_35_violencia_sexual_hijos BOOLEAN DEFAULT FALSE COMMENT 'Violencia sexual hacia los hijos',
    
    -- === SECCIÓN 6: CIRCUNSTANCIAS AGRAVANTES (10 puntos c/u) - Ítems 36-45 ===
    item_36_antecedentes_violencia BOOLEAN DEFAULT FALSE COMMENT 'Antecedentes de violencia con otras parejas',
    item_37_incumple_medidas BOOLEAN DEFAULT FALSE COMMENT 'Ha incumplido medidas de protección anteriores',
    item_38_consumo_alcohol BOOLEAN DEFAULT FALSE COMMENT 'Consumo problemático de alcohol',
    item_39_consumo_drogas BOOLEAN DEFAULT FALSE COMMENT 'Consumo de sustancias psicoactivas',
    item_40_acceso_armas BOOLEAN DEFAULT FALSE COMMENT 'Tiene acceso a armas de fuego',
    item_41_trastorno_mental BOOLEAN DEFAULT FALSE COMMENT 'Trastorno mental sin tratamiento',
    item_42_violencia_incrementa BOOLEAN DEFAULT FALSE COMMENT 'La violencia ha incrementado recientemente',
    item_43_separacion_reciente BOOLEAN DEFAULT FALSE COMMENT 'Separación reciente o anunciada',
    item_44_embarazo_actual BOOLEAN DEFAULT FALSE COMMENT 'La víctima está embarazada actualmente',
    item_45_ninos_testigos BOOLEAN DEFAULT FALSE COMMENT 'Hay niños que presencian la violencia',
    
    -- === SECCIÓN 7: PERCEPCIÓN DE MUERTE Y LETALIDAD (20 puntos c/u) - Ítems 46-52 ===
    item_46_cree_capaz_matarla BOOLEAN DEFAULT FALSE COMMENT '¿Cree que él es capaz de matarla?',
    item_47_miedo_por_vida BOOLEAN DEFAULT FALSE COMMENT '¿Tiene miedo por su vida?',
    item_48_violencia_extrema BOOLEAN DEFAULT FALSE COMMENT 'Ha sufrido violencia extrema recientemente',
    item_49_intento_homicidio BOOLEAN DEFAULT FALSE COMMENT 'Ha habido intento de homicidio',
    item_50_amenaza_si_denuncia BOOLEAN DEFAULT FALSE COMMENT 'Amenaza con matarla si denuncia',
    item_51_vigilancia_constante BOOLEAN DEFAULT FALSE COMMENT 'La vigila constantemente',
    item_52_sin_red_apoyo BOOLEAN DEFAULT FALSE COMMENT 'Sin red de apoyo familiar o social',
    
    -- === RESULTADOS CALCULADOS ===
    puntaje_seccion_1 INT DEFAULT 0 COMMENT 'Violencia Psicológica (máx 8)',
    puntaje_seccion_2 INT DEFAULT 0 COMMENT 'Violencia Económica (máx 8)',
    puntaje_seccion_3 INT DEFAULT 0 COMMENT 'Amenazas y Coerción (máx 60)',
    puntaje_seccion_4 INT DEFAULT 0 COMMENT 'Violencia Física (máx 160)',
    puntaje_seccion_5 INT DEFAULT 0 COMMENT 'Violencia Sexual (máx 100)',
    puntaje_seccion_6 INT DEFAULT 0 COMMENT 'Circunstancias Agravantes (máx 100)',
    puntaje_seccion_7 INT DEFAULT 0 COMMENT 'Percepción de Muerte (máx 140)',
    
    puntaje_total INT DEFAULT 0,
    nivel_riesgo ENUM('bajo', 'medio', 'alto', 'extremo') NOT NULL,
    
    -- === OBSERVACIONES DEL PROFESIONAL ===
    observaciones_valoracion TEXT,
    factores_proteccion TEXT COMMENT 'Factores que disminuyen el riesgo',
    factores_riesgo_adicionales TEXT COMMENT 'Factores no contemplados en el instrumento',
    recomendaciones TEXT,
    
    -- === FIRMA DIGITAL ===
    firma_digital_victima LONGBLOB COMMENT 'Imagen de la firma de la víctima',
    firma_digital_funcionario LONGBLOB COMMENT 'Imagen de la firma del funcionario',
    fecha_firma_victima DATETIME,
    ip_firma_victima VARCHAR(45),
    dispositivo_firma VARCHAR(100),
    hash_documento VARCHAR(64) COMMENT 'SHA-256 del documento firmado',
    
    -- === METADATOS ===
    usuario_evaluador_id INT NOT NULL,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_evaluacion_minutos INT,
    version_instrumento VARCHAR(20) DEFAULT '2026.1',
    
    UNIQUE KEY uk_expediente (expediente_id),
    
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_evaluador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: documentos (PDFs generados y almacenados en Drive)
-- =====================================================
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    
    tipo_documento ENUM(
        'formato_recepcion',
        'valoracion_riesgo',
        'medida_proteccion',
        'notificacion_victima',
        'notificacion_agresor',
        'oficio_policia',
        'oficio_salud',
        'oficio_icbf',
        'oficio_fiscalia',
        'citacion_audiencia',
        'acta_audiencia',
        'auto_archivo',
        'otro'
    ) NOT NULL,
    
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    nombre_archivo VARCHAR(255) NOT NULL,
    
    -- === ALMACENAMIENTO EN DRIVE ===
    drive_file_id VARCHAR(100),
    drive_file_url VARCHAR(500),
    drive_folder_id VARCHAR(100),
    
    -- === ALMACENAMIENTO LOCAL (Backup) ===
    ruta_local VARCHAR(500),
    
    -- === METADATOS DEL ARCHIVO ===
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    tamano_bytes BIGINT,
    hash_sha256 VARCHAR(64),
    
    -- === FIRMAS ===
    requiere_firma BOOLEAN DEFAULT FALSE,
    firmado BOOLEAN DEFAULT FALSE,
    fecha_firma DATETIME,
    firmante_nombre VARCHAR(200),
    firmante_documento VARCHAR(30),
    
    -- === CONTROL ===
    version INT DEFAULT 1,
    estado ENUM('borrador', 'generado', 'firmado', 'enviado', 'anulado') DEFAULT 'generado',
    fecha_envio DATETIME,
    destinatario VARCHAR(200),
    
    -- === METADATOS ===
    usuario_generacion_id INT NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_expediente (expediente_id),
    INDEX idx_tipo (tipo_documento),
    INDEX idx_drive (drive_file_id),
    
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_generacion_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: actuaciones (Historial de movimientos del caso)
-- =====================================================
CREATE TABLE actuaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediente_id INT NOT NULL,
    
    tipo_actuacion ENUM(
        'radicacion',
        'valoracion_riesgo',
        'citacion',
        'notificacion',
        'audiencia',
        'medida_proteccion',
        'remision',
        'seguimiento',
        'archivo',
        'reapertura',
        'otro'
    ) NOT NULL,
    
    descripcion TEXT NOT NULL,
    fecha_actuacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    documento_id INT,
    
    -- === METADATOS ===
    usuario_id INT NOT NULL,
    ip_actuacion VARCHAR(45),
    
    INDEX idx_expediente (expediente_id),
    INDEX idx_fecha (fecha_actuacion),
    INDEX idx_tipo (tipo_actuacion),
    
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: notificaciones (Alertas y recordatorios)
-- =====================================================
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    expediente_id INT,
    
    tipo ENUM('alerta_riesgo', 'vencimiento', 'audiencia', 'seguimiento', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura DATETIME,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME,
    
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_prioridad (prioridad),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: configuracion_sistema
-- =====================================================
CREATE TABLE configuracion_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    descripcion TEXT,
    editable BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: auditoria (Log de todas las acciones)
-- =====================================================
CREATE TABLE auditoria (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha),
    INDEX idx_tabla (tabla_afectada),
    INDEX idx_accion (accion),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Generar radicado automático
DELIMITER //
CREATE PROCEDURE sp_generar_radicado(
    IN p_prefijo VARCHAR(5),
    OUT p_radicado VARCHAR(20),
    OUT p_anio INT,
    OUT p_consecutivo INT
)
BEGIN
    DECLARE v_anio INT;
    DECLARE v_consecutivo INT;
    
    SET v_anio = YEAR(CURDATE());
    
    -- Obtener el siguiente consecutivo del año
    SELECT COALESCE(MAX(consecutivo), 0) + 1 INTO v_consecutivo
    FROM expedientes
    WHERE anio = v_anio;
    
    -- Generar el radicado con formato HS-YYYY-XXXXX
    SET p_radicado = CONCAT(p_prefijo, '-', v_anio, '-', LPAD(v_consecutivo, 5, '0'));
    SET p_anio = v_anio;
    SET p_consecutivo = v_consecutivo;
END //
DELIMITER ;

-- Calcular puntaje de riesgo
DELIMITER //
CREATE FUNCTION fn_calcular_puntaje_riesgo(p_valoracion_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_puntaje INT DEFAULT 0;
    DECLARE v_s1, v_s2, v_s3, v_s4, v_s5, v_s6, v_s7 INT DEFAULT 0;
    
    SELECT 
        -- Sección 1: 1 punto cada uno (8 ítems)
        (item_01_insultos + item_02_gritos + item_03_criticas + item_04_intimidacion + 
         item_05_aislamiento + item_06_celos + item_07_control_movimientos + item_08_destruccion_objetos),
        
        -- Sección 2: 1 punto cada uno (8 ítems)
        (item_09_control_dinero + item_10_niega_recursos + item_11_impide_trabajar + item_12_quita_ingresos +
         item_13_oculta_patrimonio + item_14_destruye_documentos + item_15_deudas_nombre + item_16_amenaza_despojar),
        
        -- Sección 3: 10 puntos cada uno (6 ítems)
        (item_17_amenaza_muerte + item_18_amenaza_hijos + item_19_amenaza_familia + 
         item_20_amenaza_suicidio + item_21_persigue_acosa + item_22_amenaza_quitarle_hijos) * 10,
        
        -- Sección 4: 20 puntos cada uno (8 ítems)
        (item_23_empujones + item_24_cachetadas + item_25_punos_patadas + item_26_estrangulamiento +
         item_27_quemaduras + item_28_arma_blanca + item_29_arma_fuego + item_30_golpea_embarazo) * 20,
        
        -- Sección 5: 20 puntos cada uno (5 ítems)
        (item_31_relaciones_forzadas + item_32_actos_no_deseados + item_33_grabaciones + 
         item_34_prostitucion + item_35_violencia_sexual_hijos) * 20,
        
        -- Sección 6: 10 puntos cada uno (10 ítems)
        (item_36_antecedentes_violencia + item_37_incumple_medidas + item_38_consumo_alcohol + 
         item_39_consumo_drogas + item_40_acceso_armas + item_41_trastorno_mental + 
         item_42_violencia_incrementa + item_43_separacion_reciente + item_44_embarazo_actual + 
         item_45_ninos_testigos) * 10,
        
        -- Sección 7: 20 puntos cada uno (7 ítems)
        (item_46_cree_capaz_matarla + item_47_miedo_por_vida + item_48_violencia_extrema + 
         item_49_intento_homicidio + item_50_amenaza_si_denuncia + item_51_vigilancia_constante + 
         item_52_sin_red_apoyo) * 20
    INTO v_s1, v_s2, v_s3, v_s4, v_s5, v_s6, v_s7
    FROM valoracion_riesgo
    WHERE id = p_valoracion_id;
    
    SET v_puntaje = v_s1 + v_s2 + v_s3 + v_s4 + v_s5 + v_s6 + v_s7;
    
    -- Actualizar los puntajes por sección
    UPDATE valoracion_riesgo SET
        puntaje_seccion_1 = v_s1,
        puntaje_seccion_2 = v_s2,
        puntaje_seccion_3 = v_s3,
        puntaje_seccion_4 = v_s4,
        puntaje_seccion_5 = v_s5,
        puntaje_seccion_6 = v_s6,
        puntaje_seccion_7 = v_s7,
        puntaje_total = v_puntaje
    WHERE id = p_valoracion_id;
    
    RETURN v_puntaje;
END //
DELIMITER ;

-- Función para determinar nivel de riesgo
DELIMITER //
CREATE FUNCTION fn_nivel_riesgo(p_puntaje INT) 
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    IF p_puntaje <= 16 THEN
        RETURN 'bajo';
    ELSEIF p_puntaje <= 50 THEN
        RETURN 'medio';
    ELSEIF p_puntaje <= 150 THEN
        RETURN 'alto';
    ELSE
        RETURN 'extremo';
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para auditoría de expedientes
DELIMITER //
CREATE TRIGGER tr_expedientes_audit_insert
AFTER INSERT ON expedientes
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, datos_nuevos)
    VALUES (NEW.usuario_radicacion_id, 'INSERT', 'expedientes', NEW.id, JSON_OBJECT(
        'radicado', NEW.radicado,
        'tipo_caso', NEW.tipo_caso,
        'estado', NEW.estado
    ));
END //
DELIMITER ;

-- Trigger para actualizar nivel de riesgo automáticamente
DELIMITER //
CREATE TRIGGER tr_valoracion_calcular_riesgo
BEFORE UPDATE ON valoracion_riesgo
FOR EACH ROW
BEGIN
    DECLARE v_puntaje INT;
    
    -- Calcular puntajes por sección
    SET NEW.puntaje_seccion_1 = (NEW.item_01_insultos + NEW.item_02_gritos + NEW.item_03_criticas + 
        NEW.item_04_intimidacion + NEW.item_05_aislamiento + NEW.item_06_celos + 
        NEW.item_07_control_movimientos + NEW.item_08_destruccion_objetos);
    
    SET NEW.puntaje_seccion_2 = (NEW.item_09_control_dinero + NEW.item_10_niega_recursos + 
        NEW.item_11_impide_trabajar + NEW.item_12_quita_ingresos + NEW.item_13_oculta_patrimonio + 
        NEW.item_14_destruye_documentos + NEW.item_15_deudas_nombre + NEW.item_16_amenaza_despojar);
    
    SET NEW.puntaje_seccion_3 = (NEW.item_17_amenaza_muerte + NEW.item_18_amenaza_hijos + 
        NEW.item_19_amenaza_familia + NEW.item_20_amenaza_suicidio + NEW.item_21_persigue_acosa + 
        NEW.item_22_amenaza_quitarle_hijos) * 10;
    
    SET NEW.puntaje_seccion_4 = (NEW.item_23_empujones + NEW.item_24_cachetadas + 
        NEW.item_25_punos_patadas + NEW.item_26_estrangulamiento + NEW.item_27_quemaduras + 
        NEW.item_28_arma_blanca + NEW.item_29_arma_fuego + NEW.item_30_golpea_embarazo) * 20;
    
    SET NEW.puntaje_seccion_5 = (NEW.item_31_relaciones_forzadas + NEW.item_32_actos_no_deseados + 
        NEW.item_33_grabaciones + NEW.item_34_prostitucion + NEW.item_35_violencia_sexual_hijos) * 20;
    
    SET NEW.puntaje_seccion_6 = (NEW.item_36_antecedentes_violencia + NEW.item_37_incumple_medidas + 
        NEW.item_38_consumo_alcohol + NEW.item_39_consumo_drogas + NEW.item_40_acceso_armas + 
        NEW.item_41_trastorno_mental + NEW.item_42_violencia_incrementa + NEW.item_43_separacion_reciente + 
        NEW.item_44_embarazo_actual + NEW.item_45_ninos_testigos) * 10;
    
    SET NEW.puntaje_seccion_7 = (NEW.item_46_cree_capaz_matarla + NEW.item_47_miedo_por_vida + 
        NEW.item_48_violencia_extrema + NEW.item_49_intento_homicidio + NEW.item_50_amenaza_si_denuncia + 
        NEW.item_51_vigilancia_constante + NEW.item_52_sin_red_apoyo) * 20;
    
    SET NEW.puntaje_total = NEW.puntaje_seccion_1 + NEW.puntaje_seccion_2 + NEW.puntaje_seccion_3 + 
        NEW.puntaje_seccion_4 + NEW.puntaje_seccion_5 + NEW.puntaje_seccion_6 + NEW.puntaje_seccion_7;
    
    -- Determinar nivel de riesgo
    IF NEW.puntaje_total <= 16 THEN
        SET NEW.nivel_riesgo = 'bajo';
    ELSEIF NEW.puntaje_total <= 50 THEN
        SET NEW.nivel_riesgo = 'medio';
    ELSEIF NEW.puntaje_total <= 150 THEN
        SET NEW.nivel_riesgo = 'alto';
    ELSE
        SET NEW.nivel_riesgo = 'extremo';
    END IF;
END //
DELIMITER ;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO usuarios (cedula, nombres, apellidos, email, password_hash, rol, cargo) VALUES
('admin', 'Administrador', 'Sistema', 'admin@siscom.gov.co', '$2b$10$defaultPasswordHashHere', 'admin', 'Administrador del Sistema');

-- Configuración inicial del sistema
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion) VALUES
('PREFIJO_RADICADO', 'HS', 'string', 'Prefijo para los números de radicado'),
('GOOGLE_DRIVE_ROOT_FOLDER', '', 'string', 'ID de la carpeta raíz en Google Drive'),
('DIAS_VENCIMIENTO_AUDIENCIA', '10', 'number', 'Días para programar audiencia después de radicación'),
('UMBRAL_RIESGO_BAJO', '16', 'number', 'Puntaje máximo para riesgo bajo'),
('UMBRAL_RIESGO_MEDIO', '50', 'number', 'Puntaje máximo para riesgo medio'),
('UMBRAL_RIESGO_ALTO', '150', 'number', 'Puntaje máximo para riesgo alto'),
('NOTIFICAR_RIESGO_EXTREMO', 'true', 'boolean', 'Enviar alerta cuando se detecte riesgo extremo'),
('VERSION_INSTRUMENTO_RIESGO', '2026.1', 'string', 'Versión del instrumento de valoración de riesgo');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
