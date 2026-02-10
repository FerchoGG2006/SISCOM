/**
 * SISCOM - Servicio de Generación de PDFs
 * Genera documentos legales: Medidas de Protección, Oficios, Notificaciones
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');
const logger = require('../config/logger');

class PDFGeneratorService {
    constructor() {
        this.outputDir = path.join(__dirname, '../../uploads/documentos');
        this.templatesDir = path.join(__dirname, '../templates');

        // Asegurar que exista el directorio de salida
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Genera el formato de recepción del caso
     */
    async generarFormatoRecepcion(expediente, victima, agresor, usuario) {
        const fileName = `Recepcion_${expediente.radicado}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Encabezado institucional
                this._agregarEncabezado(doc, 'FORMATO DE RECEPCIÓN DE DENUNCIA');

                // Información del radicado
                doc.fontSize(11).font('Helvetica-Bold')
                    .text(`Radicado: ${expediente.radicado}`, { align: 'right' });
                doc.fontSize(10).font('Helvetica')
                    .text(`Fecha: ${this._formatearFecha(expediente.fecha_radicacion)}`, { align: 'right' });
                doc.moveDown(2);

                // Datos de la víctima
                this._agregarSeccion(doc, 'I. DATOS DE LA PRESUNTA VÍCTIMA');
                this._agregarCamposDatos(doc, [
                    { label: 'Nombres y Apellidos', value: `${victima.primer_nombre} ${victima.segundo_nombre || ''} ${victima.primer_apellido} ${victima.segundo_apellido || ''}` },
                    { label: 'Documento de Identidad', value: `${victima.tipo_documento} ${victima.numero_documento}` },
                    { label: 'Fecha de Nacimiento', value: victima.fecha_nacimiento || 'No registrada' },
                    { label: 'Sexo', value: this._getSexoLabel(victima.sexo) },
                    { label: 'Estado Civil', value: victima.estado_civil || 'No registrado' },
                    { label: 'Nivel de Escolaridad', value: victima.nivel_escolaridad || 'No registrado' },
                    { label: 'Ocupación', value: victima.ocupacion || 'No registrada' },
                    { label: 'Dirección', value: victima.direccion || 'No registrada' },
                    { label: 'Barrio/Comuna', value: `${victima.barrio || ''} - ${victima.comuna || ''}` },
                    { label: 'Teléfono', value: victima.telefono_celular || victima.telefono_fijo || 'No registrado' },
                ]);

                doc.addPage();

                // Datos del agresor
                this._agregarSeccion(doc, 'II. DATOS DEL PRESUNTO AGRESOR');
                this._agregarCamposDatos(doc, [
                    { label: 'Nombres y Apellidos', value: `${agresor.primer_nombre} ${agresor.segundo_nombre || ''} ${agresor.primer_apellido} ${agresor.segundo_apellido || ''}` },
                    { label: 'Documento de Identidad', value: `${agresor.tipo_documento} ${agresor.numero_documento || 'No identificado'}` },
                    { label: 'Parentesco con la Víctima', value: agresor.parentesco_con_victima || 'No especificado' },
                    { label: 'Dirección', value: agresor.direccion || 'No registrada' },
                    { label: 'Teléfono', value: agresor.telefono_celular || 'No registrado' },
                ]);

                // Hechos
                this._agregarSeccion(doc, 'III. RELATO DE LOS HECHOS');
                doc.fontSize(10).font('Helvetica')
                    .text(expediente.descripcion_hechos || 'No se registró descripción de los hechos.', {
                        align: 'justify',
                        lineGap: 4
                    });

                // Pie de página con funcionario
                doc.moveDown(3);
                doc.fontSize(9).font('Helvetica')
                    .text('_'.repeat(50), { align: 'center' })
                    .text(`${usuario.nombres} ${usuario.apellidos}`, { align: 'center' })
                    .text(`${usuario.cargo || usuario.rol}`, { align: 'center' })
                    .text('Comisaría de Familia', { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    logger.info(`PDF generado: ${fileName}`);
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                logger.error('Error generando formato de recepción:', error);
                reject(error);
            }
        });
    }

    /**

     * Genera el Auto de Inicio del proceso (Documento Premium)
     */
    async generarAutoInicio(expediente, victima, agresor, usuario) {
        const fileName = `Auto_Inicio_${expediente.radicado_hs}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 70, bottom: 50, left: 70, right: 70 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Diseño premium de encabezado
                doc.fillColor('#1E293B').fontSize(16).font('Helvetica-Bold')
                    .text('SISCOM - SISTEMA DE GESTIÓN', { align: 'center' });
                doc.fontSize(10).font('Helvetica')
                    .text('COMISARÍA DE FAMILIA - REPÚBLICA DE COLOMBIA', { align: 'center' });
                doc.moveDown(2);

                doc.fillColor('#000').fontSize(14).font('Helvetica-Bold')
                    .text('AUTO DE INICIO DE TRÁMITE', { align: 'center' });
                doc.moveDown(1);

                doc.fontSize(10).font('Helvetica')
                    .text(`RADICADO: ${expediente.radicado_hs}`, { align: 'right', bold: true })
                    .text(`FECHA: ${this._formatearFecha(new Date())}`, { align: 'right' });
                doc.moveDown(2);

                // Cuerpo del documento
                doc.fontSize(11).font('Helvetica')
                    .text('VISTO el relato de los hechos presentado por el(la) ciudadano(a) ', { continued: true })
                    .font('Helvetica-Bold').text(`${victima.nombres} ${victima.apellidos}`, { continued: true })
                    .font('Helvetica').text(`, identificado(a) con documento No. ${victima.numero_documento}, este despacho procedió a realizar la correspondiente radicación y valoración inicial del caso.`, { align: 'justify' });

                doc.moveDown(1.5);

                doc.font('Helvetica-Bold').text('ANTECEDENTES Y VALORACIÓN:');
                doc.moveDown(0.5);
                doc.font('Helvetica').text(`Tras la aplicación del instrumento de valoración de riesgo, se ha determinado de manera preliminar un nivel de riesgo `, { continued: true })
                    .font('Helvetica-Bold').text(expediente.nivel_riesgo.toUpperCase(), { continued: true })
                    .font('Helvetica').text(` con un puntaje de ${expediente.puntaje_riesgo} puntos, lo cual exige la activación inmediata de los protocolos institucionales previstos en la Ley 1257 de 2008.`, { align: 'justify' });

                doc.moveDown(1.5);

                doc.font('Helvetica-Bold').text('RESUELVE:');
                doc.moveDown(0.5);
                const articulos = [
                    `PRIMERO: Avocar conocimiento de la presente solicitud de medida de protección en favor de la señora ${victima.nombres} ${victima.apellidos}.`,
                    `SEGUNDO: Notificar a las partes y vincular al presunto agresor ${agresor ? `${agresor.nombres} ${agresor.apellidos}` : '(Por establecer)'} al proceso.`,
                    `TERCERO: Activar el seguimiento prioritario por parte del equipo interdisciplinario de la Comisaría de Familia.`,
                    `CUARTO: Oficiar a la Policía Nacional para las labores de vigilancia preventiva correspondientes.`
                ];

                articulos.forEach((art, i) => {
                    doc.font('Helvetica').text(art, { align: 'justify', lineGap: 4 });
                    doc.moveDown(0.5);
                });

                // Firma Glass-Style
                doc.moveDown(4);
                const startY = doc.y;
                doc.lineCap('round')
                    .moveTo(200, startY)
                    .lineTo(400, startY)
                    .stroke('#CBD5E1');

                doc.moveDown(1);
                doc.fontSize(10).font('Helvetica-Bold')
                    .text(usuario.nombres.toUpperCase(), { align: 'center' })
                    .font('Helvetica').text('Comisario(a) de Familia', { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Genera el documento de valoración de riesgo
     */
    async generarValoracionRiesgo(expediente, victima, valoracion, usuario) {
        const fileName = `Valoracion_Riesgo_${expediente.radicado}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Encabezado
                this._agregarEncabezado(doc, 'INSTRUMENTO DE VALORACIÓN DE RIESGO');
                this._agregarSubtitulo(doc, 'Violencia Intrafamiliar y de Género');

                doc.fontSize(10).font('Helvetica')
                    .text(`Radicado: ${expediente.radicado}`, { align: 'right' })
                    .text(`Fecha: ${this._formatearFecha(new Date())}`, { align: 'right' });
                doc.moveDown(2);

                // Datos de la víctima (resumido)
                doc.fontSize(11).font('Helvetica-Bold').text('DATOS DE LA VÍCTIMA');
                doc.fontSize(10).font('Helvetica')
                    .text(`Nombre: ${victima.primer_nombre} ${victima.primer_apellido}`)
                    .text(`Documento: ${victima.tipo_documento} ${victima.numero_documento}`);
                doc.moveDown(1);

                // Resultado del riesgo
                const riskColors = {
                    'bajo': '#22c55e',
                    'medio': '#f59e0b',
                    'alto': '#f97316',
                    'extremo': '#dc2626'
                };

                doc.fontSize(14).font('Helvetica-Bold')
                    .text('RESULTADO DE LA VALORACIÓN', { align: 'center' });
                doc.moveDown(0.5);

                doc.fontSize(36).font('Helvetica-Bold')
                    .fillColor(riskColors[valoracion.nivel_riesgo] || '#000')
                    .text(`${valoracion.puntaje_total} PUNTOS`, { align: 'center' });
                doc.fontSize(24)
                    .text(`RIESGO ${valoracion.nivel_riesgo.toUpperCase()}`, { align: 'center' });
                doc.fillColor('#000');
                doc.moveDown(1);

                // Desglose por secciones
                doc.fontSize(11).font('Helvetica-Bold').text('DESGLOSE POR SECCIONES:');
                doc.moveDown(0.5);

                const secciones = [
                    { nombre: 'Violencia Psicológica', puntaje: valoracion.puntaje_seccion_1, max: 8 },
                    { nombre: 'Violencia Económica', puntaje: valoracion.puntaje_seccion_2, max: 8 },
                    { nombre: 'Amenazas y Coerción', puntaje: valoracion.puntaje_seccion_3, max: 60 },
                    { nombre: 'Violencia Física', puntaje: valoracion.puntaje_seccion_4, max: 160 },
                    { nombre: 'Violencia Sexual', puntaje: valoracion.puntaje_seccion_5, max: 100 },
                    { nombre: 'Circunstancias Agravantes', puntaje: valoracion.puntaje_seccion_6, max: 100 },
                    { nombre: 'Percepción de Muerte', puntaje: valoracion.puntaje_seccion_7, max: 140 },
                ];

                secciones.forEach(sec => {
                    doc.fontSize(10).font('Helvetica')
                        .text(`• ${sec.nombre}: ${sec.puntaje || 0} / ${sec.max} puntos`);
                });

                doc.addPage();

                // Recomendaciones según nivel de riesgo
                this._agregarSeccion(doc, 'RECOMENDACIONES');
                const recomendaciones = this._getRecomendaciones(valoracion.nivel_riesgo);
                recomendaciones.forEach(rec => {
                    doc.fontSize(10).font('Helvetica')
                        .text(`• ${rec}`, { lineGap: 3 });
                });

                // Firma de la víctima (espacio)
                doc.moveDown(3);
                if (valoracion.firma_digital_victima) {
                    doc.text('Firma de la Víctima:', { align: 'center' });
                    // Aquí se insertaría la imagen de la firma
                    doc.text('[Firma Digital Registrada]', { align: 'center' });
                } else {
                    doc.text('_'.repeat(50), { align: 'center' })
                        .text('Firma de la Víctima', { align: 'center' });
                }

                doc.moveDown(2);
                doc.fontSize(9).font('Helvetica')
                    .text('_'.repeat(50), { align: 'center' })
                    .text(`${usuario.nombres} ${usuario.apellidos}`, { align: 'center' })
                    .text('Funcionario que aplica el instrumento', { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    logger.info(`PDF valoración generado: ${fileName}`);
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                logger.error('Error generando valoración de riesgo:', error);
                reject(error);
            }
        });
    }

    /**
     * Genera oficio de medidas de protección
     */
    async generarMedidasProteccion(expediente, victima, agresor, medidas, usuario) {
        const fileName = `Medidas_Proteccion_${expediente.radicado}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Encabezado
                this._agregarEncabezado(doc, 'RESOLUCIÓN DE MEDIDAS DE PROTECCIÓN');

                doc.fontSize(10).font('Helvetica')
                    .text(`Radicado: ${expediente.radicado}`, { align: 'right' })
                    .text(`Fecha: ${this._formatearFecha(new Date())}`, { align: 'right' });
                doc.moveDown(2);

                // Partes
                doc.fontSize(11).font('Helvetica-Bold').text('PARTES:');
                doc.fontSize(10).font('Helvetica')
                    .text(`VÍCTIMA: ${victima.primer_nombre} ${victima.primer_apellido}, identificado(a) con ${victima.tipo_documento} No. ${victima.numero_documento}`)
                    .text(`AGRESOR: ${agresor.primer_nombre} ${agresor.primer_apellido}, identificado(a) con ${agresor.tipo_documento} No. ${agresor.numero_documento || 'Por establecer'}`);
                doc.moveDown(1);

                // Antecedentes
                doc.fontSize(11).font('Helvetica-Bold').text('ANTECEDENTES:');
                doc.fontSize(10).font('Helvetica')
                    .text(`El día ${this._formatearFecha(expediente.fecha_radicacion)} se radicó ante esta Comisaría de Familia denuncia por presuntos hechos de violencia intrafamiliar.`, { align: 'justify' });
                doc.moveDown(0.5);
                doc.text(`Realizada la valoración del riesgo, se determinó un nivel de riesgo ${expediente.nivel_riesgo.toUpperCase()} con un puntaje de ${expediente.puntaje_riesgo} puntos.`, { align: 'justify' });
                doc.moveDown(1);

                // Consideraciones legales
                doc.fontSize(11).font('Helvetica-Bold').text('CONSIDERACIONES:');
                doc.fontSize(10).font('Helvetica')
                    .text('Que conforme al artículo 16 de la Ley 1257 de 2008, en concordancia con la Ley 294 de 1996 modificada por la Ley 575 de 2000, las Comisarías de Familia podrán imponer medidas de protección.', { align: 'justify' })
                    .moveDown(0.5)
                    .text('Que de acuerdo con la valoración del riesgo realizada y las circunstancias del caso, se hace necesario adoptar medidas de protección inmediatas.', { align: 'justify' });
                doc.moveDown(1);

                // Resuelve
                doc.fontSize(11).font('Helvetica-Bold').text('RESUELVE:');
                doc.moveDown(0.5);

                const medidasDefault = [
                    'ORDENAR al señor(a) agresor(a) abstenerse de realizar cualquier acto de violencia física, verbal, psicológica, sexual, económica o patrimonial contra la víctima.',
                    'PROHIBIR al agresor(a) acercarse a la víctima, a su lugar de residencia, trabajo o estudio, a una distancia no inferior a 200 metros.',
                    'PROHIBIR al agresor(a) comunicarse con la víctima por cualquier medio (llamadas, mensajes, redes sociales, terceras personas).',
                    'ORDENAR a la Policía Nacional brindar protección a la víctima y realizar rondas de vigilancia en su lugar de residencia.',
                    'ADVERTIR al agresor(a) que el incumplimiento de estas medidas acarreará las sanciones previstas en el artículo 21 de la Ley 294 de 1996.'
                ];

                const medidasAplicar = medidas || medidasDefault;
                medidasAplicar.forEach((medida, index) => {
                    doc.fontSize(10).font('Helvetica')
                        .text(`ARTÍCULO ${index + 1}°. ${medida}`, { align: 'justify', lineGap: 3 });
                    doc.moveDown(0.5);
                });

                // Notificación
                doc.addPage();
                doc.fontSize(11).font('Helvetica-Bold').text('NOTIFÍQUESE Y CÚMPLASE');
                doc.moveDown(2);

                // Firma del comisario
                doc.fontSize(10).font('Helvetica')
                    .text('_'.repeat(50), { align: 'center' })
                    .text(`${usuario.nombres} ${usuario.apellidos}`, { align: 'center' })
                    .text('COMISARIO(A) DE FAMILIA', { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    logger.info(`PDF medidas de protección generado: ${fileName}`);
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                logger.error('Error generando medidas de protección:', error);
                reject(error);
            }
        });
    }

    /**
     * Genera oficio para Policía Nacional
     */
    async generarOficioPolicia(expediente, victima, agresor, usuario) {
        const fileName = `Oficio_Policia_${expediente.radicado}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Encabezado
                this._agregarEncabezado(doc, 'OFICIO');

                const fecha = this._formatearFecha(new Date());
                doc.fontSize(10).font('Helvetica')
                    .text(`Radicado: ${expediente.radicado}`, { align: 'right' })
                    .text(`Fecha: ${fecha}`, { align: 'right' });
                doc.moveDown(2);

                // Destinatario
                doc.fontSize(11).font('Helvetica-Bold')
                    .text('SEÑOR(A)')
                    .text('COMANDANTE DE ESTACIÓN DE POLICÍA');
                doc.fontSize(10).font('Helvetica')
                    .text('Jurisdicción correspondiente')
                    .text('Ciudad');
                doc.moveDown(1);

                // Asunto
                doc.fontSize(10).font('Helvetica-Bold')
                    .text(`Asunto: Solicitud de protección - Radicado ${expediente.radicado}`);
                doc.moveDown(1);

                // Cuerpo
                doc.fontSize(10).font('Helvetica')
                    .text('Respetado(a) Comandante,', { align: 'justify' })
                    .moveDown(0.5)
                    .text(`En ejercicio de las funciones conferidas por la Ley 1257 de 2008 y la Ley 294 de 1996, me permito informarle que en esta Comisaría de Familia se adelanta proceso por violencia intrafamiliar identificado con el radicado de la referencia.`, { align: 'justify' })
                    .moveDown(0.5)
                    .text(`Mediante valoración del riesgo se determinó que la víctima presenta un nivel de riesgo ${expediente.nivel_riesgo.toUpperCase()}, por lo cual solicito comedidamente:`, { align: 'justify' });

                doc.moveDown(1);

                // Solicitudes
                const solicitudes = [
                    'Realizar rondas de vigilancia periódicas en el lugar de residencia de la víctima.',
                    'Brindar acompañamiento policial cuando la víctima lo requiera.',
                    'Hacer efectivas las medidas de protección ordenadas por esta Comisaría.',
                    'Informar a esta dependencia cualquier novedad relacionada con el caso.'
                ];

                solicitudes.forEach((sol, i) => {
                    doc.text(`${i + 1}. ${sol}`, { align: 'justify' });
                });

                doc.moveDown(1);

                // Datos de la víctima
                doc.fontSize(10).font('Helvetica-Bold').text('DATOS DE LA VÍCTIMA:');
                doc.fontSize(10).font('Helvetica')
                    .text(`Nombre: ${victima.primer_nombre} ${victima.primer_apellido}`)
                    .text(`Documento: ${victima.tipo_documento} ${victima.numero_documento}`)
                    .text(`Dirección: ${victima.direccion || 'Verificar en sistema'}`)
                    .text(`Teléfono: ${victima.telefono_celular || 'N/A'}`);

                doc.moveDown(1);

                // Datos del agresor
                doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL PRESUNTO AGRESOR:');
                doc.fontSize(10).font('Helvetica')
                    .text(`Nombre: ${agresor.primer_nombre} ${agresor.primer_apellido}`)
                    .text(`Documento: ${agresor.tipo_documento} ${agresor.numero_documento || 'Por establecer'}`);

                doc.moveDown(2);

                doc.text('Agradezco su atención y colaboración.', { align: 'justify' });
                doc.moveDown(0.5);
                doc.text('Atentamente,');

                // Firma
                doc.moveDown(2);
                doc.text('_'.repeat(50), { align: 'left' })
                    .text(`${usuario.nombres} ${usuario.apellidos}`, { align: 'left' })
                    .text('COMISARIO(A) DE FAMILIA', { align: 'left' });

                doc.end();

                stream.on('finish', () => {
                    logger.info(`Oficio policía generado: ${fileName}`);
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                logger.error('Error generando oficio policía:', error);
                reject(error);
            }
        });
    }

    /**
     * Genera oficio para sector salud
     */
    async generarOficioSalud(expediente, victima, usuario) {
        const fileName = `Oficio_Salud_${expediente.radicado}.pdf`;
        const filePath = path.join(this.outputDir, fileName);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 60, right: 60 }
                });

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                this._agregarEncabezado(doc, 'OFICIO');

                doc.fontSize(10).font('Helvetica')
                    .text(`Radicado: ${expediente.radicado}`, { align: 'right' })
                    .text(`Fecha: ${this._formatearFecha(new Date())}`, { align: 'right' });
                doc.moveDown(2);

                doc.fontSize(11).font('Helvetica-Bold')
                    .text('SEÑOR(A)')
                    .text('GERENTE / DIRECTOR(A)');
                doc.fontSize(10).font('Helvetica')
                    .text(`EPS / IPS: ${victima.eps || '[Nombre de la entidad]'}`)
                    .text('Ciudad');
                doc.moveDown(1);

                doc.fontSize(10).font('Helvetica-Bold')
                    .text(`Asunto: Solicitud de atención integral en salud - Víctima de violencia`);
                doc.moveDown(1);

                doc.fontSize(10).font('Helvetica')
                    .text('Respetado(a) Doctor(a),', { align: 'justify' })
                    .moveDown(0.5)
                    .text(`De manera atenta me permito solicitar se brinde atención integral en salud a la señora ${victima.primer_nombre} ${victima.primer_apellido}, identificada con ${victima.tipo_documento} No. ${victima.numero_documento}, quien es víctima de violencia intrafamiliar según el proceso que se adelanta en esta Comisaría de Familia.`, { align: 'justify' })
                    .moveDown(0.5)
                    .text('Conforme a la Ley 1257 de 2008 y la Resolución 459 de 2012 del Ministerio de Salud, solicito:', { align: 'justify' });

                doc.moveDown(1);

                const servicios = [
                    'Valoración médica general y especializada según requiera.',
                    'Atención psicológica y/o psiquiátrica.',
                    'Exámenes y procedimientos necesarios para la atención.',
                    'Expedición de incapacidades si aplica.',
                    'Remisión a trabajo social para activación de rutas de atención.'
                ];

                servicios.forEach((serv, i) => {
                    doc.text(`${i + 1}. ${serv}`, { align: 'justify' });
                });

                doc.moveDown(1);
                doc.text('Adjunto copia del formato de recepción del caso para su conocimiento.', { align: 'justify' });
                doc.moveDown(0.5);
                doc.text('Atentamente,');

                doc.moveDown(2);
                doc.text('_'.repeat(50), { align: 'left' })
                    .text(`${usuario.nombres} ${usuario.apellidos}`, { align: 'left' })
                    .text('COMISARIO(A) DE FAMILIA', { align: 'left' });

                doc.end();

                stream.on('finish', () => {
                    logger.info(`Oficio salud generado: ${fileName}`);
                    resolve({ fileName, filePath });
                });

                stream.on('error', reject);
            } catch (error) {
                logger.error('Error generando oficio salud:', error);
                reject(error);
            }
        });
    }

    // ==================== MÉTODOS AUXILIARES ====================

    _agregarEncabezado(doc, titulo) {
        doc.fontSize(10).font('Helvetica')
            .text('REPÚBLICA DE COLOMBIA', { align: 'center' })
            .text('ALCALDÍA MUNICIPAL', { align: 'center' })
            .text('COMISARÍA DE FAMILIA', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(14).font('Helvetica-Bold')
            .text(titulo, { align: 'center' });
        doc.moveDown(1);
    }

    _agregarSubtitulo(doc, subtitulo) {
        doc.fontSize(11).font('Helvetica')
            .text(subtitulo, { align: 'center' });
        doc.moveDown(0.5);
    }

    _agregarSeccion(doc, titulo) {
        doc.moveDown(1);
        doc.fontSize(11).font('Helvetica-Bold')
            .text(titulo);
        doc.moveDown(0.5);
    }

    _agregarCamposDatos(doc, campos) {
        campos.forEach(campo => {
            doc.fontSize(10).font('Helvetica-Bold')
                .text(`${campo.label}: `, { continued: true })
                .font('Helvetica')
                .text(campo.value || 'No registrado');
        });
        doc.moveDown(1);
    }

    _formatearFecha(fecha) {
        try {
            const date = new Date(fecha);
            return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
        } catch {
            return fecha;
        }
    }

    _getSexoLabel(sexo) {
        const labels = { 'M': 'Masculino', 'F': 'Femenino', 'I': 'Intersexual' };
        return labels[sexo] || 'No especificado';
    }

    _getRecomendaciones(nivelRiesgo) {
        const recomendaciones = {
            bajo: [
                'Orientación y asesoría legal sobre derechos y rutas de atención.',
                'Información sobre líneas de atención (155, 141).',
                'Seguimiento preventivo en 30 días.',
                'Remisión a programas de convivencia familiar si aplica.'
            ],
            medio: [
                'Medidas de protección de atención.',
                'Remisión a servicio de psicología.',
                'Plan de seguridad personalizado con la víctima.',
                'Seguimiento cada 15 días.',
                'Notificación a Policía Nacional para rondas de vigilancia.'
            ],
            alto: [
                'MEDIDAS DE PROTECCIÓN URGENTES.',
                'Remisión inmediata a Fiscalía General de la Nación.',
                'Activación de redes de apoyo institucionales.',
                'Notificación a Policía Nacional 24/7.',
                'Seguimiento semanal.',
                'Considerar reubicación temporal si es necesario.'
            ],
            extremo: [
                'MEDIDAS DE PROTECCIÓN INMEDIATAS (24 horas).',
                'Remisión URGENTE a Fiscalía - Unidad de Vida.',
                'Notificación inmediata a Policía Nacional.',
                'Evaluación de reubicación/albergue temporal.',
                'Activación de protocolo de emergencia municipal.',
                'Seguimiento diario.',
                'Considerar custodia policial permanente.'
            ]
        };
        return recomendaciones[nivelRiesgo] || recomendaciones.bajo;
    }
}

module.exports = new PDFGeneratorService();
