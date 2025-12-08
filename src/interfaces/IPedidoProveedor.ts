// ---- Requests ------

import type { PaginatedResponse } from './ILaravelPaginated'
import type { Proveedor } from './IProveedores'
import type { IUser } from './IUser'

export interface IProductoPedido {
  producto_id: number
  cantidad: number
  precio_compra: number | null
  precio_venta: number | null
}
interface IPedidoProveedorBase {
  numero_factura_proveedor: string
  fecha_entrega: string
  proveedor_id: number
}

export interface IPedidoProveedorRequest extends IPedidoProveedorBase {
  metodo_pago: string
  monto_total: number
  productos: IProductoPedido[]
}

// ---- Responses ----

export interface IPedidoProveedor extends IPedidoProveedorBase {
  id: number
  monto_total: number
  estado: string
  created_at: string
  updated_at: string
  detalles: IProductoPedido[]
  proveedor: Proveedor
  user: IUser
}

export interface IPedidoProveedorResponse {
  message: string
  pedido: IPedidoProveedor
}

// ------- Paginated Responses ------

interface IPedidoProveedorIndex {
  user: IUser
  proveedor: Proveedor
  detalles: IProductoPedido[]
}

export type IPedidoProveedorPaginated = PaginatedResponse<IPedidoProveedorIndex>
