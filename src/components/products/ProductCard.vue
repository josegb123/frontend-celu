<template>
  <div class="card product-card h-100 shadow-sm">
    <img
      :src="imageUrl"
      class="card-img-top"
      :alt="product.nombre"
      loading="lazy"
      @error="handleImageError"
    />

    <div class="card-body d-flex flex-column">
      <h5 class="card-title mb-1 text-truncate" :title="product.nombre">
        {{ product.nombre }}
      </h5>
      <p class="card-subtitle text-muted small mb-2">
        {{ product.categoria?.nombre || 'Sin Categoría' }}
      </p>

      <div class="prices mb-3">
        <div class="mb-1">
          <span class="price-tag bg-success text-white">Venta: ${{ product.precio_venta }}</span>
        </div>
        <div>
          <span class="price-tag bg-secondary text-white"
            >Compra: ${{ product.precio_compra }}</span
          >
        </div>
      </div>

      <div class="d-flex flex-row flex-lg-column gap-1 align-items-start">
        <span :class="stockBadgeClass">Stock: {{ product.stock_actual }}</span>
        <span class="price-tag text-bg-warning">Reservado: {{ product.stock_reservado }}</span>
        <span class="price-tag text-bg-danger">Mínimo: {{ product.stock_minimo }}</span>
      </div>

      <div class="card-actions d-flex justify-content-between mt-2">
        <button class="btn btn-sm btn-outline-primary" @click="$emit('edit', product)">
          <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger" @click="requestDelete">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Producto } from '@/services/ProductoService.js'
const isImageError = ref(false)

// --- PROPIEDADES Y EMITS ---
const props = defineProps<{
  product: Producto
}>()

const emit = defineEmits<{
  (e: 'edit', product: Producto): void
  (e: 'delete', productId: number): void
}>()

// --- CÁLCULOS REACTIVOS ---

/**
 * Determina la clase del badge de stock_actual basado en stock_minimo.
 */
const stockBadgeClass = computed(() => {
  return props.product.stock_actual <= props.product.stock_minimo
    ? 'price-tag text-bg-danger '
    : 'price-tag text-bg-info '
})

/**
 * Genera la URL de la imagen, usando un placeholder si hay error o no hay URL.
 */
const imageUrl = computed(() => {
  // Usar el placeholder si: 1) no hay URL, O 2) hubo error de carga (isImageError.value)
  if (!props.product.imagen_url || isImageError.value) {
    return '/public/no_image.webp'
  }
  return props.product.imagen_url
})

// --- MÉTODOS ---

/**
 * 💥 CORRECCIÓN CLAVE: Elimina el confirm() y solo emite el ID.
 * Delega la confirmación modal al componente padre (ProductGrid).
 */
const requestDelete = () => {
  // Ya no necesitamos 'if (confirm(...))'
  emit('delete', props.product.id)
}

/**
 * Maneja el error de carga de la imagen (ej. 404) y la reemplaza con el placeholder.
 */
const handleImageError = () => {
  // Cambiamos el estado, lo que forzará a la computed property 'imageUrl' a reevaluarse.
  isImageError.value = true
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-img-top {
  height: 200px; /* Altura fija para la imagen */
  object-fit: cover;
}

.price-tag {
  padding: 0.2em 0.5em;
  border-radius: 0.25rem;
  font-weight: bold;
  font-size: 0.85rem;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 600;
}
</style>
