<template>
  <div class="product-search-container">

    <input type="text" class="form-control"
      :placeholder="selectedProduct ? selectedProduct.nombre : 'Buscar Producto por Nombre'" :value="searchQuery"
      @input="updateQuery(($event.target as HTMLInputElement).value)" @focus="isDropdownOpen = true"
      @blur="closeDropdownDelayed" />

    <div v-if="isDropdownOpen && searchResults.length" class="search-results-dropdown">
      <ul class="list-group">
        <li v-for="product in searchResults" :key="product.id" class="list-group-item list-group-item-action"
          @mousedown.prevent="selectProduct(product)" title="Click para seleccionar">
          {{ product.nombre }}
          <span class="text-muted small float-end">
            Stock: **{{ product.stock_actual }}**
          </span>
        </li>
      </ul>
    </div>

    <small v-if="selectedProduct" class="text-success mt-1 d-block">
      ID: {{ selectedProduct.id }} | Precio: ${{ selectedProduct.precio_venta }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ProductoService, { type Producto } from '@/services/ProductoService';

const props = defineProps<{
  modelValue: number; // El ID del producto seleccionado
  initialProduct?: Producto | null; // Producto ya seleccionado
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', id: number): void;
  (e: 'selectProduct', product: Producto): void; // Emitir el objeto completo
}>();

const searchQuery = ref('');
const searchResults = ref<Producto[]>([]);
const isDropdownOpen = ref(false);
const selectedProduct = ref<Producto | null>(props.initialProduct || null);

// ----------------- Lógica de Debounce -----------------
const DEBOUNCE_DELAY = 300;
let debounceTimer: number | undefined;

const updateQuery = (value: string) => {
  searchQuery.value = value;
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(performSearch, DEBOUNCE_DELAY);
  isDropdownOpen.value = true;
};

const performSearch = async () => {
  // Si la caja de búsqueda está vacía o se seleccionó un producto, no buscar
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  searchResults.value = await ProductoService.searchProductos(searchQuery.value);
};

const selectProduct = (product: Producto) => {
  selectedProduct.value = product;
  searchQuery.value = product.nombre; // Mostrar el nombre en el input
  isDropdownOpen.value = false;
  searchResults.value = []; // Limpiar resultados

  emit('update:modelValue', product.id);
  emit('selectProduct', product);
};

const closeDropdownDelayed = () => {
  // Retraso de 150ms para permitir que el evento @mousedown (seleccionar) se ejecute antes del @blur
  setTimeout(() => {
    isDropdownOpen.value = false;
    // Restaurar el nombre del producto seleccionado si el usuario no escribió nada
    if (selectedProduct.value && !searchQuery.value) {
      searchQuery.value = selectedProduct.value.nombre;
    }
  }, 150);
};

// Sincroniza el producto si el ID cambia externamente
watch(() => props.modelValue, async (newId) => {
  if (newId && (!selectedProduct.value || selectedProduct.value.id !== newId)) {
    selectedProduct.value = await ProductoService.getProductoById(newId);
  }
}, { immediate: true });
</script>

<style scoped>
/* Estilos mínimos para que el dropdown funcione como tal */
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
  /* Para que parezca un solo bloque con el input */
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
</style>