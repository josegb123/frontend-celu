<template>
  <tr>
    <td class="fw-bold">#{{ venta.venta_id }}</td>
    <td>{{ venta.cliente_nombre || 'Cliente Genérico' }}</td>
    <td>{{ venta.usuario_vendedor || 'N/A' }}</td>
    <td>
      <span :class="`badge text-bg-${estadoColor}`">{{ estadoTexto }}</span>
    </td>
    <td class="fw-bold">${{ venta?.total_venta }}</td>
    <td>{{ formattedDate }}</td>
    <td class="text-center">
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-info" @click="$emit('ver-detalle', venta.venta_id)">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-outline-secondary" @click="$emit('editar', venta)">
          <i class="bi bi-pencil"></i>
        </button>
        <button
          class="btn btn-outline-danger"
          @click="$emit('eliminar', venta.venta_id)"
          :disabled="venta.estado === 'cancelada'"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VentaIndexResponse } from '../../services/VentaService'

const props = defineProps<{
  venta: VentaIndexResponse
}>()

const estadoColor = computed(() => {
  switch (props.venta.estado) {
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

const estadoTexto = computed(() => {
  // Primera letra mayúscula
  return props.venta.estado.charAt(0).toUpperCase() + props.venta.estado.slice(1).replace('_', ' ')
})

const formattedDate = computed(() => {
  return new Date(props.venta.created_at).toLocaleDateString()
})
</script>
