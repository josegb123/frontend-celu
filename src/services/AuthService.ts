import { ref, type Ref } from 'vue'
import axios from 'axios'
import laravelApi from '@/http/laravelApi'

interface AuthResponse {
  success: boolean
  message: string | null
  token: string | null
}

class AuthService {
  private error: Ref<string>
  private authenticated: Ref<boolean>

  constructor() {
    this.error = ref<string>('')
    this.authenticated = ref<boolean>(false)
  }

  getError(): Ref<string> {
    return this.error
  }

  isAuthenticated(): boolean {
    return this.authenticated.value
  }

  async checkAuthenticationStatus(): Promise<boolean> {
    try {
      await laravelApi.get('/user')
      this.authenticated.value = true
      return true
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Error de verificación de sesión:', e.response?.status, e.message)
      } else {
        console.error('Error desconocido en checkAuthenticationStatus:', e)
      }
      this.authenticated.value = false
      return false
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    this.error.value = ''
    const deviceName = 'pc-desktop'

    try {
      const res = await laravelApi.post('/login', {
        email: email,
        password: password,
        device_name: deviceName,
      })

      if (res.status === 200) {
        this.authenticated.value = true
        const token = res.data.access_token || null

        return { success: true, message: null, token: token }
      }
      return { success: false, message: 'Fallo de autenticación inesperado.', token: null }
    } catch (error) {
      let errorMessage: string = 'Error de conexión con la API.'
      this.authenticated.value = false

      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data
        if (responseData.message) {
          errorMessage = responseData.message
        } else if (responseData.errors && responseData.errors.credenciales) {
          errorMessage = responseData.errors.credenciales[0]
        } else {
          errorMessage = 'Fallo en la autenticación debido a un error del servidor.'
        }
      }

      this.error.value = errorMessage
      return { success: false, message: errorMessage, token: null }
    }
  }

  public async logout(): Promise<boolean> {
    try {
      await laravelApi.post('/logout')
      this.authenticated.value = false
      return true
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Error de verificación de sesión:', e.response?.status, e.message)
      } else {
        console.error('Error desconocido en checkAuthenticationStatus:', e)
      }
      this.authenticated.value = false
      return false
    }
  }
}

export default AuthService
