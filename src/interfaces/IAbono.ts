// src/interfaces/IAbono.ts (Nuevo archivo o añadida a un archivo de interfaces existente)

/**
 * Define la estructura de la entidad Cuenta Por Cobrar.
 * Basado en la relación devuelta en el JSON.
 */
export interface CuentaPorCobrar {
  id: number
  venta_id: number
  cliente_id: number
  monto_original: string
  monto_pendiente: string // El monto actualizado después del abono
  fecha_vencimiento: string // Formato 'YYYY-MM-DD'
  estado: 'Pendiente' | 'Vencida' | 'Saldada' | 'Anulada'
  cliente: { id: string; nombre: string; apellidos: string }
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Define la estructura del Abono.
 */
export interface Abono {
  id: number
  cuenta_por_cobrar_id: number
  user_id: number
  monto_abonado: number // o string, dependiendo de cómo lo maneje el backend/DB
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro'
  referencia_pago: string
  created_at: string
  updated_at: string
  // Relación:
  cuenta_por_cobrar?: CuentaPorCobrar // Se incluye en la respuesta del store
}

/**
 * Define la estructura de los datos que se envían al backend para registrar un abono.
 * (Basado en StoreAbonoRequest)
 */
export interface StoreAbonoPayload {
  cuenta_por_cobrar_id: number
  monto: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro'
  referencia_pago?: string | null
}

/**
 * Define la estructura de la respuesta exitosa del endpoint POST /abonos.
 */
export interface StoreAbonoResponse {
  message: string
  abono: Abono
}
