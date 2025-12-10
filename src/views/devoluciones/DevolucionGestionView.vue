<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DevolucionService, { type Devolucion } from '@/services/DevolucionService'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

// -----------------------------------------------------------
// 🚨 NOTA IMPORTANTE: AJUSTE DEL TIPO DE DATOS
// -----------------------------------------------------------
// Para que la función de contacto funcione, tu interfaz Devolucion (en DevolucionService)
// debe extenderse para incluir las relaciones necesarias (producto y proveedor).
/* Ejemplo de estructura necesaria en '@/services/DevolucionService':
export interface Devolucion {
  // ...
  producto?: { 
    id: number; 
    nombre: string;
    proveedor?: { 
      telefono_whatsapp: string; // <-- Campo clave
      nombre: string;
    } 
  }
}
*/

const devolucionesPendientes = ref<Devolucion[]>([])
const loading = ref(true)
const updatingStatus = ref<number | null>(null) // To track which item is being updated

// -----------------------------------------------------------
// --- LÓGICA DE WHATSAPP ---
// -----------------------------------------------------------

/**
 * Genera el enlace de WhatsApp con el número limpio y un mensaje predefinido.
 * @param phoneNumber Número de teléfono (debe incluir código de país, ej: 57310xxxxxxx).
 * @param productName Nombre del producto para incluir en el mensaje.
 * @returns URL de WhatsApp.
 */
const getWhatsAppLink = (phoneNumber: string, productName: string): string => {
  // Limpia el número si tiene caracteres no numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '')

  // Mensaje pre-llenado
  const message = `Hola, estamos gestionando una devolución del producto *${productName}* (${new Date().toLocaleDateString()}). Por favor, indiquen los pasos a seguir.`
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

/**
 * Abre una nueva ventana con el enlace de WhatsApp al proveedor del producto.
 * @param dev Objeto de devolución completo.
 */
const contactarProveedor = (dev: Devolucion) => {
  // ⚠️ AJUSTA LA RUTA DEL OBJETO (ej: dev.producto?.proveedor?.telefono_whatsapp)
  // según cómo tu API de Laravel retorna la relación.
  const whatsappNumber = dev.producto?.proveedor?.telefono
  const productName = dev.producto?.nombre ?? 'Producto Desconocido'

  if (whatsappNumber) {
    const link = getWhatsAppLink(whatsappNumber, productName)
    window.open(link, '_blank')
    showNotification(`Abriendo chat de WhatsApp para ${productName}...`, 'info')
  } else {
    showNotification(
      `Proveedor no encontrado o número de WhatsApp no disponible para ${productName}.`,
      'warning',
    )
  }
}

// -----------------------------------------------------------
// --- LÓGICA DE ESTADO Y FETCH ---
// -----------------------------------------------------------

const fetchDevolucionesPendientes = async () => {
  loading.value = true
  try {
    devolucionesPendientes.value = await DevolucionService.getDevolucionesPendientes()
  } catch (err) {
    console.error('Error fetching devoluciones pendientes:', err)
    showNotification('Error al cargar devoluciones pendientes', 'error')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id: number, newStatus: string) => {
  updatingStatus.value = id
  try {
    await DevolucionService.updateDevolucionStatus(id, newStatus)
    showNotification(`Estado de devolución ${id} actualizado a "${newStatus}"`, 'success')
    // Re-fetch data to reflect the change
    await fetchDevolucionesPendientes()
  } catch (err) {
    // Handle error
    console.error(`Error updating status for devolucion ${id}:`, err)
    showNotification(`Error al actualizar estado de devolución ${id}`, 'error')
  } finally {
    updatingStatus.value = null
  }
}

onMounted(fetchDevolucionesPendientes)
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Gestión de Devoluciones Pendientes</h2>
      <p class="text-muted mb-0">Revisión y gestión de productos devueltos pendientes.</p>
    </div>

    <div class="card p-4">
      <div class="row">
        <div class="col-3">
          <router-link :to="{ name: 'DevolucionForm' }" class="btn btn-primary mb-3 w-100">
            <i class="bi bi-plus-lg me-2"></i> Nueva Devolución
          </router-link>
        </div>
      </div>
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">Cargando devoluciones pendientes...</p>
      </div>
      <div v-else-if="devolucionesPendientes.length === 0" class="alert alert-info text-center">
        No hay devoluciones pendientes para gestionar.
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th>Producto</th>
              <th>ID Único</th>
              <th>Cliente</th>
              <th>Motivo</th>
              <th>Costo Unitario</th>
              <th>Estado Gestión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dev in devolucionesPendientes" :key="dev.id">
              <td>{{ dev.producto?.nombre ?? 'N/A' }}</td>
              <td>{{ dev.producto?.id || 'N/A' }}</td>
              <td>
                {{ dev.cliente?.nombre ?? 'N/A' }} ({{
                  dev.cliente?.cedula ?? 'Sin Identificación'
                }})
              </td>
              <td>{{ dev.motivo }}</td>
              <td>${{ dev.costo_unitario || 0 }}</td>
              <td>{{ dev.estado_gestion }}</td>

              <td>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-warning dropdown-toggle"
                    type="button"
                    :id="`dropdownMenuButton-${dev.id}`"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-boundary="viewport"
                  >
                    Acciones
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`dropdownMenuButton-${dev.id}`">
                    <li>
                      <button class="dropdown-item text-success" @click="contactarProveedor(dev)">
                        <i class="bi bi-whatsapp me-2"></i> Contactar Proveedor
                      </button>
                    </li>
                    <li><hr class="dropdown-divider" /></li>

                    <li>
                      <button
                        class="dropdown-item"
                        :disabled="updatingStatus === dev.id"
                        @click="updateStatus(dev.id, 'Contactado')"
                      >
                        Marcar como Contactado
                        <span
                          v-if="updatingStatus === dev.id"
                          class="spinner-border spinner-border-sm ms-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </li>
                    <li>
                      <button
                        class="dropdown-item"
                        :disabled="updatingStatus === dev.id"
                        @click="updateStatus(dev.id, 'Finalizada')"
                      >
                        Finalizar (Pérdida/Descarte)
                        <span
                          v-if="updatingStatus === dev.id"
                          class="spinner-border spinner-border-sm ms-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive {
  min-height: 70vh;
}

.table-responsive,
.table {
  overflow-y: visible !important;
}
</style>
