<template>
  <div
    v-if="isVisible"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="categoryModalLabel"
    aria-modal="true"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-secondary text-white">
          <h5 class="modal-title" id="categoryModalLabel">
            ⚙️ Administrar Categorías de Productos
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="handleClose"
            aria-label="Cerrar"
          ></button>
        </div>

        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 border-end">
              <h6 class="mb-3 text-secondary">Categorías Existentes ({{ categories.length }})</h6>

              <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div v-else-if="categories.length === 0" class="alert alert-info small">
                No hay categorías registradas. ¡Crea una nueva!
              </div>

              <ul v-else class="list-group list-group-flush list-group-hoverable">
                <li
                  v-for="cat in categories"
                  :key="cat.id"
                  class="list-group-item d-flex justify-content-between align-items-center py-2"
                  :class="{ 'bg-light': editingCategory?.id === cat.id }"
                >
                  <span class="text-capitalize">{{ cat.nombre }}</span>
                  <div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-warning me-2"
                      @click="startEditing(cat)"
                      title="Editar"
                      :disabled="isSubmitting"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteCategory(cat.id!)"
                      title="Eliminar"
                      :disabled="isSubmitting"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <div class="col-md-6">
              <h6 class="mb-3" :class="editingCategory ? 'text-warning' : 'text-primary'">
                {{ editingCategory ? 'Modificar Categoría' : 'Crear Nueva Categoría' }}
              </h6>

              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label for="categoryName" class="form-label">Nombre</label>
                  <input
                    type="text"
                    id="categoryName"
                    class="form-control"
                    v-model="categoryForm.nombre"
                    required
                    :disabled="isSubmitting"
                  />
                  <div v-if="formErrors.nombre" class="text-danger small">
                    {{ formErrors.nombre[0] }}
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetForm"
                    :disabled="isSubmitting"
                    v-if="editingCategory"
                  >
                    Cancelar Edición
                  </button>
                  <button
                    type="submit"
                    class="btn"
                    :class="editingCategory ? 'btn-warning' : 'btn-primary'"
                    :disabled="isSubmitting"
                  >
                    <span
                      v-if="isSubmitting"
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {{ editingCategory ? 'Guardar Cambios' : 'Crear Categoría' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import CategoriaService from '@/services/CategoriaService'
import type { ICategoria } from '@/interfaces/ICategoria'
import { AxiosError, isAxiosError } from 'axios'

// --- TIPOS ---
interface CategoriaPayload {
  nombre: string
}

interface ApiErrorResponseData {
  message?: string
  errors?: Record<string, string[]>
}

// --- PROPIEDADES ---
const props = defineProps<{
  /** Controla la visibilidad del modal. */
  isVisible: boolean
}>()

// --- EMIT EVENTS ---
const emit = defineEmits<{
  /** Evento emitido para cerrar el modal. */
  (e: 'close'): void
  /** Evento emitido cuando la lista de categorías debe ser recargada por el padre. */
  (e: 'categoriesUpdated'): void
  /** Evento emitido para mostrar una notificación en la vista principal. */
  (e: 'showNotification', result: { message: string; isError: boolean }): void
}>()

// --- ESTADO LOCAL ---
const categories = ref<ICategoria[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// Estado del formulario
const initialFormState: CategoriaPayload = { nombre: '' }
const categoryForm = ref<CategoriaPayload>({ ...initialFormState })
const editingCategory = ref<ICategoria | null>(null)
const formErrors = ref<Record<string, string[]>>({})

// --- MÉTODOS DE LA VISTA ---

/**
 * Carga la lista de categorías desde la API.
 */
const fetchCategories = async () => {
  isLoading.value = true
  try {
    categories.value = await CategoriaService.getCategorias()
  } catch (err: unknown) {
    // ⬅️ Corregido: 'err' es ahora de tipo 'unknown'
    console.error('Error al obtener categorías:', err)
    emit('showNotification', {
      message: 'Error al cargar las categorías. Revise la conexión.',
      isError: true,
    })
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Prepara el formulario para editar una categoría.
 */
const startEditing = (category: ICategoria) => {
  editingCategory.value = category
  categoryForm.value.nombre = category.nombre
  formErrors.value = {}
}

/**
 * Restablece el formulario de creación/edición.
 */
const resetForm = () => {
  editingCategory.value = null
  categoryForm.value = { ...initialFormState }
  formErrors.value = {}
}

/**
 * Maneja el cierre del modal.
 */
const handleClose = () => {
  resetForm()
  emit('close')
}

// --- MÉTODOS CRUD ---

/**
 * Envía el formulario para crear o actualizar una categoría.
 */
const submitForm = async () => {
  isSubmitting.value = true
  formErrors.value = {}

  try {
    if (editingCategory.value) {
      // Actualizar
      await CategoriaService.updateCategoria(editingCategory.value.id!, categoryForm.value)
      emit('showNotification', {
        message: `Categoría "${categoryForm.value.nombre}" actualizada.`,
        isError: false,
      })
    } else {
      // Crear
      await CategoriaService.createCategoria(categoryForm.value)
      emit('showNotification', {
        message: `Categoría "${categoryForm.value.nombre}" creada con éxito.`,
        isError: false,
      })
    }

    // Éxito: recargar lista local y notificar al padre
    resetForm()
    await fetchCategories()
    emit('categoriesUpdated')
  } catch (err: unknown) {
    handleApiError(err)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Elimina una categoría.
 */
const deleteCategory = async (id: number) => {
  if (
    !confirm(
      '¿Estás seguro de que deseas eliminar esta categoría? Esto podría afectar a los productos asociados.',
    )
  ) {
    return
  }

  isSubmitting.value = true
  try {
    await CategoriaService.deleteCategoria(id)
    emit('showNotification', { message: 'Categoría eliminada con éxito.', isError: false })

    // Éxito: recargar lista local y notificar al padre
    await fetchCategories()
    emit('categoriesUpdated')

    if (editingCategory.value?.id === id) {
      resetForm() // Si eliminamos la que estábamos editando, limpiamos el formulario
    }
  } catch (err: unknown) {
    handleApiError(err)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Maneja los errores de Axios y los errores de validación 422.
 */
const handleApiError = (err: unknown) => {
  let errorMessage = 'Hubo un error en la operación de categoría.'

  if (isAxiosError<ApiErrorResponseData>(err)) {
    // ⬅️ CORRECCIÓN CLAVE 2: Tipificación de la respuesta de error
    const axiosErr = err as AxiosError<ApiErrorResponseData>
    if (axiosErr.response?.status === 422) {
      const errors = axiosErr.response.data?.errors || {}
      formErrors.value = errors
      errorMessage = 'Falló la validación: Revise el nombre.'
      console.error('Errores de validación:', formErrors.value)
    } else {
      // ⬅️ Corrección: Usamos la propiedad 'message' de la respuesta si existe.
      errorMessage = axiosErr.response?.data?.message || 'Error de conexión con la API.'
      console.error('Error de API:', axiosErr)
    }
  } else {
    console.error('Error desconocido:', err)
  }

  emit('showNotification', { message: errorMessage, isError: true })
}

// --- WATCHERS Y HOOKS ---

/**
 * Cuando el modal se hace visible, carga las categorías.
 */
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      fetchCategories()
      resetForm()
    }
  },
)

onMounted(() => {
  if (props.isVisible) {
    fetchCategories()
  }
})
</script>

<style scoped>
.modal {
  z-index: 1050; /* Asegurar que esté por encima de otros elementos */
}
.modal-backdrop {
  z-index: 1040;
}
.list-group-hoverable .list-group-item:hover {
  background-color: #f8f9fa; /* Color al pasar el ratón */
}
</style>
