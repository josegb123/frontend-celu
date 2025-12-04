import type { ICliente } from './ICliente'
import type { IUser } from './IUser'

export interface IVenta {
  id: number
  user_id: number
  cliente_id: number | null
  tipo_venta_id: number
  subtotal: number
  descuento_total: number | null
  iva_porcentaje: number
  iva_monto: number
  total: number
  estado: string
  metodo_pago: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  caja_diaria_id: number | null
  user: IUser
  detalles: IDetalleVenta[]
  cliente: ICliente | null
}

export interface IDetalleVenta {
  id: number
  venta_id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  nombre_producto: string
  codigo_barra: string
  precio_costo: number
  iva_porcentaje: number
  iva_monto: number
  descuento_monto: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}
