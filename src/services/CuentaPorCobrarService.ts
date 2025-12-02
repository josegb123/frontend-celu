import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type { CuentaPorCobrar, Abono } from '@/interfaces/IAbono'
import type { PaginationMeta } from '@/interfaces/PaginatedMeta'
import type { ItemVenta } from '@/interfaces/IPostInterfaces'
// Interfaz para la respuesta paginada de la tabla
export interface PaginatedCuentasResponse {
  current_page: number
  last_page: number
  data: CuentaPorCobrar[]
  meta: PaginationMeta
  links: { url: string | null; label: string; active: boolean }[]
}

// Interfaz para los parámetros de búsqueda/filtro
export interface CuentasPorCobrarParams {
  search?: string
  fecha_vencimiento?: string
  estado?: 'Pendiente' | 'Vencida' | 'Saldada' | 'Anulada' | ''
  page?: number
  per_page?: number
}

// Interfaz extendida para la respuesta del método show()
export interface CuentaPorCobrarDetalle extends CuentaPorCobrar {
  cliente: { id: string; nombre: string; apellidos: string }
  venta: {
    id: number
    subtotal: string
    total: string
    estado: string
    metodo_pago: string
    user: { id: number; nombre: string; name: string } // Vendedor (nombre + name)
    detalles: ItemVenta[]
  }
  abonos: Abono[] // Historial de abonos
}

class CuentaPorCobrarService {
  private endpoint = '/cuentas-por-cobrar'

  /**
   * Obtiene la lista PAGINADA de cuentas por cobrar con filtros (Resumen para la tabla).
   */
  public async getCuentas(params: CuentasPorCobrarParams = {}): Promise<PaginatedCuentasResponse> {
    try {
      // Esperamos una respuesta con { data: [...], meta: {...} }
      const response: AxiosResponse<PaginatedCuentasResponse> = await laravelApi.get(
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
  public async getCuentaDetalle(id: number): Promise<CuentaPorCobrarDetalle | null> {
    try {
      const response: AxiosResponse<CuentaPorCobrarDetalle> = await laravelApi.get(
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
