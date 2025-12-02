<template>
  <div class="modal fade" ref="modalElement" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalle de Venta #{{ ventaData?.id }}</h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body" v-if="isLoading">
          <div class="text-center p-5">Cargando detalles...</div>
        </div>
        <div class="modal-body" v-else-if="ventaData">
          <VentaDetailCard :venta-data="ventaData" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import ventaService, { type VentaShowResponse } from '@/services/VentaService'
import VentaDetailCard from './VentaDetailCard.vue'

const props = defineProps<{
  show: boolean
  ventaId: number | null
}>()

const emit = defineEmits(['close'])

const modalElement = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null
const ventaData = ref<VentaShowResponse | null>(null)
const isLoading = ref(false)

onMounted(() => {
  if (modalElement.value) {
    bsModal = new Modal(modalElement.value)
  }
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      bsModal?.show()
      if (props.ventaId) {
        cargarDetalle(props.ventaId)
      } else {
        console.warn('No se proporcionó un ID de venta válido.')
        ventaData.value = null
      }
    } else {
      bsModal?.hide()
    }
  },
)

// Validar la respuesta de ventaService.getShow y manejar errores
async function cargarDetalle(id: number) {
  isLoading.value = true
  ventaData.value = null
  console.log(`Cargando detalles para la venta con ID: ${id}`) // Depuración
  try {
    const response = await ventaService.getShow(id)
    console.log('Respuesta del servicio:', response) // Depuración
    if (response) {
      ventaData.value = response
    } else {
      throw new Error('Datos de la venta no encontrados.')
    }
  } catch (error) {
    console.error(`Error al cargar la venta ${id}:`, error)
    ventaData.value = null // Asegurarse de que no haya datos residuales
    alert('No se pudo cargar el detalle de la venta.')
  } finally {
    isLoading.value = false
    console.log('Estado final de ventaData:', ventaData.value) // Depuración
  }
}

function closeModal() {
  emit('close')
}
</script>
