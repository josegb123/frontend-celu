<template>
  <div v-if="show" class="modal d-block fade show" tabindex="-1" @click.self="emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Detalle de Cuenta #{{ cuenta?.id }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="emit('close')"></button>
        </div>

        <div v-if="isLoading" class="modal-body text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Cargando detalle de la cuenta y sus relaciones...</p>
        </div>

        <div v-else-if="detalleCuenta" class="modal-body">
          <div class="row mb-3 border-bottom pb-3">
            <div class="col-md-7">
              <p class="mb-1">
                <strong>Cliente:</strong> {{ detalleCuenta.cliente.nombre }} ({{
                  detalleCuenta.cliente.ruc_ci || 'N/A'
                }})
              </p>
              <p class="mb-1"><strong>ID Venta:</strong> {{ detalleCuenta.venta_id }}</p>
              <p class="mb-1"><strong>Vendedor:</strong> {{ detalleCuenta.venta.user.nombre }}</p>
              <p class="mb-1">
                <strong>Vencimiento:</strong> {{ detalleCuenta.fecha_vencimiento }}
              </p>
            </div>
            <div class="col-md-5 text-end">
              <span
                :class="{
                  'badge bg-warning text-dark': detalleCuenta.estado === 'Pendiente',
                  'badge bg-danger': detalleCuenta.estado === 'Vencida',
                  'badge bg-success': detalleCuenta.estado === 'Saldada',
                }"
              >
                {{ detalleCuenta.estado }}
              </span>
              <h4 class="mb-0 text-success mt-1">
                Total: ${{ Number(detalleCuenta.monto_original).toFixed(2) }}
              </h4>
              <h2
                class="mb-2"
                :class="{
                  'text-danger': detalleCuenta.estado !== 'Saldada',
                  'text-success': detalleCuenta.estado === 'Saldada',
                }"
              >
                Pendiente: ${{ Number(detalleCuenta.monto_pendiente).toFixed(2) }}
              </h2>
              <button
                v-if="detalleCuenta.estado !== 'Saldada'"
                class="btn btn-sm btn-success"
                @click="(emit('register-abono', cuenta!), emit('close'))"
              >
                Registrar Abono
              </button>
            </div>
          </div>

          <h6 class="mb-3 text-primary">Historial de Abonos ({{ detalleCuenta.abonos.length }})</h6>
          <div
            v-if="detalleCuenta.abonos.length > 0"
            class="abonos-list-wrapper card card-body bg-light mb-4"
          >
            <ul class="list-group list-group-flush">
              <li
                v-for="abono in detalleCuenta.abonos"
                :key="abono.id"
                class="list-group-item d-flex justify-content-between align-items-center small py-2 bg-light"
              >
                <span>
                  Abono #{{ abono.id }} registrado por **{{ abono.user?.nombre || 'N/A' }}**
                </span>
                <span class="fw-bold text-success">
                  + ${{ Number(abono.monto_abonado).toFixed(2) }} ({{ abono.metodo_pago }})
                  <small class="text-muted ms-2">{{
                    new Date(abono.created_at).toLocaleDateString()
                  }}</small>
                </span>
              </li>
            </ul>
          </div>
          <div v-else class="alert alert-info small">
            Esta cuenta aún no tiene abonos registrados.
          </div>

          <h6 class="text-primary mt-4">Productos de la Venta (ID {{ detalleCuenta.venta_id }})</h6>
          <div v-if="detalleCuenta.venta.detalles && detalleCuenta.venta.detalles.length > 0">
            <table class="table table-sm small">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in detalleCuenta.venta.detalles" :key="index">
                  <td>{{ item.nombre_producto || 'Producto sin nombre' }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>${{ Number(item.precio_unitario).toFixed(2) }}</td>
                  <td class="text-end">${{ Number(item.subtotal).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-warning small">
            No se encontraron detalles de la venta asociada.
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CuentaPorCobrarService, {
  type CuentaPorCobrarDetalle,
} from '@/services/CuentaPorCobrarService'
import type { CuentaPorCobrar } from '@/interfaces/IAbono'

const props = defineProps<{
  cuenta: CuentaPorCobrar | null
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register-abono', cuenta: CuentaPorCobrar): void
}>()

const detalleCuenta = ref<CuentaPorCobrarDetalle | null>(null)
const isLoading = ref(false)

/**
 * Carga el detalle completo cuando la cuenta o la visibilidad cambian.
 */
watch(
  () => props.show,
  async (newValue) => {
    if (newValue && props.cuenta) {
      // La lógica para recargar cuando el detalle está abierto (ej: después de un abono)
      if (props.cuenta.id === detalleCuenta.value?.id) {
        console.log('Recargando detalle de cuenta...')
      }

      isLoading.value = true
      // Limpiar el detalle anterior para no mostrar datos incorrectos
      detalleCuenta.value = null

      const data = await CuentaPorCobrarService.getCuentaDetalle(props.cuenta.id)

      if (data) {
        detalleCuenta.value = data
      } else {
        console.error('No se pudo cargar el detalle completo de la cuenta.')
      }
      isLoading.value = false
    }
  },
  { immediate: true },
)

// Observar cambios en el objeto 'cuenta' (solo para propósitos de recarga manual, ej: si se actualiza monto_pendiente)
watch(
  () => props.cuenta?.monto_pendiente,
  () => {
    // Si la cuenta base cambia (lo cual puede pasar después de un abono exitoso), forzamos la recarga del detalle
    if (props.show && props.cuenta?.id) {
      watch(
        () => props.show,
        () => {},
        { immediate: true },
      ) // Ejecuta el watch principal de forma inmediata
    }
  },
)
</script>

<style scoped>
/* Estilos necesarios para hacer el modal funcionar correctamente */
.modal {
  background-color: rgba(0, 0, 0, 0.6);
  overflow-y: auto;
}
.modal-dialog {
  max-width: 800px;
}
.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
</style>
