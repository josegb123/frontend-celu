<template>
  <div
    class="modal fade"
    :class="{ show: show, 'd-block': show }"
    tabindex="-1"
    aria-hidden="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl modal-scrollable">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white py-2">
          <h5 class="modal-title fs-5 fw-bold">
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
          <div class="modal-body p-4">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="card p-3 shadow-sm border border-1 h-100">
                  <h6 class="fw-bold fs-6">Detalles de la Cabecera</h6>
                  <hr class="mt-1 mb-3" />

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">Cliente (ID Opcional)</label>
                    <input
                      type="number"
                      class="form-control form-control-md"
                      v-model.number="formData.cliente_id"
                      placeholder="ID del Cliente (opcional)"
                    />
                    <div class="form-text">Si se deja vacío, será una venta genérica.</div>
                  </div>

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">Tipo de Venta (*)</label>
                    <input
                      type="number"
                      class="form-control form-control-md"
                      v-model.number="formData.tipo_venta_id"
                      required
                      disabled
                    />
                  </div>

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">Método de Pago (*)</label>
                    <select
                      class="form-select form-select-md"
                      v-model="formData.metodo_pago"
                      required
                    >
                      <option :value="null" disabled>Seleccione...</option>
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
                <div class="card p-3 shadow-sm border border-1 h-100">
                  <h6 class="fw-bold fs-6">Información Financiera</h6>
                  <hr class="mt-1 mb-3" />

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">Descuento Total ($)</label>
                    <input
                      type="number"
                      class="form-control form-control-md"
                      v-model.number="formData.descuento_total"
                      min="0"
                    />
                  </div>

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">IVA Porcentaje (%)</label>
                    <input
                      type="number"
                      class="form-control form-control-md"
                      v-model.number="formData.iva_porcentaje"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div class="mb-3 fs-6">
                    <label class="form-label fw-medium">Estado (*)</label>
                    <select class="form-select form-select-md" v-model="formData.estado" required>
                      <option :value="null" disabled>Seleccione...</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="pendiente_pago">Pendiente Pago</option>
                      <option value="reembolsada">Reembolsada</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="card mt-4 p-3 shadow-sm border border-1">
              <h6 class="d-flex justify-content-between align-items-center fw-bold fs-6">
                Detalles de los Ítems
                <button type="button" class="btn btn-sm btn-outline-success" @click="addItem">
                  <i class="bi bi-cart-plus-fill"></i> Agregar Producto
                </button>
              </h6>
              <hr class="mt-1 mb-3" />

              <div class="table-responsive">
                <table class="table table-sm align-middle mb-0 fs-6">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 35%">Producto (*)</th>
                      <th style="width: 15%" class="text-center">Cant. (*)</th>
                      <th style="width: 20%" class="text-end">Precio Unit.</th>
                      <th style="width: 15%" class="text-end">Descuento</th>
                      <th style="width: 10%">Subtotal</th>
                      <th style="width: 5%"></th>
                    </tr>
                  </thead>
                  <tbody v-if="!isSaving">
                    <tr v-for="(item, index) in formData.items" :key="index">
                      <td>
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="item.nombre_producto_temporal"
                          required
                          placeholder="Buscar producto"
                        />
                        <input type="hidden" v-model.number="item.producto_id" />
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control form-control-sm text-center"
                          v-model.number="item.cantidad"
                          required
                          min="1"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control form-control-sm text-end"
                          v-model.number="item.precio_unitario"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          class="form-control form-control-sm text-end"
                          v-model.number="item.descuento"
                          min="0"
                        />
                      </td>
                      <td class="text-end fw-bold">
                        {{ formatCurrency(calculateItemSubtotal(item)) }}
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
                      <td colspan="6" class="text-center text-muted py-3">
                        Cargando detalles de la venta...
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="formData.items.length > 0">
                    <tr class="table-light">
                      <td colspan="4" class="text-end fw-bold">TOTAL NETO (sin IVA):</td>
                      <td class="text-end fw-bold">{{ formatCurrency(totalNetoItems) }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
                <div
                  v-if="formData.items.length === 0"
                  class="alert alert-warning text-center fs-6"
                >
                  Debe agregar al menos un ítem a la venta.
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer py-2">
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

  <div v-if="show" class="modal-backdrop fade show"></div>

  <NotificationModal
    :is-visible="mostrarModalNotificacion"
    :message="notificationMessage"
    :is-error="notificationIsError"
    @close="closeNotificationModal"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import ventaService, {
  type VentaDTO,
  type VentaItemDTO as VentaItemDTOCore,
  type VentaIndexResponse,
  type VentaShowResponse,
} from '@/services/VentaService'
import NotificationModal from '@/components/utils/NotificationModal.vue'

// --- 1. Definición de Tipos Locales y Prop Extendida ---

// Extiende la VentaItemDTO para incluir el campo temporal para el nombre del producto
interface VentaItemDTO extends VentaItemDTOCore {
  nombre_producto_temporal?: string
}

// Tipo para el estado de la venta que se envía en el DTO
type VentaEstado = 'finalizada' | 'cancelada' | 'pendiente_pago' | 'reembolsada'

// Extiende el VentaDTO del servicio
interface VentaFormDTO extends Omit<VentaDTO, 'items' | 'estado'> {
  estado: VentaEstado | null // Permitir null en el formulario
  items: VentaItemDTO[]
}

// --- 2. PROPS y EMITS ---
const props = defineProps<{
  show: boolean
  mode: 'create' | 'edit'
  ventaToEdit: VentaIndexResponse | null
}>()

const emit = defineEmits(['close', 'venta-guardada'])

// ----------------------------------------------------
// ESTADO
// ----------------------------------------------------
// Eliminamos la referencia al elemento modal ya que no usaremos la clase Modal de Bootstrap
const isSaving = ref(false)
const ventaIdToEdit = ref<number | null>(null)

// Datos Iniciales por defecto
const initialFormData: VentaFormDTO = {
  caja_diaria_id: null,
  cliente_id: null,
  tipo_venta_id: 1,
  descuento_total: 0,
  metodo_pago: 'efectivo',
  estado: 'finalizada',
  iva_porcentaje: 0,
  items: [
    {
      producto_id: 1,
      cantidad: 1,
      precio_unitario: 100,
      descuento: 0,
      nombre_producto_temporal: 'Producto Inicial',
    },
  ],
}

const formData = ref<VentaFormDTO>(JSON.parse(JSON.stringify(initialFormData)))

// --- ESTADO PARA MODALES DE NOTIFICACIÓN ---
const mostrarModalNotificacion = ref(false)
const notificationMessage = ref('')
const notificationIsError = ref(false)

// ----------------------------------------------------
// LÓGICA COMPUTADA
// ----------------------------------------------------

const isEditMode = computed(() => props.mode === 'edit')

/**
 * Calcula el subtotal neto de un ítem (Precio * Cantidad - Descuento).
 * @param item - El ítem de venta.
 * @returns El subtotal neto del ítem.
 */
const calculateItemSubtotal = (item: VentaItemDTO): number => {
  const precioUnitario = item.precio_unitario || 0
  const cantidad = item.cantidad || 0
  const descuento = item.descuento || 0
  return Math.max(0, cantidad * precioUnitario - descuento)
}

/**
 * Calcula el total neto de todos los ítems en el formulario.
 */
const totalNetoItems = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)
})

