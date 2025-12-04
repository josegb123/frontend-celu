export interface ICliente {
  id: number | string
  cedula: number | null
  nombre: string
  apellidos: string
  telefono: string | null // Clave para WhatsApp
  email: string | null
  direccion: string | null
  aval_id: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}
