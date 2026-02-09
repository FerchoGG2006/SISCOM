import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RadicarCaso from './pages/RadicarCaso'
import Expedientes from './pages/Expedientes'
import ExpedienteDetalle from './pages/ExpedienteDetalle'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="radicar" element={<RadicarCaso />} />
                    <Route path="expedientes" element={<Expedientes />} />
                    <Route path="expedientes/:id" element={<ExpedienteDetalle />} />
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="configuracion" element={<Configuracion />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
