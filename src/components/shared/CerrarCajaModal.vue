<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px)"
    :data-bs-backdrop="esObligatorio ? 'static' : true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i
              class="bi"
              :class="esObligatorio ? 'bi-exclamation-octagon-fill' : 'bi-cash-stack'"
            ></i>
            {{ esObligatorio ? ' Cierre de Caja Pendiente' : ' Cierre de Caja Diario' }}
          </h5>
          <button
            v-if="!esObligatorio"
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
          <router-link :to="{ name: 'home' }" v-if="esObligatorio" class="btn-close"></router-link>
        </div>

        <div class="modal-body">
          <div v-if="esObligatorio" class="alert alert-danger d-flex align-items-center small">
            <i class="bi bi-info-circle-fill me-2"></i>
            Se detectó una caja abierta de una fecha anterior. Debe cerrarla para continuar.
          </div>
          <p>
            Monto Teórico Actual:
            <span class="fw-bold text-success">{{ montoTeoricoFormateado }}</span>
          </p>
          <div v-if="cajaStore.isLoading" class="text-center text-muted fst-italic my-3">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Calculando flujos...
          </div>

          <form @submit.prevent="submitCierreCaja">
            <div class="mb-3">
              <label for="montoFisico" class="form-label"
                >Monto de Cierre Físico Contado ($):</label
              >
              <input
                type="number"
                id="montoFisico"
                v-model.number="montoCierreFisico"
                step="0.01"
                min="0"
                required
                class="form-control form-control-lg"
                :disabled="cajaStore.isLoading"
              />
            </div>

            <div
              v-if="localError || cajaStore.error"
              class="alert alert-danger p-2 small"
              role="alert"
            >
              {{ localError || cajaStore.error }}
              <p class="mb-0 mt-1 fst-italic text-sm-start" v-if="cajaStore.cajaActiva">
                [DEBUG Caja ID: {{ cajaStore.cajaActiva.id }}]
              </p>
            </div>

            <button
              type="submit"
              class="btn btn-danger w-100"
              :disabled="cajaStore.isLoading || montoCierreFisico === null || montoCierreFisico < 0"
            >
              <span v-if="cajaStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ cajaStore.isLoading ? 'Procesando Cierre...' : 'Confirmar Cierre de Caja' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' // 🚨 Importar onMounted
import { useCajaStore, type ReporteCierre } from '@/store/useCajaStore'
import { AxiosError } from 'axios'

// Definición de eventos que emite el componente
const emit = defineEmits(['close', 'closed'])

// Inicialización de Stores y Estado
const cajaStore = useCajaStore()

const props = defineProps<{ esObligatorio: boolean }>()
const esObligatorio = computed(() => props.esObligatorio)

// 🚨 CAMBIO CLAVE: Inicializar con el monto teórico actual.
// Esto permite al usuario ver y potencialmente editar el valor esperado.
const montoCierreFisico = ref<number | null>(cajaStore.montoTeoricoActual)
const localError = ref<string | null>(null)

// 🚨 Opcional, pero útil: Recalcular el monto al abrir el modal para tener el valor más reciente
onMounted(() => {
  if (cajaStore.isCajaAbierta && !cajaStore.isLoading) {
    cajaStore.calcularMontoTeorico()
  }
})

// Propiedad computada para mostrar el monto teórico de forma legible (ej. con formato de moneda)
const montoTeoricoFormateado = computed(() => {
  // Usamos Intl.NumberFormat para una representación de moneda clara
  // Nota: Ajusta 'es-CO' y 'COP' a tu configuración regional y moneda.
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(
    cajaStore.montoTeoricoActual,
  )
})

/**
 * @description Ejecuta la acción de cierre de caja, maneja errores y emite eventos.
 */
async function submitCierreCaja() {
  if (montoCierreFisico.value === null || montoCierreFisico.value < 0) {
    localError.value = 'Debe ingresar un monto físico válido y positivo.'
    return
  }

  localError.value = null

  try {
    // La acción closeCaja en el store ya fue modificada para enviar monto_cierre_teorico,
    // que se toma de cajaStore.montoTeoricoActual (gestionado por el store).
    const reporte: ReporteCierre | false = await cajaStore.closeCaja(montoCierreFisico.value)

    if (reporte) {
      // Notificar al padre que la caja se cerró, para que pueda disparar una acción de reporte
      emit('closed', reporte)
      emit('close') // Cerrar el modal
    } else {
      // Si closeCaja retorna false (ej. no hay caja activa), mostramos error local
      localError.value = 'El cierre de caja falló por un error de estado interno.'
    }
  } catch (err: unknown) {
    // Captura de errores de la API (AxiosError)
    const axiosError = err as AxiosError<{ message: string }>
    // Si la API devuelve un mensaje específico sobre la diferencia, se mostrará aquí.
    localError.value =
      axiosError.response?.data?.message || 'Error desconocido al procesar el cierre.'
    console.error('CajaCerrarModal: Error en la API durante el cierre:', err)
  }
}
</script>

<style scoped>
/* Estilos mínimos para simular el modal de Bootstrap */
.modal {
  overflow: auto; /* Para que sea scrollable si la pantalla es pequeña */
}
</style>
