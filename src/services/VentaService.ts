import laravelApi from '@/http/laravelApi'
import type { AxiosResponse } from 'axios'

// DTO para el detalle del ítem
export interface VentaItemDTO {
  producto_id: number // items.*.producto_id (required)
  cantidad: number // items.*.cantidad (required)
  precio_unitario: number | null // items.*.precio_unitario (nullable)
  descuento: number | null // items.*.descuento (nullable)
}

// Tipos permitidos por el Store Request
export type MetodoPagoRequest = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'plan_separe'
export type EstadoVentaRequest = 'finalizada' | 'cancelada' | 'pendiente_pago' | 'reembolsada'

// DTO principal para enviar la Venta a la API (Crear/Actualizar)
export interface VentaDTO {
  // --- Cabecera ---
  cliente_id: number | null
  tipo_venta_id: number
  descuento_total: number | null
  metodo_pago: MetodoPagoRequest | null
  estado: EstadoVentaRequest | null
  iva_porcentaje: number | null
  caja_diaria_id: number | null
  // --- Ítems ---
  items: VentaItemDTO[]
}

// ----------------------------------------------------
// INTERFACES DE RESPUESTA DE VENTA (Resources)
// ----------------------------------------------------

// Interfaz para el listado (VentaIndexResource)
export interface VentaIndexResponse {
  venta_id: number
  estado: string
  resumen_productos: string
  cliente_nombre: string | null
  usuario_vendedor: string | null
  brutotal: number
  total_venta: string | number
  metodo_pago: MetodoPagoRequest
  user: {
    name: string | null
  }
  cliente: {
    nombre: string | null
    id: number | null
  }
  created_at: string
}

// Interfaz para el Detalle de Ítem dentro de VentaShowResource
export interface DetalleVentaResponse {
  id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  nombre_producto_historico: string
}

// Interfaz para el Detalle Completo (VentaShowResource)
export interface VentaShowResponse extends VentaIndexResponse {
  venta_id: number
  totales_financieros: {
    subtotal: number
    iva_monto: number
    iva_porcentaje: number
    descuento_total: number
  }
  detalles_completos: DetalleVentaResponse[]
  cliente_nombre: string | null
  total_venta: number
  usuario_vendedor: string
}

// Interfaz genérica para la respuesta de paginación de Laravel
export interface LaravelPagination<T> {
  current_page: number
  data: T[]
  last_page: number
  total: number
  per_page: number
  from: number
  to: number
}

class VentaService {
  private endpoint = '/ventas'

  /**
   * Procesa y registra la venta en el sistema (CRUD CREATE - POST).
   * @param ventaData Los datos completos de la venta.
   * @returns Promise<VentaShowResponse> El objeto de la venta creada.
   */
  public async registrarVenta(
    ventaData: VentaDTO,
  ): Promise<{ message: string; venta: VentaShowResponse }> {
    try {
      const response: AxiosResponse<{ message: string; venta: VentaShowResponse }> =
        await laravelApi.post(this.endpoint, ventaData)
      return response.data
    } catch (error) {
      console.error('Error al registrar la venta:', error)
      throw error
    }
  }

  /**
   * Crea una nueva venta (CRUD CREATE - POST).
   * @param ventaData Los datos de la nueva venta.
   * @returns Promise<{ message: string; venta: VentaShowResponse }> El objeto de la venta creada.
   */
  public async createVenta(
    ventaData: VentaDTO,
  ): Promise<{ message: string; venta: VentaShowResponse }> {
    try {
      const response: AxiosResponse<{ message: string; venta: VentaShowResponse }> =
        await laravelApi.post(this.endpoint, ventaData)
      return response.data
    } catch (error) {
      console.error('Error al crear la venta:', error)
      throw error
    }
  }

