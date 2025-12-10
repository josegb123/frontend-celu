export interface StoreAbonoPayload {
  cuenta_por_cobrar_id: number
  monto: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro'
  referencia_pago?: string | null
  caja_diaria_id?: number | null
}
