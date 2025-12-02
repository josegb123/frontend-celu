<template>
  <div>
    <div class="alert text-bg-primary text-center fs-6 mb-3 py-2">
      Total a Pagar: <strong class="ms-2">${{ props.totalPagar.toFixed(2) }}</strong>
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold small">Tipo de Venta</label>
        <select v-model="tipoVentaSeleccionado" class="form-select form-select-sm">
          <option v-for="tipo in TIPO_VENTAS" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre }}
          </option>
        </select>
      </div>

      <div class="col-md-6 mb-3" v-if="tipoVentaSeleccionado === 1">
        <label class="form-label fw-bold small">Método de Pago</label>
        <select v-model="metodoSeleccionado" class="form-select form-select-sm">
          <option v-for="metodo in METODOS_PAGO_CONTADO" :key="metodo" :value="metodo">
            {{ metodo.charAt(0).toUpperCase() + metodo.slice(1) }}
          </option>
        </select>
      </div>

      <div v-else class="col-md-6 mb-3 d-flex align-items-end">
        <div class="alert bg-info-subtle text-info border-info py-2 text-center w-100 mb-0 small">
          <i class="bi bi-info-circle me-1"></i> Modalidad: **CRÉDITO** (Pago Pendiente)
        </div>
      </div>
    </div>

    <template v-if="tipoVentaSeleccionado === 1">
      <div class="row border-top border-primary-subtle pt-2 mt-2">
        <div class="col-md-6 mb-3">
          <label class="form-label fw-bold small">
            Monto Recibido
            <span v-if="metodoSeleccionado === 'efectivo'" class="text-danger">*</span>
          </label>
          <input
            type="number"
            v-model.number="montoRecibido"
            class="form-control form-control-sm"
            :readonly="metodoSeleccionado !== 'efectivo'"
            :min="metodoSeleccionado === 'efectivo' ? props.totalPagar : 0"
          />
        </div>

        <div class="col-md-6 mb-3" v-if="metodoSeleccionado !== 'efectivo'">
          <label class="form-label fw-bold small">Referencia (Tarjeta/Transferencia)</label>
          <input
            type="text"
            v-model="referenciaPago"
            class="form-control form-control-sm"
            placeholder="Código de Referencia"
          />
        </div>
      </div>
    </template>

    <div class="mt-2 pt-2 border-top border-primary-subtle">
      <div v-if="cambio > 0" class="alert bg-success-subtle text-success fs-6 py-2">
        <i class="bi bi-wallet2 me-2"></i> Cambio: <strong>${{ cambio.toFixed(2) }}</strong>
      </div>

      <div
        v-if="montoPendiente > 0 && tipoVentaSeleccionado === 1"
        class="alert bg-danger-subtle text-danger fs-6 py-2"
      >
        <i class="bi bi-exclamation-triangle me-2"></i> Pendiente (Contado):
        <strong>${{ montoPendiente.toFixed(2) }}</strong>
      </div>

      <div v-if="errorVenta" class="alert alert-danger py-2 small">
        <i class="bi bi-x-octagon me-2"></i> {{ errorVenta }}
      </div>
    </div>

    <div class="d-grid gap-2 mt-3">
      <button
        class="btn btn-primary btn-md shadow-sm"
        @click="registrarVenta"
        :disabled="isProcessing || (tipoVentaSeleccionado === 1 && !isTotalCubierto)"
      >
        <span
          v-if="isProcessing"
          class="spinner-border spinner-border-sm me-2"
          role="status"
        ></span>
        {{ isProcessing ? 'Procesando...' : 'Confirmar Venta' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VentaService, {
  type VentaDTO,
  type VentaItemDTO,
  type MetodoPagoRequest,
  type EstadoVentaRequest,
} from '@/services/VentaService'

import { type ItemVenta } from '@/interfaces/IPostInterfaces'
import { type Cliente } from '@/interfaces/IPostInterfaces'

// --- 1. Definiciones de Props y Emits ---
const props = defineProps<{
  subtotalBruto: number
  descuento: number
  impuesto: number
  totalPagar: number
  items: ItemVenta[]
  cliente: Cliente
  clienteGenerico: Cliente
}>()

const emit = defineEmits<{
  (e: 'venta-registrada', mensaje: string): void
  (e: 'close'): void
}>()

// --- 2. Estado y Constantes ---

const TIPO_VENTAS = [
  { id: 1, nombre: 'Contado' },
  { id: 2, nombre: 'Crédito' },
]

const METODOS_PAGO_CONTADO = ['efectivo', 'tarjeta', 'transferencia'] as const
type MetodoPagoContado = (typeof METODOS_PAGO_CONTADO)[number]

const tipoVentaSeleccionado = ref(1)
const metodoSeleccionado = ref<MetodoPagoContado>('efectivo')
const montoRecibido = ref(props.totalPagar)
const referenciaPago = ref<string | null>(null)
const isProcessing = ref(false)
const errorVenta = ref<string | null>(null)

watch(
  () => props.totalPagar,
  (newTotal) => {
    montoRecibido.value = newTotal
  },
  { immediate: true },
)

// --- 3. Cálculos de Pago ---

const cambio = computed(() => {
  if (tipoVentaSeleccionado.value === 1 && metodoSeleccionado.value === 'efectivo') {
    return montoRecibido.value > props.totalPagar ? montoRecibido.value - props.totalPagar : 0
  }
  return 0
})

const montoPendiente = computed(() => {
  if (tipoVentaSeleccionado.value === 2) {
    // Si es crédito, el monto pendiente es el total
    return props.totalPagar
  }
  // Si es contado y el monto recibido es menor al total
  return props.totalPagar - montoRecibido.value > 0 ? props.totalPagar - montoRecibido.value : 0
})

const isTotalCubierto = computed(() => {
  if (tipoVentaSeleccionado.value === 2) {
    return true // Crédito siempre se considera cubierto para el botón
  }
  return montoRecibido.value >= props.totalPagar
})

// --- 4. Lógica de Finalización ---

const registrarVenta = async () => {
  if (props.items.length === 0) {
    errorVenta.value = 'No se puede registrar una venta sin productos.'
    return
  }
  // No necesitamos validar isTotalCubierto aquí si el botón ya lo deshabilita.

  isProcessing.value = true
  errorVenta.value = null

  // Mapeo tipificado
  const itemsDTO: VentaItemDTO[] = props.items.map((item: ItemVenta) => ({
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_venta,
    descuento: 0,
  }))

  const isCredito = tipoVentaSeleccionado.value === 2

  const metodoPagoFinal: MetodoPagoRequest | null = isCredito ? 'credito' : metodoSeleccionado.value
  const estadoFinal: EstadoVentaRequest = isCredito ? 'pendiente_pago' : 'finalizada'
  const clienteIdFinal: number | null =
    props.cliente.id === props.clienteGenerico.id ? null : props.cliente.id

  const ventaData: VentaDTO = {
    cliente_id: clienteIdFinal,
    tipo_venta_id: tipoVentaSeleccionado.value,
    descuento_total: props.descuento > 0 ? props.descuento : null,
    metodo_pago: metodoPagoFinal,
    estado: estadoFinal,
    iva_porcentaje: 10,
    items: itemsDTO,
  }

  try {
    await VentaService.registrarVenta(ventaData)

    const mensaje = `Venta ${isCredito ? 'a Crédito' : 'Contado'} registrada. Cambio: $${cambio.value.toFixed(2)}`
    emit('venta-registrada', mensaje)
  } catch (error) {
    errorVenta.value = 'Fallo al registrar la venta. Verifique el servidor.'
    console.error('Error al registrar venta:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>
