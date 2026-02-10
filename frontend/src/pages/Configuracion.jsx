import { useState } from 'react'
import { Settings as SettingsIcon, Database, Bell, Shield, Save } from 'lucide-react'
import './Configuracion.css'

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState('general')
    const [config, setConfig] = useState({
        nombreEntidad: 'Comisaría de Familia',
        municipio: 'Municipio de Ejemplo',
        departamento: 'Departamento de Ejemplo',
        prefijoRadicado: 'HS',
        emailNotificaciones: true,
        notificarRiesgoAlto: true,
        umbralBajo: 16,
        umbralMedio: 50,
        umbralAlto: 150,
        driveActivo: true,
    })

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        alert('Configuración guardada')
    }

    return (
        <div className="configuracion-page">
            <div className="page-header">
                <div>
                    <h1><SettingsIcon size={28} /> Configuración</h1>
                    <p>Ajuste los parámetros del sistema</p>
                </div>
                <button className="btn-premium btn-premium-primary" style={{ padding: '0.8rem 1.5rem' }} onClick={handleSave}>
                    <Save size={18} /> Guardar
                </button>

            </div>

            <div className="config-layout">
                <div className="config-sidebar">
                    <button className={`config-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                        <SettingsIcon size={20} /> General
                    </button>
                    <button className={`config-tab ${activeTab === 'notificaciones' ? 'active' : ''}`} onClick={() => setActiveTab('notificaciones')}>
                        <Bell size={20} /> Notificaciones
                    </button>
                    <button className={`config-tab ${activeTab === 'riesgo' ? 'active' : ''}`} onClick={() => setActiveTab('riesgo')}>
                        <Shield size={20} /> Riesgo
                    </button>
                    <button className={`config-tab ${activeTab === 'integraciones' ? 'active' : ''}`} onClick={() => setActiveTab('integraciones')}>
                        <Database size={20} /> Integraciones
                    </button>
                </div>

                <div className="config-content">
                    {activeTab === 'general' && (
                        <div className="config-section">
                            <h2>Información de la Entidad</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-input" value={config.nombreEntidad} onChange={e => handleChange('nombreEntidad', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Municipio</label>
                                    <input type="text" className="form-input" value={config.municipio} onChange={e => handleChange('municipio', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Prefijo Radicado</label>
                                    <input type="text" className="form-input" value={config.prefijoRadicado} onChange={e => handleChange('prefijoRadicado', e.target.value)} maxLength={3} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notificaciones' && (
                        <div className="config-section">
                            <h2>Notificaciones</h2>
                            <div className="toggle-list">
                                <label className="toggle-item">
                                    <span>Email Notificaciones</span>
                                    <input type="checkbox" checked={config.emailNotificaciones} onChange={e => handleChange('emailNotificaciones', e.target.checked)} />
                                </label>
                                <label className="toggle-item">
                                    <span>Alertar Riesgo Alto</span>
                                    <input type="checkbox" checked={config.notificarRiesgoAlto} onChange={e => handleChange('notificarRiesgoAlto', e.target.checked)} />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'riesgo' && (
                        <div className="config-section">
                            <h2>Umbrales de Riesgo</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Umbral Bajo (0-X)</label>
                                    <input type="number" className="form-input" value={config.umbralBajo} onChange={e => handleChange('umbralBajo', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Umbral Medio</label>
                                    <input type="number" className="form-input" value={config.umbralMedio} onChange={e => handleChange('umbralMedio', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Umbral Alto</label>
                                    <input type="number" className="form-input" value={config.umbralAlto} onChange={e => handleChange('umbralAlto', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integraciones' && (
                        <div className="config-section">
                            <h2>Google Drive</h2>
                            <div className="integrations-info">
                                <div className="integrations-status">
                                    <div className={`status-dot ${config.driveActivo ? 'active' : ''}`}></div>
                                    <span>Estado: {config.driveActivo ? 'Conectado Corely' : 'Desconectado'}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                    La integración con Google Drive permite la creación automática de carpetas para cada caso y el almacenamiento seguro de los documentos generados.
                                </p>
                                <button className="btn-premium btn-premium-primary" style={{ padding: '0.8rem 1.5rem' }}>
                                    Probar Conexión
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
