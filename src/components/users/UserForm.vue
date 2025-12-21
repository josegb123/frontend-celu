<template>
  <div class="p-4">
    <h4 class="mb-3 text-primary">{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h4>

    <form @submit.prevent="submitForm">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            class="form-control"
            :class="{ 'is-invalid': errors.name || clientErrors.name.length > 0 }"
            v-model="form.name"
            required
            @input="validateField('name')"
            @blur="validateField('name')"
          />
          <div
            v-if="errors.name || clientErrors.name.length > 0"
            class="invalid-feedback d-block small"
          >
            {{ (errors.name && errors.name[0]) || clientErrors.name[0] }}
          </div>
        </div>

        <div class="col-md-6">
          <label for="role" class="form-label">Rol</label>
          <select
            id="role"
            class="form-select"
            :class="{ 'is-invalid': errors.role || clientErrors.role.length > 0 }"
            v-model="form.role"
            required
            @change="validateField('role')"
          >
            <option disabled value="">Seleccione Rol</option>
            <option value="admin">Administrador</option>
            <option value="seller">Vendedor</option>
          </select>
          <div
            v-if="errors.role || clientErrors.role.length > 0"
            class="invalid-feedback d-block small"
          >
            {{ (errors.role && errors.role[0]) || clientErrors.role[0] }}
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email || clientErrors.email.length > 0 }"
          v-model="form.email"
          required
          @input="validateField('email')"
          @blur="validateField('email')"
        />
        <div
          v-if="errors.email || clientErrors.email.length > 0"
          class="invalid-feedback d-block small"
        >
          {{ (errors.email && errors.email[0]) || clientErrors.email[0] }}
        </div>
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
          <div class="input-group">
            <input
              :type="passwordVisible.password ? 'text' : 'password'"
              id="password"
              class="form-control"
              :class="{ 'is-invalid': errors.password || clientErrors.password.length > 0 }"
              v-model="form.password"
              :required="!isEditing"
              @input="validateField('password')"
              @blur="validateField('password')"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="togglePasswordVisibility('password')"
              title="Mostrar/Ocultar Contraseña"
            >
              <i :class="passwordVisible.password ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div
            v-if="errors.password || clientErrors.password.length > 0"
            class="invalid-feedback d-block small"
          >
            <ul class="list-unstyled mb-0">
              <li v-for="err in errors.password || clientErrors.password" :key="err">
                {{ err }}
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-6">
          <label for="password_confirmation" class="form-label">Confirmar Contraseña</label>
          <div class="input-group">
            <input
              :type="passwordVisible.confirmation ? 'text' : 'password'"
              id="password_confirmation"
              class="form-control"
              :class="{ 'is-invalid': clientErrors.password_confirmation.length > 0 }"
              v-model="form.password_confirmation"
              :required="!isEditing && !!form.password"
              @input="validateField('password_confirmation')"
              @blur="validateField('password_confirmation')"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="togglePasswordVisibility('confirmation')"
              title="Mostrar/Ocultar Contraseña"
            >
              <i :class="passwordVisible.confirmation ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div
            v-if="clientErrors.password_confirmation.length > 0"
            class="invalid-feedback d-block small"
          >
            {{ clientErrors.password_confirmation[0] }}
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UserService from '@/services/UserService'
import type { IUser } from '@/interfaces/IUser'
import { isAxiosError, type AxiosError } from 'axios'

// --- TIPOS ---

/**
 * @interface FormData
 * Estructura de los datos del formulario.
 */
interface FormData {
  id: number | null
  name: string
  email: string
  role: string
  password?: string
  password_confirmation?: string
}

/**
 * @interface ValidationErrorResponse
 * Estructura de la respuesta de error 422 de Laravel.
 */
interface ValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

/**
 * @interface ClientErrors
 * Estructura de los errores de validación de cliente.
 * Garantiza que cada campo esperado existe y es un array de strings.
 */
interface ClientErrors {
  name: string[]
  email: string[]
  role: string[]
  password: string[]
  password_confirmation: string[]
}

/**
 * Tipo para los datos enviados a la API (sin 'id').
 */
type UserApiData = Omit<FormData, 'id'>

// --- PROPIEDADES Y EMITS ---

const props = defineProps<{
  /** Usuario a editar. Es null en modo creación. */
  userToEdit: IUser | null
}>()

const emit = defineEmits<{
  /** Se emite al guardar o fallar al guardar el usuario. */
  (e: 'userSaved', success: boolean, message: string): void
  /** Se emite para solicitar el cierre del modal. */
  (e: 'close'): void
}>()

// --- ESTADO ---

const initialFormState: FormData = {
  id: null,
  name: '',
  email: '',
  role: '',
  password: '',
  password_confirmation: '',
}

const form = ref<FormData>({ ...initialFormState })
const errors = ref<Record<string, string[]>>({}) // Errores del servidor (HTTP 422)

// Inicialización tipada para resolver errores de VS Code
const clientErrors = ref<ClientErrors>({
  name: [],
  email: [],
  role: [],
  password: [],
  password_confirmation: [],
})

const isSubmitting = ref(false)
const passwordVisible = ref({
  password: false,
  confirmation: false,
})

// --- CÁLCULOS ---

/** Determina si el formulario está en modo edición o creación. */
const isEditing = computed(() => !!form.value.id)

/** Determina si el formulario es válido a nivel de cliente. */
const isFormValid = computed(() => {
  return (
    Object.values(clientErrors.value).every((errArray) => errArray.length === 0) &&
    form.value.name.trim() !== '' &&
    form.value.role.trim() !== '' &&
    form.value.email.trim() !== '' &&
    (isEditing.value ||
      (form.value.password?.trim() !== '' && form.value.password_confirmation?.trim() !== ''))
  )
})

