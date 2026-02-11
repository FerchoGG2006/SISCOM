import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import './StepValoracion.css'

// 52 preguntas del instrumento técnico del Ministerio de Justicia
const PREGUNTAS = {
    seccion1: {
        titulo: 'Violencia Psicológica',
        puntaje: 1,
        color: '#3b82f6',
        preguntas: [
            { id: 'item_01', texto: '¿La insulta, humilla o menosprecia?' },
            { id: 'item_02', texto: '¿Le grita o usa un tono amenazante?' },
            { id: 'item_03', texto: '¿Hace críticas constantes a su apariencia, forma de ser o actuar?' },
            { id: 'item_04', texto: '¿La intimida con gestos, miradas o gritos?' },
            { id: 'item_05', texto: '¿La aísla de su familia y/o amigos?' },
            { id: 'item_06', texto: '¿Tiene celos excesivos o la acusa de infidelidad?' },
            { id: 'item_07', texto: '¿Controla sus movimientos, actividades o relaciones sociales?' },
            { id: 'item_08', texto: '¿Destruye objetos de valor sentimental o personal?' },
        ]
    },
    seccion2: {
        titulo: 'Violencia Económica y Patrimonial',
        puntaje: 1,
        color: '#8b5cf6',
        preguntas: [
            { id: 'item_09', texto: '¿Controla todo el dinero del hogar?' },
            { id: 'item_10', texto: '¿Le niega recursos para necesidades básicas (alimentación, salud, educación)?' },
            { id: 'item_11', texto: '¿Le impide trabajar o estudiar?' },
            { id: 'item_12', texto: '¿Le quita su dinero o sus ingresos?' },
            { id: 'item_13', texto: '¿Oculta bienes o patrimonio común?' },
            { id: 'item_14', texto: '¿Destruye o retiene sus documentos de identidad?' },
            { id: 'item_15', texto: '¿Ha adquirido deudas a su nombre sin consentimiento?' },
            { id: 'item_16', texto: '¿Amenaza con despojarla de la vivienda o echarla a la calle?' },
        ]
    },
    seccion3: {
        titulo: 'Amenazas y Coerción',
        puntaje: 10,
        color: '#f59e0b',
        preguntas: [
            { id: 'item_17', texto: '¿La ha amenazado con matarla?', critico: true },
            { id: 'item_18', texto: '¿La ha amenazado con dañar o matar a sus hijos?' },
            { id: 'item_19', texto: '¿La ha amenazado con dañar a su familia?' },
            { id: 'item_20', texto: '¿Amenaza con suicidarse si ella lo deja?' },
            { id: 'item_21', texto: '¿La persigue, vigila o acosa constantemente?' },
            { id: 'item_22', texto: '¿Amenaza con quitarle los hijos?' },
        ]
    },
    seccion4: {
        titulo: 'Violencia Física',
        puntaje: 20,
        color: '#ef4444',
        preguntas: [
            { id: 'item_23', texto: '¿La ha empujado, zarandeado o sacudido?' },
            { id: 'item_24', texto: '¿Le ha dado cachetadas o golpes en la cara?' },
            { id: 'item_25', texto: '¿Le ha dado puños, patadas o golpes fuertes?' },
            { id: 'item_26', texto: '¿Ha intentado estrangularla o asfixiarla?', critico: true },
            { id: 'item_27', texto: '¿Le ha causado quemaduras intencionalmente?' },
            { id: 'item_28', texto: '¿La ha agredido con arma blanca (cuchillo, machete, etc.)?' },
            { id: 'item_29', texto: '¿La ha agredido o amenazado con arma de fuego?', critico: true },
            { id: 'item_30', texto: '¿La ha golpeado estando embarazada?' },
        ]
    },
    seccion5: {
        titulo: 'Violencia Sexual',
        puntaje: 20,
        color: '#dc2626',
        preguntas: [
            { id: 'item_31', texto: '¿La ha obligado a tener relaciones sexuales sin su consentimiento?', critico: true },
            { id: 'item_32', texto: '¿La ha obligado a realizar actos sexuales que ella no desea?' },
            { id: 'item_33', texto: '¿Ha hecho grabaciones o fotos íntimas sin su consentimiento?' },
            { id: 'item_34', texto: '¿La ha obligado o presionado a prostituirse?' },
            { id: 'item_35', texto: '¿Ha ejercido violencia sexual hacia los hijos?', critico: true },
        ]
    },
    seccion6: {
        titulo: 'Circunstancias Agravantes',
        puntaje: 10,
        color: '#f97316',
        preguntas: [
            { id: 'item_36', texto: '¿Tiene antecedentes de violencia con otras parejas?' },
            { id: 'item_37', texto: '¿Ha incumplido medidas de protección anteriores?' },
            { id: 'item_38', texto: '¿Tiene consumo problemático de alcohol?' },
            { id: 'item_39', texto: '¿Consume sustancias psicoactivas?' },
            { id: 'item_40', texto: '¿Tiene acceso a armas de fuego?', critico: true },
            { id: 'item_41', texto: '¿Presenta trastorno mental sin tratamiento?' },
            { id: 'item_42', texto: '¿La violencia ha incrementado recientemente (frecuencia o intensidad)?' },
            { id: 'item_43', texto: '¿Hay separación reciente o anunciada?' },
            { id: 'item_44', texto: '¿La víctima está embarazada actualmente?' },
            { id: 'item_45', texto: '¿Hay niños que presencian la violencia?' },
        ]
    },
    seccion7: {
        titulo: 'Percepción de Muerte y Letalidad',
        puntaje: 20,
        color: '#7f1d1d',
        preguntas: [
            { id: 'item_46', texto: '¿Usted cree que él es capaz de matarla?', critico: true },
            { id: 'item_47', texto: '¿Tiene miedo por su vida?' },
            { id: 'item_48', texto: '¿Ha sufrido violencia extrema recientemente?' },
            { id: 'item_49', texto: '¿Ha habido algún intento de homicidio?', critico: true },
            { id: 'item_50', texto: '¿La ha amenazado con matarla si denuncia?' },
            { id: 'item_51', texto: '¿La vigila constantemente (en persona, redes sociales, etc.)?' },
            { id: 'item_52', texto: '¿No cuenta con red de apoyo familiar o social?' },
        ]
    }
}

