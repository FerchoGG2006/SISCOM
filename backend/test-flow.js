/**
 * Test de Flujo Completo: Radicación de Caso
 * Ejecutar con: node test-flow.js
 */

async function runtest() {
    const API_URL = 'http://127.0.0.1:3001/api/v1';

    console.log('🚀 Iniciando prueba de flujo completo...');

    // 1. Iniciar Sesión
    console.log('\n[1/3] Iniciando sesión como Admin...');
    let token;
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@siscom.gov.co',
                password: 'Siscom2026'
            })
        });

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('❌ Error en login:', loginData);
            process.exit(1);
        }

        token = loginData.data.token;
        console.log('✅ Login exitoso. Token obtenido.');

    } catch (error) {
        console.error('❌ Error de conexión en login:', error.message);
        process.exit(1);
    }

    // 2. Preparar Datos del Caso
    const casoPrueba = {
        victima: {
            tipo_documento: 'CC',
            numero_documento: '123456789',
            primer_nombre: 'Ana',
            primer_apellido: 'Pérez',
            sexo: 'F',
            genero: 'femenino',
            edad: 30,
            telefono_celular: '3001234567',
            direccion: 'Calle 123 # 45-67'
        },
        agresor: {
            tipo_documento: 'CC',
            numero_documento: '987654321',
            primer_nombre: 'Juan',
            primer_apellido: 'Gómez',
            parentesco_con_victima: 'Pareja',
            sexo: 'M'
        },
        datosHecho: {
            tipo_caso: 'violencia_intrafamiliar',
            fecha_hechos: new Date().toISOString().split('T')[0], // Hoy
            descripcion_hechos: 'Agresión verbal y amenazas de muerte.',
            lugar_hechos: 'Casa de habitación',
            zona_hechos: 'urbana'
        },
        valoracionRiesgo: {
            // Sección 1: Psicológica
            item_01_insultos: true, // +1
            item_02_gritos: true, // +1

            // Sección 3: Amenazas (+10 c/u)
            item_17_amenaza_muerte: true, // +10

            // Sección 4: Física (+20 c/u)
            item_23_empujones: true, // +20

            // Total esperado: 1+1+10+20 = 32 (Riesgo Medio)
        }
    };

    console.log('\n[2/3] Radicando nuevo caso...');
    console.log('Datos a enviar:', JSON.stringify(casoPrueba.valoracionRiesgo, null, 2));

    // 3. Radicar Caso
    try {
        const radicarRes = await fetch(`${API_URL}/expedientes/radicar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(casoPrueba)
        });

        const radicarData = await radicarRes.json();

        if (!radicarData.success) {
            console.error('❌ Error al radicar:', radicarData);
            // Mostrar error detallado si existe
            if (radicarData.error) console.error('Detalle:', radicarData.error);
        } else {
            console.log('✅ Caso radicado exitosamente!');
            console.log('📋 Detalle del resultado:');
            console.log(`   - ID Expediente: ${radicarData.data.expedienteId}`);
            console.log(`   - Radicado: ${radicarData.data.radicado}`);
            console.log(`   - Nivel de Riesgo Calculado: ${radicarData.data.nivelRiesgo.toUpperCase()}`);
            console.log(`   - Puntaje Total: ${radicarData.data.puntajeRiesgo}`);
            console.log(`   - Recomendaciones: ${radicarData.data.recomendaciones.length}`);

            // Validaciones básicas
            if (radicarData.data.puntajeRiesgo === 32) {
                console.log('✨ CHECK: Cálculo de riesgo correcto (32 puntos).');
            } else {
                console.warn(`⚠️ CHECK: Cálculo de riesgo diferente al esperado. Esperado: 32, Obtenido: ${radicarData.data.puntajeRiesgo}`);
            }
        }

    } catch (error) {
        console.error('❌ Error de conexión al radicar:', error);
    }
}

runtest();
