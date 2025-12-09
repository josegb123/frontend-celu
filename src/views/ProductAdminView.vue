<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Gestión de Inventario 🛍️</h1>

    <div class="row mb-4 align-items-end">
      <div class="col-12 col-md-4 mb-3 mb-md-0">
        <div>
          <label for="search" class="form-label">Buscar por <strong>Nombre/Código</strong></label>
          <input
            type="text"
            id="search"
            class="form-control"
            placeholder="Ej. Teclado mecánico"
            v-model="searchQuery"
          />
        </div>
      </div>

      <div class="col-12 col-md-4 mb-3 mb-md-0">
        <div>
          <label for="category-filter" class="form-label"
            >Filtrar por <strong> Categoría</strong></label
          >
          <select id="category-filter" class="form-select" v-model="selectedCategoriaId">
            <option :value="null">Todas las Categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="col-12 col-md-4 d-grid" v-if="isAdmin">
        <button class="btn btn-primary" @click="openProductFormModal">
          <i class="bi bi-plus-circle me-2"></i> Crear Producto
        </button>
      </div>
    </div>

    <ProductGrid
      :search-query="searchQuery"
      :categoria-id="selectedCategoriaId"
      @edit-product="startEditing"
      @products-updated="handleGridUpdate"
      @show-notification="handleShowNotification"
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
import { ref, onMounted, computed } from 'vue' // Added computed

// Componentes
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import ProductGrid from '@/components/products/ProductGrid.vue'
import NotificationModal from '@/components/utils/NotificationModal.vue'
import CategoryManagerModal from '@/components/products/CategoryManagerModal.vue'

// Servicios
import CategoriaService from '@/services/CategoriaService.js'
import type { IProducto, Categoria } from '@/interfaces/IProductoInterfaces'
import type { Ref } from 'vue'
import { useAuthStore } from '@/store/authStore' // Added

// --- ESTADO GLOBAL DE LA VISTA ---

// Filtros
const searchQuery = ref('')
const selectedCategoriaId = ref<number | null>(null) // Mantenemos el nombre correcto

// Datos y Edición
const categories: Ref<Categoria[]> = ref([])
const productToEdit = ref<IProducto | null>(null)

// Modales
const notification = ref({
  visible: false,
  message: '',
  isError: false,
})
const categoryModalVisible = ref(false)
const productFormModalVisible = ref(false)

const authStore = useAuthStore() // Added
const isAdmin = computed(() => { // Added
  return authStore.user?.role === 'administrador' || authStore.user?.role === 'admin'
})

// --- MÉTODOS DE MANEJO DE ESTADO ---

const loadCategories = async () => {
  try {
    categories.value = await CategoriaService.getCategorias()
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    showNotification('Error al cargar las categorías.', true)
  }
}

const showNotification = (message: string, isError = false) => {
  notification.value = { visible: true, message, isError }
}

const closeNotification = () => {
  notification.value = { visible: false, message: '', isError: false }
}

const handleShowNotification = (result: { message: string; isError: boolean }) => {
  showNotification(result.message, result.isError)
}

const openCategoryModal = () => {
  categoryModalVisible.value = true
}

const closeCategoryModal = () => {
  categoryModalVisible.value = false
  loadCategories()
}

const openProductFormModal = () => {
  productFormModalVisible.value = true
}

const closeProductFormModal = () => {
  productFormModalVisible.value = false
  productToEdit.value = null
}

// --- CICLO DE VIDA ---
onMounted(() => {
  loadCategories()
})

// --- HANDLERS ---

const startEditing = (product: IProducto) => {
  productToEdit.value = product
  openProductFormModal()
}

/**
 * Se llama cuando un producto es creado o actualizado.
 */
const handleProductSaved = (result: { success: boolean; message: string }) => {
  showNotification(result.message, !result.success)
  if (result.success) {
    closeProductFormModal()
  }
}

/**
 * Se llama cuando ProductGrid ha terminado su actualización (después de eliminar, por ejemplo).
 * Forzamos la recarga del grid.
 */
const handleGridUpdate = () => {
  // Simplemente cerramos el modal de formulario si está abierto
  closeProductFormModal()
}
</script>

<style scoped>
/* Estilos generales de la vista */
.container-fluid {
  max-width: 1400px;
}
</style>
