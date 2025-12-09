import { defineStore } from 'pinia'
import laravelApi from '@/http/laravelApi'
import AuthService from '@/services/AuthService'
import { useCajaStore } from './useCajaStore'

interface User {
  id: number | null
  name: string | null
  email: string | null
  role: string | null // Added role
}

interface AuthResponse {
  success: boolean
  message: string | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false as boolean,
    accessToken: localStorage.getItem('access_token') || null,
    user: { id: null, name: null, email: null, role: null } as User, // Initialize role
  }),

  actions: {
    async login(email: string, password: string): Promise<AuthResponse> {
      const authService = new AuthService()
      const response = await authService.login(email, password)

      if (response.success && response.token) {
        this.accessToken = response.token
        localStorage.setItem('access_token', response.token)
        this.isAuthenticated = true

        await this.checkSession()
      }
      return response
    },

    /**
     * @description Intenta cerrar sesión. Si hay una caja abierta, aborta y retorna false.
     * @returns {Promise<boolean>} Retorna true si el cierre de sesión fue exitoso, false si fue bloqueado.
     */
    async logout(): Promise<boolean> {
      // CAMBIO DE RETORNO a Promise<boolean>

      // 1. Verificar el estado de la caja
      const cajaStore = useCajaStore()

      if (cajaStore.isCajaAbierta) {
        console.warn('AuthStore: Cierre de sesión bloqueado. Hay una caja diaria activa.')
        // Debugging: Retornar falso para que el componente sepa que el logout falló.
        return false
      }

      // 2. Ejecutar el cierre de sesión si no hay caja abierta
      try {
        const authService = new AuthService()
        await authService.logout()
      } catch (e) {
        // Un error en el logout del backend no debe impedir el borrado local
        console.error('Error al notificar el cierre de sesión al backend:', e)
      } finally {
        // 3. Limpieza de estado local y almacenamiento
        this.accessToken = null
        localStorage.removeItem('access_token')
        this.isAuthenticated = false
        this.user = { id: null, name: null, email: null, role: null } // Clear role
      }
      return true
    },

    async checkSession() {
      if (!this.accessToken) {
        this.isAuthenticated = false
        this.user = { id: null, name: null, email: null, role: null } // Clear role
        return false
      }

      try {
        const response = await laravelApi.get('/user')
        this.user = response.data
        this.isAuthenticated = true
        return true
      } catch {
        await this.logout()
        return false
      }
    },
  },
})
