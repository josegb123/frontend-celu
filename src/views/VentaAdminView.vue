<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">📊 Historial de Ventas</h2>
      <div class="text-muted small">
        <i class="bi bi-info-circle me-1"></i>
        Mostrando: <strong>{{ filtroTexto }}</strong>
      </div>
    </div>

    <div class="card mb-3 shadow-sm border-0">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small fw-bold">Buscar Cliente/Vendedor</label>
            <InputDebounced
              v-model="filtroBusqueda.search"
              placeholder="Nombre o ID..."
              @search="aplicarFiltros"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-bold">Fecha</label>
            <input
              type="date"
              class="form-control"
              v-model="filtroBusqueda.fecha"
              :disabled="filtroBusqueda.all_time"
              @change="aplicarFiltros"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label small fw-bold">Estado</label>
            <select class="form-select" v-model="filtroBusqueda.estado" @change="aplicarFiltros">
              <option value="">Todos</option>
              <option value="finalizada">Finalizada</option>
              <option value="pendiente_pago">Pendiente</option>
              <option value="reembolsada">Reembolsada</option>
            </select>
          </div>

          <div class="col-md-5 d-flex align-items-end gap-2">
            <button
              class="btn w-50"
              :class="filtroBusqueda.all_time ? 'btn-info text-white' : 'btn-outline-info'"
              @click="toggleVerTodo"
            >
              <i
                class="bi text-truncated"
                :class="filtroBusqueda.all_time ? 'bi-calendar-check-fill' : 'bi-calendar-range'"
              ></i>
              {{ filtroBusqueda.all_time ? 'Viendo todo el historial' : ' Ver Todo el Historial' }}
            </button>

            <button class="btn btn-outline-secondary w-50" @click="resetearFiltros">
              <i class="bi bi-arrow-counterclockwise me-2"></i>Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow border-0">
      <div class="card-body p-0">
        <div v-if="isLoading" class="p-5 text-center">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="ventas.length === 0" class="p-5 text-center text-muted">
          No hay ventas para los criterios seleccionados.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">ID</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <VentaRow
                v-for="venta in ventas"
                :key="venta.venta_id"
                :venta="venta"
                @ver-detalle="verDetalleVenta"
                @eliminar="handleAnulacionRequest"
              />
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer d-flex justify-content-between align-items-center py-3">
        <span class="text-muted small"
          >Mostrando {{ pagination.meta?.from }} - {{ pagination.meta?.to }} de
          {{ pagination.meta?.total }}</span
        >
        <nav v-if="pagination.meta?.last_page && pagination.meta?.last_page > 1">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.meta?.current_page === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="cambiarPagina(pagination.meta?.current_page! - 1)"
                >Anterior</a
              >
            </li>
            <li class="page-item active">
              <span class="page-link">{{ pagination.meta?.current_page }}</span>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.meta?.current_page === pagination.meta?.last_page }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="cambiarPagina(pagination.meta?.current_page! + 1)"
                >Siguiente</a
              >
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <VentaDetailModal
      :show="mostrarModalDetalle"
      :venta-id="selectedVentaId"
      @close="mostrarModalDetalle = false"
    />
    <ConfirmationModal
      :is-visible="mostrarModalConfirmacion"
      title="Anular Venta"
      message="¿Confirma la anulación? Esta acción afectará el inventario y el balance de caja."
      confirm-text="Si, Anular"
      :is-processing="isDeleting"
      @confirm="ejecutarAnulacion"
      @cancel="mostrarModalConfirmacion = false"
    />
    <NotificationModal
      :is-visible="mostrarModalNotificacion"
      :message="notificationMessage"
      :is-error="notificationIsError"
      @close="mostrarModalNotificacion = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { AxiosError } from 'axios'
import ventaService, { type VentaIndexResponse } from '@/services/VentaService'
import { useCajaStore } from '@/store/useCajaStore'
import VentaRow from '@/components/ventas/VentaRow.vue'
import VentaDetailModal from '@/components/ventas/VentaDetailModal.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import InputDebounced from '@/components/ventas/InputDebounced.vue'
import type { PaginatedResponse } from '@/interfaces/ILaravelPaginated'

