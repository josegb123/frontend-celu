<template>
  <div>
    <div class="row mb-4 border-bottom pb-3">
      <div class="col-md-6">
        <h5 class="fw-bold text-primary">Venta #{{ ventaData.venta_id }}</h5>
        <p class="mb-1">
          <strong>Cliente:</strong> {{ ventaData?.cliente_nombre || 'Cliente Anonimo' }}
        </p>
        <p class="mb-1"><strong>Vendedor:</strong> {{ ventaData.usuario_vendedor || 'N/A' }}</p>
        <p class="mb-1">
          <strong>Fecha:</strong> {{ new Date(ventaData.created_at).toLocaleString() }}
        </p>
      </div>
      <div class="col-md-6 text-md-end">
        <span :class="`badge fs-5 bg-${estadoColor}`">{{ estadoTexto }}</span>
        <h4 class="mt-2 text-success">Total: ${{ ventaData.total_venta }}</h4>
        <p class="mb-0">
          Método de Pago: <strong>{{ ventaData.metodo_pago }}</strong>
        </p>
      </div>
    </div>

    <h6 class="mt-3 text-secondary">Totales Financieros</h6>
    <ul class="list-group list-group-flush mb-4 border">
      <li class="list-group-item d-flex justify-content-between">
        <span>Subtotal Neto:</span>
        <span class="fw-bold">${{ ventaData.totales_financieros.subtotal }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Descuento Aplicado:</span>
        <span class="text-danger fw-bold"
          >-${{ ventaData.totales_financieros.descuento_total }}</span
        >
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>IVA ({{ ventaData.totales_financieros.iva_porcentaje }}%):</span>
        <span class="fw-bold">${{ ventaData.totales_financieros.iva_monto }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span class="fs-5 fw-bold">TOTAL FINAL:</span>
        <span class="fs-5 fw-bold text-success">${{ ventaData.total_venta }}</span>
      </li>
    </ul>

    <h6 class="mt-4 text-secondary">
      Detalles de Productos ({{ ventaData.detalles_completos.length }} ítems)
    </h6>
    <div class="table-responsive">
      <table class="table table-bordered table-sm">
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">Precio Unit.</th>
            <th class="text-end">Estado</th>
            <th class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ventaData.detalles_completos" :key="index">
            <td>{{ item.nombre_producto_historico || `Producto ID: ${item.id}` }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-end">${{ item.precio_unitario }}</td>
            <td class="text-end fw-bold">{{ item.estado }}</td>
            <td class="text-end fw-bold">${{ item.subtotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Asegúrate de que la ruta a VentaService sea correcta desde aquí
import type { VentaShowResponse } from '../../services/VentaService'

const props = defineProps<{
  ventaData: VentaShowResponse
}>()

// Lógica para determinar el color del badge del estado
const estadoColor = computed(() => {
  switch (props.ventaData.estado) {
    case 'finalizada':
      return 'success'
    case 'pendiente_pago':
      return 'warning'
    case 'cancelada':
      return 'danger'
    default:
      return 'secondary'
  }
})

// Lógica para formatear el texto del estado (Ej: 'pendiente_pago' -> 'Pendiente Pago')
const estadoTexto = computed(() => {
  return (
    props.ventaData.estado.charAt(0).toUpperCase() +
    props.ventaData.estado.slice(1).replace('_', ' ')
  )
})
</script>
<style scoped></style>
