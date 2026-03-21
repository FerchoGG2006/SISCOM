import React, { useState } from 'react'
import { User, Search, Loader2, Check, MapPin, MapPinOff, Navigation } from 'lucide-react'
import api from '../../services/api'
import { LISTA_BARRIOS, getComunaByBarrio } from '../../constants/geografia'

const TIPOS_DOCUMENTO = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PA', label: 'Pasaporte' },
    { value: 'PEP', label: 'PEP' },
    { value: 'PPT', label: 'PPT' },
    { value: 'SIN_DOCUMENTO', label: 'Sin Documento' },
]

const ESCOLARIDAD = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'primaria_incompleta', label: 'Primaria Incompleta' },
    { value: 'primaria_completa', label: 'Primaria Completa' },
    { value: 'secundaria_incompleta', label: 'Secundaria Incompleta' },
    { value: 'secundaria_completa', label: 'Secundaria Completa' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'tecnologico', label: 'Tecnológico' },
    { value: 'universitario_incompleto', label: 'Universitario Incompleto' },
    { value: 'universitario_completo', label: 'Universitario Completo' },
    { value: 'posgrado', label: 'Posgrado' },
]

const ESTADO_CIVIL = [
    { value: 'soltero', label: 'Soltero(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'union_libre', label: 'Unión Libre' },
    { value: 'separado', label: 'Separado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viudo', label: 'Viudo(a)' },
]

export default function StepVictima({ data, onUpdate }) {
    const [searching, setSearching] = useState(false);
    const [found, setFound] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const newValue = type === 'checkbox' ? checked : value

        onUpdate({ [name]: newValue })

        // Auto-llenar comuna si se selecciona un barrio de la lista
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

    const [locating, setLocating] = useState(false);
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Su navegador no soporta geolocalización");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onUpdate({
                    latitud: pos.coords.latitude,
                    longitud: pos.coords.longitude
                });
                setLocating(false);
            },
            (err) => {
                console.error(err);
                setLocating(false);
                alert("No se pudo obtener la ubicación. Por favor permita el acceso.");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
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
                    estado_civil: p.estado_civil,
                    telefono_celular: p.telefono_celular,
                    telefono_fijo: p.telefono_fijo,
                    email: p.email,
                    direccion: p.direccion,
                    barrio: p.barrio,
                    comuna: p.comuna,
                    nivel_escolaridad: p.nivel_escolaridad,
                    ocupacion: p.ocupacion,
                    estrato: p.estrato,
                    numero_hijos: p.numero_hijos,
                    hijos_menores_edad: p.hijos_menores_edad,
                    mujer_gestante: p.mujer_gestante
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
        <div className="step-victima">
            <div className="form-section form-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>
                        <User size={20} />
                        Datos de Identificación
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
                            {TIPOS_DOCUMENTO.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Número de Documento</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                name="numero_documento"
                                className="form-input"
                                placeholder="Ingrese número"
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
                        <label className="form-label required">Fecha de Nacimiento</label>
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
                        <label className="form-label required">Sexo</label>
                        <select
                            name="sexo"
                            className="form-select"
                            value={data.sexo || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            <option value="F">Femenino</option>
                            <option value="M">Masculino</option>
                            <option value="I">Intersexual</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estado Civil</label>
                        <select
                            name="estado_civil"
                            className="form-select"
                            value={data.estado_civil || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            {ESTADO_CIVIL.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-section form-section-card">
                <h3 className="form-section-title">Datos de Contacto</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Teléfono Celular</label>
                        <input
                            type="tel"
                            name="telefono_celular"
                            className="form-input"
                            placeholder="300 123 4567"
                            value={data.telefono_celular || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Teléfono Fijo</label>
                        <input
                            type="tel"
                            name="telefono_fijo"
                            className="form-input"
                            placeholder="(601) 123 4567"
                            value={data.telefono_fijo || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="correo@ejemplo.com"
                            value={data.email || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group" style={{ flex: '2' }}>
                        <label className="form-label">Dirección de Residencia</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                name="direccion"
                                className="form-input"
                                placeholder="Calle/Carrera # - #"
                                value={data.direccion || ''}
                                onChange={handleChange}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={locating}
                                title="Capturar ubicación GPS actual"
                                style={{
                                    padding: '0 12px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--gray-200)',
                                    background: locating ? 'var(--gray-100)' : 'white',
                                    color: locating ? 'var(--gray-400)' : 'var(--primary)',
                                    cursor: locating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                {locating ? <Loader2 size={18} className="spinner" /> : (data.latitud ? <MapPin size={18} color="#10B981" /> : <MapPin size={18} />)}
                            </button>
                        </div>
                        {data.latitud && (
                            <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Navigation size={10} /> GPS capturado: {data.latitud.toFixed(4)}, {data.longitud.toFixed(4)}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Barrio</label>
                        <input
                            type="text"
                            name="barrio"
                            className="form-input"
                            placeholder="Nombre del barrio"
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
                </div>

                <datalist id="lista-barrios">
                    {LISTA_BARRIOS.map(barrio => (
                        <option key={barrio} value={barrio} />
                    ))}
                </datalist>
            </div>

            <div className="form-section form-section-card">
                <h3 className="form-section-title">Datos Socioeconómicos</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Nivel de Escolaridad</label>
                        <select
                            name="nivel_escolaridad"
                            className="form-select"
                            value={data.nivel_escolaridad || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            {ESCOLARIDAD.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ocupación</label>
                        <input
                            type="text"
                            name="ocupacion"
                            className="form-input"
                            placeholder="Ocupación actual"
                            value={data.ocupacion || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estrato</label>
                        <select
                            name="estrato"
                            className="form-select"
                            value={data.estrato || ''}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione...</option>
                            {[0, 1, 2, 3, 4, 5, 6].map(e => (
                                <option key={e} value={e}>Estrato {e}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Número de Hijos</label>
                        <input
                            type="number"
                            name="numero_hijos"
                            className="form-input"
                            min="0"
                            value={data.numero_hijos || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hijos Menores de Edad</label>
                        <input
                            type="number"
                            name="hijos_menores_edad"
                            className="form-input"
                            min="0"
                            value={data.hijos_menores_edad || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <BooleanToggle
                        label="¿Está en embarazo?"
                        value={data.mujer_gestante}
                        onChange={(val) => onUpdate({ mujer_gestante: val })}
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
    </div>
)
