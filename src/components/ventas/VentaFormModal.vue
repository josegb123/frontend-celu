<template>
  <div>
    <div class="modal fade" ref="modalElement" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-cart-plus me-2"></i>
              {{ isEditMode ? `Editar Venta #${ventaIdToEdit}` : 'Registrar Nueva Venta' }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="closeModal"
              aria-label="Cerrar"
            ></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="card p-3 shadow-sm">
                    <h6>Detalles de la Cabecera</h6>
                    <hr />
                    <div class="mb-3">
                      <label class="form-label">Cliente (Opcional)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.cliente_id"
                        placeholder="ID del Cliente (opcional)"
                      />
                      <div class="form-text">Si se deja vacío, será una venta genérica.</div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Tipo de Venta (*)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.tipo_venta_id"
                        required
                        disabled
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Método de Pago</label>
                      <select class="form-select" v-model="formData.metodo_pago">
                        <option :value="null">Seleccione...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="credito">Crédito</option>
                        <option value="plan_separe">Plan Separe</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card p-3 shadow-sm">
                    <h6>Información Financiera</h6>
                    <hr />

                    <div class="mb-3">
                      <label class="form-label">Descuento Total ($)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.descuento_total"
                        min="0"
                      />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">IVA Porcentaje (%)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.iva_porcentaje"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Estado</label>
                      <select class="form-select" v-model="formData.estado">
                        <option :value="null">Seleccione...</option>
                        <option value="finalizada">Finalizada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="pendiente_pago">Pendiente Pago</option>
                        <option value="reembolsada">Reembolsada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mt-4 p-3 shadow-sm">
                <h6 class="d-flex justify-content-between align-items-center">
                  Detalles de los Ítems
                  <button type="button" class="btn btn-sm btn-outline-success" @click="addItem">
                    <i class="bi bi-cart-plus-fill"></i> Agregar Producto
                  </button>
                </h6>
                <hr />

                <div class="table-responsive">
                  <table class="table table-sm align-middle">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 10%">ID Producto (*)</th>
                        <th style="width: 30%">Cantidad (*)</th>
                        <th style="width: 20%">Precio Unitario</th>
                        <th style="width: 20%">Descuento</th>
                        <th style="width: 10%">Subtotal</th>
                        <th style="width: 10%"></th>
                      </tr>
                    </thead>
                    <tbody v-if="!isSaving">
                      <tr v-for="(item, index) in formData.items" :key="index">
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            v-model.number="item.producto_id"
                            required
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            v-model.number="item.cantidad"
                            required
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            v-model.number="item.precio_unitario"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            v-model.number="item.descuento"
                            min="0"
                          />
                        </td>
                        <td class="text-end fw-bold">
                          ${{ calculateItemSubtotal(item).toFixed(2) }}
                        </td>
                        <td>
                          <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            @click="removeItem(index)"
                            :disabled="formData.items.length === 1"
                          >
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tbody v-else>
                      <tr>
                        <td colspan="6" class="text-center text-muted">
                          Cargando detalles de la venta...
                        </td>
                      </tr>
                    </tbody>
                    <tfoot v-if="formData.items.length > 0">
                      <tr>
                        <td colspan="4" class="text-end fw-bold">TOTAL NETO (sin IVA):</td>
                        <td class="text-end fw-bold">${{ totalNetoItems.toFixed(2) }}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                  <div v-if="formData.items.length === 0" class="alert alert-warning text-center">
                    Debe agregar al menos un ítem a la venta.
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button
                type="submit"
                class="btn btn-success"
                :disabled="isSaving || formData.items.length === 0"
              >
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditMode ? 'Guardar Cambios' : 'Registrar Venta' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <NotificationModal
      :is-visible="mostrarModalNotificacion"
      :message="notificationMessage"
      :is-error="notificationIsError"
      @close="closeNotificationModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { Modal } from 'bootstrap'
import ventaService, {
  type VentaDTO,
  type VentaItemDTO,
  type VentaIndexResponse,
  type VentaShowResponse,
} from '@/services/VentaService'
import NotificationModal from '@/components/utils/NotificationModal.vue'

const props = defineProps<{
  show: boolean
  mode: 'create' | 'edit'
  ventaToEdit: VentaIndexResponse | null
}>()

const emit = defineEmits(['close', 'venta-guardada'])

// ----------------------------------------------------
// ESTADO
// ----------------------------------------------------
const modalElement = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null
const isSaving = ref(false)
const ventaIdToEdit = ref<number | null>(null)

// Datos Iniciales por defecto
const initialFormData: VentaDTO = {
  cliente_id: null,
  tipo_venta_id: 1,
  descuento_total: 0,
  metodo_pago: 'efectivo',
  estado: 'finalizada',
  iva_porcentaje: 19,
  items: [{ producto_id: 1, cantidad: 1, precio_unitario: 100, descuento: 0 }],
}

const formData = ref<VentaDTO>(JSON.parse(JSON.stringify(initialFormData)))

// --- ESTADO PARA MODALES DE NOTIFICACIÓN ---
const mostrarModalNotificacion = ref(false)
const notificationMessage = ref('')
const notificationIsError = ref(false)

// ----------------------------------------------------
// LÓGICA COMPUTADA
// ----------------------------------------------------

const isEditMode = computed(() => props.mode === 'edit')

const calculateItemSubtotal = (item: VentaItemDTO): number => {
  const precioUnitario = item.precio_unitario || 0
  const cantidad = item.cantidad || 0
  const descuento = item.descuento || 0
  return Math.max(0, cantidad * precioUnitario - descuento)
}

const totalNetoItems = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)
})

