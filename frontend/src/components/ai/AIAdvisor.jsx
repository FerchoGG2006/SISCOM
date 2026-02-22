import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AdvisorContainer = styled(motion.div)`
  margin-top: 2rem;
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
  border-radius: 20px;
  border: 1px solid rgba(79, 70, 229, 0.2);
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--primary);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 800;
    color: var(--primary);
    font-size: 1.1rem;
  }
  
  .badge {
    padding: 0.4rem 0.8rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    background: rgba(79, 70, 229, 0.1);
    color: var(--primary);
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid var(--gray-100);
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--gray-600);
  }
`;

const RiskIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--gray-200);

  .level-label {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .level-value {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 800;
    
    &.bajo { background: #d1fae5; color: #065f46; }
    &.medio { background: #fef3c7; color: #92400e; }
    &.alto { background: #fee2e2; color: #991b1b; }
    &.extremo { background: #000; color: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.3); }
  }
`;

export default function AIAdvisor({ text }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [debouncedText, setDebouncedText] = useState(text);

    // Debounce to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text);
        }, 1500);
        return () => clearTimeout(timer);
    }, [text]);

    useEffect(() => {
        if (debouncedText?.length > 30) {
            performAnalysis();
        } else {
            setAnalysis(null);
        }
    }, [debouncedText]);

    const performAnalysis = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/analyze', { relato: debouncedText });
            if (res.data.success) {
                setAnalysis(res.data.data);
            }
        } catch (e) {
            console.error('SISCOM AI Error:', e);
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) return null;

    return (
        <AnimatePresence>
            <AdvisorContainer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                <Header>
                    <div className="title">
                        {loading ? <Loader2 size={20} className="spinner" /> : <Sparkles size={20} />}
                        SISCOM AI Advisor
                    </div>
                    <span className="badge">Beta</span>
                </Header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                        Analizando relato de hechos en tiempo real...
                    </div>
                ) : (
                    <>
                        <Content>
                            <InsightCard>
                                <h4><AlertTriangle size={14} color="var(--warning)" /> Justificación Legal</h4>
                                <p>{analysis.justificacion}</p>
                            </InsightCard>
                            <InsightCard>
                                <h4><ShieldCheck size={14} color="var(--success)" /> Medida Sugerida</h4>
                                <p>{analysis.recomendacion}</p>
                            </InsightCard>
                        </Content>

                        <RiskIndicator>
                            <span className="level-label">Predicción de Riesgo:</span>
                            <span className={`level-value ${analysis.nivel.toLowerCase()}`}>
                                {analysis.nivel.toUpperCase()} ({analysis.puntos_estimados} pts)
                            </span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>
                                <Zap size={14} /> Sugerido basado en patrones
                            </div>
                        </RiskIndicator>
                    </>
                )}
            </AdvisorContainer>
        </AnimatePresence>
    );
}
