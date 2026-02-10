import { useState, useEffect } from 'react'
import {
    Users,
    Search,
    User,
    UserX,
    Eye,
    Shield,
    Calendar,
    Phone,
    MapPin,
    AlertTriangle
} from 'lucide-react'
import api from '../services/api'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, StyledInput } from '../components/common/GlassCard'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PersonasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const PersonaCard = styled(GlassCard)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.role === 'victima' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.role === 'victima' ? 'var(--success)' : 'var(--danger)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  border: 2px solid ${props => props.role === 'victima' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const RoleBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  background: ${props => props.type === 'victima' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.type === 'victima' ? 'var(--success)' : 'var(--danger)'};
  border: 1px solid ${props => props.type === 'victima' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-muted);

  svg {
    color: var(--primary);
  }
`;

export default function Personas() {
    const [personas, setPersonas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    useEffect(() => {
        loadPersonas()
    }, [roleFilter])

    const loadPersonas = async () => {
        try {
            setLoading(true)
            const params = {}
            if (roleFilter !== 'all') params.role = roleFilter

            const response = await api.get('/personas', { params })
            if (response.data.success) {
                setPersonas(response.data.data)
            }
        } catch (error) {
            console.error('Error loading personas:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPersonas = personas.filter(p =>
        p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_documento.includes(searchTerm)
    )

    return (
        <PageContainer>
            <PageHeader>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Gestión de Personas</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Registro unificado de víctimas y agresores.</p>
                </div>
            </PageHeader>

            <GlassCard style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <StyledInput
                        placeholder="Buscar por nombre, apellido o documento..."
                        style={{ paddingLeft: '3rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn-premium ${roleFilter === 'all' ? 'btn-premium-primary' : ''}`}
                        style={{ padding: '0.75rem 1.25rem' }}
                        onClick={() => setRoleFilter('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`btn-premium ${roleFilter === 'victima' ? 'btn-premium-primary' : ''}`}
                        style={{ padding: '0.75rem 1.25rem' }}
                        onClick={() => setRoleFilter('victima')}
                    >
                        Víctimas
                    </button>
                    <button
                        className={`btn-premium ${roleFilter === 'agresor' ? 'btn-premium-primary' : ''}`}
                        style={{ padding: '0.75rem 1.25rem' }}
                        onClick={() => setRoleFilter('agresor')}
                    >
                        Agresores
                    </button>
                </div>
            </GlassCard>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando personas...</div>
            ) : (
                <PersonasGrid>
                    <AnimatePresence>
                        {filteredPersonas.map((persona) => (
                            <PersonaCard
                                key={persona.id}
                                as={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <Avatar role={persona.es_victima ? 'victima' : 'agresor'}>
                                        {persona.nombres.charAt(0)}{persona.apellidos.charAt(0)}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                            {persona.nombres} {persona.apellidos}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {persona.es_victima && <RoleBadge type="victima">Víctima</RoleBadge>}
                                            {persona.es_agresor && <RoleBadge type="agresor">Agresor</RoleBadge>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <DetailRow>
                                        <Shield size={16} />
                                        <span>{persona.tipo_documento}: {persona.numero_documento}</span>
                                    </DetailRow>
                                    <DetailRow>
                                        <Phone size={16} />
                                        <span>{persona.telefono || 'Sin teléfono'}</span>
                                    </DetailRow>
                                    <DetailRow>
                                        <MapPin size={16} />
                                        <span>{persona.barrio ? `${persona.barrio}, Comuna ${persona.comuna}` : 'Sin dirección'}</span>
                                    </DetailRow>
                                </div>

                                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Víctima en</div>
                                            <div style={{ fontWeight: 800, color: 'var(--success)' }}>{persona._count.expedientesVictima} casos</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Agresor en</div>
                                            <div style={{ fontWeight: 800, color: 'var(--danger)' }}>{persona._count.expedientesAgresor} casos</div>
                                        </div>
                                    </div>
                                    <button className="btn-premium" style={{ padding: '0.5rem' }}>
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </PersonaCard>
                        ))}
                    </AnimatePresence>
                </PersonasGrid>
            )}
        </PageContainer>
    )
}
