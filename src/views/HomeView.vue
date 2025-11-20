<template>
  <div class="container mt-5">
    <h2>🔎 Test de Búsqueda y Selección de Productos</h2>
    <div class="card p-4 shadow-sm">

      <div class="mb-3 product-search-container">
        <label for="searchInput" class="form-label">Buscar Producto (Mínimo 3 caracteres)</label>
        <input type="text" id="searchInput" class="form-control" placeholder="Escribe el nombre del producto..."
          v-model="searchQuery" @focus="isDropdownOpen = true" @blur="closeDropdownDelayed" />

        <div v-if="isDropdownOpen && searchResults.length" class="search-results-dropdown">
          <ul class="list-group">
            <li v-for="product in searchResults" :key="product.id" class="list-group-item list-group-item-action"
              @mousedown.prevent="selectProduct(product)">
              {{ product.nombre }} (ID: {{ product.id }})
              <span class="text-info small float-end">Stock: {{ product.stock_actual }}</span>
            </li>
          </ul>
        </div>
      </div>

      ---

      <h4>Propiedades del Producto Seleccionado:</h4>
      <div v-if="selectedProduct" class="alert alert-success">
        <p><strong>ID:</strong> {{ selectedProduct.id }}</p>
        <p><strong>Nombre:</strong> {{ selectedProduct.nombre }}</p>
        <p><strong>Precio Venta:</strong> ${{ selectedProduct.precio_venta }}</p>
        <p><strong>Stock Actual:</strong> {{ selectedProduct.stock_actual }}</p>
      </div>
      <div v-else class="alert alert-info">
        <p>Ningún producto seleccionado aún.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ProductoService, { type Producto } from '@/services/ProductoService';

const searchQuery = ref('');
const searchResults = ref<Producto[]>([]);
const isDropdownOpen = ref(false);
const selectedProduct = ref<Producto | null>(null);

// --- Lógica de Debounce ---
const DEBOUNCE_DELAY = 300;
let debounceTimer: number | undefined;

const performSearch = async (query: string) => {
  if (query.length < 3) {
    searchResults.value = [];
    return;
  }

  // ⬅️ CRÍTICO: Lógica de la API con manejo de errores
  try {
    // Llama al servicio que usa el endpoint /productos?search=query
    const results = await ProductoService.searchProductos(query);
    searchResults.value = results;


  } catch (e) {
    console.error("Fallo al ejecutar la búsqueda:", e);
    searchResults.value = []; // Asegura que searchResults sea un array
  }
};

// ⬅️ Observador reactivo para el debounce
watch(searchQuery, (newQuery) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    performSearch(newQuery);
  }, DEBOUNCE_DELAY);
});

const selectProduct = (product: Producto) => {
  selectedProduct.value = product;
  searchQuery.value = product.nombre; // Muestra el nombre en el input
  isDropdownOpen.value = false;
  searchResults.value = []; // Limpiar resultados
};

const closeDropdownDelayed = () => {
  // Retraso para que el evento @mousedown (seleccionar) se ejecute antes del @blur
  setTimeout(() => {
    isDropdownOpen.value = false;
    // Restaurar el nombre del producto seleccionado si el usuario no escribió nada
    if (selectedProduct.value && searchQuery.value !== selectedProduct.value.nombre) {
      searchQuery.value = selectedProduct.value.nombre;
    }
  }, 150);
};
</script>

<style scoped>
/* Estilos mínimos para el dropdown */
.product-search-container {
  position: relative;
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
  margin-top: -1px;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
</style>
