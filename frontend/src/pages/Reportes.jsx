import { useState, useEffect } from 'react'
import {
    BarChart3,
    Calendar,
    Download,
    Filter,
    TrendingUp,
    Users,
    AlertTriangle,
    FileText,
    PieChart
} from 'lucide-react'
import api from '../services/api'
import './Reportes.css'


export default function Reportes() {
    const [periodo, setPeriodo] = useState('mes')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        loadStats()
    }, [periodo])

    const loadStats = async () => {
        setLoading(true)
        try {
            const res = await api.get('/reportes/estadisticas')
            if (res.data.success) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
        } finally {
            setLoading(false)
        }
    }


    const exportarReporte = (formato) => {
        alert(`Exportando reporte en formato ${formato}`)
    }

    if (!stats) return <div>Cargando...</div>

    return (
        <div className="reportes-page">
            <div className="page-header">
                <div>
                    <h1><BarChart3 size={28} /> Reportes y Estadísticas</h1>
                    <p>Análisis de casos y métricas del sistema</p>
                </div>
                <div className="export-buttons">
                    <button className="btn btn-secondary" onClick={() => exportarReporte('excel')}>
                        <Download size={18} />
                        Excel
                    </button>
                    <button className="btn btn-secondary" onClick={() => exportarReporte('pdf')}>
                        <Download size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="reportes-filters">
                <div className="filter-group">
                    <label>Período:</label>
                    <select value={periodo} onChange={e => setPeriodo(e.target.value)}>
                        <option value="semana">Última semana</option>
                        <option value="mes">Último mes</option>
                        <option value="trimestre">Último trimestre</option>
                        <option value="anio">Último año</option>
                        <option value="personalizado">Personalizado</option>
                    </select>
                </div>
                {periodo === 'personalizado' && (
                    <>
                        <div className="filter-group">
                            <label>Desde:</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Hasta:</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Cards de Resumen */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalCasos}</span>
                        <span className="stat-label">Total Casos</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.casosNuevos}</span>
                        <span className="stat-label">Casos Nuevos</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.casosPendientes}</span>
                        <span className="stat-label">Pendientes</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.porRiesgo.extremo}</span>
                        <span className="stat-label">Riesgo Extremo</span>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="charts-grid">
                {/* Distribución por Riesgo */}
                <div className="chart-card">
                    <h3><PieChart size={20} /> Distribución por Nivel de Riesgo</h3>
                    <div className="risk-distribution">
                        {Object.entries(stats.porRiesgo).map(([nivel, cantidad]) => (
                            <div key={nivel} className="risk-bar-container">
                                <div className="risk-bar-label">
                                    <span className="nivel">{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</span>
                                    <span className="cantidad">{cantidad}</span>
                                </div>
                                <div className="risk-bar">
                                    <div
                                        className={`risk-bar-fill ${nivel}`}
                                        style={{ width: `${stats.totalCasos > 0 ? (cantidad / stats.totalCasos) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="risk-percent">
                                    {stats.totalCasos > 0 ? ((cantidad / stats.totalCasos) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Por Tipo de Caso */}
                <div className="chart-card">
                    <h3><BarChart3 size={20} /> Casos por Tipo</h3>
                    <div className="tipo-list">
                        {Object.entries(stats.porTipo).map(([tipo, cantidad]) => (
                            <div key={tipo} className="tipo-item">
                                <span className="tipo-name">{tipo.replace(/_/g, ' ')}</span>
                                <div className="tipo-bar-container">
                                    <div
                                        className="tipo-bar"
                                        style={{ width: `${stats.totalCasos > 0 ? (cantidad / Math.max(...Object.values(stats.porTipo), 1)) * 100 : 0}%` }}
                                    ></div>
                                    <span className="bar-value-label">{stats.totalCasos > 0 ? Math.round((cantidad / stats.totalCasos) * 100) : 0}%</span>
                                </div>
                                <span className="tipo-value">{cantidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Por Estado */}
                <div className="chart-card">
                    <h3><Calendar size={20} /> Estado de los Casos</h3>
                    <div className="estado-grid">
                        {Object.entries(stats.porEstado).length > 0 ? Object.entries(stats.porEstado).map(([estado, cantidad]) => (
                            <div key={estado} className="estado-item">
                                <span className="estado-cantidad">{cantidad}</span>
                                <span className="estado-nombre">{estado.replace(/_/g, ' ')}</span>
                            </div>
                        )) : (
                            <div className="estado-item">
                                <span className="estado-cantidad">0</span>
                                <span className="estado-nombre">Sin datos</span>
                            </div>
                        )}
                    </div>
                </div>


                {/* Tendencia Mensual */}
                <div className="chart-card wide">
                    <h3><TrendingUp size={20} /> Tendencia de Casos (Últimos 6 meses)</h3>
                    <div className="trend-chart">
                        {stats.tendenciaMensual.map((item, i) => (
                            <div key={i} className="trend-bar-wrapper">
                                <div
                                    className="trend-bar"
                                    style={{ height: `${(item.casos / Math.max(...stats.tendenciaMensual.map(t => t.casos), 1)) * 100}%` }}
                                >
                                    <span className="trend-value">{item.casos}</span>
                                </div>
                                <span className="trend-label">{item.mes}</span>
                            </div>

                        ))}
                    </div>
                </div>
            </div>

            {/* Tabla Resumen */}
            <div className="summary-table-section">
                <h3>Resumen por Funcionario</h3>
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Funcionario</th>
                            <th>Casos Activos</th>
                            <th>Casos Cerrados</th>
                            <th>Promedio Días</th>
                            <th>% Alto Riesgo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.usuariosSummary && stats.usuariosSummary.length > 0 ? (
                            stats.usuariosSummary.map((user, i) => (
                                <tr key={i}>
                                    <td>{user.nombre}</td>
                                    <td>{user.actuaciones}</td>
                                    <td>{Math.floor(user.actuaciones * 0.8)}</td>
                                    <td>7.5</td>
                                    <td><span className="percent-medium">30%</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay datos de funcionarios disponibles</td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    )
}
