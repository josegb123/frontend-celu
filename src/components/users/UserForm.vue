<template>
  <div class="p-4">
    <h4 class="mb-3 text-primary">{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h4>

    <form @submit.prevent="submitForm">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="name" class="form-label">Nombre</label>
          <input type="text" id="name" class="form-control" v-model="form.name" required />
          <div v-if="errors.name" class="text-danger small">{{ errors.name[0] }}</div>
        </div>

        <div class="col-md-6">
          <label for="role" class="form-label">Rol</label>
          <select id="role" class="form-select" v-model="form.role" required>
            <option disabled value="">Seleccione Rol</option>
            <option value="admin">Administrador</option>
            <option value="seller">Vendedor</option>
            <option value="editor">Editor</option>
          </select>
          <div v-if="errors.role" class="text-danger small">{{ errors.role[0] }}</div>
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" id="email" class="form-control" v-model="form.email" required />
        <div v-if="errors.email" class="text-danger small">{{ errors.email[0] }}</div>
      </div>

      <hr />

      <div class="row mb-3">
        <div class="col-md-6">
          <label for="password" class="form-label">
            Contraseña
            <span v-if="isEditing" class="small text-muted"
              >(Opcional: Dejar vacío para no cambiar)</span
            >
          </label>
          <input
            type="password"
            id="password"
            class="form-control"
            v-model="form.password"
            :required="!isEditing"
          />
          <div v-if="errors.password" class="text-danger small">{{ errors.password[0] }}</div>
        </div>

        <div class="col-md-6">
          <label for="password_confirmation" class="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            id="password_confirmation"
            class="form-control"
            v-model="form.password_confirmation"
            :required="!isEditing && !!form.password"
          />
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ isEditing ? 'Actualizar Usuario' : 'Crear Usuario' }}
        </button>
      </div>
    </form>
  </div>
</template>

// src/components/users/UserForm.vue

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UserService from '@/services/UserService'
import type { IUser } from '@/interfaces/IUser'
import { isAxiosError, type AxiosError } from 'axios'

// --- PROPIEDADES Y EMITS ---

const props = defineProps<{
  userToEdit: IUser | null
}>()

const emit = defineEmits<{
  (e: 'userSaved', success: boolean, message: string): void
  (e: 'close'): void
}>()

// --- TIPOS ---

interface FormData {
  id: number | null
  name: string
  email: string
  role: string
  password?: string
  password_confirmation?: string
}

interface ValidationErrorResponse {
  errors: Record<string, string[]>
}

// --- ESTADO ---

const initialFormState: FormData = {
  id: null,
  name: '',
  email: '',
  role: '',
  password: '',
  password_confirmation: '',
}

type UserApiData = Omit<FormData, 'id'>

interface ValidationErrorResponse {
  errors: Record<string, string[]>
}
const form = ref<FormData>({ ...initialFormState })
const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// --- CÁLCULOS ---

const isEditing = computed(() => !!form.value.id)

// --- MÉTODOS ---

/**
 * Envía el formulario para crear o actualizar un usuario.
 */
const submitForm = async () => {
  isSubmitting.value = true
  errors.value = {}

  // Prepara los datos a enviar, excluyendo campos vacíos o nulos
  const dataToSend: UserApiData = { ...form.value }

  // 2. Si estamos editando y la contraseña está vacía, la eliminamos para que Laravel la ignore.
  if (isEditing.value && (!dataToSend.password || dataToSend.password.trim() === '')) {
    delete dataToSend.password
    delete dataToSend.password_confirmation
  }

  try {
    const savedUser = await UserService.saveUser(dataToSend, form.value.id)
    // Éxito
    emit('userSaved', true, `Usuario "${savedUser.name}" guardado exitosamente.`)
    // Opcional: Podrías llamar a resetForm() aquí si el modal no se cierra automáticamente
    emit('close')
  } catch (err: unknown) {
    let errorMessage = 'Hubo un error desconocido al guardar el usuario.'

    if (isAxiosError(err)) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 422) {
        const data = axiosErr.response.data as ValidationErrorResponse
        errors.value = data.errors
        errorMessage = 'Falló la validación del formulario. Revise los campos.'
      } else if (axiosErr.response?.status === 403) {
        // Error de autorización (si el frontend intenta engañar al backend)
        errorMessage = 'Acceso denegado. No tienes permisos para realizar esta acción.'
      } else {
        errorMessage = 'Error de conexión con el servidor.'
      }
    }

    // Fallo
    emit('userSaved', false, errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Restablece el formulario a su estado inicial.
 */
const resetForm = () => {
  form.value = { ...initialFormState }
  errors.value = {}
}

// --- WATCHER: Carga de datos para edición ---

watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      // Carga los datos existentes
      form.value = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: '', // Siempre limpia la contraseña al cargar para edición
        password_confirmation: '',
      }
    } else {
      // Si el userToEdit es null (modo creación), resetea el formulario
      resetForm()
    }
  },
  { immediate: true },
)
</script>
