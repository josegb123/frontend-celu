import type { responseProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

/**
 * Servicio dedicado a la gestión y consulta de productos con bajo stock.
 */
class ProductoBajoStockService {
  // El endpoint específico que creaste en Laravel
  private endpoint = '/productos/bajo-stock'

  /**
   * Obtiene la lista de productos que están en bajo stock (stock_actual <= stock_minimo).
   *
   * @param params Objeto de parámetros de consulta (page, search, per_page).
   * @returns Una promesa que resuelve con la respuesta paginada (PaginatedResponse<ProductoBajoStock>).
   */
  public async getBajoStock(): Promise<responseProductoBajoStock> {
    try {
      // La respuesta del backend es la estructura paginada, pero con el tipo de datos ProductoBajoStock
      const response: AxiosResponse<responseProductoBajoStock> = await laravelApi.get(this.endpoint)

      // Devolvemos el objeto de paginación completo.
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de productos con bajo stock.', error)
      // Propagar el error para que el componente (o Pinia Store) que llama pueda manejarlo
      throw error
    }
  }
}

export default new ProductoBajoStockService()
