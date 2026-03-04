import React, { useState } from 'react';
import { Camera, Upload, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';

export default function StepEvidencia({ data, onUpdate }) {
    const [previews, setPreviews] = useState(data.evidencias || []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newEvidencia = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    base64: reader.result,
                    preview: file.type.startsWith('image/') ? reader.result : null
                };

                const updated = [...previews, newEvidencia];
                setPreviews(updated);
                onUpdate({ evidencias: updated });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (id) => {
        const updated = previews.filter(p => p.id !== id);
        setPreviews(updated);
        onUpdate({ evidencias: updated });
    };

    return (
        <div className="step-evidencia">
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>
                        <Camera size={20} />
                        Registro de Evidencias Proactivas
                    </h3>
                </div>

                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Adjunte fotografías de lesiones, documentos físicos, audios o capturas de pantalla relevantes para el caso.
                    Estos archivos se guardarán automáticamente en la carpeta segura de Google Drive del expediente.
                </p>

                <div className="upload-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {previews.map((file) => (
                        <div key={file.id} className="evidence-card" style={{
                            position: 'relative',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            aspectRatio: '1/1',
                            border: '1px solid var(--gray-200)',
                            background: 'var(--gray-50)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px'
                        }}>
                            <button
                                onClick={() => removeFile(file.id)}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}
                            >
                                <X size={14} />
                            </button>

                            {file.preview ? (
                                <img src={file.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <FileText size={32} color="var(--gray-400)" />
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.7rem',
                                        marginTop: '5px',
                                        color: 'var(--gray-600)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100px'
                                    }}>
                                        {file.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    <label className="upload-placeholder" style={{
                        borderRadius: '16px',
                        aspectRatio: '1/1',
                        border: '2px dashed var(--gray-300)',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        gap: '8px'
                    }}>
                        <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Plus size={24} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Añadir Archivo</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
