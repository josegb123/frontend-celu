<template>
  <div
    v-if="isVisible"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="notificationModalLabel"
    aria-modal="true"
    :class="{ 'notification-modal-enter': isVisible }"
  >
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header text-white" :class="isError ? 'bg-danger' : 'bg-success'">
          <h5 class="modal-title" id="notificationModalLabel">
            {{ isError ? 'Error de Operación' : '¡Éxito!' }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="$emit('close')"
            aria-label="Cerrar"
          ></button>
        </div>

        <div class="modal-body text-center">
          <i
            class="fs-3 mb-3"
            :class="[isError ? 'bi bi-x-circle text-danger' : 'bi bi-check-circle text-success']"
          ></i>
          <p class="mb-0">{{ message }}</p>
        </div>

        <div class="modal-footer justify-content-center">
          <button
            type="button"
            class="btn"
            :class="isError ? 'btn-outline-danger' : 'btn-outline-success'"
            @click="$emit('close')"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import 'bootstrap-icons/font/bootstrap-icons.css'

// --- PROPIEDADES ---
defineProps<{
  /** Controla la visibilidad del modal. */
  isVisible: boolean
  /** El mensaje que se muestra en el cuerpo del modal. */
  message: string
  /** Si es true, usa el color rojo (Error); si es false, usa el color verde (Éxito). */
  isError: boolean
}>()
</script>

<style scoped>
/* Estilos para simular la animación de Bootstrap, ya que usamos d-block */
.modal.show {
  animation: fadeIn 0.1s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-backdrop {
  /* Asegura que el fondo oscuro cubra toda la pantalla */
  z-index: 1040;
}
.modal {
  /* Asegura que el modal esté sobre el fondo oscuro */
  z-index: 1050;
}
</style>
