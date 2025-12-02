<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Importar los nuevos componentes atomizados
import ProveedorFormModal from '@/components/Proveedores/ProveedorFormModal.vue'
import ProveedorToolbar from '@/components/Proveedores/ProveedorToolbar.vue'
import ProveedoresTable from '@/components/Proveedores/ProveedoresTable.vue'
// Asegúrate de que proveedorService sigue siendo accesible
import { proveedorService } from '@/services/proveedorService'

// ===============================================
// 1. INTERFACES (Mantener en el orquestador)
// ===============================================
// Las interfaces Proveedor, ProveedorDTO, PaginatedResponse, ProveedorQueryParams
// se mantienen aquí o se importan desde un archivo de tipos común.

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
// ... [Otras interfaces DTO, PaginatedResponse, etc.] ...
interface PaginatedResponse<T> {
  data: T[]
  total: number
  last_page: number
  current_page: number
}

// Estado Inicial para el Formulario (Se pasa al modal)
const initialFormState = {
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

// ===============================================
// 2. ESTADO REACTIVO CENTRAL
// ===============================================

const loading = ref(false)
const error = ref<string | null>(null)
const proveedores = ref<Proveedor[]>([])

// Estado para la Pagina y Búsqueda (Controlado desde el Toolbar)
const pagination = reactive({
  page: 1,
  per_page: 10,
  search: '', // Lo maneja ProveedorToolbar
  total: 0,
  last_page: 1,
  current_page: 1,
})

// Estado del Modal (Controlado desde el orquestador)
const showFormModal = ref(false)
const formData = reactive({ ...initialFormState }) // Datos para edición/creación

// ===============================================
// 3. LÓGICA DE DATOS Y MANEJO DE EVENTOS
// ===============================================

/**
 * Carga la lista de proveedores (Función central de la API).
 */
async function fetchProveedores(_page: number = pagination.page) {
  loading.value = true
  error.value = null

  const params = {
    page: _page,
    per_page: pagination.per_page,
    search: pagination.search,
  }

  try {
    const response: PaginatedResponse<Proveedor> = await proveedorService.getAll(params)
    proveedores.value = response.data
    pagination.total = response.total
    pagination.last_page = response.last_page
    pagination.current_page = response.current_page
    pagination.page = response.current_page
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = 'Error al cargar: ' + err.message
    } else {
      error.value = 'Error al cargar: Error desconocido.'
    }
  } finally {
    loading.value = false
  }
}

/**
 * 📢 EVENTO: Recibido desde ProveedorToolbar al pulsar Enter o el botón buscar.
 */
function handleSearchConfirmed() {
  // Siempre reinicia a la página 1 cuando se ejecuta una nueva búsqueda
  fetchProveedores(1)
}

/**
 * 📢 EVENTO: Recibido desde ProveedorToolbar al pulsar "Nuevo Proveedor".
 */
function handleOpenCreateForm() {
  Object.assign(formData, initialFormState) // Limpiar formulario
  showFormModal.value = true
}

/**
 * 📢 EVENTO: Recibido desde ProveedoresTable al pulsar "Editar".
 */
function handleEditProveedor(proveedor: Proveedor) {
  // Mapear los datos del proveedor a formData (similar a openEditForm original)
  Object.assign(formData, {
    id: proveedor.id,
    nombre_comercial: proveedor.nombreComercial,
    nombre_contacto: proveedor.nombreContacto,
    // ... mapear todos los campos
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
 * 📢 EVENTO: Recibido desde ProveedoresTable al pulsar "Eliminar".
 */
async function handleDeleteProveedor(id: number) {
  if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
    try {
      loading.value = true
      await proveedorService.delete(id)
      await fetchProveedores() // Recarga la lista
    } catch {
      alert('Error al eliminar.')
    } finally {
      loading.value = false
    }
  }
}

/**
 * 📢 EVENTO: Recibido desde ProveedorFormModal al guardar exitosamente.
 */
function handleFormSaved() {
  showFormModal.value = false
  // Recargar la lista, manteniendo la página actual
  fetchProveedores(pagination.current_page)
}

/**
 * Maneja el cambio de página en el paginador.
 */
function handlePageChange(newPage: number) {
  if (newPage > 0 && newPage <= pagination.last_page) {
    fetchProveedores(newPage)
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchProveedores()
})
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4 border-bottom pb-2">Gestión de Proveedores</h1>

    <ProveedorToolbar
      v-model:search-value="pagination.search"
      @search-confirmed="handleSearchConfirmed"
      @open-create="handleOpenCreateForm"
    />

    <div v-if="loading && proveedores.length === 0" class="text-center p-5 card shadow-sm">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando proveedores...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <ProveedoresTable
      v-else
      :proveedores="proveedores"
      @edit="handleEditProveedor"
      @delete="handleDeleteProveedor"
    />

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
            <a class="page-link" href="#" @click.prevent="handlePageChange(pagination.page - 1)"
              >Anterior</a
            >
          </li>
          <li class="page-item active">
            <span class="page-link">{{ pagination.page }} / {{ pagination.last_page }}</span>
          </li>
          <li class="page-item" :class="{ disabled: pagination.page === pagination.last_page }">
            <a class="page-link" href="#" @click.prevent="handlePageChange(pagination.page + 1)"
              >Siguiente</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <ProveedorFormModal
    v-model:visible="showFormModal"
    :initial-data="formData"
    :is-loading="loading"
    @saved="handleFormSaved"
  />
</template>
