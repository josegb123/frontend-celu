<script setup lang="ts">
import { computed } from 'vue'

// --- 1. Definición de Props con Tipado Estricto ---

// Definir los tipos de las props para evitar el uso implícito de 'any'
interface Props {
  icon?: string
  title: string
  value: number | string
  format?: 'currency' | 'integer'
  variant?: 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'secondary' | 'dark'
  tooltip?: string
  actionText?: string
  actionLink?: string
  cardClass?: string
}

// Valores por defecto
const props = withDefaults(defineProps<Props>(), {
  icon: 'bi-box',
  format: 'integer',
  variant: 'secondary',
})

// --- 2. Función de Formato Tipada y Segura ---

/**
 * Función que aplica formato de moneda o número al valor.
 * Usa Intl.NumberFormat para manejo seguro de tipos y localización.
 * @param val El valor numérico o cadena a formatear.
 * @param format Tipo de formato ('currency' o 'integer').
 * @returns El valor formateado como cadena.
 */
const formatValue = computed(() => {
  // Aseguramos que el valor sea un número si es posible
  let numericValue: number
  if (typeof props.value === 'string') {
    numericValue = parseFloat(props.value) || 0
  } else {
    numericValue = props.value
  }

  // Si no es un número válido, retornamos el valor original o 0
  if (isNaN(numericValue)) return 'N/A'

  if (props.format === 'currency') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0, // Ajuste para ser más limpio
    }).format(numericValue)
  }

  // Formato de número simple (integer)
  return numericValue.toLocaleString('es-CO')
})
</script>

<template>
  <div class="card shadow-sm border border-1 h-100" :class="props.cardClass">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div class="pe-3">
          <h6 class="card-title text-uppercase fw-bold mb-1 text-muted">
            {{ title }}
            <i
              v-if="tooltip"
              class="bi bi-info-circle-fill ms-1 text-secondary"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              :title="tooltip"
            ></i>
          </h6>
          <p class="stat-value fw-bold mb-0 fs-4" :class="`text-${variant}`">
            {{ formatValue }}
          </p>
        </div>
        <div class="p-2 rounded-3 stat-icon-container" :class="`bg-${variant} bg-opacity-10`">
          <i :class="[icon, 'fs-5']" :style="{ color: `var(--bs-${variant})` }"></i>
        </div>
      </div>

      <p v-if="actionLink" class="card-text mt-2 mb-0">
        <router-link :to="actionLink" class="text-decoration-none" :class="`text-${variant}`">
          {{ actionText }} <i class="bi bi-arrow-right"></i>
        </router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Redefinición del contenedor del icono para alineación y tamaño */
.stat-icon-container {
  flex-shrink: 0; /* Asegura que no se encoja */
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Valor de la estadística */
.stat-value {
  /* fs-4: 1.5rem (aproximadamente) */
  font-size: 1.5rem;
  /* Asegurar que el número no envuelva si es muy largo, aunque se recomienda truncar en el padre si es extremo */
  white-space: nowrap;
}

/* Pequeño hack para permitir Tooltip sin inicialización global */
[data-bs-toggle='tooltip'] {
  cursor: help;
}
</style>
