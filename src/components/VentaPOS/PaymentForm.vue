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

// --- 1. Definiciones de Props y Emits (Formato Correcto) ---
const props = defineProps<{
  subtotalBruto: number
  descuento: number
  impuesto: number
  totalPagar: number
  items: ItemVenta[] // Uso correcto de la interfaz ItemVenta
  cliente: Cliente
  clienteGenerico: Cliente
}>()

const emit = defineEmits<{
  (e: 'venta-registrada', mensaje: string): void
  (e: 'close'): void
}>()

// --- 2. Estado y Constantes ---

// IDs y nombres de tipo de venta (Alineados con tu tabla 'tipo_ventas')
const TIPO_VENTAS = [
  { id: 1, nombre: 'Contado' },
  { id: 2, nombre: 'Crédito' },
]

// Métodos de pago permitidos por el Store Request (minúsculas)
const METODOS_PAGO_CONTADO = ['efectivo', 'tarjeta', 'transferencia'] as const
type MetodoPagoContado = (typeof METODOS_PAGO_CONTADO)[number]

// Estado de Pago
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
    return props.totalPagar
  }
  return props.totalPagar - montoRecibido.value > 0 ? props.totalPagar - montoRecibido.value : 0
})

const isTotalCubierto = computed(() => {
  if (tipoVentaSeleccionado.value === 2) {
    return true
  }
  return montoRecibido.value >= props.totalPagar
})

// --- 4. Lógica de Finalización ---

const registrarVenta = async () => {
  if (props.items.length === 0) {
    errorVenta.value = 'No se puede registrar una venta sin productos.'
    return
  }
  if (!isTotalCubierto.value && tipoVentaSeleccionado.value === 1) {
    errorVenta.value = 'El monto pagado no cubre el total de la venta de Contado.'
    return
  }

  isProcessing.value = true
  errorVenta.value = null

  // SOLUCIÓN AL ERROR 7: Tipificación del parámetro 'item' en la función map
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

<template>
  <div class="payment-form">
    <div class="alert pos-bg-accent text-light text-center fs-4 mb-4">
      Total a Pagar: **${{ props.totalPagar.toFixed(2) }}**
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label fw-bold">Tipo de Venta</label>
        <select v-model="tipoVentaSeleccionado" class="form-select form-select-lg">
          <option v-for="tipo in TIPO_VENTAS" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre }}
          </option>
        </select>
      </div>

      <div class="col-md-6 mb-3" v-if="tipoVentaSeleccionado === 1">
        <label class="form-label fw-bold">Método de Pago</label>
        <select v-model="metodoSeleccionado" class="form-select form-select-lg">
          <option v-for="metodo in METODOS_PAGO_CONTADO" :key="metodo" :value="metodo">
            {{ metodo.charAt(0).toUpperCase() + metodo.slice(1) }}
          </option>
        </select>
      </div>

      <div v-else class="col-md-6 mb-3">
        <div class="alert alert-info py-3 text-center mb-0">
          Modalidad: **CRÉDITO** (Pago Pendiente)
        </div>
      </div>
    </div>

    <template v-if="tipoVentaSeleccionado === 1">
      <div class="row border-top pt-3 mt-3">
        <div class="col-md-6 mb-3">
          <label class="form-label fw-bold">
            Monto Recibido
            <span v-if="metodoSeleccionado === 'efectivo'" class="text-danger">*</span>
          </label>
          <input
            type="number"
            v-model.number="montoRecibido"
            class="form-control form-control-lg"
            :readonly="metodoSeleccionado !== 'efectivo'"
            :min="metodoSeleccionado === 'efectivo' ? props.totalPagar : 0"
          />
        </div>

        <div class="col-md-6 mb-3" v-if="metodoSeleccionado !== 'efectivo'">
          <label class="form-label fw-bold">Referencia (Tarjeta/Transferencia)</label>
          <input
            type="text"
            v-model="referenciaPago"
            class="form-control form-control-lg"
            placeholder="Código de Referencia"
          />
        </div>
      </div>
    </template>

    <div class="mt-4 pt-3 border-top">
      <div v-if="cambio > 0" class="alert alert-success fs-5">
        Cambio: **${{ cambio.toFixed(2) }}**
      </div>

      <div
        v-if="montoPendiente > 0 && tipoVentaSeleccionado === 1"
        class="alert alert-warning fs-5"
      >
        Pendiente (Contado): **${{ montoPendiente.toFixed(2) }}**
      </div>

      <div v-if="errorVenta" class="alert alert-danger">
        {{ errorVenta }}
      </div>
    </div>

    <div class="d-grid gap-2 mt-4">
      <button
        class="btn pos-btn-accent btn-lg"
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

<style scoped>
.pos-bg-accent {
  background-color: #6a0dad !important;
}
.pos-btn-accent {
  background-color: #7d48c8 !important;
  color: white;
}
.pos-btn-accent:disabled {
  background-color: #a7a4a8 !important;
}
</style>
