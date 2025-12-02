<template>
  <div class="product-search-container">
    <div class="input-group">
      <span class="input-group-text text-bg-primary" id="search-icon">
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        v-model="searchQuery"
        class="form-control form-control-sm shadow-none"
        placeholder="Buscar por código, nombre (min. 3 caracteres)"
        aria-label="Buscar producto"
        aria-describedby="search-icon"
      />
    </div>

    <div class="mt-2">
      <div v-if="isLoading" class="alert alert-info py-1 text-center mb-0 small">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Buscando productos...
      </div>
      <div v-else-if="errorMessage" class="alert alert-danger py-1 mb-0 small">
        {{ errorMessage }}
      </div>
      <div
        v-else-if="searchQuery.length >= 3 && searchResults.length === 0"
        class="alert alert-warning py-1 text-center mb-0 small"
      >
        No se encontraron productos con el término "{{ searchQuery }}".
      </div>
    </div>

    <div
      v-if="searchQuery.length >= 3 && searchResults.length > 0"
      class="search-results-list mt-2"
    >
      <ul class="list-group list-group-flush shadow-sm border rounded-3">
        <li
          v-for="producto in searchResults"
          :key="producto.id"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-1"
          @click="selectProduct(producto)"
          style="cursor: pointer"
        >
          <div>
            <p class="mb-0 fw-bold small">{{ producto.nombre }}</p>
            <small class="text-muted small">
              Cód. Barra: {{ producto.codigo_barra || 'N/A' }} | Stock:
              <span
                class="fw-bold"
                :class="{
                  'text-danger': producto.stock_actual <= producto.stock_minimo,
                  'text-success': producto.stock_actual > producto.stock_minimo,
                }"
              >
                {{ producto.stock_actual }}
              </span>
            </small>
          </div>
          <span class="badge text-bg-success fs-7 p-1 rounded-pill">
            ${{ parseFloat(producto.precio_venta.toString()).toFixed(2) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import ProductoService, { type Producto } from '@/services/ProductoService'
import { debounce } from 'lodash'

// --- 1. Definiciones de Props y Emits ---

/**
 * Define el evento que emitirá el producto seleccionado al componente padre.
 * @param e - Nombre del evento.
 * @param producto - El objeto Producto seleccionado.
 */
const emit = defineEmits<{
  (e: 'product-selected', producto: Producto): void
}>()

// --- 2. Estado Local ---

const searchQuery = ref('')
const searchResults = ref<Producto[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- 3. Lógica de Búsqueda con Debounce ---

/**
 * Función que encapsula la lógica de búsqueda.
 * Llama al servicio si el término tiene al menos 3 caracteres.
 * @param query El texto de búsqueda.
 */
const performSearch = async (query: string) => {
  searchResults.value = []
  errorMessage.value = null

  if (query.length < 3) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const data = await ProductoService.searchProductos(query)

    if (Array.isArray(data)) {
      searchResults.value = data
    } else {
      // Manejo de respuesta inesperada del servicio
      searchResults.value = []
      errorMessage.value = 'Respuesta inesperada del servidor.'
    }
  } catch (error) {
    errorMessage.value = 'Error al cargar productos. Intente de nuevo.'
    console.error('Error en performSearch:', error)
  } finally {
    isLoading.value = false
  }
}

// Creamos la versión "debounced" de la función de búsqueda (500ms)
const debouncedSearch = debounce(performSearch, 500)

// Observamos el cambio en searchQuery y llamamos a la función debounced
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

// --- 4. Lógica de Selección ---

/**
 * Emite el producto seleccionado al componente padre y limpia la búsqueda.
 * @param producto El producto seleccionado
 */
const selectProduct = (producto: Producto) => {
  emit('product-selected', producto)
  // Limpiamos la búsqueda después de la selección
  searchQuery.value = ''
  searchResults.value = []
}
</script>
<style scoped>
/* 1. Limita la altura y permite el desplazamiento si hay muchos resultados */
.search-results-list {
  max-height: 250px; /* Reducido a 250px para ser más compacto */
  overflow-y: auto;
  border-radius: 0.25rem;
}

/* 2. Definición del tamaño de fuente fs-7 para la lista de resultados */
.fs-7 {
  font-size: 0.85rem;
}
</style>
