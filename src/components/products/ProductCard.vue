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
        <span class="price-tag bg-success text-white">Venta: ${{ product.precio_venta }}</span>
        <span class="price-tag bg-secondary text-white ms-2"
          >Compra: ${{ product.precio_compra }}</span
        >
      </div>

      <div class="stocks small mb-3 mt-auto">
        <p class="mb-1">
          <span :class="stockBadgeClass">Stock: {{ product.stock_actual }}</span>
          <span class="text-warning ms-2">Reservado: {{ product.stock_reservado }}</span>
        </p>
        <p class="mb-0 text-danger">Mínimo: {{ product.stock_minimo }}</p>
      </div>

      <div class="card-actions d-flex justify-content-between mt-2">
        <button class="btn btn-sm btn-outline-primary" @click="$emit('edit', product)">
          <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete">
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
    ? 'badge bg-danger'
    : 'badge bg-info'
})

/**
 * Genera la URL de la imagen, usando un placeholder si no hay imagen_url.
 */
const imageUrl = computed(() => {
  return props.product.imagen_url ? props.product.imagen_url : 'https://picsum.photos/200/300.webp' // Placeholder
})

// --- MÉTODOS ---

/**
 * Muestra un diálogo de confirmación antes de emitir la acción de eliminación.
 */
const confirmDelete = () => {
  if (confirm(`¿Está seguro de que desea eliminar el producto "${props.product.nombre}"?`)) {
    emit('delete', props.product.id)
  }
}

/**
 * Maneja el error de carga de la imagen (ej. 404) y la reemplaza con el placeholder.
 */
const handleImageError = () => {
  // Al dispararse el error, simplemente cambiamos el estado
  isImageError.value = true
  // Vue/el computed property se encargará de actualizar el src del <img>.
  // NO MANIPULAMOS EL DOM DIRECTAMENTE.
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
