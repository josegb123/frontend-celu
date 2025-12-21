<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">🔔 Centro de Notificaciones y Alertas</h1>

    <div class="card mb-5 shadow">
      <div
        class="card-header bg-warning text-white d-flex justify-content-between align-items-center"
      >
        <h3 class="mb-0">
          <i class="bi bi-box-seam me-2"></i> Alertas de Bajo Stock
          <span class="badge rounded-pill bg-danger ms-2">{{ productosBajoStock.length }}</span>
        </h3>
        <button class="btn btn-sm btn-light" @click="getBajoStockData">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
      </div>
      <div class="card-body">
        <div v-if="loadingStock" class="text-center p-4">
          <div class="spinner-border text-warning" role="status"></div>
        </div>
        <div v-else-if="productosBajoStock.length === 0" class="alert alert-success text-center">
          <i class="bi bi-check-circle me-2"></i> Stock suficiente en todos los productos.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover table-sm">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Mínimo</th>
                <th class="text-center" v-if="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="producto in productosBajoStock" :key="producto.id">
                <td>{{ producto.nombre }}</td>
                <td>
                  <span class="badge bg-danger">{{ producto.stock_actual }}</span>
                </td>
                <td>{{ producto.stock_minimo }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-success"
                    @click="abrirModalContacto(producto)"
                    :disabled="!producto.proveedores?.length"
                    v-if="isAdmin"
                  >
                    <i class="bi bi-whatsapp"></i> Pedir Stock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card shadow border-info">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <h3 class="mb-0">
          <i class="bi bi-credit-card me-2"></i> Cuentas de Cobro por Vencer
          <span class="badge rounded-pill bg-danger ms-2">{{ cuentaStore.totalCuentas }}</span>
        </h3>
        <button
          class="btn btn-sm btn-light"
          @click="cuentaStore.fetchCuentasMorosas()"
          :disabled="cuentaStore.isLoading"
        >
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
      </div>

      <div class="card-body">
        <div v-if="cuentaStore.isLoading" class="text-center p-4">
          <div class="spinner-border text-info" role="status"></div>
        </div>

        <div
          v-else-if="cuentaStore.cuentasMorosas.length === 0"
          class="alert alert-success text-center"
        >
          <i class="bi bi-check-circle me-2"></i> No hay cuentas próximas a vencer.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto Pendiente</th>
                <th>Vencimiento</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cuenta in cuentaStore.cuentasMorosas" :key="cuenta.id">
                <td>
                  <div class="fw-bold">
                    {{ cuenta.cliente.nombre }} {{ cuenta.cliente.apellidos }}
                  </div>
                  <small class="text-muted">C.C. {{ cuenta.cliente.cedula }}</small>
                </td>
                <td>
                  <span class="text-danger fw-bold">{{
                    formatCurrency(cuenta.monto_pendiente)
                  }}</span>
                </td>
                <td>
                  <span :class="{ 'text-danger fw-bold': isOverdue(cuenta.fecha_vencimiento) }">
                    {{ formatDate(cuenta.fecha_vencimiento) }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-success btn-sm"
                    @click="enviarWhatsappCobro(cuenta)"
                    :disabled="!cuenta.cliente.telefono"
                  >
                    <i class="bi bi-whatsapp me-1"></i> Notificar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ProveedorContactModal
      :is-visible="mostrarModalContacto"
      :producto-nombre="selectedProducto.nombre"
      :proveedores="selectedProducto.proveedores"
      @close="cerrarModalContacto"
      @contact="enviarWhatsappStock"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import ProveedorContactModal from '@/components/utils/ProveedorContactModal.vue'
import { useAppConfigStore } from '@/store/useAppConfigStore'
import { useCuentaAlertaStore } from '@/store/CuentaPorCobrarAlertaService'
import ProductoBajoStockService from '@/services/ProductoBajoStockService'
import type { ProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import type { Proveedor } from '@/services/proveedorService'
import type { ICuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'
import { useAuthStore } from '@/store/authStore'
import { computed } from 'vue'

const appConfig = useAppConfigStore()
const cuentaStore = useCuentaAlertaStore()
const enterpriseName = appConfig.getBusinessName
const authStore = useAuthStore()

const isAdmin = computed(() => {
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

// --- ESTADO LOCAL STOCK ---
const productosBajoStock = ref<ProductoBajoStock[]>([])
const loadingStock = ref(false)
const mostrarModalContacto = ref(false)
const selectedProducto = reactive({ nombre: '', proveedores: [] as Proveedor[] })

// --- UTILIDADES ---
const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CO', { timeZone: 'UTC' })

const isOverdue = (date: string) => new Date(date) < new Date()

// --- LÓGICA STOCK ---
async function getBajoStockData() {
  loadingStock.value = true
  try {
    const res = await ProductoBajoStockService.getBajoStock()
    productosBajoStock.value = res.data
  } finally {
    loadingStock.value = false
  }
}

function abrirModalContacto(producto: ProductoBajoStock) {
  selectedProducto.nombre = producto.nombre
  selectedProducto.proveedores = producto.proveedores || []
  mostrarModalContacto.value = true
}

function cerrarModalContacto() {
  mostrarModalContacto.value = false
}

function enviarWhatsappStock(telefono: string, productoNombre: string) {
  const msg = `Hola, somos ${enterpriseName}. Requerimos pedido urgente de: *${productoNombre}*.`
  window.open(
    `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(msg)}`,
    '_blank',
  )
  cerrarModalContacto()
}

// --- LÓGICA COBRO ---
function enviarWhatsappCobro(cuenta: ICuentaPorCobrar) {
  const { cliente, monto_pendiente } = cuenta
  const msg = `Estimado(a) ${cliente.nombre}, en ${enterpriseName} recordamos su saldo pendiente de ${formatCurrency(monto_pendiente)}. Agradecemos su pronto pago.`
  window.open(
    `https://api.whatsapp.com/send?phone=${cliente.telefono}&text=${encodeURIComponent(msg)}`,
    '_blank',
  )
}

onMounted(() => {
  getBajoStockData()
  cuentaStore.fetchCuentasMorosas() // Llamada al nuevo store
})
</script>
