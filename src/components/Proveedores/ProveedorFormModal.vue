<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { proveedorService } from '@/services/proveedorService' // Necesario para la lógica de guardado

// Define las interfaces necesarias
interface ProveedorDTO {
  nombre_comercial: string
  nombre_contacto?: string | null
  identificacion?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  ciudad?: string | null
  notas?: string | null
  activo: boolean
}

// Interfaz para la data que llega del padre (incluye el ID para saber si es edición)
interface FormDataType extends ProveedorDTO {
  id: number | null
}

const props = defineProps<{
  // v-model:visible (propiedad para controlar la visibilidad del modal)
  visible: boolean
  // Datos iniciales para precargar el formulario (creación o edición)
  initialData: FormDataType
}>()

// 1. Definición de Emits
const emit = defineEmits(['update:visible', 'saved'])

// Estado interno
const localLoading = ref(false)
const formState = reactive<FormDataType>({ ...props.initialData })
const formTitle = computed(() => (formState.id ? 'Editar Proveedor' : 'Crear Proveedor'))

// 2. Sincronización de Props (Usamos watch para copiar initialData cuando cambia la visibilidad)
watch(
  () => props.initialData,
  (newVal) => {
    // Esto asegura que el formulario se resetee o cargue nuevos datos al abrir
    Object.assign(formState, newVal)
  },
  { deep: true },
)

// 3. Lógica de guardado
async function saveProveedor() {
  if (!formState.nombre_comercial) {
    alert('El Nombre Comercial es obligatorio.')
    return
  }

  const dataToSend: ProveedorDTO = {
    nombre_comercial: formState.nombre_comercial,
    nombre_contacto: formState.nombre_contacto,
    identificacion: formState.identificacion,
    telefono: formState.telefono,
    email: formState.email,
    direccion: formState.direccion,
    ciudad: formState.ciudad,
    notas: formState.notas,
    activo: formState.activo,
  }

  try {
    localLoading.value = true
    if (formState.id) {
      await proveedorService.update(formState.id, dataToSend)
    } else {
      await proveedorService.create(dataToSend)
    }

    // Notificar al padre que la operación fue exitosa
    emit('saved')
  } catch (err: any) {
    console.error('Error al guardar proveedor:', err)
    alert('Error al guardar el proveedor. Revisa la consola para más detalles.')
  } finally {
    localLoading.value = false
  }
}

// 4. Función para cerrar el modal (actualizando el v-model)
function closeModal() {
  emit('update:visible', false)
}
</script>

<template>
  <div
    v-if="visible"
    class="modal d-block"
    id="proveedorModal"
    tabindex="-1"
    aria-labelledby="proveedorModalLabel"
    aria-modal="true"
    role="dialog"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <form @submit.prevent="saveProveedor">
          <div class="modal-header">
            <h5 class="modal-title" id="proveedorModalLabel">{{ formTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
              :disabled="localLoading"
              aria-label="Cerrar"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="nombreComercial" class="form-label"
                  >Nombre Comercial <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  id="nombreComercial"
                  v-model.trim="formState.nombre_comercial"
                  required
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-md-6">
                <label for="nombreContacto" class="form-label">Nombre Contacto</label>
                <input
                  type="text"
                  id="nombreContacto"
                  v-model.trim="formState.nombre_contacto"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-md-6">
                <label for="identificacion" class="form-label">Identificación</label>
                <input
                  type="text"
                  id="identificacion"
                  v-model.trim="formState.identificacion"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-md-6">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model.trim="formState.email"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-md-6">
                <label for="telefono" class="form-label">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  v-model.trim="formState.telefono"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-md-6">
                <label for="ciudad" class="form-label">Ciudad</label>
                <input
                  type="text"
                  id="ciudad"
                  v-model.trim="formState.ciudad"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-12">
                <label for="direccion" class="form-label">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  v-model.trim="formState.direccion"
                  class="form-control"
                  :disabled="localLoading"
                />
              </div>

              <div class="col-12">
                <label for="notas" class="form-label">Notas</label>
                <textarea
                  id="notas"
                  v-model.trim="formState.notas"
                  rows="3"
                  class="form-control"
                  :disabled="localLoading"
                ></textarea>
              </div>

              <div class="col-12">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="activo"
                    v-model="formState.activo"
                    :disabled="localLoading"
                  />
                  <label class="form-check-label" for="activo"> Proveedor Activo </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="localLoading"
            >
              Cerrar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="localLoading">
              <span
                v-if="localLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ formState.id ? 'Actualizar' : 'Crear' }} Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
