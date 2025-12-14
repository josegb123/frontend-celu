<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>Período</th>
          <th>Beneficio Bruto</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.periodo_fecha">
          <td>{{ item.periodo_fecha }}</td>
          <td>{{ formatCurrency(item.beneficio_bruto) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { HistorialGananciasEstadistica } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: HistorialGananciasEstadistica[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
