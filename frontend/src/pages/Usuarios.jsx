import { useState, useEffect } from 'react'
import {
    Users,
    UserPlus,
    Edit,
    Trash2,
    Shield,
    Search,
    X,
    Check
} from 'lucide-react'
import api from '../services/api'
import './Usuarios.css'

const ROLES = [
    { value: 'admin', label: 'Administrador', color: '#dc2626' },
    { value: 'comisario', label: 'Comisario(a)', color: '#7c3aed' },
    { value: 'psicologo', label: 'Psicólogo(a)', color: '#0891b2' },
    { value: 'trabajador_social', label: 'Trabajador(a) Social', color: '#059669' },
    { value: 'abogado', label: 'Abogado(a)', color: '#d97706' },
    { value: 'auxiliar', label: 'Auxiliar', color: '#6b7280' },
]

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        rol: 'auxiliar',
        cargo: '',
        activo: true
    })

    useEffect(() => {
        loadUsuarios()
    }, [])

    const loadUsuarios = async () => {
        setLoading(true)
        // Datos de ejemplo
        setTimeout(() => {
            setUsuarios([
                { id: 1, nombres: 'María', apellidos: 'González', email: 'maria.gonzalez@comisaria.gov.co', rol: 'comisario', cargo: 'Comisaria de Familia', activo: true, ultimo_acceso: '2026-02-04 14:30' },
                { id: 2, nombres: 'Carlos', apellidos: 'Rodríguez', email: 'carlos.rodriguez@comisaria.gov.co', rol: 'psicologo', cargo: 'Psicólogo', activo: true, ultimo_acceso: '2026-02-04 10:15' },
                { id: 3, nombres: 'Ana', apellidos: 'Martínez', email: 'ana.martinez@comisaria.gov.co', rol: 'trabajador_social', cargo: 'Trabajadora Social', activo: true, ultimo_acceso: '2026-02-03 16:45' },
                { id: 4, nombres: 'Luis', apellidos: 'Pérez', email: 'luis.perez@comisaria.gov.co', rol: 'abogado', cargo: 'Abogado Asesor', activo: true, ultimo_acceso: '2026-02-01 09:00' },
                { id: 5, nombres: 'Admin', apellidos: 'Sistema', email: 'admin@siscom.gov.co', rol: 'admin', cargo: 'Administrador', activo: true, ultimo_acceso: '2026-02-04 17:00' },
            ])
            setLoading(false)
        }, 500)
    }

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.email,
                password: '',
                rol: user.rol,
                cargo: user.cargo,
                activo: user.activo
            })
        } else {
            setEditingUser(null)
            setFormData({
                nombres: '',
                apellidos: '',
                email: '',
                password: '',
                rol: 'auxiliar',
                cargo: '',
                activo: true
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingUser(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Aquí iría la lógica de guardar
        alert(editingUser ? 'Usuario actualizado' : 'Usuario creado')
        handleCloseModal()
        loadUsuarios()
    }

    const handleDelete = async (userId) => {
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            // Lógica de eliminación
            alert('Usuario eliminado')
            loadUsuarios()
        }
    }

    const getRolInfo = (rol) => {
        return ROLES.find(r => r.value === rol) || { label: rol, color: '#6b7280' }
    }

    const filteredUsuarios = usuarios.filter(u =>
        u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="usuarios-page">
            <div className="page-header">
                <div>
                    <h1><Users size={28} /> Gestión de Usuarios</h1>
                    <p>Administre los usuarios del sistema</p>
                </div>
                <button className="btn-premium btn-premium-primary" style={{ padding: '0.8rem 1.5rem' }} onClick={() => handleOpenModal()}>
                    <UserPlus size={18} />
                    Nuevo Usuario
                </button>

            </div>

            <div className="usuarios-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="usuarios-grid">
                {filteredUsuarios.map(user => (
                    <div key={user.id} className="usuario-card">
                        <div className="usuario-actions">
                            <button className="btn-icon" title="Editar" onClick={() => handleOpenModal(user)}>
                                <Edit size={16} />
                            </button>
                            <button className="btn-icon danger" title="Eliminar" onClick={() => handleDelete(user.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="usuario-header">
                            <div className="usuario-avatar">
                                {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                            </div>
                            <div className="usuario-info">
                                <h3>{user.nombres} {user.apellidos}</h3>
                                <p className="email">{user.email}</p>
                                <p className="cargo">{user.cargo}</p>
                            </div>
                        </div>

                        <div>
                            <span
                                className="rol-badge"
                                style={{ backgroundColor: getRolInfo(user.rol).color }}
                            >
                                <Shield size={12} style={{ marginRight: '6px' }} />
                                {getRolInfo(user.rol).label}
                            </span>
                        </div>

                        <div className="usuario-meta">
                            <span className={`status ${user.activo ? 'active' : 'inactive'}`}>
                                {user.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className="last-access">
                                {user.ultimo_acceso}
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            {/* Modal de Usuario */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row two-cols">
                                    <div className="form-group">
                                        <label className="form-label required">Nombres</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.nombres}
                                            onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Apellidos</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.apellidos}
                                            onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>

                                <div className="form-row two-cols">
                                    <div className="form-group">
                                        <label className="form-label required">Rol</label>
                                        <select
                                            className="form-select"
                                            value={formData.rol}
                                            onChange={e => setFormData({ ...formData, rol: e.target.value })}
                                        >
                                            {ROLES.map(rol => (
                                                <option key={rol.value} value={rol.value}>{rol.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cargo</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.cargo}
                                            onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                        />
                                        <span>Usuario activo</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-premium btn-premium-primary" style={{ width: '100%', padding: '1rem' }}>
                                    <Check size={18} />
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
