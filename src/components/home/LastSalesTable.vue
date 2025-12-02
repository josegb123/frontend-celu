<script setup lang="ts">
// --- 1. Definición de Tipos ---

// Definición de la interfaz para una venta mínima (asumida por el componente)
interface VentaMinimal {
  id: number | string
  total: number
  created_at: string
  cliente_nombre: string | null
}

// Interfaz de Props con tipado estricto
interface Props {
  title: string
  subtitle: string
  sales: VentaMinimal[]
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  sales: () => [], // Inicialización segura
})

// --- 2. Funciones de Formato Tipadas (Computed) ---

/**
 * Formatea un valor numérico a moneda colombiana (COP).
 * @param val El valor a formatear.
 * @returns El valor formateado como cadena.
 */
const formatCurrency = (val: number): string => {
  // Convierte a número si es string
  if (typeof val === 'string') val = Number(val)
  // Manejo de NaN o valores nulos de forma segura
  if (typeof val !== 'number' || isNaN(val)) return 'N/A'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}

/**
 * Formatea una cadena de fecha a formato de hora local.
 * @param dateString La cadena ISO de la fecha.
 * @returns La hora formateada.
 */
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}
</script>

<template>
  <div class="card h-100 border border-1" :class="props.cardClass">
    <div class="card-header bg-body-tertiary p-3">
      <!-- Título principal más pequeño (fs-5) -->
      <h5 class="mb-0 fs-5 fw-semibold">{{ title }}</h5>
      <!-- Subtítulo pequeño (small tag) -->
      <small class="text-muted">{{ subtitle }}</small>
    </div>

    <!-- Contenido de la tabla con scroll y padding 0 -->
    <div class="card-body p-0 table-responsive">
      <!-- 🚨 AJUSTE 3: Tabla compacta, sin margen inferior y con texto más pequeño -->
      <table class="table table-striped table-hover mb-0 fs-6">
        <thead>
          <tr>
            <th class="small">ID Venta</th>
            <th class="small">Cliente</th>
            <th class="text-end small">Monto</th>
            <th class="small">Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.id" class="align-middle">
            <td class="small text-muted">#{{ sale.id }}</td>
            <td class="small">{{ sale.cliente_nombre || 'Anónimo' }}</td>
            <td class="text-end fw-bold text-primary small">{{ formatCurrency(sale.total) }}</td>
            <td class="small">{{ formatDate(sale.created_at) }}</td>
          </tr>
          <tr v-if="sales.length === 0">
            <td colspan="4" class="text-center text-muted small py-3">No hay ventas recientes.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer text-end bg-body-tertiary p-2 border-top-0">
      <router-link to="/ventas" class="btn btn-sm btn-outline-primary small"
        >Ver todas las ventas <i class="bi bi-arrow-right"></i
      ></router-link>
    </div>
  </div>
</template>

<style scoped>
/* Asegura que los textos en la tabla sean uniformemente pequeños */
.small {
  font-size: 0.85rem !important;
}

/* Encabezado y pie de página con fondo adaptable */
.bg-body-tertiary {
  background-color: var(--bs-body-tertiary-bg) !important;
}

/* Reduce el padding de las celdas de la tabla para hacer las filas más delgadas */
.table > :not(caption) > * > * {
  padding: 0.4rem 0.5rem; /* Padding vertical y horizontal reducido */
}

/* Asegurar que la tabla ocupe todo el espacio vertical disponible */
.table-responsive {
  max-height: 400px; /* Limitar la altura para scroll si es necesario */
  overflow-y: auto;
}
</style>
