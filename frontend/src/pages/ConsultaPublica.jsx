import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, FileText, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const PortalContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const ContentBox = styled(motion.div)`
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  color: #f8fafc;
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  text-align: center;
  margin-bottom: 2.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
`;

const ErrorMsg = styled(motion.div)`
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  color: #fca5a5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 17px;
    top: 40px;
    bottom: -30px;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  &:last-child::before {
    display: none;
  }
`;

const IconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.color || 'rgba(59, 130, 246, 0.2)'};
  color: ${props => props.iconColor || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
`;

export default function ConsultaPublica() {
  const [doc, setDoc] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/portal/consulta', { numero_documento: doc, pin });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No se encontraron registros activos para ese documento.');
      } else if (err.response && err.response.status === 401) {
        setError('El PIN de seguridad es incorrecto.');
      } else {
        setError('Error de conexión con el servidor. Intente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    if (type.includes('RADICA')) return <FileText size={18} />;
    if (type.includes('MEDIDA')) return <ShieldCheck size={18} />;
    if (type.includes('AUDIENCIA')) return <Clock size={18} />;
    if (type.includes('AUTO_INICIO')) return <CheckCircle size={18} />;
    return <FileText size={18} />;
  };

  return (
    <PortalContainer>
      <div style={{ position: 'absolute', top: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
         <img src="/logo-emblem.png" alt="Logo" style={{ width: '40px' }} />
         <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '2px' }}>SISCOM</span>
      </div>

      <AnimatePresence mode="wait">
        {!data ? (
          <ContentBox
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <ShieldCheck size={40} color="#3b82f6" />
              </div>
            </div>
            <Title>Consulta Ciudadana</Title>
            <Subtitle>Sigue el estado de tu trámite de forma segura.</Subtitle>

            {error && (
              <ErrorMsg initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <AlertTriangle size={20} />
                <span>{error}</span>
              </ErrorMsg>
            )}

            <form onSubmit={handleSearch}>
              <FormGroup>
                <Label>Gaceta / Número de Documento</Label>
                <Input 
                  type="text" 
                  placeholder="Ej: 123456789" 
                  value={doc}
                  onChange={e => setDoc(e.target.value)}
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label>PIN de Acceso (6 dígitos)</Label>
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  required 
                  maxLength={6}
                />
              </FormGroup>
              <Button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Consultando...' : <><Search size={20} /> Consultar Expediente</>}
              </Button>
            </form>
          </ContentBox>
        ) : (
          <ContentBox
            key="results"
            style={{ maxWidth: '800px', padding: '2.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              onClick={() => setData(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}
            >
              <ArrowLeft size={16} /> Volver
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: 0 }}>{data.radicado}</h2>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Fecha de Radicación: {new Date(data.fecha_radicacion).toLocaleDateString('es-CO')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
                  ESTADO: {data.estado_actual.toUpperCase()}
                </span>
              </div>
            </div>

            <h3 style={{ color: 'white', marginBottom: '2rem', fontSize: '1.2rem' }}>Línea de Tiempo del Trámite</h3>
            
            <div style={{ paddingLeft: '0.5rem' }}>
              {data.timeline.map((act, index) => (
                <TimelineItem key={index}>
                  <IconCircle>
                    {getIconForType(act.tipo)}
                  </IconCircle>
                  <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '1.1rem' }}>{act.tipo.replace('_', ' ')}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(act.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                      {act.descripcion_corta}
                    </p>
                  </div>
                </TimelineItem>
              ))}
            </div>

          </ContentBox>
        )}
      </AnimatePresence>
    </PortalContainer>
  );
}
