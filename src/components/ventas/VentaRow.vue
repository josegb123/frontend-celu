<template>
  <tr>
    <td class="fw-bold">#{{ venta.venta_id }}</td>
    <td>{{ venta.cliente_nombre || 'Cliente Genérico' }}</td>
    <td>{{ venta.usuario_vendedor || 'N/A' }}</td>
    <td>
      <span :class="`badge text-bg-${estadoColor}`">{{ estadoTexto }}</span>
    </td>
    <td class="fw-bold fs-6">{{ formattedCurrency }}</td>
    <td>{{ formattedDate }}</td>
    <td class="text-center">
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-info" @click="$emit('ver-detalle', venta.venta_id)">
          <i class="bi bi-eye"></i>
        </button>

        <button
          class="btn btn-outline-danger"
          @click="$emit('eliminar', venta.venta_id)"
          :disabled="venta.estado === 'cancelada'"
          v-if="isAdmin"
        >
          <i class="bi bi-trash"></i>
        </button>
        <button class="btn btn-outline-primary" @click="imprimirFactura" title="Imprimir Factura">
          <i class="bi bi-printer"></i>
        </button>

        <button class="btn btn-outline-info" @click="$emit('ver-detalle', venta.venta_id)">
          <i class="bi bi-eye"></i>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VentaIndexResponse } from '../../services/VentaService'
import { useAuthStore } from '@/store/authStore' // Added import

const props = defineProps<{
  venta: VentaIndexResponse
}>()

const authStore = useAuthStore() // Added
const isAdmin = computed(() => {
  // Added
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

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

const imprimirFactura = () => {
  // 1. Obtener la URL base de tu API (ajusta según tu configuración de Vite)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://tu-dominio.com/api'

  // 2. Construir la ruta al endpoint que definimos en Laravel
  // Asegúrate de que coincida con la ruta definida en routes/web.php o api.php
  const url = `${baseUrl}/factura/imprimir/${props.venta.venta_id}`

  // 3. Abrir en una pestaña nueva
  window.open(url, '_blank')
}

const estadoTexto = computed(() => {
  // Primera letra mayúscula
  return props.venta.estado.charAt(0).toUpperCase() + props.venta.estado.slice(1).replace('_', ' ')
})

const formattedDate = computed(() => {
  return new Date(props.venta.created_at).toLocaleDateString()
})

const formattedCurrency = computed(() => {
  return props.venta.total_venta.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
  })
})
</script>
