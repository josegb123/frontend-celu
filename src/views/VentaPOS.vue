<template>
  <div class="pos-view d-flex flex-column h-100 p-3">
    <header
      class="d-flex justify-content-between align-items-center mb-3 pb-1 border-bottom border-primary"
    >
      <h1 class="h4 mb-0 text-primary fw-bold">Punto de Venta (POS)</h1>
      <div class="info-cliente badge pos-bg-accent text-light text-wrap fs-7 p-2 shadow-sm">
        Cliente: **{{ clienteSeleccionado.nombre }}**
      </div>
    </header>

    <div class="pos-content d-flex flex-grow-1 gap-3">
      <section class="seccion-productos card shadow-sm p-3 w-60 d-flex flex-column">
        <h2 class="h6 card-title mb-3 border-bottom pb-1">Búsqueda Rápida de Productos</h2>

        <div class="area-busqueda-productos mb-3">
          <BuscadorProducto
            @product-selected="handleProductSelected"
            @search-updated="handleSearchUpdated"
          />
        </div>

        <div class="product-grid-wrapper flex-wrap overflow-auto pe-2">
          <ProductGridPOS
            :search-query="searchQueryGrid"
            @product-selected="handleProductSelected"
          />
        </div>
      </section>

      <aside class="seccion-venta d-flex flex-column card shadow-lg p-3 w-40">
        <h2 class="h6 card-title mb-3 text-primary">Detalle de la Venta</h2>

        <div class="carrito-listado-items flex-grow-1 overflow-auto border rounded-3 bg-white mb-3">
          <table class="table table-sm mb-0 table-hover">
            <thead class="sticky-top pos-bg-light-accent">
              <tr>
                <th class="text-light"></th>
                <th class="text-light fs-7">Producto</th>
                <th class="text-light text-center fs-7" style="width: 70px">Cant.</th>
                <th class="text-light text-end fs-7">Precio</th>
                <th class="text-light text-end fs-7">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in itemsVenta" :key="item.id">
                <td class="align-middle text-center" style="width: 30px">
                  <button
                    @click="removeItemFromCart(item.id)"
                    class="btn btn-xs btn-outline-danger p-0"
                    style="width: 20px; height: 20px"
                  >
                    <i class="bi bi-trash-fill smaller-icon"></i>
                  </button>
                </td>
                <td class="align-middle fs-7">{{ item.nombre }}</td>
                <td class="align-middle text-center">
                  <input
                    type="number"
                    v-model.number="item.cantidad"
                    min="1"
                    class="form-control form-control-xs text-center border-secondary"
                    style="width: 55px; display: inline-block; height: 25px"
                  />
                </td>
                <td class="align-middle text-end fs-7 fw-light">
                  ${{ item.precio_venta.toFixed(2) }}
                </td>
                <td class="align-middle text-end fs-7 fw-bold">${{ item.subtotal.toFixed(2) }}</td>
              </tr>
              <tr v-if="itemsVenta.length === 0">
                <td colspan="5" class="text-center text-muted py-3 small">
                  Aún no hay productos en la venta.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="resumen-totales mt-auto pt-2 border-top border-secondary">
          <div class="d-flex justify-content-between mb-2 small">
            <span class="fw-medium">Subtotal:</span>
            <span class="fw-medium">${{ subtotalGeneral.toFixed(2) }}</span>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-2 small">
            <label for="input-descuento" class="fw-medium text-danger">Descuento (-):</label>
            <input
              id="input-descuento"
              type="number"
              v-model.number="descuento"
              min="0"
              :max="subtotalGeneral"
              class="form-control form-control-xs text-end border-secondary"
              style="width: 80px; height: 25px"
            />
          </div>

          <div class="d-flex justify-content-between mb-3 pb-2 border-bottom small">
            <span class="fw-medium">Impuesto ({{ IMPUESTO_RATE * 100 }}%):</span>
            <span class="fw-medium">+${{ impuesto.toFixed(2) }}</span>
          </div>

          <div class="d-flex justify-content-between total-final">
            <span class="fs-5 fw-bold text-dark">TOTAL A PAGAR:</span>
            <span class="fs-5 fw-bold pos-text-total">${{ totalVenta.toFixed(2) }}</span>
          </div>
        </div>

        <div class="acciones-venta d-grid gap-2 mt-3">
          <button class="btn btn-danger shadow-sm" @click="handleCancelarVenta">
            <i class="bi bi-x-lg"></i> Cancelar Venta
          </button>
          <button class="btn pos-btn-accent shadow-lg" @click="handleProcesarPago">
            <i class="bi bi-wallet2"></i> Procesar Pago
          </button>
        </div>
      </aside>
    </div>

    <div
      v-if="showClienteModal"
      class="modal d-block fade show"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.6); overflow-y: auto"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header pos-bg-accent text-light">
            <h5 class="modal-title">Seleccionar Cliente y Pago</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showClienteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <BuscadorCliente
              :current-cliente="clienteSeleccionado"
              @cliente-selected="handleClienteSelected"
              @close="showClienteModal = false"
            />

            <hr class="my-4" />

            <PaymentForm
              :subtotal-bruto="subtotalGeneral"
              :descuento="descuento"
              :impuesto="impuesto"
              :total-pagar="totalVenta"
              :items="itemsVenta"
              :cliente="clienteSeleccionado"
              :cliente-generico="clienteGenerico"
              @venta-registrada="handleVentaRegistrada"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="ventaMensaje"
      class="alert alert-success fixed-bottom p-3 text-center mb-0"
      style="z-index: 1100"
      @click="ventaMensaje = null"
    >
      **¡Venta Exitosa!** {{ ventaMensaje }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Componentes
import BuscadorProducto from '../components/VentaPOS/BuscadorProducto.vue'
import BuscadorCliente from '@/components/VentaPOS/BuscadorCliente.vue'
import PaymentForm from '@/components/VentaPOS/PaymentForm.vue'
import ProductGridPOS from '../components/VentaPOS/ProductGridPOS.vue'

// Interfaces
import type { Cliente, ItemVenta, ProductoVentaBase } from '@/interfaces/IPostInterfaces'

// --- 1. Estado de Cliente ---

/** Cliente genérico/por defecto. */
const clienteGenerico: Cliente = {
  id: 0,
  nombre: 'Consumidor Final',
  ruc_ci: null,
}
const clienteSeleccionado = ref<Cliente>(clienteGenerico)

// --- 2. Estado del Carrito ---

/** Lista reactiva de productos en la venta. */
const itemsVenta = ref<ItemVenta[]>([])
const searchQueryGrid = ref('')
/** Descuento global editable. */
const descuento = ref(0.0)
const IMPUESTO_RATE = 0.1 // 10% IVA

// --- 3. Lógica del Carrito y Modificadores ---

/**
 * Calcula el subtotal de un ítem basado en cantidad y precio.
 */
const calculateItemSubtotal = (item: ItemVenta): number => {
  return item.cantidad * item.precio_venta
}

// Observador para recalcular subtotales cuando cambia la cantidad de cualquier ítem
watch(
  itemsVenta,
  (newItems) => {
    newItems.forEach((item) => {
      item.subtotal = calculateItemSubtotal(item)
    })
  },
  { deep: true },
)

/**
 * Agrega o incrementa la cantidad de un producto al carrito.
 */
const addProductToCart = (producto: ProductoVentaBase) => {
  const precioNumerico = parseFloat(producto.precio_venta.toString())
  if (isNaN(precioNumerico)) {
    console.error('El precio del producto es inválido:', producto.precio_venta)
    return
  }

  const existingItem = itemsVenta.value.find((item) => item.id === producto.id)

  if (existingItem) {
    existingItem.cantidad += 1
  } else {
    itemsVenta.value.push({
      id: producto.id,
      nombre: producto.nombre,
      precio_venta: precioNumerico,
      stock_actual: producto.stock_actual,
      cantidad: 1,
      subtotal: precioNumerico, // 1 * precio
    })
  }
}

/**
 * Elimina un ítem del carrito por su ID.
 */
const removeItemFromCart = (itemId: number) => {
  const index = itemsVenta.value.findIndex((item) => item.id === itemId)
  if (index !== -1) {
    itemsVenta.value.splice(index, 1)
  }
}

// --- 4. Cálculos de Venta (Propiedades computadas) ---

const subtotalGeneral = computed(() => {
  return itemsVenta.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const impuesto = computed(() => {
  const baseImponible = subtotalGeneral.value - descuento.value
  return baseImponible > 0 ? baseImponible * IMPUESTO_RATE : 0
})

const totalVenta = computed(() => {
  return subtotalGeneral.value - descuento.value + impuesto.value
})

// --- 5. Lógica de Interfaz y Handlers ---

const showClienteModal = ref(false)
const ventaMensaje = ref<string | null>(null) // Para mostrar notificación de éxito

/**
 * Abre el modal de pago y cliente, previa validación.
 */
function handleProcesarPago() {
  if (itemsVenta.value.length === 0) {
    alert('Debe agregar productos al carrito antes de procesar el pago.')
    return
  }
  showClienteModal.value = true
}

/**
 * Handler: Actualiza el cliente seleccionado desde el modal de búsqueda.
 */
const handleClienteSelected = (cliente: Cliente) => {
  clienteSeleccionado.value = cliente
}

/**
 * Handler: Actualiza el query que se usa para filtrar el grid.
 */
const handleSearchUpdated = (query: string) => {
  searchQueryGrid.value = query
}

/**
 * Maneja el click para agregar producto, ya sea desde el Buscador o el Grid.
 */
const handleProductSelected = (producto: ProductoVentaBase) => {
  addProductToCart(producto)
}
/**
 * Handler: Se llama cuando PaymentForm registra la venta con éxito.
 * Resetea el estado y muestra un mensaje.
 */
const handleVentaRegistrada = (mensaje: string) => {
  // 1. Resetear el estado de la vista
  itemsVenta.value = []
  clienteSeleccionado.value = clienteGenerico
  descuento.value = 0.0

  // 2. Cerrar el modal y mostrar notificación
  showClienteModal.value = false
  ventaMensaje.value = mensaje

  setTimeout(() => {
    ventaMensaje.value = null
  }, 5000)
}

/**
 * Handler: Resetea el carrito y el cliente.
 */
function handleCancelarVenta() {
  if (confirm('¿Está seguro de que desea cancelar la venta y limpiar el carrito?')) {
    itemsVenta.value = []
    clienteSeleccionado.value = clienteGenerico
    descuento.value = 0.0
  }
}
</script>

<style scoped>
/* Colores de acento modernos (Violeta/Celeste) */
.pos-bg-accent {
  background-color: #6a0dad;
}
.pos-btn-accent {
  background-color: #7d48c8;
  color: white;
}
.pos-btn-accent:hover {
  background-color: #6a0dad;
  color: white;
}
.pos-bg-light-accent {
  background-color: #8c68c6;
}
.pos-text-total {
  color: #0d6efd;
}

/* 1. Ajuste de Densidad de la Interfaz */
/* Tamaño de fuente más pequeño para detalles */
.fs-7 {
  font-size: 0.85rem; /* Intermedio entre small y el tamaño por defecto */
}
.smaller-icon {
  font-size: 0.8rem;
}

/* Input más pequeño */
.form-control-xs {
  height: calc(1.5em + 0.3rem + 2px); /* Un poco más pequeño que form-control-sm */
  padding: 0.1rem 0.25rem;
  font-size: 0.75rem;
}

/* Botón más pequeño */
.btn-xs {
  padding: 0.1rem 0.2rem;
  font-size: 0.75rem;
}

/* 2. Ajuste de Ancho Mínimo de Columnas */
.w-60 {
  flex: 3;
}
.w-40 {
  flex: 2;
  /* Reducimos el ancho mínimo para ganar espacio horizontal en 720p */
  min-width: 350px;
}

/* Asegura que la cabecera de la tabla permanezca visible */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