export default function StepValoracion({ data, onUpdate, onCalculate, riskResult }) {
    const [localData, setLocalData] = useState(data || {})
    const [activeSection, setActiveSection] = useState('seccion1')

    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(localData).length > 0) {
                onCalculate(localData)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [localData])

    const handleChange = (id, value) => {
        const newData = { ...localData, [id]: value }
        setLocalData(newData)
        onUpdate(newData)
    }

    const getRiskColor = (nivel) => {
        const colors = {
            bajo: '#10B981',
            medio: '#F59E0B',
            alto: '#F97316',
            extremo: '#EF4444'
        }
        return colors[nivel] || '#64748B'
    }

    const countAnswered = (seccion) => {
        const preguntas = PREGUNTAS[seccion].preguntas
        return preguntas.filter(p => localData[p.id] !== undefined).length
    }

    const countPositive = (seccion) => {
        const preguntas = PREGUNTAS[seccion].preguntas
        return preguntas.filter(p => localData[p.id] === true).length
    }

    return (
        <div className="step-valoracion">
            <div className="valoracion-header">
                <div className="valoracion-title">
                    <Shield size={32} color="var(--primary)" />
                    <div>
                        <h3>Instrumento de Valoración de Riesgo</h3>
                        <p>Instrumento Técnico del Ministerio de Justicia (Instrumento de 52 ítems)</p>
                    </div>
                </div>

                {riskResult && (
                    <div className="risk-panel" style={{ '--risk-color': getRiskColor(riskResult.nivelRiesgo) }}>
                        <div className="risk-score">
                            <span className="score-value">{riskResult.puntajeTotal}</span>
                            <span className="score-label">pts</span>
                        </div>
                        <div className="risk-level">
                            <span className={`risk-badge ${riskResult.nivelRiesgo?.toLowerCase()}`}>
                                {riskResult.nivelRiesgo?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="valoracion-content">
                <div className="section-nav">
                    {Object.entries(PREGUNTAS).map(([key, seccion]) => (
                        <button
                            key={key}
                            className={`section-btn ${activeSection === key ? 'active' : ''}`}
                            onClick={() => setActiveSection(key)}
                            style={{ '--section-color': seccion.color }}
                        >
                            <div className="section-info">
                                <span className="section-name">{seccion.titulo}</span>
                                <span className="section-meta">
                                    {countAnswered(key)}/{seccion.preguntas.length} completado •
                                    <span style={{ color: countPositive(key) > 0 ? 'var(--danger)' : 'inherit', fontWeight: 700 }}> {countPositive(key)} SÍ</span>
                                </span>
                            </div>
                            <span className="section-points">{seccion.puntaje}pt</span>
                        </button>
                    ))}
                </div>

                <div className="questions-panel">
                    <div className="section-header" style={{ background: PREGUNTAS[activeSection].color }}>
                        <h4>{PREGUNTAS[activeSection].titulo}</h4>
                        <span className="points-badge">
                            + {PREGUNTAS[activeSection].puntaje} pts por cada "SÍ"
                        </span>
                    </div>

                    <div className="questions-list">
                        {PREGUNTAS[activeSection].preguntas.map((pregunta, index) => (
                            <div
                                key={pregunta.id}
                                className={`question-item ${pregunta.critico ? 'critico' : ''} ${localData[pregunta.id] === true ? 'answered-yes' : ''}`}
                            >
                                <div className="question-number">{index + 1}</div>
                                <div className="question-text">
                                    {pregunta.texto}
                                    {pregunta.critico && (
                                        <span className="critico-badge">
                                            <AlertTriangle size={12} /> Crítico
                                        </span>
                                    )}
                                </div>
                                <div className="question-options">
                                    <button
                                        className={`option-btn no ${localData[pregunta.id] === false ? 'selected' : ''}`}
                                        onClick={() => handleChange(pregunta.id, false)}
                                    >
                                        NO
                                    </button>
                                    <button
                                        className={`option-btn yes ${localData[pregunta.id] === true ? 'selected' : ''}`}
                                        onClick={() => handleChange(pregunta.id, true)}
                                    >
                                        SÍ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {riskResult?.alertasEspeciales?.length > 0 && (
                <div className="alertas-criticas">
                    <h4><AlertTriangle size={20} /> ALERTA: Factores de Letalidad Detectados</h4>
                    <div className="alertas-list">
                        {riskResult.alertasEspeciales.map((alerta, i) => (
                            <div key={i} className="alerta-item">
                                <span className="alerta-tipo">{alerta.tipo}</span>
                                <span className="alerta-mensaje">{alerta.mensaje}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

