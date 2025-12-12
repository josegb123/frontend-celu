<template>
  <div class="product-grid-container">
    <div
      class="row g-4"
      :class="{
        'row-cols-1': windowWidth < 576,
        'row-cols-2': windowWidth >= 576 && windowWidth < 992,
        'row-cols-3': windowWidth >= 992,
      }"
    >
      <div v-if="isLoading" class="col-12 text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando productos...</span>
        </div>
        <p class="mt-2">Cargando productos...</p>
      </div>

      <div v-else-if="products.length === 0" class="col-12 text-center my-5">
        <div class="alert alert-warning">
          No se encontraron productos con los filtros aplicados.
        </div>
      </div>

      <div v-else v-for="product in sortedProducts" :key="product.id" class="col">
        <ProductCard
          :product="product"
          :stockStatus="getStockStatus(product)"
          @edit="$emit('editProduct', $event)"
          @delete="handleDeleteProduct"
          @showSuppliers="handleShowSuppliers"
        />
      </div>
    </div>
  </div>

  <div
    v-if="!isLoading && pagination.meta.last_page > 1"
    class="d-flex justify-content-center mt-4"
  >
    <nav aria-label="Navegación de Productos">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: pagination.meta.current_page === 1 }">
          <a
            class="page-link"
            href="#"
            @click.prevent="changePage(pagination.meta.current_page - 1)"
          >
            Anterior
          </a>
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
          >
            Siguiente
          </a>
        </li>
      </ul>
    </nav>
  </div>

  <div v-if="!isLoading && products.length > 0" class="text-center mt-2 text-muted small">
    Mostrando {{ pagination.data.length }} de {{ pagination.meta.total }} productos.
  </div>

  <ConfirmationModal
    :is-visible="isConfirmModalVisible"
    title="Eliminar Producto"
    :message="`¿Está seguro de que desea eliminar permanentemente el producto ID ${productToDeleteId} (Nombre: ${getProductToDeleteName()})? Esta acción no se puede deshacer.`"
    confirm-text="Sí, Eliminar"
    :is-processing="isDeleting"
    @confirm="confirmDelete"
    @cancel="hideConfirmationModal"
  />

  <SupplierModal
    :show="isSupplierModalVisible"
    :suppliers="supplierModalData.suppliers"
    :product-name="supplierModalData.productName"
    @close="isSupplierModalVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue'
import ProductCard from '@/components/products/ProductCard.vue'
import ConfirmationModal from '@/components/utils/ConfirmationModal.vue'
import ProductoService from '@/services/ProductoService.js'
import SupplierModal from './SupplierModal.vue'
import type { IProducto, IProductoPaginated } from '@/interfaces/IProductoInterfaces'
import type { Proveedor } from '@/interfaces/IProveedores'
// --- CONSTANTES ---
const ITEMS_PER_PAGE = 20

// --- PROPS y EMITS ---
const props = defineProps<{
  searchQuery: string
  categoriaId: number | null
  // Propiedad para forzar la recarga desde el padre
  reloadTrigger: number
}>()

const emit = defineEmits<{
  (e: 'editProduct', product: IProducto): void

  (e: 'showNotification', result: { message: string; isError: boolean }): void
}>()

// --- ESTADO LOCAL ---
const products = ref<IProducto[]>([])
const isLoading = ref(false)

const isConfirmModalVisible = ref(false)
const productToDeleteId = ref<number | null>(null)
const isDeleting = ref(false)

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

//  ESTADO PARA EL MODAL DE PROVEEDORES
const isSupplierModalVisible = ref(false)
const supplierModalData = reactive<{ suppliers: Proveedor[]; productName: string }>({
  suppliers: [],
  productName: '',
})
// ---------------------------------------------

// --- LÓGICA COMPUTADA ---

/**
 * Genera un rango inteligente de botones de página.
 */
