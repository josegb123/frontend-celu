<template>
  <div class="card product-card h-100 shadow-lg border-0">
    <div class="image-container position-relative">
      <div v-if="isLowOrOut" :class="['stock-indicator', indicatorClass]">
        {{ indicatorText }}
      </div>

      <img
        :src="imageUrl"
        class="card-img-top"
        :alt="product.nombre"
        loading="lazy"
        @error="handleImageError"
        :class="{ 'image-low-stock': props.stockStatus === 'bajo' }"
      />

      <span class="category-badge badge text-bg-dark">
        {{ product.categoria?.nombre || 'Sin Categoría' }}
      </span>
    </div>

    <div class="card-body d-flex flex-column p-3">
      <h5 class="card-title mb-0 text-truncate text-body" :title="product.nombre">
        {{ product.nombre }}
      </h5>
      <p class="card-subtitle text-body-secondary small mb-3">
        Código: {{ product.codigo_barra || 'N/A' }}
      </p>

      <div class="d-flex justify-content-start gap-3 mb-3">
        <div class="price-box price-venta">
          <div class="price-label">Venta</div>
          <div class="price-value">
            ${{ parseFloat(product.precio_venta.toString()).toFixed(0) }}
          </div>
        </div>
        <div class="price-box price-compra">
          <div class="price-label">Compra</div>
          <div class="price-value">
            ${{ parseFloat(product.precio_compra.toString()).toFixed(0) }}
          </div>
        </div>
      </div>

      <button
        class="btn btn-sm btn-info text-white mb-3"
        @click="$emit('showSuppliers', product.proveedores, product.nombre)"
        :disabled="product.proveedores?.length === 0"
      >
        <i class="bi bi-truck-flatbed"></i> {{ product.proveedores?.length || 0 }} Proveedor(es)
      </button>
      <div class="stock-info row g-1 text-center mt-auto mb-3">
        <div class="col-4">
          <div class="stock-item p-2 border" :class="stockBadgeClass">
            <small class="text-body-secondary">Stock</small>
            <div class="fw-bold">{{ product.stock_actual }}</div>
          </div>
        </div>

        <div class="col-4">
          <div class="stock-item p-2 bg-warning-subtle border border-warning">
            <small class="text-body-secondary text-truncate overflow-hidden">Reservado</small>
            <div class="fw-bold text-warning">{{ product.stock_reservado }}</div>
          </div>
        </div>

        <div class="col-4">
          <div class="stock-item p-2 bg-danger-subtle border border-danger">
            <small class="text-body-secondary text-truncate overflow-hidden">Mínimo</small>
            <div class="fw-bold text-danger">{{ product.stock_minimo }}</div>
          </div>
        </div>
      </div>

      <div class="card-actions d-flex justify-content-between gap-2 mt-auto">
        <button
          class="btn btn-sm btn-outline-primary w-50"
          @click="$emit('edit', product)"
          v-if="isAdmin"
        >
          <i class="bi bi-pencil-square"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger w-50" @click="requestDelete" v-if="isAdmin">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IProducto } from '@/interfaces/IProductoInterfaces'
import type { Proveedor } from '@/interfaces/IProveedores'
import { useAuthStore } from '@/store/authStore'
const authStore = useAuthStore() // Added
const isAdmin = computed(() => {
  // Added
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

// --- SETUP REACTIVO ---
const isImageError = ref(false)

// --- PROPIEDADES Y EMITS ---
const props = defineProps<{
  product: IProducto
  stockStatus: 'agotado' | 'bajo' | 'normal'
}>()

const emit = defineEmits<{
  (e: 'edit', product: IProducto): void
  (e: 'delete', productId: number): void
  (e: 'showSuppliers', proveedores: Proveedor[], productName: string): void
}>()

// --- CÁLCULOS REACTIVOS ---
const isLowOrOut = computed(() => props.stockStatus !== 'normal')
const indicatorText = computed(() => {
  if (props.stockStatus === 'agotado') return 'AGOTADO'
  if (props.stockStatus === 'bajo') return `BAJO STOCK (${props.product.stock_actual})`
  return ''
})
const indicatorClass = computed(() => {
  if (props.stockStatus === 'agotado') return 'stock-agotado'
  if (props.stockStatus === 'bajo') return 'stock-bajo'
  return ''
})
const stockBadgeClass = computed(() => {
  return props.product.stock_actual <= props.product.stock_minimo
    ? 'bg-danger-subtle border-danger text-danger'
    : 'bg-info-subtle border-info text-info'
})
const imageUrl = computed(() => {
  if (!props.product.imagen_url || isImageError.value) {
    return '/no_image.webp'
  }
  return props.product.imagen_url
})

// --- MÉTODOS ---

const requestDelete = () => {
  emit('delete', props.product.id)
}

const handleImageError = () => {
  isImageError.value = true
}
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05) !important;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-card-bg);
}
.image-container {
  position: relative;
  overflow: hidden;
  height: 200px;
}
.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.4em 0.7em;
  font-size: 0.75rem;
  z-index: 10;
  opacity: 0.95;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
}
.price-box {
  flex: 1;
  padding: 0.5rem 0;
  border-radius: 0.35rem;
  text-align: center;
  border: 1px solid var(--bs-border-color-translucent);
}
.price-venta {
  background-color: var(--bs-success);
  color: white;
  border-color: var(--bs-success);
}
.price-compra {
  background-color: var(--bs-secondary);
  color: white;
  border-color: var(--bs-secondary);
}
.price-label {
  font-size: 0.7rem;
  opacity: 0.85;
}
.price-value {
  font-size: 1rem;
  font-weight: bold;
}
.stock-info {
  border-top: 1px solid var(--bs-border-color-translucent);
  padding-top: 0.5rem;
}
.stock-item {
  border-radius: 0.25rem;
}
.image-container {
  position: relative;
  overflow: hidden;
}
.image-low-stock {
  opacity: 0.3;
  transition: opacity 0.3s ease-in-out;
}
.stock-indicator {
  position: absolute;
  top: 0;
  right: 100;
  z-index: 10;
  padding: 15px 10px;
  font-weight: bold;
  font-size: 0.8rem;
  line-height: 1;
  border-radius: 0 0 8px 0;
  pointer-events: none;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}
.stock-agotado {
  background-color: #c90a1a;
  color: white;
}
.stock-bajo {
  background-color: #ffc107;
  color: #212529;
}
</style>
