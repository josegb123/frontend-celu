// testApi.ts o dentro de una función asíncrona en tu componente/servicio

import axios from 'axios'

// Asegúrate de que Pinia esté inicializado y disponible en este contexto

// 1. Configuración de la Instancia de Axios
const laravelApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 2. 🔑 Interceptor CLAVE para adjuntar el Bearer Token
laravelApi.interceptors.request.use(
  (config) => {
    // Es vital que useAuthStore() se llame DENTRO del interceptor

    const token = '1|jib173RqPNisUuZuPHweKfHJBMExL8nwEwwCt3Pa1edcd39c'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 3. 🧪 Función de PRUEBA
// Esta función encapsula la lógica asíncrona y la ejecución de la prueba.
async function testProductSearch(query: string) {
  const endpoint = '/productos'

  try {
    console.log(`Buscando productos con query: "${query}"`)

    // ⬅️ La solicitud usa la instancia 'laravelApi' con el interceptor
    const response = await laravelApi.get(`${endpoint}?search=${query}`)

    // Si la respuesta es exitosa, muestra los datos
    console.log('✅ Búsqueda Exitosa. Datos recibidos:')
    // Asumimos que la API de Laravel envuelve los datos en 'data' (por ProductoResource::collection)
    console.log(response.data)

    return response.data.data
  } catch (error) {
    console.error('❌ Error durante la búsqueda de productos:', error)

    if (axios.isAxiosError(error) && error.response) {
      console.error('Código de Estado HTTP:', error.response.status)
      console.error('Mensaje del Servidor:', error.response.data)

      // Si el error es 401 (Unauthorized), el token no se envió o expiró
      if (error.response.status === 401) {
        console.warn(
          "⚠️ ERROR 401: Asegúrate de estar logueado y que 'authStore.accessToken' contenga un token válido.",
        )
      }
    }
    return []
  }
}

// 4. 🚀 Ejecución de la Prueba
// Para ejecutar esta función en tu aplicación, llámala desde un punto de entrada.
// Ejemplo: dentro del hook onMounted() de un componente.

/* // Ejemplo de uso en un componente Vue:
import { onMounted } from 'vue';

onMounted(() => {
    // ⬅️ Recuerda que debes tener un token válido en authStore
    testProductSearch('neq');
});
*/

// Para propósitos de esta respuesta, simulo la ejecución:
const query = 'neq'
// Ejecutar la prueba
testProductSearch(query)
