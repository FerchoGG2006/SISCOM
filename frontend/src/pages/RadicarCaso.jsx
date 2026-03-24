import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import StepVictima from '../components/steps/StepVictima'
import StepAgresor from '../components/steps/StepAgresor'
import StepHechos from '../components/steps/StepHechos'
import StepValoracion from '../components/steps/StepValoracion'
import StepFirma from '../components/steps/StepFirma'
import StepEvidencia from '../components/steps/StepEvidencia'
import RiskThermometer from '../components/common/RiskThermometer'
import {
    User,
    UserX,
    FileText,
    Shield,
    PenTool,
    Check,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    Loader,
    Camera,
    Activity
} from 'lucide-react'
import './RadicarCaso.css'

const STEPS = [
    { id: 1, label: 'Datos Víctima', icon: User },
    { id: 2, label: 'Datos Agresor', icon: UserX },
    { id: 3, label: 'Hechos', icon: FileText },
    { id: 4, label: 'Evidencias', icon: Camera },
    { id: 5, label: 'Valoración Riesgo', icon: Shield },
    { id: 6, label: 'Firma', icon: PenTool },
]

export default function RadicarCaso() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        victima: {},
        agresor: {},
        datosHecho: {},
        evidencias: [],
        valoracionRiesgo: {},
        firma: null
    })
    const [riskResult, setRiskResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    const navigate = useNavigate()

    // Sync risk data when relevant fields change
    useEffect(() => {
        const syncRiskData = () => {
            const updates = {};

            // Victima mapping
            if (formData.victima?.mujer_gestante !== undefined) {
                updates.item_44 = formData.victima.mujer_gestante;
            }

            // Agresor mapping
            if (formData.agresor?.antecedentes_violencia !== undefined) {
                updates.item_36 = formData.agresor.antecedentes_violencia;
            }
            if (formData.agresor?.consumo_sustancias !== undefined) {
                updates.item_39 = formData.agresor.consumo_sustancias;
            }

            // Hechos mapping
            if (formData.datosHecho?.lesiones_visibles !== undefined) {
                updates.item_23 = formData.datosHecho.lesiones_visibles;
            }
            if (formData.datosHecho?.armas_involucradas !== undefined) {
                updates.item_40 = formData.datosHecho.armas_involucradas;
            }

            if (Object.keys(updates).length > 0) {
                const hasChanges = Object.keys(updates).some(key =>
                    formData.valoracionRiesgo[key] !== updates[key]
                );

                if (hasChanges) {
                    setFormData(prev => ({
                        ...prev,
                        valoracionRiesgo: { ...prev.valoracionRiesgo, ...updates }
                    }));
                }
            }
        };

        syncRiskData();
    }, [formData.victima, formData.agresor, formData.datosHecho]);

    // Recalculate risk automatically
    useEffect(() => {
        if (Object.keys(formData.valoracionRiesgo).length > 0) {
            calculateRisk(formData.valoracionRiesgo);
        }
    }, [formData.valoracionRiesgo]);

    const calculateRisk = async (answers) => {
        try {
            const response = await api.post('/radicar/valoracion/calcular', answers)
            setRiskResult(response.data.data)
            return response.data.data
        } catch (error) {
            console.error('Error calculando riesgo:', error)
        }
    }

    const updateFormData = (section, data) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }))
    }

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const riskAnswers = Array.from({ length: 52 }, (_, i) => {
                const key = `item_${String(i + 1).padStart(2, '0')}`
                return formData.valoracionRiesgo[key] || false
            })

            const payload = {
                victima: formData.victima,
                agresor: formData.agresor,
                datosHecho: formData.datosHecho,
                evidencias: formData.evidencias,
                respuestas_riesgo: riskAnswers,
                firma: formData.firma?.firma,
                metadata_biometrica: formData.firma?.metadata_biometrica,
                usuario_id: 1
            }

            const response = await api.post('/radicar', payload)

            if (response.data.success) {
                setSuccess({
                    radicado: response.data.data.radicado,
                    nivelRiesgo: response.data.data.riskResult?.nivelRiesgo?.toLowerCase() || 'bajo',
                    puntajeRiesgo: response.data.data.riskResult?.puntajeTotal || 0,
                    expedienteId: response.data.data.expediente.id,
                    pdfUrl: response.data.data.pdf_url,
                    pinConsultas: response.data.data.pinConsultas,
                    alertas: []
                })
            }
        } catch (err) {
            console.error('Error radicando:', err)
            setError(err.response?.data?.message || 'Error al radicar el caso')
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <StepVictima data={formData.victima} onUpdate={(data) => updateFormData('victima', data)} />
            case 2: return <StepAgresor data={formData.agresor} onUpdate={(data) => updateFormData('agresor', data)} />
            case 3: return <StepHechos data={formData.datosHecho} onUpdate={(data) => updateFormData('datosHecho', data)} />
            case 4: return <StepEvidencia data={formData} onUpdate={(data) => updateFormData('evidencias', data.evidencias)} />
            case 5: return <StepValoracion data={formData.valoracionRiesgo} onUpdate={(data) => updateFormData('valoracionRiesgo', data)} onCalculate={calculateRisk} riskResult={riskResult} />
            case 6: return <StepFirma data={formData.firma} onUpdate={(data) => updateFormData('firma', data)} riskResult={riskResult} formData={formData} />
            default: return null
        }
    }

    if (success) {
        return (
            <div className="radicar-success">
                <div className="success-card glass-card">
                    <div className="success-icon"><Check size={48} /></div>
                    <h2>¡Caso Radicado Exitosamente!</h2>
                    <p className="radicado-number">{success.radicado}</p>
                    <div className="success-details">
                        <div className="detail-item">
                            <span className="label">Nivel de Riesgo:</span>
                            <span className={`badge-risk ${success.nivelRiesgo}`}>{success.nivelRiesgo.toUpperCase()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Puntaje:</span>
                            <span className="value">{success.puntajeRiesgo} puntos</span>
                        </div>
                        {success.pinConsultas && (
                        <div className="detail-item" style={{ gridColumn: 'span 2', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed var(--primary)', borderRadius: '12px', padding: '15px', marginTop: '10px', textAlign: 'center' }}>
                            <span className="label" style={{ color: 'var(--primary)', marginBottom: '5px', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>PIN de Consulta Ciudadana (Entregar a Víctima)</span>
                            <span className="value" style={{ fontSize: '1.8rem', letterSpacing: '6px', fontWeight: 900, color: 'var(--text-main)' }}>{success.pinConsultas}</span>
                        </div>
                        )}
                    </div>
                    <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                            <button className="btn-premium btn-premium-primary" onClick={() => navigate(`/expedientes/${success.expedienteId}`)}>Ver Expediente</button>
                            <button className="btn-premium" style={{ background: 'var(--gray-100)', color: 'var(--text-main)', border: '1px solid var(--gray-200)' }} onClick={() => window.location.reload()}>Radicar Otro</button>
                        </div>
                        {success.pdfUrl && (
                            <button className="btn-premium" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', width: '100%', fontWeight: 700 }} onClick={() => window.open(success.pdfUrl, '_blank')}>
                                <FileText size={18} style={{ marginRight: '8px' }} /> Descargar Auto de Inicio (PDF)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="radicar-caso">
            <div className="radicar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h1>Radicar Nuevo Caso</h1>
                    <p>Complete el formulario de recepción para radicar un nuevo caso</p>
                </div>

                <div style={{
                    flex: '0 0 350px',
                    background: 'white',
                    padding: '15px 20px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    border: '1px solid var(--gray-100)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)' }}>Monitoreo de Severidad (En Vivo)</span>
                    </div>
                    <RiskThermometer score={riskResult?.puntajeTotal || 0} level={riskResult?.nivelRiesgo} compact={true} />
                </div>
            </div>

            <div className="stepper">
                {STEPS.map((step) => {
                    const Icon = step.icon
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id
                    return (
                        <div key={step.id} className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className="stepper-circle">{isCompleted ? <Check size={18} /> : <Icon size={18} />}</div>
                            <span className="stepper-label">{step.label}</span>
                        </div>
                    )
                })}
            </div>

            {error && <div className="alert alert-danger animate-fade-in"><AlertTriangle size={20} /><span>{error}</span></div>}

            <div className="step-content">
                <div className="glass-card" style={{ padding: '30px' }}>
                    {renderStep()}
                </div>
            </div>

            <div className="step-navigation">
                <button className="btn-premium" style={{ background: 'var(--gray-100)', color: 'var(--text-main)', border: '1px solid var(--gray-200)' }} onClick={prevStep} disabled={currentStep === 1}>
                    <ArrowLeft size={18} /> Anterior
                </button>

                {currentStep < STEPS.length ? (
                    <button className="btn-premium btn-premium-primary" onClick={nextStep}>Siguiente <ArrowRight size={18} /></button>
                ) : (
                    <button className="btn-premium" style={{ background: 'var(--success)', color: 'white' }} onClick={handleSubmit} disabled={loading}>
                        {loading ? <><Loader size={18} className="spinner" /> Procesando...</> : <><Check size={18} /> Radicar Caso</>}
                    </button>
                )}
            </div>
        </div>
    )
}
