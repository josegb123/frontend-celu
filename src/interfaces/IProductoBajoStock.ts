// --- 1. Interfaces de Relaciones ---

import type { Proveedor } from './IProveedores'

/**
 * Interface para el Resource simple de Categoría
 */
export interface CategoriaLite {
  id: number
  nombre: string
}

/**
 * Interface para el Resource simple de Usuario (UserLiteResource)
 */
export interface UserLite {
  id: number
  name: string
}

// --- 2. Interfaces de Paginación de Laravel ---

/**
 * Interface para cada enlace de paginación
 */
export interface LaravelPaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

/**
 * Interface para la estructura 'meta' de la respuesta paginada
 */
export interface LaravelMeta {
  current_page: number
  from: number | null
  last_page: number
  links: LaravelPaginationLink[]
  path: string
  per_page: number
  to: number | null
  total: number
}

/**
 * Interface para la estructura 'links' de la respuesta paginada
 */
export interface LaravelLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

// --- 3. Interface del Objeto Producto ---

/**
 * Interface para un objeto Producto, tal como es devuelto por el ProductoResource.
 */
export interface ProductoBajoStock {
  id: number
  categoria_id: number
  user_id: number
  codigo_barra: string
  nombre: string
  descripcion: string
  imagen_url: string | null
  precio_compra: string // O number, si lo conviertes en el frontend
  precio_venta: string // O number
  stock_actual: number
  stock_reservado: number
  stock_minimo: number
  is_bajo_stock: boolean

  // Relaciones cargadas:
  categoria: CategoriaLite
  user: UserLite
  proveedores: Proveedor[]
}

// --- 4. Interface de la Respuesta Completa de la API ---

/**
 * Interface para la respuesta paginada completa del endpoint /api/productos/bajo-stock
 */
export interface ProductoBajoStockResponse {
  data: ProductoBajoStock[]
  links: LaravelLinks
  meta: LaravelMeta
}
