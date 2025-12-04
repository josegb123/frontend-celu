import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type { CuentasPorCobrarParams } from '@/services/CuentaPorCobrarService'
import type { PaginatedCuentasPorCobrar } from '@/interfaces/ICuentaPorCobrar'
class CuentaPorCobrarAlertaService {
  private endpoint = '/cuentas-por-cobrar'

  /**
   * Obtiene cuentas pendientes cuya fecha de vencimiento esté cerca (morosas/proximas).
   * @param params Filtros de paginación y búsqueda.
   * @returns La respuesta paginada con el array de cuentas.
   */
  public async getCuentasMorosas(
    params: CuentasPorCobrarParams = {},
  ): Promise<PaginatedCuentasPorCobrar> {
    try {
      const defaultParams = {
        estado: 'Pendiente',
        per_page: 15,
      }

      const response: AxiosResponse<PaginatedCuentasPorCobrar> = await laravelApi.get(
        this.endpoint,
        { params: { ...defaultParams, ...params } },
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener cuentas morosas:', error)
      throw error
    }
  }
}

export default new CuentaPorCobrarAlertaService()
