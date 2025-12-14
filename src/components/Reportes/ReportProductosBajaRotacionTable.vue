<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Stock</th>
          <th>Unidades Vendidas (Período)</th>
          <th>Última Venta</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.nombre }}</td>
          <td>{{ item.stock }}</td>
          <td>{{ item.unidades_vendidas_en_periodo }}</td>
          <td>{{ item.ultima_venta ?? 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ProductoBajaRotacion } from '@/interfaces/reports/report_types'

const { data } = defineProps<{
  data: ProductoBajaRotacion[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
