import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
    FileText,
    Users,
    AlertTriangle,
    TrendingUp,
    PlusCircle,
    Clock,
    Shield,
    ArrowRight
} from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalExpedientes: 0,
        casosAltoRiesgo: 0,
        casosPendientes: 0,
        casosHoy: 0
    })
    const [recentCases, setRecentCases] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterRisk, setFilterRisk] = useState(null) // New filter state

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            // Por ahora usamos datos de ejemplo
            setStats({
                totalExpedientes: 156,
                casosAltoRiesgo: 12,
                casosPendientes: 28,
                casosHoy: 5
            })

            setRecentCases([
                { id: 1, radicado: 'HS-2026-00045', victima: 'María García', estado: 'en_valoracion', riesgo: 'alto' },
                { id: 2, radicado: 'HS-2026-00044', victima: 'Ana Rodríguez', estado: 'medidas_proteccion', riesgo: 'extremo' },
                { id: 3, radicado: 'HS-2026-00043', victima: 'Carmen López', estado: 'seguimiento', riesgo: 'medio' },
                { id: 4, radicado: 'HS-2026-00042', victima: 'Lucía Martínez', estado: 'radicado', riesgo: 'bajo' },
                { id: 5, radicado: 'HS-2026-00041', victima: 'Sofía Vergara', estado: 'audiencia_programada', riesgo: 'alto' },
            ])
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            icon: FileText,
            label: 'Total Expedientes',
            value: stats.totalExpedientes,
            color: 'primary',
            trend: '+12%',
            filter: null // Reset filter
        },
        {
            icon: AlertTriangle,
            label: 'Riesgo Alto/Extremo',
            value: stats.casosAltoRiesgo,
            color: 'danger',
            urgent: true,
            filter: ['alto', 'extremo'] // Filter by high risk
        },
        {
            icon: Clock,
            label: 'Pendientes',
            value: stats.casosPendientes,
            color: 'warning',
            filter: 'pendiente' // Placeholder logic (requires data support)
        },
        {
            icon: TrendingUp,
            label: 'Casos Hoy',
            value: stats.casosHoy,
            color: 'success',
            filter: 'hoy'
        },
    ]

    const getRiskClass = (riesgo) => {
        return `risk-badge ${riesgo}`
    }

    const getEstadoLabel = (estado) => {
        const labels = {
            'radicado': 'Radicado',
            'en_valoracion': 'En Valoración',
            'medidas_proteccion': 'Med. Protección',
            'seguimiento': 'Seguimiento',
            'audiencia_programada': 'Audiencia'
        }
        return labels[estado] || estado
    }

    // Filter logic
    const filteredCases = recentCases.filter(caso => {
        if (!filterRisk) return true;
        if (Array.isArray(filterRisk)) return filterRisk.includes(caso.riesgo);
        if (filterRisk === 'hoy') return true; // Date logic needed
        if (filterRisk === 'pendiente') return ['radicado', 'en_valoracion'].includes(caso.estado);
        return true;
    })

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Panel de Control</h1>
                    <p>Bienvenido al Sistema de Gestión de Comisarías</p>
                </div>
                <Link to="/radicar" className="btn btn-primary">
                    <PlusCircle size={20} />
                    Radicar Nuevo Caso
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map(({ icon: Icon, label, value, color, trend, urgent, filter }) => (
                    <div
                        key={label}
                        className={`stat-card glass-card ${color} ${urgent ? 'urgent' : ''}`}
                        onClick={() => setFilterRisk(filter)}
                        title="Click para filtrar"
                    >
                        <div className="stat-icon">
                            <Icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{value}</span>
                            <span className="stat-label">{label}</span>
                        </div>
                        {trend && <span className="stat-trend">{trend}</span>}
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Recent Cases */}
                <div className="card glass-card recent-cases">
                    <div className="card-header">
                        <h3>
                            Casos Recientes
                            {filterRisk && <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginLeft: '10px' }}>(Filtrado)</span>}
                        </h3>
                        <Link to="/expedientes" className="view-all">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <table className="cases-table">
                            <thead>
                                <tr>
                                    <th>Radicado</th>
                                    <th>Víctima</th>
                                    <th>Estado</th>
                                    <th>Riesgo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCases.map(caso => (
                                    <tr key={caso.id}>
                                        <td>
                                            <Link to={`/expedientes/${caso.id}`} className="radicado-link">
                                                {caso.radicado}
                                            </Link>
                                        </td>
                                        <td>{caso.victima}</td>
                                        <td>
                                            <span className="estado-badge">{getEstadoLabel(caso.estado)}</span>
                                        </td>
                                        <td>
                                            <span className={`badge-risk ${caso.riesgo}`}>
                                                {caso.riesgo.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card glass-card quick-actions">
                    <div className="card-header">
                        <h3>Acciones Rápidas</h3>
                    </div>
                    <div className="card-body">
                        <div className="actions-list">
                            <Link to="/radicar" className="action-item">
                                <div className="action-icon primary">
                                    <PlusCircle size={20} />
                                </div>
                                <div className="action-content">
                                    <span className="action-title">Radicar Caso</span>
                                    <span className="action-desc">Nuevo expediente</span>
                                </div>
                            </Link>

                            <Link to="/expedientes?estado=pendiente" className="action-item">
                                <div className="action-icon warning">
                                    <Clock size={20} />
                                </div>
                                <div className="action-content">
                                    <span className="action-title">Casos Pendientes</span>
                                    <span className="action-desc">{stats.casosPendientes} por atender</span>
                                </div>
                            </Link>

                            <Link to="/expedientes?riesgo=alto" className="action-item">
                                <div className="action-icon danger">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="action-content">
                                    <span className="action-title">Riesgo Alto</span>
                                    <span className="action-desc">{stats.casosAltoRiesgo} casos críticos</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
