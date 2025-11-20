<template>

  <hr>

  <div class="row">

    <div class="col-md-4 ">
      <h5>Nombre producto:</h5>
      <ProductSearchSelect v-model="localItem.producto_id" @selectProduct="handleProductSelection" />
    </div>

    <div class="col-md-6 ">
      <h5>Cantidad:</h5>

      <div class="d-flex flex-row mb-3 ">
        <input type="number" class="form-control me-2" placeholder="Cantidad" :value="localItem.cantidad"
          @input="updateItem('cantidad', ($event.target as HTMLInputElement).value)" :disabled="!localItem.producto_id"
          required min="1" :max="selectedProduct ? selectedProduct.stock_actual : 9999" style="width: 100px;" />

        <button type="button" class="btn btn-outline-danger" @click="$emit('remove')" title="Eliminar producto">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

  </div>


</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import ProductSearchSelect from './ProductSearchSelect.vue'; // ⬅️ Nuevo componente
import type { VentaItem } from '@/interfaces/IVentaTypes';
import type { Producto } from '@/services/ProductoService';
import ProductoService from '@/services/ProductoService';

interface Props {
  item: VentaItem;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:item', newItem: VentaItem): void;
  (e: 'remove'): void;
}>();

const localItem = reactive<VentaItem>({ ...props.item });
// Quitamos la necesidad del prop productInfo, el ProductSearchSelect lo maneja internamente.
const selectedProduct = ref<Producto | null>(null);

type UpdatableKey = 'producto_id' | 'cantidad';

const updateItem = (key: UpdatableKey, value: string) => {
  const numericValue = parseInt(value);

  if (!isNaN(numericValue) && numericValue >= 0) {
    // Validación de Stock
    if (key === 'cantidad' && selectedProduct.value && numericValue > selectedProduct.value.stock_actual) {
      alert(`Stock insuficiente. Máximo: ${selectedProduct.value.stock_actual}`);
      localItem[key] = selectedProduct.value.stock_actual;
    } else {
      localItem[key] = numericValue;
    }

    emit('update:item', { ...localItem });
  }
};

// ⬅️ Maneja la selección: El componente hijo le pasa el objeto Producto
const handleProductSelection = (product: Producto) => {
  selectedProduct.value = product;
  localItem.producto_id = product.id;

  // Si la cantidad actual es 0 o excede el stock, ajustarla
  if (localItem.cantidad < 1 || localItem.cantidad > product.stock_actual) {
    localItem.cantidad = 1;
  }

  // Emitir la actualización para que el padre (VentaForm) actualice su array items
  emit('update:item', { ...localItem });
};

// Sincronización de localItem con props.item
watch(() => props.item, (newItem) => {
  localItem.producto_id = newItem.producto_id;
  localItem.cantidad = newItem.cantidad;
}, { deep: true });

// ⬅️ Importante: Usamos watch para cargar el producto inicial si el ID existe.
watch(() => localItem.producto_id, async (newId) => {
  if (newId && (!selectedProduct.value || selectedProduct.value.id !== newId)) {
    selectedProduct.value = await ProductoService.getProductoById(newId);
  }
}, { immediate: true });
</script>