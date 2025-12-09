<template>
  <div class="aval-selector mb-3">
    <label for="avalSelect" class="form-label">Seleccionar Aval (Opcional):</label>
    <select
      id="avalSelect"
      class="form-select"
      v-model="selectedAvalId"
      @change="checkAvalPendingDues"
    >
      <option :value="null" disabled>Seleccione un aval</option>
      <option v-for="client in clients" :key="client.id" :value="client.id">
        {{ client.nombre }} {{ client.apellidos }} ({{ client.cedula }})
      </option>
    </select>

    <div v-if="hasPendingDues" class="alert alert-warning mt-2" role="alert">
      ¡Atención! El aval seleccionado tiene cuentas por cobrar pendientes.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import laravelApi from '@/http/laravelApi'
import { Client } from '@/interfaces/Client' // Assuming a Client interface exists

const emit = defineEmits(['aval-selected'])

const clients = ref<Client[]>([])
const selectedAvalId = ref<number | null>(null)
const hasPendingDues = ref<boolean>(false)

// Fetch clients to use as avails
const fetchClients = async () => {
  try {
    const response = await laravelApi.get('/clientes')
    clients.value = response.data.data // Assuming paginated response
  } catch (error) {
    console.error('Error fetching clients for aval selector:', error)
  }
}

// Check for pending dues when an aval is selected
const checkAvalPendingDues = async () => {
  if (selectedAvalId.value) {
    try {
      const response = await laravelApi.get(`/avales/${selectedAvalId.value}/has-pending-dues`)
      hasPendingDues.value = response.data.has_pending_dues
    } catch (error) {
      console.error('Error checking aval pending dues:', error)
      hasPendingDues.value = false // Reset in case of error
    }
  } else {
    hasPendingDues.value = false
  }
  emit('aval-selected', { id: selectedAvalId.value, hasPendingDues: hasPendingDues.value })
}

// Watch for external changes if VentaPOS resets or pre-selects an aval
watch(selectedAvalId, () => {
  if (!selectedAvalId.value) {
    hasPendingDues.value = false
    emit('aval-selected', { id: null, hasPendingDues: false })
  }
})

onMounted(() => {
  fetchClients()
})
</script>

<style scoped>
/* Add any specific styles for AvalSelector here */
.aval-selector {
  /* Example styles */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
