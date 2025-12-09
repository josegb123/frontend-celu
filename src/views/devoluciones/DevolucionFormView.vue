<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import DevolucionService, {
  // 1. TIPOS: CreateDevolucionData se actualiza para el nuevo payload
  type DevolucionItemPayload,
  type CreateDevolucionData,
} from '@/services/DevolucionService'
import VentaService, {
  type VentaIndexResponse,
  type VentaShowResponse,
} from '@/services/VentaService'
import { useNotification } from '@/composables/useNotification'
import { isAxiosError } from 'axios'
// ClienteService y ICliente ya no son necesarios para la lógica de asociación

// Notification composable
const { showNotification } = useNotification()

// 1. TIPOS CORREGIDOS: Estructura del ítem en la vista
interface ProductReturnListItem {
  detalle_venta_id: number // <-- NUEVO: ID del detalle de venta
  nombre_producto_historico: string
  precio_unitario: number
  cantidad_vendida: number // Cantidad vendida originalmente
  cantidad_devuelta_anterior: number // Cantidad ya devuelta (si existe)
  cantidad_disponible: number // Máximo que se puede devolver (vendida - devuelta_anterior)

  // Datos a enviar al servicio
  cantidad_a_devolver: number // <-- La cantidad que el usuario ingresa
  motivo: string
  notas: string
  selected: boolean
}

// TIPOS: DevolucionFormType simplificado
type DevolucionFormType = {
  venta_id: number | null
  metodo_reembolso: string
  items_devueltos: DevolucionItemPayload[]
}

const devolucionForm = ref<DevolucionFormType>({
  venta_id: null,
  metodo_reembolso: 'Efectivo', // Establecer un default o solicitar al usuario
  items_devueltos: [],
})

const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

// --- VENTA SEARCH ---
const ventaSearchQuery = ref('')
const searchedVentas = ref<VentaIndexResponse[]>([])
const selectedVenta = ref<VentaShowResponse | null>(null)
// --- CLIENTE SEARCH (ELIMINADO) ---

const productsForReturn = ref<ProductReturnListItem[]>([])

// --- WATCHERS ---

