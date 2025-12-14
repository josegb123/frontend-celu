<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID Producto</th>
          <th>Nombre Producto</th>
          <th>Unidades Vendidas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.producto_id">
          <td>{{ item.producto_id }}</td>
          <td>{{ item.nombre_producto }}</td>
          <td>{{ item.unidades_vendidas }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { TopProducto } from '@/interfaces/reports/report_types'

const { data } = defineProps<{
  data: TopProducto[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
