<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover">
      <thead class="table-light">
        <tr>
          <th>ID Cliente</th>
          <th>Nombre Cliente</th>
          <th>Email Cliente</th>
          <th>Número de Compras</th>
          <th>Última Compra</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.cliente_id">
          <td>{{ item.cliente_id }}</td>
          <td>{{ item.nombre_cliente }}</td>
          <td>{{ item.email_cliente ?? 'N/A' }}</td>
          <td>{{ item.numero_compras_en_periodo }}</td>
          <td>{{ item.ultima_compra ?? 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { TopClienteFrecuencia } from '@/interfaces/reports/report_types'

const { data } = defineProps<{
  data: TopClienteFrecuencia[]
}>()
</script>

<style scoped>
/* Add any specific styles here if necessary */
</style>
