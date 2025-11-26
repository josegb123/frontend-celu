<template>
  <div
    v-if="isVisible"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="confirmationModalLabel"
    aria-modal="true"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-danger text-white border-bottom-0">
          <h5 class="modal-title" id="confirmationModalLabel">⚠️ {{ title }}</h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="$emit('cancel')"
            aria-label="Cerrar"
          ></button>
        </div>

        <div class="modal-body text-center pt-4 pb-3">
          <i class="bi bi-exclamation-triangle-fill text-danger fs-3 mb-3"></i>
          <p class="mb-0">{{ message }}</p>
        </div>

        <div class="modal-footer justify-content-center border-top-0 pt-0">
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            @click="$emit('confirm')"
            :disabled="isProcessing"
          >
            <span
              v-if="isProcessing"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmar Acción',
  },
  message: {
    type: String,
    default: '¿Está seguro de realizar esta acción?',
  },
  confirmText: {
    type: String,
    default: 'Confirmar',
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal {
  z-index: 1055;
}
.modal-backdrop {
  z-index: 1050;
}
</style>
