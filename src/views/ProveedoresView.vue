<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
// Asume que proveedorService está accesible en tu entorno de módulo
// Esto es necesario para simular las llamadas a la API
import { proveedorService } from '@/services/proveedorService'

// ===============================================
// 1. INTERFACES NECESARIAS (Normalmente importadas)
// ===============================================
interface Proveedor {
  id: number
  nombreComercial: string
  nombreContacto: string | null
  identificacion: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  notas: string | null
  activo: boolean
  fechaRegistro: string
}

interface ProveedorDTO {
  nombre_comercial: string
  nombre_contacto?: string | null
  identificacion?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  ciudad?: string | null
  notas?: string | null
  activo: boolean
}

interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

interface ProveedorQueryParams {
  page?: number
  per_page?: number
  search?: string
  activo?: boolean
}

// ===============================================
// 2. ESTADO REACTIVO
// ===============================================

const loading = ref(false)
const proveedores = ref<Proveedor[]>([])
const error = ref<string | null>(null)

// Estado de paginación y filtros
const pagination = reactive({
  page: 1,
  per_page: 10,
  search: '',
  total: 0,
  last_page: 1,
  current_page: 1,
})

// Estado del formulario (para modal/edición)
const showFormModal = ref(false)
const formTitle = computed(() => (formState.id ? 'Editar Proveedor' : 'Crear Proveedor'))
const initialFormState: ProveedorDTO & { id: number | null } = {
  id: null,
  nombre_comercial: '',
  nombre_contacto: null,
  identificacion: null,
  telefono: null,
  email: null,
  direccion: null,
  ciudad: null,
  notas: null,
  activo: true,
}
// Usamos Object.assign para asegurar que Vue trackee todos los campos del estado inicial
const formState = reactive({ ...initialFormState })

// ===============================================
// 3. LÓGICA DE DATOS Y ACCIONES
// ===============================================

/**
 * Carga la lista de proveedores desde la API, aplicando paginación y búsqueda.
 */
