import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const baseURL = import.meta.env.VITE_API_URL

// Comprobación: si baseURL es null, undefined, o una cadena vacía ('')
if (!baseURL) {
  // Puedes usar window.alert() para una alerta simple en el navegador,
  // o console.error() si prefieres una advertencia discreta en la consola
  // para los desarrolladores.

  // Opción 1: Alerta en el navegador (más intrusiva, ideal para desarrollo)
  window.alert('¡ERROR DE CONFIGURACIÓN! VITE_API_URL no está definido en el archivo .env.')

  // Opción 2: Mensaje de error en la consola (mejor para producción/desarrollo)
  console.error('CONFIG ERROR: La variable de entorno VITE_API_URL no está definida o está vacía.')

  // Opcional: Podrías detener la ejecución si es crítica
  // throw new Error("VITE_API_URL es obligatorio para iniciar la aplicación.");
}

const laravelApi = axios.create({
  baseURL: baseURL,
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
