export type MovimientoTipoClasificacion = 'Ingreso' | 'Egreso'

/**
 * Interfaz para un ítem individual de Tipo de Movimiento (Categoría).
 */
export interface TipoMovimientoItem {
  id: number
  nombre: string
  descripcion: string
  // Usamos el nombre 'tipo' para que coincida con el backend
  tipo: MovimientoTipoClasificacion
  // Opcionales: created_at, updated_at
}

/**
 * Interfaz para la estructura de la respuesta de la API (envoltorio con clave 'data').
 */
export interface TipoMovimientoApiResponse {
  data: TipoMovimientoItem[]
  message?: string
}
import laravelApi from '@/http/laravelApi'
import type { AxiosResponse } from 'axios'

/**
 * Servicio para gestionar la comunicación con el endpoint de Tipos de Movimiento Financiero.
 */
class TipoMovimientoService {
  // El endpoint debe coincidir con la ruta que definiste en Laravel: /tipos-movimiento-financiero
  private apiUrl = '/tipo-movimientos-financieros'

  /**
   * Obtiene la lista completa de tipos de movimiento (categorías) desde la API.
   * * @returns Una promesa que resuelve con un array de TipoMovimientoItem.
   */
  async getTiposMovimiento(): Promise<TipoMovimientoItem[]> {
    try {
      // La respuesta de Axios contendrá la estructura TipoMovimientoApiResponse
      const response: AxiosResponse<TipoMovimientoApiResponse> = await laravelApi.get(this.apiUrl)

      // Devolvemos el array que está dentro de la clave 'data'
      return response.data.data
    } catch (error) {
      console.error('Error al obtener tipos de movimiento:', error)
      // En caso de error, lanzamos el error para que sea manejado en el componente
      throw error
    }
  }

  // --- MÉTODOS CRUD (Añadirás estos al implementar el módulo de administración) ---
  // public async storeTipo(payload: any): Promise<TipoMovimientoItem> { ... }
  // public async updateTipo(id: number, payload: any): Promise<TipoMovimientoItem> { ... }
  // public async deleteTipo(id: number): Promise<void> { ... }
}

export const tipoMovimientoService = new TipoMovimientoService()
