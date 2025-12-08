import { type Proveedor } from './IProveedores'
import { type IUser } from './IUser'
import { type PaginatedResponse } from './ILaravelPaginated'

export type IProductoPaginated = PaginatedResponse<IProducto>

export interface IProducto {
  id: number
  categoria_id: number
  user_id: number
  codigo_barra: string
  nombre: string
  descripcion: string
  imagen_url: string | null
  precio_compra: number
  precio_venta: number
  stock_actual: number
  stock_reservado: number
  stock_minimo: number
  is_bajo_stock: boolean
  categoria: Categoria
  user: IUser
  proveedores: Proveedor[]
}

export interface Categoria {
  id: number
  nombre: string
}
