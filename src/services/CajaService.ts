import laravelApi from '@/http/laravelApi'
import type { AxiosResponse } from 'axios'
import { type LaravelPagination } from './estadisticasService'

// ----------------------------------------------------
// INTERFACES DE MOVIMIENTOS FINANCIEROS
// ----------------------------------------------------

// Tipos permitidos para el campo 'tipo'
export type TipoMovimiento = 'Ingreso' | 'Egreso'

// Tipos permitidos para el campo 'metodo_pago' (Solo efectivo debe afectar el conteo físico de caja)
export type MetodoPagoMovimiento =
  | 'efectivo'
  | 'tarjeta'
  | 'transferencia'
  | 'credito'
  | 'plan_separe'

/**
 * Interfaz para la respuesta individual del Movimiento Financiero
 */
export interface MovimientoFinancieroResponse {
  id: number
  monto: string // Se recomienda usar 'string' para precisión financiera
  tipo: TipoMovimiento
  metodo_pago: MetodoPagoMovimiento
  referencia_tabla: string // Ej: 'ventas', 'abono_carteras', 'egresos_varios'
  referencia_id: number
  tipo_movimiento: {
    id: number
    nombre: string
    descripcion: string
  }
  registrado_por: {
    id: number
    nombre: string
  }
  fecha_registro: string
}

/**
 * Parámetros de consulta para el índice de movimientos.
 */
export interface MovimientoParams {
  caja_diaria_id?: number
  tipo?: TipoMovimiento // 'Ingreso' o 'Egreso'
  metodo_pago?: MetodoPagoMovimiento
  fecha_inicio?: string
  fecha_fin?: string
  per_page?: number
}

class CajaService {
  private endpoint = '/movimientos-financieros'

  /**
   * Obtiene la lista de movimientos financieros, filtrables por caja.
   *
   * @param params Parámetros de consulta (incluyendo caja_diaria_id).
   * @returns Promise<LaravelPagination<MovimientoFinancieroResponse>>
   */
  public async getMovimientos(
    params: MovimientoParams = {},
  ): Promise<LaravelPagination<MovimientoFinancieroResponse>> {
    try {
      const response: AxiosResponse<LaravelPagination<MovimientoFinancieroResponse>> =
        await laravelApi.get(this.endpoint, { params })
      return response.data
    } catch (error) {
      console.error('Error en getMovimientos:', error)
      throw error
    }
  }

  // --- Métodos de CRUD para crear movimientos manuales (Ej: Egresos) ---

  /**
   * Crea un movimiento financiero manual (ej: un egreso o un ingreso).
   * * @param data Datos del movimiento (monto, tipo, tipo_movimiento_id, caja_diaria_id, etc.)
   * @returns Promise<MovimientoFinancieroResponse>
   */
  public async createMovimiento(data: {
    monto: number
    tipo: TipoMovimiento
    tipo_movimiento_id: number
    metodo_pago: MetodoPagoMovimiento
    caja_diaria_id: number
    // Otros campos necesarios para el backend
  }): Promise<MovimientoFinancieroResponse> {
    try {
      const response: AxiosResponse<MovimientoFinancieroResponse> = await laravelApi.post(
        this.endpoint,
        data,
      )
      return response.data
    } catch (error) {
      console.error('Error al crear movimiento manual:', error)
      throw error
    }
  }
}

export const cajaService = new CajaService()
