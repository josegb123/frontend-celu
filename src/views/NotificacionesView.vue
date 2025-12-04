<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">🔔 Centro de Notificaciones y Alertas</h1>

    <div class="card mb-5 shadow">
      <div
        class="card-header bg-warning text-dark d-flex justify-content-between align-items-center"
      >
        <h3 class="mb-0 text-bg-warning">
          <i class="bi bi-box-seam me-2"></i> Alertas de Bajo Stock
          <span class="badge rounded-pill bg-danger ms-2">{{ stockStore.totalAlertas }}</span>
        </h3>
        <button
          class="btn btn-sm btn-outline-dark"
          @click="stockStore.fetchBajoStock(1)"
          :disabled="stockStore.isLoading"
        >
          <i class="bi bi-arrow-clockwise me-1"></i> Recargar
        </button>
      </div>

      <div class="card-body">
        <div v-if="stockStore.isLoading" class="text-center p-4">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando alertas...</span>
          </div>
        </div>
        <div
          v-else-if="stockStore.totalAlertas === 0"
          class="alert alert-success text-center"
          role="alert"
        >
          <i class="bi bi-check-circle me-2"></i> ¡Excelente! Todos tus productos tienen stock
          suficiente.
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th class="text-center">Contactar Proveedor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in stockStore.productosBajoStock" :key="producto.id">
                  <td>{{ producto.nombre }}</td>
                  <td>
                    <span class="badge bg-danger">{{ producto.stock_actual }}</span>
                  </td>
                  <td>{{ producto.stock_minimo }}</td>
                  <td class="text-center">
                    <button
                      class="btn btn-sm btn-success"
                      @click="abrirModalContacto(producto)"
                      :disabled="!producto.proveedores || producto.proveedores.length === 0"
                    >
                      <i class="bi bi-whatsapp"></i> Pedir Stock
                    </button>
                    <span
                      v-if="!producto.proveedores || producto.proveedores.length === 0"
                      class="text-muted small ms-2"
                      >Sin proveedores</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: stockStore.alertData.currentPage === 1 }">
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="stockStore.fetchBajoStock(stockStore.alertData.currentPage - 1)"
                    >Anterior</a
                  >
                </li>
                <li class="page-item disabled">
                  <span class="page-link"
                    >{{ stockStore.alertData.currentPage }} /
                    {{ stockStore.alertData.lastPage }}</span
                  >
                </li>
                <li
                  class="page-item"
                  :class="{
                    disabled: stockStore.alertData.currentPage === stockStore.alertData.lastPage,
                  }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="stockStore.fetchBajoStock(stockStore.alertData.currentPage + 1)"
                    >Siguiente</a
                  >
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow">
      <div class="card-header bg-info text-dark">
        <h3 class="mb-0 text-bg-info">
          <i class="bi bi-credit-card me-2"></i> Cuentas de Cobro por Vencer
          <span class="badge rounded-pill bg-danger ms-2">{{
            clientesMorososSimulados.length
          }}</span>
        </h3>
      </div>

      <div class="card-body">
        <div
          v-if="clientesMorososSimulados.length === 0"
          class="alert alert-success text-center"
          role="alert"
        >
          <i class="bi bi-check-circle me-2"></i> No hay cuentas de cobro próximas a vencer.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover table-sm">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto Pendiente</th>
                <th>Fecha Límite</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in clientesMorososSimulados" :key="cliente.id">
                <td>{{ cliente.nombre }}</td>
                <td>{{ formatCurrency(cliente.monto) }}</td>
                <td>{{ formatDate(cliente.fechaLimite) }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-success"
                    @click="enviarWhatsappCobro(cliente.telefono, cliente.nombre, cliente.monto)"
                    title="Notificar Pago"
                  >
                    <i class="bi bi-whatsapp"></i> Notificar
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
import { useStockAlertStore } from '@/store/useStockAlertStore'
import ProveedorContactModal from '@/components/utils/ProveedorContactModal.vue'
import type { ProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import type { Proveedor } from '@/services/proveedorService'

// --- STORES ---
const stockStore = useStockAlertStore()

// --- CONFIGURACIÓN DE BRANDING ---
const enterpriseName = import.meta.env.VITE_BRANDING_NAME || 'Tu Empresa'

// --- ESTADO SIMULADO PARA CLIENTES MOROSOS ---
const clientesMorososSimulados = reactive([
  {
    id: 1,
    nombre: 'Juan Pérez',
    monto: 150.5,
    fechaLimite: '2025-12-07',
    telefono: '573009876543',
  },
  {
    id: 2,
    nombre: 'María López',
    monto: 320.0,
    fechaLimite: '2025-12-10',
    telefono: '573001122334',
  },
])

// --- ESTADO DEL MODAL ---
const mostrarModalContacto = ref(false)
const selectedProducto = reactive<{
  nombre: string
  proveedores: Proveedor[]
}>({
  nombre: '',
  proveedores: [],
})

// --- FORMATO DE UTILIDAD ---
const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO')
}

// --- GESTIÓN DEL MODAL ---
function abrirModalContacto(producto: ProductoBajoStock) {
  selectedProducto.nombre = producto.nombre
  // Asignamos los proveedores, asegurando que sea un array
  selectedProducto.proveedores = producto.proveedores || []
  mostrarModalContacto.value = true
}

function cerrarModalContacto() {
  mostrarModalContacto.value = false
  selectedProducto.nombre = ''
  selectedProducto.proveedores = []
}

// --- LÓGICA DE WHATSAPP ---

function enviarWhatsappStock(telefono: string, productoNombre: string) {
  // La validación de null/empty ya se hizo en el modal, aquí solo ejecutamos la acción.
  const mensaje = encodeURIComponent(
    `Hola, somos ${enterpriseName}. Requerimos realizar un pedido urgente de reabastecimiento para el producto: *${productoNombre}* que se encuentra en bajo stock. Por favor, confírmanos disponibilidad y tiempo de entrega.`,
  )

  window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${mensaje}`, '_blank')

  cerrarModalContacto()
}

function enviarWhatsappCobro(telefono: string, clienteNombre: string, monto: number) {
  const montoFormateado = formatCurrency(monto)

  const mensaje = encodeURIComponent(
    `Estimado(a) ${clienteNombre}, somos ${enterpriseName}. Te recordamos amablemente que tu cuenta de cobro por un monto de *${montoFormateado}* está próxima a vencer. ¡Agradecemos tu pronto pago!`,
  )

  window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${mensaje}`, '_blank')
}

// --- HOOKS ---
onMounted(() => {
  if (stockStore.totalAlertas === 0) {
    stockStore.fetchBajoStock(1)
  }
})
</script>

<style scoped>
.badge.bg-danger {
  font-size: 0.8em;
}
.modal.show {
  overflow-y: auto;
}
</style>
