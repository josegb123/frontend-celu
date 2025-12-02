<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  data: Array,
  keyField: String,
  valueField: String,
  valueFormat: {
    type: String,
    default: 'currency',
  },
})

// Función de formato (reutilizada)
const formatValue = (val, format) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val)
  }
  return val.toLocaleString()
}
</script>

<template>
  <div class="card shadow-sm h-100">
    <div class="card-header bg-light">
      <h5 class="mb-0">{{ title }}</h5>
      <small class="text-muted">{{ subtitle }}</small>
    </div>
    <div class="card-body p-0">
      <ul class="list-group list-group-flush">
        <li
          v-for="(item, index) in data"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <span class="badge rounded-pill me-2" :class="index < 3 ? 'bg-warning' : 'bg-secondary'"
              >#{{ index + 1 }}</span
            >
            <span class="fw-bold">{{ item[keyField] }}</span>
          </div>
          <span class="text-success fw-bold">{{ formatValue(item[valueField], valueFormat) }}</span>
        </li>
        <li v-if="data.length === 0" class="list-group-item text-center text-muted py-3">
          No hay datos suficientes para el ranking.
        </li>
      </ul>
    </div>
  </div>
</template>
