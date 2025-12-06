// /services/ClienteService.js (Nuevo Archivo)

import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// --- Interfaces de Datos ---

/**
 * Define la estructura de un objeto Cliente tal como viene de la API.
 */
export interface ClienteAPI {
  id: number
  cedula: number // Número de identificación (cedula/ruc)
  nombre: string // Primer nombre del cliente
  apellidos: string // Apellidos del cliente
  telefono: string | null
  email: string | null
  direccion: string | null
  // Nota: No incluiremos 'ruc_ci' o 'nombre_completo' aquí, sino que los calcularemos
  // o los manejaremos en el frontend si es necesario, o usaremos directamente
  // las propiedades de la API (nombre y apellidos).
}

/**
 * Define la estructura de la respuesta paginada de Laravel.
 */
interface PaginatedClienteResponse {
  data: ClienteAPI[] // El array de clientes está aquí, dentro de 'data'
  meta: {
    // Ignoramos los detalles de meta
    current_page: number
    last_page: number
    total: number
    // ... otros campos meta
  }
}

/**
 * Interfaz de Cliente simplificada para el Frontend (la que usa PosView.vue)
 *
 * NOTA: Esta interfaz es la que ya usas en PosView.vue (id, nombre, ruc_ci).
 * Para evitar problemas de compatibilidad, deberás asegurarte que tu interfaz
 * en @/interfaces/IPostInterfaces se parezca a esta, o usar esta directamente.
 */
export interface Cliente {
  id: number
  nombre: string // Nombre a mostrar (ej. nombre + apellidos)
  ruc_ci: string | null // Cédula/RUC/CI del cliente
}

// --- Clase de Servicio ---

class ClienteService {
  private endpoint = '/clientes'

  /**
   * Adapta la estructura del Cliente de la API a la estructura Cliente simplificada del Frontend.
   */
  private adaptCliente(clienteApi: ClienteAPI): Cliente {
    // Concatenamos nombre y apellidos para el campo 'nombre' que usa el frontend
    const nombreCompleto = `${clienteApi.nombre} ${clienteApi.apellidos}`.trim()

    return {
      id: clienteApi.id,
      nombre: nombreCompleto,
      // Usamos la cedula (convertida a string) o 'N/A' como ruc_ci
      ruc_ci: clienteApi.cedula ? String(clienteApi.cedula) : null,
      // Nota: Si necesitas teléfono o dirección en PosView, tendrías que
      // extender la interfaz Cliente del frontend.
    }
  }

  /**
   * Busca clientes por un término (nombre, cédula).
   * @returns Promise<Cliente[]> El array de clientes adaptados, o un array vacío.
   */
  public async search(query: string): Promise<Cliente[]> {
    if (query.length < 3) return []
    try {
      // Usamos el query parameter 'search' para filtrar, asumiendo que el backend lo soporta
      const response: AxiosResponse<PaginatedClienteResponse> = await laravelApi.get(
        `${this.endpoint}?search=${query}&page=1`,
      )

      // Accedemos a response.data.data, tal como muestra tu respuesta de API
      const results = response.data?.data

      if (Array.isArray(results)) {
        // Mapeamos los resultados usando el adaptador
        return results.map(this.adaptCliente)
      }
      return []
    } catch (error) {
      console.error('Error al buscar clientes:', error)
      return []
    }
  }
}

export default new ClienteService()
