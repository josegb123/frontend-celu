import type { IUser } from './IUser'
export interface IAbono {
  id: number
  cuenta_por_cobrar_id: number
  user_id: number
  monto_abonado: string
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro'
  referencia_pago: string
  created_at: string
  updated_at: string
  user: IUser
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
  caja_diaria_id?: number | null
}

/**
 * Define la estructura de la respuesta exitosa del endpoint POST /abonos.
 */
export interface StoreAbonoResponse {
  message: string
  abono: IAbono
}
