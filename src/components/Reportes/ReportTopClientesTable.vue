<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID Cliente</th>
          <th>Nombre Cliente</th>
          <th>Monto Total Comprado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.cliente_id">
          <td>{{ item.cliente_id }}</td>
          <td>{{ item.nombre_cliente }}</td>
          <td>{{ formatCurrency(item.monto_total) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { TopCliente } from '@/interfaces/reports/report_types'
import { formatCurrency } from '@/utils/formatters' // Import formatter

const { data } = defineProps<{
  data: TopCliente[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
