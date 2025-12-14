<template>
  <div
    v-if="reportData && (Array.isArray(reportData) ? reportData.length > 0 : reportData !== null)"
    class="card shadow-sm"
  >
    <div class="card-header bg-secondary text-white">
      <h2 class="h5 mb-0">Resultados del Reporte</h2>
    </div>
    <div class="card-body">
      <template v-if="selectedReport === 'bajoStock'">
        <ReportBajoStockTable :data="reportData as ProductoBajoStock[]" />
      </template>
      <template v-else-if="selectedReport === 'ventasAgrupadas'">
        <ReportVentasAgrupadasTable :data="reportData as VentaEstadistica[]" />
      </template>
      <template v-else-if="selectedReport === 'ventasPorCategoria'">
        <ReportVentasPorCategoriaTable :data="reportData as VentasPorCategoriaEstadistica[]" />
      </template>
      <template v-else-if="selectedReport === 'ticketPromedio'">
        <ReportTicketPromedioDisplay :data="reportData as TicketPromedioResponse" />
      </template>
      <template v-else-if="selectedReport === 'historialGanancias'">
        <ReportHistorialGananciasTable :data="reportData as HistorialGananciasEstadistica[]" />
      </template>
      <template v-else-if="selectedReport === 'topClientes'">
        <ReportTopClientesTable :data="reportData as TopCliente[]" />
      </template>
      <template v-else-if="selectedReport === 'topProductos'">
        <ReportTopProductosTable :data="reportData as TopProducto[]" />
      </template>
      <template v-else-if="selectedReport === 'productosBajaRotacion'">
        <ReportProductosBajaRotacionTable :data="reportData as ProductoBajaRotacion[]" />
      </template>
      <template v-else-if="selectedReport === 'valorPedidosProveedores'">
        <ReportValorPedidosProveedoresDisplay
          :data="reportData as ValorPedidosProveedoresResponse"
        />
      </template>
      <template v-else-if="selectedReport === 'topClientesFrecuencia'">
        <ReportTopClientesFrecuenciaTable :data="reportData as TopClienteFrecuencia[]" />
      </template>
    </div>
  </div>

  <div v-else-if="!loading && !reportData" class="alert alert-info text-center mt-4">
    <i class="bi bi-info-circle me-1"></i> Seleccione un reporte y genere para ver los resultados.
  </div>
  <div
    v-else-if="
      !loading &&
      reportData &&
      (Array.isArray(reportData) ? reportData.length === 0 : reportData === null)
    "
    class="alert alert-warning text-center mt-4"
  >
    <i class="bi bi-exclamation-triangle-fill me-1"></i> No se encontraron datos para el reporte
    seleccionado.
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type {
  ProductoBajoStock,
  VentaEstadistica,
  VentasPorCategoriaEstadistica,
  TicketPromedioResponse,
  HistorialGananciasEstadistica,
  TopCliente,
  TopProducto,
  ProductoBajaRotacion,
  ValorPedidosProveedoresResponse,
  TopClienteFrecuencia,
} from '@/interfaces/reports/report_types'

import ReportBajoStockTable from './ReportBajoStockTable.vue'
import ReportVentasAgrupadasTable from './ReportVentasAgrupadasTable.vue'
import ReportVentasPorCategoriaTable from './ReportVentasPorCategoriaTable.vue'
import ReportTicketPromedioDisplay from './ReportTicketPromedioDisplay.vue'
import ReportHistorialGananciasTable from './ReportHistorialGananciasTable.vue'
import ReportTopClientesTable from './ReportTopClientesTable.vue'
import ReportTopProductosTable from './ReportTopProductosTable.vue'
import ReportProductosBajaRotacionTable from './ReportProductosBajaRotacionTable.vue'
import ReportValorPedidosProveedoresDisplay from './ReportValorPedidosProveedoresDisplay.vue'
import ReportTopClientesFrecuenciaTable from './ReportTopClientesFrecuenciaTable.vue'

type ReportDataType =
  | ProductoBajoStock[]
  | VentaEstadistica[]
  | VentasPorCategoriaEstadistica[]
  | TicketPromedioResponse
  | HistorialGananciasEstadistica[]
  | TopCliente[]
  | TopProducto[]
  | ProductoBajaRotacion[]
  | ValorPedidosProveedoresResponse
  | TopClienteFrecuencia[]
  | null

const { selectedReport, reportData, loading } = defineProps<{
  selectedReport: string
  reportData: ReportDataType
  loading: boolean
}>()
</script>
