<template>
  <div class="card shadow-sm mb-4">
    <div class="card-header bg-primary text-white">
      <h2 class="h5 mb-0">Filtros de Reporte</h2>
    </div>
    <div class="card-body">
      <form @submit.prevent="emitGenerateReport">
        <div class="mb-3">
          <label for="reportType" class="form-label fw-bold"> Seleccione el Reporte: </label>
          <select
            id="reportType"
            :value="selectedReport"
            @change="updateSelectedReport"
            class="form-select"
          >
            <option value="bajoStock">Productos con Stock Bajo Umbral</option>
            <option value="ventasAgrupadas">Ventas Agrupadas por Período</option>
            <option value="ventasPorCategoria">Ventas por Categoría</option>
            <option value="ticketPromedio">Ticket Promedio</option>
            <option value="historialGanancias">Historial de Ganancias</option>
            <option value="topClientes">Top Clientes por Monto</option>
            <option value="topProductos">Top Productos Vendidos</option>
            <option value="productosBajaRotacion">Productos de Baja Rotación</option>
            <option value="valorPedidosProveedores">Valor de Pedidos a Proveedores</option>
            <option value="topClientesFrecuencia">Top Clientes por Frecuencia</option>
          </select>
        </div>

        <div
          v-if="selectedReport === 'ventasAgrupadas' || selectedReport === 'historialGanancias'"
          class="mb-3"
        >
          <label class="form-label fw-bold"> Período para Ventas Agrupadas: </label>
          <div class="mt-2">
            <div class="form-check form-check-inline">
              <input
                type="radio"
                class="form-check-input"
                id="periodoDay"
                value="day"
                :checked="ventasPeriodo === 'day'"
                @change="updateVentasPeriodo('day')"
              />
              <label class="form-check-label" for="periodoDay">Día</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                type="radio"
                class="form-check-input"
                id="periodoMonth"
                value="month"
                :checked="ventasPeriodo === 'month'"
                @change="updateVentasPeriodo('month')"
              />
              <label class="form-check-label" for="periodoMonth">Mes</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                type="radio"
                class="form-check-input"
                id="periodoYear"
                value="year"
                :checked="ventasPeriodo === 'year'"
                @change="updateVentasPeriodo('year')"
              />
              <label class="form-check-label" for="periodoYear">Año</label>
            </div>
          </div>
        </div>

        <div v-if="selectedReport === 'historialGanancias'" class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="fechaInicio" class="form-label fw-bold">Fecha Inicio:</label>
            <input
              type="date"
              id="fechaInicio"
              :value="fechaInicio"
              @input="(e) => updateFechaInicio((e.target as HTMLInputElement).value)"
              class="form-control"
            />
          </div>
          <div class="col-md-6">
            <label for="fechaFin" class="form-label fw-bold">Fecha Fin:</label>
            <input
              type="date"
              id="fechaFin"
              :value="fechaFin"
              @input="(e) => updateFechaFin((e.target as HTMLInputElement).value)"
              class="form-control"
            />
          </div>
        </div>

        <div v-if="selectedReport === 'productosBajaRotacion'" class="mb-3">
          <label for="periodDays" class="form-label fw-bold"
            >Días del Período (para Baja Rotación):</label
          >
          <input
            type="number"
            id="periodDays"
            :value="periodDays"
            @input="(e) => updatePeriodDays(Number((e.target as HTMLInputElement).value))"
            class="form-control"
            min="1"
          />
        </div>

        <div v-if="selectedReport === 'topClientesFrecuencia'" class="row g-3 mb-3">
          <div class="col-md-6">
            <label for="frecuenciaPeriodDays" class="form-label fw-bold">Días del Período:</label>
            <input
              type="number"
              id="frecuenciaPeriodDays"
              :value="frecuenciaPeriodDays"
              @input="
                (e) => updateFrecuenciaPeriodDays(Number((e.target as HTMLInputElement).value))
              "
              class="form-control"
              min="1"
            />
          </div>
          <div class="col-md-6">
            <label for="frecuenciaLimit" class="form-label fw-bold">Límite de Clientes:</label>
            <input
              type="number"
              id="frecuenciaLimit"
              :value="frecuenciaLimit"
              @input="(e) => updateFrecuenciaLimit(Number((e.target as HTMLInputElement).value))"
              class="form-control"
              min="1"
            />
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">
          <button type="submit" class="btn btn-success" :disabled="loading">
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else><i class="bi bi-search me-1"></i> Generar Reporte</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

type ReportType =
  | 'bajoStock'
  | 'ventasAgrupadas'
  | 'ventasPorCategoria'
  | 'ticketPromedio'
  | 'historialGanancias'
  | 'topClientes'
  | 'topProductos'
  | 'productosBajaRotacion'
  | 'valorPedidosProveedores'
  | 'topClientesFrecuencia'

type PeriodoType = 'day' | 'month' | 'year'

const {
  selectedReport,
  ventasPeriodo,
  fechaInicio,
  fechaFin,
  periodDays,
  frecuenciaPeriodDays,
  frecuenciaLimit,
  loading,
} = defineProps<{
  selectedReport: ReportType
  ventasPeriodo: PeriodoType
  fechaInicio: string
  fechaFin: string
  periodDays: number
  frecuenciaPeriodDays: number
  frecuenciaLimit: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedReport', value: ReportType): void
  (e: 'update:ventasPeriodo', value: PeriodoType): void
  (e: 'update:fechaInicio', value: string): void
  (e: 'update:fechaFin', value: string): void
  (e: 'update:periodDays', value: number): void
  (e: 'update:frecuenciaPeriodDays', value: number): void
  (e: 'update:frecuenciaLimit', value: number): void
  (e: 'generateReport'): void
}>()

const updateSelectedReport = (event: Event) => {
  emit('update:selectedReport', (event.target as HTMLSelectElement).value as ReportType)
}

const updateVentasPeriodo = (value: PeriodoType) => {
  emit('update:ventasPeriodo', value)
}

const updateFechaInicio = (value: string) => {
  emit('update:fechaInicio', value)
}

const updateFechaFin = (value: string) => {
  emit('update:fechaFin', value)
}

const updatePeriodDays = (value: number) => {
  emit('update:periodDays', value)
}

const updateFrecuenciaPeriodDays = (value: number) => {
  emit('update:frecuenciaPeriodDays', value)
}

const updateFrecuenciaLimit = (value: number) => {
  emit('update:frecuenciaLimit', value)
}

const emitGenerateReport = () => {
  emit('generateReport')
}
</script>

<style scoped>
/* Add any specific styles for ReportFilters here if necessary */
</style>
