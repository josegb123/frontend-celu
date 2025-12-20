<template>
  <CajaCerrarModal
    v-if="mostrarModalCierre"
    :es-obligatorio="cajaStore.requiereCierre"
    @closed="handleCierreExitoso"
    @close="mostrarModalCierre = false"
  />

  <div v-else-if="shouldBlock" class="bloqueo d-flex justify-content-center align-items-center">
    <button
      class="btn btn-md btn-light btn-back-pos rounded-pill py-4 px-5 shadow-sm"
      @click="goToHome"
      title="Volver al Inicio"
    >
      <i class="bi bi-house-door-fill"></i>
    </button>

    <div class="modal-dialog modal-sm text-bg-dark" style="max-width: 450px; border-radius: 12px">
      <div class="modal-content shadow-lg">
        <div class="modal-header text-bg-warning rounded-top py-3">
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
            <div class="spinner-border text-primary me-2" role="status"></div>
            <strong>Verificando estado...</strong>
          </div>

          <form v-else @submit.prevent="handleOpenCaja">
            <div class="mb-3 text-start">
              <label for="fondo-inicial" class="form-label fw-bold">Fondo Inicial ($):</label>
              <input
                id="fondo-inicial"
                type="number"
                v-model.number="fondoInicial"
                placeholder="Ej: 100000"
                step="0.01"
                min="0"
                required
                class="form-control form-control-lg"
              />
            </div>

            <div v-if="localError" class="alert alert-danger p-2 small mt-3" role="alert">
              {{ localError }}
            </div>

            <button
              type="submit"
              :disabled="isFormDisabled"
              class="btn btn-success btn-lg w-100 mt-3"
            >
              <span v-if="cajaStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ cajaStore.isLoading ? 'Abriendo...' : 'Abrir Caja y Comenzar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <slot v-if="!shouldBlock && !mostrarModalCierre"></slot>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCajaStore } from '@/store/useCajaStore'
import CajaCerrarModal from '@/components/shared/CerrarCajaModal.vue'

const router = useRouter()
const cajaStore = useCajaStore()

const mostrarModalCierre = ref(false)
const fondoInicial = ref<number | null>(null)
const localError = ref<string | null>(null)

const shouldBlock = computed(
  () =>
    !cajaStore.isCajaAbierta && !cajaStore.isLoading && router.currentRoute.value.name !== 'auth',
)

const isFormDisabled = computed(
  () => cajaStore.isLoading || fondoInicial.value === null || fondoInicial.value < 0,
)

async function handleCierreExitoso() {
  mostrarModalCierre.value = false
  await cajaStore.fetchCajaActiva()
}

function goToHome() {
  router.push({ name: 'home' })
}

async function handleOpenCaja() {
  if (fondoInicial.value === null || fondoInicial.value < 0) {
    localError.value = 'Ingrese un monto válido.'
    return
  }

  localError.value = null
  try {
    await cajaStore.openCaja(fondoInicial.value)
  } catch {
    localError.value = cajaStore.error || 'Error al abrir la caja.'
  }
}

onMounted(async () => {
  await cajaStore.fetchCajaActiva()
  if (cajaStore.requiereCierre) {
    mostrarModalCierre.value = true
  }
})

watch(
  () => cajaStore.error,
  (newError) => {
    if (newError) {
      localError.value = newError
      const msg = newError.toLowerCase()
      if (msg.includes('cierre manual') || msg.includes('pendiente de cierre')) {
        mostrarModalCierre.value = true
      }
    }
  },
)

defineExpose({ shouldBlock, cajaStore })
</script>

<style scoped>
.bloqueo {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1050 !important;
}
</style>
