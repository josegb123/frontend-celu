<template>
  <div class="product-grid-container">
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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

      <div v-else v-for="product in products" :key="product.id" class="col">
        <ProductCard
          :product="product"
          @edit="$emit('editProduct', $event)"
          @delete="handleDeleteProduct"
        />
      </div>
    </div>

    <div
      v-if="!isLoading && products.length > 0 && totalPages > 1"
      class="d-flex justify-content-center mt-4"
    >
      <p class="text-info small">
        *La paginación está deshabilitada ya que la API no proporciona metadata de total/página
        actual.
      </p>
    </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProductoService, { type Producto } from '@/services/ProductoService.js'
import ProductCard from './ProductCard.vue'
import ConfirmationModal from '../ConfirmationModal.vue'

// --- PROPS y EMITS ---
const props = defineProps<{
  // Propiedades para filtros, controladas por el componente padre
  searchQuery: string
  categoriaId: number | null
}>()

const emit = defineEmits<{
  // Emitir el evento de edición al componente padre (HomeView)
  (e: 'editProduct', product: Producto): void
  // Emitir el evento de recarga (para actualizar la lista después de crear/eliminar)
  (e: 'productsUpdated'): void
  // ⬇️ 2. Nuevo Emit para notificar al padre (ProductAdminView) ⬇️
  (e: 'showNotification', result: { message: string; isError: boolean }): void
}>()

// --- ESTADO LOCAL ---
const products = ref<Producto[]>([])
const isLoading = ref(false)

const isConfirmModalVisible = ref(false)
const productToDeleteId = ref<number | null>(null)
const isDeleting = ref(false)

// --- ESTADO SIMULADO DE PAGINACIÓN (Basado en la API no paginada) ---
const currentPage = ref(1)
const totalPages = ref(1)

// --- MÉTODOS ---

/**
 * Función auxiliar para obtener el nombre del producto a eliminar para el modal.
 */
const getProductToDeleteName = (): string => {
  const product = products.value.find((p) => p.id === productToDeleteId.value)
  return product ? product.nombre : 'Producto Desconocido'
}

/**
 * Muestra el modal de confirmación y guarda el ID del producto.
 */
const showConfirmationModal = (productId: number) => {
  productToDeleteId.value = productId
  isConfirmModalVisible.value = true
}

/**
 * Cierra el modal y limpia el ID.
 */
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
  products.value = [] // Limpiar lista anterior

  // Parámetros basados en las props
  const params: { page: number; search: string; categoria_id?: number } = {
    page: currentPage.value,
    search: props.searchQuery,
  }

  if (props.categoriaId !== null) {
    params.categoria_id = props.categoriaId
  }
  console.log('[DEBUG ProductGrid] Parámetros enviados a getProductos:', params)

  try {
    const data = await ProductoService.getProductos(params)
    products.value = data
  } catch (error) {
    console.error('Error al cargar productos:', error)
    // No emitimos notificación de error de carga aquí para evitar spam.
  } finally {
    isLoading.value = false
  }
}

/**
 * Maneja la eliminación de un producto (solo abre el modal).
 */
const handleDeleteProduct = (productId: number) => {
  showConfirmationModal(productId)
}

/**
 * Maneja la eliminación real DESPUÉS de la confirmación del modal.
 */
const confirmDelete = async () => {
  const productId = productToDeleteId.value
  if (!productId) {
    hideConfirmationModal()
    return
  }

  isDeleting.value = true // Habilita el spinner en el modal

  try {
    await ProductoService.deleteProducto(productId)

    // Éxito: Emitir notificación
    emit('showNotification', {
      message: `Producto "${getProductToDeleteName()}" eliminado con éxito.`,
      isError: false,
    })

    // Recargar la lista y notificar al padre
    fetchProducts()
    emit('productsUpdated')
  } catch (error) {
    console.error(`Error al eliminar el producto ID ${productId}:`, error)
    // Error: Emitir notificación
    emit('showNotification', {
      message: 'Fallo al eliminar el producto. Revise la consola.',
      isError: true,
    })
  } finally {
    // Esconder el modal independientemente del resultado
    hideConfirmationModal()
  }
} // ⬅️ Falta cerrar la función aquí

// --- OBSERVADORES ---

// Observa cambios en el filtro de búsqueda o categoría y recarga la lista
watch([() => props.searchQuery, () => props.categoriaId], () => {
  currentPage.value = 1 // Reiniciar página al aplicar nuevo filtro
  fetchProducts()
})

// --- CICLO DE VIDA ---
onMounted(fetchProducts)
</script>

<style scoped>
.product-grid-container {
  min-height: 400px; /* Evita que el layout salte al cargar */
}
</style>
