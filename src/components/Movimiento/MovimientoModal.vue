<template>
  <div v-if="show" class="modal d-block fade show" tabindex="-1" @click.self="emit('close')">
    <div class="modal-dialog modal-md">
      <div class="modal-content">
        <div class="modal-header text-white" :class="headerClass">
          <h5 class="modal-title">
            <i class="bi me-2" :class="iconClass"></i>
            Registrar {{ isIngreso ? 'Ingreso' : 'Egreso' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="emit('close')"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitMovimiento">
            <div class="mb-3">
              <label for="tipoMovimiento" class="form-label fw-bold">
                Categoría / Tipo de {{ isIngreso ? 'Ingreso' : 'Egreso' }}
              </label>
              <select
                id="tipoMovimiento"
                v-model="form.tipo_movimiento_nombre"
                class="form-select"
                :class="{ 'is-invalid': errors.tipo_movimiento_nombre }"
                required
              >
                <option value="" disabled>Seleccione una opción</option>
                <option v-for="tipo in filteredTipos" :key="tipo.nombre" :value="tipo.nombre">
                  {{ tipo.nombre }}
                </option>
              </select>
              <div v-if="errors.tipo_movimiento_nombre" class="invalid-feedback d-block">
                {{ errors.tipo_movimiento_nombre }}
              </div>
            </div>

            <div class="mb-3">
              <label for="monto" class="form-label fw-bold">Monto</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  id="monto"
                  type="number"
                  v-model.number="form.monto"
                  :min="0.01"
                  step="0.01"
                  class="form-control"
                  :class="{ 'is-invalid': errors.monto }"
                  required
                />
              </div>
              <div v-if="errors.monto" class="invalid-feedback d-block">{{ errors.monto }}</div>
            </div>

            <div class="mb-3">
              <label for="descripcion" class="form-label fw-bold">Descripción / Detalle</label>
              <input
                id="descripcion"
                type="text"
                v-model="form.descripcion"
                class="form-control"
                :class="{ 'is-invalid': errors.descripcion }"
                maxlength="255"
                required
              />
              <div v-if="errors.descripcion" class="invalid-feedback d-block">
                {{ errors.descripcion }}
              </div>
            </div>

            <div class="mb-3">
              <label for="metodoPago" class="form-label fw-bold">Método de Pago</label>
              <select
                id="metodoPago"
                v-model="form.metodo_pago"
                class="form-select"
                :class="{ 'is-invalid': errors.metodo_pago }"
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="otro">Otro</option>
              </select>
              <div v-if="errors.metodo_pago" class="invalid-feedback d-block">
                {{ errors.metodo_pago }}
              </div>
            </div>

            <div v-if="successMessage" class="alert alert-success mt-3 small p-2">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-danger mt-3 small p-2">
              {{ errorMessage }}
            </div>

            <div class="d-grid gap-2 mt-4">
              <button
                type="submit"
                class="btn"
                :class="submitButtonClass"
                :disabled="isProcessing || form.monto <= 0 || !form.tipo_movimiento_nombre"
              >
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                Confirmar {{ isIngreso ? 'Ingreso' : 'Egreso' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import MovimientoFinancieroService, {
  type StoreMovimientoPayload,
} from '@/services/MovimientoFinancieroService'
import type { MovimientoFinanciero, TipoMovimiento } from '@/interfaces/IMovimientoFinanciero'
import axios, { type AxiosError } from 'axios'
import { get } from 'lodash'
import { tipoMovimientoService } from '@/services/TipoMovimientoService'

// --- Interfaces Locales/Helpers ---

// ⚠️ Esta interfaz debe coincidir con la lista de categorías que obtienes del backend
interface TipoMovimientoItem {
  id: number
  nombre: string
  tipo: TipoMovimiento // 'Ingreso' o 'Egreso'
  descripcion: string
}

// Interfaz para los errores de validación de Laravel
interface FormErrors {
  [key: string]: string[] | string | null
}

// --- PROPS y EMITS ---
const props = defineProps<{
  // Tipo del movimiento a registrar: 'Ingreso' o 'Egreso'
  tipo: TipoMovimiento
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'movimiento-success', movimiento: MovimientoFinanciero): void // Recarga la tabla
}>()

// --- ESTADO LOCAL ---
const initialForm: StoreMovimientoPayload = {
  monto: 0.0,
  metodo_pago: 'efectivo',
  descripcion: '',
  tipo_movimiento_nombre: '',
  user_id: 0, // ⚠️ Opcional: Asignar el ID del usuario actual si es necesario
}

const form = ref<StoreMovimientoPayload>({ ...initialForm })
const tiposMovimiento = ref<TipoMovimientoItem[]>([])

const isProcessing = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const errors = ref<FormErrors>({})

// --- COMPUTADAS Y ESTILOS ---

const isIngreso = computed(() => props.tipo === 'Ingreso')

const headerClass = computed(() => (isIngreso.value ? 'bg-success' : 'bg-danger'))
const iconClass = computed(() => (isIngreso.value ? 'bi-currency-dollar' : 'bi-dash-circle-fill'))
const submitButtonClass = computed(() => (isIngreso.value ? 'btn-success' : 'btn-danger'))

const filteredTipos = computed(() => {
  // Filtra los tipos de movimiento disponibles según si estamos en modo Ingreso o Egreso
  return tiposMovimiento.value.filter((tipo) => tipo.tipo === props.tipo)
})

// --- MÉTODOS ---

/**
 * Carga la lista de Tipos de Movimiento (Categorías) desde la API.
 */
const fetchTiposMovimiento = async () => {
  try {
    const response = await tipoMovimientoService.getTiposMovimiento()
    tiposMovimiento.value = response
  } catch (error) {
    console.error('Error al cargar tipos de movimiento:', error)
  }
}

/**
 * Resetea el formulario al abrir el modal.
 */
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Al abrir, resetear el formulario y establecer el primer tipo filtrado como defecto
      form.value = { ...initialForm }
      form.value.tipo_movimiento_nombre = filteredTipos.value[0]?.nombre || ''

      successMessage.value = null
      errorMessage.value = null
      errors.value = {}
    }
  },
)

