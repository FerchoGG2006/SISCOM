import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Download,
    TrendingUp,
    Users,
    AlertTriangle,
    FileText,
    PieChart as PieIcon,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// --- Styled Components (Modern Analytics Aesthetic) ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    margin: 0;
  }
  p {
    color: var(--gray-500);
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ExportBtn = styled.button`
  background: ${props => props.variant === 'primary' ? 'var(--primary)' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : 'var(--gray-700)'};
  padding: 0.875rem 1.5rem;
  border-radius: 14px;
  border: 1px solid ${props => props.variant === 'primary' ? 'var(--primary)' : 'var(--gray-200)'};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.variant === 'primary' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.variant === 'primary' ? 'var(--primary-dark)' : 'var(--gray-50)'};
    border-color: ${props => props.variant === 'primary' ? 'var(--primary-dark)' : 'var(--gray-300)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: var(--shadow-premium);
  border: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.bg};
    color: ${props => props.color};
  }
  
  .trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${props => props.isUp ? 'var(--success)' : 'var(--danger)'};
  }
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--gray-900);
  letter-spacing: -0.02em;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-500);
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: var(--shadow-premium);
  border: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Reportes() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reportes/estadisticas');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const response = await api.get('/reportes/exportar-excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_SISCOM_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert('Error al exportar el reporte');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '1.2rem', fontWeight: 700 }}>Analizando datos institucionales...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '600px', gap: '1rem' }}>
                <AlertTriangle size={48} color="var(--danger)" />
                <p style={{ color: 'var(--gray-700)', fontSize: '1.2rem', fontWeight: 700 }}>Error al cargar estadísticas</p>
                <button
                    onClick={loadData}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // Prepare data for charts
    const riskData = Object.entries(stats.porRiesgo).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    const typeData = Object.entries(stats.porTipo).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
    }));

    return (
        <Container>
            <Header>
                <TitleGroup>
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Análisis de Impacto</motion.h1>
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        Métricas institucionales y seguimiento de productividad
                    </motion.p>
                </TitleGroup>

                <ActionGroup>
                    <ExportBtn onClick={handleExportExcel} disabled={exporting}>
                        <Download size={20} />
                        {exporting ? 'Generando...' : 'Exportar Datos (Excel)'}
                    </ExportBtn>
                </ActionGroup>
            </Header>

            <StatsGrid>
                <StatCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <StatHeader bg="rgba(79, 70, 229, 0.1)" color="var(--primary)" isUp={true}>
                        <div className="icon-box"><FileText size={24} /></div>
                        <div className="trend"><ArrowUpRight size={16} /> 12%</div>
                    </StatHeader>
                    <StatValue>{stats.totalCasos}</StatValue>
                    <StatLabel>Histórico de Casos</StatLabel>
                </StatCard>

                <StatCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <StatHeader bg="rgba(16, 185, 129, 0.1)" color="var(--success)" isUp={true}>
                        <div className="icon-box"><TrendingUp size={24} /></div>
                        <div className="trend"><ArrowUpRight size={16} /> 8%</div>
                    </StatHeader>
                    <StatValue>{stats.casosNuevos}</StatValue>
                    <StatLabel>Nuevos (30 días)</StatLabel>
                </StatCard>

                <StatCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <StatHeader bg="rgba(245, 158, 11, 0.1)" color="var(--warning)" isUp={false}>
                        <div className="icon-box"><AlertTriangle size={24} /></div>
                        <div className="trend" style={{ color: 'var(--gray-400)' }}>Estable</div>
                    </StatHeader>
                    <StatValue>{stats.casosPendientes}</StatValue>
                    <StatLabel>Trámites en Curso</StatLabel>
                </StatCard>
            </StatsGrid>

            <ChartsGrid>
                <ChartCard>
                    <h3><TrendingUp size={20} /> Tendencia Histórica de Ingreso</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats.tendenciaMensual}>
                                <defs>
                                    <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="casos" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCasos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard>
                    <h3><PieIcon size={20} /> Gravedad del Riesgo</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </ChartsGrid>

            <ChartCard>
                <h3><BarChart3 size={20} /> Distribución por Tipología de Conflicto</h3>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={typeData} layout="vertical" margin={{ left: 40, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} width={150} />
                            <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} />
                            <Bar dataKey="value" fill="#4F46E5" radius={[0, 10, 10, 0]} barSize={34}>
                                {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

            <ChartCard>
                <h3><Search size={20} /> Análisis Geográfico: Barrios con Mayor Incidencia</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.porBarrio?.map(b => ({ name: b.barrio, count: b.cantidad }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="count" fill="url(#colorHeat)" radius={[10, 10, 0, 0]}>
                                <defs>
                                    <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                {stats.porBarrio?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index < 3 ? '#EF4444' : '#F59E0B'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '1rem' }}>
                    * Los barrios en rojo representan las zonas con mayor densidad de casos reportados en el último período.
                </p>
            </ChartCard>

            {/* Mapa de Distribución de Casos (Fase 18) */}
            <ChartCard>
                <h3><Search size={20} /> Mapa de Concentración de Casos</h3>
                {/* 
                <div style={{ width: '100%', height: 450, borderRadius: '12px', overflow: 'hidden', marginTop: '1rem', border: '1px solid var(--gray-200)', zIndex: 0 }}>
                    <MapContainer center={[4.6097, -74.0817]} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {stats.porBarrio?.map((b, idx) => {
                            const lat = 4.6097 + (Math.sin(idx * 2.1) * 0.04);
                            const lng = -74.0817 + (Math.cos(idx * 2.1) * 0.04);
                            const radius = Math.min(Math.max(15, b.cantidad * 4), 40);
                            const color = b.cantidad >= 5 ? '#EF4444' : (b.cantidad >= 2 ? '#F59E0B' : '#4F46E5');
                            return (
                                <CircleMarker
                                    key={idx}
                                    center={[lat, lng]}
                                    radius={radius}
                                    pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
                                >
                                    <LeafletTooltip>
                                        <div style={{ textAlign: 'center' }}>
                                            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>{b.barrio}</strong>
                                            <span style={{ color: color, fontWeight: 'bold' }}>{b.cantidad} casos activos</span>
                                        </div>
                                    </LeafletTooltip>
                                </CircleMarker>
                            )
                        })}
                    </MapContainer>
                </div>
                */}
                <div style={{ padding: '2rem', background: 'var(--gray-50)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                    <Search size={32} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Mapa de calor geográfico temporalmente en mantenimiento.</p>
                </div>
            </ChartCard>
        </Container>
    );
}
