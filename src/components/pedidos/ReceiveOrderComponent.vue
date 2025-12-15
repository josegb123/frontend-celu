<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="card p-4 mb-4 shadow-sm">
        <h2 class="h5 mb-3">Detalles de la Cabecera</h2>
        <div class="row g-3">
          <div class="col-md-4">
            <label for="numeroFactura" class="form-label">Número de Factura (*)</label>
            <input
              type="text"
              class="form-control"
              id="numeroFactura"
              v-model="numeroFacturaProveedor"
              required
            />
          </div>
          <div class="col-md-4">
            <label for="fechaEntrega" class="form-label">Fecha de Entrega (*)</label>
            <input
              type="date"
              class="form-control"
              id="fechaEntrega"
              v-model="fechaEntrega"
              required
            />
          </div>
          <div class="col-md-4">
            <label for="proveedor" class="form-label">Proveedor (*)</label>
            <select
              class="form-select"
              id="proveedor"
              v-model="selectedProveedorId"
              required
              :disabled="loadingProveedores"
            >
              <option :value="null" disabled>Seleccione un proveedor</option>
              <option v-if="loadingProveedores" disabled>Cargando proveedores...</option>
              <option v-for="proveedor in proveedores" :key="proveedor.id" :value="proveedor.id">
                {{ proveedor.nombreComercial }}
              </option>
            </select>
          </div>
          <div class="row g-3 mt-3">
            <div class="col-md-4">
              <label for="metodoPago" class="form-label">Método de Pago (*)</label>
              <select class="form-select" id="metodoPago" v-model="metodoPago" required>
                <option value="" disabled>Seleccione un método</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta (Crédito/Débito)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="notificationMessage"
        :class="[
          'alert',
          notificationMessage.type === 'success' ? 'alert-success' : 'alert-danger',
        ]"
        role="alert"
      >
        {{ notificationMessage.message }}
      </div>
      <div class="card p-4 mb-4 shadow-sm">
        <h2 class="h5 mb-3">Añadir Productos</h2>

        <div class="row g-2 align-items-center mb-2">
          <div class="col-md-5 d-flex flex-column">
            <label for="productSearch" class="form-label mb-0">Buscar Producto</label>
            <ProductSearchInput
              id="productSearch"
              ref="searchRef"
              @selectProduct="handleProductSelection"
              :key="tempProduct?.id || 'new'"
            />
          </div>

          <div class="col-md-2">
            <label for="tempCantidad" class="form-label mb-0">Cantidad</label>
            <input
              type="number"
              id="tempCantidad"
              class="form-control"
              ref="cantidadInputRef"
              v-model.number="tempCantidad"
              min="1"
              @keydown.enter.prevent="focusPrecio"
            />
          </div>
          <div class="col-md-3">
            <label for="tempPrecio" class="form-label mb-0">Precio Compra</label>
            <input
              type="number"
              id="tempPrecio"
              class="form-control"
              ref="precioInputRef"
              v-model.number="tempPrecio"
              min="0"
              step="0.01"
              @keydown.enter.prevent="addDetalleFromTemp"
            />
          </div>

          <div class="col-md-2">
            <br />
            <button
              type="button"
              class="btn btn-primary w-100"
              :disabled="!isTempDetalleValid"
              @click="addDetalleFromTemp"
            >
              + Agregar
            </button>
          </div>
        </div>

        <div class="row">
          <div class="col-md-5">
            <small v-if="tempProduct" class="text-success mt-1 d-block">
              ID: {{ tempProduct.id }} | Precio Venta:
              {{ formatCurrency(tempProduct.precio_venta || 0) }}
            </small>
          </div>
        </div>
      </div>

      <div class="card p-4 mb-4 shadow-sm">
        <h2 class="h5 mb-3">Detalles del Pedido ({{ productos.length }} ítems)</h2>

        <div class="row fw-bold mb-2 pb-2 border-bottom">
          <div class="col-5">Producto</div>
          <div class="col-2 text-end">Cantidad</div>
          <div class="col-2 text-end">Precio Compra</div>
          <div class="col-2 text-end">Subtotal</div>
          <div class="col-1"></div>
        </div>

        <div v-if="productos.length === 0" class="alert alert-info text-center">
          Añada productos al pedido.
        </div>

        <div
          v-for="(producto, index) in productos"
          :key="producto.temp_id"
          class="row g-2 align-items-center py-2 border-bottom detalle-row"
        >
          <div class="col-5">
            {{ producto.nombre_producto_temporal }}
          </div>
          <div class="col-2">
            <input
              type="number"
              class="form-control form-control-sm text-end"
              v-model.number="producto.cantidad"
              min="1"
              required
            />
          </div>
          <div class="col-2">
            <input
              type="number"
              class="form-control form-control-sm text-end"
              v-model.number="producto.precio_compra"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="col-2 text-end fw-bold">
            {{ formatCurrency(producto.cantidad * (producto.precio_compra || 0)) }}
          </div>
          <div class="col-1 d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="removeDetalle(index)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 pt-3">
          <h4 class="mb-0">Monto Total:</h4>
          <h4 class="mb-0 text-primary">{{ formatCurrency(montoTotal) }}</h4>
        </div>
      </div>

      <div class="d-flex justify-content-end mb-5">
        <button
          type="submit"
          class="btn btn-success btn-lg"
          :disabled="submitting || productos.length === 0 || montoTotal <= 0"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ submitting ? 'Registrando...' : 'Registrar Recepción' }}
        </button>
      </div>
    </form>
    <!-- NotificationModal se elimina de aquí, el padre lo manejará o se usará otra estrategia -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import ProductSearchInput from '@/components/products/ProductSearchInput.vue'
