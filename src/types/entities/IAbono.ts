import type { IUser } from '../entities/IUser'

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
