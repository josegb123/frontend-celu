<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">📊 Administración de Ventas</h2>
      <button class="btn btn-primary" @click="handleCrearVentaClick">
        <i class="bi bi-plus-lg me-2"></i>Nueva Venta
      </button>
    </div>

    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="search" class="form-label">Buscar Cliente/Vendedor</label>
            <InputDebounced
              v-model="filtroBusqueda.search"
              placeholder="Escribe para buscar..."
              :delay="500"
              @search="aplicarFiltros"
              @change="aplicarFiltros"
            />
          </div>
          <div class="col-md-3">
            <label for="estado" class="form-label">Estado</label>
            <select class="form-select" v-model="filtroBusqueda.estado" @change="aplicarFiltros">
              <option value="">Todos los Estados</option>
              <option value="finalizada">Finalizada</option>
              <option value="pendiente_pago">Pendiente de Pago</option>
              <option value="reembolsada">Reembolsada</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="metodoPago" class="form-label">Método de Pago</label>
            <select
              class="form-select"
              v-model="filtroBusqueda.metodo_pago"
              @change="aplicarFiltros"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="aplicarFiltros">
              <i class="bi bi-funnel-fill me-2"></i>Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card shadow">
      <div class="card-header">
        <h5 class="mb-0">Listado de Ventas Recientes</h5>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="p-5 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-else-if="ventas.length === 0" class="p-5 text-center text-muted">
          No se encontraron ventas con los filtros aplicados.
        </div>

        <table v-else class="table table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
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
              @editar="editarVenta"
              @eliminar="confirmarEliminarVenta"
            />
          </tbody>
        </table>
      </div>

      <div class="card-footer d-flex justify-content-between align-items-center">
        <span>Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }}</span>
        <nav aria-label="Paginación de ventas">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="cambiarPagina(pagination.current_page - 1)"
                >Anterior</a
              >
            </li>
            <li
              class="page-item"
              :class="{ active: p === pagination.current_page }"
              v-for="p in totalPaginas"
              :key="p"
            >
              <a class="page-link" href="#" @click.prevent="cambiarPagina(p)">{{ p }}</a>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="cambiarPagina(pagination.current_page + 1)"
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

    <VentaFormModal
      :show="mostrarModalForm"
      :mode="formModalMode"
      :venta-to-edit="ventaToEdit"
      @venta-guardada="handleVentaGuardada"
      @close="mostrarModalForm = false"
      @show-notification="handleNotificationFromForm"
    />

    <ConfirmationModal
      :is-visible="mostrarModalConfirmacion"
      title="Anular Venta"
      :message="`¿Está seguro de anular la Venta #${ventaIdToDelete}? Esta acción es reversible (Soft Delete).`"
      confirm-text="Sí, Anular"
      :is-processing="isDeleting"
      @confirm="ejecutarEliminarVenta"
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
import ventaService, {
  type VentaIndexResponse,
  type LaravelPagination,
} from '@/services/VentaService'
import VentaRow from '@/components/ventas/VentaRow.vue'
import VentaDetailModal from '@/components/ventas/VentaDetailModal.vue'
import VentaFormModal from '@/components/ventas/VentaFormModal.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import { useCajaStore } from '@/store/useCajaStore'
import InputDebounced from '@/components/ventas/InputDebounced.vue'

// ----------------------------------------------------
// ESTADO DE LA VISTA
// ----------------------------------------------------
const ventas = ref<VentaIndexResponse[]>([])
const pagination = reactive<LaravelPagination<VentaIndexResponse>>({
  current_page: 1,
  data: [],
  last_page: 1,
  total: 0,
  per_page: 15,
  from: 0,
  to: 0,
})

const isLoading = ref(false)
const filtroBusqueda = reactive({
  search: '',
  estado: '',
  metodo_pago: '',
  page: 1,
  per_page: 15,
})

// Modales de Operación (Venta)
const mostrarModalDetalle = ref(false)
const selectedVentaId = ref<number | null>(null)

const mostrarModalForm = ref(false)
const formModalMode = ref<'create' | 'edit'>('create')
const ventaToEdit = ref<VentaIndexResponse | null>(null)

// --- ESTADO PARA MODALES DE INTERACCIÓN ---
const mostrarModalConfirmacion = ref(false)
const ventaIdToDelete = ref<number | null>(null)
const isDeleting = ref(false)

const mostrarModalNotificacion = ref(false)
const notificationMessage = ref('')
const notificationIsError = ref(false)

// STORES
const cajaStore = useCajaStore()

