import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Clock,
    User,
    Calendar,
    Globe,
    Activity,
    RefreshCcw,
    Search
} from 'lucide-react';
import api from '../services/api';

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleArea = styled.div`
  h1 { font-size: 1.8rem; font-weight: 900; color: var(--gray-900); letter-spacing: -0.02em; margin-bottom: 0.2rem; }
  p { color: var(--gray-500); font-size: 0.95rem; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-glow);
    color: var(--primary);
  }

  .data {
    span { font-size: 0.85rem; color: var(--gray-500); font-weight: 600; }
    h4 { font-size: 1.25rem; font-weight: 800; color: var(--gray-900); }
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    background: var(--gray-50);
    padding: 1.25rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--gray-100);
  }

  td {
    padding: 1.25rem 1rem;
    font-size: 0.9rem;
    color: var(--gray-700);
    border-bottom: 1px solid var(--gray-50);
  }

  tr:hover td { background: var(--gray-50); }
`;

const ActionBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  
  &.LOGIN { background: #e0f2fe; color: #0369a1; }
  &.RADICACION { background: #dcfce7; color: #15803d; }
  &.ELIMINACION { background: #fee2e2; color: #b91c1c; }
  &.EDICION { background: #fefabc; color: #854d0e; }
  &.DESCARGA { background: #f3e8ff; color: #7e22ce; }
`;

export default function Auditoria() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/audit');
            if (res.data.success) {
                setLogs(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <TitleArea>
                    <h1>Bítacora de Auditoría</h1>
                    <p>Registro histórico detallado de todas las acciones críticas del sistema.</p>
                </TitleArea>
                <button className="btn-premium" onClick={fetchLogs} disabled={loading}>
                    <RefreshCcw size={18} className={loading ? 'spinner' : ''} />
                    Refrescar
                </button>
            </Header>

            <StatsGrid>
                <StatCard>
                    <div className="icon"><Activity /></div>
                    <div className="data">
                        <span>Total Acciones</span>
                        <h4>{logs.length}</h4>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon" style={{ background: '#dcfce7', color: '#15803d' }}><Search /></div>
                    <div className="data">
                        <span>Radicaciones Hoy</span>
                        <h4>{logs.filter(l => l.accion === 'RADICACION').length}</h4>
                    </div>
                </StatCard>
                <StatCard>
                    <div className="icon" style={{ background: '#fee2e2', color: '#b91c1c' }}><ShieldAlert /></div>
                    <div className="data">
                        <span>Alertas Seguridad</span>
                        <h4>0</h4>
                    </div>
                </StatCard>
            </StatsGrid>

            <TableCard>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Acción</th>
                            <th>Módulo</th>
                            <th>Usuario</th>
                            <th>Detalles</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>
                                    <Calendar size={14} style={{ marginRight: 6, opacity: 0.5 }} />
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td>
                                    <ActionBadge className={log.accion}>{log.accion}</ActionBadge>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{log.modulo}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                            <User size={12} />
                                        </div>
                                        <span>{log.usuario ? `${log.usuario.nombres}` : 'Sistema'}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {log.detalles}
                                </td>
                                <td style={{ fontFamily: 'monospace', color: 'var(--gray-400)' }}>
                                    <Globe size={12} style={{ marginRight: 4 }} />
                                    {log.ip}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
                {logs.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                        <Clock size={48} style={{ marginBottom: '1rem' }} />
                        <p>No se encontraron registros de auditoría.</p>
                    </div>
                )}
            </TableCard>
        </Container>
    );
}
