<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Categoría</th>
          <th>Unidades Vendidas</th>
          <th>Total Ventas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.categoria_nombre">
          <td>{{ item.categoria_nombre }}</td>
          <td>{{ item.total_unidades_vendidas }}</td>
          <td>{{ formatCurrency(item.total_ventas_categoria) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { VentasPorCategoriaEstadistica } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: VentasPorCategoriaEstadistica[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