watch(ventaSearchQuery, async (newQuery) => {
  if (newQuery.length >= 1) {
    loading.value = true
    try {
      // Asumimos que VentaService.getIndex ahora devuelve el nombre del cliente
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

// --- RECENT SALES ---
const recentVentas = ref<VentaIndexResponse[]>([])
const loadingRecentVentas = ref(false)

const fetchRecentVentas = async () => {
  loadingRecentVentas.value = true
  try {
    const response = await VentaService.getIndex({ page: 1, per_page: 5 })
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

// --- SALE SELECTION ---
const selectVenta = async (venta: VentaIndexResponse) => {
  loading.value = true
  ventaSearchQuery.value = `Venta #${venta.venta_id} - Cliente: ${venta.cliente_nombre}`
  searchedVentas.value = []
  try {
    const fullVentaDetails = await VentaService.getShow(venta.venta_id)
    selectedVenta.value = fullVentaDetails
    devolucionForm.value.venta_id = fullVentaDetails.venta_id

    // 🎯 Mapeamos la data al nuevo formato
    productsForReturn.value = fullVentaDetails.detalles_completos
      // Filtramos los detalles que aún pueden ser devueltos
      .filter((detalle) => detalle.cantidad > (detalle.cantidad_devuelta ?? 0))
      .map((detalle) => ({
        detalle_venta_id: detalle.id, // <-- Usamos el ID del detalle, NO el producto_id
        nombre_producto_historico: detalle.nombre_producto_historico,
        precio_unitario: detalle.precio_unitario,
        cantidad_vendida: detalle.cantidad,
        cantidad_devuelta_anterior: detalle.cantidad_devuelta ?? 0,
        cantidad_disponible: detalle.cantidad - (detalle.cantidad_devuelta ?? 0),

        // Valores iniciales del formulario
        cantidad_a_devolver: detalle.cantidad - (detalle.cantidad_devuelta ?? 0), // Default al máximo
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

// --- COMPUTED PROPERTIES ---
const anyProductSelected = computed(() => {
  return productsForReturn.value.some((p: ProductReturnListItem) => p.selected)
})

// Validación: Solo se requiere Venta y productos seleccionados
const isFormValid = computed(() => {
  return devolucionForm.value.venta_id !== null && anyProductSelected.value
})

// --- FORM SUBMISSION ---
const handleSubmit = async () => {
  submitting.value = true
  error.value = null

  if (!devolucionForm.value.venta_id) {
    error.value = 'Debe seleccionar una venta.'
    submitting.value = false
    return
  }

  const itemsDevueltosPayload: DevolucionItemPayload[] = []
  let hasInputError = false

  productsForReturn.value.forEach((item: ProductReturnListItem) => {
    if (item.selected) {
      // 🎯 Validación de Cantidad y Motivo
      if (item.cantidad_a_devolver <= 0 || item.cantidad_a_devolver > item.cantidad_disponible) {
        hasInputError = true
        error.value = `La cantidad a devolver para ${item.nombre_producto_historico} es inválida.`
        return
      }
      if (!item.motivo) {
        hasInputError = true
        error.value = 'Por favor, complete el "Motivo" para todos los productos seleccionados.'
        return
      }

      itemsDevueltosPayload.push({
        detalle_venta_id: item.detalle_venta_id, // <-- Campo clave
        cantidad: item.cantidad_a_devolver, // <-- Cantidad ingresada
        motivo: item.motivo,
        notas: item.notas,
      })
    }
  })

  if (hasInputError) {
    submitting.value = false
    return
  }

  if (itemsDevueltosPayload.length === 0) {
    error.value = 'Debe seleccionar al menos un producto para devolver.'
    submitting.value = false
    return
  }

  const finalPayload: CreateDevolucionData = {
    venta_id: devolucionForm.value.venta_id,
    metodo_reembolso: devolucionForm.value.metodo_reembolso,
    items_devueltos: itemsDevueltosPayload,
  }

  try {
    await DevolucionService.createDevolucion(finalPayload)
    showNotification('Devolución registrada con éxito!', 'success')
    resetForm()
  } catch (err: unknown) {
    let message = 'Error desconocido al registrar la devolución.'
    if (isAxiosError(err) && err.response) {
      // Los errores de validación del servicio serán capturados aquí (ej: Stock insuficiente)
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
  devolucionForm.value = {
    venta_id: null,
    metodo_reembolso: 'Efectivo',
    items_devueltos: [],
  }
  selectedVenta.value = null
  productsForReturn.value = []
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
      <router-link :to="{ name: 'DevolucionGestion' }" class="btn btn-secondary mb-4 col-4">
        <i class="bi bi-arrow-left me-2"></i> Volver a Gestión de Devoluciones
      </router-link>
      <form @submit.prevent="handleSubmit">
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
              :disabled="loading"
              :class="{ 'is-valid': selectedVenta }"
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
            style="z-index: 1000; max-width: 700px"
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

        <div v-if="selectedVenta" class="mb-4 p-3 border rounded bg-light">
          <h5>Detalles de la Venta:</h5>
          <p><strong>ID Venta:</strong> {{ selectedVenta.venta_id }}</p>
          <p>
            <strong>Cliente Asociado:</strong>
            {{ selectedVenta.cliente_nombre ?? 'N/A' }}
          </p>
          <p><strong>Total Venta:</strong> ${{ selectedVenta.total_venta }}</p>

          <div class="mb-3">
            <label for="metodoReembolso" class="form-label">
              Método de Reembolso <span class="text-danger">*</span>
            </label>
            <select
              class="form-select"
              id="metodoReembolso"
              v-model="devolucionForm.metodo_reembolso"
              required
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Reverso a Tarjeta</option>
              <option value="Nota Crédito">Nota de Crédito (Saldo a Favor)</option>
            </select>
            <small class="form-text text-muted"
              >Seleccione cómo se realizará el egreso del dinero al cliente.</small
            >
          </div>

          <hr />
          <h5>Productos para Devolución Parcial (Disponibles):</h5>
          <div v-if="productsForReturn.length === 0" class="alert alert-info">
            Todos los productos de esta venta ya han sido devueltos.
          </div>
          <div v-else>
            <div
              v-for="(item, index) in productsForReturn"
              :key="item.detalle_venta_id"
              class="mb-3 p-3 border rounded"
              :class="{ 'bg-warning-subtle': item.selected }"
            >
              <div class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`select-${item.detalle_venta_id}`"
                  v-model="item.selected"
                />
                <label class="form-check-label" :for="`select-${item.detalle_venta_id}`">
                  <strong>{{ item.nombre_producto_historico }}</strong>
                  (Precio Uni: ${{ item.precio_unitario }})
                  <span class="badge bg-secondary ms-2"
                    >Disp. a Devolver: {{ item.cantidad_disponible }}</span
                  >
                  <span v-if="item.cantidad_devuelta_anterior > 0" class="badge bg-info ms-2">
                    Devuelto antes: {{ item.cantidad_devuelta_anterior }}
                  </span>
                </label>
              </div>

              <div v-if="item.selected" class="row g-2 mt-2">
                <div class="col-md-3">
                  <label :for="`cantidad-${index}`" class="form-label"
                    >Cantidad a Devolver <span class="text-danger">*</span></label
                  >
                  <input
                    type="number"
                    step="0.01"
                    class="form-control"
                    :id="`cantidad-${index}`"
                    v-model.number="item.cantidad_a_devolver"
                    :max="item.cantidad_disponible"
                    min="0.01"
                    required
                  />
                  <small
                    class="text-danger"
                    v-if="
                      item.cantidad_a_devolver > item.cantidad_disponible ||
                      item.cantidad_a_devolver <= 0
                    "
                  >
                    Cantidad inválida. Máx: {{ item.cantidad_disponible }}
                  </small>
                </div>
                <div class="col-md-5">
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

        <button type="submit" class="btn btn-primary mt-3" :disabled="submitting || !isFormValid">
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ submitting ? 'Procesando Devolución...' : 'Registrar Devolución' }}
        </button>
      </form>

      <div v-if="!selectedVenta" class="mt-4">
        <h5>Ventas Recientes:</h5>
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
                <td>{{ venta.cliente_nombre ?? 'Cliente Anónimo' }}</td>
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
