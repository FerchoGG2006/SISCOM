import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const SummaryCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(79, 70, 229, 0.15);
  position: relative;
  overflow: hidden;

  h3 {
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SummaryText = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--gray-700);
  margin: 0;
  font-style: ${props => props.placeholder ? 'italic' : 'normal'};
  opacity: ${props => props.placeholder ? 0.6 : 1};
`;

const GenerateBtn = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--primary-light);
  background: var(--primary-glow);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-light);
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function AISummary({ data }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/summarize', { data });
            if (res.data.success) {
                setSummary(res.data.summary);
            }
        } catch (e) {
            console.error('Error summaries:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SummaryCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3><Sparkles size={18} /> Resumen Ejecutivo AI</h3>
            <AnimatePresence mode="wait">
                {summary ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <SummaryText>{summary}</SummaryText>
                    </motion.div>
                ) : (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <SummaryText placeholder>
                            Genere un resumen estructurado del caso para una rápida lectura judicial.
                        </SummaryText>
                    </motion.div>
                )}
            </AnimatePresence>

            <GenerateBtn onClick={generateSummary} disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 size={16} className="spinner" />
                        Analizando...
                    </>
                ) : (
                    <>
                        <RefreshCw size={16} />
                        {summary ? 'Actualizar Resumen' : 'Generar Resumen'}
                    </>
                )}
            </GenerateBtn>
        </SummaryCard>
    );
}
