<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from 'lodash' // Se asume que lodash está instalado
// Importamos las interfaces adaptadas del servicio
import ClienteService, { type Cliente } from '@/services/ClienteService'

// --- 1. Definiciones de Props y Emits ---

const props = defineProps<{
  /**
   * Recibe el cliente actualmente seleccionado (ej. 'Consumidor Final') para mostrarlo.
   */
  currentCliente: Cliente
}>()

// Define los eventos que emitirá el componente
const emit = defineEmits<{
  /**
   * Emite el objeto Cliente seleccionado al componente padre.
   */
  (e: 'cliente-selected', cliente: Cliente): void
  /**
   * Se usa para cerrar el modal desde el interior, si es necesario.
   */
  (e: 'close'): void
}>()

// --- 2. Estado Local ---

const searchQuery = ref('')
const searchResults = ref<Cliente[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- 3. Lógica de Búsqueda con Debounce ---

const performSearch = async (query: string) => {
  searchResults.value = []
  errorMessage.value = null

  // Mínimo de 3 caracteres para buscar, para no sobrecargar la API
  if (query.length < 3) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    // Usamos el servicio de clientes para la búsqueda
    const data = await ClienteService.searchClientes(query)
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

const selectCliente = (cliente: Cliente) => {
  // 1. Emitir el cliente seleccionado al componente padre (PosView.vue)
  emit('cliente-selected', cliente)

  // 2. Limpiar el estado interno y cerrar el modal
  searchQuery.value = ''
  searchResults.value = []
  emit('close')
}
</script>

<template>
  <div class="cliente-search-container">
    <div class="alert alert-light border d-flex justify-content-between align-items-center mb-4">
      <p class="lead mb-0">
        Cliente Actual: <span class="fw-bold text-primary">{{ props.currentCliente.nombre }}</span>
      </p>
      <small class="text-muted">Cédula/RUC: {{ props.currentCliente.ruc_ci || 'N/A' }}</small>
    </div>

    <h6 class="mb-3">Buscar nuevo cliente:</h6>

    <div class="input-group mb-3">
      <span class="input-group-text pos-bg-accent text-light" id="search-cliente-icon">
        <i class="bi bi-person-circle"></i>
      </span>
      <input
        type="text"
        v-model="searchQuery"
        class="form-control form-control-lg shadow-none"
        placeholder="Buscar por nombre o Cédula/RUC (min. 3 caracteres)"
        aria-label="Buscar cliente"
        aria-describedby="search-cliente-icon"
      />
    </div>

    <div class="search-results-area" style="min-height: 100px">
      <div v-if="isLoading" class="alert alert-info py-2 text-center mb-0">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Buscando clientes...
      </div>
      <div v-else-if="errorMessage" class="alert alert-danger py-2 mb-0">
        {{ errorMessage }}
      </div>

      <div
        v-else-if="searchQuery.length >= 3 && searchResults.length > 0"
        class="list-group shadow-sm"
      >
        <a
          v-for="cliente in searchResults"
          :key="cliente.id"
          href="#"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          @click.prevent="selectCliente(cliente)"
        >
          <div>
            <p class="mb-0 fw-bold text-dark">{{ cliente.nombre }}</p>
            <small class="text-muted">Cédula/RUC: {{ cliente.ruc_ci || 'N/A' }}</small>
          </div>
          <span class="badge bg-primary rounded-pill">Seleccionar</span>
        </a>
      </div>

      <div
        v-else-if="searchQuery.length >= 3 && !isLoading"
        class="alert alert-warning py-2 text-center mb-0"
      >
        No se encontraron clientes con el término "{{ searchQuery }}".
      </div>
    </div>
  </div>
</template>

<style scoped>
.pos-bg-accent {
  background-color: #6a0dad !important; /* Púrpura oscuro */
}
</style>
