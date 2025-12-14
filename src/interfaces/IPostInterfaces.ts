// --- 1. Definiciones de Tipo ---

/** Interfaz base para el Producto, emitida por el buscador. */
export interface ProductoVentaBase {
  id: number
  nombre: string
  precio_venta: number | string // Flexible para aceptar string o number del API/Input
  stock_actual: number
}

/** Interfaz para el ítem en el carrito de venta. (precio_venta debe ser number) */
export interface ItemVenta {
  id: number
  nombre_producto: string
  nombre?: string
  precio_venta: number
  precio_unitario: number
  stock_actual: number
  cantidad: number
  subtotal: number
}

/** Interfaz para un Aval. */
export interface Aval {
  id: number | null
}
