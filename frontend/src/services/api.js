import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1',
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
