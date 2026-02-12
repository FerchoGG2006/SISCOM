import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
    X,
    AlertTriangle,
    ChevronRight,
    Calendar,
    MapPin,
    AlertOctagon,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import api from '../services/api';

// --- Styled Components V2 (Cleaner, Professional) ---

const Container = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding-bottom: 4rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(229, 231, 235, 0.5);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  }
`;

const GlassHeader = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 0;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-800);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.bg};
  color: ${props => props.color};
`;

const RiskCard = styled(Card)`
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    opacity: 0.6;
    pointer-events: none;
  }
`;

const RiskScore = styled.div`
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const RiskLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-100);

  &:last-child {
    border-bottom: none;
  }

  span.label {
    font-size: 0.85rem;
    color: var(--gray-500);
    font-weight: 600;
  }

  span.value {
    font-size: 0.95rem;
    color: var(--gray-900);
    font-weight: 700;
  }
`;

const TabNav = styled.div`
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  overflow-x: auto;
`;

const TabItem = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${props => props.active ? 'var(--gray-900)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--gray-500)'};
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? 'var(--gray-800)' : 'var(--gray-100)'};
    color: ${props => props.active ? 'white' : 'var(--gray-900)'};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const QuickActionBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  color: var(--gray-800);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    color: var(--primary);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 2rem;
    bottom: 2rem;
    width: 2px;
    background: var(--gray-200);
    z-index: 0;
  }
`;

const TimelineRow = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const TimelineDot = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: ${props => props.bg || 'white'};
  border: 2px solid ${props => props.border || 'var(--gray-200)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.color || 'var(--gray-500)'};
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const TimelineContent = styled(Card)`
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  h4 {
    color: var(--gray-900);
  }
  
  p {
    color: var(--gray-700);
  }
  
  span {
    color: var(--gray-500);
  }
