import axios from 'axios'

const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            // Si estamos en producción, asumimos que el backend está en el mismo dominio bajo /api
            return `${window.location.protocol}//${hostname}:3001/api/v1`;
        }
    }
    return 'http://localhost:3001/api/v1';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('siscom-auth')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Restaurar token del storage al cargar
const storedAuth = localStorage.getItem('siscom-auth')
if (storedAuth) {
    try {
        const { state } = JSON.parse(storedAuth)
        if (state?.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
    } catch (e) {
        console.error('Error parsing stored auth:', e)
    }
}

export default api
