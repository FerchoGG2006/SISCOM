import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import {
    Search,
    Filter,
    FileText,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import './Expedientes.css'

export default function Expedientes() {
    const [searchParams] = useSearchParams()
    const [expedientes, setExpedientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        estado: searchParams.get('estado') || '',
        nivel_riesgo: searchParams.get('riesgo') || '',
        busqueda: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    })

    useEffect(() => {
        loadExpedientes()
    }, [filters, pagination.page])

    const loadExpedientes = async () => {
        setLoading(true)
        try {
            // Datos de ejemplo mientras no hay backend conectado
            setExpedientes([
                { id: 1, radicado: 'HS-2026-00045', victima: 'María García López', agresor: 'Juan Pérez', tipo_caso: 'violencia_intrafamiliar', estado: 'en_valoracion', nivel_riesgo: 'alto', fecha_radicacion: '2026-02-04' },
                { id: 2, radicado: 'HS-2026-00044', victima: 'Ana Rodríguez M.', agresor: 'Carlos Gómez', tipo_caso: 'violencia_pareja', estado: 'medidas_proteccion', nivel_riesgo: 'extremo', fecha_radicacion: '2026-02-03' },
                { id: 3, radicado: 'HS-2026-00043', victima: 'Carmen López', agresor: 'Pedro Martínez', tipo_caso: 'violencia_genero', estado: 'seguimiento', nivel_riesgo: 'medio', fecha_radicacion: '2026-02-02' },
                { id: 4, radicado: 'HS-2026-00042', victima: 'Lucía Martínez', agresor: 'Andrés Silva', tipo_caso: 'violencia_intrafamiliar', estado: 'radicado', nivel_riesgo: 'bajo', fecha_radicacion: '2026-02-01' },
                { id: 5, radicado: 'HS-2026-00041', victima: 'Rosa Hernández', agresor: 'Miguel Torres', tipo_caso: 'violencia_pareja', estado: 'audiencia_programada', nivel_riesgo: 'alto', fecha_radicacion: '2026-01-31' },
            ])
            setPagination(prev => ({ ...prev, total: 45 }))
        } catch (error) {
            console.error('Error cargando expedientes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const getEstadoLabel = (estado) => {
        const labels = {
            'radicado': 'Radicado',
            'en_valoracion': 'En Valoración',
            'citacion_audiencia': 'Citación',
            'audiencia_programada': 'Audiencia',
            'medidas_proteccion': 'Medidas',
            'seguimiento': 'Seguimiento',
            'archivado': 'Archivado',
            'cerrado': 'Cerrado'
        }
        return labels[estado] || estado
    }

    const getTipoCasoLabel = (tipo) => {
        const labels = {
            'violencia_intrafamiliar': 'V. Intrafamiliar',
            'violencia_genero': 'V. de Género',
            'violencia_pareja': 'V. de Pareja',
            'violencia_nna': 'V. contra NNA',
        }
        return labels[tipo] || tipo
    }

    return (
        <div className="expedientes-page">
            <div className="page-header">
                <div>
                    <h1><FileText size={28} /> Expedientes</h1>
                    <p>Gestión de casos y expedientes radicados</p>
                </div>
                <Link to="/radicar" className="btn btn-primary">
                    + Radicar Nuevo
                </Link>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por radicado, nombre..."
                        name="busqueda"
                        value={filters.busqueda}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filters-group">
                    <input
                        type="date"
                        name="fechaInicio"
                        className="date-filter"
                        placeholder="Desde"
                        title="Fecha Inicio"
                    />
                    <input
                        type="date"
                        name="fechaFin"
                        className="date-filter"
                        placeholder="Hasta"
                        title="Fecha Fin"
                    />
                    <select
                        name="estado"
                        value={filters.estado}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos los estados</option>
                        <option value="radicado">Radicado</option>
                        <option value="en_valoracion">En Valoración</option>
                        <option value="audiencia_programada">Audiencia</option>
                        <option value="medidas_proteccion">Medidas</option>
                        <option value="seguimiento">Seguimiento</option>
                    </select>

                    <select
                        name="nivel_riesgo"
                        value={filters.nivel_riesgo}
                        onChange={handleFilterChange}
                    >
                        <option value="">Todos los riesgos</option>
                        <option value="bajo">Bajo</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                        <option value="extremo">Extremo</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Expedientes */}
            <div className="expedientes-table-wrapper">
                <table className="expedientes-table">
                    <thead>
                        <tr>
                            <th>Radicado</th>
                            <th>Víctima</th>
                            <th>Agresor</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Riesgo</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expedientes.map(exp => (
                            <tr key={exp.id}>
                                <td>
                                    <Link to={`/expedientes/${exp.id}`} className="radicado-link">
                                        {exp.radicado}
                                    </Link>
                                </td>
                                <td>{exp.victima}</td>
                                <td>{exp.agresor}</td>
                                <td>
                                    <span className="tipo-badge">{getTipoCasoLabel(exp.tipo_caso)}</span>
                                </td>
                                <td>
                                    <span className={`estado-badge ${exp.estado}`}>
                                        {getEstadoLabel(exp.estado)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`risk-badge ${exp.nivel_riesgo}`}>
                                        {exp.nivel_riesgo}
                                    </span>
                                </td>
                                <td>{exp.fecha_radicacion}</td>
                                <td>
                                    <Link
                                        to={`/expedientes/${exp.id}`}
                                        className="btn btn-sm btn-secondary"
                                        title="Ver Detalles del Expediente" // Tooltip added
                                    >
                                        <Eye size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="pagination">
                <span className="pagination-info">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </span>
                <div className="pagination-controls">
                    <button
                        className="btn btn-secondary btn-sm"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="page-number">{pagination.page}</span>
                    <button
                        className="btn btn-secondary btn-sm"
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
