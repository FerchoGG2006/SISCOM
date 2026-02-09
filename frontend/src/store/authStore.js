import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email, password) => {
                const response = await api.post('/auth/login', { email, password })
                const { token, user } = response.data.data

                set({
                    user,
                    token,
                    isAuthenticated: true
                })

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                return response.data
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                })
                delete api.defaults.headers.common['Authorization']
            },

            setToken: (token) => {
                set({ token })
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            }
        }),
        {
            name: 'siscom-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
