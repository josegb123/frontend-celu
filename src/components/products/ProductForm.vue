<template>
  <div class="card shadow-sm mb-4">
    <div
      class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
    >
      <h5 class="mb-0">{{ isEditing ? 'Editar Producto' : 'Crear Producto' }}</h5>
      <button
        type="button"
        class="btn-close btn-close-white"
        aria-label="Cerrar"
        @click="resetAndClose"
      ></button>
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

        <div class="row mb-3 mt-3">
          <div class="col-md-12">
            <label class="form-label fw-bold">Proveedores asociados</label>
            <SupplierSelector
              :initial-supplier-ids="form.proveedores"
              @update:supplier-ids="(ids) => (form.proveedores = ids)"
            />
            <div v-if="errors.proveedores" class="text-danger small">
              {{ errors.proveedores[0] }}
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
// 🚨 Importar el nuevo componente
import SupplierSelector from '@/components/products/SupplierSelector.vue'

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
  /** 🚨 NUEVO EVENTO: Evento emitido para que el padre cierre el modal. */
  (e: 'close'): void
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
  // 🚨 Campo para los IDs de proveedores
  proveedores: number[]
}

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
  // 🚨 Inicializar el array de proveedores
  proveedores: [],
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
 * Establece el estado para que la imagen actual sea eliminada al enviar el formulario.
 */
const clearCurrentImage = () => {
  imageURLisBeingCleared.value = true
  form.value.imagen_input_url = null
  imageFile.value = null
  currentImageURL.value = null
}

/**
 * Maneja la selección del archivo de imagen.
 */
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    imageURLisBeingCleared.value = false
  }

  imageFile.value = file || null
}

/**
 * Convierte los datos del formulario a FormData para el envío.
 */
const createFormData = (): FormData => {
  const formData = new FormData()
  const { proveedores, imagen_input_url, ...restOfForm } = form.value

  // 1. Manejar el array de proveedores para el formato de Laravel
  if (proveedores && Array.isArray(proveedores)) {
    proveedores.forEach((id) => {
      formData.append('proveedores[]', String(id))
    })
  }

  // 2. Procesar el resto de los campos
  for (const key in restOfForm) {
    const value = restOfForm[key as keyof typeof restOfForm]
    if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  }

  // 3. Lógica de imagen:
  if (imageFile.value) {
    formData.append('imagen', imageFile.value)
    formData.append('imagen_url', 'null')
  } else if (imageURLisBeingCleared.value) {
    formData.append('imagen_url', 'null')
  } else if (imagen_input_url) {
    formData.append('imagen_url', imagen_input_url)
  } else if (currentImageURL.value) {
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
    emit('productSaved', { success: false, message: 'Error: Usuario no autenticado.' })
    isSubmitting.value = false
    return
  }

  if (isEditing.value) {
    formData.append('_method', 'PUT')
  }

  try {
    await ProductoService.saveProducto(formData, productId)

    emit('productSaved', { success: true, message: 'Producto guardado con éxito!' })
    resetAndClose() // 🚨 Cerrar después de guardar exitosamente
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

    emit('productSaved', { success: false, message: errorMessage })
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Restablece el formulario A SU ESTADO INICIAL (vacío).
 */
const resetForm = () => {
  form.value = { ...initialFormState }
  imageFile.value = null
  errors.value = {}
  currentImageURL.value = null
  imageURLisBeingCleared.value = false
}

/**
 * 🚨 NUEVO: Restablece el formulario y emite el evento para que el padre cierre el modal.
 */
const resetAndClose = () => {
  resetForm()
  emit('close') // Emitir evento para que el componente padre oculte el modal
}

// --- WATCHER: Cargar datos para edición ---
watch(
  () => props.productToEdit,
  (newProduct) => {
    if (newProduct) {
      form.value.id = newProduct.id
      form.value.nombre = newProduct.nombre
      form.value.codigo_barra = newProduct.codigo_barra
      form.value.precio_compra = parseFloat(String(newProduct.precio_compra))
      form.value.precio_venta = parseFloat(String(newProduct.precio_venta))
      form.value.stock_actual = newProduct.stock_actual
      form.value.stock_reservado = newProduct.stock_reservado
      form.value.stock_minimo = newProduct.stock_minimo
      form.value.categoria_id = newProduct.categoria_id
      form.value.descripcion = newProduct.descripcion
      form.value.imagen_input_url = newProduct.imagen_url
      form.value.proveedores = (newProduct as any).proveedores
        ? (newProduct as any).proveedores.map((p: { id: number }) => p.id)
        : []

      imageFile.value = null
      currentImageURL.value = newProduct.imagen_url
      errors.value = {} // Limpiar errores al cargar un nuevo producto
    } else {
      resetForm()
    }
    imageURLisBeingCleared.value = false
  },
  { immediate: true },
)
</script>

<style scoped>
.card-header {
  font-size: 1.1rem;
}
/* Estilo opcional para simular mejor el modal (bordes redondeados, etc.) */
.btn-close-white {
  filter: invert(1); /* Hace que la X sea blanca */
}
</style>
