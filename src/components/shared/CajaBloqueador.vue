<template>
  <div
    v-if="shouldBlock"
    class="bloqueo d-flex justify-content-center align-items-center"
    style="z-index: 1050; position: fixed"
  >
    <div class="modal-dialog modal-sm text-bg-dark" style="max-width: 450px; border-radius: 12px">
      <div class="modal-content shadow-lg">
        <div class="modal-header text-bg-warning rounded-top py-2">
          <h5 class="modal-title w-100 text-center">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> Apertura de Caja Requerida
          </h5>
        </div>

        <div class="modal-body text-center p-4">
          <p>
            Para comenzar a operar el sistema POS, es obligatorio abrir la caja diaria y registrar
            el fondo inicial.
          </p>

          <div
            v-if="cajaStore.isLoading"
            class="d-flex align-items-center justify-content-center py-4"
          >
            <div class="spinner-border text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <strong>Verificando estado de la caja...</strong>
          </div>

          <form v-else @submit.prevent="handleOpenCaja">
            <div class="mb-3 text-start">
              <label for="fondo-inicial" class="form-label fw-bold">Fondo Inicial ($):</label>
              <input
                id="fondo-inicial"
                type="number"
                v-model.number="fondoInicial"
                placeholder="Ej: 100.00"
                step="0.01"
                min="0"
                required
                :disabled="cajaStore.isLoading"
                class="form-control form-control-lg"
              />
            </div>

            <div v-if="localError" class="alert alert-danger p-2 small mt-3" role="alert">
              {{ localError }}
              <p class="mb-0 mt-1 fst-italic text-sm-start" v-if="cajaStore.error">
                [DEBUG Store Error: {{ cajaStore.error }}]
              </p>
            </div>

            <button
              type="submit"
              :disabled="isFormDisabled"
              class="btn btn-success btn-lg w-100 mt-3"
            >
              <span
                v-if="cajaStore.isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ cajaStore.isLoading ? 'Abriendo Caja...' : 'Abrir Caja y Comenzar' }}
            </button>
          </form>
        </div>

        <div class="modal-footer text-muted small border-0 pt-0">
          <p class="mb-0">Asegúrese de ingresar el monto exacto para evitar descuadres.</p>
        </div>
      </div>
    </div>
  </div>

  <slot></slot>
</template>

<script setup lang="ts">
// El script setup se mantiene sin cambios y es el que se mostró previamente.
// Solo se añade un <slot> para permitir que el contenido del POS se posicione
// correctamente si se envuelve con este componente.
import { ref, onMounted, computed, watch } from 'vue'
import { useCajaStore } from '@/store/useCajaStore' // Ajusta la ruta

const cajaStore = useCajaStore()

const fondoInicial = ref<number | null>(null)
const localError = ref<string | null>(null)

const shouldBlock = computed<boolean>(() => !cajaStore.isCajaAbierta && !cajaStore.isLoading)

const isFormDisabled = computed<boolean>(
  () => cajaStore.isLoading || fondoInicial.value === null || fondoInicial.value < 0,
)

onMounted(() => {
  cajaStore.fetchCajaActiva()
})

async function handleOpenCaja() {
  if (fondoInicial.value === null || fondoInicial.value < 0) {
    localError.value = 'El fondo inicial debe ser un número positivo.'
    return
  }

  localError.value = null

  try {
    const success = await cajaStore.openCaja(fondoInicial.value)

    if (success) {
    }
  } catch (err: unknown) {
    console.error('CajaBloqueador: Error al abrir la caja:', err)

    // El error del store se maneja por el watch, pero forzamos el error local para la vista.
    localError.value = cajaStore.error || 'Error desconocido al abrir la caja.'
  }
}

watch(
  () => cajaStore.error,
  (newError) => {
    if (newError) {
      // El error del store se copia a localError para mostrarlo si es relevante al bloqueo.
      localError.value = newError
    }
  },
)

defineExpose({
  shouldBlock,
  cajaStore,
})
</script>

<style scoped>
/*
  Con Bootstrap, solo necesitamos asegurar el posicionamiento y z-index.
  El uso de 'modal-backdrop' y 'show' simula el comportamiento de un modal activo.
*/
.bloqueo {
  /* Fija el backdrop sobre toda la ventana. Bootstrap ya da el fondo oscuro. */
  position: fixed !important;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semi-transparente */
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(2px);
  left: 0;
  width: 100%;
  height: 100%;
  /* Bootstrap usa z-index 1040 para el backdrop, usamos 1050 para estar encima de todo */
  z-index: 1050 !important;
}
</style>
