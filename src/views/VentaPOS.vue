<template>
  <div class="container-fluid p-3">
    <CajaBloqueador>
      <div class="pos-view d-flex flex-column">
        <h2 class="mb-3">🏪 {{ $route.meta.title }}</h2>
        <div class="pos-content d-flex gap-3 flex-column flex-md-row">
          <section class="card shadow-sm p-3 w-60 d-flex flex-column border">
            <h2 class="h6 card-title mb-3 pb-1">Búsqueda Rápida de Productos</h2>

            <div class="area-busqueda-productos mb-3">
              <BuscadorProducto
                @product-selected="handleProductSelected"
                @search-updated="handleSearchUpdated"
              />
            </div>

            <div :key="gridRefreshKey">
              <ProductGridPOS
                :search-query="searchQueryGrid"
                @product-selected="handleProductSelected"
              />
            </div>
          </section>

          <aside class="seccion-venta d-flex flex-column card shadow-sm p-3 w-40 border">
            <h2 class="h6 card-title mb-3">Detalle de la Venta</h2>

            <div
              class="carrito-listado-items flex-grow-1 overflow-auto rounded-3 bg-body-tertiary mb-3"
            >
              <table class="table table-sm mb-0 table-hover">
                <thead>
                  <tr>
                    <th class="fs-7">Producto</th>
                    <th class="text-center fs-7" style="width: 70px">Cant.</th>
                    <th class="text-end fs-7">Precio</th>
                    <th class="text-end fs-7">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in itemsVenta" :key="item.id">
                    <td class="align-middle fs-7">{{ item.nombre }}</td>
                    <td class="align-middle text-center">
                      <div class="d-flex justify-content-center align-items-center">
                        <div class="input-group" style="width: 90px">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            @click="item.cantidad > 1 ? item.cantidad-- : null"
                            :disabled="item.cantidad <= 1"
                          >
                            -
                          </button>

                          <input
                            type="text"
                            v-model.number="item.cantidad"
                            class="form-control form-control-sm text-center border-secondary p-0"
                            style="width: 30px; height: 25px"
                            min="1"
                            :max="item.stock_actual"
                          />

                          <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            @click="item.cantidad < item.stock_actual ? item.cantidad++ : null"
                            :disabled="item.cantidad >= item.stock_actual"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <span
                        v-if="item.cantidad > item.stock_actual"
                        class="text-danger small d-block"
                        >Máx: {{ item.stock_actual }}</span
                      >
                    </td>
                    <td class="align-middle text-end fs-7 fw-light">
                      ${{ item.precio_venta.toFixed(2) }}
                    </td>
                    <td class="align-middle text-end fs-7 fw-bold">
                      ${{ item.subtotal.toFixed(2) }}
                    </td>
                    <td class="align-middle text-center" style="width: 30px">
                      <button
                        @click="removeItemFromCart(item.id)"
                        class="btn btn-xs btn-outline-danger p-0"
                        style="width: 30px; height: 30px"
                      >
                        <i class="bi bi-trash-fill smaller-icon"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="itemsVenta.length === 0">
                    <td colspan="5" class="text-center text-muted py-3 small">
                      Aún no hay productos en la venta.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="resumen-totales mt-auto pt-2">
              <table class="w-100" style="border-collapse: collapse; border: none">
                <tbody>
                  <tr class="small">
                    <td class="fw-medium text-start pb-2">Subtotal:</td>
                    <td class="fw-medium text-end pb-2">${{ subtotalGeneral.toFixed(2) }}</td>
                  </tr>

                  <tr class="small">
                    <td
                      class="fw-medium text-danger text-start pb-2 align-middle"
                      style="width: 50%"
                    >
                      <label for="input-descuento">Descuento (-):</label>
                    </td>
                    <td class="fw-medium text-end pb-2 align-middle" style="width: 50%">
                      <input
                        id="input-descuento"
                        type="number"
                        v-model.number="descuento"
                        min="0"
                        :max="subtotalGeneral"
                        @blur="validateDescuento"
                        class="form-control form-control-xs text-end border-secondary d-inline-block"
                        style="width: 80px; height: 25px"
                      />
                    </td>
                  </tr>

                  <tr class="total-final border-top border-secondary">
                    <td class="fs-5 fw-bold text-start pt-2">TOTAL A PAGAR:</td>
                    <td class="fs-5 fw-bold text-end text-primary pt-2">
                      ${{ totalVenta.toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="acciones-venta d-grid gap-2 mt-3">
              <button class="btn btn-danger shadow-sm" @click="handleConfirmCancelacion">
                <i class="bi bi-x-lg"></i> Cancelar Venta
              </button>
              <button class="btn btn-primary shadow-lg" @click="handleProcesarPago">
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
          <div class="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg">
              <div class="modal-header text-bg-primary py-2">
                <h4 class="modal-title fs-5">Seleccionar Cliente y Pago</h4>
                <button
                  type="button"
                  class="btn-close btn-close-white"
                  @click="showClienteModal = false"
                ></button>
              </div>

              <div class="modal-body p-3">
                <BuscadorCliente
                  :current-cliente="clienteSeleccionado"
                  @cliente-selected="handleClienteSelected"
                  @close="showClienteModal = false"
                />

                <AvalSelector @aval-selected="handleAvalSelected" v-if="!isVentaContado" />

                <hr class="my-3" />

                <PaymentForm
                  :subtotal-bruto="subtotalGeneral"
                  :descuento="descuento"
                  :impuesto="0"
                  :total-pagar="totalVenta"
                  :items="itemsVenta"
                  :cliente="clienteSeleccionado"
                  :cliente-generico="clienteGenerico"
                  @update:is-contado="handleContadoChange"
                  @venta-registrada="handleVentaRegistrada"
                />
              </div>
            </div>
          </div>
        </div>

        <NotificationModal
          :isVisible="notification.isVisible"
          :message="notification.message"
          :isError="notification.isError"
          @close="closeNotification"
        />

        <ConfirmationModal
          :is-visible="showCancelConfirmation"
          title="Cancelar Venta"
          message="¿Está seguro de que desea cancelar la venta y limpiar el carrito? Esta acción no se puede deshacer."
          confirm-text="Sí, Cancelar"
          @confirm="handleCancelarVenta"
          @cancel="showCancelConfirmation = false"
        />
      </div>
    </CajaBloqueador>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'

// Componentes
import BuscadorProducto from '../components/VentaPOS/BuscadorProducto.vue'
import BuscadorCliente from '@/components/VentaPOS/BuscadorCliente.vue'
import PaymentForm from '@/components/VentaPOS/PaymentForm.vue'
import ProductGridPOS from '../components/VentaPOS/ProductGridPOS.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import CajaBloqueador from '@/components/shared/CajaBloqueador.vue'
import AvalSelector from '@/components/ventas/AvalSelector.vue' // Added import
import { useCajaStore } from '@/store/useCajaStore'

// Interfaces
import type { ItemVenta, ProductoVentaBase, Aval } from '@/interfaces/IPostInterfaces' // Added Aval interface
import type { ICliente } from '@/interfaces/ICliente'
import type { Ref } from 'vue'

// --- Inicialización de Stores ---
const cajaStore = useCajaStore() // Inicializamos el store de la caja

const isVentaContado = ref(false) // Estado local en el padre

const handleContadoChange = (newValue: boolean) => {
  isVentaContado.value = newValue
}
// --- 1. Estado de Cliente ---
interface NotificationState {
  isVisible: boolean
  message: string
  isError: boolean
}

const clienteGenerico: ICliente = {
  id: 0,
  nombre: 'Consumidor Final',
  cedula: 0,
  apellidos: '',
  telefono: '',
  email: '',
  direccion: '',
  aval_id: null,
  estado_financiero: [],
}

const clienteSeleccionado = ref<ICliente>(clienteGenerico)
const selectedAval = ref<Aval | null>(null) // Added for aval data
const hasPendingDuesForAval = ref<boolean>(false) // Added for aval pending dues

// --- 2. Estado del Carrito y Control de Stock ---
const itemsVenta: Ref<ItemVenta[]> = ref([])
const searchQueryGrid = ref('')
const descuento = ref(0.0)

const gridRefreshKey = ref(0)

// ESTADO DE NOTIFICACIÓN
const notification: Ref<NotificationState> = ref({
  isVisible: false,
  message: '',
  isError: false,
})

// ESTADO DE CONFIRMACIÓN
const showCancelConfirmation = ref(false)

// 🚨 Lógica de verificación de caja al montar el componente
onMounted(() => {
  // Solo verificar si la caja no está ya cargada y abierta
  if (!cajaStore.isCajaAbierta && !cajaStore.isLoading) {
    cajaStore.fetchCajaActiva() // Usamos fetchCajaActiva para verificar el estado actual
  }
})

// --- 3. Lógica del Carrito y Modificadores ---

const calculateItemSubtotal = (item: ItemVenta): number => {
  return item.cantidad * item.precio_venta
}

// Observador profundo con validación de cantidad
watch(
  itemsVenta,
  (newItems) => {
    newItems.forEach((item) => {
      let qty = Math.floor(item.cantidad)
      const maxStock = item.stock_actual

      // 1. No permitir cantidad menor a 1 o no numérica
      if (isNaN(qty) || qty < 1) {
        qty = 1
      }

      // 2. Validar contra el stock disponible
      if (qty > maxStock) {
        qty = maxStock
        // Mostrar una notificación si el usuario intenta exceder el stock
        showNotification(
          `Cantidad limitada. Solo puedes agregar ${maxStock} unidades de ${item.nombre}.`,
          true,
        )
      }

      if (item.cantidad !== qty) {
        item.cantidad = qty
      }

      // 3. Recalcular subtotal
      item.subtotal = calculateItemSubtotal(item)
    })
  },
  { deep: true },
)

/**
 * Muestra el modal de notificación.
 */
const showNotification = (message: string, isError = false) => {
  notification.value = { isVisible: true, message, isError }

  // Si no es un error (ej. éxito de venta), cerrar automáticamente después de 4s
  if (!isError) {
    setTimeout(closeNotification, 4000)
  }
}

/**
 * Cierra el modal de notificación.
 */
const closeNotification = () => {
  notification.value = { isVisible: false, message: '', isError: false }
}

/**
 * No permitir agregar productos sin stock.
 * Agrega o incrementa la cantidad de un producto al carrito.
 */
const addProductToCart = (producto: ProductoVentaBase) => {
  const precioNumerico = parseFloat(producto.precio_venta.toString())

  if (producto.stock_actual <= 0) {
    showNotification(
      `El producto "${producto.nombre}" no tiene stock disponible para agregar.`,
      true,
    )
    return
  }

  const existingItem = itemsVenta.value.find((item) => item.id === producto.id)

  if (existingItem) {
    if (existingItem.cantidad + 1 > existingItem.stock_actual) {
      showNotification(
        `Solo quedan ${existingItem.stock_actual} unidades de "${producto.nombre}".`,
        true,
      )
      return
    }
    existingItem.cantidad += 1
  } else {
    itemsVenta.value.push({
      id: producto.id,
      nombre: producto.nombre,
      nombre_producto: producto.nombre, // o ajusta según corresponda
      precio_venta: precioNumerico,
      precio_unitario: precioNumerico, // o ajusta según corresponda
      stock_actual: producto.stock_actual,
      cantidad: 1,
      subtotal: precioNumerico,
    })
  }
}

/**
 * VALIDACIÓN: Asegura que el descuento sea válido al salir del input.
 */
const validateDescuento = () => {
  const desc = descuento.value

  if (isNaN(desc) || desc < 0) {
    descuento.value = 0
    showNotification('El descuento no puede ser un valor negativo.', true)
  } else if (desc > subtotalGeneral.value) {
    descuento.value = subtotalGeneral.value
    showNotification('El descuento no puede superar el subtotal de la venta.', true)
  }
}

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

const totalVenta = computed(() => {
  const descuentoAplicable = Math.min(descuento.value, subtotalGeneral.value)
  return subtotalGeneral.value - descuentoAplicable
})

// --- 5. Lógica de Interfaz y Handlers ---

const showClienteModal = ref(false)

/**
 * Abre el modal de pago y cliente, previa validación.
 */
function handleProcesarPago() {
  if (itemsVenta.value.length === 0) {
    showNotification('Debe agregar productos al carrito antes de procesar el pago.', true)
    return
  }
  showClienteModal.value = true
}

const handleClienteSelected = (cliente: ICliente) => {
  clienteSeleccionado.value = cliente
}

const handleSearchUpdated = (query: string) => {
  searchQueryGrid.value = query
}

const handleProductSelected = (producto: ProductoVentaBase) => {
  addProductToCart(producto)
}

/**
 * CONFIRMACIÓN: Muestra el modal de confirmación antes de cancelar.
 */
function handleConfirmCancelacion() {
  if (itemsVenta.value.length === 0) {
    showNotification('El carrito ya está vacío.', false)
    return
  }
  showCancelConfirmation.value = true
}

/**
 * MANEJO DE CANCELACIÓN: Resetea el carrito y el cliente.
 */
function handleCancelarVenta() {
  // Solo se llama desde el modal de confirmación
  itemsVenta.value = []
  clienteSeleccionado.value = clienteGenerico
  descuento.value = 0.0
  showCancelConfirmation.value = false
  showNotification('Venta cancelada. Carrito limpiado.', false)
}

/**
 * MANEJO DE SELECCIÓN DE AVAL: Recibe el ID del aval seleccionado y su estado de cuentas pendientes.
 */
function handleAvalSelected(avalData: { id: number | null; hasPendingDues: boolean }) {
  selectedAval.value = { id: avalData.id } // Store the ID
  hasPendingDuesForAval.value = avalData.hasPendingDues

  if (avalData.hasPendingDues) {
    showNotification('¡Atención! El aval seleccionado tiene cuentas por cobrar pendientes.', true)
  }
}

/**
 * REACTIVIDAD POST-VENTA: Se llama cuando PaymentForm registra la venta con éxito.
 */
const handleVentaRegistrada = (mensaje: string) => {
  // 1. Forzar la recarga del ProductGridPOS y su lógica de stock
  gridRefreshKey.value += 1

  // 2. Resetear el estado de la vista
  itemsVenta.value = []
  clienteSeleccionado.value = clienteGenerico
  descuento.value = 0.0
  selectedAval.value = null // Reset selected aval
  hasPendingDuesForAval.value = false // Reset pending dues status

  // 3. Cerrar el modal y mostrar notificación de éxito (Ahora con NotificationModal)
  showClienteModal.value = false

  // Usamos nextTick para asegurar que el modal de pago se cierre antes de abrir la notificación
  nextTick(() => {
    showNotification(mensaje, false)
  })
}
</script>

<style scoped>
/* 1. Ajuste de Densidad de la Interfaz */
.fs-7 {
  font-size: 0.85rem;
}
.smaller-icon {
  font-size: 0.8rem;
}

/* Input más pequeño */
.form-control-xs {
  height: calc(1.5em + 0.3rem + 2px);
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
  min-width: 350px;
}
/* Estilo para asegurar que el área POS ocupe toda la altura visible */
/* .pos-view {
  height: 100dvh;
} */

.btn-back-pos {
  position: absolute;
  top: 15px; /* Ajusta la posición desde arriba */
  left: 15px; /* Ajusta la posición desde la izquierda */
  z-index: 2000; /* Asegura que esté por encima de otros elementos */
  width: 35px; /* Define el tamaño del círculo */
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 1rem;
  border-width: 1px; /* Borde fino */
}
</style>
