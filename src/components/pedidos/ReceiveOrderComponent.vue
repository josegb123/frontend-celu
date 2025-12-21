<template>
  <div class="container-fluid px-0 px-md-2">
    <form @submit.prevent="handleSubmit">
      <div class="card p-3 p-md-4 mb-4 shadow-sm border-0">
        <h2 class="h5 mb-4 text-primary fw-bold border-bottom pb-2">
          <i class="bi bi-file-earmark-text me-2"></i>Detalles de la Recepción
        </h2>
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label for="numeroFactura" class="form-label fw-semibold">Número de Factura (*)</label>
            <input
              type="text"
              class="form-control"
              id="numeroFactura"
              placeholder="Ej: FAC-1234"
              v-model="numeroFacturaProveedor"
              required
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="fechaEntrega" class="form-label fw-semibold">Fecha de Entrega (*)</label>
            <input
              type="date"
              class="form-control"
              id="fechaEntrega"
              v-model="fechaEntrega"
              required
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="proveedor" class="form-label fw-semibold">Proveedor (*)</label>
            <select
              class="form-select"
              id="proveedor"
              v-model="selectedProveedorId"
              required
              :disabled="loadingProveedores"
            >
              <option :value="null" disabled>Seleccione un proveedor</option>
              <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                {{ prov.nombreComercial }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label for="metodoPago" class="form-label fw-semibold">Método de Pago (*)</label>
            <select class="form-select" id="metodoPago" v-model="metodoPago" required>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="tarjeta">Tarjeta (Crédito/Débito)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card p-3 p-md-4 mb-4 shadow-sm border-0">
        <h2 class="h5 mb-4 text-primary fw-bold border-bottom pb-2">
          <i class="bi bi-box-seam me-2"></i>Añadir Productos
        </h2>

        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-5">
            <label class="form-label fw-semibold">Buscar Producto</label>
            <ProductSearchInput
              ref="searchRef"
              @selectProduct="handleProductSelection"
              :key="tempProduct?.id || 'new'"
            />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label fw-semibold">Cantidad</label>
            <input
              type="number"
              class="form-control"
              ref="cantidadInputRef"
              v-model.number="tempCantidad"
              min="1"
              @keydown.enter.prevent="focusPrecio"
            />
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label fw-semibold">Precio Compra</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input
                type="number"
                class="form-control"
                ref="precioInputRef"
                v-model.number="tempPrecio"
                min="0"
                step="0.01"
                @keydown.enter.prevent="addDetalleFromTemp"
              />
            </div>
          </div>

          <div class="col-12 col-md-2">
            <button
              type="button"
              class="btn btn-primary w-100 py-2"
              :disabled="!isTempDetalleValid"
              @click="addDetalleFromTemp"
            >
              <i class="bi bi-plus-lg me-1"></i> Agregar
            </button>
          </div>
        </div>
      </div>

      <div class="card p-3 p-md-4 mb-4 shadow-sm border-0">
        <div class="table-responsive">
          <div class="row fw-bold mb-2 pb-2 border-bottom d-none d-md-flex">
            <div class="col-5">Producto</div>
            <div class="col-2 text-end">Cantidad</div>
            <div class="col-2 text-end">Precio Compra</div>
            <div class="col-2 text-end">Subtotal</div>
            <div class="col-1"></div>
          </div>

          <div
            v-for="(producto, index) in productos"
            :key="producto.temp_id"
            class="row g-2 align-items-center py-3 border-bottom"
          >
            <div class="col-12 col-md-5 fw-bold fw-md-normal">
              {{ producto.nombre_producto_temporal }}
            </div>
            <div class="col-4 col-md-2">
              <input
                type="number"
                class="form-control form-control-sm text-end"
                v-model.number="producto.cantidad"
              />
            </div>
            <div class="col-4 col-md-2">
              <input
                type="number"
                class="form-control form-control-sm text-end"
                v-model.number="producto.precio_compra"
              />
            </div>
            <div class="col-3 col-md-2 text-end fw-bold text-success">
              {{ formatCurrency(producto.cantidad * (producto.precio_compra || 0)) }}
            </div>
            <div class="col-1 col-md-1 text-end">
              <button
                type="button"
                class="btn btn-sm btn-outline-danger border-0"
                @click="removeDetalle(index)"
              >
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 p-3 rounded">
          <h4 class="mb-0 fw-bold">TOTAL:</h4>
          <h4 class="mb-0 text-primary fw-bold">{{ formatCurrency(montoTotal) }}</h4>
        </div>
      </div>

      <div class="d-grid d-md-flex justify-content-md-end gap-2 mb-5">
        <button
          type="submit"
          class="btn btn-success btn-lg px-5 shadow"
          :disabled="submitting || productos.length === 0"
        >
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ submitting ? 'Procesando...' : 'Registrar Recepción' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { AxiosError } from 'axios'
import ProductSearchInput from '@/components/products/ProductSearchInput.vue'
import PedidoProveedorService from '@/services/PedidoProveedorService'
import { proveedorService } from '@/services/proveedorService'
import type { IPedidoProveedorRequest, IProductoPedido } from '@/interfaces/IPedidoProveedor'
import type { Proveedor } from '@/interfaces/IProveedores'
import type { IProducto } from '@/interfaces/IProductoInterfaces'

const emit = defineEmits(['order-received', 'close', 'show-notification'])

interface DetalleLocal extends IProductoPedido {
  nombre_producto_temporal: string
  temp_id: number
}

// --- Estado ---
const metodoPago = ref<string>('transferencia')
const numeroFacturaProveedor = ref<string>('')
const fechaEntrega = ref<string | any>(new Date().toISOString().split('T')[0])
const selectedProveedorId = ref<number | null>(null)
const proveedores = ref<Proveedor[]>([])
const loadingProveedores = ref(false)
const submitting = ref(false)
const productos = ref<DetalleLocal[]>([])

// Temporales para añadir
const tempProduct = ref<IProducto | null>(null)
const tempCantidad = ref(1)
const tempPrecio = ref(0)

// Referencias para foco (ProductSearchInput debe exponer focus())
const searchRef = ref<{ focus: () => void; clear: () => void } | null>(null)
const cantidadInputRef = ref<HTMLInputElement | null>(null)
const precioInputRef = ref<HTMLInputElement | null>(null)

const montoTotal = computed(() =>
  productos.value.reduce((sum, p) => sum + p.cantidad * (p.precio_compra || 0), 0),
)

const isTempDetalleValid = computed(() => !!tempProduct.value && tempCantidad.value > 0)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)

