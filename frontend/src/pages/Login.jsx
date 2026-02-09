import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-bg-pattern"></div>
            <div className="login-orb orb-1"></div>
            <div className="login-orb orb-2"></div>

            <div className="login-container">
                <div className="login-card glass-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Shield className="login-logo-icon" />
                        </div>
                        <h1>SISCOM</h1>
                        <p>Sistema de Gestión para Comisarías de Familia</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Correo Electrónico</label>
                            <div className="input-icon-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    className="glass-input with-icon"
                                    placeholder="usuario@comisaria.gov.co"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <div className="input-icon-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    className="glass-input with-icon"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium btn-premium-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Sistema de uso exclusivo para funcionarios autorizados</p>
                        <p className="version">v1.0.0-PRO-SISCOM</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
