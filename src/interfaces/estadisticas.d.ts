// celuvariedades-frontend/src/interfaces/estadisticas.d.ts

export interface ProductoBajoStock {
  id: number
  nombre: string
  stock_actual: number
}

export interface ProductoBajaRotacion {
  id: number
  nombre: string
  stock: number
  unidades_vendidas_en_periodo: number
  ultima_venta: string | null
}

export interface ValorPedidosProveedoresDetalle {
  proveedor_id: number
  nombre_proveedor: string
  total_gastado: number
}

export interface ValorPedidosProveedoresResponse {
  total_gasto_proveedores: number
  periodo: {
    start_date: string
    end_date: string
  }
  detalles_por_proveedor: ValorPedidosProveedoresDetalle[]
}

export interface TopClientesFrecuencia {
  cliente_id: number
  nombre_cliente: string
  email_cliente: string | null
  numero_compras_en_periodo: number
  ultima_compra: string | null
}

export interface TopProductoVendido {
  producto_id: number
  nombre_producto: string
  unidades_vendidas: number
}

export interface TopClientePorMonto {
  cliente_id: number
  nombre_cliente: string
  monto_total: number
}

export interface VentasPorPeriodoData {
  periodo_fecha: string
  ventas_totales: number
  beneficio?: number | null
}

export interface VentasPorPeriodoResponse {
  periodo: 'day' | 'month' | 'year'
  data: VentasPorPeriodoData[]
}

export interface HistorialGananciasData {
  periodo_fecha: string
  beneficio_bruto: number
}

export interface HistorialGananciasResponse {
  data: HistorialGananciasData[]
}

export interface TicketPromedioResponse {
  monto_promedio_venta: number
  unidad: string
}

// Request interfaces
export interface ProductosBajoStockRequest {
  umbral?: number
}

export interface ProductosBajaRotacionRequest {
  period_days?: number
}

export interface ValorPedidosProveedoresRequest {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

export interface TopClientesFrecuenciaRequest {
  period_days?: number
  limit?: number
}

export interface VentasPorPeriodoApiRequest {
  periodo?: 'day' | 'month' | 'year'
}

export interface ExportarVentasExcelRequest {
  periodo?: 'day' | 'month' | 'year'
}
