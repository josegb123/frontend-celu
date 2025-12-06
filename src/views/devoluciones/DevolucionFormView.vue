<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import DevolucionService, {
  type ProductoDevueltoData,
  type CreateDevolucionData,
} from '@/services/DevolucionService'
import VentaService, {
  type VentaIndexResponse,
  type VentaShowResponse,
} from '@/services/VentaService'
import ClienteService, { type Cliente } from '@/services/ClienteService'
import { useNotification } from '@/composables/useNotification' // Assuming a notification composable exists
import { isAxiosError } from 'axios'

// Notification composable
const { showNotification } = useNotification()

// Form Data for submission
// Se añade cliente_id al formulario de devolución
const devolucionForm = ref<CreateDevolucionData>({
  venta_id: null as number | null,
  productos_devueltos: [],
})

// UI States
const loading = ref(false) // For general loading (e.g., sale search)
const submitting = ref(false) // For form submission
const error = ref<string | null>(null)

// Sale Search
const ventaSearchQuery = ref('')
const searchedVentas = ref<VentaIndexResponse[]>([])
const selectedVenta = ref<VentaShowResponse | null>(null)

// Client Search
const clienteSearchQuery = ref('')
const searchedClientes = ref<Cliente[]>([])
const selectedCliente = ref<Cliente | null>(null)
const loadingClientes = ref(false)
let isSelectingCliente = false // Flag to prevent watch trigger on select

// Products from the selected sale, with return-specific data
const productsForReturn = ref<
  {
    producto_id: number
    nombre_producto_historico: string
    precio_unitario: number
    id_unico_producto: string
    motivo: string
    notas: string
    selected: boolean
  }[]
>([])

// Watcher for sale search query
watch(ventaSearchQuery, async (newQuery) => {
  if (newQuery.length >= 1) {
    // Changed from 3 to 1
    loading.value = true
    try {
      // Assuming getIndex can search by query string (e.g., sale ID, client name etc.)
      const response = await VentaService.getIndex({ search: newQuery })
      searchedVentas.value = response.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al buscar las ventas.'
      console.error('Error searching ventas:', message)
      showNotification(message, 'error')
    } finally {
      loading.value = false
    }
  } else {
    searchedVentas.value = []
  }
})

// Watcher for client search query
watch(clienteSearchQuery, async (newQuery) => {
  if (isSelectingCliente) {
    return // Do not trigger search when a client is being selected
  }
  if (newQuery.length >= 2) {
    loadingClientes.value = true
    try {
      const response = await ClienteService.search(newQuery)
      searchedClientes.value = response
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error al buscar los clientes.'
      console.error('Error searching clientes:', message)
      showNotification(message, 'error')
    } finally {
      loadingClientes.value = false
    }
  } else {
    searchedClientes.value = []
  }
})

const recentVentas = ref<VentaIndexResponse[]>([])
const loadingRecentVentas = ref(false)

const fetchRecentVentas = async () => {
  loadingRecentVentas.value = true
  try {
    const response = await VentaService.getIndex({ page: 1, per_page: 5 }) // Fetch last 5 sales
    recentVentas.value = response.data
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ocurrió un error al cargar las ventas recientes.'

    console.error('Error fetching recent ventas:', message)
    showNotification(message, 'error')
  } finally {
    loadingRecentVentas.value = false
  }
}

onMounted(() => {
  fetchRecentVentas()
})

// Select Sale
const selectVenta = async (venta: VentaIndexResponse) => {
  loading.value = true
  ventaSearchQuery.value = `Venta #${venta.venta_id} - ${venta.cliente_nombre}`
  searchedVentas.value = []
  try {
    const fullVentaDetails = await VentaService.getShow(venta.venta_id)
    selectedVenta.value = fullVentaDetails
    devolucionForm.value.venta_id = fullVentaDetails.venta_id

    // Pre-fill client from the sale
    if (fullVentaDetails.cliente) {
      selectCliente(fullVentaDetails.cliente)
    } else {
      // Reset client if the sale has no client
      selectCliente(null)
    }

    // Map products from the sale for the return form
    productsForReturn.value = fullVentaDetails.detalles_completos.map((detalle) => ({
      producto_id: detalle.producto_id,
      nombre_producto_historico: detalle.nombre_producto_historico,
      precio_unitario: detalle.precio_unitario,
      id_unico_producto: '',
      motivo: '',
      notas: '',
      selected: false,
    }))
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ocurrió un error al cargar los detalles de la venta.'

    console.error('Error fetching venta details:', message)
    showNotification(message, 'error')
    selectedVenta.value = null
    devolucionForm.value.venta_id = null
    productsForReturn.value = []
  } finally {
    loading.value = false
  }
}

