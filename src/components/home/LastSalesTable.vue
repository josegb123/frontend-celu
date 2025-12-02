<script setup lang="ts">
const props = defineProps({
  title: String,
  subtitle: String,
  sales: Array, // Arreglo de objetos de venta
})

// Asumiendo que la venta tiene: id, total, created_at, cliente_nombre
const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="card shadow-sm h-100">
    <div class="card-header bg-light">
      <h5 class="mb-0">{{ title }}</h5>
      <small class="text-muted">{{ subtitle }}</small>
    </div>
    <div class="card-body p-0 table-responsive">
      <table class="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th class="text-end">Monto</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.id">
            <td>#{{ sale.id }}</td>
            <td>{{ sale.cliente_nombre || 'Cliente Anónimo' }}</td>
            <td class="text-end fw-bold text-primary">{{ formatCurrency(sale.total) }}</td>
            <td>{{ formatDate(sale.created_at) }}</td>
          </tr>
          <tr v-if="sales.length === 0">
            <td colspan="4" class="text-center text-muted">No hay ventas recientes.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card-footer text-end">
      <router-link to="/ventas" class="btn btn-sm btn-outline-secondary"
        >Ver todas las ventas</router-link
      >
    </div>
  </div>
</template>
