<template>
  <div>
    <h4 class="mb-3">
      Total Gastado en Pedidos a Proveedores:
      <span class="badge bg-primary">
        {{ formatCurrency(data.total_gasto_proveedores) }}
      </span>
    </h4>
    <p>
      Período: {{ data.periodo.start_date }} a
      {{ data.periodo.end_date }}
    </p>

    <h5 class="mt-4">Detalle por Proveedor:</h5>
    <div
      v-if="data.detalles_por_proveedor && data.detalles_por_proveedor.length > 0"
      class="table-responsive"
    >
      <table class="table table-striped table-hover">
        <thead class="table-light">
          <tr>
            <th>Proveedor</th>
            <th>Total Gastado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.detalles_por_proveedor" :key="item.proveedor_id">
            <td>{{ item.nombre_proveedor }}</td>
            <td>{{ formatCurrency(item.total_gastado) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="alert alert-warning">
      No hay detalles de pedidos a proveedores para el período seleccionado.
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ValorPedidosProveedoresResponse } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: ValorPedidosProveedoresResponse
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
