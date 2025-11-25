<template>
  <div class="card shadow-sm mb-4">
    <div class="card-header bg-primary text-white">
      <h5 class="mb-0">{{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h5>
    </div>
    <div class="card-body">
      <form @submit.prevent="submitForm" method="POST">
        <div class="row mb-3">
          <div class="col-md-12">
            <label for="nombre" class="form-label">Nombre del Producto</label>
            <input type="text" id="nombre" class="form-control" v-model="form.nombre" required />
            <div v-if="errors.nombre" class="text-danger small">{{ errors.nombre[0] }}</div>
          </div>
          <div class="col-md-12">
            <label for="codigo_barra" class="form-label">Código de Barras</label>
            <input type="text" id="codigo_barra" class="form-control" v-model="form.codigo_barra" />
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label for="precio_compra" class="form-label">Precio Compra ($)</label>
            <input
              type="number"
              step="0.01"
              id="precio_compra"
              class="form-control"
              v-model.number="form.precio_compra"
              required
            />
            <div v-if="errors.precio_compra" class="text-danger small">
              {{ errors.precio_compra[0] }}
            </div>
          </div>
          <div class="col-md-6">
            <label for="precio_venta" class="form-label">Precio Venta ($)</label>
            <input
              type="number"
              step="0.01"
              id="precio_venta"
              class="form-control"
              v-model.number="form.precio_venta"
              required
            />
            <div v-if="errors.precio_venta" class="text-danger small">
              {{ errors.precio_venta[0] }}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="row mb-3">
            <div class="col-6">
              <label for="stock_actual" class="form-label">Stock Actual</label>
              <input
                type="number"
                id="stock_actual"
                class="form-control"
                v-model.number="form.stock_actual"
                required
              />
            </div>
            <div class="col-6">
              <label for="stock_reservado" class="form-label">Stock Reservado</label>
              <input
                type="number"
                id="stock_reservado"
                class="form-control"
                v-model.number="form.stock_reservado"
                required
              />
            </div>

            <div class="col-6">
              <label for="stock_minimo" class="form-label">Stock Mínimo</label>
              <input
                type="number"
                id="stock_minimo"
                class="form-control"
                v-model.number="form.stock_minimo"
                required
              />
            </div>
          </div>

          <div class="row">
            <label for="categoria_id" class="form-label text-truncate">Categoría</label>
            <div class="input-group">
              <select
                id="categoria_id"
                class="form-select"
                v-model.number="form.categoria_id"
                required
              >
                <option disabled value="">Seleccione Categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="$emit('openCategoryModal')"
                title="Administrar Categorías"
              >
                <i class="bi bi-gear-fill"></i>
              </button>
            </div>
            <div v-if="errors.categoria_id" class="text-danger small">
              {{ errors.categoria_id[0] }}
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea
            id="descripcion"
            class="form-control"
            rows="2"
            v-model="form.descripcion"
          ></textarea>
        </div>

        <div class="mb-4 border p-3 rounded">
          <label for="imagen" class="form-label mb-2 fw-bold">Imagen del Producto</label>

          <div v-if="currentImageURL && !imageFile" class="d-flex align-items-center mb-3">
            <img
              :src="currentImageURL"
              alt="Miniatura actual"
              class="img-thumbnail me-3"
              style="width: 80px; height: 80px; object-fit: cover"
            />

            <div>
              <p class="mb-1 small text-muted">Imagen actual:</p>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="clearCurrentImage"
              >
                <i class="bi bi-trash"></i> Eliminar Imagen Actual
              </button>
            </div>
          </div>

          <p v-if="imageURLisBeingCleared" class="mt-1 small text-danger">
            ⚠️ La imagen será eliminada al guardar. Sube un archivo nuevo para anular.
          </p>

          <div class="mb-3">
            <label for="imagen_url_input" class="form-label">O Pegar URL de la Imagen</label>
            <input
              type="url"
              id="imagen_url_input"
              class="form-control"
              v-model="form.imagen_input_url"
              placeholder="https://ejemplo.com/mi-producto.jpg"
              :disabled="imageFile !== null"
            />
            <p class="small text-muted mt-1">Si pegas una URL, el campo de archivo se ignora.</p>
          </div>
          <div :class="{ 'mt-3': currentImageURL }">
            <input
              type="file"
              id="imagen"
              class="form-control"
              @change="handleImageChange"
              accept="image/*"
            />
            <p v-if="currentImageURL" class="small text-muted mt-1">
              Sube un archivo nuevo para reemplazar.
            </p>
          </div>

          <div v-if="errors.imagen" class="text-danger small">{{ errors.imagen[0] }}</div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" @click="resetForm">
            {{ isEditing ? 'Cancelar Edición' : 'Limpiar' }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ProductoService, { type Producto } from '@/services/ProductoService'
import { AxiosError, isAxiosError } from 'axios'
import type { ICategoria } from '@/interfaces/ICategoria'
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user.id)

interface ValidationErrorResponse {
  errors: Record<string, string[]>
}

// --- PROPIEDADES ---
const props = defineProps<{
  /** El producto a editar. Si es null, se está creando. */
  productToEdit: Producto | null
  /** La lista de categorías disponibles para el selector. */
  categories: ICategoria[]
}>()

// --- EMIT EVENTS ---
const emit = defineEmits<{
  /** Evento emitido con el resultado de la operación (éxito/error). */
  (e: 'productSaved', result: { success: boolean; message: string }): void
  /** Evento emitido para abrir el modal de gestión de categorías. */
  (e: 'openCategoryModal'): void
}>()

// --- ESTADO INICIAL ---

interface ProductFormData {
  id: number | null
  nombre: string
  codigo_barra: string | null
  precio_compra: number | null
  precio_venta: number | null
  stock_actual: number | null
  stock_reservado: number | null
  stock_minimo: number | null
  categoria_id: number | null
  descripcion: string | null
  imagen_input_url: string | null
}

// ⬅️ Se mantiene para controlar el modal de categoría en el componente padre
const showCategoryModal = ref(false)

const initialFormState: ProductFormData = {
  id: null,
  nombre: '',
  codigo_barra: null,
  precio_compra: null,
  precio_venta: null,
  stock_actual: null,
  stock_reservado: 0,
  stock_minimo: null,
  categoria_id: null,
  descripcion: null,
  imagen_input_url: null,
}

const form = ref<ProductFormData>({ ...initialFormState })
const imageFile = ref<File | null>(null)
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const currentImageURL = ref<string | null>(null)
const imageURLisBeingCleared = ref(false)

// --- CÁLCULOS ---
const isEditing = computed(() => !!form.value.id)

// --- MÉTODOS ---

/**
 * Abre el modal de gestión de categorías (emite el evento al padre).
 */
watch(showCategoryModal, (newValue) => {
  if (newValue) {
    emit('openCategoryModal')
    // Opcional: reiniciar aquí showCategoryModal a false si el padre se encarga de todo.
    // Por simplicidad, el padre debe escuchar y encargarse de cerrar/abrir su propio modal.
  }
})

/**
 * Establece el estado para que la imagen actual sea eliminada al enviar el formulario.
 */
const clearCurrentImage = () => {
  // 1. Marcar para eliminación (alerta al usuario)
  imageURLisBeingCleared.value = true

  // 2. 💥 CORRECCIÓN CRÍTICA: Limpiar el campo de entrada de URL en el formulario.
  form.value.imagen_input_url = null

  // 3. Anular la subida de cualquier archivo nuevo
  imageFile.value = null

  // 4. Ocultar la miniatura (ya que se va a eliminar)
  currentImageURL.value = null
}

/**
 * Maneja la selección del archivo de imagen.
 */
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  // Si se selecciona un nuevo archivo, anular cualquier solicitud de eliminación previa.
  if (file) {
    imageURLisBeingCleared.value = false
  }

  imageFile.value = file || null
}

/**
 * Convierte los datos del formulario a FormData para el envío.
 * Incluye el manejo del archivo y el método HTTP.
 */
const createFormData = (): FormData => {
  const formData = new FormData()

  for (const key in form.value) {
    const value = form.value[key as keyof ProductFormData]

    // Excluir ID
    if (key === 'id') continue

    if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  }

  if (imageFile.value) {
    // Opción 1: Se sube un nuevo archivo. (Máxima prioridad)
    formData.append('imagen', imageFile.value)
    formData.append('imagen_url', 'null') // Asegurar que Laravel no use la URL existente
  } else if (imageURLisBeingCleared.value) {
    // Opción 2: Se pide eliminar la imagen. (La URL que enviamos es 'null' para el backend)
    // El backend debe interpretar 'null' como solicitud de borrado.
    formData.append('imagen_url', 'null')
  } else if (form.value.imagen_input_url) {
    // Opción 3: Se ingresó o se mantuvo una URL (ya sea la existente o una nueva pegada).
    formData.append('imagen_url', form.value.imagen_input_url)
    // No anexamos 'imagen'
  } else if (currentImageURL.value) {
    // Opción 4: Reutilizar la URL de cache (Si es edición y no se tocó nada, y no es un borrado).
    // Esto es técnicamente innecesario si la URL ya está en form.value.imagen_input_url
    // Pero lo mantendremos como respaldo.
    formData.append('imagen_url', currentImageURL.value)
  }

  return formData
}

/**
 * Envía la forma al servicio para creación o actualización.
 */
const submitForm = async () => {
  isSubmitting.value = true
  errors.value = {}

  const formData = createFormData()
  const productId = form.value.id

  if (currentUserId.value !== null) {
    formData.append('user_id', String(currentUserId.value))
  } else {
    // ⬅️ CAMBIO: Emitir error en lugar de llamar a showNotification/alert
    emit('productSaved', { success: false, message: 'Error: Usuario no autenticado.' })
    isSubmitting.value = false
    return
  }

  // LÓGICA DE MÉTODO HTTP: Forzar PUT/PATCH para la edición
  if (isEditing.value) {
    formData.append('_method', 'PUT')
  }

  try {
    await ProductoService.saveProducto(formData, productId)

    // ⬅️ CAMBIO: Emitir éxito
    emit('productSaved', { success: true, message: 'Producto guardado con éxito!' })
    resetForm()
  } catch (err: unknown) {
    let errorMessage = 'Hubo un error desconocido al guardar el producto.'

    if (isAxiosError(err)) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 422) {
        const data = axiosErr.response.data as ValidationErrorResponse
        errors.value = data.errors
        errorMessage = 'Falló la validación del formulario.'
      } else {
        errorMessage = 'Hubo un error de conexión con el servidor.'
        console.error('Error al guardar:', axiosErr)
      }
    } else {
      console.error('Error al guardar:', err)
    }

    // ⬅️ CAMBIO: Emitir error
    emit('productSaved', { success: false, message: errorMessage })
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Restablece el formulario a su estado inicial.
 */
const resetForm = () => {
  form.value = { ...initialFormState }
  imageFile.value = null
  errors.value = {}
  currentImageURL.value = null // Resetear el cache de imagen
  imageURLisBeingCleared.value = false
}

// --- WATCHER: Cargar datos para edición ---
watch(
  () => props.productToEdit,
  (newProduct) => {
    if (newProduct) {
      // Llenar la forma con datos del producto
      form.value = {
        id: newProduct.id,
        nombre: newProduct.nombre,
        codigo_barra: newProduct.codigo_barra,
        precio_compra: parseFloat(String(newProduct.precio_compra)),
        precio_venta: parseFloat(String(newProduct.precio_venta)),
        stock_actual: newProduct.stock_actual,
        stock_reservado: newProduct.stock_reservado,
        stock_minimo: newProduct.stock_minimo,
        categoria_id: newProduct.categoria_id,
        descripcion: newProduct.descripcion,
        imagen_input_url: newProduct.imagen_url,
      }
      form.value.imagen_input_url = newProduct.imagen_url
      imageFile.value = null
      currentImageURL.value = newProduct.imagen_url
    } else {
      resetForm()
    }
    imageURLisBeingCleared.value = false
  },
  { immediate: true },
)

/* * -------------------------------------------------------------------
 * LISTA DE TAREAS PENDIENTES (TODO)
 * -------------------------------------------------------------------
 */
// TODO: Refactorización y Mejoras Post-Desarrollo
// 1. Atomización:
//    - Separar los inputs de stock/precios en componentes atómicos para mejorar la legibilidad y validación.
//    - Crear un componente ImageUploader.vue para encapsular toda la lógica de miniatura, borrado, cache y selección de archivo.
// 2. Usabilidad (UX):
//    - Añadir una vista previa de la imagen seleccionada (`imageFile`) usando URL.createObjectURL() antes de la subida.
//    - Bloquear la interfaz del formulario mientras `isSubmitting` es true.
// 3. Lógica de Negocio:
//    - Evaluar la necesidad futura de `stock_reservado` y `stock_actual` como campos editables, o si deben ser derivados/calculados por el backend.
</script>

<style scoped>
.card-header {
  font-size: 1.1rem;
}
</style>
