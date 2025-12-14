/**
 * =================================
 * INTERFACES DEL MÓDULO PROVEEDOR
 * =================================
 */

// 1. Interfaz para la data de un Proveedor
export interface Proveedor {
  id: number
  nombreComercial: string
  nombreContacto: string | null
  identificacion: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
  fechaRegistro: string // Formato 'YYYY-MM-DD HH:mm:ss'
  // Si incluyes relaciones, irían aquí (ej: productosSuministrados?: Producto[])
}
