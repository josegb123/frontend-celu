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
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 1. INTERCEPTOR DE PETICIÓN (Request)
laravelApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 2. INTERCEPTOR DE RESPUESTA (Response)
laravelApi.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, solo la pasamos
  async (error) => {
    const authStore = useAuthStore()

    // Si el servidor responde 401 (Token expirado o inválido)
    if (error.response?.status === 401) {
      authStore.logout() // Limpiamos el estado de Pinia y el localStorage

      // Redirigir al login si no estamos ya ahí
      if (router.currentRoute.value.name !== 'auth') {
        router.push({ name: 'auth' })
      }
    }

    // Manejo de errores de conexión o servidor (500)
    if (!error.response) {
      console.error('Error de red o servidor no disponible')
    }

    return Promise.reject(error)
  },
)

export default laravelApi
