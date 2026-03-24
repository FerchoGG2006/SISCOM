import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const PageContainer = styled.div`
    padding: 2rem;
    height: calc(100vh - 80px); /* Ajustar según navbar */
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

const Title = styled.h1`
    color: var(--gray-900);
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: 800;
`;

const CalendarWrapper = styled.div`
    background: white;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 20px;
    padding: 1.5rem;
    flex-grow: 1;
    min-height: 600px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);

    .fc {
        color: var(--gray-800);
        font-family: 'Inter', sans-serif;
    }

    .fc-theme-standard td, .fc-theme-standard th {
        border-color: rgba(229, 231, 235, 0.8);
    }

    .fc-col-header-cell {
        background: #f9fafb;
        padding: 0.5rem 0;
        color: var(--gray-600);
    }

    .fc-day-today {
        background: rgba(79, 70, 229, 0.05) !important;
    }

    .fc-event {
        cursor: pointer;
        border-radius: 6px;
        font-size: 0.85em;
        border: none;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .fc-daygrid-block-event, .fc-timegrid-event {
        padding: 4px;
        color: white !important;
        font-weight: 600;
        
        .fc-event-title, .fc-event-time {
            color: white !important;
        }
    }

    .fc-daygrid-dot-event {
        background: transparent !important;
        padding: 4px;
        font-weight: 600;
        
        &:hover {
            background: rgba(0, 0, 0, 0.05) !important;
        }

        .fc-event-title, .fc-event-time {
            color: var(--gray-800) !important;
        }
    }

    .fc-toolbar-title {
        font-weight: 800;
        color: var(--gray-900);
        text-transform: capitalize;
    }

    .fc-button-primary {
        background-color: var(--primary);
        border-color: var(--primary);
        font-weight: 600;
        text-transform: capitalize;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
        
        &:hover {
            background-color: var(--primary-dark);
            border-color: var(--primary-dark);
        }
        &:disabled {
            background-color: var(--gray-300);
            border-color: var(--gray-300);
            color: var(--gray-500);
        }
    }
    
    .fc-button-active {
        background-color: #3730A3 !important;
        border-color: #3730A3 !important;
    }
`;

// Simple Modal for Event Details
const ModalOverlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled(motion.div)`
    background: white;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 20px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    color: var(--gray-900);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
`;

const EventProp = styled.div`
    margin-bottom: 1.2rem;
    strong { color: var(--gray-500); display: block; font-size: 0.85rem; margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.05em; }
    span { color: var(--gray-900); font-size: 1.1rem; font-weight: 600; }
`;

export default function Agenda() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/calendario');
            
            // Mapear eventos con colores según su "tipo"
            const coloredEvents = data.map(ev => {
                let color = '#3b82f6'; // Default (Audiencia)
                if (ev.extendedProps.tipo.includes('Psicología')) color = '#8b5cf6'; // Morado
                if (ev.extendedProps.tipo.includes('Social')) color = '#10b981'; // Verde
                
                return { ...ev, backgroundColor: color };
            });

            setEvents(coloredEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            ...clickInfo.event.extendedProps
        });
    };

    return (
        <PageContainer>
            <Title>Agenda Legal y Audiencias</Title>

            <CalendarWrapper>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    }}
                    locales={[esLocale]}
                    locale="es"
                    firstDay={1}
                    events={events}
                    eventClick={handleEventClick}
                    height="100%"
                />
            </CalendarWrapper>

            <AnimatePresence>
                {selectedEvent && (
                    <ModalOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEvent(null)}
                    >
                        <ModalContent
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem' }}>{selectedEvent.title}</h2>
                            <EventProp>
                                <strong>Tipo de Cita</strong>
                                <span>{selectedEvent.tipo}</span>
                            </EventProp>
                            <EventProp>
                                <strong>Radicado Relacionado</strong>
                                <span>{selectedEvent.radicado || 'N/A'}</span>
                            </EventProp>
                            <EventProp>
                                <strong>Lugar/Modalidad</strong>
                                <span>{selectedEvent.lugar}</span>
                            </EventProp>
                            <EventProp>
                                <strong>Fecha y Hora</strong>
                                <span>{selectedEvent.start ? new Date(selectedEvent.start).toLocaleString('es-CO') : 'Sin fecha'}</span>
                            </EventProp>
                            <EventProp>
                                <strong>Estado</strong>
                                <span style={{ color: selectedEvent.estado === 'Pendiente' ? '#ea580c' : '#059669' }}>{selectedEvent.estado}</span>
                            </EventProp>
                            
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                style={{
                                    marginTop: '2rem', padding: '0.8rem 1.5rem', 
                                    background: 'var(--gray-100)', color: 'var(--gray-800)', 
                                    border: '1px solid var(--gray-200)', borderRadius: '12px', cursor: 'pointer',
                                    width: '100%', fontWeight: 700, transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.background = 'var(--gray-200)'}
                                onMouseLeave={e => e.target.style.background = 'var(--gray-100)'}
                            >
                                Cerrar
                            </button>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </PageContainer>
    );
}
