import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Edit,
    Trash2,
    Shield,
    Search,
    X,
    Check,
    Mail,
    Briefcase,
    ShieldCheck,
    UserCircle,
    Power
} from 'lucide-react';
import api from '../services/api';

// --- Styled Components (Legal Dashboard Aesthetic) ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    margin: 0;
  }
  p {
    color: var(--gray-500);
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }
`;

const AddButton = styled.button`
  background: var(--primary);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    background: var(--primary-dark);
  }
`;

const Toolbar = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 20px;
  box-shadow: var(--shadow-premium);
  display: flex;
  gap: 1rem;
  align-items: center;
  border: 1px solid rgba(229, 231, 235, 0.5);
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;

  svg {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-400);
  }

  input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 14px;
    font-size: 0.95rem;
    color: var(--gray-900);
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--shadow-premium);
  border: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--primary-light);
  }
`;

const UserHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.active ? 'var(--primary-glow)' : 'var(--gray-100)'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--gray-400)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
`;

const UserInfo = styled.div`
  flex: 1;
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--gray-900);
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--gray-500);
    font-weight: 600;
  }
`;

const RoleBadge = styled.span`
  align-self: flex-start;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.bg};
  color: ${props => props.color};
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--gray-600);
  font-weight: 500;

  svg {
    color: var(--gray-400);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-50);
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'var(--gray-50)'};
  color: ${props => props.variant === 'danger' ? 'var(--danger)' : 'var(--gray-500)'};

  &:hover {
    background: ${props => props.variant === 'danger' ? 'var(--danger)' : 'var(--primary)'};
    color: white;
    transform: scale(1.05);
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 30px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  background: var(--gray-50);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-200);

  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--gray-900);
  }
`;

const Form = styled.form`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--gray-700);
  }

  input, select {
    padding: 0.875rem 1rem;
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    font-size: 0.95rem;
    color: var(--gray-900);
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }
  }
`;

const ROLES = [
    { value: 'admin', label: 'Administrador', bg: '#FEF2F2', color: '#DC2626' },
    { value: 'comisario', label: 'Comisario(a)', bg: '#F5F3FF', color: '#7C3AED' },
    { value: 'psicologo', bg: '#ECFEFF', label: 'Psicólogo(a)', color: '#0891B2' },
    { value: 'trabajador_social', label: 'Trabajador(a) Social', bg: '#ECFDF5', color: '#059669' },
    { value: 'abogado', label: 'Abogado(a)', bg: '#FFF7ED', color: '#D97706' },
    { value: 'auxiliar', label: 'Auxiliar', bg: '#F9FAFB', color: '#6B7280' },
];

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        rol: 'auxiliar',
        cargo: '',
        activo: true
    });

    useEffect(() => {
        loadUsuarios();
    }, []);

    useEffect(() => {
        const result = usuarios.filter(u =>
            `${u.nombres} ${u.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltered(result);
    }, [searchTerm, usuarios]);

    const loadUsuarios = async () => {
        setLoading(true);
        try {
            const res = await api.get('/usuarios');
            if (res.data.success) {
                setUsuarios(res.data.data);
                setFiltered(res.data.data);
            }
        } catch (e) {
            console.error('Error cargando usuarios:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.email,
                password: '',
                rol: user.rol,
                cargo: user.cargo || '',
                activo: user.activo
            });
        } else {
            setEditingUser(null);
            setFormData({
                nombres: '',
                apellidos: '',
                email: '',
                password: '',
                rol: 'auxiliar',
                cargo: '',
                activo: true
            });
        }
        setShowModal(true);
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.put(`/usuarios/${user.id}`, { ...user, activo: !user.activo });
            loadUsuarios();
        } catch (e) {
            alert('Error al cambiar estado');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/usuarios/${editingUser.id}`, formData);
            } else {
                await api.post('/usuarios', formData);
            }
            setShowModal(false);
            loadUsuarios();
        } catch (e) {
            alert(e.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const getRoleInfo = (roleValue) => {
        return ROLES.find(r => r.value === roleValue) || ROLES[5];
    };

    if (loading) return null;

    return (
        <Container>
            <Header>
                <TitleGroup>
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>Gestión Humana</motion.h1>
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        Administra el equipo interdisciplinario y sus permisos
                    </motion.p>
                </TitleGroup>

                <AddButton onClick={() => handleOpenModal()}>
                    <UserPlus size={20} />
                    Vincular Nuevo Usuario
                </AddButton>
            </Header>

            <Toolbar>
                <SearchBox>
                    <Search size={20} />
                    <input
                        placeholder="Buscar por nombre, apellido o correo electrónico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBox>
            </Toolbar>

            <UserGrid>
                {filtered.map((user, idx) => {
                    const roleInfo = getRoleInfo(user.rol);
                    return (
                        <UserCard
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <UserHeader>
                                <Avatar active={user.activo}>
                                    {user.nombres[0]}{user.apellidos[0]}
                                </Avatar>
                                <UserInfo>
                                    <h3>{user.nombres} {user.apellidos}</h3>
                                    <p>{user.cargo || 'Funcionario'}</p>
                                </UserInfo>
                                <RoleBadge bg={roleInfo.bg} color={roleInfo.color}>
                                    <Shield size={14} />
                                    {roleInfo.label}
                                </RoleBadge>
                            </UserHeader>

                            <MetaList>
                                <MetaItem>
                                    <Mail size={16} />
                                    {user.email}
                                </MetaItem>
                                <MetaItem>
                                    <Briefcase size={16} />
                                    Rol: {user.rol}
                                </MetaItem>
                                <MetaItem>
                                    <ShieldCheck size={16} />
                                    Estado: <span style={{ color: user.activo ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{user.activo ? 'Activo' : 'Inactivo'}</span>
                                </MetaItem>
                            </MetaList>

                            <Actions>
                                <IconButton title="Cambiar Estado" variant={user.activo ? 'danger' : 'success'} onClick={() => handleToggleStatus(user)}>
                                    <Power size={18} />
                                </IconButton>
                                <IconButton title="Editar Información" onClick={() => handleOpenModal(user)}>
                                    <Edit size={18} />
                                </IconButton>
                            </Actions>
                        </UserCard>
                    );
                })}
            </UserGrid>

            <AnimatePresence>
                {showModal && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                            <ModalHeader>
                                <h2>{editingUser ? 'Editar Funcionario' : 'Nuevo Funcionario'}</h2>
                                <IconButton onClick={() => setShowModal(false)}><X size={20} /></IconButton>
                            </ModalHeader>

                            <Form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <FormGroup>
                                        <label>Nombres</label>
                                        <input required value={formData.nombres} onChange={e => setFormData({ ...formData, nombres: e.target.value })} />
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Apellidos</label>
                                        <input required value={formData.apellidos} onChange={e => setFormData({ ...formData, apellidos: e.target.value })} />
                                    </FormGroup>
                                </div>

                                <FormGroup>
                                    <label>Correo Electrónico</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </FormGroup>

                                <FormGroup>
                                    <label>{editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                                    <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </FormGroup>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <FormGroup>
                                        <label>Rol de Sistema</label>
                                        <select value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Cargo Nominal</label>
                                        <input value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })} placeholder="Ej: Comisario Principal" />
                                    </FormGroup>
                                </div>

                                <AddButton type="submit" style={{ width: '100%', marginTop: '1rem', padding: '1.25rem' }}>
                                    <Check size={20} />
                                    {editingUser ? 'Actualizar Funcionario' : 'Registrar Funcionario'}
                                </AddButton>
                            </Form>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
}
