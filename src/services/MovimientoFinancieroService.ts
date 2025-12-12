import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type {
  MovimientoFinanciero,
  MovimientoFinancieroParams,
} from '@/interfaces/IMovimientoFinanciero'

// ⚠️ Asumimos que tienes la interfaz de paginación definida globalmente o importada
// Si no la tienes, usa la estructura de abajo (o impórtala de CuentaPorCobrarService si está allí)
interface PaginationLink {
  url: string | null
  label: string
  active: boolean
  page?: number | null
}
interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: PaginationLink[]
}
interface PaginatedResponse<T> {
  data: T[]
  links: { first: string; last: string; prev: string | null; next: string | null }
  meta: PaginationMeta
}

/**
 * Payload para registrar un nuevo movimiento (POST)
 * ⚠️ Basado en la lógica del controlador, necesitamos estas propiedades:
 * - monto, metodo_pago, descripcion, tipo_movimiento_nombre, user_id (asumido por auth o enviado),
 * - referencia_tabla/id (opcional)
 */
export interface StoreMovimientoPayload {
  monto: number
  metodo_pago: string
  descripcion: string
  tipo_movimiento_nombre: string
  referencia_tabla?: string
  referencia_id?: number
  user_id: number
  caja_diaria_id: number
}

class MovimientoFinancieroService {
  private endpoint = '/movimientos-financieros'

  /**
   * Obtiene la lista PAGINADA de movimientos con filtros.
   */
  public async getMovimientos(
    params: MovimientoFinancieroParams & { page?: number; per_page?: number } = {},
  ): Promise<PaginatedResponse<MovimientoFinanciero>> {
    try {
      const response: AxiosResponse<PaginatedResponse<MovimientoFinanciero>> = await laravelApi.get(
        this.endpoint,
        { params },
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener movimientos financieros:', error)
      throw error
    }
  }

  /**
   * Registra un nuevo movimiento (Ingreso o Egreso) manual.
   */
  public async storeMovimiento(payload: StoreMovimientoPayload): Promise<MovimientoFinanciero> {
    try {
      // El controlador de Laravel se encarga de determinar si es Ingreso o Egreso
      // basado en el 'tipo_movimiento_nombre' que se le pase.
      const response: AxiosResponse<{ data: MovimientoFinanciero }> = await laravelApi.post(
        this.endpoint,
        payload,
      )
      return response.data.data // Desestructuramos el Resource que devuelve el controlador
    } catch (error) {
      console.error('Error al registrar movimiento:', error)
      throw error
    }
  }

  // El método show/resumen se puede añadir después si es necesario.
}

export default new MovimientoFinancieroService()