// ----------------------------------------------------
// LÓGICA COMPUTADA
// ----------------------------------------------------
const totalPaginas = computed(() => {
  const start = Math.max(1, pagination.current_page - 2)
  const end = Math.min(pagination.last_page, pagination.current_page + 2)
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// ----------------------------------------------------
// LÓGICA DE DATOS Y ACCIONES (Cargar/Filtrar/Paginar)
// ----------------------------------------------------
async function cargarVentas() {
  isLoading.value = true
  try {
    const params = {
      page: filtroBusqueda.page,
      per_page: filtroBusqueda.per_page,
      search: filtroBusqueda.search || undefined,
      estado: filtroBusqueda.estado || undefined,
      metodo_pago: filtroBusqueda.metodo_pago || undefined,
    }

    const response = await ventaService.getIndex(params)

    ventas.value = response.data
    Object.assign(pagination, response)
  } catch (error) {
    console.error('Fallo al cargar ventas:', error)
    notificationMessage.value = 'Error al cargar las ventas. Revisa la consola.'
    notificationIsError.value = true
    mostrarModalNotificacion.value = true
  } finally {
    isLoading.value = false
  }
}

function aplicarFiltros() {
  filtroBusqueda.page = 1
  cargarVentas()
}

function cambiarPagina(page: number) {
  if (page < 1 || page > pagination.last_page || page === pagination.current_page) {
    return
  }
  filtroBusqueda.page = page
  cargarVentas()
}

function handleVentaGuardada() {
  mostrarModalForm.value = false
  cargarVentas()
}

// ----------------------------------------------------
// GESTIÓN DE MODALES Y RESTRICCIÓN DE CAJA 🚨
// ----------------------------------------------------

/**
 * Función de restricción: Verifica si se permite crear/editar.
 * Solo se permite si la caja está abierta O si el usuario es administrador.
 */
function checkCajaRestriction(action: 'crear' | 'editar'): boolean {
  // Si la caja está abierta, permitimos la acción (para vendedores).
  if (cajaStore.isCajaAbierta) {
    return true
  }

  // Si no tiene caja abierta y no es admin, notificar y bloquear.
  notificationMessage.value =
    action === 'crear'
      ? 'No se puede crear una nueva venta. La caja diaria no está abierta.'
      : 'No se puede editar la venta. La caja diaria debe estar abierta.'
  notificationIsError.value = true
  mostrarModalNotificacion.value = true

  return false
}

function verDetalleVenta(ventaId: number) {
  selectedVentaId.value = ventaId
  mostrarModalDetalle.value = true
}

/**
 * Función que maneja el click del botón "Nueva Venta"
 */
function handleCrearVentaClick() {
  // Verificar restricción antes de abrir el modal
  if (!checkCajaRestriction('crear')) {
    return
  }
  abrirModalCrearVenta()
}

/**
 * Abre el modal de creación (solo si `handleCrearVentaClick` lo permite).
 */
function abrirModalCrearVenta() {
  formModalMode.value = 'create'
  ventaToEdit.value = null
  mostrarModalForm.value = true
}

/**
 * Función que maneja el click del botón "Editar Venta"
 */
function editarVenta(venta: VentaIndexResponse) {
  // Verificar restricción antes de abrir el modal
  if (!checkCajaRestriction('editar')) {
    return
  }

  formModalMode.value = 'edit'
  ventaToEdit.value = venta
  mostrarModalForm.value = true
}

// --- GESTIÓN DE ELIMINACIÓN (ANULACIÓN) CON MODALES ---

/**
 * Muestra el modal de confirmación para anular una venta.
 */
function confirmarEliminarVenta(ventaId: number) {
  // Opcional: Podrías aplicar la restricción aquí también si anular es considerado una edición crítica
  // if (!checkCajaRestriction('editar')) { return }

  ventaIdToDelete.value = ventaId
  mostrarModalConfirmacion.value = true
}

/**
 * Ejecuta la anulación (Soft Delete) después de la confirmación.
 */
async function ejecutarEliminarVenta() {
  if (ventaIdToDelete.value === null) return

  isDeleting.value = true
  mostrarModalConfirmacion.value = false

  try {
    await ventaService.deleteVenta(ventaIdToDelete.value)

    notificationMessage.value = `Venta #${ventaIdToDelete.value} anulada con éxito.`
    notificationIsError.value = false
    cargarVentas()
  } catch (error) {
    console.error('Error al anular venta:', error)

    notificationMessage.value = `Error al anular la Venta #${ventaIdToDelete.value}. Revisa la consola.`
    notificationIsError.value = true
  } finally {
    isDeleting.value = false
    mostrarModalNotificacion.value = true
    ventaIdToDelete.value = null
  }
}

// --- GESTIÓN DE NOTIFICACIONES EMITIDAS POR EL FORMULARIO ---
function handleNotificationFromForm(data: { message: string; isError: boolean }) {
  notificationMessage.value = data.message
  notificationIsError.value = data.isError
  mostrarModalNotificacion.value = true
}

// ----------------------------------------------------
// HOOKS
// ----------------------------------------------------
onMounted(() => {
  cargarVentas()
  // Verificar estado de caja al montar la vista
  if (!cajaStore.isCajaAbierta && !cajaStore.isLoading) {
    cajaStore.fetchCajaActiva()
  }
})
</script>

<style scoped>
/* Estilos específicos si son necesarios */
.table th,
.table td {
  vertical-align: middle;
}
</style>
