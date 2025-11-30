<template>
  <div class="product-grid-pos-container">
    <div
      class="row g-3"
      :class="{
        'row-cols-2': windowWidth < 800,
        'row-cols-3': windowWidth >= 800,
      }"
    >
      <div v-if="isLoading" class="col-12 text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando productos...</span>
        </div>
        <p class="mt-2 text-muted">Cargando productos...</p>
      </div>

      <div v-else-if="products.length === 0 && !isInitialLoad" class="col-12 my-5">
        <div class="alert alert-warning text-center">
          No se encontraron productos con los filtros.
        </div>
      </div>

      <div v-else v-for="product in products" :key="product.id" class="col">
        <div
          class="card product-card-pos shadow-sm text-center"
          @click="emit('product-selected', product)"
        >
          <div class="card-body p-3">
            <h6 class="card-title mb-1 text-primary">{{ product.nombre }}</h6>
            <p class="card-text fw-bold mb-0">
              ${{ parseFloat(product.precio_venta.toString()).toFixed(2) }}
            </p>
            <span class="badge bg-secondary">{{ product.stock_actual }} en stock</span>
          </div>
          <div class="card-footer bg-light p-1">
            <small class="text-muted">Clic para agregar</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { debounce } from 'lodash' // Asumiendo que usas lodash
import ProductoService, { type Producto } from '@/services/ProductoService.js'

// --- PROPS y EMITS ---
const props = defineProps<{
  /** Término de búsqueda pasado desde BuscadorProducto (nombre o código). */
  searchQuery: string
}>()

const emit = defineEmits<{
  /** Evento clave: Agrega el producto al carrito del PosView. */
  (e: 'product-selected', product: Producto): void
}>()

// --- ESTADO LOCAL ---
const products = ref<Producto[]>([])
const isLoading = ref(false)
const isInitialLoad = ref(true)

// --- MÉTODOS DE BÚSQUEDA ---

/**
 * Carga la lista de productos sin paginación (solo la primera página).
 */
const fetchProducts = async () => {
  isLoading.value = true
  products.value = []

  // Parámetros de búsqueda. Buscamos por el query de la prop.
  const params = {
    search: props.searchQuery,
    page: 1,
    // Podrías añadir un filtro de 'solo_activos' aquí si aplica
  }

  try {
    const data = await ProductoService.getProductos(params)
    products.value = data
  } catch (error) {
    console.error('Error al cargar productos para POS:', error)
  } finally {
    isLoading.value = false
    isInitialLoad.value = false
  }
}

// Envuelve la función de búsqueda en un debounce de 300ms
const debouncedFetch = debounce(fetchProducts, 300)

// --- OBSERVADORES ---

// Observa cambios en el filtro de búsqueda del input principal y recarga la lista
watch(
  () => props.searchQuery,
  (newQuery) => {
    // Si la query es corta (ej. < 3), mostramos los productos iniciales/más vendidos.
    // Si es larga, ejecutamos la búsqueda debounced.
    if (newQuery && newQuery.length >= 3) {
      debouncedFetch()
    } else if (!newQuery) {
      // Si el campo de búsqueda está vacío, recargamos la lista base inmediatamente
      fetchProducts()
    }
  },
)

// --- CICLO DE VIDA ---
onMounted(fetchProducts)

// --- RESIZE WINDOW para el grid ---
const windowWidth = ref(window.innerWidth)
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}
window.addEventListener('resize', updateWindowWidth)
onMounted(() => {
  updateWindowWidth()
})
</script>

<style scoped>
.product-grid-pos-container {
  min-height: 200px;
}
.product-card-pos {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.product-card-pos:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  border-color: #6a0dad;
}
</style>
