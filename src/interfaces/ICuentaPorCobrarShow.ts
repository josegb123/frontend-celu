import type { IAbono } from './IAbono'
import type { ICliente } from './ICliente'
import type { IVenta } from './IVenta'

export interface ICuentaPorCobrarShow {
  id: number
  venta_id: number
  cliente_id: number
  monto_original: string
  monto_pendiente: string
  fecha_vencimiento: string
  estado: 'Pendiente' | 'Vencida' | 'Saldada' | 'Anulada'
  created_at: string
  updated_at: string
  deleted_at: string | null
  cliente: ICliente
  venta: IVenta
  abonos: IAbono[]
}
