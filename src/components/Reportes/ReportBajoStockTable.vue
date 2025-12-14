<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Nombre Producto</th>
          <th>Stock Actual</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.nombre }}</td>
          <td>
            <span class="badge bg-danger">{{ item.stock_actual }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ProductoBajoStock } from '@/interfaces/reports/report_types'

const { data } = defineProps<{
  data: ProductoBajoStock[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
