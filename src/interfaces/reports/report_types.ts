import type { VentaIndexResponse } from '@/services/VentaService'

// Report-specific request and response interfaces
export interface ProductosBajoStockRequest {
  umbral?: number
}

export interface ProductoBajoStock {
  id: number
  nombre: string
  stock_actual: number
}

export interface VentasPorPeriodoApiRequest {
  periodo?: 'day' | 'month' | 'year'
}

export interface VentaEstadistica {
  periodo_fecha: string
  ventas_totales: number
  beneficio: number
}

export interface VentasPorPeriodoResponse {
  periodo: string
  data: VentaEstadistica[]
  lista_ventas?: VentaIndexResponse[]
}

export interface VentasPorCategoriaEstadistica {
  categoria_nombre: string
  total_unidades_vendidas: number
  total_ventas_categoria: number
}

export interface VentasPorCategoriaResponse {
  data: VentasPorCategoriaEstadistica[]
}

export interface TicketPromedioResponse {
  monto_promedio_venta: number
  unidad: string
}

export interface HistorialGananciasRequest {
  periodo?: 'day' | 'month' | 'year'
  fecha_inicio?: string
  fecha_fin?: string
}

export interface HistorialGananciasEstadistica {
  periodo_fecha: string
  beneficio_bruto: number
}

export interface HistorialGananciasResponse {
  data: HistorialGananciasEstadistica[]
}

export interface TopCliente {
  cliente_id: number
  nombre_cliente: string
  monto_total: number
}

export interface TopClienteResponse {
  data: TopCliente[]
}

export interface TopProducto {
  producto_id: number
  nombre_producto: string
  unidades_vendidas: number
}

export interface TopProductoResponse {
  data: TopProducto[]
}

export interface ProductosBajaRotacionRequest {
  period_days?: number
}

export interface ProductoBajaRotacion {
  id: number
  nombre: string
  stock: number
  unidades_vendidas_en_periodo: number
  ultima_venta: string | null
}

export interface ProductosBajaRotacionResponse {
  periodo_dias: number
  data: ProductoBajaRotacion[]
}

export interface PedidoProveedorDetalle {
  proveedor_id: number
  nombre_proveedor: string
  total_gastado: number
}

export interface ValorPedidosProveedoresRequest {
  start_date: string
  end_date: string
}

export interface ValorPedidosProveedoresResponse {
  total_gasto_proveedores: number
  periodo: {
    start_date: string
    end_date: string
  }
  detalles_por_proveedor: PedidoProveedorDetalle[]
}

export interface TopClienteFrecuencia {
  cliente_id: number
  nombre_cliente: string
  email_cliente: string | null
  numero_compras_en_periodo: number
  ultima_compra: string | null
}

export interface TopClientesFrecuenciaRequest {
  period_days?: number
  limit?: number
}

export interface TopClientesFrecuenciaResponse {
  periodo_dias: number
  limit: number
  data: TopClienteFrecuencia[]
}

// Re-using for export requests, as they share 'periodo'
export interface ExportarVentasExcelRequest {
  periodo?: 'day' | 'month' | 'year'
}
