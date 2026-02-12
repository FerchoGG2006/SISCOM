import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { PenTool, Trash2, Check, FileText, AlertTriangle, ShieldCheck } from 'lucide-react'
import './StepFirma.css'

export default function StepFirma({ data, onUpdate, riskResult, formData }) {
    const sigCanvas = useRef(null)
    const [firmado, setFirmado] = useState(false)

    // Ajustar tamaño del canvas al redimensionar
    const canvasProps = {
        className: 'firma-canvas',
        width: 600,
        height: 220
    }

    const limpiarFirma = () => {
        setFirmado(false)
        onUpdate({ firma: null })
        // Pequeño timeout para asegurar que el canvas se montó de nuevo
        setTimeout(() => {
            if (sigCanvas.current) sigCanvas.current.clear()
        }, 50)
    }

    const guardarFirma = () => {
        if (sigCanvas.current.isEmpty()) {
            return
        }

        const firmaBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
        setFirmado(true)
        onUpdate({
            firma: firmaBase64,
            fechaFirma: new Date().toISOString()
        })
    }

    const getRiskLabel = (nivel) => {
        const labels = {
            bajo: { text: 'RIESGO BAJO', desc: 'Situación de riesgo leve. Requiere seguimiento preventivo.', color: 'var(--success)' },
            medio: { text: 'RIESGO MEDIO', desc: 'Situación de alerta. Se recomiendan medidas de atención.', color: 'var(--warning)' },
            alto: { text: 'RIESGO ALTO', desc: 'Situación grave. Requiere medidas de protección urgentes.', color: 'var(--danger)' },
            extremo: { text: 'RIESGO EXTREMO', desc: 'Peligro inminente. Activación inmediata de ruta de protección.', color: 'var(--danger)' },
        }
        return labels[nivel] || labels.bajo
    }

    return (
        <div className="step-firma">

            {/* 1. Resumen del Caso y Riesgo */}
            <div className="resumen-caso">
                <h3><FileText size={24} className="text-primary" /> Resumen de la Valoración</h3>

                <div className="resumen-grid">
                    <div className="resumen-item">
                        <span className="label">Víctima</span>
                        <span className="value">
                            {formData.victima?.primer_nombre} {formData.victima?.primer_apellido}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Documento</span>
                        <span className="value">
                            {formData.victima?.tipo_documento} {formData.victima?.numero_documento}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Agresor Identificado</span>
                        <span className="value">
                            {formData.agresor?.primer_nombre ?
                                `${formData.agresor.primer_nombre} ${formData.agresor.primer_apellido}` :
                                'No identificado / Por determinar'}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Relación</span>
                        <span className="value">{formData.agresor?.parentesco_con_victima || 'No registrada'}</span>
                    </div>
                </div>

                {riskResult && (
                    <div className={`resultado-riesgo ${riskResult.nivelRiesgo}`}>
                        <div className="resultado-score">
                            <span className="score">{riskResult.puntajeTotal}</span>
                            <span className="label">PTS</span>
                        </div>
                        <div className="resultado-nivel">
                            <h4>{getRiskLabel(riskResult.nivelRiesgo).text}</h4>
                            <p>{getRiskLabel(riskResult.nivelRiesgo).desc}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Declaración Jurada */}
            <div className="declaracion">
                <h4>
                    <ShieldCheck size={20} color="var(--primary)" />
                    Declaración de Veracidad
                </h4>
                <p>
                    Bajo la gravedad de juramento, manifiesto que la información suministrada en este instrumento
                    de valoración de riesgo es veraz, completa y corresponde fielmente a mi situación actual.
                    Soy consciente de las implicaciones legales de suministrar información falsa ante autoridad competente.
                </p>
                <p>
                    Autorizo expresamente el tratamiento de mis datos personales y sensibles conforme a la Ley 1581 de 2012,
                    con la finalidad exclusiva de activar la ruta de protección y acceso a la justicia.
                </p>
            </div>

            {/* 3. Área de Firma Digital */}
            <div className="firma-container">
                <div className="firma-header">
                    <h4><PenTool size={20} /> Firma de la Víctima</h4>
                    {!firmado && (
                        <p className="firma-instrucciones">
                            Por favor, firme en el recuadro usando el mouse o su dedo (pantalla táctil).
                        </p>
                    )}
                </div>

                <div className={`firma-canvas-wrapper ${firmado ? 'firmado' : ''}`}>
                    {firmado ? (
                        <div className="firma-confirmada">
                            <Check size={48} strokeWidth={3} />
                            <p>Firma Digital Registrada</p>
                            <img src={data?.firma} alt="Firma de la víctima" className="firma-preview" />
                        </div>
                    ) : (
                        <>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="#1e293b"
                                canvasProps={canvasProps}
                                backgroundColor="rgba(255,255,255,0)"
                            />
                            <div className="firma-linea">
                                <span>Firme aquí</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Botones de Acción */}
                <div className="firma-actions">
                    {!firmado ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => sigCanvas.current.clear()}
                            >
                                <Trash2 size={18} />
                                Borrar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={guardarFirma}
                            >
                                <Check size={18} />
                                Confirmar Firma
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={limpiarFirma}
                        >
                            <PenTool size={18} />
                            Volver a Firmar
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Legal */}
            <div className="nota-confidencial">
                <p>
                    <strong>CONFIDENCIAL:</strong> Este documento y la información contenida están protegidos por reserva legal.
                    Cualquier divulgación no autorizada está prohibida bajo las sanciones de ley.
                </p>
            </div>
        </div>
    )
}
