<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Gestión de Inventario 🛍️</h1>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <label for="search" class="form-label">Buscar por Nombre/Código</label>
        <input
          type="text"
          id="search"
          class="form-control"
          placeholder="Ej. Teclado mecánico"
          v-model="searchQuery"
        />
      </div>

      <button class="btn btn-primary" @click="openProductFormModal">
        <i class="bi bi-plus-circle me-2"></i> Crear Producto
      </button>
    </div>

    <ProductGrid
      :search-query="searchQuery"
      :categoria-id="selectedCategoriaId"
      @edit-product="startEditing"
      @products-updated="handleGridUpdate"
    />
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

  <ProductFormModal
    :isVisible="productFormModalVisible"
    :product-to-edit="productToEdit"
    :categories="categories"
    @close="closeProductFormModal"
    @product-saved="handleProductSaved"
    @open-category-modal="openCategoryModal"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Componentes
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import ProductGrid from '@/components/products/ProductGrid.vue'
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

// Modales
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})
const categoryModalVisible = ref(false) // Nuevo estado para el modal de categorías
const productFormModalVisible = ref(false) // Estado para el modal del formulario de productos

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

/**
 * Abre el modal del formulario de productos.
 */
const openProductFormModal = () => {
  productFormModalVisible.value = true
}

/**
 * Cierra el modal del formulario de productos.
 */
const closeProductFormModal = () => {
  productFormModalVisible.value = false
  productToEdit.value = null
}

// --- CICLO DE VIDA ---
onMounted(() => {
  loadCategories()
})

// --- HANDLERS ---

/**
 * Inicia el proceso de edición al recibir el producto de ProductCard.
 */
const startEditing = (product: Producto) => {
  productToEdit.value = product
  openProductFormModal()
}

/**
 * ⬅️ CORRECCIÓN CLAVE 1: Recibe el resultado y muestra la notificación.
 * Se llama cuando un producto es creado o actualizado.
 */
const handleProductSaved = (result: { success: boolean; message: string }) => {
  showNotification(result.message, !result.success)
  if (result.success) {
    closeProductFormModal()
  }
}

/**
 * Se llama cuando ProductGrid ha terminado su actualización.
 * Útil para manejar errores o mensajes post-recarga.
 */
const handleGridUpdate = () => {
  // Este método es un placeholder, lo mantenemos por si se necesita lógica post-grid.
}
</script>

<style scoped>
/* Estilos generales de la vista */
.container-fluid {
  max-width: 1400px;
}
</style>