const showLocalNotification = (type: 'success' | 'error', message: string) => {
  emit('show-notification', { type, message })
}

const focusPrecio = () => precioInputRef.value?.focus()

onMounted(async () => {
  loadingProveedores.value = true
  try {
    proveedores.value = await proveedorService.getAllProveedoresNoPaginado()
    if (proveedores.value.length > 0) selectedProveedorId.value = proveedores.value[0].id
  } catch {
    showLocalNotification('error', 'Error al cargar proveedores.')
  } finally {
    loadingProveedores.value = false
  }
})

const handleProductSelection = (product: IProducto) => {
  tempProduct.value = product
  tempPrecio.value = product.precio_compra || 0
  nextTick(() => cantidadInputRef.value?.focus())
}

const addDetalleFromTemp = () => {
  if (!isTempDetalleValid.value || !tempProduct.value) return

  const existing = productos.value.find((p) => p.producto_id === tempProduct.value?.id)
  if (existing) {
    existing.cantidad += tempCantidad.value
    existing.precio_compra = tempPrecio.value
  } else {
    productos.value.push({
      producto_id: tempProduct.value.id,
      cantidad: tempCantidad.value,
      precio_compra: tempPrecio.value,
      nombre_producto_temporal: tempProduct.value.nombre,
      temp_id: Date.now(),
      precio_venta: tempProduct.value.precio_venta,
    })
  }

  tempProduct.value = null
  tempCantidad.value = 1
  searchRef.value?.clear()
  nextTick(() => searchRef.value?.focus())
}

const removeDetalle = (index: number) => productos.value.splice(index, 1)

const handleSubmit = async () => {
  // Validación de seguridad para la fecha y campos nulos
  if (!numeroFacturaProveedor.value || !selectedProveedorId.value || !fechaEntrega.value) {
    showLocalNotification('error', 'Complete los campos obligatorios: Factura, Proveedor y Fecha.')
    return
  }

  submitting.value = true

  const payload: IPedidoProveedorRequest = {
    numero_factura_proveedor: String(numeroFacturaProveedor.value),
    fecha_entrega: String(fechaEntrega.value), // Forzamos a que sea string puro
    proveedor_id: Number(selectedProveedorId.value),
    monto_total: Number(montoTotal.value),
    metodo_pago: String(metodoPago.value),
    productos: productos.value.map((p) => ({
      producto_id: Number(p.producto_id),
      cantidad: Number(p.cantidad),
      precio_compra: Number(p.precio_compra),
      precio_venta: Number(p.precio_venta),
    })),
  }

  try {
    const response = await PedidoProveedorService.recibirPedido(payload)
    showLocalNotification('success', '✅ Recepción registrada correctamente.')
    emit('order-received', response)

    // Reset
    productos.value = []
    numeroFacturaProveedor.value = ''
    tempProduct.value = null
  } catch (error: unknown) {
    let errorMsg = 'Error inesperado al registrar el pedido.'

    if (error instanceof AxiosError) {
      errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    } else if (error instanceof Error) {
      errorMsg = error.message
    }

    showLocalNotification('error', errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card {
  border-radius: 12px;
}
.form-label {
  font-size: 0.875rem;
}
@media (max-width: 768px) {
  .btn-lg {
    width: 100%;
  }
}
</style>
