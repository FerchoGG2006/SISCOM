import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import socket from '../../services/socket';
import api from '../../services/api';

const BellContainer = styled.div`
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
  color: var(--gray-600);

  &:hover {
    background: var(--gray-100);
    color: var(--primary);
  }
`;

const Badge = styled(motion.div)`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: var(--danger);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
`;

const Dropdown = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: -10px;
  width: 360px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  border: 1px solid var(--gray-100);
  z-index: 1000;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h4 { margin: 0; font-size: 1rem; color: var(--gray-900); }
  button { 
    background: none; border: none; color: var(--primary); 
    font-size: 0.8rem; font-weight: 600; cursor: pointer;
    &:hover { text-decoration: underline; }
  }
`;

const List = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  .empty {
    padding: 2rem;
    text-align: center;
    color: var(--gray-400);
    font-size: 0.9rem;
  }
`;

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--gray-50);
  background: ${props => props.leida ? 'white' : 'rgba(79, 70, 229, 0.04)'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: var(--gray-50);
  }

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.danger { background: #fee2e2; color: #dc2626; }
    &.warning { background: #fef3c7; color: #d97706; }
    &.success { background: #dcfce7; color: #16a34a; }
    &.info { background: #e0e7ff; color: #4f46e5; }
  }

  .content {
    flex: 1;
    .title { font-weight: 700; color: var(--gray-900); font-size: 0.85rem; margin-bottom: 0.2rem; }
    .msg { font-size: 0.8rem; color: var(--gray-500); line-height: 1.4; }
    .time { font-size: 0.7rem; color: var(--gray-400); margin-top: 0.4rem; }
  }
`;

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.leida).length;

    useEffect(() => {
        fetchNotifications();

        socket.on('notification', (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            // Mostrar toast nativo o sonido si se desea
        });

        return () => { socket.off('notification'); };
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notificaciones');
            if (res.data.success) setNotifications(res.data.data);
        } catch (e) {
            console.error('Error fetching notifications');
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'danger': return <AlertCircle size={18} />;
            case 'warning': return <AlertCircle size={18} />;
            case 'success': return <Check size={18} />;
            default: return <Info size={18} />;
        }
    };

    return (
        <BellContainer onClick={() => setIsOpen(!isOpen)}>
            <Bell size={24} />
            <AnimatePresence>
                {unreadCount > 0 && (
                    <Badge
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <Dropdown
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    >
                        <Header>
                            <h4>Notificaciones</h4>
                            {unreadCount > 0 && <button onClick={markAllRead}>Marcar todas</button>}
                        </Header>
                        <List onClick={(e) => e.stopPropagation()}>
                            {notifications.length === 0 ? (
                                <div className="empty">No hay notificaciones</div>
                            ) : (
                                notifications.map(n => (
                                    <NotificationItem key={n.id} leida={n.leida} onClick={() => markAsRead(n.id)}>
                                        <div className={`icon ${n.tipo}`}>
                                            {getIcon(n.tipo)}
                                        </div>
                                        <div className="content">
                                            <div className="title">{n.titulo}</div>
                                            <div className="msg">{n.mensaje}</div>
                                            <div className="time">{new Date(n.created_at).toLocaleString()}</div>
                                        </div>
                                    </NotificationItem>
                                ))
                            )}
                        </List>
                    </Dropdown>
                )}
            </AnimatePresence>
        </BellContainer>
    );
}