// ----------------------------------------------------
// MÉTODOS DE LA LÓGICA DE NEGOCIO Y UX
// ----------------------------------------------------

/**
 * Mapea la respuesta completa de la API (VentaShowResponse) a la estructura
 * del formulario (VentaDTO).
 */
const mapShowResponseToDTO = (data: VentaShowResponse): VentaDTO => {
  return {
    cliente_id: data.cliente?.id || null,
    tipo_venta_id: 1,
    descuento_total: data.totales_financieros.descuento_total,
    metodo_pago: data.metodo_pago,
    estado: data.estado as VentaDTO['estado'],
    iva_porcentaje: data.totales_financieros.iva_porcentaje,
    items: data.detalles_completos.map((detalle) => ({
      // NOTA: Usamos 'any' temporalmente si producto_id no está tipado en DetalleVentaResponse
      producto_id: (detalle as any).producto_id || 1,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      descuento: 0,
    })),
  }
}

/**
 * Muestra el modal de notificación con el mensaje y estado apropiado.
 */
const showNotification = (message: string, isError: boolean = false) => {
  notificationMessage.value = message
  notificationIsError.value = isError
  mostrarModalNotificacion.value = true
}

/**
 * Cierra el modal de notificación.
 */
const closeNotificationModal = () => {
  mostrarModalNotificacion.value = false
}

/**
 * Carga los datos de una venta existente para edición.
 */
const loadVentaForEdit = async (id: number) => {
  isSaving.value = true
  try {
    const data: VentaShowResponse = await ventaService.getShow(id)
    formData.value = mapShowResponseToDTO(data)
  } catch (error) {
    console.error('Error al cargar la venta para edición:', error)
    showNotification('No se pudo cargar la venta para editar. Revisa la consola.', true)
    closeModal()
  } finally {
    isSaving.value = false
  }
}

/**
 * Maneja el envío del formulario (Crear o Editar).
 */
const handleSubmit = async () => {
  if (formData.value.items.length === 0) {
    showNotification('Debe agregar al menos un ítem a la venta.', true)
    return
  }

  if (formData.value.items.some((item) => !item.producto_id || (item.cantidad ?? 0) <= 0)) {
    showNotification(
      'Asegúrate de que todos los ítems tengan ID de Producto y Cantidad válida (> 0).',
      true,
    )
    return
  }

  isSaving.value = true
  try {
    const modeText = isEditMode.value ? 'actualizada' : 'registrada'
    // Se corrige 'let' por 'const'
    const id = isEditMode.value ? ventaIdToEdit.value : 'nueva'

    if (isEditMode.value && ventaIdToEdit.value) {
      await ventaService.updateVenta(ventaIdToEdit.value, formData.value)
    } else {
      await ventaService.createVenta(formData.value)
    }

    showNotification(`Venta #${id} ${modeText} con éxito.`, false)

    emit('venta-guardada')
    bsModal?.hide()
  } catch (error) {
    // Manejo de error seguro (error: unknown)
    console.error('Error al guardar la venta:', error)

    let errorMessage = 'Error desconocido al guardar la venta.'
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      errorMessage = (error.response as any).data?.message || errorMessage
    }

    showNotification(`Fallo al procesar la venta: ${errorMessage}`, true)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  formData.value = JSON.parse(JSON.stringify(initialFormData))
  ventaIdToEdit.value = null
}

const closeModal = () => {
  emit('close')
}

const addItem = () => {
  formData.value.items.push({ producto_id: 0, cantidad: 1, precio_unitario: 0, descuento: 0 })
}

const removeItem = (index: number) => {
  if (formData.value.items.length > 1) {
    formData.value.items.splice(index, 1)
  }
}

// ----------------------------------------------------
// WATCHERS Y HOOKS
// ----------------------------------------------------

watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      await nextTick()
      bsModal?.show()

      if (props.mode === 'edit' && props.ventaToEdit) {
        ventaIdToEdit.value = props.ventaToEdit.id
        await loadVentaForEdit(props.ventaToEdit.id)
      } else {
        resetForm()
      }
    } else {
      bsModal?.hide()
    }
  },
)

onMounted(() => {
  if (modalElement.value) {
    bsModal = new Modal(modalElement.value)
    modalElement.value.addEventListener('hidden.bs.modal', resetForm)
  }
})
</script>
