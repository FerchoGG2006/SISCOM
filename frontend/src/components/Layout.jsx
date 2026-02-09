import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
    Home,
    FileText,
    PlusCircle,
    Users,
    Settings,
    LogOut,
    Shield,
    Bell,
    BarChart3
} from 'lucide-react'
import './Layout.css'

export default function Layout() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const menuItems = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/radicar', icon: PlusCircle, label: 'Radicar Caso' },
        { to: '/expedientes', icon: FileText, label: 'Expedientes' },
        { to: '/usuarios', icon: Users, label: 'Usuarios' },
        { to: '/reportes', icon: BarChart3, label: 'Reportes' },
        { to: '/configuracion', icon: Settings, label: 'Configuración' },
    ]

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <Shield className="logo-icon" />
                        <span className="logo-text">SISCOM</span>
                    </div>
                    <p className="logo-subtitle">Comisaría de Familia</p>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">Sistema de Gestión</h1>
                    </div>
                    <div className="topbar-right">
                        <button className="notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.nombres} {user?.apellidos}</span>
                                <span className="user-role">{user?.cargo || user?.rol}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