// Select Client
const selectCliente = (cliente: Cliente | null) => {
  isSelectingCliente = true // Set flag to prevent watcher from firing
  if (cliente) {
    selectedCliente.value = cliente
    clienteSearchQuery.value = `${cliente.nombre} (${cliente.ruc_ci ?? 'N/A'})`
  } else {
    selectedCliente.value = null
    clienteSearchQuery.value = ''
  }
  searchedClientes.value = []

  // Reset the flag after the DOM has updated, allowing for new searches
  // Using setTimeout to push this to the end of the execution queue
  setTimeout(() => {
    isSelectingCliente = false
  }, 0)
}

// Computed property to check if any product is selected for return
const anyProductSelected = computed(() => {
  return productsForReturn.value.some((p) => p.selected)
})

// Handle Form Submission
const handleSubmit = async () => {
  submitting.value = true
  error.value = null

  if (!devolucionForm.value.venta_id) {
    error.value = 'Debe seleccionar una venta.'
    submitting.value = false
    return
  }

  const productosDevueltosPayload: ProductoDevueltoData[] = []
  let hasInputError = false

  productsForReturn.value.forEach((item) => {
    if (item.selected) {
      // Validate required fields for selected items
      if (!item.id_unico_producto || !item.motivo) {
        hasInputError = true
        return
      }
      productosDevueltosPayload.push({
        producto_id: item.producto_id,
        id_unico_producto: item.id_unico_producto,
        cantidad: 1, // Always 1 per unique item entry in the backend
        motivo: item.motivo,
        costo_unitario: item.precio_unitario, // Using the sale price as cost for refund
        notas: item.notas,
      })
    }
  })

  if (hasInputError) {
    error.value =
      'Por favor, complete el "ID Único / Serie" y "Motivo" para todos los productos seleccionados.'
    submitting.value = false
    return
  }

  if (productosDevueltosPayload.length === 0) {
    error.value = 'Debe seleccionar al menos un producto para devolver.'
    submitting.value = false
    return
  }

  devolucionForm.value.productos_devueltos = productosDevueltosPayload

  // Añadir el cliente_id al payload si hay un cliente seleccionado
  const finalPayload: CreateDevolucionData = { ...devolucionForm.value }
  if (selectedCliente.value) {
    finalPayload.cliente_id = selectedCliente.value.id
  }
  try {
    await DevolucionService.createDevolucion(finalPayload)
    showNotification('Devolución registrada con éxito!', 'success')
    // Reset form after successful submission
    resetForm()
  } catch (err: unknown) {
    let message = 'Error desconocido al registrar la devolución.'
    if (isAxiosError(err) && err.response) {
      message = err.response.data.message || message
    } else if (err instanceof Error) {
      message = err.message
    }
    console.error('Error al registrar la devolución:', message)
    error.value = message
    showNotification('Error al registrar la devolución', 'error')
  } finally {
    submitting.value = false
  }
}

