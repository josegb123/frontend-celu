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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProductoService, { type Producto } from '@/services/ProductoService.js'
import ProductCard from './ProductCard.vue'

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
}>()

// --- ESTADO LOCAL ---
const products = ref<Producto[]>([])
const isLoading = ref(false)

// --- ESTADO SIMULADO DE PAGINACIÓN (Basado en la API no paginada) ---
// Estos valores serían actualizados si getProductos devolviera PaginatedResponse<Producto>
const currentPage = ref(1)
const totalPages = ref(1)

// --- MÉTODOS ---

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
  console.log('[DEBUG ProductGrid] Parámetros enviados a getProductos:', params) // Added log

  try {
    // getProductos devuelve Producto[] directamente, sin metadata de paginación
    const data = await ProductoService.getProductos(params)

    products.value = data

    // Si la API no devuelve paginación, no podemos calcular totalPages
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Maneja la eliminación de un producto.
 */
const handleDeleteProduct = async (productId: number) => {
  if (!productId) return

  try {
    // ⚠️ NOTA: El ProductoService no tiene un método DELETE implementado aún.
    // Usaremos una llamada directa a Axios/laravelApi para simularlo.
    // **Deberías añadir este método al ProductoService para una arquitectura limpia.**

    // Implementación simulada de eliminación (requiere agregar el método al servicio después)
    // await ProductoService.deleteProducto(productId);

    // Simulación directa:
    await ProductoService.deleteProducto(productId) // Asumimos que lo añadirás

    alert('Producto eliminado con éxito.')

    // Recargar la lista y notificar al padre
    fetchProducts()
    emit('productsUpdated')
  } catch (error) {
    console.error(`Error al eliminar el producto ID ${productId}:`, error)
    alert('Fallo al eliminar el producto. Revise la consola.')
  }
}

// --- OBSERVADORES ---

// Observa cambios en el filtro de búsqueda o categoría y recarga la lista
watch([() => props.searchQuery, () => props.categoriaId], () => {
  currentPage.value = 1 // Reiniciar página al aplicar nuevo filtro
  fetchProducts()
})

// --- CICLO DE VIDA ---
onMounted(fetchProducts)

// ⚠️ Implementación temporal para que el componente funcione
// Asumir que existe este método en ProductoService para la eliminación:
// Este es un recordatorio para agregarlo en tu archivo ProductoService.ts
Object.assign(ProductoService, {
  deleteProducto: async (id: number) => {
    const response = await ProductoService['laravelApi'].delete(
      `${ProductoService['endpoint']}/${id}`,
    )
    return response.data
  },
})
</script>

<style scoped>
.product-grid-container {
  min-height: 400px; /* Evita que el layout salte al cargar */
}
</style>
