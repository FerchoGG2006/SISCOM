import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    User,
    UserX,
    FileText,
    Shield,
    Clock,
    Folder,
    Download,
    ExternalLink
} from 'lucide-react'
import './ExpedienteDetalle.css'

export default function ExpedienteDetalle() {
    const { id } = useParams()
    const [expediente, setExpediente] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('resumen')

    useEffect(() => {
        loadExpediente()
    }, [id])

    const loadExpediente = async () => {
        setLoading(true)
        // Datos de ejemplo
        setTimeout(() => {
            setExpediente({
                id: 1,
                radicado: 'HS-2026-00045',
                tipo_caso: 'violencia_intrafamiliar',
                estado: 'en_valoracion',
                nivel_riesgo: 'alto',
                puntaje_riesgo: 85,
                fecha_radicacion: '2026-02-04 10:30:00',
                descripcion_hechos: 'La víctima reporta agresiones físicas y psicológicas constantes por parte de su cónyuge...',
                carpeta_drive_url: 'https://drive.google.com/...',
                victima: {
                    nombre: 'María García López',
                    documento: 'CC 52.456.789',
                    edad: 34,
                    telefono: '300 123 4567',
                    direccion: 'Calle 45 # 12-34, Barrio Centro'
                },
                agresor: {
                    nombre: 'Juan Pérez Rodríguez',
                    documento: 'CC 79.123.456',
                    edad: 38,
                    parentesco: 'Esposo'
                },
                actuaciones: [
                    { id: 1, tipo: 'radicacion', descripcion: 'Radicación del caso', fecha: '2026-02-04 10:30', usuario: 'Admin Sistema' },
                    { id: 2, tipo: 'valoracion_riesgo', descripcion: 'Valoración de riesgo completada - Nivel ALTO', fecha: '2026-02-04 11:15', usuario: 'Admin Sistema' },
                ],
                documentos: [
                    { id: 1, tipo: 'formato_recepcion', nombre: 'Formato de Recepción.pdf', fecha: '2026-02-04' },
                    { id: 2, tipo: 'valoracion_riesgo', nombre: 'Valoración de Riesgo.pdf', fecha: '2026-02-04' },
                ]
            })
            setLoading(false)
        }, 500)
    }

    if (loading) {
        return <div className="loading">Cargando expediente...</div>
    }

    if (!expediente) {
        return <div className="not-found">Expediente no encontrado</div>
    }

    return (
        <div className="expediente-detalle">
            {/* Header */}
            <div className="detalle-header">
                <div className="header-left">
                    <Link to="/expedientes" className="back-link">
                        <ArrowLeft size={20} />
                        Volver
                    </Link>
                    <div className="expediente-info">
                        <h1>{expediente.radicado}</h1>
                        <div className="badges">
                            <span className={`estado-badge ${expediente.estado}`}>
                                {expediente.estado.replace('_', ' ')}
                            </span>
                            <span className={`risk-badge ${expediente.nivel_riesgo}`}>
                                Riesgo {expediente.nivel_riesgo} ({expediente.puntaje_riesgo} pts)
                            </span>
                        </div>
                    </div>
                </div>

                {expediente.carpeta_drive_url && (
                    <a
                        href={expediente.carpeta_drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                    >
                        <Folder size={18} />
                        Abrir en Drive
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'resumen' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resumen')}
                >
                    <FileText size={18} />
                    Resumen
                </button>
                <button
                    className={`tab ${activeTab === 'personas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personas')}
                >
                    <User size={18} />
                    Personas
                </button>
                <button
                    className={`tab ${activeTab === 'actuaciones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actuaciones')}
                >
                    <Clock size={18} />
                    Actuaciones
                </button>
                <button
                    className={`tab ${activeTab === 'documentos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documentos')}
                >
                    <Folder size={18} />
                    Documentos
                </button>
            </div>

            {/* Content */}
            <div className="tab-content">
                {activeTab === 'resumen' && (
                    <div className="resumen-tab">
                        <div className="info-grid">
                            <div className="info-card">
                                <h3>Información del Caso</h3>
                                <div className="info-row">
                                    <span className="label">Tipo de Caso:</span>
                                    <span className="value">{expediente.tipo_caso.replace('_', ' ')}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Fecha de Radicación:</span>
                                    <span className="value">{expediente.fecha_radicacion}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Estado Actual:</span>
                                    <span className="value">{expediente.estado.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="info-card riesgo">
                                <h3><Shield size={20} /> Valoración de Riesgo</h3>
                                <div className={`riesgo-display ${expediente.nivel_riesgo}`}>
                                    <span className="puntaje">{expediente.puntaje_riesgo}</span>
                                    <span className="nivel">{expediente.nivel_riesgo.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card full">
                            <h3>Descripción de los Hechos</h3>
                            <p>{expediente.descripcion_hechos}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'personas' && (
                    <div className="personas-tab">
                        <div className="persona-card victima">
                            <div className="persona-header">
                                <User size={24} />
                                <span>Víctima</span>
                            </div>
                            <div className="persona-body">
                                <h4>{expediente.victima.nombre}</h4>
                                <p>{expediente.victima.documento}</p>
                                <p>Edad: {expediente.victima.edad} años</p>
                                <p>Tel: {expediente.victima.telefono}</p>
                                <p>Dir: {expediente.victima.direccion}</p>
                            </div>
                        </div>

                        <div className="persona-card agresor">
                            <div className="persona-header">
                                <UserX size={24} />
                                <span>Agresor</span>
                            </div>
                            <div className="persona-body">
                                <h4>{expediente.agresor.nombre}</h4>
                                <p>{expediente.agresor.documento}</p>
                                <p>Edad: {expediente.agresor.edad} años</p>
                                <p>Parentesco: {expediente.agresor.parentesco}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'actuaciones' && (
                    <div className="actuaciones-tab">
                        <div className="timeline">
                            {expediente.actuaciones.map(act => (
                                <div key={act.id} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-date">{act.fecha}</span>
                                        <h4>{act.descripcion}</h4>
                                        <span className="timeline-usuario">{act.usuario}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'documentos' && (
                    <div className="documentos-tab">
                        {expediente.documentos.map(doc => (
                            <div key={doc.id} className="documento-item">
                                <FileText size={24} />
                                <div className="documento-info">
                                    <h4>{doc.nombre}</h4>
                                    <span>{doc.fecha}</span>
                                </div>
                                <button className="btn btn-secondary btn-sm">
                                    <Download size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
