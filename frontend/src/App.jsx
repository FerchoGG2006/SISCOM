import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import GlobalStyle from './styles/GlobalStyle';
import { Layout } from './components/layout/Layout';
import { RadicacionStepper } from './components/features/RadicacionStepper';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expedientes from './pages/Expedientes';
import ExpedienteDetalle from './pages/ExpedienteDetalle';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <>
            <GlobalStyle />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="radicacion" element={<RadicacionStepper />} />
                        <Route path="expedientes" element={<Expedientes />} />
                        <Route path="expedientes/:id" element={<ExpedienteDetalle />} />
                        <Route path="usuarios" element={<Usuarios />} />
                        <Route path="reportes" element={<Reportes />} />
                        <Route path="config" element={<Configuracion />} />
                        {/* Fallback for old routes */}
                        <Route path="radicar" element={<Navigate to="/radicacion" replace />} />
                        <Route path="configuracion" element={<Navigate to="/config" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