const pageRange = computed(() => {
  const pages: (number | string)[] = []
  const lastPage = pagination.meta.last_page
  const current = pagination.meta.current_page

  // Lógica para mostrar solo algunas páginas (ej: 1, 2, ..., N)
  if (lastPage <= 7) {
    // Mostrar todas si son pocas
    for (let i = 1; i <= lastPage; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(lastPage - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < lastPage - 3) pages.push('...')
    pages.push(lastPage)

    // Filtrar duplicados de '...'
    return pages.filter(
      (value, index, self) =>
        self.indexOf(value) === index && !(value === '...' && self[index - 1] === '...'),
    )
  }
  return pages
})

/**
 * Ordena los productos para mostrar los de BAJO STOCK (actual < minimo) primero.
 */
const sortedProducts = computed(() => {
  const list = [...products.value]

  // Aplicar el orden: Los productos con stock actual < stock mínimo van primero.
  list.sort((a, b) => {
    const isALow = a.stock_actual < a.stock_minimo
    const isBLow = b.stock_actual < b.stock_minimo

    if (isALow && !isBLow) {
      return -1 // A va antes (bajo stock)
    }
    if (!isALow && isBLow) {
      return 1 // B va antes (bajo stock)
    }
    return 0
  })

  return list
})

// --- MÉTODOS ---

/**
 * Maneja el evento 'showSuppliers' del ProductCard.
 */
const handleShowSuppliers = (suppliers: Proveedor[], productName: string) => {
  supplierModalData.suppliers = suppliers
  supplierModalData.productName = productName
  isSupplierModalVisible.value = true
}
// ----------------------------------------------

const getStockStatus = (product: IProducto): 'agotado' | 'bajo' | 'normal' => {
  if (product.stock_actual <= 0) {
    return 'agotado'
  }
  if (product.stock_actual < product.stock_minimo) {
    return 'bajo'
  }
  return 'normal'
}

const getProductToDeleteName = (): string => {
  const product = products.value.find((p) => p.id === productToDeleteId.value)
  return product ? product.nombre : 'Producto Desconocido'
}

const showConfirmationModal = (productId: number) => {
  productToDeleteId.value = productId
  isConfirmModalVisible.value = true
}

const hideConfirmationModal = () => {
  isConfirmModalVisible.value = false
  productToDeleteId.value = null
  isDeleting.value = false
}

/**
 * Carga la lista de productos con filtros y paginación.
 */
const fetchProducts = async () => {
  isLoading.value = true
  products.value = []

  const params: { page: number; search: string; categoria_id?: number; per_page: number } = {
    page: currentPage.value,
    search: props.searchQuery,
    per_page: ITEMS_PER_PAGE,
  }

  if (props.categoriaId !== null) {
    params.categoria_id = props.categoriaId
  }

  try {
    const response: IProductoPaginated = await ProductoService.getProductos(params)

    products.value = response.data

    Object.assign(pagination, response)
  } catch (error) {
    console.error('Error al cargar productos:', error)
    emit('showNotification', {
      message: 'Fallo al cargar la lista de productos. Revise la consola.',
      isError: true,
    })
  } finally {
    isLoading.value = false
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

const handleDeleteProduct = (productId: number) => {
  showConfirmationModal(productId)
}

const confirmDelete = async () => {
  const productId = productToDeleteId.value
  if (!productId) {
    hideConfirmationModal()
    return
  }

  isDeleting.value = true

  try {
    await ProductoService.deleteProducto(productId)

    // Éxito: Emitir notificación al AdminView
    emit('showNotification', {
      message: `Producto "${getProductToDeleteName()}" eliminado con éxito.`,
      isError: false,
    })

    // Recargar la lista y notificar al padre
    if (products.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    await fetchProducts()
  } catch (error) {
    console.error(`Error al eliminar el producto ID ${productId}:`, error)
    // Error: Emitir notificación al AdminView
    emit('showNotification', {
      message: 'Fallo al eliminar el producto. Revise la consola.',
      isError: true,
    })
  } finally {
    hideConfirmationModal()
  }
}

// --- OBSERVADORES ---

// 1. Observa cambios en filtros (búsqueda o categoría)
watch([() => props.searchQuery, () => props.categoriaId], () => {
  currentPage.value = 1
  fetchProducts()
})

// 2. Observa el trigger de recarga forzada (cuando se guarda un producto)
watch(
  () => props.reloadTrigger,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      console.log(`[ProductGrid] Recarga forzada activada por trigger: ${newVal}.`)
      fetchProducts()
    }
  },
)

// --- CICLO DE VIDA ---
onMounted(fetchProducts)

// --- RESIZE WINDOW ---
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
.product-grid-container {
  min-height: 400px;
}
</style>
