<template>
  <div v-if="show" class="modal d-block fade show" tabindex="-1" @click.self="emit('close')">
    <div class="modal-dialog modal-md">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">💰 Registrar Abono</h5>
          <button type="button" class="btn-close btn-close-white" @click="emit('close')"></button>
        </div>

        <div class="modal-body">
          <div v-if="cuenta" class="alert alert-info small p-2 mb-3">
            Cliente: **{{ cuenta.cliente?.nombre || 'N/A' }}** | Venta ID: **{{ cuenta.venta_id }}**
            | Pendiente: **${{ Number(cuenta.monto_pendiente).toFixed(2) }}**
          </div>

          <form @submit.prevent="submitAbono">
            <div class="mb-3">
              <label for="montoAbonar" class="form-label fw-bold">Monto a Abonar</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  id="montoAbonar"
                  type="number"
                  v-model.number="montoAbono"
                  :min="1"
                  :max="Number(cuenta?.monto_pendiente)"
                  step="0.01"
                  class="form-control"
                  :class="{ 'is-invalid': errors.monto }"
                  required
                />
              </div>
              <div v-if="errors.monto" class="invalid-feedback d-block">{{ errors.monto }}</div>
              <small class="form-text text-muted"
                >Monto máximo: ${{ Number(cuenta?.monto_pendiente).toFixed(2) }}</small
              >
            </div>

            <div class="mb-3">
              <label for="metodoPago" class="form-label fw-bold">Método de Pago</label>
              <select
                id="metodoPago"
                v-model="metodo"
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

            <div class="mb-3">
              <label for="referenciaPago" class="form-label"
                >Referencia (ej: N° Transferencia)</label
              >
              <input
                id="referenciaPago"
                type="text"
                v-model="referencia"
                class="form-control"
                maxlength="100"
              />
              <div v-if="errors.referencia_pago" class="invalid-feedback d-block">
                {{ errors.referencia_pago }}
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
                class="btn btn-success"
                :disabled="isProcessing || montoAbono <= 0 || !cuenta"
              >
                <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                {{ isProcessing ? 'Procesando...' : 'Confirmar Abono' }}
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
import { ref, watch } from 'vue'
import AbonoService from '@/services/AbonoService'
import type { CuentaPorCobrar, StoreAbonoPayload, Abono } from '@/interfaces/IAbono'
import axios from 'axios'

// Interfaces Locales
type PagoMetodo = 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro'
interface FormErrors {
  [key: string]: string | null
}

// --- PROPS y EMITS ---
const props = defineProps<{
  // La cuenta a la que se aplica el abono. Debe incluir el monto_pendiente.
  cuenta: CuentaPorCobrar | null
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'abono-success', abono: Abono): void // Evento para que la vista principal recargue o actualice la cuenta
}>()

// --- ESTADO LOCAL ---
const montoAbono = ref(0.0)
const metodo = ref<PagoMetodo>('efectivo')
const referencia = ref('')
const isProcessing = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const errors = ref<FormErrors>({})

// --- LÓGICA ---

/**
 * Resetea el formulario al abrir el modal o si se cierra.
 */
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Al abrir, resetear
      montoAbono.value = props.cuenta ? Number(props.cuenta.monto_pendiente) : 0.0
      metodo.value = 'efectivo'
      referencia.value = ''
      successMessage.value = null
      errorMessage.value = null
      errors.value = {}
    }
  },
)

/**
 * Validaciones básicas del lado del cliente.
 */
const validateForm = (): boolean => {
  errors.value = {}
  if (!props.cuenta) return false

  if (montoAbono.value <= 0) {
    errors.value.monto = 'El monto debe ser positivo.'
  }
  if (montoAbono.value > Number(props.cuenta.monto_pendiente)) {
    errors.value.monto = `El monto excede el saldo pendiente ($${Number(props.cuenta.monto_pendiente).toFixed(2)}).`
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Envía la solicitud de registro del abono a la API.
 */
const submitAbono = async () => {
  if (!props.cuenta || !validateForm()) {
    return
  }

  const payload: StoreAbonoPayload = {
    cuenta_por_cobrar_id: props.cuenta.id,
    monto: montoAbono.value,
    metodo_pago: metodo.value,
    referencia_pago: referencia.value || null,
  }

  isProcessing.value = true
  errorMessage.value = null
  successMessage.value = null
  errors.value = {}

  try {
    const response = await AbonoService.registrarAbono(payload)

    // Éxito:
    successMessage.value = response.message
    emit('abono-success', response.abono)

    // Cierra el modal después de un breve éxito (opcional)
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
        errorMessage.value = errorData.message || 'Error de validación al registrar abono.'
      } else if (error.message) {
        errorMessage.value = `Error en la API: ${error.message}`
      }
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al procesar el abono.'
      console.error('Error no Axios:', error)
    }
  } finally {
    isProcessing.value = false
  }
}
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
