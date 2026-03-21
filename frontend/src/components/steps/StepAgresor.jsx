import React, { useState } from 'react'
import { UserX, Search, Loader2, Check } from 'lucide-react'
import api from '../../services/api'
import { LISTA_BARRIOS, getComunaByBarrio } from '../../constants/geografia'

const PARENTESCOS = [
    { value: 'esposo', label: 'Esposo' },
    { value: 'companero_permanente', label: 'Compañero Permanente' },
    { value: 'exesposo', label: 'Ex Esposo' },
    { value: 'excompanero', label: 'Ex Compañero' },
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'hijo', label: 'Hijo(a)' },
    { value: 'hermano', label: 'Hermano(a)' },
    { value: 'abuelo', label: 'Abuelo(a)' },
    { value: 'tio', label: 'Tío(a)' },
    { value: 'primo', label: 'Primo(a)' },
    { value: 'suegro', label: 'Suegro(a)' },
    { value: 'cunado', label: 'Cuñado(a)' },
    { value: 'otro_familiar', label: 'Otro Familiar' },
    { value: 'sin_parentesco', label: 'Sin Parentesco' },
]

export default function StepAgresor({ data, onUpdate }) {
    const [searching, setSearching] = useState(false);
    const [found, setFound] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value

        onUpdate({ [name]: newValue })

        // Auto-llenado de comuna por barrio
        if (name === 'barrio') {
            const comunaMapped = getComunaByBarrio(value)
            if (comunaMapped) {
                onUpdate({
                    barrio: value,
                    comuna: comunaMapped
                })
            }
        }

        if (name === 'numero_documento') setFound(false);
    }

    const handleSearch = async () => {
        if (!data.numero_documento) return;
        setSearching(true);
        try {
            const res = await api.get(`/personas/buscar/${data.numero_documento}`);
            if (res.data.success) {
                const p = res.data.data;
                onUpdate({
                    tipo_documento: p.tipo_documento,
                    primer_nombre: p.primer_nombre,
                    segundo_nombre: p.segundo_nombre,
                    primer_apellido: p.primer_apellido,
                    segundo_apellido: p.segundo_apellido,
                    fecha_nacimiento: p.fecha_nacimiento?.split('T')[0],
                    sexo: p.sexo,
                    direccion: p.direccion,
                    barrio: p.barrio,
                    telefono_celular: p.telefono_celular,
                    ocupacion: p.ocupacion
                });
                setFound(true);
            }
        } catch (e) {
            console.log('Persona no encontrada o error');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="step-agresor">
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>
                        <UserX size={20} />
                        Datos del Presunto Agresor
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: found ? 'var(--success)' : 'var(--gray-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {found ? <><Check size={14} /> Usuario Registrado</> : 'Valide si ya existe en sistema'}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label required">Tipo de Documento</label>
                        <select
                            name="tipo_documento"
                            className="form-select"
                            value={data.tipo_documento || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PA">Pasaporte</option>
                            <option value="SIN_DOCUMENTO">Sin Documento / Desconocido</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Número de Documento</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                name="numero_documento"
                                className="form-input"
                                placeholder="Ingrese número (si se conoce)"
                                value={data.numero_documento || ''}
                                onChange={handleChange}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={searching || !data.numero_documento}
                                style={{
                                    padding: '0 12px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--gray-200)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {searching ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            className="form-input"
                            value={data.fecha_nacimiento || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label required">Primer Nombre</label>
                        <input
                            type="text"
                            name="primer_nombre"
                            className="form-input"
                            placeholder="Primer nombre"
                            value={data.primer_nombre || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Segundo Nombre</label>
                        <input
                            type="text"
                            name="segundo_nombre"
                            className="form-input"
                            placeholder="Segundo nombre"
                            value={data.segundo_nombre || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Primer Apellido</label>
                        <input
                            type="text"
                            name="primer_apellido"
                            className="form-input"
                            placeholder="Primer apellido"
                            value={data.primer_apellido || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Segundo Apellido</label>
                        <input
                            type="text"
                            name="segundo_apellido"
                            className="form-input"
                            placeholder="Segundo apellido"
                            value={data.segundo_apellido || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sexo</label>
                        <select
                            name="sexo"
                            className="form-select"
                            value={data.sexo || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Parentesco con la Víctima</label>
                        <select
                            name="parentesco_con_victima"
                            className="form-select"
                            value={data.parentesco_con_victima || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            {PARENTESCOS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Ubicación y Contacto</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Dirección Conocida</label>
                        <input
                            type="text"
                            name="direccion"
                            className="form-input"
                            placeholder="Dirección donde puede ser ubicado"
                            value={data.direccion || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Barrio</label>
                        <input
                            type="text"
                            name="barrio"
                            className="form-input"
                            placeholder="Barrio"
                            list="lista-barrios"
                            value={data.barrio || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Comuna</label>
                        <input
                            type="text"
                            name="comuna"
                            className="form-input"
                            placeholder="Comuna"
                            value={data.comuna || ''}
                            onChange={handleChange}
                            readOnly
                            style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input
                            type="tel"
                            name="telefono_celular"
                            className="form-input"
                            placeholder="Número de contacto"
                            value={data.telefono_celular || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row two-cols">
                    <div className="form-group">
                        <label className="form-label">Ocupación / Trabajo</label>
                        <input
                            type="text"
                            name="ocupacion"
                            className="form-input"
                            placeholder="A qué se dedica"
                            value={data.ocupacion || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Lugar de Trabajo</label>
                        <input
                            type="text"
                            name="lugar_trabajo"
                            className="form-input"
                            placeholder="Dirección o nombre del lugar de trabajo"
                            value={data.lugar_trabajo || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Información Relevante</h3>

                <div className="form-row" style={{ alignItems: 'flex-start' }}>
                    <BooleanToggle
                        label="¿Convive con la víctima?"
                        value={data.convivencia_actual}
                        onChange={(val) => onUpdate({ convivencia_actual: val })}
                    />
                    <BooleanToggle
                        label="¿Consumo de sustancias?"
                        value={data.consumo_sustancias}
                        onChange={(val) => onUpdate({ consumo_sustancias: val })}
                    />
                    <BooleanToggle
                        label="¿Antecedentes de violencia?"
                        value={data.antecedentes_violencia}
                        onChange={(val) => onUpdate({ antecedentes_violencia: val })}
                    />
                </div>
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

        <datalist id="lista-barrios">
            {LISTA_BARRIOS.map(barrio => (
                <option key={barrio} value={barrio} />
            ))}
        </datalist>
    </div>
)
