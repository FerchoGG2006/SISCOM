import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    File,
    Image as ImageIcon,
    Music,
    Video,
    X,
    Plus,
    Loader2,
    ShieldCheck,
    HardDrive
} from 'lucide-react';
import api from '../../services/api';

const VaultContainer = styled.div`
  margin-top: 1rem;
`;

const UploadZone = styled.div`
  border: 2px dashed var(--gray-200);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  background: var(--gray-50);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: var(--primary-glow);
  }

  input { display: none; }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const EvidenceCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  border: 1px solid var(--gray-100);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }

  .file-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--gray-700);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--success);
`;

export default function EvidenceVault({ expedienteId, documentos, onRefresh }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('id_expediente', expedienteId);
        formData.append('tipo', 'Evidencia Digital');

        try {
            await api.post('/dms/subir', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onRefresh) onRefresh();
        } catch (err) {
            alert('Error al subir evidencia. Verifique conexión con Drive.');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext)) return <ImageIcon size={32} color="#6366F1" />;
        if (['mp4', 'mov', 'avi'].includes(ext)) return <Video size={32} color="#F43F5E" />;
        if (['mp3', 'wav'].includes(ext)) return <Music size={32} color="#10B981" />;
        return <File size={32} color="#64748B" />;
    };

    const multimediaDocs = documentos?.filter(d =>
        !d.nombre.toLowerCase().includes('.pdf') || d.tipo === 'Evidencia Digital'
    ) || [];

    return (
        <VaultContainer>
            <UploadZone onClick={() => document.getElementById('vault-upload').click()}>
                <input type="file" id="vault-upload" onChange={handleFileChange} disabled={uploading} />
                {uploading ? (
                    <>
                        <Loader2 size={40} className="spinner" color="var(--primary)" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Subiendo a Bóveda Digital...</p>
                    </>
                ) : (
                    <>
                        <div style={{ background: 'white', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Plus size={30} color="var(--primary)" />
                        </div>
                        <p style={{ fontWeight: 800, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Añadir Evidencia</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Fotos, Videos, Audios o Documentos (Max 25MB)</p>
                    </>
                )}
            </UploadZone>

            {multimediaDocs.length > 0 && (
                <FileGrid>
                    {multimediaDocs.map((doc) => (
                        <EvidenceCard
                            key={doc.id}
                            as="a"
                            href={doc.url_drive}
                            target="_blank"
                            style={{ textDecoration: 'none' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <StatusBadge><ShieldCheck size={14} /></StatusBadge>
                            {getFileIcon(doc.nombre)}
                            <span className="file-name" title={doc.nombre}>{doc.nombre}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600 }}>
                                {new Date(doc.generado_el || Date.now()).toLocaleDateString()}
                            </div>
                        </EvidenceCard>
                    ))}
                </FileGrid>
            )}

            {multimediaDocs.length === 0 && !uploading && (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                    <HardDrive size={32} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.85rem' }}>No hay archivos multimedia cargados aún.</p>
                </div>
            )}
        </VaultContainer>
    );
}
