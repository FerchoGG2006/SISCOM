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
                    <label className="form-label" style={{ marginBottom: '15px' }}>Tipo(s) de Violencia</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                        {SUBTIPOS.map(s => (
                            <div key={s.value} style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: '15px', border: '1px solid var(--gray-100)' }}>
                                <BooleanToggle
                                    label={s.label}
                                    value={isSubtipoChecked(s.value)}
                                    onChange={(val) => {
                                        const current = data.subtipo_violencia ? data.subtipo_violencia.split(',') : []
                                        if (val) {
                                            if (!current.includes(s.value)) current.push(s.value)
                                        } else {
                                            const index = current.indexOf(s.value)
                                            if (index > -1) current.splice(index, 1)
                                        }
                                        onUpdate({ subtipo_violencia: current.join(',') })
                                    }}
                                />
                            </div>
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

                <div className="form-group" style={{ position: 'relative', marginTop: '35px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <label className="form-label required" style={{ margin: 0, fontWeight: 700 }}>
                            Descripción de los Hechos
                        </label>
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 18px',
                                borderRadius: '100px',
                                border: '2px solid',
                                borderColor: isListening ? '#DC2626' : 'var(--primary)',
                                background: isListening ? '#FEE2E2' : 'white',
                                color: isListening ? '#DC2626' : 'var(--primary)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isListening
                                    ? '0 4px 12px rgba(220, 38, 38, 0.2)'
                                    : '0 2px 8px rgba(0,0,0,0.05)',
                                transform: isListening ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            {isListening ? (
                                <>
                                    <div className="mic-pulse" style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                    <MicOff size={18} />
                                    Detener
                                </>
                            ) : (
                                <>
                                    <Mic size={18} />
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

                <div className="form-row" style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                    <BooleanToggle
                        label="¿Hubo armas?"
                        value={data.armas_involucradas}
                        onChange={(val) => onUpdate({ armas_involucradas: val })}
                    />
                    <BooleanToggle
                        label="¿Hay lesiones?"
                        value={data.lesiones_visibles}
                        onChange={(val) => onUpdate({ lesiones_visibles: val })}
                    />
                    <BooleanToggle
                        label="¿Requiere atención?"
                        value={data.requiere_atencion_medica}
                        onChange={(val) => onUpdate({ requiere_atencion_medica: val })}
                    />
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

const BooleanToggle = ({ label, value, onChange }) => (
    <div className="form-group" style={{ flex: 1 }}>
        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>{label}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                type="button"
                onClick={() => onChange(true)}
                style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: value === true ? '#10B981' : '#e5e7eb',
                    background: value === true ? '#10B981' : 'white',
                    color: value === true ? 'white' : '#10B981aa',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem'
                }}
            >
                SÍ
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: value === false ? '#EF4444' : '#e5e7eb',
                    background: value === false ? '#EF4444' : 'white',
                    color: value === false ? 'white' : '#EF4444aa',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem'
                }}
            >
                NO
            </button>
        </div>
    </div>
)