const cajaStore = useCajaStore()
const ventas = ref<VentaIndexResponse[]>([])
const isLoading = ref(false)

const pagination = reactive<Partial<PaginatedResponse<VentaIndexResponse>>>({
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 0,
    total: 0,
  },
})

const filtroBusqueda = reactive({
  search: '',
  estado: '',
  metodo_pago: '',
  fecha: new Date().toISOString().split('T')[0],
  all_time: false,
  page: 1,
})

const mostrarModalDetalle = ref(false)
const selectedVentaId = ref<number | null>(null)
const mostrarModalConfirmacion = ref(false)
const ventaIdToDelete = ref<number | null>(null)
const isDeleting = ref(false)
const mostrarModalNotificacion = ref(false)
const notificationMessage = ref('')
const notificationIsError = ref(false)

const filtroTexto = computed(() => {
  if (filtroBusqueda.all_time) return 'Todo el historial'
  return filtroBusqueda.fecha ? filtroBusqueda.fecha : 'Hoy'
})

async function cargarVentas(): Promise<void> {
  isLoading.value = true
  try {
    const response = await ventaService.getIndex({
      page: filtroBusqueda.page,
      search: filtroBusqueda.search || undefined,
      estado: filtroBusqueda.estado || undefined,
      metodo_pago: filtroBusqueda.metodo_pago || undefined,
      fecha: filtroBusqueda.all_time ? undefined : filtroBusqueda.fecha || undefined,
      all_time: filtroBusqueda.all_time || undefined,
    })
    ventas.value = response.data
    Object.assign(pagination, response)
  } catch (err: unknown) {
    const errorMsg =
      err instanceof AxiosError
        ? err.response?.data?.message || 'Error al conectar con el servidor'
        : 'Ocurrió un error inesperado'
    showNotify(errorMsg, true)
  } finally {
    isLoading.value = false
  }
}

function aplicarFiltros(): void {
  filtroBusqueda.page = 1
  cargarVentas()
}

function toggleVerTodo(): void {
  filtroBusqueda.all_time = !filtroBusqueda.all_time
  if (filtroBusqueda.all_time) filtroBusqueda.fecha = ''
  else filtroBusqueda.fecha = new Date().toISOString().split('T')[0]
  aplicarFiltros()
}

function resetearFiltros(): void {
  filtroBusqueda.search = ''
  filtroBusqueda.estado = ''
  filtroBusqueda.metodo_pago = ''
  filtroBusqueda.fecha = new Date().toISOString().split('T')[0]
  filtroBusqueda.all_time = false
  aplicarFiltros()
}

function cambiarPagina(p: number): void {
  filtroBusqueda.page = p
  cargarVentas()
}

function verDetalleVenta(id: number): void {
  selectedVentaId.value = id
  mostrarModalDetalle.value = true
}

function handleAnulacionRequest(id: number): void {
  if (!cajaStore.isCajaAbierta) {
    showNotify('Acción denegada: La caja diaria debe estar abierta para anular ventas.', true)
    return
  }
  ventaIdToDelete.value = id
  mostrarModalConfirmacion.value = true
}

async function ejecutarAnulacion(): Promise<void> {
  if (!ventaIdToDelete.value) return
  isDeleting.value = true
  try {
    await ventaService.deleteVenta(ventaIdToDelete.value)
    showNotify(`Venta #${ventaIdToDelete.value} anulada exitosamente`)
    cargarVentas()
  } catch (err: unknown) {
    const msg = err instanceof AxiosError ? err.response?.data?.message : 'No se pudo anular'
    showNotify(msg, true)
  } finally {
    isDeleting.value = false
    mostrarModalConfirmacion.value = false
    ventaIdToDelete.value = null
  }
}

function showNotify(msg: string, isError = false): void {
  notificationMessage.value = msg
  notificationIsError.value = isError
  mostrarModalNotificacion.value = true
}

onMounted(() => {
  cargarVentas()
  if (!cajaStore.isCajaAbierta) cajaStore.fetchCajaActiva()
})
</script>
