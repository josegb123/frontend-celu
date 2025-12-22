import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL && import.meta.env.DEV) {
  console.error('CONFIG ERROR: VITE_API_URL no está definida.')
}

const laravelApi = axios.create({
  baseURL: baseURL,
  headers: {
    // Eliminamos el Content-Type de aquí para que sea dinámico por petición
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// 1. INTERCEPTOR DE PETICIÓN (Request)
laravelApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    // Inyectar Token de seguridad
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    /**
     * LÓGICA DINÁMICA DE HEADERS:
     * Si enviamos FormData (archivos), eliminamos cualquier Content-Type previo.
     * Esto permite que Axios y el Navegador calculen el "boundary" correcto.
     * Si es un objeto normal, Axios pondrá 'application/json' por defecto.
     */
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type']
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 2. INTERCEPTOR DE RESPUESTA (Response)
laravelApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()

    // Manejo de Sesión Expirada (401)
    if (error.response?.status === 401) {
      // Forzamos el cierre de sesión ignorando el estado de la caja
      authStore.logout(true)

      if (router.currentRoute.value.name !== 'auth') {
        router.push({ name: 'auth' })
      }
    }

    // Errores de validación de Laravel (422) - Opcional: Logging para debug
    if (error.response?.status === 422) {
      console.warn('Error de validación detectado:', error.response.data.errors)
    }

    // Manejo de errores de conexión
    if (!error.response) {
      console.error('Error de red o servidor no disponible')
    }

    return Promise.reject(error)
  },
)

export default laravelApi
