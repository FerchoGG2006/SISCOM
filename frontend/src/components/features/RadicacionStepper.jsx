import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, StyledInput, StyledLabel } from '../common/GlassCard';
import { User, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

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
  
  ${props => props.primary ? `
    background: var(--primary);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    &:hover {
      background: var(--primary-dark);
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

const steps = [
    { icon: <User size={20} />, label: 'Víctima' },
    { icon: <ShieldAlert size={20} />, label: 'Agresor' },
    { icon: <FileText size={20} />, label: 'Hechos' },
    { icon: <CheckCircle2 size={20} />, label: 'Resumen' },
];

export const RadicacionStepper = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

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
                    <GlassCard>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
                            {steps[currentStep].label} del Expediente
                        </h2>

                        {currentStep === 0 && (
                            <FormGrid>
                                <div>
                                    <StyledLabel>Nombres</StyledLabel>
                                    <StyledInput placeholder="Ej: María Elena" />
                                </div>
                                <div>
                                    <StyledLabel>Apellidos</StyledLabel>
                                    <StyledInput placeholder="Ej: Gómez Pérez" />
                                </div>
                                <div>
                                    <StyledLabel>Tipo Documento</StyledLabel>
                                    <StyledInput placeholder="CC, TI, etc." />
                                </div>
                                <div>
                                    <StyledLabel>Número Documento</StyledLabel>
                                    <StyledInput placeholder="123456789" />
                                </div>
                            </FormGrid>
                        )}

                        {currentStep === 1 && (
                            <FormGrid>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <StyledLabel>Nombre Completo del Agresor</StyledLabel>
                                    <StyledInput placeholder="Nombre completo" />
                                </div>
                                <div>
                                    <StyledLabel>Parentesco</StyledLabel>
                                    <StyledInput placeholder="Cónyuge, Padre, etc." />
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
                                    placeholder="Describa detalladamente los acontecimientos..."
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <h3>¡Todo Listo para Radicar!</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Verifique la información antes de enviar el expediente al sistema.
                                </p>
                            </div>
                        )}

                        <ButtonGroup>
                            <Button onClick={prevStep} disabled={currentStep === 0}>
                                Anterior
                            </Button>
                            <Button
                                primary
                                onClick={currentStep === steps.length - 1 ? () => alert('Expediente Radicado') : nextStep}
                                whileTap={{ scale: 0.95 }}
                            >
                                {currentStep === steps.length - 1 ? 'Radicar Expediente' : 'Siguiente'}
                            </Button>
                        </ButtonGroup>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>
        </StepperContainer>
    );
};
