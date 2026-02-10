import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import StepVictima from '../components/steps/StepVictima'
import StepAgresor from '../components/steps/StepAgresor'
import StepHechos from '../components/steps/StepHechos'
import StepValoracion from '../components/steps/StepValoracion'
import StepFirma from '../components/steps/StepFirma'
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
    Loader
} from 'lucide-react'
import './RadicarCaso.css'

const STEPS = [
    { id: 1, label: 'Datos Víctima', icon: User },
    { id: 2, label: 'Datos Agresor', icon: UserX },
    { id: 3, label: 'Hechos', icon: FileText },
    { id: 4, label: 'Valoración Riesgo', icon: Shield },
    { id: 5, label: 'Firma', icon: PenTool },
]

export default function RadicarCaso() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        victima: {},
        agresor: {},
        datosHecho: {},
        valoracionRiesgo: {},
        firma: null
    })
    const [riskResult, setRiskResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    const navigate = useNavigate()

    const updateFormData = (section, data) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }))
    }

    const calculateRisk = async (answers) => {
        try {
            const response = await api.post('/valoracion/calcular', answers)
            setRiskResult(response.data.data)
            return response.data.data
        } catch (error) {
            console.error('Error calculando riesgo:', error)
        }
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
            // Transform answers object to ordered array for backend
            const riskAnswers = Array.from({ length: 52 }, (_, i) => {
                const key = `item_${String(i + 1).padStart(2, '0')}`
                return formData.valoracionRiesgo[key] || false
            })

            const payload = {
                victima: formData.victima,
                agresor: formData.agresor,
                datosHecho: formData.datosHecho,
                respuestas_riesgo: riskAnswers,
                firma: formData.firma?.firma, // Base64 string
                usuario_id: 1 // Default user for MVP
            }


            // Post to new endpoint (client baseURL includes /api/v1)
            const response = await api.post('/radicar', payload)

            if (response.data.success) {
                setSuccess({
                    radicado: response.data.data.radicado,
                    nivelRiesgo: response.data.data.riskResult.level.toLowerCase(),
                    puntajeRiesgo: response.data.data.riskResult.score,
                    expedienteId: response.data.data.expediente.id,
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
            case 1:
                return (
                    <StepVictima
                        data={formData.victima}
                        onUpdate={(data) => updateFormData('victima', data)}
                    />
                )
            case 2:
                return (
                    <StepAgresor
                        data={formData.agresor}
                        onUpdate={(data) => updateFormData('agresor', data)}
                    />
                )
            case 3:
                return (
                    <StepHechos
                        data={formData.datosHecho}
                        onUpdate={(data) => updateFormData('datosHecho', data)}
                    />
                )
            case 4:
                return (
                    <StepValoracion
                        data={formData.valoracionRiesgo}
                        onUpdate={(data) => updateFormData('valoracionRiesgo', data)}
                        onCalculate={calculateRisk}
                        riskResult={riskResult}
                    />
                )
            case 5:
                return (
                    <StepFirma
                        data={formData.firma}
                        onUpdate={(data) => updateFormData('firma', data)}
                        riskResult={riskResult}
                        formData={formData}
                    />
                )
            default:
                return null
        }
    }

    if (success) {
        return (
            <div className="radicar-success">
                <div className="success-card glass-card">
                    <div className="success-icon">
                        <Check size={48} />
                    </div>
                    <h2>¡Caso Radicado Exitosamente!</h2>
                    <p className="radicado-number">{success.radicado}</p>

                    <div className="success-details">
                        <div className="detail-item">
                            <span className="label">Nivel de Riesgo:</span>
                            <span className={`badge-risk ${success.nivelRiesgo}`}>
                                {success.nivelRiesgo.toUpperCase()}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Puntaje:</span>
                            <span className="value">{success.puntajeRiesgo} puntos</span>
                        </div>
                    </div>

                    {success.alertas?.length > 0 && (
                        <div className="success-alerts">
                            <h4><AlertTriangle size={18} /> Alertas Críticas</h4>
                            <ul>
                                {success.alertas.map((alerta, i) => (
                                    <li key={i}>{alerta.mensaje}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="success-actions">
                        <button
                            className="btn-premium btn-premium-primary"
                            onClick={() => navigate(`/expedientes/${success.expedienteId}`)}
                        >
                            Ver Expediente
                        </button>
                        <button
                            className="btn-premium"
                            style={{ background: 'var(--gray-100)', color: 'var(--text-main)', border: '1px solid var(--gray-200)' }}
                            onClick={() => window.location.reload()}
                        >
                            Radicar Otro Caso
                        </button>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="radicar-caso">
            <div className="radicar-header">
                <h1>Radicar Nuevo Caso</h1>
                <p>Complete el formulario de recepción para radicar un nuevo caso</p>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {STEPS.map((step, index) => {
                    const Icon = step.icon
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id

                    return (
                        <div
                            key={step.id}
                            className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        >
                            <div className="stepper-circle">
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
                            <span className="stepper-label">{step.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger animate-fade-in">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Step Content */}
            <div className="step-content">
                <div className="glass-card" style={{ padding: '30px' }}>
                    {renderStep()}
                </div>
            </div>

            {/* Navigation */}
            <div className="step-navigation">
                <button
                    className="btn-premium"
                    style={{ background: 'var(--gray-100)', color: 'var(--text-main)', border: '1px solid var(--gray-200)' }}
                    onClick={prevStep}
                    disabled={currentStep === 1}
                >

                    <ArrowLeft size={18} />
                    Anterior
                </button>

                {currentStep < STEPS.length ? (
                    <button
                        className="btn-premium btn-premium-primary"
                        onClick={nextStep}
                    >
                        Siguiente
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        className="btn-premium"
                        style={{ background: 'var(--success)', color: 'white' }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="spinner" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Radicar Caso
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
