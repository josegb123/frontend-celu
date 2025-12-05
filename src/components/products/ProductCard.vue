<template>
  <div class="card product-card h-100 shadow-lg border-0">
    <div class="image-container position-relative">
      <div v-if="isLowOrOut" :class="['stock-indicator', indicatorClass]">
        {{ indicatorText }}
      </div>

      <img
        :src="imageUrl"
        class="card-img-top"
        :alt="product.nombre"
        loading="lazy"
        @error="handleImageError"
        :class="{ 'image-low-stock': props.stockStatus === 'bajo' }"
      />

      <span class="category-badge badge text-bg-dark">
        {{ product.categoria?.nombre || 'Sin Categoría' }}
      </span>
    </div>

    <div class="card-body d-flex flex-column p-3">
      <h5 class="card-title mb-0 text-truncate text-body" :title="product.nombre">
        {{ product.nombre }}
      </h5>
      <p class="card-subtitle text-body-secondary small mb-3">
        Código: {{ product.codigo_barra || 'N/A' }}
      </p>

      <div class="d-flex justify-content-start gap-3 mb-3">
        <div class="price-box price-venta">
          <div class="price-label">Venta</div>
          <div class="price-value">
            ${{ parseFloat(product.precio_venta.toString()).toFixed(0) }}
          </div>
        </div>
        <div class="price-box price-compra">
          <div class="price-label">Compra</div>
          <div class="price-value">
            ${{ parseFloat(product.precio_compra.toString()).toFixed(0) }}
          </div>
        </div>
      </div>

      <div class="stock-info row g-1 text-center mt-auto mb-3">
        <div class="col-4">
          <div class="stock-item p-2 border" :class="stockBadgeClass">
            <small class="text-body-secondary">Stock</small>
            <div class="fw-bold">{{ product.stock_actual }}</div>
          </div>
        </div>

        <div class="col-4">
          <div class="stock-item p-2 bg-warning-subtle border border-warning">
            <small class="text-body-secondary">Reservado</small>
            <div class="fw-bold text-warning">{{ product.stock_reservado }}</div>
          </div>
        </div>

        <div class="col-4">
          <div class="stock-item p-2 bg-danger-subtle border border-danger">
            <small class="text-body-secondary">Mínimo</small>
            <div class="fw-bold text-danger">{{ product.stock_minimo }}</div>
          </div>
        </div>
      </div>

      <div class="card-actions d-flex justify-content-between gap-2 mt-auto">
        <button class="btn btn-sm btn-outline-primary w-50" @click="$emit('edit', product)">
          <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger w-50" @click="requestDelete">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Producto } from '@/services/ProductoService.js'

// --- SETUP REACTIVO ---
const isImageError = ref(false)

// --- PROPIEDADES Y EMITS ---
const props = defineProps<{
  product: Producto
  stockStatus: 'agotado' | 'bajo' | 'normal'
}>()

const emit = defineEmits<{
  (e: 'edit', product: Producto): void
  (e: 'delete', productId: number): void
}>()

// --- CÁLCULOS REACTIVOS ---

// Lógica computada para la visualización del texto
const isLowOrOut = computed(() => props.stockStatus !== 'normal')
const indicatorText = computed(() => {
  if (props.stockStatus === 'agotado') return 'AGOTADO'
  if (props.stockStatus === 'bajo') return `BAJO STOCK (${props.product.stock_actual})`
  return ''
})
const indicatorClass = computed(() => {
  if (props.stockStatus === 'agotado') return 'stock-agotado'
  if (props.stockStatus === 'bajo') return 'stock-bajo'
  return ''
})

/**
 * Determina la clase del badge de stock_actual basado en stock_minimo (compatible con Dark Mode).
 */
const stockBadgeClass = computed(() => {
  // Usamos clases de Bootstrap para fondos sutiles y bordes que se invierten automáticamente en modo oscuro.
  return props.product.stock_actual <= props.product.stock_minimo
    ? 'bg-danger-subtle border-danger text-danger'
    : 'bg-info-subtle border-info text-info'
})

/**
 * Genera la URL de la imagen, usando un placeholder si hay error o no hay URL.
 */
const imageUrl = computed(() => {
  if (!props.product.imagen_url || isImageError.value) {
    return '/no_image.webp'
  }
  return props.product.imagen_url
})

// --- MÉTODOS ---

const requestDelete = () => {
  emit('delete', props.product.id)
}

const handleImageError = () => {
  isImageError.value = true
}
</script>

<style scoped>
/* Contenedor Principal */
.product-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  /* Shadow adaptativo en Dark Mode */
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05) !important;
}
/* Estilo de hover para modo oscuro/claro */
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
  border-color: var(--bs-primary) !important;
  /* Ajuste de color de fondo al hacer hover */
  background-color: var(--bs-card-bg);
}

/* Imagen y Badge */
.image-container {
  position: relative;
  overflow: hidden;
  height: 200px;
}
.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.4em 0.7em;
  font-size: 0.75rem;
  z-index: 10;
  opacity: 0.95;
}

/* Títulos y Subtítulos: Usamos text-body y text-body-secondary para que se ajusten */
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
}

/* Precios */
.price-box {
  flex: 1;
  padding: 0.5rem 0;
  border-radius: 0.35rem;
  text-align: center;
  /* Usamos border-light para un borde sutil en modo claro, y el fondo se encarga del resto */
  border: 1px solid var(--bs-border-color-translucent);
}
.price-venta {
  background-color: var(--bs-success);
  color: white;
  border-color: var(--bs-success);
}
.price-compra {
  background-color: var(--bs-secondary);
  color: white;
  border-color: var(--bs-secondary);
}
.price-label {
  font-size: 0.7rem;
  opacity: 0.85;
}
.price-value {
  font-size: 1rem;
  font-weight: bold;
}

/* Stock Info */
.stock-info {
  /* Separador que se adapta al modo oscuro */
  border-top: 1px solid var(--bs-border-color-translucent);
  padding-top: 0.5rem;
}

.stock-item {
  border-radius: 0.25rem;
}

.image-container {
  /* Es crucial que sea relativo para posicionar el badge */
  position: relative;
  overflow: hidden;
}

.image-low-stock {
  opacity: 0.3;
  transition: opacity 0.3s ease-in-out;
}

.stock-indicator {
  position: absolute;
  top: 0;
  right: 100;
  z-index: 10;
  padding: 15px 10px; /* Un poco más grande para visibilidad */
  font-weight: bold;
  font-size: 0.8rem;
  line-height: 1;
  border-radius: 0 0 8px 0;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

/* Estilo para AGOTADO (Rojo Fuerte) */
.stock-agotado {
  background-color: #c90a1a; /* Rojo oscuro */
  color: white;
}

/* Estilo para BAJO STOCK (Amarillo/Naranja de Advertencia) */
.stock-bajo {
  background-color: #ffc107; /* Amarillo */
  color: #212529; /* Texto oscuro */
}
</style>
