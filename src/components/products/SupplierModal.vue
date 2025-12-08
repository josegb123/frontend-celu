<template>
  <div
    class="modal fade"
    :class="{ 'show d-block': show }"
    tabindex="-1"
    aria-hidden="true"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-truck-flatbed me-2"></i> Contactar Proveedores de **{{ productName }}**
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body p-4">
          <div v-if="suppliers.length === 0" class="alert alert-warning">
            Este producto no tiene proveedores asociados para contactar.
          </div>

          <div v-else class="list-group">
            <div
              v-for="supplier in suppliers"
              :key="supplier.id"
              class="list-group-item list-group-item-action mb-3 p-3 shadow-sm border"
            >
              <div class="d-flex w-100 justify-content-between align-items-center mb-2">
                <h6 class="mb-1 text-primary">{{ supplier.nombreComercial }}</h6>
                <small class="text-muted">ID: {{ supplier.id }}</small>
              </div>

              <p class="mb-2 small text-muted">
                <i class="bi bi-envelope me-2"></i> {{ supplier.email || 'Sin Email' }}
              </p>

              <div class="d-flex gap-3 justify-content-end mt-3">
                <button
                  class="btn btn-success btn-sm"
                  @click="sendWhatsApp(supplier, productName)"
                  :disabled="!supplier.telefono"
                  title="Abrir WhatsApp para pedir este producto"
                >
                  <i class="bi bi-whatsapp"></i> WhatsApp
                </button>

                <a
                  :href="`tel:${formatPhoneNumber(supplier.telefono)}`"
                  class="btn btn-outline-secondary btn-sm"
                  :class="{ disabled: !supplier.telefono }"
                  title="Llamar al proveedor"
                >
                  <i class="bi bi-telephone"></i> Llamar
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Proveedor } from '@/interfaces/IProveedores'

// --- PROPS y EMITS ---
defineProps<{
  show: boolean
  suppliers: Proveedor[]
  productName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// --- MÉTODOS ---

/**
 * Cierra el modal emitiendo el evento 'close'.
 */
const closeModal = () => {
  emit('close')
}

/**
 * Formatea el número de teléfono para asegurar el correcto prefijo 'tel:' y WhatsApp.
 * Elimina espacios, guiones y convierte a formato internacional si es necesario.
 */
const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return ''
  // Elimina todo lo que no sea dígito
  let cleaned = phone.replace(/[^\d]/g, '')

  // Asume que si no empieza con 57 (Colombia) o '+' es un número local y lo deja pasar,
  // pero para WhatsApp y llamadas, es más seguro usar el código de país.
  // Podrías necesitar ajustar el prefijo (ej. 57 para Colombia)
  if (cleaned.length === 10 && !cleaned.startsWith('57')) {
    cleaned = `57${cleaned}` // Ejemplo: Añade prefijo de país si tiene 10 dígitos (ajusta esto a tu país)
  }

  // Asegura que empiece con '+' si es para WhatsApp y no lo tiene, aunque 'tel:' lo maneja bien.
  return cleaned
}

/**
 * Genera la URL de WhatsApp con un mensaje predefinido.
 */
const sendWhatsApp = (supplier: Proveedor, productName: string) => {
  const phone = formatPhoneNumber(supplier.telefono)

  if (!phone) {
    alert(`El proveedor ${supplier.nombreComercial} no tiene un teléfono válido.`)
    return
  }

  const message = encodeURIComponent(
    `Hola ${supplier.nombreComercial}, necesito realizar un pedido del producto: *${productName}*.`,
  )

  // Formato de URL de WhatsApp: https://wa.me/<número>?text=<mensaje>
  // Usamos '57' si es para Colombia. Ajusta el prefijo según tu configuración local.
  const url = `https://wa.me/${phone}?text=${message}`

  window.open(url, '_blank')
}

// --- Estilo local para mostrar/ocultar el modal de Bootstrap ---
// Se requiere un estilo básico para simular la visualización/ocultación
</script>

<style scoped>
.modal.show {
  display: block;
  background: rgba(0, 0, 0, 0.5); /* Fondo oscuro del modal */
}
.modal-header {
  border-bottom: none;
}
.modal-title {
  font-weight: 600;
}
.btn-close-white {
  filter: invert(1);
}
.list-group-item {
  border-radius: 0.5rem;
}
</style>
