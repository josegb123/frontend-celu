import type { IUser } from './IUser'
import { type ICuentaPorCobrar } from './ICuentaPorCobrar'
export interface IAbonoBase {
  cuenta_por_cobrar_id: number
  user_id: number
  monto_abonado: number
  metodo_pago: string
  referencia_pago: string | null
  updated_at: string
  created_at: string
  id: number
  cuenta_por_cobrar?: ICuentaPorCobrar
}

export interface IAbono extends IAbonoBase {
  user: IUser
  fecha_abono: string
  notas: string | null
  created_at: string
  updated_at: string
}

export interface StoreAbonoPayload {
  cuenta_por_cobrar_id: number
  monto: number
  metodo_pago: string
  notas?: string | null
  referencia_pago?: string | null
  caja_diaria_id?: number | null
}

export interface StoreAbonoResponse {
  message: string | null
  abono: IAbonoBase
}
