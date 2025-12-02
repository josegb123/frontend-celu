import laravelApi from '../http/laravelApi' // Asumimos que esta importación existe
import type { AxiosResponse } from 'axios'

/**
 * Interfaz para la respuesta paginada de Laravel, consistente con tu ProductoService.
 */
interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
  // ... otros campos de meta y links que Axios no mapea automáticamente al cuerpo principal
}

// Re-exportamos las interfaces clave que definimos antes
export interface Proveedor {
  id: number
  nombreComercial: string
  nombreContacto: string | null
  identificacion: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
  fechaRegistro: string
}

export interface ProveedorDTO {
  nombre_comercial: string
  nombre_contacto?: string | null
  identificacion?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  ciudad?: string | null
  notas?: string | null
  activo: boolean
}

export interface ProveedorQueryParams {
  page?: number
  per_page?: number
  search?: string
  activo?: boolean
}

/**
 * Clase de servicio para interactuar con la API de Proveedores.
 * Utiliza laravelApi (Axios) para la comunicación.
 */
class ProveedorService {
  private endpoint = '/proveedor' // El endpoint completo es /api/proveedores

  /**
   * Obtiene una lista paginada de proveedores.
   * @param params Parámetros de consulta para paginación y filtrado.
   * @returns Una promesa que resuelve a la estructura de paginación de Laravel.
   */
  public async getAll(params: ProveedorQueryParams = {}): Promise<PaginatedResponse<Proveedor>> {
    try {
      // Axios maneja la serialización de `params` a query string automáticamente
      const response: AxiosResponse<PaginatedResponse<Proveedor>> = await laravelApi.get(
        this.endpoint,
        { params },
      )

      // La respuesta paginada de Laravel pone los datos en 'response.data.data' (o directamente en response.data si es el objeto de paginación)
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de proveedores:', error)
      // Lanzar el error para que el componente pueda manejarlo
      throw error
    }
  }

  /**
   * Busca proveedores por un término.
   * Este método puede ser útil para un buscador tipo 'autocomplete'.
   * Asumimos que el backend devuelve un array directo de Proveedores en este caso.
   */
  public async searchProveedores(query: string): Promise<Proveedor[]> {
    if (query.length < 3) return []
    try {
      const response: AxiosResponse<Proveedor[]> = await laravelApi.get(
        `${this.endpoint}?search=${query}&limit=10`,
      )

      // Dependiendo de tu backend, podría ser response.data o response.data.data
      // Asumimos que para una búsqueda rápida, devuelve el array directo o 'data'
      const results = (response.data as any)?.data || response.data

      if (Array.isArray(results)) {
        return results as Proveedor[]
      }

      console.warn('Estructura de respuesta inesperada en searchProveedores.')
      return []
    } catch (error) {
      console.error('Error al buscar proveedores:', error)
      return []
    }
  }

  /**
   * Obtiene un proveedor por su ID.
   */
  public async getById(id: number): Promise<Proveedor> {
    try {
      const response: AxiosResponse<{ data: Proveedor } | Proveedor> = await laravelApi.get(
        `${this.endpoint}/${id}`,
      )
      // Manejamos el caso en que Laravel envuelva el objeto en 'data'
      const result = (response.data as { data: Proveedor }).data || (response.data as Proveedor)
      return result
    } catch (error) {
      console.error(`Error al obtener proveedor con ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Crea un nuevo proveedor.
   */
  public async create(data: ProveedorDTO): Promise<Proveedor> {
    try {
      const response: AxiosResponse<Proveedor> = await laravelApi.post(this.endpoint, data)
      // Asumimos que la respuesta devuelve el objeto Proveedor creado directamente.
      return response.data
    } catch (error) {
      console.error('Error al crear proveedor:', error)
      throw error
    }
  }

  /**
   * Actualiza un proveedor existente.
   */
  public async update(id: number, data: ProveedorDTO): Promise<Proveedor> {
    try {
      // Usamos PUT para reemplazo completo, tal como se sugiere en REST.
      const response: AxiosResponse<Proveedor> = await laravelApi.put(
        `${this.endpoint}/${id}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error(`Error al actualizar proveedor (ID: ${id}):`, error)
      throw error
    }
  }

  /**
   * Elimina un proveedor por su ID.
   */
  public async delete(id: number): Promise<void> {
    try {
      await laravelApi.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Error al eliminar proveedor (ID: ${id}):`, error)
      throw error
    }
  }
}

// Exportar una instancia para usarla en toda la aplicación (Singleton)
export const proveedorService = new ProveedorService()
