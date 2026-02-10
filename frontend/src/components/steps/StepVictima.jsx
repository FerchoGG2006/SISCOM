import { User } from 'lucide-react'

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
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        onUpdate({ [name]: type === 'checkbox' ? checked : value })
    }

    return (
        <div className="step-victima">
            <div className="form-section form-section-card">
                <h3 className="form-section-title">
                    <User size={20} />
                    Datos de Identificación
                </h3>

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
                        <input
                            type="text"
                            name="numero_documento"
                            className="form-input"
                            placeholder="Ingrese número"
                            value={data.numero_documento || ''}
                            onChange={handleChange}
                        />
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
                    <div className="form-group">
                        <label className="form-label">Dirección de Residencia</label>
                        <input
                            type="text"
                            name="direccion"
                            className="form-input"
                            placeholder="Calle/Carrera # - #"
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
                            placeholder="Nombre del barrio"
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
                        />
                    </div>
                </div>
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

                    <div className="form-group">
                        <label className="form-label">&nbsp;</label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="mujer_gestante"
                                checked={data.mujer_gestante || false}
                                onChange={handleChange}
                            />
                            <span>¿Está en embarazo?</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
