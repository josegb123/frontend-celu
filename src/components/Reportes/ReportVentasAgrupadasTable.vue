<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Período</th>
          <th>Ventas Totales</th>
          <th>Beneficio Bruto</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.periodo_fecha">
          <td>{{ item.periodo_fecha }}</td>
          <td>{{ formatCurrency(item.ventas_totales) }}</td>
          <td>{{ formatCurrency(item.beneficio ?? 0) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { VentaEstadistica } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: VentaEstadistica[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
