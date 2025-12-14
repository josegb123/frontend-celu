import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type {
  ProductoBajoStock,
  ProductoBajaRotacion,
  ValorPedidosProveedoresResponse,
  ValorPedidosProveedoresRequest,
  TopClienteFrecuencia,
  TopClientesFrecuenciaRequest,
  TopProducto,
  TopCliente,
  VentasPorPeriodoResponse,
  VentasPorPeriodoApiRequest,
  HistorialGananciasResponse,
  HistorialGananciasRequest,
  ProductosBajoStockRequest,
  ProductosBajaRotacionRequest,
  TicketPromedioResponse,
  ExportarVentasExcelRequest,
  VentasPorCategoriaResponse,
} from '@/interfaces/reports/report_types'

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

// Interfaz Mínima para una Venta (Usado en getUltimasVentas)
export interface VentaMinimal {
  venta_id: number
  total_venta: number
  created_at: string
  cliente_nombre: string | null
  // Añade aquí más campos que necesites de la venta (ej: estado, metodo_pago)
}

// Interfaz para métricas top
export interface TopMetric {
  label: string
  value: string | number
  change?: number
  change_type?: 'increase' | 'decrease'
}

// Interfaz para datos de series temporales
export interface TimeSeriesData {
  date: string
  value: number
  label?: string
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

  /**
   * Obtiene el Top 10 de productos más vendidos.
   */
  public async getTopProductosVendidos(): Promise<{ data: TopProducto[] }> {
    try {
      const response: AxiosResponse<{ data: TopProducto[] }> = await laravelApi.get(
        `${this.endpoint}/top-productos`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getTopProductosVendidos:', error)
      throw error
    }
  }

  /**
   * Obtiene el Top 10 de clientes por monto de compra.
   */
  public async getTopClientesPorMonto(): Promise<{ data: TopCliente[] }> {
    try {
      const response: AxiosResponse<{ data: TopCliente[] }> = await laravelApi.get(
        `${this.endpoint}/top-clientes`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getTopClientesPorMonto:', error)
      throw error
    }
  }

  /**
   * Obtiene las ventas totales agrupadas por día, mes o año.
   */
  public async getVentasPorPeriodo(
    params: VentasPorPeriodoApiRequest = {},
  ): Promise<VentasPorPeriodoResponse> {
    try {
      const response: AxiosResponse<VentasPorPeriodoResponse> = await laravelApi.get(
        `${this.endpoint}/ventas-por-periodo`,
        { params },
      )
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
    params: ProductosBajoStockRequest = {},
  ): Promise<{ umbral: number; data: ProductoBajoStock[] }> {
    try {
      const response: AxiosResponse<{ umbral: number; data: ProductoBajoStock[] }> =
        await laravelApi.get(`${this.endpoint}/productos-bajo-stock`, { params })
      return response.data
    } catch (error) {
      console.error('Error en getProductosBajoStock:', error)
      throw error
    }
  }

  /**
   * Obtiene los productos con baja rotación.
   */
  public async getProductosBajaRotacion(
    params: ProductosBajaRotacionRequest = {},
  ): Promise<{ periodo_dias: number; data: ProductoBajaRotacion[] }> {
    try {
      const response: AxiosResponse<{ periodo_dias: number; data: ProductoBajaRotacion[] }> =
        await laravelApi.get(`${this.endpoint}/productos-baja-rotacion`, { params })
      return response.data
    } catch (error) {
      console.error('Error en getProductosBajaRotacion:', error)
      throw error
    }
  }

  /**
   * Obtiene el valor total de pedidos a proveedores por período.
   */
  public async getValorPedidosProveedores(
    params: ValorPedidosProveedoresRequest,
  ): Promise<ValorPedidosProveedoresResponse> {
    try {
      const response: AxiosResponse<ValorPedidosProveedoresResponse> = await laravelApi.get(
        `${this.endpoint}/valor-pedidos-proveedores`,
        { params },
      )
      return response.data
    } catch (error) {
      console.error('Error en getValorPedidosProveedores:', error)
      throw error
    }
  }

  /**
   * Obtiene los clientes con mayor frecuencia de compra.
   */
  public async getTopClientesFrecuencia(
    params: TopClientesFrecuenciaRequest = {},
  ): Promise<{ periodo_dias: number; limit: number; data: TopClienteFrecuencia[] }> {
    try {
      const response: AxiosResponse<{
        periodo_dias: number
        limit: number
        data: TopClienteFrecuencia[]
      }> = await laravelApi.get(`${this.endpoint}/top-clientes-frecuencia`, { params })
      return response.data
    } catch (error) {
      console.error('Error en getTopClientesFrecuencia:', error)
      throw error
    }
  }

  /**
   * Obtiene el historial de ganancias (margen bruto) por periodo.
   */
  public async getHistorialGanancias(
    params: HistorialGananciasRequest = {},
  ): Promise<HistorialGananciasResponse> {
    try {
      const response: AxiosResponse<HistorialGananciasResponse> = await laravelApi.get(
        `${this.endpoint}/historial-ganancias`,
        { params },
      )
      return response.data
    } catch (error) {
      console.error('Error en getHistorialGanancias:', error)
      throw error
    }
  }

  /**
   * Obtiene las ventas agrupadas por categoría.
   */
  public async getVentasPorCategoria(): Promise<VentasPorCategoriaResponse> {
    try {
      const response: AxiosResponse<VentasPorCategoriaResponse> = await laravelApi.get(
        `${this.endpoint}/ventas-por-categoria`,
      )
      return response.data
    } catch (error) {
      console.error('Error en getVentasPorCategoria:', error)
      throw error
    }
  }

  /**
   * Obtiene el Ticket Promedio (AOV).
   */
  public async getTicketPromedio(): Promise<TicketPromedioResponse> {
    try {
      const response: AxiosResponse<TicketPromedioResponse> = await laravelApi.get(
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
   */
  public async getUltimasVentas(): Promise<{ data: VentaMinimal[] }> {
    try {
      const response: AxiosResponse<LaravelPagination<VentaMinimal>> = await laravelApi.get(
        this.ventasEndpoint,
        {
          params: { per_page: 10, order_by: 'created_at', direction: 'desc' },
        },
      )
      return { data: response.data.data }
    } catch (error) {
      console.error('Error en getUltimasVentas:', error)
      throw error
    }
  }

  /**
   * Descarga un reporte de ventas agrupadas en formato Excel.
   */
  public async exportarVentasExcel(
    params: ExportarVentasExcelRequest = {},
  ): Promise<AxiosResponse> {
    try {
      const response = await laravelApi.get(`${this.endpoint}/exportar-ventas-excel`, {
        params,
        responseType: 'blob', // Importante para manejar archivos binarios
      })
      return response
    } catch (error) {
      console.error('Error al exportar ventas a Excel:', error)
      throw error
    }
  }

  /**
   * Descarga un reporte de ventas agrupadas en formato PDF.
   */
  public async exportarVentasPdf(
    params: VentasPorPeriodoApiRequest = {}, // Use the existing type for params
  ): Promise<AxiosResponse> {
    try {
      const response = await laravelApi.get(`${this.endpoint}/exportar-ventas-pdf`, {
        params,
        responseType: 'blob', // Important for binary files
      })
      return response
    } catch (error) {
      console.error('Error al exportar ventas a PDF:', error)
      throw error
    }
  }
}

// Exportar una instancia para usarla en toda la aplicación (Singleton)
export const estadisticasService = new EstadisticasService()
