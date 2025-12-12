<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import ClienteService from '@/services/ClienteService'
import type { ICliente } from '@/interfaces/ICliente'

// --- 1. Definiciones de Props y Emits ---

const props = defineProps<{
  /**
   * Indica si el modal debe estar visible.
   */
  isVisible: boolean
  /**
   * Recibe el cliente actualmente seleccionado para mostrarlo.
   */
  currentCliente: ICliente
}>()

const emit = defineEmits<{
  /**
   * Emite el objeto Cliente seleccionado al componente padre.
   */
  (e: 'cliente-selected', cliente: ICliente): void
  /**
   * Emite para indicar que el modal debe cerrarse (o actualizar isVisible a false).
   */
  (e: 'update:isVisible', value: boolean): void
}>()

// --- 2. Estado Local ---

const searchQuery = ref('')
const searchResults = ref<ICliente[]>([])
const recentClients = ref<ICliente[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- 3. Lógica de Carga Inicial y Búsqueda ---

const fetchRecentClients = async () => {
  isLoading.value = true
  try {
    const data = await ClienteService.index()
    recentClients.value = data.data
  } catch (error) {
    errorMessage.value = 'Error al cargar clientes recientes.'
    console.error('Error en fetchRecentClients Cliente:', error)
  } finally {
    isLoading.value = false
  }
}

const performSearch = async (query: string) => {
  searchResults.value = []
  errorMessage.value = null
  isLoading.value = false

  if (query.length < 2) {
    return
  }

  isLoading.value = true
  try {
    const data = await ClienteService.search(query)
    searchResults.value = data
  } catch (error) {
    errorMessage.value = 'Error al buscar clientes. Intente de nuevo.'
    console.error('Error en performSearch Cliente:', error)
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = debounce(performSearch, 500)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

// --- 4. Lógica de Selección y Cierre ---

const selectCliente = (cliente: ICliente) => {
  // 1. Emitir el cliente seleccionado al componente padre
  emit('cliente-selected', cliente)

  // 2. Cerrar el modal (usando el handler que ahora se llama close)
  closeModal()
}

const clienteGenerico: ICliente = {
  id: 0,
  nombre: 'Consumidor Final',
  cedula: 0,
  apellidos: '',
  telefono: '',
  email: '',
  direccion: '',
  aval_id: null,
  estado_financiero: [],
}

const closeModal = () => {
  // 1. Limpiar el estado interno
  searchQuery.value = ''
  searchResults.value = []

  // 2. Emitir el evento de cierre
  emit('update:isVisible', false)
}

// Cargar clientes al montar el componente.
onMounted(() => {
  fetchRecentClients()
})

// Opcional: Recargar la lista de recientes cada vez que se abre el modal
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      // Asegurar que la lista de recientes esté fresca
      fetchRecentClients()
    }
  },
)
</script>

<template>
  <div
    v-if="isVisible"
    class="modal d-block fade show"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.6); overflow-y: auto"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header text-bg-primary py-2">
          <h4 class="modal-title fs-5">Seleccionar Cliente</h4>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>

        <div class="modal-body p-3">
          <div
            class="alert alert-light border d-flex justify-content-between align-items-center mb-3 py-2"
          >
            <p class="mb-0 small">
              Cliente Actual:
              <span class="fw-bold text-primary">{{ props.currentCliente.nombre }}</span>
            </p>
            <small class="text-muted small"
              >Cédula/RUC: {{ props.currentCliente.cedula || 'N/A' }}</small
            >
          </div>

          <h6 class="mb-2 fs-6">Buscar o seleccionar cliente:</h6>

          <div class="input-group mb-3">
            <span class="input-group-text text-bg-primary" id="search-cliente-icon">
              <i class="bi bi-person-circle"></i>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              class="form-control form-control-sm shadow-none"
              placeholder="Buscar por nombre o Cédula/RUC (min. 2 caracteres)"
              aria-label="Buscar cliente"
              aria-describedby="search-cliente-icon"
            />
          </div>

          <div class="search-results-area" style="max-height: 250px; overflow-y: auto">
            <div
              v-if="isLoading && searchQuery.length < 2"
              class="alert alert-info py-2 text-center mb-0 small"
            >
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              Cargando clientes...
            </div>
            <div v-else-if="errorMessage" class="alert alert-danger py-2 mb-0 small">
              {{ errorMessage }}
            </div>

            <div
              v-else-if="searchQuery.length >= 2 && searchResults.length > 0"
              class="list-group list-group-flush shadow-sm"
            >
              <h6 class="list-group-item list-group-item-dark py-1 mb-0 small">
                Resultados de Búsqueda:
              </h6>
              <a
                v-for="cliente in searchResults"
                :key="cliente.id"
                href="#"
                class="list-group-item list-group-item-action list-group-item-light d-flex justify-content-between align-items-center py-2"
                @click.prevent="selectCliente(cliente)"
              >
                <div>
                  <p class="mb-0 fw-bold small">{{ cliente.nombre }}</p>
                  <small class="text-muted small">Cédula/RUC: {{ cliente.cedula || 'N/A' }}</small>
                </div>
                <span class="badge text-bg-primary rounded-pill small">Seleccionar</span>
              </a>
            </div>

            <div
              v-else-if="searchQuery.length < 2 && recentClients.length > 0 && !isLoading"
              class="list-group list-group-flush shadow-sm"
            >
              <h6 class="list-group-item list-group-item-dark py-1 mb-0 small">
                Clientes Frecuentes:
              </h6>
              <a
                v-for="cliente in recentClients"
                :key="cliente.id"
                href="#"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                :class="{ 'list-group-item-warning': cliente.id === props.currentCliente.id }"
                @click.prevent="selectCliente(cliente)"
              >
                <div>
                  <p class="mb-0 fw-bold small">{{ cliente.nombre }}</p>
                  <small class="text-muted small">Cédula/RUC: {{ cliente.cedula || 'N/A' }}</small>
                </div>
                <span
                  v-if="cliente.id !== props.currentCliente.id"
                  class="badge text-bg-primary rounded-pill small"
                  >Seleccionar</span
                >
                <span v-else class="badge text-bg-success rounded-pill small">Actual</span>
              </a>
            </div>

            <div
              v-else-if="searchQuery.length >= 2 && !isLoading && searchResults.length === 0"
              class="alert alert-warning py-2 text-center mb-0 small"
            >
              No se encontraron clientes con el término "{{ searchQuery }}".
            </div>

            <div
              v-else-if="searchQuery.length < 2 && recentClients.length === 0 && !isLoading"
              class="alert alert-secondary py-2 text-center mb-0 small"
            >
              No hay clientes recientes para mostrar. Use la búsqueda.
            </div>
          </div>
        </div>

        <div class="modal-footer d-flex justify-content-between py-2">
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="closeModal">
            Cerrar
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm"
            @click="selectCliente(clienteGenerico)"
          >
            Seleccionar Consumidor Final
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
