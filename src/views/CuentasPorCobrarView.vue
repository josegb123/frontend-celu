<template>
  <div class="cuentas-por-cobrar-view p-4">
    <h1 class="h3 mb-4 text-primary fw-bold">Gestión de Cuentas por Cobrar 💰</h1>

    <div class="card shadow-sm mb-4 p-3 border">
      <div class="d-flex flex-wrap gap-3 align-items-end">
        <div class="flex-shrink-0">
          <button class="btn btn-success btn-sm shadow-sm" @click="openAbonoModal(null)">
            <i class="bi bi-wallet2 me-1"></i> Registrar Abono (Global)
          </button>
        </div>

        <div class="flex-grow-1" style="max-width: 300px">
          <label for="inputCliente" class="form-label small mb-1">Buscar por Cliente</label>
          <input
            id="inputCliente"
            type="text"
            v-model="filtroCliente"
            class="form-control form-control-sm"
            placeholder="Nombre o RUC/CI del cliente"
          />
        </div>

        <div class="flex-grow-1" style="max-width: 200px">
          <label for="inputFecha" class="form-label small mb-1">Fecha de Vencimiento</label>
          <input
            id="inputFecha"
            type="date"
            v-model="filtroFecha"
            class="form-control form-control-sm"
          />
        </div>

        <div class="flex-grow-1" style="max-width: 150px">
          <label for="selectEstado" class="form-label small mb-1">Estado</label>
          <select id="selectEstado" v-model="filtroEstado" class="form-select form-select-sm">
            <option value="">Todos (Pendientes/Vencidas)</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vencida">Vencida</option>
            <option value="Saldada">Saldada</option>
          </select>
        </div>

        <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
          Limpiar Filtros
        </button>
      </div>
    </div>

    <CuentasTable
      :cuentas="cuentas"
      :loading="isLoading"
      @show-details="openDetailsModal"
      @register-abono="openAbonoModal"
    />

    <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
      <nav>
        <ul class="pagination pagination-sm">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">Anterior</button>
          </li>
          <li class="page-item disabled">
            <span class="page-link text-muted">Página {{ currentPage }} de {{ totalPages }}</span>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">Siguiente</button>
          </li>
        </ul>
      </nav>
    </div>

    <DetalleCuentaModal
      :cuenta="selectedCuenta"
      :show="showDetailsModal"
      @close="showDetailsModal = false"
      @register-abono="openAbonoModal"
    />

    <AbonoModal
      :cuenta="abonoTargetCuenta"
      :show="showAbonoModal"
      @close="showAbonoModal = false"
      @abono-success="handleAbonoSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'

// Importaciones de Componentes
import CuentasTable from '@/components/CuentasPorCobrar/CuentasTable.vue'
import DetalleCuentaModal from '@/components/CuentasPorCobrar/DetalleCuentaModal.vue'
import AbonoModal from '@/components/CuentasPorCobrar/AbonoModal.vue'

// Servicios e Interfaces
import CuentaPorCobrarService, {
  type CuentasPorCobrarParams,
} from '@/services/CuentaPorCobrarService'
import type { IAbono } from '@/interfaces/IAbono'
import type { dataCuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'

// --- ESTADO LOCAL ---
const cuentas = ref<dataCuentaPorCobrar[]>([])
const isLoading = ref(false)

// --- ESTADO DE PAGINACIÓN ---
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(15) // Cantidad de ítems por página

// --- ESTADO DE FILTROS ---
const filtroCliente = ref('')
const filtroFecha = ref('')
const filtroEstado = ref('')

// --- ESTADO DE MODALES ---
const showDetailsModal = ref(false)
const selectedCuenta = ref<dataCuentaPorCobrar | null>(null)

const showAbonoModal = ref(false)
const abonoTargetCuenta = ref<dataCuentaPorCobrar | null>(null)

// --- LÓGICA DE DATOS Y FILTROS ---

/**
 * Carga la lista de cuentas por cobrar desde el servicio con filtros y paginación.
 */
const fetchCuentas = async () => {
  isLoading.value = true

  const params: CuentasPorCobrarParams = {
    search: filtroCliente.value || undefined,
    fecha_vencimiento: filtroFecha.value || undefined,
    estado:
      (filtroEstado.value as 'Pendiente' | 'Vencida' | 'Saldada' | 'Anulada' | '') || undefined,
    page: currentPage.value,
    per_page: perPage.value,
  }

  try {
    const response = await CuentaPorCobrarService.getCuentas(params)
    cuentas.value = response.data
    currentPage.value = response.current_page
    totalPages.value = response.last_page
  } catch (e) {
    console.error('Error al cargar cuentas:', e)
    cuentas.value = []
  } finally {
    isLoading.value = false
  }
}

// Debounce la función de búsqueda por cliente
const debouncedFetch = debounce(fetchCuentas, 500)

// --- OBSERVADORES ---

// Observa cambios en los filtros y llama a fetchCuentas (debounced para el cliente)
watch([filtroFecha, filtroEstado], () => {
  currentPage.value = 1
  fetchCuentas()
})

watch(filtroCliente, () => {
  currentPage.value = 1
  debouncedFetch()
})

// --- MÉTODOS DE PAGINACIÓN Y FILTRO ---

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCuentas()
  }
}

const clearFilters = () => {
  filtroCliente.value = ''
  filtroFecha.value = ''
  filtroEstado.value = ''
  // El watch se encarga de llamar a fetchCuentas()
}

// --- HANDLERS DE MODALES ---

const openDetailsModal = (cuenta: dataCuentaPorCobrar) => {
  selectedCuenta.value = cuenta
  showDetailsModal.value = true
}

const openAbonoModal = (cuenta: dataCuentaPorCobrar | null) => {
  // Si se viene del botón global, la cuenta es null. Si se viene de la tabla, es la cuenta seleccionada.
  abonoTargetCuenta.value = cuenta

  // Si la cuenta tiene saldo cero, no abrir el modal
  if (cuenta && Number(cuenta.monto_pendiente) <= 0) {
    alert('La cuenta ya está saldada o no tiene monto pendiente.')
    return
  }

  showAbonoModal.value = true
  // Cerrar el modal de detalle si se abre el de abono desde allí
  if (showDetailsModal.value) {
    showDetailsModal.value = false
  }
}

/**
 * Se ejecuta al recibir el evento de éxito del AbonoModal.
 */
const handleAbonoSuccess = (abono: IAbono) => {
  // Recargar la lista de cuentas para ver el saldo actualizado y el estado (Saldada).
  fetchCuentas()

  // Si el modal de detalle estaba abierto y registramos un abono, lo reabrimos para ver el historial actualizado.
  if (selectedCuenta.value && selectedCuenta.value.id === abono.cuenta_por_cobrar_id) {
    // Asignamos la cuenta actualizada para que el modal de detalle la recargue
    selectedCuenta.value = {
      ...selectedCuenta.value,
      monto_pendiente: selectedCuenta.value?.monto_pendiente || '0.00',
    }
    showDetailsModal.value = true
  }
}

// --- CICLO DE VIDA ---
onMounted(fetchCuentas)
</script>

<style scoped>
.cuentas-por-cobrar-view {
  min-height: 100vh;
}
</style>
