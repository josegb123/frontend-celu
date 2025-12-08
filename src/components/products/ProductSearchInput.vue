<template>
  <div
    class="product-search-container"
    @keydown.esc="closeDropdown"
    @keydown.up.prevent="navigateUp"
    @keydown.down.prevent="navigateDown"
    @keydown.enter.prevent="handleEnter"
    ref="autocompleteRef"
  >
    <input
      type="text"
      class="form-control"
      ref="searchInputRef"
      :placeholder="
        selectedProduct
          ? `${selectedProduct.nombre} (#${selectedProduct.codigo_barra})`
          : 'Buscar Producto por Nombre o Código...'
      "
      :value="searchQuery"
      @input="updateQuery(($event.target as HTMLInputElement).value)"
      @focus="isDropdownOpen = true"
      @blur="closeDropdownDelayed"
    />

    <div v-if="loading" class="spinner-overlay">
      <span class="spinner-border spinner-border-sm"></span>
    </div>

    <div
      v-if="isDropdownOpen && searchQuery.length > 0 && (searchResults.length || loading)"
      class="search-results-dropdown card"
    >
      <ul class="list-group list-group-flush">
        <li v-if="loading" class="list-group-item text-center">Cargando...</li>
        <li
          v-else-if="searchResults.length === 0"
          class="list-group-item text-center text-muted small"
        >
          No se encontraron resultados.
        </li>
        <li
          v-for="(product, index) in searchResults"
          :key="product.id"
          :class="['list-group-item list-group-item-action', { active: index === activeIndex }]"
          @mousedown.prevent="selectProduct(product)"
          @mousemove="activeIndex = index"
          title="Click para seleccionar"
        >
          <span class="fw-bold">{{ product.nombre }}</span>
          <span class="text-muted small float-end"> Stock: **{{ product.stock_actual }}** </span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import ProductoService from '@/services/ProductoService'
import type { IProducto } from '@/interfaces/IProductoInterfaces'

const props = defineProps<{
  initialProduct?: IProducto | null
}>()

const emit = defineEmits<{
  (e: 'selectProduct', product: IProducto): void
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const searchResults = ref<IProducto[]>([])
const isDropdownOpen = ref(false)
const selectedProduct = ref<IProducto | null>(props.initialProduct || null)
const loading = ref(false)
const activeIndex = ref(-1)

const DEBOUNCE_DELAY = 300
let debounceTimer: number | undefined

const updateQuery = (value: string) => {
  searchQuery.value = value
  if (debounceTimer) clearTimeout(debounceTimer)

  // 🎯 1. Buscar desde el segundo carácter (>= 2)
  if (value.length >= 2) {
    // Si la búsqueda es válida (>= 2 caracteres), realiza la búsqueda con debounce
    debounceTimer = setTimeout(performSearch, DEBOUNCE_DELAY)
  } else if (value.length === 0) {
    // Si no hay texto, limpia los resultados
    searchResults.value = []
  }

  // Abrir siempre el dropdown si hay algún texto para mostrar resultados o sugerencias
  isDropdownOpen.value = true
  activeIndex.value = -1
}

const performSearch = async () => {
  if (searchQuery.value.length < 2) return // Previene búsquedas si el texto se borra rápidamente

  loading.value = true
  try {
    // 1. Intentar búsqueda normal
    const searchResultsNormal = await ProductoService.searchProductos(searchQuery.value)

    if (searchResultsNormal.length > 0) {
      searchResults.value = searchResultsNormal
      // Establecer el índice activo en 0 si hay resultados
      activeIndex.value = 0
    } else {
      const params = {
        page: 1,
        per_page: 5,
      }
      const suggestedResults = await ProductoService.getProductos(params)
      searchResults.value = suggestedResults.data || []
      activeIndex.value = searchResults.value.length > 0 ? 0 : -1
    }
  } catch {
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const selectProduct = (product: IProducto) => {
  selectedProduct.value = product
  // Mantener el nombre del producto seleccionado en el input para retroalimentación visual,
  // y limpiar la query para futuras búsquedas.
  searchQuery.value = ''
  isDropdownOpen.value = false
  searchResults.value = []
  emit('selectProduct', product)
}

const closeDropdown = () => {
  isDropdownOpen.value = false
  activeIndex.value = -1
}

const closeDropdownDelayed = () => {
  setTimeout(closeDropdown, 150)
}

const handleEnter = () => {
  if (isDropdownOpen.value && activeIndex.value !== -1 && searchResults.value.length > 0) {
    const productToSelect = searchResults.value[activeIndex.value]
    if (productToSelect) {
      selectProduct(productToSelect)
    }
  }
}

const navigateDown = () => {
  if (isDropdownOpen.value && searchResults.value.length > 0) {
    activeIndex.value = (activeIndex.value + 1) % searchResults.value.length
  }
}

const navigateUp = () => {
  if (isDropdownOpen.value && searchResults.value.length > 0) {
    activeIndex.value =
      (activeIndex.value - 1 + searchResults.value.length) % searchResults.value.length
  }
}

// Exponer funciones necesarias
defineExpose({
  focus: () => searchInputRef.value?.focus(),
  clear: () => {
    searchQuery.value = ''
    selectedProduct.value = null
    searchResults.value = []
  },

  selectedProduct,
})
</script>

<style scoped>
/* (Estilos previamente definidos) */
.product-search-container {
  position: relative;
}
.spinner-overlay {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
}
.search-results-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 1px;
}
.list-group-item-action.active {
  background-color: var(--bs-primary);
  color: white;
}
.list-group-item-action.active span {
  color: white !important;
}
</style>
