import type { PaginatedResponse } from './ILaravelPaginated'

export interface ICliente {
  id: number
  cedula: number | null
  nombre: string
  apellidos: string
  telefono: string | null // Clave para WhatsApp
  email: string | null
  direccion: string | null
  aval_id: number | null
  estado_financiero: estado_financiero[]
  aval_nombre?: string | null
  is_aval?: boolean
}

export interface estado_financiero {
  cliente_id: number
  cuenta_por_cobrar_id: number
  monto_original: number | null
  monto_pendiente: number | null
  estado: string | null
  motivo: string | null
}

/**
 * Interfaz para el cuerpo de la solicitud de creación/actualización.
 */
export interface StoreUpdateClientePayload {
  cedula?: string | number | null | undefined
  nombre?: string | null | undefined
  apellidos?: string | null | undefined
  telefono?: string | null | undefined
  email?: string | null | undefined
  direccion?: string | null | undefined
  aval_id?: number | null | undefined
}

export type IClientePaginatedResponse = PaginatedResponse<ICliente>
