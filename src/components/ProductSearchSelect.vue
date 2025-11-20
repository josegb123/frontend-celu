<template>
  <div class="product-search-select-container">

    <input type="text" class="form-control"
      :placeholder="selectedProduct ? selectedProduct.nombre : 'Buscar producto por nombre o ID...'"
      :value="searchQuery" @input="handleInput(($event.target as HTMLInputElement).value)"
      @focus="isDropdownOpen = true" @blur="closeDropdownDelayed" />

    <div v-if="isDropdownOpen && searchResults.length" class="search-results-dropdown">
      <ul class="list-group">
        <li v-for="product in searchResults" :key="product.id" class="list-group-item list-group-item-action"
          @mousedown.prevent="selectProduct(product)">
          {{ product.nombre }} (ID: {{ product.id }})
          <span class="text-info small float-end">Stock: {{ product.stock_actual }}</span>
        </li>
      </ul>
    </div>

    <small v-if="selectedProduct" class="text-success mt-1 d-block">
      Precio: ${{ selectedProduct.precio_venta }} | Stock disponible: {{ selectedProduct.stock_actual }}
    </small>
    <small v-else-if="searchQuery && !isDropdownOpen" class="text-warning mt-1 d-block">
      Producto no seleccionado o no encontrado.
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ProductoService, { type Producto } from '@/services/ProductoService';
import { useInventoryStore } from '@/store/InventoryStore';

// Tipado: Asumimos que Producto ya está importado correctamente
const props = defineProps<{
  modelValue: number; // El ID del producto seleccionado (v-model)
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', id: number): void;
  (e: 'selectProduct', product: Producto): void; // Emite el objeto completo
}>();

const inventoryStore = useInventoryStore();

const searchQuery = ref('');
const searchResults = ref<Producto[]>([]);
const isDropdownOpen = ref(false);
const selectedProduct = ref<Producto | null>(null);

// --- Lógica de Debounce ---
const DEBOUNCE_DELAY = 300;
let debounceTimer: number | undefined;

const handleInput = (value: string) => {
  searchQuery.value = value;
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(performSearch, DEBOUNCE_DELAY);
  isDropdownOpen.value = true;
};

const reloadSelectedProduct = async (id: number) => {
  const product = await ProductoService.getProductoById(id);
  if (product) {
    selectedProduct.value = product;
    // No es necesario actualizar searchQuery o emitir selectProduct aquí
  }
};

watch(() => inventoryStore.saleUpdateCounter, (newValue, oldValue) => {
  // Solo si hay un producto actualmente seleccionado y el contador ha cambiado
  if (selectedProduct.value && newValue > oldValue) {
    console.log(`Recargando stock de ID ${selectedProduct.value.id}...`);
    reloadSelectedProduct(selectedProduct.value.id);
  }
});

const performSearch = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }

  // ⬅️ CORRECCIÓN: Usar try...catch en el componente para asegurar el array vacío.
  try {
    const results = await ProductoService.searchProductos(searchQuery.value);
    searchResults.value = results; // Asignar el array de resultados
  } catch (e) {
    console.error("Error buscando productos en el componente:", e);
    searchResults.value = []; // Asegurar array vacío en caso de fallo
  }
};

const selectProduct = (product: Producto) => {
  selectedProduct.value = product;
  searchQuery.value = product.nombre;
  isDropdownOpen.value = false;
  searchResults.value = [];

  // 1. Emitir el ID para actualizar el payload de la venta (v-model)
  emit('update:modelValue', product.id);

  // 2. Emitir el objeto Producto completo para que el padre lo use (stock, precio)
  emit('selectProduct', product);
};

const closeDropdownDelayed = () => {
  setTimeout(() => {
    isDropdownOpen.value = false;
    // Restaurar el nombre del producto si no se seleccionó nada, pero ya había uno
    if (selectedProduct.value && searchQuery.value !== selectedProduct.value.nombre) {
      searchQuery.value = selectedProduct.value.nombre;
    }
  }, 150);
};

// Si el padre inicializa el modelValue (ej. para edición), cargamos el producto
watch(() => props.modelValue, async (newId) => {
  if (newId && (!selectedProduct.value || selectedProduct.value.id !== newId)) {
    const product = await ProductoService.getProductoById(newId);
    if (product) {
      selectedProduct.value = product;
      searchQuery.value = product.nombre;
      emit('selectProduct', product); // Avisar al padre que el producto se cargó
    }
  }
}, { immediate: true });
</script>

<style scoped>
/* Asegura que el dropdown se muestre correctamente sobre otros elementos */
.product-search-select-container {
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