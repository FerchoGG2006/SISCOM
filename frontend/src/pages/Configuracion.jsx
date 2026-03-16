import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Database,
    Bell,
    Shield,
    Save,
    Globe,
    FileText,
    ShieldCheck,
    Cloud,
    Zap,
    CheckCircle2
} from 'lucide-react';
import api from '../services/api';

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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
  }
`;

const SaveBtn = styled.button`
  background: var(--primary);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);

  &:hover {
    transform: translateY(-2px);
    background: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: none;
  background: ${props => props.active ? 'var(--primary-glow)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--gray-500)'};
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: ${props => props.active ? 'var(--primary-glow)' : 'var(--gray-50)'};
  }
`;

const ContentCard = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 30px;
  box-shadow: var(--shadow-premium);
  border: 1px solid rgba(229, 231, 235, 0.5);
  min-height: 600px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--gray-700);
  }

  input, select {
    padding: 0.875rem 1rem;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 14px;
    font-size: 1rem;
    color: var(--gray-900);
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
  }
`;

const ToggleContainer = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--gray-50);
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray-200);
    background: white;
  }
  
  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    span.title { font-weight: 700; color: var(--gray-900); }
    span.desc { font-size: 0.85rem; color: var(--gray-500); }
  }
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  width: 40px;
  height: 20px;
  appearance: none;
  background: var(--gray-300);
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;

  &:checked {
    background: var(--primary);
  }

  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  &:checked::before {
    transform: translateX(20px);
  }
