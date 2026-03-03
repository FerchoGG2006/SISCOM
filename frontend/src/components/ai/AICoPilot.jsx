import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Send,
    X,
    MessageSquare,
    Sparkles,
    User,
    Loader2,
    FileText,
    Shield,
    Clock
} from 'lucide-react';
import api from '../../services/api';

const ChatBubble = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
  z-index: 1000;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const SidebarContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--gray-100);

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    h3 { 
      margin: 0; 
      font-size: 1.1rem; 
      font-weight: 800; 
      color: var(--gray-900);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    span { 
      font-size: 0.75rem; 
      color: var(--gray-500); 
      font-weight: 600;
      display: block;
    }
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 10px; }
`;

const Message = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  align-self: ${props => props.isBot ? 'flex-start' : 'flex-end'};
  flex-direction: ${props => props.isBot ? 'row' : 'row-reverse'};
  max-width: 85%;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: ${props => props.isBot ? 'var(--primary-light)' : 'var(--gray-100)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.isBot ? 'var(--primary)' : 'var(--gray-500)'};
    flex-shrink: 0;
  }

  .content {
    background: ${props => props.isBot ? 'var(--gray-50)' : 'var(--primary)'};
    color: ${props => props.isBot ? 'var(--gray-800)' : 'white'};
    padding: 0.85rem 1.1rem;
    border-radius: ${props => props.isBot ? '0 18px 18px 18px' : '18px 0 18px 18px'};
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    box-shadow: ${props => props.isBot ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.2)'};
  }
`;

const InputArea = styled.div`
  padding: 1.5rem;
  background: white;
  border-top: 1px solid var(--gray-100);
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  textarea {
    flex: 1;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 14px;
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
    color: var(--gray-900);
    resize: none;
    max-height: 120px;
    outline: none;
    transition: all 0.2s;
    
    &:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ActionTag = styled.button`
  padding: 0.5rem 0.75rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-color: var(--primary);
    color: var(--primary);
  }
`;

export default function AICoPilot({ expedienteId, data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: `Hola, soy tu SISCOM Co-pilot. Estoy analizando el expediente ${data.radicado_hs}. ¿En qué puedo ayudarte hoy?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (customMsg) => {
        const msgToSend = customMsg || input;
        if (!msgToSend.trim() || loading) return;

        const userMessage = { role: 'user', content: msgToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Map history to Gemini format
            const history = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const res = await api.post(`/ai/chat/${expedienteId}`, {
                message: msgToSend,
                history: history
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, hubo un error de conexión.' }]);
        } finally {
            setLoading(false);
        }
    };

    const actions = [
        { icon: <Shield size={14} />, label: 'Sugerir medidas', prompt: 'Basado en el relato, ¿qué medidas de protección específicas recomiendas solicitar?' },
        { icon: <FileText size={14} />, label: 'Borrador de Acta', prompt: 'Ayúdame a redactar un borrador profesional para el Acta de Recepción de este caso.' },
        { icon: <Clock size={14} />, label: 'Plan de acción', prompt: '¿Cuál debería ser el siguiente paso procesal urgente para este expediente?' },
    ];

    return (
        <>
            <ChatBubble onClick={() => setIsOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Sparkles size={28} />
            </ChatBubble>

            <AnimatePresence>
                {isOpen && (
                    <SidebarContainer
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <Header>
                            <div className="title">
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '10px' }}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3>SISCOM Co-pilot <Sparkles size={14} style={{ color: '#F59E0B' }} /></h3>
                                    <span>Asistente Jurídico Expert</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                <X size={24} />
                            </button>
                        </Header>

                        <MessageList ref={scrollRef}>
                            {messages.map((m, i) => (
                                <Message key={i} isBot={m.role === 'model'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="avatar">
                                        {m.role === 'model' ? <Bot size={18} /> : <User size={18} />}
                                    </div>
                                    <div className="content">{m.content}</div>
                                </Message>
                            ))}
                            {loading && (
                                <Message isBot={true}>
                                    <div className="avatar"><Bot size={18} /></div>
                                    <div className="content">
                                        <Loader2 size={18} className="animate-spin" />
                                    </div>
                                </Message>
                            )}
                        </MessageList>

                        <InputArea>
                            <QuickActions>
                                {actions.map((act, i) => (
                                    <ActionTag key={i} onClick={() => handleSend(act.prompt)}>
                                        {act.icon} {act.label}
                                    </ActionTag>
                                ))}
                            </QuickActions>
                            <div className="input-wrapper">
                                <textarea
                                    placeholder="Escribe tu consulta legal..."
                                    rows={2}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <SendButton disabled={!input.trim() || loading} onClick={() => handleSend()}>
                                    <Send size={20} />
                                </SendButton>
                            </div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '1rem' }}>
                                SISCOM AI puede cometer errores. Verifique siempre la normativa legal aplicable.
                            </p>
                        </InputArea>
                    </SidebarContainer>
                )}
            </AnimatePresence>
        </>
    );
}