/**
 * Formatea un número a moneda colombiana (COP) con cero decimales.
 * @param val - El valor numérico a formatear.
 * @returns El valor formateado como cadena.
 */
const formatCurrency = (val: number): string => {
  if (typeof val !== 'number' || isNaN(val)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}

// ----------------------------------------------------
// MÉTODOS DE LA LÓGICA DE NEGOCIO Y UX
// ----------------------------------------------------

/**
 * Mapea la respuesta completa de la API (VentaShowResponse) a la estructura
 * del formulario (VentaFormDTO), incluyendo el nombre del producto para edición.
 */
const mapShowResponseToDTO = (data: VentaShowResponse): VentaFormDTO => {
  return {
    cliente_id: data.cliente?.id || null,
    tipo_venta_id: 1,
    descuento_total: data.totales_financieros.descuento_total,
    caja_diaria_id: data.caja_diaria_id || null,
    metodo_pago: data.metodo_pago,
    estado: (data.estado as VentaEstado) || null,
    iva_porcentaje: data.totales_financieros.iva_porcentaje,
    items: data.detalles_completos.map((detalle) => ({
      producto_id: detalle.producto_id,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      descuento: 0, // Asumimos descuento es 0 si no viene detallado en el ítem
      // Usamos el nombre histórico para mostrar en el campo de texto
      iva_porcentaje: 0,
      nombre_producto_temporal: detalle.nombre_producto_historico,
    })),
  }
}

/**
 * Muestra el modal de notificación con el mensaje y estado apropiado.
 * @param message - Mensaje a mostrar.
 * @param isError - Indica si es un mensaje de error.
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
 * @param id - ID de la venta a cargar.
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
  // Validación de Ítems
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
  // Validación de Estado
  if (!formData.value.estado) {
    showNotification('Debe seleccionar un Estado para la venta.', true)
    return
  }

  isSaving.value = true
  try {
    const modeText = isEditMode.value ? 'actualizada' : 'registrada'
    const id = isEditMode.value ? ventaIdToEdit.value : 'nueva'

    // Creamos el DTO limpio sin el campo temporal antes de enviar
    const dtoToSend: VentaDTO = {
      ...formData.value,
      estado: formData.value.estado as VentaDTO['estado'], // Aseguramos el tipo
      items: formData.value.items.map(
        ({ nombre_producto_temporal, ...rest }) => rest,
      ) as VentaItemDTOCore[],
    }

    if (isEditMode.value && ventaIdToEdit.value) {
      await ventaService.updateVenta(ventaIdToEdit.value, dtoToSend)
    } else {
      await ventaService.createVenta(dtoToSend)
    }

    showNotification(`Venta #${id} ${modeText} con éxito.`, false)
    emit('venta-guardada')
    closeModal() // Llamada a closeModal que emite 'close'
  } catch (error) {
    console.error('Error al guardar la venta:', error)

    let errorMessage = 'Error desconocido al guardar la venta.'
    // Manejo de error específico (asumimos que la respuesta de error tiene una estructura)
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      typeof (error.response as { data?: { message?: string } }).data === 'object'
    ) {
      errorMessage =
        (error.response as { data?: { message?: string } }).data?.message || errorMessage
    }

    showNotification(`Fallo al procesar la venta: ${errorMessage}`, true)
  } finally {
    isSaving.value = false
  }
}

/**
 * Resetea el formulario a sus valores iniciales.
 */
const resetForm = () => {
  formData.value = JSON.parse(JSON.stringify(initialFormData))
  ventaIdToEdit.value = null
}

/**
 * Emite el evento 'close' y resetea el formulario.
 */
const closeModal = () => {
  emit('close')
  // Se llama a resetForm en el watcher cuando props.show pasa a false
}

/**
 * Agrega un nuevo ítem de producto a la lista.
 */
const addItem = () => {
  formData.value.items.push({
    producto_id: 0,
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0,
    nombre_producto_temporal: '',
  })
}

/**
 * Elimina un ítem de la lista por su índice.
 * @param index - Índice del ítem a eliminar.
 */
const removeItem = (index: number) => {
  if (formData.value.items.length > 0) {
    // Permitir eliminar aunque solo haya uno, si el usuario lo desea.
    formData.value.items.splice(index, 1)
  }
}

// ----------------------------------------------------
// WATCHERS Y HOOKS
// ----------------------------------------------------

watch(
  () => props.show,
  async (newVal) => {
    // La visibilidad se maneja con clases CSS directamente
    if (newVal) {
      if (props.mode === 'edit' && props.ventaToEdit) {
        ventaIdToEdit.value = props.ventaToEdit.venta_id
        await loadVentaForEdit(props.ventaToEdit.venta_id)
      } else {
        resetForm()
      }
    } else {
      // Al ocultar, resetear el formulario para el siguiente uso
      resetForm()
    }
  },
  { immediate: true },
)

// Eliminamos onMounted con Modal de Bootstrap
</script>

<style scoped>
/* ESTILOS PARA COMPACTAR EL FORMULARIO */

/* Reducir el padding de los elementos del formulario */
.form-control-md,
.form-select-md {
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 0.9rem; /* fs-6 */
}
.form-label {
  margin-bottom: 0.25rem;
  font-size: 0.9rem; /* fs-6 */
}
.form-text {
  font-size: 0.75rem;
}

/* Reducir el padding de las celdas de la tabla de detalles */
.table > :not(caption) > * > * {
  padding: 0.3rem 0.5rem; /* Padding vertical y horizontal reducido */
}

/* Estilo para los inputs pequeños dentro de la tabla */
.form-control-sm {
  padding: 0.15rem 0.5rem;
  height: auto;
}

/* Color del encabezado primario y botón de cerrar */
.bg-primary {
  background-color: var(--bs-primary) !important;
}
.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* Evitar errores de scroll cuando el modal está oculto */
.modal:not(.show) {
  display: none;
}
</style>
