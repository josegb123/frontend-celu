<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Gestión de Pedidos a Proveedores</h1>
      <button @click="openReceiveOrderModal" class="btn btn-success shadow-sm">
        <i class="bi bi-box-arrow-in-down me-2"></i> Registrar Mercancía
      </button>
    </div>

    <div class="card shadow-sm mb-4 border-0">
      <div class="card-header py-3">
        <div class="row align-items-center">
          <div class="col">
            <h5 class="mb-0 text-primary fw-bold">Historial de Pedidos</h5>
          </div>
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text border-end-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Buscar por factura o proveedor..."
                v-model="searchQuery"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th class="ps-4">Factura / ID</th>
                <th>Proveedor</th>
                <th>Fecha Entrega</th>
                <th>Estado</th>
                <th class="text-end pe-4">Total Pagado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="mt-2 mb-0 text-muted">Cargando pedidos...</p>
                </td>
              </tr>

              <tr
                v-for="pedido in filteredPedidos"
                :key="pedido.id"
                @click="openDetailsModal(pedido)"
                style="cursor: pointer"
              >
                <td class="ps-4">
                  <span class="fw-bold">{{ pedido.numero_factura_proveedor || pedido.id }}</span>
                </td>
                <td>{{ pedido.proveedor?.nombreComercial || 'N/A' }}</td>
                <td>{{ formatDate(pedido.fecha_entrega) }}</td>
                <td>
                  <span :class="['badge rounded-pill', getStatusBadgeClass(pedido.estado)]">
                    {{ pedido.estado.toUpperCase() }}
                  </span>
                </td>
                <td class="text-end pe-4 fw-bold text-success">
                  {{ formatCurrency(pedido.monto_total) }}
                </td>
              </tr>

              <tr v-if="!isLoading && filteredPedidos.length === 0">
                <td colspan="5" class="text-center text-muted py-5">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No se encontraron registros de pedidos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      :class="{ show: showDetailsModal }"
      tabindex="-1"
      :style="{ display: showDetailsModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              Detalles Pedido #{{ selectedPedido?.numero_factura_proveedor }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="closeDetailsModal"
            ></button>
          </div>
          <div class="modal-body p-4" v-if="selectedPedido">
            <div class="row mb-4">
              <div class="col-sm-6">
                <p class="text-muted mb-1">Proveedor</p>
                <p class="fw-bold fs-5">{{ selectedPedido.proveedor?.nombreComercial }}</p>
                <p class="small text-muted mb-0">NIT: {{ selectedPedido.proveedor?.nit }}</p>
              </div>
              <div class="col-sm-6 text-sm-end">
                <p class="text-muted mb-1">Fecha de Recepción</p>
                <p class="fw-bold">{{ formatDate(selectedPedido.fecha_entrega) }}</p>
                <span :class="['badge', getStatusBadgeClass(selectedPedido.estado)]">
                  {{ selectedPedido.estado }}
                </span>
              </div>
            </div>

            <h6 class="fw-bold mb-3"><i class="bi bi-list-check me-2"></i>Productos Recibidos</h6>
            <div class="table-responsive rounded border">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th class="text-end">Cant.</th>
                    <th class="text-end">Costo Unit.</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedPedido.detalles" :key="item.id">
                    <td>{{ item.producto?.nombre }}</td>
                    <td class="text-end">{{ item.cantidad }}</td>
                    <td class="text-end">{{ formatCurrency(item.precio_compra) }}</td>
                    <td class="text-end fw-bold">{{ formatCurrency(item.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <div class="text-end">
                <span class="text-muted me-2">Total de la operación:</span>
                <span class="fs-4 fw-bold text-primary">{{
                  formatCurrency(selectedPedido.monto_total)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      :class="{ show: showReceiveOrderModal }"
      tabindex="-1"
      :style="{ display: showReceiveOrderModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">Nueva Entrada de Mercancía</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="closeReceiveOrderModal"
            ></button>
          </div>
          <div class="modal-body">
            <ReceiveOrderComponent
              @order-received="handleOrderReceived"
              @close="closeReceiveOrderModal"
              @show-notification="showNotification"
            />
          </div>
        </div>
      </div>
    </div>

    <NotificationModal
      :is-visible="notificationMessage.isVisible"
      :message="notificationMessage.message"
      :is-error="notificationMessage.isError"
      @close="notificationMessage.isVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ReceiveOrderComponent from '@/components/pedidos/ReceiveOrderComponent.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import PedidoProveedorService from '@/services/PedidoProveedorService'

// --- Estados Reales ---
const pedidos = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const showDetailsModal = ref(false)
const selectedPedido = ref<any>(null)
const showReceiveOrderModal = ref(false)

const notificationMessage = ref({
  isVisible: false,
  message: '',
  isError: false,
})

// --- Carga de Datos desde API ---
const fetchPedidos = async () => {
  isLoading.value = true
  try {
    // Asumiendo que tienes un método index() en tu service que llama a GET /pedido-proveedores
    const response = await PedidoProveedorService.getPedidos()
    pedidos.value = response.data
  } catch (error) {
    showNotification({ type: 'error', message: 'Error al cargar el historial de pedidos.' })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPedidos()
})

// --- Lógica de Búsqueda ---
const filteredPedidos = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return pedidos.value.filter(
    (p) =>
      p.proveedor?.nombreComercial?.toLowerCase().includes(query) ||
      p.numero_factura_proveedor?.toLowerCase().includes(query) ||
      p.id.toString().includes(query),
  )
})

// --- Handlers ---
function openDetailsModal(pedido: any) {
  selectedPedido.value = pedido
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedPedido.value = null
}

function openReceiveOrderModal() {
  showReceiveOrderModal.value = true
}

function closeReceiveOrderModal() {
  showReceiveOrderModal.value = false
}

function handleOrderReceived() {
  showNotification({ type: 'success', message: 'Inventario actualizado correctamente.' })
  closeReceiveOrderModal()
  fetchPedidos() // Recargar lista real del servidor
}

function showNotification(payload: { type: 'success' | 'error'; message: string }) {
  notificationMessage.value = {
    message: payload.message,
    isError: payload.type === 'error',
    isVisible: true,
  }
}

// --- Formateadores ---
const getStatusBadgeClass = (estado: string) => {
  const e = estado.toLowerCase()
  if (e.includes('recibido')) return 'bg-success'
  if (e.includes('pendiente')) return 'bg-warning text-dark'
  if (e.includes('cancelado')) return 'bg-danger'
  return 'bg-secondary'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
</script>

<style scoped>
.modal.show {
  display: block !important;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.card {
  border-radius: 15px;
  overflow: hidden;
}
.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.badge {
  font-weight: 500;
  padding: 0.5em 0.8em;
}
</style>
