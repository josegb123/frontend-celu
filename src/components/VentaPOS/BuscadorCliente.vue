<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import ClienteService from '@/services/ClienteService'
import type { ICliente } from '@/interfaces/ICliente'

// --- 1. Definiciones de Props y Emits ---

const props = defineProps<{
  /**
   * Recibe el cliente actualmente seleccionado (ej. 'Consumidor Final') para mostrarlo.
   */
  currentCliente: ICliente
}>()

const emit = defineEmits<{
  /**
   * Emite el objeto Cliente seleccionado al componente padre.
   */
  (e: 'cliente-selected', cliente: ICliente): void
  /**
   * Se usa para cerrar el modal desde el interior, si es necesario.
   */
  (e: 'close'): void
}>()

// --- 2. Estado Local ---

const searchQuery = ref('')
const searchResults = ref<ICliente[]>([])
const recentClients = ref<ICliente[]>([]) // NUEVO: Lista de clientes recientes
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- 3. Lógica de Carga Inicial y Búsqueda ---

/**
 * NUEVO: Carga una lista predeterminada de clientes (ej. 10 más recientes).
 */
const fetchRecentClients = async () => {
  isLoading.value = true
  try {
    // Nota: Necesitarás implementar ClienteService.getRecent() en el backend.
    const data = await ClienteService.index()
    recentClients.value = data.data
  } catch (error) {
    errorMessage.value = 'Error al cargar clientes recientes.'
    console.error('Error en fetchRecentClients Cliente:', error)
  } finally {
    isLoading.value = false
  }
}

// Llamar a la carga inicial al montar el componente
onMounted(() => {
  fetchRecentClients()
})

const performSearch = async (query: string) => {
  searchResults.value = []
  errorMessage.value = null
  isLoading.value = false // Resetear isLoading

  // Mínimo de 2 caracteres para buscar (ajustado de 3 para darle más flexibilidad)
  if (query.length < 2) {
    // Si la búsqueda es muy corta o vacía, volvemos a mostrar la lista inicial
    // y detenemos la ejecución de la búsqueda API.
    return
  }

  // Si la consulta es válida, realizamos la búsqueda API
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

// Envuelve la función de búsqueda en un debounce de 500ms
const debouncedSearch = debounce(performSearch, 500)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

// --- 4. Lógica de Selección ---

const selectCliente = (cliente: ICliente) => {
  // 1. Emitir el cliente seleccionado al componente padre (PosView.vue)
  emit('cliente-selected', cliente)

  // 2. Limpiar el estado interno (opcional)
  searchQuery.value = ''
  searchResults.value = []

  // 3. Opcional: Volver a cargar la lista de recientes si el cliente seleccionado
  //    es relevante para el historial.
  // if(cliente.id !== 0) { // Si no es el consumidor final
  //    fetchRecentClients();
  // }
}
</script>

<template>
  <div class="cliente-search-container">
    <div
      class="alert alert-light border d-flex justify-content-between align-items-center mb-3 py-2"
    >
      <p class="mb-0 small">
        Cliente Actual: <span class="fw-bold text-primary">{{ props.currentCliente.nombre }}</span>
      </p>
      <small class="text-muted small">Cédula/RUC: {{ props.currentCliente.cedula || 'N/A' }}</small>
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
        <h6 class="list-group-item list-group-item-dark py-1 mb-0 small">Clientes Frecuentes:</h6>
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
</template>