`;

// Helper component for styled badges
const renderRiskBadge = (level) => {
    const l = level?.toLowerCase();
    let config = { bg: 'var(--gray-100)', color: 'var(--text-muted)', icon: AlertCircle };
    if (l === 'extremo' || l === 'crítico') config = { bg: '#FEF2F2', color: '#DC2626', icon: AlertOctagon };
    else if (l === 'alto') config = { bg: '#FFF7ED', color: '#EA580C', icon: AlertTriangle };
    else if (l === 'medio') config = { bg: '#FFFBEB', color: '#D97706', icon: AlertTriangle };
    else config = { bg: '#ECFDF5', color: '#059669', icon: CheckCircle };

    return (
        <RiskCard bg={config.color} color="white">
            <config.icon size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <RiskScore>453</RiskScore> {/* Placeholder dynamic score logic if needed */}
            <RiskLabel>Riesgo {level}</RiskLabel>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>Puntaje Calculado</span>
        </RiskCard>
    );
};


export default function ExpedienteDetalle() {
    const { id } = useParams();
    const [expediente, setExpediente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // UI State for Modal
    const [showModal, setShowModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [newActuacion, setNewActuacion] = useState({ tipo: 'Seguimiento', descripcion: '' });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/expedientes/${id}`);
            if (res.data.success) setExpediente(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type) => {
        setGenerating(true);
        try {
            // Mock API call or real one
            if (type.includes('doc')) {
                await api.post(`/expedientes/${id}/documentos/${type.replace('doc-', '')}`);
                alert('Documento generado');
            }
            loadData();
        } catch (e) {
            alert('Error en la acción');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
    if (!expediente) return <div>No encontrado</div>;

    return (
        <Container>
            {/* LEFT SIDEBAR: Persistent Information */}
            <Sidebar>
                <div style={{ marginBottom: '1rem' }}>
                    <BackLink to="/expedientes"><ArrowLeft size={16} /> Volver</BackLink>
                    <PageTitle>{expediente.radicado_hs}</PageTitle>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <StatusBadge bg="var(--primary-light)" color="white">{expediente.estado}</StatusBadge>
                        <StatusBadge bg="#F3F4F6" color="#374151">Violencia Familiar</StatusBadge>
                    </div>
                </div>

                {/* Risk Card */}
                {renderRiskBadge(expediente.nivel_riesgo)}

                {/* Key Details Card */}
                <Card>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--gray-800)' }}>Detalles Clave</h3>
                    <InfoList>
                        <InfoItem>
                            <span className="label">Fecha Radicación</span>
                            <span className="value">{new Date(expediente.fecha_radicacion).toLocaleDateString()}</span>
                        </InfoItem>
                        <InfoItem>
                            <span className="label">Víctima</span>
                            <span className="value">{expediente.victima.nombres} {expediente.victima.apellidos}</span>
                        </InfoItem>
                        <InfoItem>
                            <span className="label">Agresor</span>
                            <span className="value">{expediente.agresor?.nombres || 'No registrado'}</span>
                        </InfoItem>
                    </InfoList>
                </Card>

                {/* Drive Link */}
                {expediente.drive_folder_id && (
                    <a href={`https://drive.google.com/drive/folders/${expediente.drive_folder_id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #4F46E5', background: '#EEF2FF' }}>
                            <Folder size={24} color="#4F46E5" />
                            <div>
                                <h4 style={{ margin: 0, color: '#4F46E5', fontWeight: 700 }}>Carpeta Drive</h4>
                                <span style={{ fontSize: '0.8rem', color: '#6366F1' }}>Ver documentos originales</span>
                            </div>
                            <ExternalLink size={16} color="#4F46E5" style={{ marginLeft: 'auto' }} />
                        </Card>
                    </a>
                )}
            </Sidebar>

            {/* MAIN CONTENT: Tabs & Dynamic Info */}
            <MainContent>
                <TabNav>
                    <TabItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Resumen General</TabItem>
                    <TabItem active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>Línea de Tiempo</TabItem>
                    <TabItem active={activeTab === 'docs'} onClick={() => setActiveTab('docs')}>Documentos ({expediente.documentos.length})</TabItem>
                </TabNav>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Quick Actions */}
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--gray-800)' }}>Acciones Rápidas</h3>
                                    <ActionGrid>
                                        <QuickActionBtn onClick={() => handleAction('doc-oficio-policia')}>
                                            <Shield size={24} color="#EF4444" />
                                            <span>Oficio Policía</span>
                                        </QuickActionBtn>
                                        <QuickActionBtn onClick={() => handleAction('doc-medidas')}>
                                            <FileText size={24} color="#F59E0B" />
                                            <span>Medidas Prot.</span>
                                        </QuickActionBtn>
                                        <QuickActionBtn onClick={() => handleAction('doc-salud')}>
                                            <Plus size={24} color="#10B981" />
                                            <span>Remisión Salud</span>
                                        </QuickActionBtn>
                                        <QuickActionBtn onClick={() => setShowModal(true)}>
                                            <Clock size={24} color="#6366F1" />
                                            <span>Nueva Actuación</span>
                                        </QuickActionBtn>
                                    </ActionGrid>
                                </div>

                                {/* Facts */}
                                <Card>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--gray-800)' }}>Relato de los Hechos</h3>
                                    <p style={{ lineHeight: 1.7, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                                        {expediente.relato_hechos || 'Sin relato disponible.'}
                                    </p>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <TimelineContainer>
                                {expediente.actuaciones.map((act) => (
                                    <TimelineRow key={act.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <TimelineDot
                                            bg={act.tipo.includes('Audiencia') ? '#EEF2FF' : 'white'}
                                            border={act.tipo.includes('Audiencia') ? '#6366F1' : undefined}
                                            color={act.tipo.includes('Audiencia') ? '#6366F1' : undefined}
                                        >
                                            {act.tipo.includes('Audiencia') ? <Calendar size={20} /> : <Clock size={20} />}
                                        </TimelineDot>
                                        <TimelineContent>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>{act.tipo}</h4>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(act.fecha).toLocaleString()}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{act.descripcion}</p>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                Comisario: {act.usuario.nombres}
                                            </span>
                                        </TimelineContent>
                                    </TimelineRow>
                                ))}
                            </TimelineContainer>
                        )}

                        {activeTab === 'docs' && (
                            <ActionGrid>
                                {expediente.documentos.map(doc => (
                                    <Card key={doc.id} as="a" href={doc.url_drive} target="_blank" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', cursor: 'pointer' }}>
                                        <div style={{ padding: '1rem', background: '#F3F4F6', borderRadius: '50%' }}>
                                            <FileText size={24} color="#4B5563" />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{doc.tipo}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(doc.generado_el).toLocaleDateString()}</span>
                                        </div>
                                    </Card>
                                ))}
                            </ActionGrid>
                        )}
                    </motion.div>
                </AnimatePresence>
            </MainContent>

            {/* Simple Modal logic would go here similar to prev version */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <Card style={{ width: '500px', maxWidth: '90%' }}>
                        <h3>Nueva Actuación</h3>
                        <div style={{ margin: '1rem 0' }}>
                            <textarea
                                style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                                placeholder="Detalle de lo sucedido..."
                                value={newActuacion.descripcion}
                                onChange={e => setNewActuacion({ ...newActuacion, descripcion: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={() => {
                                // Add logic
                                setShowModal(false);
                            }}>Guardar</button>
                        </div>
                    </Card>
                </div>
            )}
        </Container>
    );
}
