import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { PenTool, Trash2, Check, FileText } from 'lucide-react'
import './StepFirma.css'

export default function StepFirma({ data, onUpdate, riskResult, formData }) {
    const sigCanvas = useRef(null)
    const [firmado, setFirmado] = useState(false)

    const limpiarFirma = () => {
        sigCanvas.current.clear()
        setFirmado(false)
        onUpdate({ firma: null })
    }

    const guardarFirma = () => {
        if (sigCanvas.current.isEmpty()) {
            alert('Por favor, dibuje su firma antes de continuar')
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
            bajo: { text: 'RIESGO BAJO', desc: 'Requiere seguimiento preventivo' },
            medio: { text: 'RIESGO MEDIO', desc: 'Requiere medidas de atención' },
            alto: { text: 'RIESGO ALTO', desc: 'Requiere medidas urgentes' },
            extremo: { text: 'RIESGO EXTREMO', desc: 'Requiere medidas inmediatas' },
        }
        return labels[nivel] || labels.bajo
    }

    return (
        <div className="step-firma">
            {/* Resumen del Caso */}
            <div className="resumen-caso">
                <h3><FileText size={20} /> Resumen de la Valoración</h3>

                <div className="resumen-grid">
                    <div className="resumen-item">
                        <span className="label">Víctima:</span>
                        <span className="value">
                            {formData.victima?.primer_nombre} {formData.victima?.primer_apellido}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Documento:</span>
                        <span className="value">
                            {formData.victima?.tipo_documento} {formData.victima?.numero_documento}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Agresor:</span>
                        <span className="value">
                            {formData.agresor?.primer_nombre} {formData.agresor?.primer_apellido}
                        </span>
                    </div>
                    <div className="resumen-item">
                        <span className="label">Parentesco:</span>
                        <span className="value">{formData.agresor?.parentesco_con_victima}</span>
                    </div>
                </div>

                {riskResult && (
                    <div className={`resultado-riesgo ${riskResult.nivelRiesgo}`}>
                        <div className="resultado-score">
                            <span className="score">{riskResult.puntajeTotal}</span>
                            <span className="label">puntos</span>
                        </div>
                        <div className="resultado-nivel">
                            <h4>{getRiskLabel(riskResult.nivelRiesgo).text}</h4>
                            <p>{getRiskLabel(riskResult.nivelRiesgo).desc}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Declaración */}
            <div className="declaracion">
                <h4>Declaración de la Víctima</h4>
                <p>
                    Manifiesto que la información suministrada en este instrumento de valoración de riesgo
                    es veraz y que las respuestas corresponden a mi situación real. Autorizo el tratamiento
                    de mis datos personales conforme a la Ley 1581 de 2012 para los fines relacionados con
                    la protección de mis derechos.
                </p>
                <p>
                    Entiendo que este instrumento tiene como propósito evaluar el nivel de riesgo en mi
                    situación particular y que las medidas de protección serán determinadas por la autoridad
                    competente con base en esta valoración.
                </p>
            </div>

            {/* Área de Firma */}
            <div className="firma-container">
                <div className="firma-header">
                    <h4><PenTool size={18} /> Firma Digital de la Víctima</h4>
                    {!firmado && (
                        <p className="firma-instrucciones">
                            Utilice el mouse o su dedo (en dispositivos táctiles) para firmar en el recuadro
                        </p>
                    )}
                </div>

                <div className={`firma-canvas-wrapper ${firmado ? 'firmado' : ''}`}>
                    {firmado ? (
                        <div className="firma-confirmada">
                            <Check size={48} />
                            <p>Firma registrada correctamente</p>
                            <img src={data?.firma} alt="Firma" className="firma-preview" />
                        </div>
                    ) : (
                        <>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="#1e3a5f"
                                canvasProps={{
                                    className: 'firma-canvas',
                                    width: 600,
                                    height: 200
                                }}
                            />
                            <div className="firma-linea">
                                <span>Firma de la víctima</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="firma-actions">
                    {!firmado ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={limpiarFirma}
                            >
                                <Trash2 size={18} />
                                Limpiar
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

            {/* Nota de Confidencialidad */}
            <div className="nota-confidencial">
                <p>
                    <strong>Nota de Confidencialidad:</strong> Este documento contiene información sensible
                    y está protegido por la Ley de Habeas Data. Su uso indebido puede acarrear sanciones
                    legales.
                </p>
            </div>
        </div>
    )
}
