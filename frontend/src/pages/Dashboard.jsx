import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FileText,
    Users,
    AlertTriangle,
    TrendingUp,
    PlusCircle,
    Clock,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
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

const WelcomeMessage = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
  }
  p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
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

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-main);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th {
    text-align: left;
    padding: 1rem;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 1px solid var(--glass-border);
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    font-size: 0.9375rem;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const RiskBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
        if (props.level === 'extremo' || props.level === 'Crítico') return 'rgba(239, 68, 68, 0.1)';
        if (props.level === 'alto' || props.level === 'Moderado') return 'rgba(245, 158, 11, 0.1)';
        return 'rgba(16, 185, 129, 0.1)';
    }};
  color: ${props => {
        if (props.level === 'extremo' || props.level === 'Crítico') return '#DC2626';
        if (props.level === 'alto' || props.level === 'Moderado') return '#D97706';
        return '#059669';
    }};
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }
`;

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 156,
        critical: 12,
        pending: 28,
        today: 5
    });

    const recentCases = [
        { id: 1, radicado: 'HS-2026-00045', victima: 'María García', riesgo: 'Crítico', fecha: 'Hoy' },
        { id: 2, radicado: 'HS-2026-00044', victima: 'Ana Rodríguez', riesgo: 'Moderado', fecha: 'Ayer' },
        { id: 3, radicado: 'HS-2026-00043', victima: 'Carmen López', riesgo: 'Bajo', fecha: '10 Feb' },
    ];

    return (
        <DashboardContainer>
            <Header>
                <WelcomeMessage>
                    <h1>Panel de Control</h1>
                    <p>Bienvenido al futuro de la gestión gubernamental.</p>
                </WelcomeMessage>
                <ActionButton to="/radicacion">
                    <PlusCircle size={20} />
                    Nuevo Expediente
                </ActionButton>
            </Header>

            <StatsGrid>
                <StatCard color="#4F46E5">
                    <StatValue>{stats.total}</StatValue>
                    <StatLabel>Total Expedientes</StatLabel>
                </StatCard>
                <StatCard color="#EF4444">
                    <StatValue>{stats.critical}</StatValue>
                    <StatLabel>Riesgo Crítico</StatLabel>
                </StatCard>
                <StatCard color="#F59E0B">
                    <StatValue>{stats.pending}</StatValue>
                    <StatLabel>Pendientes</StatLabel>
                </StatCard>
                <StatCard color="#10B981">
                    <StatValue>{stats.today}</StatValue>
                    <StatLabel>Casos de Hoy</StatLabel>
                </StatCard>
            </StatsGrid>

            <MainGrid>
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Expedientes Recientes</h3>
                        <Link to="/expedientes" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                            Ver todos <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                        </Link>
                    </div>
                    <Table>
                        <thead>
                            <tr>
                                <th>RADICADO</th>
                                <th>VÍCTIMA</th>
                                <th>RIESGO</th>
                                <th>FECHA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCases.map(caso => (
                                <tr key={caso.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{caso.radicado}</td>
                                    <td>{caso.victima}</td>
                                    <td><RiskBadge level={caso.riesgo}>{caso.riesgo}</RiskBadge></td>
                                    <td>{caso.fecha}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </GlassCard>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <GlassCard style={{ background: 'var(--glass-sidebar)', color: 'white' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Estado del Sistema</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#10B981' }}>
                            <ShieldCheck size={32} />
                            <div>
                                <p style={{ fontWeight: 700 }}>Seguridad Activa</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Base de Datos SQLite Robusta</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </MainGrid>
        </DashboardContainer>
    );
}
