import styled from 'styled-components';
import { motion } from 'framer-motion';

export const GlassCard = styled(motion.div)`
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 2rem;
  transition: var(--transition);

  &:hover {
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.7);
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-size: 1rem;
  color: var(--text-main);
  transition: var(--transition);
  outline: none;

  &:focus {
    background: rgba(255, 255, 255, 0.8);
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
