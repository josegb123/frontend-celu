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

// 2. Interfaz para el JSON de Respuesta de la Paginación de Laravel (ProveedorCollection)
// Esta es la estructura que recibes en el endpoint /api/proveedores
export interface PaginacionResponse<T> {
  data: T[] // El array de items (en este caso, Proveedor[])
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
      page: number | null
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
}

// 3. Interfaz para el DTO (Data Transfer Object) usado en la creación o actualización
// Excluye los campos autogenerados (id, fechaRegistro)
export interface ProveedorDTO {
  nombre_comercial: string // Nota: Usamos snake_case si el backend lo espera así, o camelCase si se transforma en el servicio
  nombre_contacto?: string | null
  identificacion?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  ciudad?: string | null
  notas?: string | null
  activo: boolean
}

// 4. Parámetros de consulta (Query Parameters) para la función index
export interface ProveedorQueryParams {
  page?: number
  per_page?: number
  search?: string
  activo?: boolean
}