async function fetchProveedores(page: number = pagination.page) {
  loading.value = true
  error.value = null

  const params: ProveedorQueryParams = {
    page: page,
    per_page: pagination.per_page,
    search: pagination.search,
    // activo: true, // Si se necesita un filtro de activo
  }

  try {
    // Simulando una llamada a la API
    // Si proveedorService.getAll lanza un error, se capturará
    const response: PaginatedResponse<Proveedor> = await proveedorService.getAll(params)
    proveedores.value = response.data
    pagination.total = response.total
    pagination.last_page = response.last_page
    pagination.current_page = response.current_page
    pagination.page = response.current_page // Asegura que la página actual se refleje
  } catch (err: any) {
    // Manejo de errores más claro
    error.value = 'No se pudieron cargar los proveedores. Por favor, intente de nuevo.'
    console.error('Error en fetchProveedores:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Maneja el cambio de página y ejecuta la búsqueda.
 */
function handlePageChange(newPage: number) {
  if (newPage > 0 && newPage <= pagination.last_page && newPage !== pagination.page) {
    pagination.page = newPage
    fetchProveedores(newPage)
  }
}

/**
 * Inicia la búsqueda desde la página 1.
 */
function searchProveedores() {
  fetchProveedores(1)
}

/**
 * Abre el formulario para crear un nuevo proveedor.
 */
function openCreateForm() {
  // Resetea el estado a los valores iniciales
  Object.assign(formState, initialFormState)
  showFormModal.value = true
}

/**
 * Abre el formulario para editar un proveedor existente.
 */
function openEditForm(proveedor: Proveedor) {
  // Mapeo de camelCase a snake_case para ProveedorDTO (si es necesario)
  Object.assign(formState, {
    id: proveedor.id,
    nombre_comercial: proveedor.nombreComercial,
    nombre_contacto: proveedor.nombreContacto,
    identificacion: proveedor.identificacion,
    telefono: proveedor.telefono,
    email: proveedor.email,
    direccion: proveedor.direccion,
    ciudad: proveedor.ciudad,
    notas: proveedor.notas,
    activo: proveedor.activo,
  })
  showFormModal.value = true
}

/**
 * Guarda o actualiza el proveedor.
 */
async function saveProveedor() {
  // Simple validación
  if (!formState.nombre_comercial) {
    alert('El Nombre Comercial es obligatorio.')
    return
  }

  // Crear un DTO limpio para la API
  const dataToSend: ProveedorDTO = {
    nombre_comercial: formState.nombre_comercial,
    nombre_contacto: formState.nombre_contacto,
    identificacion: formState.identificacion,
    telefono: formState.telefono,
    email: formState.email,
    direccion: formState.direccion,
    ciudad: formState.ciudad,
    notas: formState.notas,
    activo: formState.activo,
  }

  try {
    loading.value = true
    if (formState.id) {
      await proveedorService.update(formState.id, dataToSend)
    } else {
      await proveedorService.create(dataToSend)
    }

    // Cierra el modal, resetea el estado y recarga los datos
    showFormModal.value = false
    Object.assign(formState, initialFormState)
    await fetchProveedores(pagination.page) // Recarga la página actual para ver los cambios
  } catch (err: any) {
    console.error('Error al guardar proveedor:', err)
    alert('Error al guardar el proveedor. Revisa la consola para más detalles.')
  } finally {
    loading.value = false
  }
}

/**
 * Elimina un proveedor.
 */
async function deleteProveedor(id: number) {
  if (
    confirm('¿Estás seguro de que quieres eliminar este proveedor? Esta acción es irreversible.')
  ) {
    try {
      loading.value = true
      await proveedorService.delete(id)
      await fetchProveedores() // Recarga la lista
    } catch (err: any) {
      console.error('Error al eliminar proveedor:', err)
      alert('Error al eliminar el proveedor. Revisa la consola.')
    } finally {
      loading.value = false
    }
  }
}

// ===============================================
// 4. CICLO DE VIDA
// ===============================================

// Cargar datos al montar el componente
onMounted(() => {
  fetchProveedores()
})
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4 border-bottom pb-2">Gestión de Proveedores</h1>

    <div class="card mb-4 shadow-sm">
      <div
        class="card-body d-flex flex-column flex-sm-row justify-content-between align-items-center"
      >
        <div class="w-100 me-sm-3 mb-3 mb-sm-0">
          <div class="input-group">
            <input
              v-model="pagination.search"
              @keyup.enter="searchProveedores"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, identificación o email..."
            />
            <button class="btn btn-outline-secondary" type="button" @click="searchProveedores">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>

        <button
          @click="openCreateForm"
          class="btn btn-primary w-100 w-sm-auto text-nowrap"
          data-bs-toggle="modal"
          data-bs-target="#proveedorModal"
        >
          <i class="bi bi-plus-lg me-1"></i> + Nuevo Proveedor
        </button>
      </div>
    </div>

    <div v-if="loading && proveedores.length === 0" class="text-center p-5 card shadow-sm">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando proveedores...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else class="table-responsive card shadow-lg">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col">Compañía</th>
            <th scope="col" class="d-none d-sm-table-cell">Contacto</th>
            <th scope="col" class="d-none d-md-table-cell">Email / Teléfono</th>
            <th scope="col" class="text-center d-none d-md-table-cell">Estado</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proveedor in proveedores" :key="proveedor.id">
            <td>
              <div class="fw-bold">{{ proveedor.nombreComercial }}</div>
              <small class="text-muted">{{ proveedor.identificacion || 'N/A' }}</small>
            </td>
            <td class="d-none d-sm-table-cell">
              <div>{{ proveedor.nombreContacto || 'N/A' }}</div>
              <small class="text-muted">{{ proveedor.ciudad || 'Sin Ciudad' }}</small>
            </td>
            <td class="d-none d-md-table-cell">
              <p class="mb-0">{{ proveedor.email || 'Sin email' }}</p>
              <small class="text-muted">{{ proveedor.telefono || 'Sin teléfono' }}</small>
            </td>
            <td class="text-center d-none d-md-table-cell">
              <span :class="['badge', proveedor.activo ? 'bg-success' : 'bg-danger']">
                {{ proveedor.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="text-end text-nowrap">
              <button
                @click="openEditForm(proveedor)"
                class="btn btn-sm btn-info text-white me-2"
                title="Editar"
              >
                <i class="bi bi-pencil"></i> <span class="d-none d-lg-inline">Editar</span>
              </button>
              <button
                @click="deleteProveedor(proveedor.id)"
                class="btn btn-sm btn-danger"
                title="Eliminar"
              >
                <i class="bi bi-trash"></i> <span class="d-none d-lg-inline">Eliminar</span>
              </button>
            </td>
          </tr>
          <tr v-if="proveedores.length === 0 && !loading && !error">
            <td colspan="5" class="text-center py-4 text-muted">
              No se encontraron proveedores que coincidan con la búsqueda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pagination.total > 0"
      class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 p-3 bg-white border rounded shadow-sm"
    >
      <p class="text-muted small mb-2 mb-md-0">
        Mostrando
        <span class="fw-bold">{{ (pagination.page - 1) * pagination.per_page + 1 }}</span>
        a
        <span class="fw-bold">{{
          Math.min(pagination.page * pagination.per_page, pagination.total)
        }}</span>
        de
        <span class="fw-bold">{{ pagination.total }}</span>
        resultados
      </p>

      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(pagination.page - 1)"
              aria-label="Anterior"
            >
              Anterior
            </a>
          </li>

          <li class="page-item active">
            <span class="page-link">{{ pagination.page }} / {{ pagination.last_page }}</span>
          </li>

          <li class="page-item" :class="{ disabled: pagination.page === pagination.last_page }">
            <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(pagination.page + 1)"
              aria-label="Siguiente"
            >
              Siguiente
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div
    v-if="showFormModal"
    class="modal d-block"
    id="proveedorModal"
    tabindex="-1"
    aria-labelledby="proveedorModalLabel"
    aria-modal="true"
    role="dialog"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form @submit.prevent="saveProveedor">
          <div class="modal-header">
            <h5 class="modal-title" id="proveedorModalLabel">{{ formTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="showFormModal = false"
              :disabled="loading"
              aria-label="Cerrar"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="nombreComercial" class="form-label"
                  >Nombre Comercial <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  id="nombreComercial"
                  v-model.trim="formState.nombre_comercial"
                  required
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label for="nombreContacto" class="form-label">Nombre Contacto</label>
                <input
                  type="text"
                  id="nombreContacto"
                  v-model.trim="formState.nombre_contacto"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label for="identificacion" class="form-label">Identificación</label>
                <input
                  type="text"
                  id="identificacion"
                  v-model.trim="formState.identificacion"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model.trim="formState.email"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label for="telefono" class="form-label">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  v-model.trim="formState.telefono"
                  class="form-control"
                />
              </div>

              <div class="col-md-6">
                <label for="ciudad" class="form-label">Ciudad</label>
                <input
                  type="text"
                  id="ciudad"
                  v-model.trim="formState.ciudad"
                  class="form-control"
                />
              </div>

              <div class="col-12">
                <label for="direccion" class="form-label">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  v-model.trim="formState.direccion"
                  class="form-control"
                />
              </div>

              <div class="col-12">
                <label for="notas" class="form-label">Notas</label>
                <textarea
                  id="notas"
                  v-model.trim="formState.notas"
                  rows="3"
                  class="form-control"
                ></textarea>
              </div>

              <div class="col-12">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="activo"
                    v-model="formState.activo"
                  />
                  <label class="form-check-label" for="activo"> Proveedor Activo </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showFormModal = false"
              :disabled="loading"
            >
              Cerrar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ formState.id ? 'Actualizar' : 'Crear' }} Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
