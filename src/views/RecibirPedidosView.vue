<script setup lang="ts">
import PedidoProveedorForm from '@/components/forms/PedidoProveedorForm.vue';
import { ref } from 'vue';

const notificationMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const handleSuccess = (response: any) => {
  notificationMessage.value = { type: 'success', message: 'Pedido recibido exitosamente!' };
  console.log('Pedido recibido exitosamente:', response);
  // Optionally clear message after a few seconds
  setTimeout(() => {
    notificationMessage.value = null;
  }, 5000);
};

const handleError = (error: any) => {
  notificationMessage.value = { type: 'error', message: error.message || 'Error al procesar el pedido.' };
  console.error('Error al recibir pedido:', error);
  // Optionally clear message after a few seconds
  setTimeout(() => {
    notificationMessage.value = null;
  }, 5000);
};
</script>

<template>
  <div class="container mt-4">
    <div v-if="notificationMessage" :class="['alert', notificationMessage.type === 'success' ? 'alert-success' : 'alert-danger']" role="alert">
      {{ notificationMessage.message }}
    </div>
    <PedidoProveedorForm @success="handleSuccess" @error="handleError" />
  </div>
</template>

<style scoped>
/* No specific styles needed for this view, as it mainly wraps the form */
</style>
