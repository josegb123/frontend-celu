import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type { PaginatedCuentasPorCobrar } from '@/interfaces/ICuentaPorCobrar'
import type { ICuentaPorCobrarShow } from '@/interfaces/ICuentaPorCobrarShow'

// Interfaz para los parámetros de búsqueda/filtro
export interface CuentasPorCobrarParams {
  search?: string
  fecha_vencimiento?: string
  estado?: 'Pendiente' | 'Vencida' | 'Saldada' | 'Anulada' | ''
  page?: number
  per_page?: number
}

class CuentaPorCobrarService {
  private endpoint = '/cuentas-por-cobrar'

  /**
   * Obtiene la lista PAGINADA de cuentas por cobrar con filtros (Resumen para la tabla).
   */
  public async getCuentas(params: CuentasPorCobrarParams = {}): Promise<PaginatedCuentasPorCobrar> {
    try {
      // Esperamos una respuesta con { data: [...], meta: {...} }
      const response: AxiosResponse<PaginatedCuentasPorCobrar> = await laravelApi.get(
        this.endpoint,
        { params },
      )

      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de Cuentas por Cobrar:', error)
      throw error
    }
  }

  /**
   * Obtiene el detalle completo de una cuenta por cobrar (Método SHOW).
   */
  public async getCuentaDetalle(id: number): Promise<ICuentaPorCobrarShow | null> {
    try {
      const response: AxiosResponse<ICuentaPorCobrarShow> = await laravelApi.get(
        `${this.endpoint}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error al obtener detalle de la cuenta ${id}:`, error)
      return null
    }
  }
}

export default new CuentaPorCobrarService()
