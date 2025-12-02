<template>
  <div class="product-grid-pos-container">
    <div class="product-grid-scroll-area">
      <div
        class="row g-3"
        :class="{
          'row-cols-2': windowWidth < 800,
          'row-cols-3': windowWidth >= 800,
        }"
      >
        <div v-if="isLoading" class="col-12 text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando productos...</span>
          </div>
          <p class="mt-2 text-muted">Cargando productos...</p>
        </div>

        <div v-else-if="products.length === 0 && !isInitialLoad" class="col-12 my-5">
          <div class="alert alert-warning text-center">
            No se encontraron productos con los filtros.
          </div>
        </div>

        <div v-else v-for="product in products" :key="product.id" class="col">
          <div
            class="card product-card-pos shadow-sm text-center border square-aspect-ratio"
            @click="emit('product-selected', product)"
            :class="{
              // 🚨 Alerta de stock bajo (1 a 4 unidades)
              'low-stock-alert': product.stock_actual > 0 && product.stock_actual < 5,
              // 🚨 Alerta de stock agotado (0 unidades)
              'out-of-stock': product.stock_actual === 0,
            }"
          >
            <div class="card-body p-2 d-flex flex-column justify-content-center">
              <h6 class="card-title mb-1 text-primary text-truncate" :title="product.nombre">
                {{ product.nombre }}
              </h6>
              <p class="card-text fw-bold mb-0 fs-5">
                ${{ parseFloat(product.precio_venta.toString()).toFixed(2) }}
              </p>

              <span
                class="badge mt-1"
                :class="{
                  'text-bg-danger': product.stock_actual < 5,
                  'text-bg-secondary': product.stock_actual >= 5,
                }"
              >
                {{ product.stock_actual }} en stock
              </span>
            </div>

            <div class="card-footer border-top p-1">
              <small class="text-muted">
                {{ product.stock_actual === 0 ? 'Sin Stock' : 'Clic para agregar' }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagination.last_page > 1 && !isLoading" class="d-flex justify-content-center mt-3">
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)"
              >Anterior</a
            >
          </li>

          <li
            class="page-item"
            :class="{ active: p === pagination.current_page }"
            v-for="p in pageRange"
            :key="p"
          >
            <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
          </li>

          <li
            class="page-item"
            :class="{ disabled: pagination.current_page === pagination.last_page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)"
              >Siguiente</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { debounce } from 'lodash'
import ProductoService, {
  type Producto,
  type PaginatedResponse,
} from '@/services/ProductoService.js'

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 18

// --- PROPS y EMITS ---
const props = defineProps<{
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'product-selected', product: Producto): void
}>()

// --- ESTADO LOCAL ---
const products = ref<Producto[]>([])
const isLoading = ref(false)
const isInitialLoad = ref(true)
const currentPage = ref(1)
const pagination = reactive<PaginatedResponse<Producto>>({
  current_page: 1,
  data: [],
  last_page: 1,
  total: 0,
  per_page: ITEMS_PER_PAGE,
})

// --- LÓGICA COMPUTADA ---

/**
 * Genera un rango simple de páginas (ej. 1, 2, 3, ..., N)
 */
const pageRange = computed(() => {
  const pages: (number | string)[] = []
  const lastPage = pagination.last_page
  const current = pagination.current_page

  if (lastPage <= 5) {
    for (let i = 1; i <= lastPage; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(lastPage - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < lastPage - 2) pages.push('...')
    pages.push(lastPage)

    return pages.filter(
      (value, index, self) =>
        self.indexOf(value) === index && !(value === '...' && self[index - 1] === '...'),
    )
  }
  return pages
})

// -------------------------------------------------------------------------
// --- MÉTODOS DE BÚSQUEDA Y PAGINACIÓN ---
// -------------------------------------------------------------------------

/**
 * Carga la lista de productos con paginación.
 */
const fetchProducts = async () => {
  isLoading.value = true
  products.value = []

  const params = {
    search: props.searchQuery,
    page: currentPage.value,
    per_page: ITEMS_PER_PAGE,
  }

  try {
    const response: PaginatedResponse<Producto> = await ProductoService.getProductos(params)

    products.value = response.data
    // Actualizar el estado reactivo de paginación
    pagination.current_page = response.current_page
    pagination.last_page = response.last_page
    pagination.total = response.total
    pagination.per_page = response.per_page
  } catch (error) {
    console.error('Error al cargar productos para POS:', error)
  } finally {
    isLoading.value = false
    isInitialLoad.value = false
  }
}

/**
 * Cambia la página y recarga los productos.
 */
const changePage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= pagination.last_page) {
    currentPage.value = page
    fetchProducts()
  }
}

// Envuelve la función de búsqueda en un debounce de 300ms
const debouncedFetch = debounce(() => {
  currentPage.value = 1
  fetchProducts()
}, 300)

// -------------------------------------------------------------------------
// --- OBSERVADORES ---
// -------------------------------------------------------------------------

// Observa cambios en el filtro de búsqueda
watch(
  () => props.searchQuery,
  (newQuery) => {
    if (newQuery && newQuery.length >= 3) {
      debouncedFetch()
    } else {
      debouncedFetch()
    }
  },
)

// -------------------------------------------------------------------------
// --- CICLO DE VIDA Y RESIZE ---
// -------------------------------------------------------------------------

onMounted(fetchProducts)

const windowWidth = ref(window.innerWidth)
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}
window.addEventListener('resize', updateWindowWidth)
onMounted(() => {
  updateWindowWidth()
})
</script>

<style scoped>
.product-grid-pos-container {
  min-height: 250px;
  display: flex;
  flex-direction: column;
}

/* 1. AJUSTE CRÍTICO DE ALTURA */
.product-grid-scroll-area {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 5px;
  margin-bottom: 10px;
  flex-grow: 1;
}

/* 2. FORZAR DIMENSIONES CUADRADAS PARA LA TARJETA */
.product-card-pos {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  aspect-ratio: 1 / 1;
}

.product-card-pos:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-footer {
  flex-shrink: 0;
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* -------------------------------------------------------------------------
   3. ESTILOS DE ALERTA DE STOCK BAJO (LOW STOCK ALERT)
   ------------------------------------------------------------------------- */

/* Estilo para stock bajo (1 a 4 unidades): Fondo rojo claro y semitransparente */
.low-stock-alert {
  /* Fondo ligero para que se vea en modo claro y oscuro. Usamos variables CSS de Bootstrap. */
  background-color: var(--bs-danger-bg-subtle, #f8d7da) !important;
  border-color: var(--bs-danger-border-subtle, #f5c6cb) !important;
  opacity: 0.8; /* Semitransparente */
}

/* Estilo para stock agotado (0 unidades): Más opacidad para deshabilitar visualmente */
.out-of-stock {
  /* Fondo más apagado */
  background-color: var(--bs-secondary-bg-subtle, #f0f0f0) !important;
  border-color: var(--bs-secondary-border-subtle, #e9ecef) !important;
  opacity: 0.5; /* Más transparente */
  cursor: not-allowed !important;
}

/* Asegurar que el texto dentro de las alertas tenga buen contraste */
.low-stock-alert .card-title,
.out-of-stock .card-title {
  /* Forzar color oscuro para que contraste con el fondo claro de la alerta */
  color: var(--bs-dark) !important;
}
</style>
