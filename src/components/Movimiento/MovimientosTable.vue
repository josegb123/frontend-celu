<template>
  <div class="table-responsive rounded border py-2 px-3">
    <table class="table table-borderless table-hover table-sm text-center">
      <thead class="sticky-top bg-light shadow-sm">
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Categoría</th>
          <th>Monto</th>
          <th>Método Pago</th>
          <th>Referencia</th>
          <th>Registrado Por</th>
          <th>Fecha Registro</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && movimientos.length === 0">
          <td colspan="8" class="text-center py-5">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Cargando movimientos financieros...
          </td>
        </tr>

        <tr v-else-if="movimientos.length === 0">
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-info-circle me-1"></i> No se encontraron movimientos con los filtros
            aplicados.
          </td>
        </tr>

        <tr
          v-else
          v-for="movimiento in movimientos"
          :key="movimiento.id"
          :class="{
            'table-success-light': movimiento.tipo === 'Ingreso',
            'table-danger-light': movimiento.tipo === 'Egreso',
          }"
        >
          <td>{{ movimiento.id }}</td>
          <td>
            <span
              class="badge fw-bold"
              :class="{
                'bg-success': movimiento.tipo === 'Ingreso',
                'bg-danger': movimiento.tipo === 'Egreso',
              }"
            >
              {{ movimiento.tipo }}
            </span>
          </td>
          <td>{{ movimiento.tipo_movimiento.nombre }}</td>
          <td
            class="fw-bold"
            :class="{
              'text-success': movimiento.tipo === 'Ingreso',
              'text-danger': movimiento.tipo === 'Egreso',
            }"
          >
            {{ movimiento.tipo === 'Egreso' ? '-' : '+' }}${{ formatCurrency(movimiento.monto) }}
          </td>
          <td>{{ capitalize(movimiento.metodo_pago) }}</td>
          <td>
            <span v-if="movimiento.referencia_tabla && movimiento.referencia_id">
              {{ formatReference(movimiento.referencia_tabla) }} #{{ movimiento.referencia_id }}
            </span>
            <span v-else class="text-muted small">Manual</span>
          </td>
          <td>{{ movimiento.registrado_por.nombre }}</td>
          <td>{{ formatDate(movimiento.fecha_registro) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { MovimientoFinanciero } from '@/interfaces/IMovimientoFinanciero'

// --- PROPS ---
defineProps<{
  movimientos: MovimientoFinanciero[]
  loading: boolean
}>()

// --- UTILIDADES ---

/**
 * Formatea un número o string a formato de moneda con dos decimales.
 */
const formatCurrency = (value: string | number): string => {
  // Aseguramos que el valor es un número antes de formatear
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0.00'
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Formatea la fecha y hora a solo fecha (D/M/A).
 */
const formatDate = (datetime: string): string => {
  try {
    return new Date(datetime).toLocaleDateString()
  } catch {
    return 'N/A'
  }
}

/**
 * Capitaliza la primera letra de una cadena (útil para método_pago).
 */
const capitalize = (s: string): string => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Formatea el nombre de la tabla de referencia.
 */
const formatReference = (tabla: string): string => {
  if (tabla === 'abono_carteras') return 'Abono Cta.'
  if (tabla === 'ventas') return 'Venta'
  if (tabla === 'manual') return 'Manual'
  return capitalize(tabla.replace('_', ' '))
}
</script>

<style scoped>
/* Estilos para destacar las filas */
.table-success-light {
  background-color: #d4edda !important; /* Verde claro */
}
.table-danger-light {
  background-color: #f8d7da !important; /* Rojo claro */
}

/* Evitar que las filas se vean como clickables, ya que no hay modal de detalle */
.table-hover tbody tr:hover {
  cursor: default;
}
</style>
