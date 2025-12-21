<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Gestión de Clientes 👨‍💼</h2>
      <div class="d-flex align-items-center">
        <div class="me-3 p-2 border rounded small">
          <span class="fw-bold me-2">Leyenda:</span>
          <span class="badge text-bg-info me-2">
            <i class="bi bi-person-badge me-1"></i> Es Aval
          </span>
          <span class="badge text-bg-warning me-2">
            <i class="bi bi-shield-lock me-1"></i> Tiene Aval
          </span>
          <span class="badge text-bg-success">
            <i class="bi bi-currency-dollar me-1"></i> Tiene Saldo
          </span>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i> Crear Nuevo Cliente
        </button>
      </div>
    </div>

    <div class="card p-4 shadow">
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Buscar por Nombre o Cédula..."
              v-model.lazy="searchQuery"
            />
            <button class="btn btn-outline-secondary" @click="fetchClientes()">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Cargando clientes...
              </td>
            </tr>
            <tr v-else-if="clientes.length === 0">
              <td colspan="6" class="text-center text-muted">No se encontraron clientes.</td>
            </tr>
            <tr v-else v-for="cliente in clientes" :key="cliente.id">
              <td>{{ cliente.id }}</td>
              <td>{{ cliente.cedula }}</td>
              <td>
                <span
                  v-if="hasSaldo(cliente)"
                  class="badge text-bg-success me-2"
                  title="Cliente tiene saldo pendiente"
                >
                  <i class="bi bi-currency-dollar"></i>
                </span>

                <span
                  v-if="cliente.is_aval"
                  class="badge text-bg-info me-2"
                  title="Este cliente es aval de otro"
                >
                  <i class="bi bi-person-badge"></i>
                </span>
                <span
                  v-else-if="cliente.aval_id"
                  class="badge text-bg-warning me-2"
                  title="Este cliente tiene un aval designado"
                >
                  <i class="bi bi-shield-lock"></i>
                </span>

                {{ cliente.nombre }} {{ cliente.apellidos }}
              </td>
              <td>{{ cliente.telefono }}</td>
              <td>{{ cliente.email }}</td>
              <td>
                <button class="btn btn-sm btn-info me-2" @click="openViewModal(cliente)">
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  class="btn btn-sm btn-warning me-2"
                  v-if="isAdmin"
                  @click="openEditModal(cliente)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  v-if="isAdmin"
                  @click="openConfirmationModal(cliente)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="d-flex justify-content-between align-items-center mt-3"
        v-if="pagination.last_page > 1"
      >
        <small class="text-muted">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} resultados
        </small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="goToPage(1)">Primero</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="goToPage(pagination.current_page - 1)">
                Anterior
              </button>
            </li>
            <li
              class="page-item"
              v-for="page in paginationPages"
              :key="page"
              :class="{ active: pagination.current_page === page }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <button class="page-link" @click="goToPage(pagination.current_page + 1)">
                Siguiente
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.current_page === pagination.last_page }"
            >
              <button class="page-link" @click="goToPage(pagination.last_page)">Último</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    :class="{ 'd-block show': showFormModal }"
    tabindex="-1"
    aria-labelledby="ClienteFormModalLabel"
    aria-hidden="true"
    v-if="showFormModal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="ClienteFormModalLabel">
            {{ isEditMode ? 'Editar Cliente' : 'Crear Cliente' }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeFormModal"
            aria-label="Close"
          ></button>
        </div>
        <form @submit.prevent="saveCliente">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger">{{ formError }}</div>

            <div class="row g-3">
              <div class="col-md-6">
                <label for="nombre" class="form-label"
                  >Nombre <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="currentCliente.nombre"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="apellidos" class="form-label">Apellidos</label>
                <input
                  type="text"
                  class="form-control"
                  id="apellidos"
                  v-model="currentCliente.apellidos"
                />
              </div>
              <div class="col-md-6">
                <label for="cedula" class="form-label">Cédula</label>
                <input
                  type="text"
                  class="form-control"
                  id="cedula"
                  v-model="currentCliente.cedula"
                />
              </div>
              <div class="col-md-6">
                <label for="telefono" class="form-label">Teléfono</label>
                <input
                  type="text"
                  class="form-control"
                  id="telefono"
                  v-model="currentCliente.telefono"
                />
              </div>
              <div class="col-md-12">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="currentCliente.email"
                />
              </div>
              <div class="col-md-12">
                <label for="direccion" class="form-label">Dirección</label>
                <textarea
                  class="form-control"
                  id="direccion"
                  v-model="currentCliente.direccion"
                ></textarea>
              </div>

              <div class="col-12 mt-4 border-top pt-3">
                <h6>Gestión de Aval</h6>
                <div class="mb-3 position-relative">
                  <label for="avalSearch" class="form-label"> Seleccionar Cliente como Aval </label>
                  <input
                    type="text"
                    class="form-control"
                    id="avalSearch"
                    v-model="avalSearchQuery"
                    placeholder="Buscar cliente por Nombre o Cédula..."
                    autocomplete="off"
                    :disabled="isSaving"
                  />
                  <div v-if="loadingAvalSearch" class="text-center mt-2">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                  </div>
                  <div
                    v-if="avalSearchResults.length > 0"
                    class="list-group mt-1 position-absolute w-100"
                    style="z-index: 1000"
                  >
                    <button
                      type="button"
                      class="list-group-item list-group-item-action"
                      v-for="aval in avalSearchResults"
                      :key="aval.id"
                      @click="selectAval(aval)"
                    >
                      {{ aval.nombre }} {{ aval.apellidos }} ({{ aval.cedula ?? 'N/A' }})
                      <span
                        v-if="aval.id && aval.id === currentCliente.id"
                        class="text-danger float-end"
                      >
                        (No válido)
                      </span>
                    </button>
                  </div>
                </div>
                <p v-if="currentAval" class="alert alert-info py-2">
                  Aval seleccionado:
                  <span class="fw-bold">{{ currentAval.nombre }} {{ currentAval.apellidos }}</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger float-end"
                    @click="clearAval"
                  >
                    Quitar Aval
                  </button>
                </p>
                <p v-else-if="currentCliente.aval_id === null" class="text-muted">
                  Este cliente no tiene un aval asignado.
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeFormModal"
              :disabled="isSaving"
            >
              Cerrar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditMode ? 'Guardar Cambios' : 'Crear Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showFormModal"></div>

  <div
    class="modal fade"
    :class="{ 'd-block show': showViewModal }"
    tabindex="-1"
    aria-labelledby="ClienteViewModalLabel"
    aria-hidden="true"
    v-if="showViewModal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content" v-if="viewCliente">
        <div class="modal-header">
          <h5 class="modal-title" id="ClienteViewModalLabel">Detalle del Cliente</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeViewModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <h4>{{ viewCliente.nombre }} {{ viewCliente.apellidos }}</h4>
          <hr />
          <dl class="row">
            <dt class="col-sm-4">Cédula:</dt>
            <dd class="col-sm-8">{{ viewCliente.cedula ?? 'N/A' }}</dd>

            <dt class="col-sm-4">Teléfono:</dt>
            <dd class="col-sm-8">{{ viewCliente.telefono ?? 'N/A' }}</dd>

            <dt class="col-sm-4">Email:</dt>
            <dd class="col-sm-8">{{ viewCliente.email ?? 'N/A' }}</dd>

            <dt class="col-sm-4">Dirección:</dt>
            <dd class="col-sm-8">{{ viewCliente.direccion ?? 'N/A' }}</dd>

            <dt class="col-sm-4">Cliente Aval:</dt>
            <dd class="col-sm-8">
              <span v-if="viewCliente.aval_nombre" class="fw-bold text-primary">
                {{ viewCliente.aval_nombre }} (ID: {{ viewCliente.aval_id }})
              </span>
              <span v-else-if="viewCliente.aval_id">
                ID: {{ viewCliente.aval_id }} (Nombre no encontrado)
              </span>
              <span v-else class="text-muted">No tiene aval asignado.</span>
            </dd>
          </dl>

          <h5 class="mt-4">Estado Financiero (Saldos)</h5>
          <div v-if="viewCliente.estado_financiero && viewCliente.estado_financiero.length > 0">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Monto Pendiente</th>
                  <th>Monto Original</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(saldo, index) in viewCliente.estado_financiero" :key="index">
                  <td>${{ saldo.monto_pendiente }}</td>
                  <td>${{ saldo.monto_original }}</td>
                  <td>
                    <span
                      :class="{
                        'badge bg-success': saldo.estado === 'Activo',
                        'badge bg-secondary': saldo.estado !== 'Activo',
                      }"
                      >{{ saldo.estado }}</span
                    >
                  </td>
                  <td>{{ saldo.motivo }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-success">
            El cliente no tiene saldos pendientes de cuentas por cobrar o devolver.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeViewModal">Cerrar</button>
        </div>
      </div>
      <div v-else class="modal-content">
        <div class="modal-body">Cargando detalles...</div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showViewModal"></div>

  <NotificationModal
    :isVisible="notification.visible"
    :message="notification.message"
    :isError="notification.isError"
    @close="closeNotification"
  />

  <ConfirmationModal
    :isVisible="confirmation.visible"
    :title="confirmation.title"
    :message="confirmation.message"
    :confirm-text="'Sí, Eliminar'"
    :is-processing="confirmation.isProcessing"
    @confirm="deleteClienteConfirmed"
    @cancel="closeConfirmationModal"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, watchEffect } from 'vue'
