<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover table-sm">
      <thead class="sticky-top bg-light shadow-sm">
        <tr>
          <th>ID Venta</th>
          <th>Cliente</th>
          <th>Monto Original</th>
          <th>Monto Pendiente</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && cuentas.length === 0">
          <td colspan="7" class="text-center py-5">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Cargando cuentas...
          </td>
        </tr>

        <tr v-else-if="cuentas.length === 0">
          <td colspan="7" class="text-center py-5 text-muted">
            <i class="bi bi-info-circle me-1"></i> No se encontraron cuentas por cobrar con los
            filtros aplicados.
          </td>
        </tr>

        <tr v-else v-for="cuenta in cuentas" :key="cuenta.id" class="table-pointer-row">
          <td @click="emit('show-details', cuenta)">{{ cuenta.venta_id }}</td>
          <td @click="emit('show-details', cuenta)">
            {{ cuenta.cliente?.nombre || `Cliente ID: ${cuenta.cliente_id}` }}
          </td>
          <td @click="emit('show-details', cuenta)">
            ${{ formatCurrency(cuenta.monto_original) }}
          </td>
          <td
            @click="emit('show-details', cuenta)"
            :class="{
              'fw-bold text-danger': cuenta.estado === 'Vencida',
              'text-warning-emphasis': cuenta.estado === 'Pendiente',
            }"
          >
            ${{ formatCurrency(cuenta.monto_pendiente) }}
          </td>
          <td @click="emit('show-details', cuenta)">{{ cuenta.fecha_vencimiento }}</td>
          <td>
            <span
              :class="{
                'badge bg-warning text-dark': cuenta.estado === 'Pendiente',
                'badge bg-danger': cuenta.estado === 'Vencida',
                'badge bg-success': cuenta.estado === 'Saldada',
              }"
            >
              {{ cuenta.estado }}
            </span>
          </td>
          <td class="text-center">
            <button
              v-if="cuenta.estado !== 'Saldada' && Number(cuenta.monto_pendiente) > 0"
              class="btn btn-sm btn-outline-success"
              @click="emit('register-abono', cuenta)"
              title="Registrar Abono"
            >
              <i class="bi bi-cash"></i> Abonar
            </button>
            <span v-else-if="cuenta.estado === 'Saldada'" class="text-success small fst-italic">
              Saldada
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { dataCuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'

// --- PROPS ---
defineProps<{
  // La lista de cuentas que viene de la vista principal (ya filtrada y paginada)
  cuentas: dataCuentaPorCobrar[]
  loading: boolean
}>()

// --- EMITS ---
const emit = defineEmits<{
  (e: 'show-details', cuenta: dataCuentaPorCobrar): void
  (e: 'register-abono', cuenta: dataCuentaPorCobrar): void
}>()

// --- UTILIDADES ---
/**
 * Formatea un número o string a formato de moneda con dos decimales.
 */
const formatCurrency = (value: string | number): string => {
  return Number(value).toFixed(2)
}
</script>

<style scoped>
.table-pointer-row {
  cursor: pointer;
}
.table-pointer-row:hover {
  background-color: #f8f9fa; /* Destaca la fila al pasar el mouse */
}
/* Aseguramos que los colores de estado son visibles */
.text-warning-emphasis {
  color: #997900 !important; /* Un amarillo más fuerte para Pendiente */
}
</style>
