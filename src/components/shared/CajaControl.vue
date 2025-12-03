<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useCajaStore } from '@/store/useCajaStore' // Ajusta la ruta según tu proyecto
import { AxiosError } from 'axios'

// 1. Inicialización y dependencias
const cajaStore = useCajaStore()

// 2. Estado local
const fondoInicial = ref<number | null>(null)
const localError = ref<string | null>(null)

// 3. Propiedades computadas para la interfaz
// Determina si el POS debe estar bloqueado. Se bloquea si no hay caja activa y no está cargando.
const shouldBlock = computed<boolean>(() => !cajaStore.isCajaAbierta && !cajaStore.isLoading)

// Determina si se puede enviar el formulario
// const isFormDisabled = computed<boolean>(
//   () => cajaStore.isLoading || fondoInicial.value === null || fondoInicial.value < 0,
// )

// 4. Ciclo de vida: Cargar el estado de la caja al montar el componente
onMounted(() => {
  cajaStore.fetchCajaActiva()
})

// 5. Función de manejo de la apertura de caja
async function handleOpenCaja() {
  if (fondoInicial.value === null || fondoInicial.value < 0) {
    localError.value = 'El fondo inicial debe ser un número positivo.'
    return
  }

  localError.value = null // Limpiar errores locales antes de la llamada

  try {
    const success = await cajaStore.openCaja(fondoInicial.value)

    // Debugging: Confirmación de apertura
    if (success) {
      // El bloqueo se levantará automáticamente porque isCajaAbierta cambiará a true.
    }
  } catch (err: unknown) {
    // Si la acción lanza una excepción, la manejamos aquí (además de en el store)
    console.error('CajaBloqueador: Error al abrir la caja:', err)

    const axiosError = err as AxiosError<{ message: string }>
    localError.value = axiosError.response?.data?.message || 'Error desconocido al abrir la caja.'

    // Debugging: Señalización de fallo
  }
}

// 6. Observador para manejar errores del store
watch(
  () => cajaStore.error,
  (newError) => {
    // Si hay un error en el store (por ejemplo, al cargar), lo reflejamos localmente.
    if (newError) {
      localError.value = newError
    }
  },
)

// 7. Exposición de elementos necesarios para la plantilla
defineExpose({
  shouldBlock, // Para que el padre o herramientas puedan verificar el estado
  cajaStore,
})
</script>

<template>
  <div>
    <!-- Example button to open the caja -->
    <button @click="handleOpenCaja" :disabled="shouldBlock">Abrir Caja</button>
    <div v-if="localError" class="error">
      {{ localError }}
    </div>
    <!-- You can add more UI elements as needed -->
  </div>
</template>