`;

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await api.get('/configuracion');
            if (res.data.success) {
                setConfig(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewTemplate = async (templateName) => {
        const mapping = {
            'Auto de Inicio': 'autoinicio',
            'Medida de Protección': 'medidas',
            'Oficio Policía': 'oficiopolicia',
            'Citación Audiencia': 'citacion'
        };

        const key = mapping[templateName];
        if (!key) return;

        setMsg(`Generando vista previa de ${templateName}...`);

        try {
            const res = await api.get(`/configuracion/preview/${key}`);
            if (res.data.success && res.data.url) {
                window.open(res.data.url, '_blank');
                setMsg(null);
            }
        } catch (e) {
            console.error('Error en vista previa:', e);
            setMsg('Error al generar vista previa');
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/configuracion', config);
            setMsg('Configuración actualizada');
            setTimeout(() => setMsg(null), 3000);
        } catch (e) {
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '1.2rem', fontWeight: 700 }}>Cargando preferencias del sistema...</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '600px', gap: '1rem' }}>
                <Shield size={48} color="var(--danger)" />
                <p style={{ color: 'var(--gray-700)', fontSize: '1.2rem', fontWeight: 700 }}>No tienes permisos o error de conexión</p>
                <button
                    onClick={loadConfig}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <Container>
            <Header>
                <TitleGroup>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Preferencias Globales</motion.h1>
                    <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Central de mandos y personalización del sistema</motion.p>
                </TitleGroup>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <AnimatePresence>
                        {msg && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={18} /> {msg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <SaveBtn onClick={handleSave} disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Guardando...' : 'Aplicar Cambios'}
                    </SaveBtn>
                </div>
            </Header>

            <Layout>
                <Sidebar>
                    <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
                        <Globe size={20} /> Entidad y Prefijos
                    </TabButton>
                    <TabButton active={activeTab === 'riesgo'} onClick={() => setActiveTab('riesgo')}>
                        <ShieldCheck size={20} /> Parámetros de Riesgo
                    </TabButton>
                    <TabButton active={activeTab === 'notificaciones'} onClick={() => setActiveTab('notificaciones')}>
                        <Bell size={20} /> Alertas de Sistema
                    </TabButton>
                    <TabButton active={activeTab === 'integraciones'} onClick={() => setActiveTab('integraciones')}>
                        <Cloud size={20} /> Nube e Integraciones
                    </TabButton>
                    <TabButton active={activeTab === 'plantillas'} onClick={() => setActiveTab('plantillas')}>
                        <FileText size={20} /> Plantillas de PDF
                    </TabButton>
                </Sidebar>

                <ContentCard
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'general' && (
                        <FormSection>
                            <h2>Información Institucional</h2>
                            <Grid>
                                <FormGroup>
                                    <label>Nombre de la Entidad</label>
                                    <input value={config.nombre_entidad} onChange={e => handleChange('nombre_entidad', e.target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Municipio</label>
                                    <input value={config.municipio} onChange={e => handleChange('municipio', e.target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Departamento</label>
                                    <input value={config.departamento} onChange={e => handleChange('departamento', e.target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Prefijo Secuencial (Radicados)</label>
                                    <input value={config.prefijo_radicado} onChange={e => handleChange('prefijo_radicado', e.target.value)} maxLength={5} />
                                </FormGroup>
                            </Grid>
                        </FormSection>
                    )}

                    {activeTab === 'riesgo' && (
                        <FormSection>
                            <h2>Umbrales de Severidad</h2>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Defina los límites de puntaje para cada categoría de riesgo institucional.</p>
                            <Grid>
                                <FormGroup>
                                    <label>Umbral Riesgo Bajo (Puntos)</label>
                                    <input type="number" value={config.umbral_bajo} onChange={e => handleChange('umbral_bajo', parseInt(e.target.value))} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Umbral Riesgo Moderado</label>
                                    <input type="number" value={config.umbral_medio} onChange={e => handleChange('umbral_medio', parseInt(e.target.value))} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Umbral Riesgo Crítico/Alto</label>
                                    <input type="number" value={config.umbral_alto} onChange={e => handleChange('umbral_alto', parseInt(e.target.value))} />
                                </FormGroup>
                            </Grid>
                        </FormSection>
                    )}

                    {activeTab === 'notificaciones' && (
                        <FormSection>
                            <h2>Alertas Inteligentes</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <ToggleContainer>
                                    <div className="info">
                                        <span className="title">Notificaciones por Email</span>
                                        <span className="desc">Enviar resumen diario de casos a coordinadores.</span>
                                    </div>
                                    <Switch checked={config.email_notificaciones} onChange={e => handleChange('email_notificaciones', e.target.checked)} />
                                </ToggleContainer>
                                <ToggleContainer>
                                    <div className="info">
                                        <span className="title">Priorizar Casos de Riesgo Extremo</span>
                                        <span className="desc">Marcar automáticamente casos críticos en el dashboard.</span>
                                    </div>
                                    <Switch checked={config.notificar_riesgo_alto} onChange={e => handleChange('notificar_riesgo_alto', e.target.checked)} />
                                </ToggleContainer>
                            </div>
                        </FormSection>
                    )}

                    {activeTab === 'integraciones' && (
                        <FormSection>
                            <h2>Google Drive & Vault</h2>
                            <div style={{ padding: '2.5rem', background: 'var(--gray-50)', borderRadius: '24px', textAlign: 'center', border: '2px dashed var(--gray-200)' }}>
                                <Cloud size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3>Almacenamiento Conectado</h3>
                                <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Los documentos se sincronizan automáticamente con la cuenta de Servicio de Google configurada.</p>
                                <ToggleContainer style={{ background: 'white', maxWidth: '400px', margin: '0 auto' }}>
                                    <span className="title">Sincronización en Tiempo Real</span>
                                    <Switch checked={config.drive_activo} onChange={e => handleChange('drive_activo', e.target.checked)} />
                                </ToggleContainer>
                            </div>
                        </FormSection>
                    )}

                    {activeTab === 'plantillas' && (
                        <FormSection>
                            <h2>Plantillas de Documentos</h2>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Gestione las plantillas legales utilizadas para la generación automática de PDFs.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {['Auto de Inicio', 'Medida de Protección', 'Oficio Policía', 'Citación Audiencia'].map(t => (
                                    <div key={t} style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <FileText size={24} color="var(--primary)" />
                                        <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{t}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Formato PDF Estándar</span>
                                        <button
                                            style={{ background: 'var(--gray-50)', border: 'none', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary)' }}
                                            onClick={() => handlePreviewTemplate(t)}
                                        >
                                            Vista Previa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </FormSection>
                    )}
                </ContentCard>
            </Layout>
        </Container>
    );
}
