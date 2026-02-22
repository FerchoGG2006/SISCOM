import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

// --- Styled Components (Legal Dashboard Aesthetic) ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--gray-500);
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const NewButton = styled(Link)`
  background: var(--primary);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    background: var(--primary-dark);
  }
`;

const ControlsCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 20px;
  box-shadow: var(--shadow-premium);
  display: flex;
  gap: 1rem;
  align-items: center;
  border: 1px solid rgba(229, 231, 235, 0.5);

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;

  svg {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
  }

  input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 14px;
    font-size: 0.95rem;
    color: var(--gray-900);
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }

    &::placeholder {
      color: var(--gray-400);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Select = styled.select`
  padding: 0.875rem 1.25rem;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray-300);
  }

  &:focus {
    border-color: var(--primary);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: var(--shadow-premium);
  border: 1px solid rgba(229, 231, 235, 0.5);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: var(--gray-50);
    padding: 1.25rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gray-500);
    border-bottom: 1px solid var(--gray-200);
  }

  td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const RadicadoId = styled.div`
  font-weight: 800;
  color: var(--primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
`;

const PersonInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  .name {
    font-weight: 700;
    color: var(--gray-900);
    font-size: 1rem;
  }
  .role {
    font-size: 0.75rem;
    color: var(--gray-400);
    font-weight: 600;
  }
`;

const Badge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${props => props.bg};
  color: ${props => props.color};
`;

const ActionBtn = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  background: transparent;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: var(--gray-100);
    color: var(--primary);
    transform: scale(1.05);
  }
`;

// Helper for status/risk badges
const getStatusConfig = (status) => {
  const s = status?.toLowerCase();
  if (s === 'abierto') return { bg: '#ECFDF5', color: '#059669', icon: CheckCircle };
  if (s === 'cerrado') return { bg: '#F3F4F6', color: '#4B5563', icon: AlertCircle };
  return { bg: '#FFFBEB', color: '#D97706', icon: AlertTriangle };
};

const getRiskConfig = (risk) => {
  const r = risk?.toLowerCase();
  if (r === 'extremo' || r === 'crítico') return { bg: '#FEF2F2', color: '#DC2626' };
  if (r === 'alto') return { bg: '#FFF7ED', color: '#EA580C' };
  if (r === 'medio') return { bg: '#FFFBEB', color: '#D97706' };
  return { bg: '#F0FDF4', color: '#16A34A' };
};

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = expedientes;

    if (searchTerm) {
      result = result.filter(e =>
        e.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.victima.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter(e => e.estado === statusFilter);
    }

    if (riskFilter) {
      result = result.filter(e => e.nivel_riesgo === riskFilter);
    }

    setFiltered(result);
  }, [searchTerm, statusFilter, riskFilter, expedientes]);

  const fetchData = async () => {
    try {
      const res = await api.get('/expedientes');
      if (res.data.success) {
        const mapped = res.data.data.map(exp => ({
          id: exp.id,
          radicado: exp.radicado_hs,
          victima: `${exp.victima.nombres} ${exp.victima.apellidos}`,
          agresor: exp.agresor ? `${exp.agresor.nombres} ${exp.agresor.apellidos}` : 'No registrado',
          nivel_riesgo: exp.nivel_riesgo,
          estado: exp.estado || 'Abierto',
          fecha: new Date(exp.fecha_radicacion).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        }));
        setExpedientes(mapped);
        setFiltered(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null; // Or skeleton

  return (
    <PageContainer>
      <HeaderSection>
        <TitleGroup>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Expedientes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Gestión centralizada de casos y seguimiento institucional
          </motion.p>
        </TitleGroup>

        <NewButton to="/radicacion">
          <PlusCircle size={20} />
          Registrar Nuevo Caso
        </NewButton>
      </HeaderSection>

      <ControlsCard>
        <SearchBox>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por radicado, víctima o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los Estados</option>
            <option value="Abierto">Abierto</option>
            <option value="Cerrado">Cerrado</option>
          </Select>

          <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="">Todos los Riesgos</option>
            <option value="Bajo">Bajo</option>
            <option value="Medio">Medio</option>
            <option value="Alto">Alto</option>
            <option value="Critico">Crítico</option>
          </Select>
        </FilterGroup>
      </ControlsCard>

      <TableCard>
        <StyledTable>
          <thead>
            <tr>
              <th>Radicado</th>
              <th>Información del Caso</th>
              <th>Nivel de Riesgo</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((exp, idx) => {
                const status = getStatusConfig(exp.estado);
                const risk = getRiskConfig(exp.nivel_riesgo);

                return (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>
                      <RadicadoId>{exp.radicado}</RadicadoId>
                    </td>
                    <td>
                      <PersonInfo>
                        <span className="name">{exp.victima}</span>
                        <span className="role">vs. {exp.agresor}</span>
                      </PersonInfo>
                    </td>
                    <td>
                      <Badge bg={risk.bg} color={risk.color}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: risk.color }} />
                        {exp.nivel_riesgo}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={status.bg} color={status.color}>
                        <status.icon size={14} />
                        {exp.estado}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Calendar size={14} />
                        {exp.fecha}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <ActionBtn to={`/expedientes/${exp.id}`}>
                          <Eye size={20} />
                        </ActionBtn>
                        <ActionBtn to="#">
                          <MoreVertical size={20} />
                        </ActionBtn>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={48} strokeWidth={1} />
                    <p style={{ fontWeight: 600 }}>No se encontraron expedientes que coincidan con la búsqueda.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableCard>
    </PageContainer>
  );
}
