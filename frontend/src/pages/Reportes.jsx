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
import './Reportes.css'

export default function Reportes() {
    const [periodo, setPeriodo] = useState('mes')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [stats, setStats] = useState(null)

    useEffect(() => {
        loadStats()
    }, [periodo])

    const loadStats = () => {
        // Datos de ejemplo
        setStats({
            totalCasos: 156,
            casosNuevos: 23,
            casosCerrados: 18,
            casosPendientes: 45,
            porRiesgo: {
                bajo: 45,
                medio: 52,
                alto: 38,
                extremo: 21
            },
            porTipo: {
                violencia_intrafamiliar: 78,
                violencia_pareja: 45,
                violencia_genero: 23,
                violencia_nna: 10
            },
            porEstado: {
                radicado: 25,
                en_valoracion: 30,
                medidas_proteccion: 42,
                seguimiento: 38,
                cerrado: 21
            },
            tendenciaMensual: [
                { mes: 'Sep', casos: 45 },
                { mes: 'Oct', casos: 52 },
                { mes: 'Nov', casos: 48 },
                { mes: 'Dic', casos: 61 },
                { mes: 'Ene', casos: 78 },
                { mes: 'Feb', casos: 56 }
            ]
        })
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
                                        style={{ width: `${(cantidad / stats.totalCasos) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="risk-percent">
                                    {((cantidad / stats.totalCasos) * 100).toFixed(1)}%
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
                                        style={{ width: `${(cantidad / Math.max(...Object.values(stats.porTipo))) * 100}%` }}
                                    ></div>
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
                        {Object.entries(stats.porEstado).map(([estado, cantidad]) => (
                            <div key={estado} className="estado-item">
                                <span className="estado-cantidad">{cantidad}</span>
                                <span className="estado-nombre">{estado.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
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
                                    style={{ height: `${(item.casos / Math.max(...stats.tendenciaMensual.map(t => t.casos))) * 100}%` }}
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
                        <tr>
                            <td>María González</td>
                            <td>12</td>
                            <td>45</td>
                            <td>8.5</td>
                            <td><span className="percent-high">42%</span></td>
                        </tr>
                        <tr>
                            <td>Carlos Rodríguez</td>
                            <td>8</td>
                            <td>38</td>
                            <td>6.2</td>
                            <td><span className="percent-medium">28%</span></td>
                        </tr>
                        <tr>
                            <td>Ana Martínez</td>
                            <td>15</td>
                            <td>52</td>
                            <td>7.8</td>
                            <td><span className="percent-high">35%</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
