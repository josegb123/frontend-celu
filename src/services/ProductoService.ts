import type { IProducto, IProductoPaginated } from '@/interfaces/IProductoInterfaces'
import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// Clase de servicio
class ProductoService {
  private endpoint = '/productos'

  // --- MÉTODOS DE BÚSQUEDA Y LISTADO ---

  /**
   * Busca IProductos por un término para un componente de búsqueda rápida.
   * El endpoint devuelve una respuesta que contiene un array de IProductos.
   */
  public async searchProductos(query: string): Promise<IProducto[]> {
    if (query.length < 3) return []
    try {
      const response: AxiosResponse<IProducto[] | { data: IProducto[] }> = await laravelApi.get(
        `${this.endpoint}?search=${query}`,
      )

      const paginatedResults = (response.data as { data: IProducto[] })?.data
      const directResults = response.data

      let results: IProducto[] = []

      if (Array.isArray(paginatedResults)) {
        results = paginatedResults
      } else if (Array.isArray(directResults)) {
        results = directResults as IProducto[]
      } else {
        console.warn(
          'Estructura de respuesta inesperada en searchProductos. No se encontró array de IProductos.',
          response.data,
        )
        return []
      }

      return results
    } catch (error) {
      console.error('Error al buscar IProductos:', error)
      return []
    }
  }

  /**
   * Obtiene la lista de IProductos con soporte para paginación y filtros.
   * @param params Objeto de parámetros de consulta (page, search, categoria_id, per_page).
   * @returns Una promesa que resuelve con la respuesta paginada (IProductoPaginated).
   */
  public async getProductos(params: {
    page?: number
    search?: string
    categoria_id?: number
    per_page?: number
  }): Promise<IProductoPaginated> {
    try {
      // Usamos el tipo IProductoPaginated para asegurar la estructura de la respuesta
      const response: AxiosResponse<IProductoPaginated> = await laravelApi.get(this.endpoint, {
        params,
      })

      // Devolvemos la respuesta completa de paginación para que el POS pueda usar 'current_page', 'last_page', etc.
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de IProductos paginada.', error)
      throw error
    }
  }

  /**
   * Obtiene un IProducto por su ID.
   */
  public async getProductoById(id: number): Promise<IProducto | null> {
    try {
      const response: AxiosResponse<IProducto> = await laravelApi.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener el IProducto con ID ${id}:`, error)
      return null
    }
  }

  // --- MÉTODO DE GUARDADO (Creación/Actualización) ---

  /**
   * Maneja la creación o actualización de un IProducto, incluyendo la imagen.
   */
  public async saveProducto(data: FormData, id: number | null): Promise<IProducto> {
    try {
      let response: AxiosResponse<IProducto>

      if (id) {
        response = await laravelApi.post(`${this.endpoint}/${id}`, data)
      } else {
        response = await laravelApi.post(this.endpoint, data)
      }

      return response.data
    } catch (error) {
      console.error(`Error al guardar IProducto (ID: ${id})`, error)
      throw error
    }
  }

  /**
   * Elimina un IProducto por su ID.
   */
  public async deleteProducto(id: number): Promise<void> {
    try {
      await laravelApi.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Error al eliminar IProducto (ID: ${id})`, error)
      throw error
    }
  }
}

export default new ProductoService()
