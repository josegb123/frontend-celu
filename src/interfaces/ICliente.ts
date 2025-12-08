import type { PaginatedResponse } from './ILaravelPaginated'

export interface ICliente {
  id: number | string
  cedula: number | null
  nombre: string
  apellidos: string
  telefono: string | null // Clave para WhatsApp
  email: string | null
  direccion: string | null
  aval_id: number | null
  estado_financiero: []
}

/**
 * Interfaz para el cuerpo de la solicitud de creación/actualización.
 */
export interface StoreUpdateClientePayload {
  cedula: number | null
  nombre: string
  apellidos: string
  telefono: string | null
  email: string | null
  direccion: string | null
  aval_id: number | null
}

export type IClientePaginatedResponse = PaginatedResponse<ICliente>
