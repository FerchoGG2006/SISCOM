import { UserX } from 'lucide-react'

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
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        onUpdate({ [name]: type === 'checkbox' ? checked : value })
    }

    return (
        <div className="step-agresor">
            <div className="form-section">
                <h3 className="form-section-title">
                    <UserX size={20} />
                    Datos del Presunto Agresor
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
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PA">Pasaporte</option>
                            <option value="SIN_DOCUMENTO">Sin Documento / Desconocido</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Número de Documento</label>
                        <input
                            type="text"
                            name="numero_documento"
                            className="form-input"
                            placeholder="Ingrese número (si se conoce)"
                            value={data.numero_documento || ''}
                            onChange={handleChange}
                        />
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
                            value={data.barrio || ''}
                            onChange={handleChange}
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

                <div className="form-row">
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="convivencia_actual"
                                checked={data.convivencia_actual || false}
                                onChange={handleChange}
                            />
                            <span>¿Convive actualmente con la víctima?</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="consumo_sustancias"
                                checked={data.consumo_sustancias || false}
                                onChange={handleChange}
                            />
                            <span>¿Consumo de alcohol o sustancias?</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="antecedentes_violencia"
                                checked={data.antecedentes_violencia || false}
                                onChange={handleChange}
                            />
                            <span>¿Antecedentes de violencia conocidos?</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
