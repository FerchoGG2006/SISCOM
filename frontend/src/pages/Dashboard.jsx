import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  ShieldAlert,
  Clock,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import { GlassCard } from '../components/common/GlassCard';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled(GlassCard)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.color || 'var(--primary)'};
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(GlassCard)`
  padding: 1.5rem;
  height: 400px;
`;

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#7C3AED'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    pending: 0,
    today: 0
  });
  const [recentCases, setRecentCases] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reportes/estadisticas');
        if (response.data && response.data.success) {
          const d = response.data.data;
          setStats({
            total: d.total || 0,
            critical: d.critical || 0,
            pending: d.pending || 0,
            today: d.today || 0
          });
          setRecentCases(d.recentCases || []);
          setDistribution(d.distribution || []);
          setTrend(d.trend || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando panel robusto...</div>;
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Dashboard SISCOM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Bienvenido al centro de mando, Comisario.</p>
        </div>
        <Link to="/radicacion" style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '0.8rem 1.8rem',
          borderRadius: '14px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
          transition: 'all 0.3s ease'
        }}>
          + Nueva Radicación
        </Link>
      </Header>

      <StatsGrid>
        <StatCard as={motion.div} whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div className="icon" style={{ marginBottom: '1rem', background: 'rgba(79, 70, 229, 0.1)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <FileText size={24} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0' }}>{stats.total}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Total Expedientes</p>
        </StatCard>

        <StatCard as={motion.div} whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} color="#EF4444">
          <div className="icon" style={{ marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <ShieldAlert size={24} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0' }}>{stats.critical}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Riesgo Crítico</p>
        </StatCard>

        <StatCard as={motion.div} whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} color="#F59E0B">
          <div className="icon" style={{ marginBottom: '1rem', background: 'rgba(245, 158, 11, 0.1)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <Clock size={24} color="#F59E0B" />
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0' }}>{stats.pending}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>En Medidas</p>
        </StatCard>

        <StatCard as={motion.div} whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} color="#10B981">
          <div className="icon" style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <Users size={24} color="#10B981" />
          </div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0' }}>{stats.today}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Radicados Hoy</p>
        </StatCard>

      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Tendencia de Casos (6 meses)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontWeight: 600 }} />
              <YAxis stroke="#64748b" tick={{ fontWeight: 600 }} />
              <Tooltip />
              <Area type="monotone" dataKey="casos" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCasos)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Niveles de Riesgo</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={distribution}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Expedientes Recientes</h3>
            <Link to="/expedientes" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Ver todo →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1.2rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>RADICADO</th>
                <th style={{ padding: '1.2rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>VÍCTIMA</th>
                <th style={{ padding: '1.2rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>RIESGO</th>
                <th style={{ padding: '1.2rem 1rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((exp) => (
                <tr key={exp.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{exp.radicado}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.victima}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: exp.riesgo === 'Crítico' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: exp.riesgo === 'Crítico' ? '#B91C1C' : '#047857',
                      border: `1px solid ${exp.riesgo === 'Crítico' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                      {exp.riesgo || 'Bajo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link to={`/expedientes/${exp.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                      <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Estado del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Servidor Robust v2.0</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, opacity: 0.7 }}>Operativo - Latencia 15ms</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Google Drive API</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, opacity: 0.7 }}>Conectado (Sync habilitado)</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>SQLite DB Client</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, opacity: 0.7 }}>Ok - dev.db (Active)</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardContainer>
  );
}
