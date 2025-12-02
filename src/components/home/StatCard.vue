<script setup>
const props = defineProps({
  icon: String,
  title: String,
  value: [Number, String],
  format: {
    type: String,
    default: 'integer', // 'currency' o 'integer'
  },
  variant: {
    type: String,
    default: 'secondary', // primary, success, danger, etc.
  },
  tooltip: String,
  actionText: String,
  actionLink: String,
})

// Función de formato (simplificada)
const formatValue = (val, format) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)
  }
  return val.toLocaleString()
}
</script>

<template>
  <div class="card shadow-sm border-0 h-100" :class="`bg-white text-dark`">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title text-muted fw-bold text-uppercase mb-1">
            {{ title }}
            <i
              v-if="tooltip"
              class="bi bi-info-circle-fill text-secondary ms-1"
              data-bs-toggle="tooltip"
              :title="tooltip"
            ></i>
          </h5>
          <h1 class="display-5 fw-bold" :class="`text-${variant}`">
            {{ formatValue(value, format) }}
          </h1>
        </div>
        <div class="p-3 rounded-circle" :class="`bg-${variant} bg-opacity-10`">
          <i :class="[icon, 'display-6']" :style="{ color: `var(--bs-${variant})` }"></i>
        </div>
      </div>

      <p v-if="actionLink" class="card-text mt-3">
        <router-link :to="actionLink" class="text-decoration-none" :class="`text-${variant}`">
          {{ actionText }} <i class="bi bi-arrow-right"></i>
        </router-link>
      </p>
    </div>
  </div>
</template>
