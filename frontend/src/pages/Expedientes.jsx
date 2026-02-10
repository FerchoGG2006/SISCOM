import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { GlassCard, StyledInput } from '../components/common/GlassCard';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterBar = styled(GlassCard)`
  padding: 1rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }

  input {
    padding-left: 2.75rem;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--text-main);
  outline: none;
  transition: var(--transition);

  &:focus {
    border-color: var(--primary);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 1.25rem 1rem;
    color: var(--text-muted);
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid var(--glass-border);
  }

  td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    font-size: 0.9rem;
  }

  tr:hover td {
    background: rgba(79, 70, 229, 0.02);
  }
`;

const RiskBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
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
  padding: 0.5rem;
  border-radius: 8px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  &:hover {
    background: rgba(79, 70, 229, 0.1);
  }
`;

import api from '../services/api';

export default function Expedientes() {
  const [searchParams] = useSearchParams();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const response = await api.get('/expedientes');
        if (response.data.success) {
          // Map Prisma data to list view
          const mapped = response.data.data.map(exp => ({
            id: exp.id,
            radicado: exp.radicado_hs,
            victima: `${exp.victima.nombres} ${exp.victima.apellidos}`,
            agresor: exp.agresor ? `${exp.agresor.nombres} ${exp.agresor.apellidos}` : 'No definido',
            nivel_riesgo: exp.nivel_riesgo,
            fecha: new Date(exp.fecha_radicacion).toLocaleDateString()
          }));
          setExpedientes(mapped);
        }
      } catch (error) {
        console.error('Error fetching expedientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpedientes();
  }, []);


  return (
    <PageContainer>
      <PageHeader>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Expedientes</h1>
          <p style={{ color: 'var(--text-main)', opacity: 0.7, fontWeight: 600 }}>Listado histórico y gestión de casos robustos.</p>
        </div>

        <Link to="/radicacion" style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <PlusCircle size={18} />
          Nuevo Expediente
        </Link>
      </PageHeader>

      <FilterBar>
        <SearchWrapper>
          <Search size={18} />
          <StyledInput placeholder="Buscar por radicado o víctima..." />
        </SearchWrapper>
        <Select>
          <option value="">Todos los Estados</option>
          <option value="radicado">Radicado</option>
          <option value="en_valoracion">En Valoración</option>
        </Select>
        <Select>
          <option value="">Riesgo (Todos)</option>
          <option value="bajo">Bajo</option>
          <option value="moderado">Moderado</option>
          <option value="critico">Crítico</option>
        </Select>
      </FilterBar>

      <GlassCard style={{ padding: '0' }}>
        <Table>
          <thead>
            <tr>
              <th>Radicado</th>
              <th>Víctima</th>
              <th>Agresor</th>
              <th>Riesgo</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expedientes.map(exp => (
              <motion.tr
                key={exp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ background: 'rgba(0,0,0,0.01)' }}
              >
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{exp.radicado}</td>
                <td>{exp.victima}</td>
                <td style={{ color: 'var(--text-muted)' }}>{exp.agresor}</td>
                <td><RiskBadge level={exp.nivel_riesgo}>{exp.nivel_riesgo}</RiskBadge></td>
                <td>{exp.fecha}</td>
                <td>
                  <ActionButton to={`/expedientes/${exp.id}`}>
                    <Eye size={18} />
                  </ActionButton>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </Table>
      </GlassCard>
    </PageContainer >
  );
}
