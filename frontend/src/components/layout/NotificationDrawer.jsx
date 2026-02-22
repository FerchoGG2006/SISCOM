import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
`;

const DrawerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  background: white;
  z-index: 201;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--gray-900);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NotificationItem = styled(motion.div)`
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid ${props => props.unread ? 'var(--primary-light)' : 'var(--gray-100)'};
  background: ${props => props.unread ? 'var(--primary-glow)' : 'white'};
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateX(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.bg};
  color: ${props => props.color};
`;

const InfoText = styled.div`
  flex: 1;
  h4 { margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 700; color: var(--gray-900); }
  p { margin: 0; font-size: 0.85rem; color: var(--gray-600); line-height: 1.4; }
  span { font-size: 0.75rem; color: var(--gray-400); margin-top: 0.5rem; display: block; }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--gray-100);
  background: var(--gray-50);
`;

const ClearBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    background: var(--gray-50);
    color: var(--primary);
  }
`;

export default function NotificationDrawer({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const loadNotifications = async () => {
        try {
            const res = await api.get('/notificaciones');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            loadNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            loadNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'danger': return { icon: ShieldAlert, bg: '#FEE2E2', color: '#DC2626' };
            case 'warning': return { icon: AlertTriangle, bg: '#FEF3C7', color: '#D97706' };
            case 'success': return { icon: CheckCircle2, bg: '#ECFDF5', color: '#059669' };
            default: return { icon: Info, bg: '#E0F2FE', color: '#0284C7' };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <DrawerOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <DrawerContainer
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <Header>
                            <h2><Bell size={24} /> Notificaciones</h2>
                            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                <X size={24} />
                            </button>
                        </Header>

                        <ScrollContent>
                            {notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                    <Info size={48} style={{ marginBottom: '1rem' }} />
                                    <p>No tienes notificaciones pendientes</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const { icon: Icon, bg, color } = getIcon(n.tipo);
                                    return (
                                        <NotificationItem
                                            key={n.id}
                                            unread={!n.leida}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <IconBox bg={bg} color={color}>
                                                <Icon size={20} />
                                            </IconBox>
                                            <InfoText>
                                                <h4>{n.titulo}</h4>
                                                <p>{n.mensaje}</p>
                                                <span>{new Date(n.created_at).toLocaleString()}</span>
                                            </InfoText>
                                            {!n.leida && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: '0.5rem' }} />}
                                        </NotificationItem>
                                    );
                                })
                            )}
                        </ScrollContent>

                        <Footer>
                            <ClearBtn onClick={markAllAsRead}>
                                <Check size={18} /> Marcar todas como leídas
                            </ClearBtn>
                        </Footer>
                    </DrawerContainer>
                </>
            )}
        </AnimatePresence>
    );
}