// Function to reset the form
const resetForm = () => {
  devolucionForm.value = { venta_id: null, productos_devueltos: [] }
  selectedVenta.value = null
  productsForReturn.value = []
  selectedCliente.value = null
  clienteSearchQuery.value = ''
  ventaSearchQuery.value = ''
  error.value = null
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Registrar Devolución</h2>
      <p class="text-muted mb-0">Gestión de devoluciones de productos por venta.</p>
    </div>

    <div class="card p-4">
      <form @submit.prevent="handleSubmit">
        <!-- Sale Search Section -->
        <div class="mb-4">
          <label for="ventaSearch" class="form-label"
            >Buscar Venta <span class="text-danger">*</span></label
          >
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              id="ventaSearch"
              v-model="ventaSearchQuery"
              placeholder="Buscar venta por ID, cliente, etc."
              autocomplete="off"
            />
            <button class="btn btn-outline-secondary" type="button" @click="resetForm()">
              Limpiar/Reiniciar
            </button>
          </div>
          <div v-if="loading" class="text-center mt-2">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div
            v-if="searchedVentas.length > 0"
            class="list-group mt-2 position-absolute w-100"
            style="z-index: 1000"
          >
            <button
              type="button"
              class="list-group-item list-group-item-action"
              v-for="venta in searchedVentas"
              :key="venta.venta_id"
              @click="selectVenta(venta)"
            >
              Venta #{{ venta.venta_id }} - Cliente: {{ venta.cliente_nombre }} (Total: ${{
                venta.total_venta
              }})
            </button>
          </div>
        </div>

        <!-- Selected Sale Details -->
        <div v-if="selectedVenta" class="mb-4 p-3 border rounded bg-light">
          <h5>Detalles de la Venta Seleccionada:</h5>
          <p><strong>ID Venta:</strong> {{ selectedVenta.venta_id }}</p>
          <div class="mb-3 position-relative">
            <label for="clienteSearch" class="form-label">Cliente Asociado a la Devolución</label>
            <input
              type="text"
              class="form-control"
              id="clienteSearch"
              v-model="clienteSearchQuery"
              placeholder="Buscar cliente para asociar a la devolución..."
              autocomplete="off"
            />
            <div v-if="loadingClientes" class="text-center mt-2">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Buscando...</span>
              </div>
            </div>
            <div
              v-if="searchedClientes.length > 0"
              class="list-group mt-1 position-absolute w-100"
              style="z-index: 999"
            >
              <button
                type="button"
                class="list-group-item list-group-item-action"
                v-for="cliente in searchedClientes"
                :key="cliente.id"
                @click="selectCliente(cliente)"
              >
                {{ cliente.nombre }} ({{ cliente.ruc_ci ?? 'N/A' }})
              </button>
            </div>
          </div>
          <p><strong>Total Venta:</strong> ${{ selectedVenta.total_venta }}</p>

          <hr />
          <h5>Productos de la Venta (Seleccionar para Devolver una Unidad):</h5>
          <div v-if="productsForReturn.length === 0" class="alert alert-info">
            Esta venta no tiene productos o los detalles no están disponibles.
          </div>
          <div v-else>
            <div
              v-for="(item, index) in productsForReturn"
              :key="`${item.producto_id}-${index}`"
              class="mb-3 p-3 border rounded"
              :class="{ 'bg-warning-subtle': item.selected }"
            >
              <div class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`select-${index}`"
                  v-model="item.selected"
                />
                <label class="form-check-label" :for="`select-${index}`">
                  <strong>{{ item.nombre_producto_historico }}</strong> (Precio Uni: ${{
                    item.precio_unitario
                  }})
                </label>
              </div>

              <div v-if="item.selected" class="row g-2 mt-2">
                <div class="col-md-4">
                  <label :for="`id_unico_producto-${index}`" class="form-label"
                    >ID Único / Serie <span class="text-danger">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control"
                    :id="`id_unico_producto-${index}`"
                    v-model="item.id_unico_producto"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label :for="`motivo-${index}`" class="form-label"
                    >Motivo <span class="text-danger">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control"
                    :id="`motivo-${index}`"
                    v-model="item.motivo"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label :for="`notas-${index}`" class="form-label">Notas (Opcional)</label>
                  <input
                    type="text"
                    class="form-control"
                    :id="`notas-${index}`"
                    v-model="item.notas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

        <button
          type="submit"
          class="btn btn-primary mt-3"
          :disabled="submitting || !anyProductSelected"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ submitting ? 'Procesando Devolución...' : 'Registrar Devolución' }}
        </button>
      </form>

      <!-- Recent Sales Table -->
      <div v-if="!selectedVenta" class="mt-4">
        <h5>Ventas Recientes para Acceso Rápido:</h5>
        <div v-if="loadingRecentVentas" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-1">Cargando ventas recientes...</p>
        </div>
        <div v-else-if="recentVentas.length === 0" class="alert alert-info text-center">
          No se encontraron ventas recientes.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm table-hover table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="venta in recentVentas" :key="venta.venta_id">
                <td>{{ venta.venta_id }}</td>
                <td>{{ venta.cliente_nombre }}</td>
                <td>${{ venta.total_venta }}</td>
                <td>{{ new Date(venta.created_at).toLocaleDateString() }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="selectVenta(venta)"
                  >
                    Seleccionar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-group {
  max-height: 300px;
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