import ClienteService from '@/services/ClienteService'
import { isAxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import { type ICliente } from '@/interfaces/ICliente'

const authStore = useAuthStore() // Added
const isAdmin = computed(() => {
  // Added
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

interface StoreUpdateClientePayload {
  // Aquí usamos la forma flexible para el formulario
  cedula?: string | number | null
  nombre: string
  apellidos?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  aval_id?: number | null
}
// --------------------------------------------------------------------------

// --- ESTADO GLOBAL ---
const loading = ref(false)
const isSaving = ref(false)
const clientes = ref<ICliente[]>([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0,
})

const searchQuery = ref('')
const currentPage = ref(1)

// --- GESTIÓN DE MODALES ---
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const formError = ref<string | null>(null)
const currentCliente = ref<Partial<ICliente & StoreUpdateClientePayload>>({
  nombre: '',
  aval_id: null,
  cedula: null,
})
const viewCliente = ref<ICliente | null>(null)

// --- ESTADO DE NOTIFICACIÓN ---
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})

const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
  notification.value = {
    visible: true,
    message: message,
    isError: type === 'error',
  }
}

const closeNotification = () => {
  notification.value.visible = false
}

// --- ESTADO DE CONFIRMACIÓN (Eliminar) ---
const confirmation = ref({
  visible: false,
  title: '',
  message: '',
  isProcessing: false,
  clienteToDelete: null as ICliente | null,
})

