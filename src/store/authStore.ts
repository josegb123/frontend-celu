import { defineStore } from 'pinia'
import laravelApi from '@/http/laravelApi'
import AuthService from '@/services/AuthService'
import { useCajaStore } from './useCajaStore'
import { AxiosError } from 'axios'

interface User {
  id: number | null
  name: string | null
  email: string | null
  role: string | null
}

interface AuthResponse {
  success: boolean
  message: string | null
  token: string | null
}

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  user: User
  isLoading: boolean // Estado añadido
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: !!localStorage.getItem('access_token'),
    accessToken: localStorage.getItem('access_token'),
    user: { id: null, name: null, email: null, role: null },
    isLoading: false,
  }),

  actions: {
    async login(email: string, password: string): Promise<AuthResponse> {
      this.isLoading = true // Iniciar carga
      const authService = new AuthService()

      try {
        const response = await authService.login(email, password)

        if (response.success && response.token) {
          this.accessToken = response.token
          localStorage.setItem('access_token', response.token)
          this.isAuthenticated = true

          await this.checkSession()
        }
        return response
      } catch (err: unknown) {
        // Manejo de error estricto
        const message =
          err instanceof AxiosError
            ? err.response?.data?.message
            : 'Error inesperado durante el login'

        return { success: false, message, token: null }
      } finally {
        this.isLoading = false // Finalizar carga
      }
    },

    async logout(): Promise<boolean> {
      const cajaStore = useCajaStore()

      if (cajaStore.isCajaAbierta) {
        console.warn('AuthStore: Logout bloqueado por caja abierta.')
        return false
      }

      this.isLoading = true
      try {
        const authService = new AuthService()
        await authService.logout()
      } catch (err: unknown) {
        console.error('Error al cerrar sesión en el backend:', err)
      } finally {
        // Limpieza obligatoria de estado local
        this.accessToken = null
        localStorage.removeItem('access_token')
        this.isAuthenticated = false
        this.user = { id: null, name: null, email: null, role: null }
        this.isLoading = false
      }
      return true
    },

    async checkSession(): Promise<boolean> {
      if (!this.accessToken) {
        this.clearLocalSession()
        return false
      }

      this.isLoading = true
      try {
        const response = await laravelApi.get<User>('/user')
        this.user = response.data
        this.isAuthenticated = true
        return true
      } catch {
        this.clearLocalSession()
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearLocalSession(): void {
      this.accessToken = null
      localStorage.removeItem('access_token')
      this.isAuthenticated = false
      this.user = { id: null, name: null, email: null, role: null }
    },
  },
})
