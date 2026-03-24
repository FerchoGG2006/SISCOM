import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Network, AlertCircle, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../services/api';
import { GlassCard } from '../components/common/GlassCard';

/* Estilos de Contenedor */
const PageContainer = styled.div`
  padding: 1rem 2rem;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--gray-900);
`;

const GraphWrapper = styled.div`
  flex: 1;
  background: #0f172a;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
`;

const FloatingPanel = styled(GlassCard)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  color: var(--gray-900);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  pointer-events: auto;
  z-index: 10;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const ControlBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.5);
  }
`;

export default function Redes() {
    const fgRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [dimension, setDimension] = useState({ width: 800, height: 600 });
    const wrapperRef = useRef();

    useEffect(() => {
        const fetchGrafos = async () => {
            try {
                const response = await api.get('/redes/grafos');
                if (response.data && response.data.success) {
                    setGraphData(response.data.data);
                }
            } catch (error) {
                console.error("Error cargando el grafo de reincidencia:", error);
            }
        };
        fetchGrafos();
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (wrapperRef.current) {
                setDimension({
                    width: wrapperRef.current.clientWidth,
                    height: wrapperRef.current.clientHeight
                });
            }
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        // Un ligero retardo para asegurar que el DOM estire el flex: 1
        setTimeout(updateDimensions, 200);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleNodeClick = useCallback(node => {
        setSelectedNode(node);
        // Animar cámara hacia el nodo
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(3, 1000);
        }
    }, [fgRef]);

    const handleZoomIn = () => fgRef.current && fgRef.current.zoom(fgRef.current.zoom() * 1.5, 400);
    const handleZoomOut = () => fgRef.current && fgRef.current.zoom(fgRef.current.zoom() / 1.5, 400);
    const handleCenter = () => fgRef.current && fgRef.current.zoomToFit(400);

    return (
        <PageContainer>
            <Header>
                <Title>
                    <Network size={36} color="#3b82f6" />
                    Análisis de Reincidencia (Redes)
                </Title>
                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-main)', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#b91c1c' }}></div>
                        Agresor Reincidente
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb923c' }}></div>
                        Agresor
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                        Víctima
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div>
                        Expediente
                    </span>
                </div>
            </Header>

            <GraphWrapper ref={wrapperRef}>
                <ForceGraph2D
                    ref={fgRef}
                    width={dimension.width}
                    height={dimension.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={node => node.color}
                    nodeVal={node => node.val}
                    linkColor={() => 'rgba(255, 255, 255, 0.15)'}
                    linkWidth={1.5}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    onNodeClick={handleNodeClick}
                    backgroundColor="#0f172a"
                    nodeCanvasObjectMode={() => 'after'}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        
                        // Solo dibujar nombres completos si hacemos un poco de zoom
                        if (globalScale > 1.5 || node.reincidente) {
                            ctx.fillText(label, node.x, node.y + (node.val / 2) + 2);
                        }
                    }}
                />

                <Controls>
                    <ControlBtn onClick={handleZoomIn}><ZoomIn size={20} /></ControlBtn>
                    <ControlBtn onClick={handleZoomOut}><ZoomOut size={20} /></ControlBtn>
                    <ControlBtn onClick={handleCenter}><Maximize size={20} /></ControlBtn>
                </Controls>

                {selectedNode && (
                    <FloatingPanel>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(229, 231, 235, 0.8)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--gray-900)', fontWeight: 800 }}>Detalles del Nodo</h3>
                            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        {selectedNode.reincidente && (
                            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.8rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
                                <AlertCircle size={18} />
                                ¡ALERTA DE REINCIDENCIA!
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.2rem', fontWeight: 600 }}>Identificador</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--gray-900)' }}>{selectedNode.name}</strong>
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.2rem', fontWeight: 600 }}>Clase / Grupo</span>
                            <span style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 700 }}>
                                {selectedNode.group}
                            </span>
                        </div>

                        {selectedNode.riesgo && (
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Riesgo Inicial</span>
                                <span style={{ color: selectedNode.riesgo === 'Crítico' ? '#ef4444' : '#3b82f6', fontWeight: 700 }}>
                                    {selectedNode.riesgo}
                                </span>
                            </div>
                        )}
                    </FloatingPanel>
                )}
            </GraphWrapper>
        </PageContainer>
    );
}
