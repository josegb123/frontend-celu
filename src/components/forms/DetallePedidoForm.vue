<template>
  <div class="row g-3 align-items-center border p-2 mb-2 rounded shadow-sm">
    <div class="col-md-5">
      <label :for="`product-search-${index}`" class="form-label d-block small mb-1 fw-medium"
        >Producto (*)</label
      >
      <ProductSearchInput
        :id="`product-search-${index}`"
        v-model="detalleLocal.producto_id"
        :initial-product="null"
        @selectProduct="handleProductSelect"
        ref="searchRef"
      />
      <small v-if="detalleLocal.producto_id" class="text-success mt-1 d-block">
        Seleccionado: **{{ detalleLocal.nombre_producto_temporal }}**
      </small>
    </div>

    <div class="col-md-2">
      <label :for="`cantidad-${index}`" class="form-label d-block small mb-1 fw-medium"
        >Cant. (*)</label
      >
      <input
        :id="`cantidad-${index}`"
        type="number"
        class="form-control form-control-sm"
        placeholder="Cant."
        v-model.number="detalleLocal.cantidad"
        min="1"
        required
        ref="cantidadInputRef"
        @keydown.enter.prevent="focusPrecio"
      />
    </div>

    <div class="col-md-3">
      <label :for="`precio-compra-${index}`" class="form-label d-block small mb-1 fw-medium"
        >Precio Compra (*)</label
      >
      <input
        :id="`precio-compra-${index}`"
        type="number"
        class="form-control form-control-sm"
        placeholder="Precio Compra"
        v-model.number="detalleLocal.precio_compra"
        min="0"
        step="0.01"
        required
        ref="precioInputRef"
        @keydown.enter.prevent="focusNextDetail"
      />
    </div>

    <div class="col-md-2 d-flex justify-content-end align-items-end">
      <button type="button" class="btn btn-sm btn-danger" @click="removeDetalle">
        <i class="bi bi-x-lg"></i> Eliminar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ProductSearchInput from '../products/ProductSearchInput.vue'
import type { IProducto } from '@/interfaces/IProductoInterfaces'
import type { IDetallePedidoProveedorRequest } from '@/interfaces/IDetallePedidoProveedor'
import { useFocusStore } from '@/store/useFocusStore' // 🎯 Asumiendo un Store para el manejo del foco global (o solo emitimos)

interface DetalleLocal extends IDetallePedidoProveedorRequest {
  nombre_producto_temporal?: string
}

const props = defineProps<{
  initialDetalle: DetalleLocal
  index: number
}>()

const emit = defineEmits<{
  (e: 'update:detalle', index: number, detalle: DetalleLocal | null): void
  (e: 'remove:detalle', index: number): void
  (e: 'focus:next', index: number): void // Emitir para mover el foco a la siguiente fila
}>()

// Referencias para el manejo del foco
const searchRef = ref<InstanceType<typeof ProductSearchInput> | null>(null)
const cantidadInputRef = ref<HTMLInputElement | null>(null)
const precioInputRef = ref<HTMLInputElement | null>(null)
// const focusStore = useFocusStore(); // Si usas Pinia/Vuex para gestionar el foco entre componentes hermanos

const detalleLocal = ref<DetalleLocal>({
  ...props.initialDetalle,
  nombre_producto_temporal: props.initialDetalle.nombre_producto_temporal || 'Buscar Producto...',
})

// ----------------------------------------------------
// LÓGICA DE FOCO Y TECLADO
// ----------------------------------------------------

const handleProductSelect = (product: IProducto) => {
  detalleLocal.value.producto_id = product.id
  detalleLocal.value.nombre_producto_temporal = product.nombre
  detalleLocal.value.precio_compra = product.precio_compra || 0

  emitUpdate() // Emitimos inmediatamente

  // 🎯 Mover el foco al input de Cantidad después de la selección
  nextTick(() => {
    cantidadInputRef.value?.focus()
  })
}

const focusPrecio = () => {
  precioInputRef.value?.focus()
}

const focusNextDetail = () => {
  // 🎯 Mover el foco a la siguiente fila de búsqueda o crear una nueva
  emit('focus:next', props.index)
}

// ----------------------------------------------------
// LÓGICA DE EMISIÓN Y ELIMINACIÓN
// ----------------------------------------------------

const emitUpdate = () => {
  const isReady =
    detalleLocal.value.producto_id &&
    detalleLocal.value.cantidad > 0 &&
    detalleLocal.value.precio_compra >= 0

  if (isReady) {
    emit('update:detalle', props.index, detalleLocal.value)
  } else {
    emit('update:detalle', props.index, null)
  }
}

watch(
  detalleLocal,
  () => {
    emitUpdate()
  },
  { deep: true },
)

const removeDetalle = () => {
  emit('remove:detalle', props.index)
}

// 🎯 Exponer la función de foco para que el padre pueda llamarla
defineExpose({
  focusSearch: () => searchRef.value?.focus(),
  focusCantidad: () => cantidadInputRef.value?.focus(),
  index: props.index, // Exponer el índice es útil para el padre
})
</script>

<style scoped>
.form-control-sm {
  padding: 0.25rem 0.5rem;
  height: calc(1.5em + 0.5rem + 2px);
}
.form-label.small {
  font-size: 0.85rem;
}
</style>
