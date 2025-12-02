<script setup lang="ts">
// --- 1. Definición de Tipos para Props ---

// Interfaz genérica para los elementos de datos del ranking
interface RankingItem {
  [key: string]: unknown // Permite que 'keyField' y 'valueField' accedan a cualquier propiedad
}

// Interfaz de Props
interface Props {
  title: string
  subtitle: string
  data: RankingItem[]
  keyField: string
  valueField: string
  valueFormat?: 'currency' | 'integer'
  cardClass?: string
}

// Valores por defecto y tipado estricto
const props = withDefaults(defineProps<Props>(), {
  valueFormat: 'currency',
  data: () => [], // Inicialización segura
})

// --- 2. Función de Formato Tipada y Segura (Computed) ---

/**
 * Función que aplica formato de moneda o número al valor.
 * @param val El valor numérico o cadena a formatear.
 * @returns El valor formateado como cadena.
 */
const formatValue = (val: unknown, format: 'currency' | 'integer'): string => {
  // Aseguramos que el valor sea un número si es posible
  let numericValue: number
  if (typeof val === 'string') {
    numericValue = parseFloat(val) || 0
  } else if (typeof val === 'number') {
    numericValue = val
  } else {
    // Si no es un tipo esperado, retorna N/A o un valor seguro
    return 'N/A'
  }

  if (format === 'currency') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0, // Ajuste para limpiar visualmente
    }).format(numericValue)
  }

  // Formato de número simple
  return numericValue.toLocaleString('es-CO')
}
</script>

<template>
  <div class="card h-100 border border-1" :class="props.cardClass">
    <div class="card-header bg-body-tertiary p-3">
      <h5 class="mb-0 fs-5 fw-semibold">{{ title }}</h5>
      <small class="text-muted">{{ subtitle }}</small>
    </div>
    <div class="card-body p-0">
      <ul class="list-group list-group-flush">
        <li
          v-for="(item, index) in data"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center py-2"
        >
          <div class="d-flex align-items-center">
            <span
              class="badge rounded-pill me-2 fw-medium"
              :class="index < 3 ? 'text-bg-warning' : 'text-bg-secondary'"
            >
              #{{ index + 1 }}
            </span>
            <span class="fw-bold small">{{ item[keyField] }}</span>
          </div>
          <span class="text-success fw-bold fs-6">
            {{ formatValue(item[valueField], valueFormat) }}
          </span>
        </li>
        <li v-if="data.length === 0" class="list-group-item text-center text-muted py-3 small">
          No hay datos suficientes para el ranking.
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Asegura que los elementos de lista sean más compactos */
.list-group-item {
  /* Añadimos un borde sutil para que se asemeje a una tabla limpia */
  border-bottom: 1px solid var(--bs-border-color-translucent);
}

/* El estilo 'small' se logra con la etiqueta <small> o con la clase .small (si está disponible/definida) */
.small {
  font-size: 0.875em; /* Tamaño estándar de Bootstrap */
}

/* El fondo del encabezado body-tertiary se adapta automáticamente */
.bg-body-tertiary {
  background-color: var(--bs-body-tertiary-bg) !important;
}
</style>
