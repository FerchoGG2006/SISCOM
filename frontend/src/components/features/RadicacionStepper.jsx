import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, StyledInput, StyledLabel } from '../common/GlassCard';
import { User, ShieldAlert, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const StepperContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 24px;
    left: 40px;
    right: 40px;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }
`;

const StepCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.active ? 'var(--primary)' : props.completed ? 'var(--primary-light)' : 'white'};
  border: 4px solid ${props => props.active ? 'rgba(79, 70, 229, 0.2)' : 'white'};
  color: ${props => props.active || props.completed ? 'white' : '#94a3b8'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StepLabel = styled.span`
  position: absolute;
  top: 56px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.active ? 'var(--primary)' : '#94a3b8'};
  text-transform: uppercase;
  white-space: nowrap;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.primary ? `
    background: var(--primary);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    &:hover:not(:disabled) {
      background: var(--primary-dark);
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: var(--text-muted);
    border: 1px solid #e2e8f0;
    &:hover {
      border-color: var(--primary-light);
      color: var(--primary);
    }
  `}
`;

const StatusMessage = styled(motion.div)`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  ${props => props.type === 'error' ? `
    background: #FEF2F2;
    color: #991B1B;
    border: 1px solid #FEE2E2;
  ` : `
    background: #F0FDF4;
    color: #166534;
    border: 1px solid #DCFCE7;
  `}
`;

const steps = [
    { icon: <User size={20} />, label: 'Víctima' },
    { icon: <ShieldAlert size={20} />, label: 'Agresor' },
    { icon: <FileText size={20} />, label: 'Hechos' },
    { icon: <CheckCircle2 size={20} />, label: 'Resumen' },
];

export const RadicacionStepper = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

    const [formData, setFormData] = useState({
        victima: {
            nombres: '',
            apellidos: '',
            tipo_documento: 'CC',
            numero_documento: '',
            telefono: '',
            direccion: ''
        },
        agresor: {
            nombres: '',
            apellidos: '',
            tipo_documento: 'CC',
            numero_documento: '',
        },
        relato_hechos: '',
        respuestas_riesgo: new Array(52).fill(false)
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleVictimaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            victima: { ...prev.victima, [name]: value }
        }));
    };

    const handleAgresorChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            agresor: { ...prev.agresor, [name]: value }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await axios.post('http://localhost:4000/api/v1/radicar', formData);
            setStatus({
                type: 'success',
                message: `Caso radicado con éxito. Radicado: ${response.data.data.radicado}`
            });
            // Opcional: Redirigir o limpiar
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Error al conectar con el servidor robusto.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <StepperContainer>
            <StepHeader>
                {steps.map((step, idx) => (
                    <StepCircle
                        key={idx}
                        active={currentStep === idx}
                        completed={currentStep > idx}
                    >
                        {step.icon}
                        <StepLabel active={currentStep === idx}>{step.label}</StepLabel>
                    </StepCircle>
                ))}
            </StepHeader>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {status && (
                        <StatusMessage type={status.type} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                            {status.message}
                        </StatusMessage>
                    )}

                    <GlassCard>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                            {steps[currentStep].label} del Expediente
                        </h2>

                        {currentStep === 0 && (
                            <FormGrid>
                                <div>
                                    <StyledLabel>Nombres</StyledLabel>
                                    <StyledInput
                                        name="nombres"
                                        value={formData.victima.nombres}
                                        onChange={handleVictimaChange}
                                        placeholder="Ej: María Elena"
                                    />
                                </div>
                                <div>
                                    <StyledLabel>Apellidos</StyledLabel>
                                    <StyledInput
                                        name="apellidos"
                                        value={formData.victima.apellidos}
                                        onChange={handleVictimaChange}
                                        placeholder="Ej: Gómez Pérez"
                                    />
                                </div>
                                <div>
                                    <StyledLabel>Tipo Documento</StyledLabel>
                                    <StyledInput
                                        name="tipo_documento"
                                        value={formData.victima.tipo_documento}
                                        onChange={handleVictimaChange}
                                        placeholder="CC, TI, etc."
                                    />
                                </div>
                                <div>
                                    <StyledLabel>Número Documento</StyledLabel>
                                    <StyledInput
                                        name="numero_documento"
                                        value={formData.victima.numero_documento}
                                        onChange={handleVictimaChange}
                                        placeholder="123456789"
                                    />
                                </div>
                            </FormGrid>
                        )}

                        {currentStep === 1 && (
                            <FormGrid>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <StyledLabel>Nombres y Apellidos del Agresor</StyledLabel>
                                    <StyledInput
                                        name="nombres"
                                        value={formData.agresor.nombres}
                                        onChange={handleAgresorChange}
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                <div>
                                    <StyledLabel>Número Documento (Si lo conoce)</StyledLabel>
                                    <StyledInput
                                        name="numero_documento"
                                        value={formData.agresor.numero_documento}
                                        onChange={handleAgresorChange}
                                        placeholder="CC123..."
                                    />
                                </div>
                            </FormGrid>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <StyledLabel>Relato de los Hechos</StyledLabel>
                                <textarea
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                    value={formData.relato_hechos}
                                    onChange={(e) => setFormData(prev => ({ ...prev, relato_hechos: e.target.value }))}
                                    placeholder="Describa detalladamente los acontecimientos..."
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <h3>¡Todo Listo para Radicar!</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                    Verifique la información antes de enviar el expediente al sistema.
                                </p>
                                <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px' }}>
                                    <strong>Víctima:</strong> {formData.victima.nombres} {formData.victima.apellidos}<br />
                                    <strong>Documento:</strong> {formData.victima.numero_documento}<br />
                                    <strong>Agresor:</strong> {formData.agresor.nombres || 'No especificado'}
                                </div>
                            </div>
                        )}

                        <ButtonGroup>
                            <Button onClick={prevStep} disabled={currentStep === 0 || loading}>
                                Anterior
                            </Button>
                            <Button
                                primary
                                disabled={loading}
                                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {currentStep === steps.length - 1 ? (loading ? 'Radicando...' : 'Radicar Expediente') : 'Siguiente'}
                            </Button>
                        </ButtonGroup>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>
        </StepperContainer>
    );
};
