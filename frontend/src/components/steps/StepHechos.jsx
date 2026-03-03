import React, { useState, useCallback, useEffect } from 'react'
import { FileText, Mic, MicOff, Loader2 } from 'lucide-react'
import AIAdvisor from '../ai/AIAdvisor'

const TIPOS_CASO = [
    { value: 'violencia_intrafamiliar', label: 'Violencia Intrafamiliar' },
    { value: 'violencia_genero', label: 'Violencia de Género' },
    { value: 'violencia_pareja', label: 'Violencia de Pareja' },
    { value: 'violencia_nna', label: 'Violencia contra NNA' },
    { value: 'violencia_adulto_mayor', label: 'Violencia contra Adulto Mayor' },
    { value: 'inasistencia_alimentaria', label: 'Inasistencia Alimentaria' },
    { value: 'otro', label: 'Otro' },
]

const SUBTIPOS = [
    { value: 'fisica', label: 'Física' },
    { value: 'psicologica', label: 'Psicológica' },
    { value: 'sexual', label: 'Sexual' },
    { value: 'economica', label: 'Económica' },
    { value: 'patrimonial', label: 'Patrimonial' },
    { value: 'negligencia', label: 'Negligencia' },
]

export default function StepHechos({ data, onUpdate }) {
    const [isListening, setIsListening] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        onUpdate({ [name]: type === 'checkbox' ? checked : value })
    }

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening]);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Su navegador no soporta el dictado por voz. Intente con Google Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-AR';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            const currentText = data.descripcion_hechos || '';
            const newText = currentText ? `${currentText} ${transcript}` : transcript;
            onUpdate({ descripcion_hechos: newText });
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        window._recognition = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (window._recognition) {
            window._recognition.stop();
            setIsListening(false);
        }
    };

    const handleSubtipoChange = (e) => {
        const { value, checked } = e.target
        const current = data.subtipo_violencia ? data.subtipo_violencia.split(',') : []

        if (checked) {
            current.push(value)
        } else {
            const index = current.indexOf(value)
            if (index > -1) current.splice(index, 1)
        }

        onUpdate({ subtipo_violencia: current.join(',') })
    }

    const isSubtipoChecked = (value) => {
        return data.subtipo_violencia?.split(',').includes(value) || false
    }

    return (
        <div className="step-hechos">
            <div className="form-section">
                <h3 className="form-section-title">
                    <FileText size={20} />
                    Clasificación del Caso
                </h3>

                <div className="form-row two-cols">
                    <div className="form-group">
                        <label className="form-label required">Tipo de Caso</label>
                        <select
                            name="tipo_caso"
                            className="form-select"
                            value={data.tipo_caso || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            {TIPOS_CASO.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Frecuencia de la Violencia</label>
                        <select
                            name="frecuencia_violencia"
                            className="form-select"
                            value={data.frecuencia_violencia || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            <option value="primera_vez">Primera vez</option>
                            <option value="ocasional">Ocasional</option>
                            <option value="frecuente">Frecuente</option>
                            <option value="diaria">Diaria</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Tipo(s) de Violencia</label>
                    <div className="checkbox-grid">
                        {SUBTIPOS.map(s => (
                            <label key={s.value} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    value={s.value}
                                    checked={isSubtipoChecked(s.value)}
                                    onChange={handleSubtipoChange}
                                />
                                <span>{s.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Detalles del Hecho</h3>

                <div className="form-row two-cols">
                    <div className="form-group">
                        <label className="form-label">Fecha de los Hechos</label>
                        <input
                            type="date"
                            name="fecha_hechos"
                            className="form-input"
                            value={data.fecha_hechos || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hora Aproximada</label>
                        <input
                            type="time"
                            name="hora_hechos"
                            className="form-input"
                            value={data.hora_hechos || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Lugar de los Hechos</label>
                    <input
                        type="text"
                        name="lugar_hechos"
                        className="form-input"
                        placeholder="Dirección o descripción del lugar"
                        value={data.lugar_hechos || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label className="form-label required" style={{ margin: 0 }}>Descripción de los Hechos</label>
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: '1px solid var(--gray-200)',
                                background: isListening ? '#FEE2E2' : 'white',
                                color: isListening ? '#DC2626' : 'var(--primary)',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isListening ? '0 0 10px rgba(220, 38, 38, 0.2)' : 'none'
                            }}
                        >
                            {isListening ? (
                                <>
                                    <div className="mic-pulse" />
                                    <MicOff size={16} />
                                    Grabando...
                                </>
                            ) : (
                                <>
                                    <Mic size={16} />
                                    Dictar con Voz
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        name="descripcion_hechos"
                        className="form-textarea"
                        rows="6"
                        placeholder="Relate detalladamente los hechos ocurridos..."
                        value={data.descripcion_hechos || ''}
                        onChange={handleChange}
                    />
                    <AIAdvisor text={data.descripcion_hechos} />
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Información Adicional</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="armas_involucradas"
                                checked={data.armas_involucradas || false}
                                onChange={handleChange}
                            />
                            <span>¿Hubo armas involucradas?</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="lesiones_visibles"
                                checked={data.lesiones_visibles || false}
                                onChange={handleChange}
                            />
                            <span>¿Hay lesiones visibles?</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="requiere_atencion_medica"
                                checked={data.requiere_atencion_medica || false}
                                onChange={handleChange}
                            />
                            <span>¿Requiere atención médica?</span>
                        </label>
                    </div>
                </div>

                {data.armas_involucradas && (
                    <div className="form-group">
                        <label className="form-label">Tipo de Arma</label>
                        <input
                            type="text"
                            name="tipo_arma"
                            className="form-input"
                            placeholder="Describa el tipo de arma"
                            value={data.tipo_arma || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {data.lesiones_visibles && (
                    <div className="form-group">
                        <label className="form-label">Descripción de Lesiones</label>
                        <textarea
                            name="descripcion_lesiones"
                            className="form-textarea"
                            rows="3"
                            placeholder="Describa las lesiones observadas..."
                            value={data.descripcion_lesiones || ''}
                            onChange={handleChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
