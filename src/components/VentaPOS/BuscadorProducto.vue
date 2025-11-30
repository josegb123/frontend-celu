<template>
  <div class="product-search-container">
    <div class="input-group">
      <span class="input-group-text pos-bg-accent text-light" id="search-icon">
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        v-model="searchQuery"
        class="form-control form-control-lg shadow-none"
        placeholder="Buscar por código, nombre (min. 3 caracteres)"
        aria-label="Buscar producto"
        aria-describedby="search-icon"
      />
    </div>

    <div class="mt-3">
      <div v-if="isLoading" class="alert alert-info py-2 text-center mb-0">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Buscando productos...
      </div>
      <div v-else-if="errorMessage" class="alert alert-danger py-2 mb-0">
        {{ errorMessage }}
      </div>
      <div
        v-else-if="searchQuery.length >= 3 && searchResults.length === 0"
        class="alert alert-warning py-2 text-center mb-0"
      >
        No se encontraron productos con el término "{{ searchQuery }}".
      </div>
    </div>

    <div
      v-if="searchQuery.length >= 3 && searchResults.length > 0"
      class="search-results-list mt-3"
    >
      <ul class="list-group shadow-sm border-0">
        <li
          v-for="producto in searchResults"
          :key="producto.id"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
          @click="selectProduct(producto)"
          style="cursor: pointer"
        >
          <div>
            <p class="mb-0 fw-bold">{{ producto.nombre }}</p>
            <small class="text-muted">
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
          <span class="badge bg-success fs-6 p-2 rounded-pill">
            ${{ parseFloat(producto.precio_venta.toString()).toFixed(2) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
// Asegúrate de que la interfaz Producto se importe correctamente desde el servicio
import ProductoService, { type Producto } from '@/services/ProductoService'
import { debounce } from 'lodash' // Se asume que tienes lodash instalado o una utilidad similar

// --- 1. Definiciones de Props y Emits ---

// Define el evento que emitirá el producto seleccionado al componente padre
const emit = defineEmits<{
  (e: 'product-selected', producto: Producto): void
}>()

// --- 2. Estado Local ---

const searchQuery = ref('')
// Inicializado como array vacío, previniendo el error de 'length'
const searchResults = ref<Producto[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- 3. Lógica de Búsqueda con Debounce ---

/**
 * Función que encapsula la lógica de búsqueda.
 * Llama al servicio si el término tiene al menos 3 caracteres.
 */
const performSearch = async (query: string) => {
  // Limpiar resultados y errores anteriores
  searchResults.value = []
  errorMessage.value = null

  if (query.length < 3) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const data = await ProductoService.searchProductos(query)
    searchResults.value = data
    if (Array.isArray(data)) {
      searchResults.value = data
    } else {
      // En caso de que el servicio falle en devolver un array []
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
  // Limpiamos la búsqueda para dejar la interfaz lista para una nueva búsqueda
  searchQuery.value = ''
  searchResults.value = []
}
</script>
<style scoped>
/* Colores de acento para asegurar consistencia con PosView.vue */
.pos-bg-accent {
  background-color: #6a0dad !important; /* Púrpura oscuro */
}
.search-results-list {
  max-height: 400px; /* Limita la altura de la lista de resultados */
  overflow-y: auto;
  border-radius: 0.25rem;
  /* Asegura que la lista quede justo debajo del input */
  position: absolute;
  width: calc(
    100% - 3rem
  ); /* Ajuste basado en el padding de 1.5rem a cada lado del container padre */
  z-index: 1050; /* Z-index alto para que esté por encima de otros elementos */
}
/* Estilo para que la lista aparezca correctamente sobre otros elementos */
.product-search-container {
  position: relative;
}
</style>
