<template>
  <div class="test-container">
    <h1>Pagina de Tests: Stock Bajo</h1>

    <div v-if="loading">Cargando datos de la API...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <p><strong>Mensaje:</strong> {{ responseData?.message }}</p>
      <p><strong>Total encontrado:</strong> {{ responseData?.total }}</p>

      <table border="1" v-if="responseData?.data.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock Actual</th>
            <th>Mínimo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in responseData.data" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.stock_actual }}</td>
            <td>{{ item.stock_minimo }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NotificationService from '@/services/NotificationService'

// Usamos el tipo de la respuesta completa, no solo del item
const responseData = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    console.log('Iniciando petición manual...')
    const data = await NotificationService.getBajoStock()
    responseData.value = data
    console.log('Datos recibidos:', data)
  } catch (err) {
    error.value = 'Error al conectar con el servicio'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.test-container {
  padding: 20px;
}
.error {
  color: red;
  font-weight: bold;
}
table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  text-align: left;
}
</style>