import PedidoProveedorService from '@/services/PedidoProveedorService'
import { proveedorService } from '@/services/proveedorService'
import type { IPedidoProveedorRequest, IProductoPedido } from '@/interfaces/IPedidoProveedor'
import type { Proveedor } from '@/interfaces/IProveedores'
import type { IProducto } from '@/interfaces/IProductoInterfaces'
// import NotificationModal from '@/components/utils/NotificationModal.vue' // Eliminado

// const modalInitial = ref({ // Eliminado
//   isVisible: false,
//   message: '',
//   isError: false,
// })

// --- Emits ---
const emit = defineEmits(['order-received', 'close', 'show-notification']); // Añadido emit para notificaciones

// --- Tipos Extendidos ---
interface DetalleLocal extends IProductoPedido {
  nombre_producto_temporal: string
  temp_id: number
}

// --- Estado de la Vista ---
const metodoPago = ref<string>('transferencia') // Valor por defecto
const numeroFacturaProveedor = ref<string>('')
const fechaEntrega = ref<string>(new Date().toISOString().split('T')[0] || '')
const selectedProveedorId = ref<number | null>(null)

const proveedores = ref<Proveedor[]>([])
const loadingProveedores = ref<boolean>(false)
const submitting = ref<boolean>(false)
const notificationMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// --- Estado de Detalles ---
const productos = ref<DetalleLocal[]>([])
const tempProduct = ref<IProducto | null>(null)
const tempCantidad = ref<number>(1)
const tempPrecio = ref<number>(0)

// --- Referencias de Componentes (para foco) ---
const searchRef = ref<InstanceType<typeof ProductSearchInput> | null>(null)
const cantidadInputRef = ref<HTMLInputElement | null>(null)
const precioInputRef = ref<HTMLInputElement | null>(null)

// --- Computed Properties ---
const montoTotal = computed(() => {
  return productos.value.reduce((sum, producto) => {
    const cantidad = producto.cantidad || 0
    const precio = producto.precio_compra || 0
    return sum + cantidad * precio
  }, 0)
})

const isTempDetalleValid = computed(() => {
  return !!tempProduct.value && tempCantidad.value > 0 && tempPrecio.value >= 0
})

// --- Funciones de Foco y Teclado ---
const focusPrecio = () => {
  precioInputRef.value?.focus()
}

// --- Funciones de Utilidad y Ciclo de Vida ---
const formatCurrency = (val: number): string => {
  if (typeof val !== 'number' || isNaN(val)) return '$0.00'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(val)
}

// Reemplazado por emitir a show-notification
// const productAdded = (type: 'success' | 'error', message: string) => {
//   notificationMessage.value = { type, message }
//   setTimeout(() => {
//     notificationMessage.value = null
//   }, 3000)
// }

// Esta función ahora emite el evento para que el padre muestre la notificación
const showLocalNotification = (type: 'success' | 'error', message: string) => {
  emit('show-notification', { type, message });
}

onMounted(async () => {
  loadingProveedores.value = true
  try {
    proveedores.value = await proveedorService.getAllProveedoresNoPaginado()
    if (proveedores.value.length > 0) {
      selectedProveedorId.value = proveedores.value[0]?.id || null
    }
    nextTick(() => {
      searchRef.value?.focus()
    })
  } catch {
    showLocalNotification('error', 'Error al cargar proveedores.')
  } finally {
    loadingProveedores.value = false
  }
})

