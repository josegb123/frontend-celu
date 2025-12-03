import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const laravelApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Asegúrate de que esta URL sea correcta
  headers: {
    //'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // YA NO NECESITAS: withCredentials: true
})

// INTERCEPTOR CLAVE para adjuntar el Bearer Token
laravelApi.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore() // Obtener el store dentro del interceptor

    const token = authStore.accessToken // Leer el token almacenado

    if (token) {
      // Inyectar el token en el encabezado Authorization
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Asegurarse de que no haya un encabezado Authorization si no hay token
      delete config.headers.Authorization
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default laravelApi