  /**
   * Muestra la lista de ventas con filtros y paginación (CRUD READ - INDEX).
   *
   * @param params Parámetros de consulta para filtros, paginación, y soft deletes.
   * @returns Promise<LaravelPagination<VentaIndexResponse>> Respuesta paginada.
   */
  public async getIndex(
    params: Record<string, unknown> = {},
  ): Promise<LaravelPagination<VentaIndexResponse>> {
    try {
      // Nota: El controlador devuelve la paginación de Laravel directamente
      // cuando no se usa 'limit'.
      const response: AxiosResponse<LaravelPagination<VentaIndexResponse>> = await laravelApi.get(
        this.endpoint,
        { params },
      )
      // Ajuste para el front-end: Mapeamos la data de paginación
      return response.data
    } catch (error) {
      console.error('Error al obtener el índice de ventas:', error)
      throw error
    }
  }

  /**
   * Obtiene una venta específica por ID (CRUD READ - SHOW).
   *
   * @param id El ID de la venta.
   * @returns Promise<VentaShowResponse> El objeto de la venta con detalles.
   */
  public async getShow(id: number): Promise<VentaShowResponse> {
    try {
      const response: AxiosResponse<VentaShowResponse> = await laravelApi.get(
        `${this.endpoint}/${id}`,
      )
      // El controlador envuelve el resultado de ShowResource en 'data', pero el front espera el objeto directo
      // Si el controlador Laravel devuelve `response()->json(VentaShowResource::make($venta));`,
      // Axios lo recibe como `response.data`.
      return response.data
    } catch (error) {
      console.error(`Error al obtener el detalle de la venta ${id}:`, error)
      throw error
    }
  }

  /**
   * Actualiza una venta específica por ID (CRUD UPDATE - PUT/PATCH).
   * * @param id El ID de la venta a actualizar.
   * @param ventaData Los datos a actualizar.
   * @returns Promise<VentaShowResponse> El objeto de la venta actualizada.
   */
  public async updateVenta(
    id: number,
    ventaData: Partial<VentaDTO>, // Usamos Partial para permitir actualizaciones parciales
  ): Promise<{ message: string; venta: VentaShowResponse }> {
    try {
      const response: AxiosResponse<{ message: string; venta: VentaShowResponse }> =
        await laravelApi.put(`${this.endpoint}/${id}`, ventaData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar la venta ${id}:`, error)
      throw error
    }
  }

  /**
   * Elimina una venta (Soft Delete) (CRUD DELETE - DELETE).
   *
   * @param id El ID de la venta a eliminar.
   * @returns Promise<{ message: string }> Mensaje de confirmación.
   */
  public async deleteVenta(id: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await laravelApi.delete(
        `${this.endpoint}/${id}`,
      )
      // El controlador devuelve un 204 sin cuerpo o un objeto con un mensaje, dependiendo de tu implementación.
      // Asumimos que el backend devuelve un mensaje de éxito.
      return response.data ?? { message: 'Venta eliminada (soft deleted) con éxito.' }
    } catch (error) {
      console.error(`Error al eliminar la venta ${id}:`, error)
      throw error
    }
  }

  /**
   * Restaura una venta eliminada suavemente.
   *
   * @param id El ID de la venta a restaurar (debe estar en soft-deleted).
   * @returns Promise<VentaIndexResponse> El objeto de la venta restaurada.
   */
  public async restoreVenta(id: number): Promise<{ message: string; venta: VentaIndexResponse }> {
    try {
      // El controlador usa una ruta POST: /ventas/{id}/restore
      const response: AxiosResponse<{ message: string; venta: VentaIndexResponse }> =
        await laravelApi.post(`${this.endpoint}/${id}/restore`)
      return response.data
    } catch (error) {
      console.error(`Error al restaurar la venta ${id}:`, error)
      throw error
    }
  }

  /**
   * Elimina permanentemente una venta.
   *
   * @param id El ID de la venta a eliminar permanentemente (debe estar en soft-deleted).
   * @returns Promise<{ message: string }> Mensaje de confirmación.
   */
  public async forceDeleteVenta(id: number): Promise<{ message: string }> {
    try {
      // El controlador usa una ruta DELETE: /ventas/{id}/force-delete
      const response: AxiosResponse<{ message: string }> = await laravelApi.delete(
        `${this.endpoint}/${id}/force-delete`,
      )
      return response.data ?? { message: 'Venta eliminada permanentemente.' }
    } catch (error) {
      console.error(`Error al eliminar permanentemente la venta ${id}:`, error)
      throw error
    }
  }
}

export default new VentaService()
