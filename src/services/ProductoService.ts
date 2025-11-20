import laravelApi from '@/http/laravelApi'
import type { AxiosResponse } from 'axios'

// Interfaz que refleja los datos esenciales para la venta
export interface Producto {
  id: number
  nombre: string
  precio_venta: string // Importante para el cálculo
  stock_actual: number
}

// Clase de servicio
class ProductoService {
  private endpoint = '/productos'

  /**
   * Busca productos por un término (ej: nombre) en el backend.
   * @param query El término de búsqueda.
   */
  public async searchProductos(query: string): Promise<Producto[]> {
    if (query.length < 3) return [] // No buscar con menos de 3 caracteres
    try {
      // El backend debe manejar el filtrado por el parámetro 'search'
      const response: AxiosResponse<Producto[]> = await laravelApi.get(
        `${this.endpoint}?search=${query}`,
      )

      // ⬅️ CAMBIO CRUCIAL: Devolver directamente response.data, sin usar .data
      return response.data
    } catch (error) {
      console.error(
        'Error al buscar productos. Asegúrate de que el endpoint está configurado para filtrar por "search".',
        error,
      )
      return []
    }
  }
  /**
   * Obtiene un producto por su ID.
   */
  public async getProductoById(id: number): Promise<Producto | null> {
    try {
      const response: AxiosResponse<Producto> = await laravelApi.get(`${this.endpoint}/${id}`)
      // Asumimos que /productos/{id} devuelve el objeto Producto directamente
      return response.data
    } catch (error) {
      console.error(`Producto con ID ${id} no encontrado.`, error)
      return null
    }
  }
}

export default new ProductoService()
