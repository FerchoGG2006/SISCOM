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
    ExternalLink,
    Plus,
    X
} from 'lucide-react'
import './ExpedienteDetalle.css'

import api from '../services/api'

export default function ExpedienteDetalle() {
    const { id } = useParams()
    const [expediente, setExpediente] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('resumen')

    // UI State
    const [showModal, setShowModal] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [newActuacion, setNewActuacion] = useState({
        tipo: 'Seguimiento',
        descripcion: '',
        nuevoEstado: ''
    })

    useEffect(() => {
        loadExpediente()
    }, [id])

    const addActuacion = async () => {
        if (!newActuacion.descripcion) return;
        setGenerating(true)
        try {
            await api.post(`/expedientes/${id}/actuaciones`, newActuacion)
            setShowModal(false)
            setNewActuacion({ tipo: 'Seguimiento', descripcion: '', nuevoEstado: '' })
            loadExpediente() // Reload timeline
        } catch (error) {
            console.error('Error adding actuacion:', error)
        } finally {
            setGenerating(false)
        }
    }

    const generateDoc = async (tipo) => {
        setGenerating(true)
        try {
            const response = await api.post(`/expedientes/${id}/documentos/${tipo}`)
            if (response.data.success) {
                alert('Documento generado y guardado exitosamente.')
                loadExpediente() // Reload docs and timeline
            }
        } catch (error) {
            console.error('Error generating doc:', error)
            alert('Error al generar el documento.')
        } finally {
            setGenerating(false)
        }
    }


    const loadExpediente = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/expedientes/${id}`)
            if (response.data.success) {
                const data = response.data.data
                // Map Prisma structure to legacy state structure for compatibility
                setExpediente({
                    id: data.id,
                    radicado: data.radicado_hs,
                    tipo_caso: 'Violencia Familiar', // Based on logic or data
                    estado: 'Radicado',
                    nivel_riesgo: data.nivel_riesgo,
                    puntaje_riesgo: data.puntaje_riesgo,
                    fecha_radicacion: new Date(data.fecha_radicacion).toLocaleString(),
                    descripcion_hechos: data.relato_hechos,
                    carpeta_drive_url: data.drive_folder_id ? `https://drive.google.com/drive/folders/${data.drive_folder_id}` : null,
                    victima: {
                        nombre: `${data.victima.nombres} ${data.victima.apellidos}`,
                        documento: `${data.victima.tipo_documento} ${data.victima.numero_documento}`,
                        edad: 'N/A', // Update if ages added
                        telefono: data.victima.telefono,
                        direccion: data.victima.direccion
                    },
                    agresor: data.agresor ? {
                        nombre: `${data.agresor.nombres} ${data.agresor.apellidos}`,
                        documento: `${data.agresor.tipo_documento} ${data.agresor.numero_documento}`,
                        edad: 'N/A'
                    } : null,
                    actuaciones: data.actuaciones.map(a => ({
                        id: a.id,
                        tipo: a.tipo,
                        descripcion: a.descripcion,
                        fecha: new Date(a.fecha).toLocaleString(),
                        usuario: `${a.usuario.nombres} ${a.usuario.apellidos}`
                    })),
                    documentos: data.documentos.map(d => ({
                        id: d.id,
                        tipo: d.tipo,
                        nombre: d.nombre,
                        fecha: new Date(d.generado_el).toLocaleDateString(),
                        url: d.url_drive
                    }))
                })
            }
        } catch (error) {
            console.error('Error loading expediente:', error)
        } finally {
            setLoading(false)
        }
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
                                    <span className="label" style={{ color: 'var(--text-main)', fontWeight: 700 }}>Tipo de Caso:</span>
                                    <span className="value" style={{ fontWeight: 800 }}>{expediente.tipo_caso.replace('_', ' ')}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label" style={{ color: 'var(--text-main)', fontWeight: 700 }}>Fecha de Radicación:</span>
                                    <span className="value" style={{ fontWeight: 800 }}>{expediente.fecha_radicacion}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label" style={{ color: 'var(--text-main)', fontWeight: 700 }}>Estado Actual:</span>
                                    <span className="value" style={{ fontWeight: 800 }}>{expediente.estado.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="info-card riesgo">
                                <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}><Shield size={20} /> Valoración de Riesgo</h3>
                                <div className={`riesgo-display ${expediente.nivel_riesgo}`}>
                                    <span className="puntaje">{expediente.puntaje_riesgo}</span>
                                    <span className="nivel" style={{ fontWeight: 900 }}>{expediente.nivel_riesgo.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card full">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Acciones Rápidas</h3>
                            </div>
                            <div className="doc-actions-grid">
                                <button className="btn-doc" onClick={() => generateDoc('oficio-policia')} disabled={generating} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    <Shield size={20} color="var(--primary)" /> Oficio Policía
                                </button>
                                <button className="btn-doc" onClick={() => generateDoc('oficio-salud')} disabled={generating} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    <Clock size={20} color="var(--primary)" /> Remisión Salud
                                </button>
                                <button className="btn-doc" onClick={() => generateDoc('medidas-proteccion')} disabled={generating} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    <FileText size={20} color="var(--primary)" /> Medidas Protección
                                </button>
                            </div>
                        </div>

                        <div className="info-card full" style={{ marginTop: '20px' }}>
                            <h3 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Descripción de los Hechos</h3>
                            <p style={{ color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.6 }}>{expediente.descripcion_hechos}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'personas' && (
                    <div className="personas-tab">
                        <div className="persona-card victima">
                            <div className="persona-header" style={{ fontWeight: 800 }}>
                                <User size={24} />
                                <span>Víctima</span>
                            </div>
                            <div className="persona-body">
                                <h4 style={{ color: 'var(--text-main)', fontWeight: 800 }}>{expediente.victima.nombre}</h4>
                                <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{expediente.victima.documento}</p>
                                <p><strong>Edad:</strong> {expediente.victima.edad} años</p>
                                <p><strong>Tel:</strong> {expediente.victima.telefono}</p>
                                <p><strong>Dir:</strong> {expediente.victima.direccion}</p>
                            </div>
                        </div>

                        <div className="persona-card agresor">
                            <div className="persona-header" style={{ fontWeight: 800 }}>
                                <UserX size={24} />
                                <span>Agresor</span>
                            </div>
                            <div className="persona-body">
                                <h4 style={{ color: 'var(--text-main)', fontWeight: 800 }}>{expediente.agresor.nombre}</h4>
                                <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{expediente.agresor.documento}</p>
                                <p><strong>Edad:</strong> {expediente.agresor.edad} años</p>
                                <p><strong>Parentesco:</strong> {expediente.agresor.parentesco}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'actuaciones' && (
                    <div className="actuaciones-tab">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>Línea de Tiempo</h3>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontWeight: 700 }}>
                                <Plus size={18} /> Nueva Actuación
                            </button>
                        </div>
                        <div className="timeline">
                            {expediente.actuaciones.map(act => (
                                <div key={act.id} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content" style={{ border: '1px solid var(--glass-border)' }}>
                                        <span className="timeline-date" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{act.fecha}</span>
                                        <h4 style={{ color: 'var(--primary)', fontWeight: 800, margin: '8px 0' }}>{act.tipo}</h4>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{act.descripcion}</p>
                                        <span className="timeline-usuario" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Responsable: {act.usuario}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'documentos' && (
                    <div className="documentos-tab">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Documentos del Expediente</h3>
                        </div>
                        {expediente.documentos.map(doc => (
                            <div key={doc.id} className="documento-item" style={{ background: 'white', border: '1px solid var(--gray-200)' }}>
                                <FileText size={24} />
                                <div className="documento-info">
                                    <h4>{doc.tipo.toUpperCase()}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{doc.nombre}</p>
                                    <span>Generado: {doc.fecha}</span>
                                </div>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    title="Descargar PDF"
                                    onClick={() => window.open(`http://localhost:4000/documentos/${doc.nombre}`, '_blank')}
                                >
                                    <Download size={16} />
                                </button>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Nueva Actuación */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Nueva Actuación</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Tipo de Actuación</label>
                            <select
                                value={newActuacion.tipo}
                                onChange={(e) => setNewActuacion({ ...newActuacion, tipo: e.target.value })}
                            >
                                <option value="Audiencia">Audiencia</option>
                                <option value="Visita Domiciliaria">Visita Domiciliaria</option>
                                <option value="Seguimiento">Seguimiento</option>
                                <option value="Notificación">Notificación</option>
                                <option value="Resolución">Resolución Final</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Nuevo Estado (Opcional)</label>
                            <select
                                value={newActuacion.nuevoEstado}
                                onChange={(e) => setNewActuacion({ ...newActuacion, nuevoEstado: e.target.value })}
                            >
                                <option value="">Mantener estado actual</option>
                                <option value="En Medidas">En Medidas de Protección</option>
                                <option value="En Seguimiento">En Seguimiento</option>
                                <option value="Cerrado">Cerrado</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Descripción detallada</label>
                            <textarea
                                rows="4"
                                placeholder="Escriba aquí los detalles de lo sucedido..."
                                value={newActuacion.descripcion}
                                onChange={(e) => setNewActuacion({ ...newActuacion, descripcion: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-full" onClick={addActuacion} disabled={generating}>
                                {generating ? 'Guardando...' : 'Guardar Actuación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

