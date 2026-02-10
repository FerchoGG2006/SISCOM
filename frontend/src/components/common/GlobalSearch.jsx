import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, X, Command } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
`;

const SpotlightBox = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  height: fit-content;
  overflow: hidden;
  border: 1px solid var(--glass-border);
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  gap: 1rem;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.15rem;
    color: var(--text-main);
    background: transparent;

    &::placeholder {
      color: #94a3b8;
    }
  }
`;

const ResultsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
`;

const ResultItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover, &.selected {
    background: #f8fafc;
  }

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.type === 'persona' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
    color: ${props => props.type === 'persona' ? 'var(--primary)' : '#059669'};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    flex: 1;
    h4 {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }
    p {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }
  }

  .type-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }
`;

const ShortcutHint = styled.div`
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #94a3b8;

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: white;
    padding: 0.1rem 0.4rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: #475569;
  }
`;

export const GlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:4000/api/v1/search?q=${query}`);
                setResults(res.data.results);
                setSelectedIndex(0);
            } catch (err) {
                console.error(err);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result) => {
        navigate(result.url);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <Overlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <SpotlightBox
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <SearchInputWrapper>
                                <Search size={22} color="var(--primary)" />
                                <input
                                    ref={inputRef}
                                    placeholder="¿Qué buscas? (Ctrl+K)"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <X size={20} color="#94a3b8" cursor="pointer" onClick={() => setIsOpen(false)} />
                            </SearchInputWrapper>

                            <ResultsList>
                                {results.length > 0 ? (
                                    results.map((result, idx) => (
                                        <ResultItem
                                            key={`${result.type}-${result.id}`}
                                            type={result.type}
                                            className={selectedIndex === idx ? 'selected' : ''}
                                            onClick={() => handleSelect(result)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                        >
                                            <div className="icon">
                                                {result.type === 'persona' ? <User size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="content">
                                                <h4>{result.title}</h4>
                                                <p>{result.subtitle}</p>
                                            </div>
                                            <span className="type-label">{result.type}</span>
                                        </ResultItem>
                                    ))
                                ) : (
                                    query.length > 1 && (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                            No se encontraron resultados para "{query}"
                                        </div>
                                    )
                                )}
                            </ResultsList>

                            <ShortcutHint>
                                <div>
                                    Presiona <span>↵</span> para seleccionar
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <span>↑↓</span> para navegar
                                    <span>esc</span> para cerrar
                                </div>
                            </ShortcutHint>
                        </SpotlightBox>
                    </Overlay>
                )}
            </AnimatePresence>
        </>
    );
};
