<template>
  <div class="movimientos-view p-4">
    <h1 class="h3 mb-4 text-primary fw-bold">Gestión de Movimientos Financieros 💵</h1>

    <div class="card shadow-sm mb-4 p-3 bg-light">
      <div class="d-flex flex-wrap align-items-center justify-content-between">
        <div class="d-flex gap-4">
          <p class="mb-0 small">
            <span class="fw-bold text-success">Total Ingresos:</span>
            ${{ formatCurrency(resumen.total_ingresos) }}
          </p>
          <p class="mb-0 small">
            <span class="fw-bold text-danger">Total Egresos:</span>
            ${{ formatCurrency(resumen.total_egresos) }}
          </p>
          <p class="mb-0 small">
            <span class="fw-bold" :class="balanceClass">Balance Neto:</span>
            ${{ formatCurrency(resumen.balance_neto) }}
          </p>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success shadow-sm" @click="openModal('Ingreso')">
            <i class="bi bi-plus-circle me-1"></i> Registrar Ingreso
          </button>
          <button class="btn btn-sm btn-danger shadow-sm" @click="openModal('Egreso')">
            <i class="bi bi-dash-circle me-1"></i> Registrar Egreso
          </button>
        </div>
      </div>
    </div>

    <div class="card shadow-sm mb-4 p-3">
      <div class="d-flex flex-wrap gap-3 align-items-end">
        <div class="flex-shrink-0">
          <label for="selectTipo" class="form-label small mb-1">Tipo</label>
          <select id="selectTipo" v-model="filtroTipo" class="form-select form-select-sm">
            <option value="">Todos</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Egreso">Egreso</option>
          </select>
        </div>

        <div class="flex-grow-1" style="max-width: 180px">
          <label for="fechaInicio" class="form-label small mb-1">Desde</label>
          <input
            id="fechaInicio"
            type="date"
            v-model="filtroFechaInicio"
            class="form-control form-control-sm"
          />
        </div>
        <div class="flex-grow-1" style="max-width: 180px">
          <label for="fechaFin" class="form-label small mb-1">Hasta</label>
          <input
            id="fechaFin"
            type="date"
            v-model="filtroFechaFin"
            class="form-control form-control-sm"
          />
        </div>

        <div class="flex-grow-1" style="max-width: 300px">
          <label for="inputSearch" class="form-label small mb-1"
            >Buscar (Descripción/Referencia)</label
          >
          <input
            id="inputSearch"
            type="text"
            v-model="filtroSearch"
            class="form-control form-control-sm"
            placeholder="Ej: Pago de salarios"
          />
        </div>

        <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
          Limpiar Filtros
        </button>
      </div>
    </div>

    <MovimientosTable :movimientos="movimientos" :loading="isLoading" />

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

    <MovimientoModal
      :tipo="modalTipo"
      :show="showModal"
      @close="showModal = false"
      @movimiento-success="handleMovimientoSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash'

// Componentes
import MovimientoModal from '@/components/Movimiento/MovimientoModal.vue'
import MovimientosTable from '@/components/Movimiento/MovimientosTable.vue'

// Servicios e Interfaces
import MovimientoFinancieroService from '@/services/MovimientoFinancieroService'
import type {
  MovimientoFinanciero,
  MovimientoFinancieroParams,
  TipoMovimiento,
} from '@/interfaces/IMovimientoFinanciero'

// --- ESTADO LOCAL DE DATOS ---
const movimientos = ref<MovimientoFinanciero[]>([])
const isLoading = ref(false)

// --- ESTADO DE PAGINACIÓN ---
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(20)

// --- ESTADO DE FILTROS ---
const filtroTipo = ref<TipoMovimiento | ''>('')
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')
const filtroSearch = ref('')

// --- ESTADO DE MODAL ---
const showModal = ref(false)
const modalTipo = ref<TipoMovimiento>('Ingreso') // Determina si es Ingreso o Egreso

// --- ESTADO DE RESUMEN (Simulado por ahora, implementa getResumen real si es necesario) ---
const resumen = ref({
  total_ingresos: 0,
  total_egresos: 0,
  balance_neto: 0,
})

const balanceClass = computed(() => {
  if (resumen.value.balance_neto > 0) return 'text-success'
  if (resumen.value.balance_neto < 0) return 'text-danger'
  return 'text-secondary'
})

// --- LÓGICA DE DATOS Y FILTROS ---

/**
 * Carga la lista de movimientos financieros.
 */
const fetchMovimientos = async () => {
  isLoading.value = true

  // Crear objeto de parámetros para la API
  const params: MovimientoFinancieroParams & { page: number; per_page: number } = {
    tipo: filtroTipo.value || undefined,
    fecha_inicio: filtroFechaInicio.value || undefined,
    fecha_fin: filtroFechaFin.value || undefined,
    search: filtroSearch.value || undefined,
    page: currentPage.value,
    per_page: perPage.value,
  }

  try {
    const response = await MovimientoFinancieroService.getMovimientos(params)
    movimientos.value = response.data
    currentPage.value = response.meta.current_page
    totalPages.value = response.meta.last_page

    calculateLocalResumen(response.data)
  } catch (e) {
    console.error('Error al cargar movimientos:', e)
    movimientos.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Calcula un resumen básico de la página actual (solo como fallback si no hay endpoint de resumen).
 * Lo ideal es llamar a MovimientoFinancieroService.getResumen(params).
 */
const calculateLocalResumen = (data: MovimientoFinanciero[]) => {
  let totalIngresos = 0
  let totalEgresos = 0

  data.forEach((m) => {
    const montoNumerico = Number(m.monto) // (Línea 200 corregida)
    if (m.tipo === 'Ingreso') {
      totalIngresos += montoNumerico // Usamos la variable numérica
    } else if (m.tipo === 'Egreso') {
      totalEgresos += montoNumerico // Usamos la variable numérica
    }
  })

  // Si tienes un endpoint de resumen real, esto se reemplaza por la llamada a la API
  resumen.value.total_ingresos = totalIngresos
  resumen.value.total_egresos = totalEgresos
  resumen.value.balance_neto = totalIngresos - totalEgresos
}

// Debounce la función de búsqueda
const debouncedFetch = debounce(fetchMovimientos, 500)

// Observadores para recargar al cambiar filtros
watch([filtroTipo, filtroFechaInicio, filtroFechaFin], () => {
  currentPage.value = 1
  fetchMovimientos()
})

watch(filtroSearch, () => {
  currentPage.value = 1
  debouncedFetch()
})

// --- HANDLERS ---

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchMovimientos()
  }
}

const clearFilters = () => {
  filtroTipo.value = ''
  filtroFechaInicio.value = ''
  filtroFechaFin.value = ''
  filtroSearch.value = ''
  // El watch se encarga de llamar a fetchMovimientos()
}

const openModal = (tipo: TipoMovimiento) => {
  modalTipo.value = tipo
  showModal.value = true
}

const handleMovimientoSuccess = (movimiento: MovimientoFinanciero) => {
  console.log(`Movimiento ${movimiento.tipo} registrado. Recargando lista...`)
  // Recargar la lista principal para mostrar el nuevo registro
  fetchMovimientos()
  // Si usas el endpoint de resumen, también lo recargas aquí:
  // fetchResumen()
}

// --- UTILIDADES ---
const formatCurrency = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// --- CICLO DE VIDA ---
onMounted(fetchMovimientos)
</script>

<style scoped>
.movimientos-view {
  min-height: 100vh;
}
</style>