// --- WATCHERS Y COMPUTED ---

// Controla la clase 'modal-open' en el body para evitar el scroll
watchEffect(() => {
  if (showFormModal.value || showViewModal.value || confirmation.value.visible) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

const paginationPages = computed(() => {
  const pages: number[] = []
  const maxPages = 5
  let start = Math.max(1, pagination.value.current_page - Math.floor(maxPages / 2))
  const end = Math.min(pagination.value.last_page, start + maxPages - 1)

  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const hasSaldo = (cliente: ICliente) => {
  return cliente.estado_financiero && cliente.estado_financiero.length > 0
}

// --- LÓGICA DE CONFIRMACIÓN (Eliminar) ---

const openConfirmationModal = (cliente: ICliente) => {
  confirmation.value = {
    visible: true,
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar (soft delete) al cliente ${cliente.nombre} ${cliente.apellidos}?`,
    isProcessing: false,
    clienteToDelete: cliente,
  }
}

const closeConfirmationModal = () => {
  confirmation.value.visible = false
  confirmation.value.clienteToDelete = null
}

const deleteClienteConfirmed = async () => {
  const cliente = confirmation.value.clienteToDelete
  if (!cliente) {
    closeConfirmationModal()
    return
  }

  confirmation.value.isProcessing = true
  try {
    await ClienteService.destroy(cliente.id)
    showNotification('Cliente eliminado (soft delete) con éxito.', 'success')
    await fetchClientes()
    closeConfirmationModal()
  } catch (err) {
    console.error('Error deleting cliente:', err)
    showNotification('Error al eliminar el cliente.', 'error')
    closeConfirmationModal()
  }
}

// --- LÓGICA DE AVAL ---
const avalSearchQuery = ref('')
const avalSearchResults = ref<ICliente[]>([])
const loadingAvalSearch = ref(false)
const currentAval = ref<ICliente | null>(null)
let isSelectingAval = false

watch(avalSearchQuery, async (newQuery) => {
  if (isSelectingAval) {
    return
  }
  if (newQuery.length >= 3) {
    loadingAvalSearch.value = true
    try {
      const response = await ClienteService.index(1, newQuery)

      avalSearchResults.value = response.data.filter((c) => c.id !== currentCliente.value.id)
    } catch (err) {
      console.error('Error searching aval:', err)
      showNotification('Error al buscar avales.', 'error')
    } finally {
      loadingAvalSearch.value = false
    }
  } else {
    avalSearchResults.value = []
  }
})

const selectAval = (cliente: ICliente) => {
  if (cliente.id === currentCliente.value.id) {
    showNotification('No puedes seleccionarte como tu propio aval.', 'warning')
    return
  }
  isSelectingAval = true
  currentAval.value = cliente
  avalSearchQuery.value = `${cliente.nombre} ${cliente.apellidos ?? ''} (${cliente.cedula ?? 'N/A'})`
  currentCliente.value.aval_id = cliente.id as number
  avalSearchResults.value = []

  setTimeout(() => {
    isSelectingAval = false
  }, 0)
}

const clearAval = () => {
  currentAval.value = null
  avalSearchQuery.value = ''
  currentCliente.value.aval_id = null
}

// --- MÉTODOS DE DATOS Y PAGINACIÓN ---

const fetchClientes = async () => {
  loading.value = true
  try {
    const response = await ClienteService.index(currentPage.value, searchQuery.value)

    const fetchedClientes: ICliente[] = response.data

    // logica para marcar aval
    const avalIds = new Set(fetchedClientes.map((c) => c.aval_id).filter((id) => id !== null))

    clientes.value = fetchedClientes.map((cliente) => ({
      ...cliente,
      // Si el ID de este cliente está en la lista de aval_id de OTROS clientes,
      // entonces este cliente es un aval.
      is_aval: avalIds.has(cliente.id as number),
    }))

    pagination.value = response.meta
  } catch (err) {
    console.error('Error fetching clientes:', err)
    showNotification('Error al cargar la lista de clientes.', 'error')
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchClientes()
  }
}

/**
 * Guardar/Actualizar Cliente
 */
const saveCliente = async () => {
  isSaving.value = true
  formError.value = null

  // 🎯 CORRECCIÓN TIPADO 2345: Aseguramos que el payload respete number | null
  const payload = {
    nombre: currentCliente.value.nombre as string,
    apellidos: currentCliente.value.apellidos === '' ? null : currentCliente.value.apellidos,
    cedula: currentCliente.value.cedula ?? null,
    telefono: currentCliente.value.telefono ?? null,
    email: currentCliente.value.email ?? null,
    direccion: currentCliente.value.direccion ?? null,
    aval_id: currentCliente.value.aval_id ?? null,
  } as StoreUpdateClientePayload

  try {
    if (isEditMode.value && currentCliente.value.id) {
      await ClienteService.update(currentCliente.value.id, payload)
      showNotification('Cliente actualizado con éxito!', 'success')
    } else {
      await ClienteService.store(payload)
      showNotification('Cliente creado con éxito!', 'success')
    }

    closeFormModal()
    await fetchClientes()
  } catch (err: unknown) {
    let message = 'Error al procesar la solicitud.'
    if (isAxiosError(err) && err.response && err.response.data) {
      const errors = err.response.data.errors
      if (errors) {
        message = Object.values(errors).flat().join('; ')
      } else {
        message = err.response.data.message || message
      }
    } else if (err instanceof Error) {
      message = err.message
    }
    formError.value = message
    showNotification(`Error: ${message}`, 'error')
  } finally {
    isSaving.value = false
  }
}

// --- MÉTODOS DE MODAL (sin cambios) ---

const openFormModal = () => {
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  formError.value = null
}

const openCreateModal = () => {
  isEditMode.value = false
  currentCliente.value = {
    nombre: '',
    cedula: null,
    apellidos: '',
    telefono: null,
    email: null,
    direccion: null,
    aval_id: null,
    id: undefined,
  }
  clearAval()
  openFormModal()
}

const openEditModal = (cliente: ICliente) => {
  isEditMode.value = true
  formError.value = null
  currentCliente.value = { ...cliente }

  clearAval()

  if (cliente.aval_id) {
    ClienteService.show(cliente.aval_id)
      .then((avalCliente) => {
        selectAval(avalCliente)
      })
      .catch((err) => {
        console.error('Error fetching aval details:', err)
        showNotification('No se pudieron cargar los detalles del aval.', 'warning')
      })
  }

  openFormModal()
}

const openViewModal = async (cliente: ICliente) => {
  viewCliente.value = null
  showViewModal.value = true

  try {
    // 1. Obtener los detalles completos del cliente
    const fullCliente = await ClienteService.show(cliente.id)

    // Inicializar el nombre del aval
    fullCliente.aval_nombre = ''

    // 2. Si el cliente tiene un aval (aval_id), buscamos sus detalles
    if (fullCliente.aval_id) {
      try {
        const avalDetails = await ClienteService.show(fullCliente.aval_id)

        // 3. Asignar el nombre completo al cliente
        fullCliente.aval_nombre = `${avalDetails.nombre} ${avalDetails.apellidos || ''}`
      } catch (err) {
        console.error('Error fetching aval details:', err)
        // Mostrar notificación de advertencia si no se puede obtener el aval
        showNotification('Advertencia: No se pudieron cargar los detalles del aval.', 'warning')
      }
    }

    viewCliente.value = fullCliente
  } catch (err) {
    console.error('Error fetching full client details:', err)
    showNotification('Error al cargar los detalles completos del cliente.', 'error')
    showViewModal.value = false
  }
}

const closeViewModal = () => {
  showViewModal.value = false
}

// --- HOOKS ---
onMounted(() => {
  fetchClientes()
})

// --------------------------------------------------------------------------
</script>

<style scoped>
/* Estilos necesarios para simular el comportamiento de Bootstrap modal sin JS */
.modal {
  background-color: transparent;
  pointer-events: none;
}
.modal.show {
  display: block;
  pointer-events: auto;
  overflow-y: auto;
}
.modal-backdrop.show {
  opacity: 0.5;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}
.list-group {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 0.25rem 0.25rem;
  background-color: #fff;
}
.list-group-item {
  cursor: pointer;
}
</style>
