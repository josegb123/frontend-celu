import type { Proveedor } from './IProveedores'

/**
 * Interface para un objeto Producto, tal como es devuelto por el ProductoResource.
 */
export interface ProductoBajoStock {
  id: number
  nombre: string
  stock_actual: number
  stock_minimo: number
}

export interface responseProductoBajoStock {
  total: number
  data: ProductoBajoStock[] | []
  message: string
}

export interface ProductoBajoResponse {
  data: ProductoBajoStock[]
  message: string
  total: number
}

export interface ProductoBajoStock {
  id: number
  nombre: string
  stock_actual: number
  stock_minimo: number
  proveedores?: Proveedor[]
}
