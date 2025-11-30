// Define la estructura mínima de un Cliente
export interface ICliente {
  id: number
  nombre: string
  documento?: string // Opcional, pero útil para mostrar
}

// Define la estructura mínima de un Producto para el buscador
export interface IProducto {
  id: number
  codigo: string
  nombre: string
  precio_venta: number
  stock: number
  // Añadir cualquier otro campo relevante (ej: Iva_tasa)
}

// Define la estructura de un Ítem dentro del Carrito
export interface ICarritoItem {
  producto_id: number
  cantidad: number
  precio_unitario: number
  descuento: number
  // Campos solo para el UI (no se envían en el payload final)
  nombre: string
}

// Define la estructura del Payload de Checkout que recibe ModalCheckout
export interface ICheckoutDetails {
  tipo_venta_id: number
  metodo_pago: string
  referencia_pago: string | null
}

// Define la estructura del Payload de Venta Final (usado en VentaService.ts)
// Esta es la estructura que debe coincidir con tu StoreVentaRequest de Laravel
export interface VentaPayload {
  cliente_id: number
  tipo_venta_id: number
  metodo_pago: string
  descuento_total: number
  monto_neto: number // Monto total de verificación
  referencia_pago?: string | null // Opcional si lo vas a agregar al Request
  items: {
    producto_id: number
    cantidad: number
    precio_unitario: number
    descuento: number
  }[]
}
