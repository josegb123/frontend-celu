<template>
  <div
    class="modal fade"
    :class="{ show: show, 'd-block': show }"
    tabindex="-1"
    aria-hidden="true"
    role="dialog"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-light p-2">
          <h5 class="modal-title fs-5 fw-bold">Detalle de Venta #{{ ventaData?.venta_id }}</h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="closeModal"
            aria-label="Cerrar"
          ></button>
        </div>

        <div class="modal-body p-4" v-if="isLoading">
          <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando detalles...</span>
            </div>
            <p class="mt-2 text-muted">Cargando detalles...</p>
          </div>
        </div>
        <div class="modal-body p-3" v-else-if="ventaData">
          <VentaDetailCard :venta-data="ventaData" />
        </div>

        <div class="modal-footer py-2">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ventaService, { type VentaShowResponse } from '@/services/VentaService'
import VentaDetailCard from './VentaDetailCard.vue'

// --- 1. PROPS Y EMITS ---
const props = defineProps<{
  show: boolean
  ventaId: number | null
}>()

const emit = defineEmits(['close'])

// --- 2. ESTADO LOCAL ---
const ventaData = ref<VentaShowResponse | null>(null)
const isLoading = ref(false)

// --- 3. OBSERVADOR (Sustituye la lógica de bsModal) ---
watch(
  () => props.show,
  (newVal) => {
    // Si la prop 'show' cambia a true y tenemos un ID, cargamos los detalles.
    if (newVal && props.ventaId) {
      cargarDetalle(props.ventaId)
    }
    // Si cambia a false, el modal se oculta automáticamente por las clases CSS y el backdrop.
  },
  // Ejecutar inmediatamente si el componente se monta con show=true
  { immediate: true },
)

// --- 4. MÉTODOS ---

/**
 * Carga los detalles completos de la venta usando el ID proporcionado.
 * @param id - El ID de la venta a cargar.
 */
async function cargarDetalle(id: number) {
  isLoading.value = true
  ventaData.value = null
  try {
    const response = await ventaService.getShow(id)
    if (response) {
      // Usar 'venta_id' como identificador, asumiendo que tu VentaShowResponse fue ajustada
      // para coincidir con la implementación de VentaDetailCard.vue
      ventaData.value = response
    } else {
      throw new Error('Datos de la venta no encontrados.')
    }
  } catch (error) {
    console.error(`Error al cargar la venta ${id}:`, error)
    ventaData.value = null
    alert('No se pudo cargar el detalle de la venta.')
  } finally {
    isLoading.value = false
  }
}

/**
 * Emite el evento 'close' para que el componente padre oculte el modal.
 */
function closeModal() {
  emit('close')
}
</script>

<style scoped>
/* Asegura que el modal-header use el color primario de Bootstrap (adaptable) */
.bg-primary {
  background-color: var(--bs-primary) !important;
}
.btn-close-white {
  /* Hace la X blanca para contraste sobre fondo primary */
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* Evitar errores de scroll cuando el modal está oculto */
.modal:not(.show) {
  display: none;
}
</style>
