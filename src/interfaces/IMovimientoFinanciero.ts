// Define los tipos posibles de movimiento que vienen del backend
export type TipoMovimiento = 'Ingreso' | 'Egreso'

// Interfaz para las relaciones anidadas (registrado_por y tipo_movimiento)
interface RelacionMovimiento {
  id: number
  nombre: string
  descripcion?: string // Solo viene en tipo_movimiento
}

/**
 * Representa un registro individual de movimiento financiero (Ingreso o Egreso).
 */
export interface MovimientoFinanciero {
  id: number
  monto: string // "25000.00"
  tipo: TipoMovimiento
  metodo_pago: string
  referencia_tabla: string | null // Ej: "abono_carteras" o "ventas"
  referencia_id: number | null // El ID del registro en la tabla de referencia

  // Relación: La categoría o tipo del movimiento (e.g., Venta de Productos)
  tipo_movimiento: RelacionMovimiento

  // Relación: El usuario que registró el movimiento
  registrado_por: RelacionMovimiento // Usa la misma estructura (id, nombre)

  fecha_registro: string // "2025-11-30 00:38:11"
}

/**
 * Parámetros para filtrar la lista de movimientos.
 */
export interface MovimientoFinancieroParams {
  tipo?: TipoMovimiento | ''
  search?: string // Búsqueda (si el backend lo soporta)
  fecha_inicio?: string
  fecha_fin?: string
  // Otros filtros si el backend los implementa:
  // categoria_id?: number;
  // user_id?: number;
}
