// src/interfaces/VentaInterfaces.ts

/**
 * Interfaz básica para el objeto TipoVenta en el frontend.
 */
export interface Venta {
  id: number
  user_id: number
  cliente_id: number | null
  total: number
}

export interface TipoVentaConst {
  id: number
  nombre: string
}

/**
 * Interfaz para un ítem individual en el payload de la venta.
 */
export interface VentaItem {
  producto_id: number
  cantidad: number
}

/**
 * Interfaz para el payload completo que se envía a /api/ventas.
 */
export interface VentaPayload {
  user_id?: number // Lo inyecta el backend o se envía desde Pinia
  cliente_id: number | null
  tipo_venta_id: number
  metodo_pago: string
  descuento_total: number | null
  items: VentaItem[]
}

/**
 * Interfaz para la respuesta exitosa de la API al registrar una venta.
 */
export interface VentaResponse {
  message: string
  venta: Venta // Se puede refinar con una interfaz Venta más compleja si es necesario
}

// --- CONSTANTES ---

/**
 * Mapeo de IDs de Tipos de Venta (debe coincidir con la base de datos).
 */
export const TIPO_VENTA_IDS = {
  CONTADO: 1,
  CREDITO: 2,
}

/**
 * Lista estática de Tipos de Venta para usar en selects del formulario.
 */
export const TIPOS_VENTA_LISTA: TipoVentaConst[] = [
  { id: TIPO_VENTA_IDS.CONTADO, nombre: 'Contado' },
  { id: TIPO_VENTA_IDS.CREDITO, nombre: 'Crédito' },
]