// --- Lógica de Adición/Remoción de Detalles ---

const handleProductSelection = (product: IProducto) => {
  tempProduct.value = product
  tempPrecio.value = product.precio_compra || 0

  nextTick(() => {
    cantidadInputRef.value?.focus()
  })
}

const addDetalleFromTemp = () => {
  if (!isTempDetalleValid.value) return

  const existingIndex = productos.value.findIndex((d) => d.producto_id === tempProduct.value?.id)

  if (existingIndex !== -1) {
    productos.value[existingIndex]!.cantidad += tempCantidad.value
    productos.value[existingIndex]!.precio_compra = tempPrecio.value
    showLocalNotification('success', `Cantidad sumada para ${tempProduct.value!.nombre}.`)
  } else {
    productos.value.push({
      producto_id: tempProduct.value!.id,
      cantidad: tempCantidad.value,
      precio_compra: tempPrecio.value,
      nombre_producto_temporal: tempProduct.value!.nombre,
      temp_id: Date.now() + Math.random(),
      precio_venta: tempProduct.value!.precio_venta,
    })
    showLocalNotification('success', `Producto ${tempProduct.value!.nombre} añadido.`) // Usar la nueva función
  }

  // Resetear estado temporal y enfocar el buscador
  tempProduct.value = null
  tempCantidad.value = 1
  tempPrecio.value = 0
  searchRef.value?.clear()
  nextTick(() => {
    searchRef.value?.focus()
  })
}

const removeDetalle = (index: number) => {
  const nombre = productos.value[index]?.nombre_producto_temporal || 'Producto'
  productos.value.splice(index, 1)
  showLocalNotification('error', `Ítem ${nombre} eliminado del pedido.`) // Usar la nueva función
}

// --- Lógica de Envío ---
const handleSubmit = async () => {
  submitting.value = true
  notificationMessage.value = null

  const validProductos = productos.value.filter(
    (d) => d.producto_id && d.cantidad > 0 && d.precio_compra >= 0,
  )

  if (!numeroFacturaProveedor.value || !selectedProveedorId.value || !metodoPago.value) {
    showLocalNotification('error', 'Por favor, complete la factura, el proveedor y el método de pago.')
    submitting.value = false
    return
  }
  if (validProductos.length === 0 || montoTotal.value <= 0) {
    showLocalNotification(
      'error',
      'Debe añadir al menos un detalle de pedido válido y con monto total mayor a cero.',
    )
    submitting.value = false
    return
  }

  const payload: IPedidoProveedorRequest = {
    numero_factura_proveedor: numeroFacturaProveedor.value,
    fecha_entrega: fechaEntrega.value,
    proveedor_id: selectedProveedorId.value,
    monto_total: montoTotal.value,
    productos: validProductos.map((detalle) => ({
      producto_id: detalle.producto_id,
      cantidad: detalle.cantidad,
      precio_compra: detalle.precio_compra,
      precio_venta: detalle.precio_venta, // Incluimos precio_venta si es requerido en el DTO/validación
    })) as IProductoPedido[],
    metodo_pago: metodoPago.value,
  }

  try {
    const response = await PedidoProveedorService.recibirPedido(payload)
    showLocalNotification('success', '✅ Pedido registrado y recibido exitosamente!') // Usar la nueva función
    emit('order-received', response); // Emitir el evento de éxito

    // Reset form
    numeroFacturaProveedor.value = ''
    fechaEntrega.value = new Date().toISOString().split('T')[0] || ''
    selectedProveedorId.value =
      proveedores.value.length > 0 ? (proveedores.value[0]?.id ?? null) : null
    productos.value = []
    nextTick(() => {
      searchRef.value?.focus()
    })
  } catch (error: unknown) {
    // Check if error is an object and has a 'response' property, then 'data', then 'message'
    const errorMessage =
      (error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response: { data?: { message?: string } } }).response?.data?.message) ||
      'Error al registrar el pedido. Revise la consola para más detalles.'
    showLocalNotification('error', errorMessage.toString()) // Usar la nueva función
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.row.g-3.align-items-center label {
  font-size: 0.9rem;
  color: var(--bs-secondary);
}
.detalle-row input {
  height: 30px;
  font-size: 0.9rem;
}
.detalle-row button {
  padding: 0.15rem 0.5rem;
}
.col-md-2.d-flex.align-items-end button {
  height: 100%;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}
</style>
