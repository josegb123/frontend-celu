<template>
  <div class="alert alert-info text-center">
    <h4 class="alert-heading">Ticket Promedio de Venta</h4>
    <p class="display-4 fw-bold">
      {{ formatCurrency(data.monto_promedio_venta) }}
      <small class="text-muted">{{ data.unidad }}</small>
    </p>
    <p>Este es el valor promedio de cada transacción de venta.</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { TicketPromedioResponse } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: TicketPromedioResponse
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
