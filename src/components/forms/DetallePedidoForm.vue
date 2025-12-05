<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import ProductoService from '@/services/ProductoService';
import type { Producto } from '@/services/ProductoService'; // Assuming Producto interface is exported
import type { IDetallePedidoProveedorRequest } from '@/interfaces/IDetallePedidoProveedor';

const props = defineProps<{
  initialDetalle?: IDetallePedidoProveedorRequest;
  index: number;
}>();

const emit = defineEmits(['update:detalle', 'remove:detalle']);

const selectedProductId = ref<number | null>(props.initialDetalle?.producto_id || null);
const cantidad = ref<number>(props.initialDetalle?.cantidad || 1);
const precioCompra = ref<number>(props.initialDetalle?.precio_compra || 0);

const products = ref<Producto[]>([]);
const searchTerm = ref<string>('');
const searching = ref<boolean>(false);
const showSearchResults = ref<boolean>(false);

onMounted(async () => {
  // Optionally load some initial products or rely purely on search
  // For now, let's keep it search-driven or consider fetching a small initial list
});

watch(searchTerm, async (newVal) => {
  if (newVal.length >= 3) {
    searching.value = true;
    showSearchResults.value = true;
    try {
      // Assuming searchProductos returns a direct array of Producto
      products.value = await ProductoService.searchProductos(newVal);
    } catch (error) {
      console.error('Error searching products:', error);
      products.value = [];
    } finally {
      searching.value = false;
    }
  } else {
    products.value = [];
    showSearchResults.value = false;
  }
});

watch([selectedProductId, cantidad, precioCompra], () => {
  if (selectedProductId.value && cantidad.value > 0 && precioCompra.value >= 0) {
    emit('update:detalle', props.index, {
      producto_id: selectedProductId.value,
      cantidad: cantidad.value,
      precio_compra: precioCompra.value,
    } as IDetallePedidoProveedorRequest);
  } else {
    // Optionally emit a null or invalid state if validation fails
    emit('update:detalle', props.index, null);
  }
}, { immediate: true });

const selectProduct = (product: Producto) => {
  selectedProductId.value = product.id;
  searchTerm.value = product.nombre; // Display selected product name
  precioCompra.value = parseFloat(product.precio_compra.toString()); // Assuming precio_compra is the relevant price for receiving orders
  showSearchResults.value = false;
};

const selectedProductName = computed(() => {
  const product = products.value.find(p => p.id === selectedProductId.value);
  return product ? product.nombre : searchTerm.value;
});

const removeDetalle = () => {
  emit('remove:detalle', props.index);
};
</script>

<template>
  <div class="detalle-pedido-form border p-3 mb-3 rounded shadow-sm bg-light">
    <div class="row g-3 align-items-center">
      <!-- Product Search/Selection -->
      <div class="col-md-5 position-relative">
        <label :for="`product-search-${index}`" class="form-label visually-hidden">Producto</label>
        <input
          :id="`product-search-${index}`"
          type="text"
          class="form-control"
          placeholder="Buscar producto..."
          v-model="searchTerm"
          @focus="showSearchResults = true"
          @blur="() => { /* Keep results visible until selection or click outside */ }"
        />
        <input
          v-if="selectedProductId"
          type="hidden"
          :value="selectedProductId"
        />
        <div v-if="showSearchResults && searchTerm.length >= 3" class="search-results-dropdown card position-absolute w-100 z-1000 mt-1">
          <ul class="list-group list-group-flush">
            <li v-if="searching" class="list-group-item text-center">Cargando...</li>
            <li v-else-if="products.length === 0" class="list-group-item text-center text-muted">
              No se encontraron productos.
            </li>
            <li
              v-for="product in products"
              :key="product.id"
              class="list-group-item list-group-item-action"
              @mousedown.prevent="selectProduct(product)"
            >
              {{ product.nombre }} (Stock: {{ product.stock_actual }})
            </li>
          </ul>
        </div>
        <p v-else-if="selectedProductId" class="mt-2 mb-0">
          <strong>Producto seleccionado:</strong> {{ selectedProductName }}
        </p>
      </div>

      <!-- Cantidad -->
      <div class="col-md-3">
        <label :for="`cantidad-${index}`" class="form-label visually-hidden">Cantidad</label>
        <input
          :id="`cantidad-${index}`"
          type="number"
          class="form-control"
          placeholder="Cantidad"
          v-model.number="cantidad"
          min="1"
        />
      </div>

      <!-- Precio Unitario -->
      <div class="col-md-3">
        <label :for="`precio-compra-${index}`" class="form-label visually-hidden">Precio Compra</label>
        <input
          :id="`precio-compra-${index}`"
          type="number"
          class="form-control"
          placeholder="Precio Compra"
          v-model.number="precioCompra"
          min="0"
          step="0.01"
        />
      </div>

      <!-- Remove Button -->
      <div class="col-md-1 d-flex justify-content-end">
        <button type="button" class="btn btn-danger btn-sm" @click="removeDetalle">X</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results-dropdown {
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #fff;
  z-index: 1000; /* Ensure it's above other elements */
}
.list-group-item-action:hover {
  cursor: pointer;
  background-color: #f8f9fa;
}
</style>
