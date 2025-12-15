<template>
  <div class="p-1">
    <div
      class="row g-3 content row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 pos-grid-height"
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
          class="card product-card-pos shadow-sm text-center border"
          @click="emit('product-selected', product)"
          :class="{
            'low-stock-alert': product.stock_actual > 0 && product.stock_actual < 5,
            'out-of-stock': product.stock_actual === 0,
          }"
        >
          <h6 class="card-title px-1 pt-3 text-truncate-lines" :title="product.nombre">
            {{ product.nombre }}
          </h6>
          <div class="card-body pt-0 d-flex flex-column justify-content-end">
            <img
              :src="product.imagen_url || '/no_image.webp'"
              class="img-fluid border-0 rounded-3 mb-2 mx-auto product-image"
              alt=""
            />
            <p class="card-text fw-bold mb-0 fs-7">{{ formatCurrency(product.precio_venta) }}</p>

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

  <div
    v-if="pagination.meta.last_page > 1 && !isLoading"
    class="d-flex justify-content-center mt-3"
  >
    <nav>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: pagination.meta.current_page === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(pagination.meta.current_page - 1)"
            >Anterior</a
          >
        </li>

        <li
          class="page-item"
          :class="{ active: p === pagination.meta.current_page }"
          v-for="p in pageRange"
          :key="p"
        >
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>

        <li
          class="page-item"
          :class="{ disabled: pagination.meta.current_page === pagination.meta.last_page }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(pagination.meta.current_page + 1)"
            >Siguiente</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { debounce } from 'lodash'
import ProductoService from '@/services/ProductoService.js'
import type { IProductoPaginated, IProducto } from '@/interfaces/IProductoInterfaces'
import { formatCurrency } from '@/utils/formatters'

// --- CONSTANTES ---
const ITEMS_PER_PAGE = 10

// --- PROPS y EMITS ---
const props = defineProps<{
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'product-selected', product: IProducto): void
}>()

// --- ESTADO LOCAL ---
const products = ref<IProducto[]>([])
const isLoading = ref(false)
const isInitialLoad = ref(false) // Dejamos como false si no necesitas un estado intermedio en el montaje
const currentPage = ref(1)
const pagination = reactive<IProductoPaginated>({
  data: [],
  meta: {
    total: 0,
    current_page: 0,
    from: 0,
    last_page: 0,
    links: [],
    path: '',
    per_page: ITEMS_PER_PAGE,
    to: 0,
  },
  links: null,
})

// --- LÓGICA COMPUTADA ---

/**
 * Genera un rango simple de páginas (ej. 1, 2, 3, ..., N)
 * Mantenemos la lógica de elipses para un paginador más limpio.
 */
const pageRange = computed(() => {
  const pages: (number | string)[] = []
  const lastPage = pagination.meta.last_page
  const current = pagination.meta.current_page
  const range = 2 // Cuántas páginas mostrar a cada lado de la actual

  if (lastPage <= 7) {
    // 5 es muy poco, 7 cubre la mayoría de los casos.
    for (let i = 1; i <= lastPage; i++) {
      pages.push(i)
    }
  } else {
    // Primera y última página siempre
    pages.push(1)

    // Elipse al principio
    if (current > range + 1) pages.push('...')

    // Rango central
    const start = Math.max(2, current - range + 1)
    const end = Math.min(lastPage - 1, current + range - 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Elipse al final
    if (current < lastPage - range) pages.push('...')

    // Última página
    pages.push(lastPage)

    // Filtrar duplicados y elipses consecutivas
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
  products.value = [] // Limpiar antes de cargar

  const params = {
    search: props.searchQuery,
    page: currentPage.value,
    per_page: ITEMS_PER_PAGE,
  }

  try {
    const response: IProductoPaginated = await ProductoService.getProductos(params)

    products.value = response.data
    // Actualizar el estado reactivo de paginación
    Object.assign(pagination.meta, response.meta)
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
  if (typeof page === 'number' && page >= 1 && page <= pagination.meta.last_page) {
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

// Observa cambios en el filtro de búsqueda (activamos la búsqueda con menos de 3 caracteres)
watch(
  () => props.searchQuery,
  (newQuery) => {
    // Permitir la búsqueda inmediata o con debounce si es necesario
    debouncedFetch()
  },
  // Ejecutar inmediatamente al montar para la primera carga
  { immediate: true },
)

// -------------------------------------------------------------------------
// --- CICLO DE VIDA ---
// -------------------------------------------------------------------------

onMounted(fetchProducts)
</script>
<style scoped>
/* -------------------------------------------------------------------------
  CONTENEDOR GLOBAL 
 ------------------------------------------------------------------------- */
/* Usamos el contenedor .content para gestionar el scroll */
.content {
  overflow-y: auto;
  /* Oculta la barra de desplazamiento en navegadores WebKit (Chrome, Safari) */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.content::-webkit-scrollbar {
  display: none;
}

/* -------------------------------------------------------------------------
  ALTURA DINÁMICA: pos-grid-height
 ------------------------------------------------------------------------- */
.pos-grid-height {
  height: calc(100vh - 255px); /* Ajusta 240px si el layout cambia */
}

/* -------------------------------------------------------------------------
  GRID Y TARJETAS 
 ------------------------------------------------------------------------- */

.product-card-pos {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  min-height: 260px;
}

.product-card-pos:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.text-truncate-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-wrap: stable;
  margin-bottom: 5px;
}

.product-image {
  height: 80px;
  object-fit: cover;
  max-width: 80px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  margin-top: 2px;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* -------------------------------------------------------------------------
  ESTILOS DE ALERTA DE STOCK (Sin cambios)
 ------------------------------------------------------------------------- */

.low-stock-alert {
  background-color: var(--bs-danger-bg-subtle, #f8d7da) !important;
  border-color: var(--bs-danger-border-subtle, #f5c6cb) !important;
  opacity: 0.9;
}

.out-of-stock {
  background-color: var(--bs-secondary-bg-subtle, #f0f0f0) !important;
  border-color: var(--bs-secondary-border-subtle, #e9ecef) !important;
  opacity: 0.5;
  cursor: not-allowed !important;
}

.low-stock-alert .card-title,
.out-of-stock .card-title {
  color: var(--bs-dark) !important;
}
</style>
