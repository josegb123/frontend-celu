import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// ----------------------------------------------------
// INTERFACES DE DATOS DE ESTADÍSTICAS
// ----------------------------------------------------

export interface LaravelPagination<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

/**
 * Métrica base para un Top N (ej: Top Clientes, Top Productos)
 */
export interface TopMetric {
  id?: number
  nombre_producto?: string // Para Top Productos
  nombre_cliente?: string // Para Top Clientes
  monto_total?: number // Monto total de compras del cliente
  unidades_vendidas?: number // Para Top Productos
}

/**
 * Métrica para Ventas por Período e Historial de Ganancias
 */
export interface TimeSeriesData {
  beneficio_bruto: number
  beneficio: number
  periodo: string
  data: [
    {
      periodo_fecha: string // Ej: "2025-11"
      ventas_totales?: number
      beneficio?: number // Para historial de ganancias (Margen Bruto)
    },
  ]
}

/**
 * Métrica para productos con bajo stock
 */
export interface LowStockProduct {
  id: number
  nombre: string
  stock: number
  umbral?: number // Opcional, si el backend lo devuelve
}

/**
 * Parámetros de consulta para las series de tiempo (Time Series)
 */
export interface TimeSeriesParams {
  periodo?: 'day' | 'month' | 'year'
  fecha_inicio?: string
  fecha_fin?: string
}

/**
 * Parámetros de consulta para inventario
 */
export interface StockParams {
  umbral?: number // El límite para considerar bajo stock
}

/**
 * Interfaz Mínima para una Venta (Usado en getUltimasVentas)
 */
export interface VentaMinimal {
  venta_id: number
  total_venta: number
  created_at: string
  cliente_nombre: string | null
  // Añade aquí más campos que necesites de la venta (ej: estado, metodo_pago)
}

// ----------------------------------------------------
// CLASE DE SERVICIO
// ----------------------------------------------------

/**
 * Clase de servicio para interactuar con la API de Estadísticas.
 */
class EstadisticasService {
  private endpoint = '/estadisticas'
  private ventasEndpoint = '/ventas' // Endpoint para ventas

  // Nota: Hemos eliminado el helper handleError para usar throw error directamente,
  // lo cual satisface a TS si el error es relanzado.

  /**
   * Obtiene el Top 10 de productos más vendidos.
   */
  public async getTopProductos(): Promise<{ data: TopMetric[] }> {
    try {
      const response: AxiosResponse<{ data: TopMetric[] }> = await laravelApi.get(
        `${this.endpoint}/top-productos`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getTopProductos:', error)
      throw error
    }
  }

  /**
   * Obtiene el Top 10 de clientes por monto de compra.
   */
  public async getTopClientes(): Promise<{ data: TopMetric[] }> {
    try {
      const response: AxiosResponse<{ data: TopMetric[] }> = await laravelApi.get(
        `${this.endpoint}/top-clientes`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getTopClientes:', error)
      throw error
    }
  }

  /**
   * Obtiene las ventas totales agrupadas por día, mes o año.
   */
  public async getVentasPorPeriodo(
    params: TimeSeriesParams = {},
  ): Promise<{ periodo: string; data: TimeSeriesData[] }> {
    try {
      const response: AxiosResponse<{ periodo: string; data: TimeSeriesData[] }> =
        await laravelApi.get(`${this.endpoint}/ventas-por-periodo`, { params })
      return response.data
    } catch (error) {
      console.error('Error en getVentasPorPeriodo:', error)
      throw error
    }
  }

  /**
   * Obtiene los productos cuyo stock está bajo un umbral.
   */
  public async getProductosBajoStock(
    params: StockParams = {},
  ): Promise<{ umbral: number; data: LowStockProduct[] }> {
    try {
      const response: AxiosResponse<{ umbral: number; data: LowStockProduct[] }> =
        await laravelApi.get(`${this.endpoint}/productos-bajo-stock`, { params })
      return response.data
    } catch (error) {
      console.error('Error en getProductosBajoStock:', error)
      throw error
    }
  }

  /**
   * Obtiene el historial de ganancias (margen bruto) por periodo.
   * Este es el método que se usará para obtener el "Margen Bruto (Mes)" en el Dashboard.
   */
  public async getHistorialGanancias(
    params: TimeSeriesParams = {},
  ): Promise<{ data: TimeSeriesData[] }> {
    try {
      const response: AxiosResponse<{ data: TimeSeriesData[] }> = await laravelApi.get(
        `${this.endpoint}/historial-ganancias`,
        { params },
      )
      return response.data
    } catch (error) {
      console.error('Error en getHistorialGanancias:', error)
      throw error
    }
  }

  // --- Métodos Adicionales del Dashboard ---

  /**
   * Obtiene el Ticket Promedio (AOV).
   */
  public async getTicketPromedio(): Promise<{ monto_promedio_venta: number }> {
    try {
      const response: AxiosResponse<{ monto_promedio_venta: number }> = await laravelApi.get(
        `${this.endpoint}/ticket-promedio`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getTicketPromedio:', error)
      throw error
    }
  }

  /**
   * Obtiene las últimas 10 ventas.
   * Corregido: Ahora espera la respuesta paginada de Laravel.
   */
  public async getUltimasVentas(): Promise<{ data: VentaMinimal[] }> {
    try {
      // 1. Definimos el tipo de respuesta esperado: LaravelPagination<VentaMinimal>
      const response: AxiosResponse<LaravelPagination<VentaMinimal>> = await laravelApi.get(
        this.ventasEndpoint,
        {
          params: { per_page: 10, order_by: 'created_at', direction: 'desc' },
        },
      )

      // 2. Extraemos el array de ventas ('data') del objeto de paginación
      // y lo devolvemos en el formato anterior { data: [...] }
      return { data: response.data.data }
    } catch (error) {
      console.error('Error en getUltimasVentas:', error)
      throw error
    }
  }
}

// Exportar una instancia para usarla en toda la aplicación (Singleton)
export const estadisticasService = new EstadisticasService()