/**
 * Envía la solicitud de registro del movimiento a la API.
 */
const submitMovimiento = async () => {
  if (form.value.monto <= 0 || !form.value.tipo_movimiento_nombre) {
    return
  }

  // Preparamos el payload final
  const payload: StoreMovimientoPayload = {
    ...form.value,
    referencia_tabla: 'manual',
    referencia_id: 0,
    user_id: get(form.value, 'user_id', 0),
  }

  isProcessing.value = true
  errorMessage.value = null
  successMessage.value = null
  errors.value = {}

  try {
    const movimiento = await MovimientoFinancieroService.storeMovimiento(payload)

    // Éxito:
    successMessage.value = `¡${props.tipo} registrado con éxito!`
    emit('movimiento-success', movimiento)

    // Cierra el modal después de un breve éxito
    setTimeout(() => {
      emit('close')
    }, 1500)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        const errorData = error.response.data as { errors?: FormErrors; message?: string }

        if (errorData.errors) {
          for (const key in errorData.errors) {
            const errorMsg = Array.isArray(errorData.errors[key])
              ? errorData.errors[key][0]
              : errorData.errors[key]
            errors.value[key] = errorMsg
          }
        }
        errorMessage.value =
          errorData.message || `Error de validación al registrar ${props.tipo.toLowerCase()}.`
      } else {
        errorMessage.value =
          error.message || `Error en la API al registrar ${props.tipo.toLowerCase()}.`
      }
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al procesar la solicitud.'
      console.error('Error no Axios:', error)
    }
  } finally {
    isProcessing.value = false
  }
}

onMounted(fetchTiposMovimiento)
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.6);
  overflow-y: auto;
}
.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
</style>
