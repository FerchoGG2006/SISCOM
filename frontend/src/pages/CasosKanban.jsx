import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Search,
    Filter,
    MoreVertical,
    User,
    Clock,
    AlertTriangle,
    ChevronRight,
    GripVertical,
    Activity
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

// --- Styled Components ---

const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  gap: 1.5rem;
`;

const KanbanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleArea = styled.div`
  h1 { font-size: 1.8rem; font-weight: 900; color: var(--gray-900); letter-spacing: -0.02em; }
  p { color: var(--gray-500); font-size: 0.95rem; }
`;

const Board = styled.div`
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  padding-bottom: 1.5rem;
  flex: 1;
  
  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-track { background: var(--gray-100); border-radius: 10px; }
  &::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 10px; }
`;

const ColumnContainer = styled.div`
  background: var(--gray-50);
  border-radius: 20px;
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid var(--gray-100);
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.5rem;

  h3 {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--gray-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .count {
    background: white;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--gray-500);
    border: 1px solid var(--gray-200);
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const Card = styled(motion.div)`
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  cursor: grab;
  position: relative;
  
  &:active { cursor: grabbing; }
  &:hover { border-color: var(--primary); }

  .radicado {
    font-weight: 800;
    font-size: 0.9rem;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  .victim-name {
    font-weight: 700;
    font-size: 1rem;
    color: var(--gray-900);
    margin-bottom: 1rem;
    display: block;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-50);
  
  .risk {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    
    &.alto { background: #fee2e2; color: #b91c1c; }
    &.medio { background: #fef3c7; color: #92400e; }
    &.bajo { background: #d1fae5; color: #065f46; }
  }

  .date {
    font-size: 0.75rem;
    color: var(--gray-400);
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

// --- Sortable Components ---

function SortableCard({ id, expediente }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id.toString() });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getRiskClass = (level) => {
        const l = level?.toLowerCase();
        if (l === 'alto' || l === 'extremo') return 'alto';
        if (l === 'medio') return 'medio';
        return 'bajo';
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="radicado">{expediente.radicado_hs}</div>
            <Link to={`/expedientes/${expediente.id}`} className="victim-name" style={{ textDecoration: 'none' }}>
                {expediente.victima.nombres} {expediente.victima.apellidos}
            </Link>

            <CardFooter>
                <span className={`risk ${getRiskClass(expediente.nivel_riesgo)}`}>
                    <AlertTriangle size={12} /> {expediente.nivel_riesgo}
                </span>
                <span className="date">
                    <Clock size={12} /> {new Date(expediente.fecha_radicacion).toLocaleDateString()}
                </span>
            </CardFooter>
        </Card>
    );
}

const STAGES = [
    { id: 'Abierto', label: 'Recibidos' },
    { id: 'En Valoración', label: 'En Valoración' },
    { id: 'En Medidas', label: 'Con Medidas' },
    { id: 'En Seguimiento', label: 'Seguimiento' },
    { id: 'Cerrado', label: 'Cerrados' },
];

export default function CasosKanban() {
    const [items, setItems] = useState({});
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadExpedientes();
    }, []);

    const loadExpedientes = async () => {
        try {
            const res = await api.get('/expedientes?limit=100');
            if (res.data.success) {
                const grouped = STAGES.reduce((acc, stage) => {
                    acc[stage.id] = res.data.data.filter(e => e.estado === stage.id || (stage.id === 'Abierto' && !e.estado));
                    // Temporary fix: if state is 'radicado' (old data), put in 'Abierto'
                    if (stage.id === 'Abierto') {
                        acc[stage.id] = res.data.data.filter(e => e.estado === 'Abierto' || e.estado === 'radicado' || !e.estado);
                    }
                    return acc;
                }, {});
                setItems(grouped);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the source and destination containers (stages)
        let sourceStage = null;
        let destStage = null;

        for (const [stage, cards] of Object.entries(items)) {
            if (cards.find(c => c.id.toString() === activeId)) sourceStage = stage;
            // If dropping directly over a column container
            if (stage === overId) destStage = stage;
            // If dropping over another card
            if (cards.find(c => c.id.toString() === overId)) destStage = stage;
        }

        if (sourceStage && destStage && sourceStage !== destStage) {
            // Optimitic update
            const activeItem = items[sourceStage].find(c => c.id.toString() === activeId);

            setItems(prev => ({
                ...prev,
                [sourceStage]: prev[sourceStage].filter(c => c.id.toString() !== activeId),
                [destStage]: [...prev[destStage], { ...activeItem, estado: destStage }]
            }));

            // Backend update
            try {
                await api.patch(`/expedientes/${activeId}/estado`, { estado: destStage });
            } catch (e) {
                console.error('Failed to update stage:', e);
                loadExpedientes(); // Rollback on error
            }
        }
    };

    if (loading) return <div>Cargando tablero...</div>;

    return (
        <KanbanContainer>
            <KanbanHeader>
                <TitleArea>
                    <h1>Gestión de Flujo</h1>
                    <p>Mueva los casos entre etapas para actualizar su estado legal.</p>
                </TitleArea>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Search/Filters could go here */}
                </div>
            </KanbanHeader>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Board>
                    {STAGES.map((stage) => (
                        <SortableContext
                            key={stage.id}
                            id={stage.id}
                            items={items[stage.id]?.map(i => i.id.toString()) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <ColumnContainer id={stage.id}>
                                <ColumnHeader>
                                    <h3><Activity size={16} color="var(--primary)" /> {stage.label}</h3>
                                    <span className="count">{items[stage.id]?.length || 0}</span>
                                </ColumnHeader>
                                <CardList>
                                    {items[stage.id]?.map((exp) => (
                                        <SortableCard key={exp.id} id={exp.id} expediente={exp} />
                                    ))}
                                </CardList>
                            </ColumnContainer>
                        </SortableContext>
                    ))}
                </Board>
            </DndContext>
        </KanbanContainer>
    );
}
