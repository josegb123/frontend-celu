import { defineStore } from 'pinia'
import laravelApi from '@/http/laravelApi'
import AuthService from '@/services/AuthService'

interface User {
  id: number | null
  name: string | null
  email: string | null
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
    user: { id: null, name: null, email: null } as User,
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

    async logout() {
      const authService = new AuthService()
      await authService.logout()

      this.accessToken = null
      localStorage.removeItem('access_token')
      this.isAuthenticated = false
      this.user = { id: null, name: null, email: null }
    },

    async checkSession() {
      if (!this.accessToken) {
        this.isAuthenticated = false
        this.user = { id: null, name: null, email: null }
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
