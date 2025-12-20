import { type ICliente } from './ICliente'

export interface link {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface ICuentaPorCobrar {
  id: number
  venta_id: number
  cliente_id: number | string
  monto_original: string
  monto_pendiente: string
  fecha_vencimiento: string
  estado: string
  created_at: string
  updated_at: string
  deleted_at: string | null

  cliente: ICliente
}

export interface dataCuentaPorCobrar extends ICuentaPorCobrar {
  cliente: ICliente
}

export interface PaginatedCuentasPorCobrar {
  current_page: number
  data: dataCuentaPorCobrar[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: link[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}
