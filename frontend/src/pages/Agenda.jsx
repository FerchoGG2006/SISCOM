import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
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
    color: #f1f5f9;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
`;

const CalendarWrapper = styled.div`
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    flex-grow: 1;
    min-height: 600px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

    .fc {
        color: #e2e8f0;
        font-family: 'Inter', sans-serif;
    }

    .fc-theme-standard td, .fc-theme-standard th {
        border-color: rgba(255, 255, 255, 0.1);
    }

    .fc-day-today {
        background: rgba(59, 130, 246, 0.1) !important;
    }

    .fc-event {
        cursor: pointer;
        border-radius: 4px;
        padding: 2px 4px;
        font-size: 0.85em;
        border: none;
    }

    .fc-button-primary {
        background-color: #3b82f6;
        border-color: #3b82f6;
        &:hover {
            background-color: #2563eb;
            border-color: #2563eb;
        }
        &:disabled {
            background-color: #1e3a8a;
            border-color: #1e3a8a;
        }
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
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    color: #f8fafc;
`;

const EventProp = styled.div`
    margin-bottom: 1rem;
    strong { color: #94a3b8; display: block; font-size: 0.85rem; margin-bottom: 0.2rem; }
    span { color: #f1f5f9; font-size: 1.1rem; }
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
                            <h2 style={{ marginBottom: '1.5rem', color: '#60a5fa' }}>{selectedEvent.title}</h2>
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
                                <span>{selectedEvent.estado}</span>
                            </EventProp>
                            
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                style={{
                                    marginTop: '2rem', padding: '0.8rem 1.5rem', 
                                    background: '#3f3f46', color: 'white', 
                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    width: '100%'
                                }}
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
