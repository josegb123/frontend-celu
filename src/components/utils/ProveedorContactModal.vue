<template>
  <div
    class="modal fade"
    :class="{ show: isVisible }"
    :style="{ display: isVisible ? 'block' : 'none' }"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="bi bi-box-seam me-2"></i> Contactar Proveedor para {{ productoNombre }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body">
          <p class="mb-3">
            Selecciona el proveedor al que deseas solicitar *stock* para **{{ productoNombre }}**:
          </p>

          <div v-if="proveedores.length === 0" class="alert alert-info">
            Este producto no tiene proveedores asociados.
          </div>

          <ul class="list-group">
            <li
              class="list-group-item d-flex justify-content-between align-items-center"
              v-for="proveedor in proveedores"
              :key="proveedor.id"
            >
              <div>
                <strong>{{ proveedor.nombreComercial }}</strong>
                <span v-if="proveedor.telefono" class="ms-3 text-muted">
                  ({{ proveedor.telefono }})
                </span>
                <span v-else class="ms-3 text-danger small"> Sin teléfono </span>
              </div>

              <button
                class="btn btn-sm btn-success"
                :disabled="!proveedor.telefono"
                @click="confirmContact(proveedor.telefono, productoNombre)"
              >
                <i class="bi bi-whatsapp"></i> Contactar
              </button>
            </li>
          </ul>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { Proveedor } from '@/interfaces/ProveedorInterfaces' // Asegúrate de tener esta interfaz
import { defineProps, defineEmits } from 'vue'

// --- PROPS ---
const props = defineProps<{
  isVisible: boolean
  productoNombre: string
  proveedores: Proveedor[]
}>()

// --- EMITS ---
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'contact', telefono: string, productoNombre: string): void
}>()

// --- MÉTODOS ---
const closeModal = () => {
  emit('close')
}

const confirmContact = (telefono: string | null, productoNombre: string) => {
  if (telefono) {
    emit('contact', telefono, productoNombre)
  } else {
    // Esto debería ser prevenido por el botón disabled, pero es un buen fallback
    alert('Este proveedor no tiene un número de teléfono registrado.')
  }
}
</script>
