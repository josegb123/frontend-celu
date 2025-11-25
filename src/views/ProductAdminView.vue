<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Gestión de Inventario 🛍️</h1>

    <div class="row">
      <div class="col-lg-4 order-lg-2">
        <ProductForm
          :product-to-edit="productToEdit"
          :categories="categories"
          @product-saved="handleProductSaved"
          @open-category-modal="openCategoryModal"
        />
      </div>

      <div class="col-lg-8 order-lg-1">
        <div class="d-flex mb-4 gap-3 align-items-end">
          <div class="flex-grow-1">
            <label for="search" class="form-label">Buscar por Nombre/Código</label>
            <input
              type="text"
              id="search"
              class="form-control"
              placeholder="Ej. Teclado mecánico"
              v-model="searchQuery"
            />
          </div>

          <categoriaFilter
            :categories="categorias"
            @categoria-selected="handleCategoriaSelected"
            class="w-50"
          />
        </div>

        <ProductGrid
          :search-query="searchQuery"
          :categoria-id="selectedCategoriaId"
          @edit-product="startEditing"
          @products-updated="handleGridUpdate"
        />
      </div>
    </div>
  </div>

  <NotificationModal
    :isVisible="notification.visible"
    :message="notification.message"
    :isError="notification.isError"
    @close="closeNotification"
  />

  <CategoryManagerModal
    :isVisible="categoryModalVisible"
    @close="closeCategoryModal"
    @categories-updated="loadCategories"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Componentes
import ProductForm from '@/components/products/ProductForm.vue'
import ProductGrid from '@/components/products/ProductGrid.vue'
import categoriaFilter from '@/components/products/CategoriaFilter.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import CategoryManagerModal from '@/components/products/CategoryManagerModal.vue'

// Servicios
import CategoriaService from '@/services/CategoriaService.js'
import type { ICategoria } from '@/interfaces/ICategoria'
import { type Producto } from '@/services/ProductoService.js'
import type { Ref } from 'vue'

// --- ESTADO GLOBAL DE LA VISTA ---

// Filtros
const searchQuery = ref('')
const selectedCategoriaId = ref<number | null>(null) // Corregido el nombre de la variable

// Datos y Edición
const categories: Ref<ICategoria[]> = ref([])
const productToEdit = ref<Producto | null>(null)
const categorias = computed(() => categories.value)

// Modales
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})
const categoryModalVisible = ref(false) // Nuevo estado para el modal de categorías

// --- MÉTODOS DE MANEJO DE ESTADO ---

/**
 * Carga la lista de categorías.
 */
const loadCategories = async () => {
  try {
    categories.value = await CategoriaService.getCategorias()
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    showNotification('Error al cargar las categorías.', true)
  }
}

/**
 * Muestra el modal de notificación.
 */
const showNotification = (message: string, isError = false) => {
  notification.value = { visible: true, message, isError }
}

/**
 * Cierra el modal de notificación.
 */
const closeNotification = () => {
  notification.value = { visible: false, message: '', isError: false }
}

/**
 * Abre el modal de gestión de categorías.
 */
const openCategoryModal = () => {
  categoryModalVisible.value = true
}

/**
 * Cierra el modal de gestión de categorías y recarga la lista.
 */
const closeCategoryModal = () => {
  categoryModalVisible.value = false
  // Siempre recargar categorías después de cerrar por si hubo cambios
  loadCategories()
}

// --- CICLO DE VIDA ---
onMounted(() => {
  loadCategories()
})

// --- HANDLERS ---

/**
 * Recibe el ID de la categoría seleccionada del CategoriaFilter.
 */
const handleCategoriaSelected = (categoriaId: number | null) => {
  selectedCategoriaId.value = categoriaId
}

/**
 * Inicia el proceso de edición al recibir el producto de ProductCard.
 */
const startEditing = (product: Producto) => {
  productToEdit.value = product
}

/**
 * ⬅️ CORRECCIÓN CLAVE 1: Recibe el resultado y muestra la notificación.
 * Se llama cuando un producto es creado o actualizado.
 */
const handleProductSaved = (result: { success: boolean; message: string }) => {
  showNotification(result.message, !result.success)
  if (result.success) {
    productToEdit.value = null
  }
}

/**
 * Se llama cuando ProductGrid ha terminado su actualización.
 * Útil para manejar errores o mensajes post-recarga.
 */
const handleGridUpdate = () => {
  // Este método es un placeholder, lo mantenemos por si se necesita lógica post-grid.
}

// ... (Lista de TODO)
</script>

<style scoped>
/* Estilos generales de la vista */
.container-fluid {
  max-width: 1400px;
}
</style>