// --- MÉTODOS DE VALIDACIÓN REACTIVA ---

/**
 * Valida un campo específico y actualiza los errores de cliente.
 * @param field El campo a validar ('name', 'email', etc.)
 */
const validateField = (field: keyof ClientErrors) => {
  // Limpiamos los errores del cliente y del servidor para este campo.
  clientErrors.value[field] = []
  if (errors.value[field]) {
    delete errors.value[field]
  }

  const value = (form.value[field] as string) || '' // Asegurar que es string o cadena vacía

  // Reglas de Validación (Cliente)

  if (field === 'name' && value === '') {
    clientErrors.value.name.push('El nombre es obligatorio.')
  }

  // FIX: Validamos que el valor no sea la opción disabled ("")
  if (field === 'role' && value === '') {
    clientErrors.value.role.push('El rol es obligatorio.')
  }

  if (field === 'email' && value === '') {
    clientErrors.value.email.push('El email es obligatorio.')
  } else if (field === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
    clientErrors.value.email.push('Formato de email inválido.')
  }

  // Lógica de Contraseñas
  if (field === 'password' || field === 'password_confirmation') {
    const password = form.value.password || ''
    const confirmation = form.value.password_confirmation || ''

    // Si el campo es opcional y está vacío, no se aplican las reglas de seguridad
    const isPasswordOptionalAndEmpty = isEditing.value && password === ''

    if (!isPasswordOptionalAndEmpty) {
      // Contraseña Requerida en Creación
      if (!isEditing.value && password === '') {
        clientErrors.value.password.push('La contraseña es obligatoria en modo creación.')
      }

      // Reglas de seguridad
      if (password.length > 0) {
        if (password.length < 8) {
          clientErrors.value.password.push('Debe tener al menos 8 caracteres.')
        }
        if (!/[A-Z]/.test(password)) {
          clientErrors.value.password.push('Debe contener al menos una letra mayúscula.')
        }
        if (!/[a-z]/.test(password)) {
          clientErrors.value.password.push('Debe contener al menos una letra minúscula.')
        }
        if (!/[0-9]/.test(password)) {
          clientErrors.value.password.push('Debe contener al menos un número.')
        }
        if (!/[!@#$%^&*()]/.test(password)) {
          clientErrors.value.password.push('Debe contener al menos un símbolo (!@#$...).')
        }
      }
    }

    // Regla de Confirmación
    if (password !== confirmation && (password.length > 0 || confirmation.length > 0)) {
      clientErrors.value.password_confirmation.push('Las contraseñas no coinciden.')
    } else {
      // Limpiar el error de confirmación si coinciden
      clientErrors.value.password_confirmation = []
    }
  }
}

/**
 * Ejecuta la validación de todos los campos. Usado antes del submit.
 * @returns boolean - True si todos los campos son válidos.
 */
const validateAllFields = (): boolean => {
  ;(Object.keys(clientErrors.value) as Array<keyof ClientErrors>).forEach(validateField)
  return isFormValid.value
}

// --- MÉTODOS DE VISIBILIDAD DE CONTRASEÑA ---

/**
 * Alterna la visibilidad de un campo de contraseña.
 * @param field La clave del campo a alternar ('password' o 'confirmation').
 */
const togglePasswordVisibility = (field: 'password' | 'confirmation') => {
  passwordVisible.value[field] = !passwordVisible.value[field]
}

// --- MÉTODOS CRUD ---

/**
 * Envía el formulario para crear o actualizar un usuario.
 */
const submitForm = async () => {
  if (!validateAllFields()) {
    return // La validación del cliente falló
  }

  isSubmitting.value = true
  errors.value = {}

  const dataToSend: UserApiData = { ...form.value }

  // Lógica de limpieza de contraseñas si estamos editando y el campo está vacío
  if (isEditing.value && (!dataToSend.password || dataToSend.password.trim() === '')) {
    delete dataToSend.password
    delete dataToSend.password_confirmation
  }

  try {
    const savedUser = await UserService.saveUser(dataToSend, form.value.id)
    emit('userSaved', true, `Usuario "${savedUser.name}" guardado exitosamente.`)
  } catch (err: unknown) {
    let errorMessage = 'Hubo un error desconocido al guardar el usuario.'

    if (isAxiosError(err)) {
      const axiosErr = err as AxiosError

      if (axiosErr.response && axiosErr.response.data && axiosErr.response.status === 422) {
        // Manejo del Error de Validación (Status 422)
        const data = axiosErr.response.data as ValidationErrorResponse
        errors.value = data.errors
        errorMessage = 'Falló la validación del formulario. Revise los campos: ' + data.message
      } else if (axiosErr.response?.status === 403) {
        errorMessage = 'Acceso denegado. No tienes permisos para realizar esta acción.'
      } else {
        errorMessage = 'Error de conexión con el servidor o error interno inesperado.'
      }
    }
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
  clientErrors.value = {
    name: [],
    email: [],
    role: [],
    password: [],
    password_confirmation: [],
  }
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
        password: '',
        password_confirmation: '',
      }
    } else {
      // Si el userToEdit es null (modo creación), resetea el formulario
      resetForm()
    }
  },
  { immediate: true },
)

// Observa los campos de contraseña para mantener la validación de coincidencia
watch([() => form.value.password, () => form.value.password_confirmation], () => {
  validateField('password_confirmation')
})
</script>
