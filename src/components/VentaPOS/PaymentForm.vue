<template>
  <div>
    <div class="alert text-bg-warning text-center fs-6 mb-3 py-2">
      Total a Pagar: <strong class="ms-2">${{ props.totalPagar }}</strong>
    </div>
    <div class="row border-top border-secondary-subtle pt-3 mt-3">
      <div class="col-12">
        <div class="form-check form-switch mb-2">
          <input
            class="form-check-input"
            type="checkbox"
            id="aplicaIvaSwitch"
            v-model="aplicaIva"
          />
          <label class="form-check-label fw-bold small" for="aplicaIvaSwitch">
            Aplicar IVA
            <span v-if="aplicaIva" class="text-success ms-2">
              (Tasa: {{ ivaPorcentajeManual }}%)
            </span>
          </label>
        </div>
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

        <div
          v-else-if="tipoVentaSeleccionado === 2 || tipoVentaSeleccionado === 3"
          class="col-md-6 mb-3 d-flex align-items-end"
        >
          <div
            :class="[
              'alert py-2 text-center w-100 mb-0 small',
              tipoVentaSeleccionado === 2
                ? 'text-bg-info border-info'
                : 'text-bg-secondary border-secondary',
            ]"
          >
            <i class="bi bi-info-circle me-1"></i> Modalidad:
            <strong>{{ tipoVentaSeleccionado === 2 ? 'CRÉDITO' : 'PLAN SEPARE' }}</strong>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3" v-if="aplicaIva">
        <label for="ivaInput" class="form-label fw-bold small">Porcentaje IVA (%)</label>
        <input
          id="ivaInput"
          type="number"
          v-model.number="ivaPorcentajeManual"
          class="form-control form-control-sm text-end"
          min="0"
          max="100"
          placeholder="0.00"
        />
      </div>
    </div>
    <div
      class="row border-top border-success-subtle pt-2 mt-2"
      v-if="tipoVentaSeleccionado === 2 || tipoVentaSeleccionado === 3"
    >
      <div class="col-md-6 mb-3">
        <label for="abonoInicialInput" class="form-label fw-bold small">
          Abono Inicial
          <span v-if="tipoVentaSeleccionado === 3" class="text-danger ms-1"> (Mín: $50,000) </span>
        </label>
        <input
          id="abonoInicialInput"
          type="number"
          v-model.number="abonoInicial"
          class="form-control form-control-sm"
          min="0"
          :max="props.totalPagar"
        />
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
        <i class="bi bi-wallet2 me-2"></i> Cambio: <strong>${{ cambio }}</strong>
      </div>

      <div
        v-if="montoPendiente > 0"
        :class="[
          'alert fs-6 py-2',
          tipoVentaSeleccionado === 1 ? 'text-bg-danger' : 'text-bg-warning',
        ]"
      >
        <i class="bi bi-exclamation-triangle me-2"></i> Pendiente
        <span v-if="tipoVentaSeleccionado === 1">(Contado)</span>:
        <strong>${{ montoPendiente }}</strong>
      </div>

      <div v-if="errorVenta" class="alert alert-danger py-2 small">
        <i class="bi bi-x-octagon me-2"></i> {{ errorVenta }}
      </div>
    </div>

    <div class="d-grid gap-2 mt-3">
      <button
        class="btn btn-primary btn-md shadow-sm"
        @click="registrarVenta"
        :disabled="isProcessing || !isVentaValida"
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
import { type ICliente } from '@/interfaces/ICliente'
import { useCajaStore } from '@/store/useCajaStore'

// --- 1. Definiciones de Props y Emits ---
const props = defineProps<{
  subtotalBruto: number
  descuento: number
  impuesto: number
  totalPagar: number
  items: ItemVenta[]
  cliente: ICliente
  clienteGenerico: ICliente
}>()

const emit = defineEmits<{
  (e: 'venta-registrada', mensaje: string): void
  (e: 'close'): void
  (e: 'update:is-contado', isContado: boolean): void
}>()

// --- 2. Estado y Constantes ---

const TIPO_VENTAS = [
  { id: 1, nombre: 'Contado' },
  { id: 2, nombre: 'Crédito' },
  { id: 3, nombre: 'Plan separe' }, // ID 3
]

const MIN_ABONO_PLAN_SEPARE = 50000

const METODOS_PAGO_CONTADO = ['efectivo', 'tarjeta', 'transferencia'] as const
type MetodoPagoContado = (typeof METODOS_PAGO_CONTADO)[number]

const tipoVentaSeleccionado = ref(1)
const metodoSeleccionado = ref<MetodoPagoContado>('efectivo')
const montoRecibido = ref(props.totalPagar)
const referenciaPago = ref<string | null>(null)
const isProcessing = ref(false)
const errorVenta = ref<string | null>(null)
const abonoInicial = ref(0)

// ESTADOS PARA EL IVA
const aplicaIva = ref(false)
const ivaPorcentajeManual = ref(0)

const cajaStore = useCajaStore()

// Watch para sincronizar el monto recibido con el total a pagar
watch(
  () => props.totalPagar,
  (newTotal) => {
    if (tipoVentaSeleccionado.value === 1) {
      montoRecibido.value = newTotal
    }
  },
  { immediate: true },
)

// Watch para resetear estados al cambiar el tipo de venta
watch(tipoVentaSeleccionado, (newTipo) => {
  if (newTipo === 1) {
    abonoInicial.value = 0
    montoRecibido.value = props.totalPagar
  } else {
    montoRecibido.value = 0
  }
  abonoInicial.value = Math.max(0, abonoInicial.value)
})

// Watch para resetear el abono si supera el total
watch(
  () => props.totalPagar,
  (newTotal) => {
    if (abonoInicial.value > newTotal) {
      abonoInicial.value = newTotal
    }
  },
)

// Si aplicaIva se marca, establecer el porcentaje a 19
watch(aplicaIva, (newValue) => {
  if (newValue) {
    ivaPorcentajeManual.value = 19
  } else {
    ivaPorcentajeManual.value = 0
  }
})

// --- 3. Cálculos de Pago ---

const cambio = computed(() => {
  if (tipoVentaSeleccionado.value === 1 && metodoSeleccionado.value === 'efectivo') {
    return montoRecibido.value > props.totalPagar ? montoRecibido.value - props.totalPagar : 0
  }
  return 0
})

const isTipoContado = computed(() => {
  // Si tipoVentaSeleccionado es 1 (Contado), devuelve true.
  // Para 2 (Crédito) o 3 (Plan Separe), devuelve false.
  return tipoVentaSeleccionado.value === 1
})

// --- Watch para emitir el estado al padre ---
watch(
  isTipoContado,
  (newValue) => {
    emit('update:is-contado', newValue)
  },
  { immediate: true },
)

const montoPendiente = computed(() => {
  const isCreditoOrSepare = tipoVentaSeleccionado.value === 2 || tipoVentaSeleccionado.value === 3
  if (isCreditoOrSepare) {
    const pendiente = props.totalPagar - abonoInicial.value
    return Math.max(0, pendiente)
  } else if (tipoVentaSeleccionado.value === 1) {
    const pendiente = props.totalPagar - montoRecibido.value
    return Math.max(0, pendiente)
  }
  return 0
})

// Validación del abono inicial para Plan Separe
const isAbonoMinimoValido = computed(() => {
  if (tipoVentaSeleccionado.value === 3) {
    // Si es Plan Separe
    // Si el total es 0, no hay abono, es válido (aunque esto debe ser raro)
    if (props.totalPagar === 0) return true

    // Si el abono es 0, debe ser menor al total (para permitir abonos parciales)
    if (abonoInicial.value === 0 && props.totalPagar > 0) {
      // Un abono de 0 no cumple el mínimo, a menos que el total sea 0
      return false
    }

    // Si el abono es mayor a 0, debe cumplir el mínimo o ser igual al total.
    return abonoInicial.value >= MIN_ABONO_PLAN_SEPARE || abonoInicial.value === props.totalPagar
  }
  return true // Es válido para Contado o Crédito
})

// Validación general antes de enviar
const isVentaValida = computed(() => {
  // 1. Validación de Contado: Debe estar cubierto
  if (tipoVentaSeleccionado.value === 1) {
    return montoRecibido.value >= props.totalPagar
  }

  // 2. Validación de Crédito / Plan Separe
  const isPendiente = tipoVentaSeleccionado.value === 2 || tipoVentaSeleccionado.value === 3

  if (isPendiente) {
    // Validación de abono mínimo para Plan Separe
    if (tipoVentaSeleccionado.value === 3 && !isAbonoMinimoValido.value) {
      return false
    }

    // El abono inicial no puede ser mayor al total a pagar
    if (abonoInicial.value > props.totalPagar) {
      return false
    }

    // Si el total a pagar es mayor a cero, se necesita un abono si es separe,
    // si es crédito, puede ser 0
    if (tipoVentaSeleccionado.value === 3 && abonoInicial.value <= 0 && props.totalPagar > 0) {
      return false
    }
  }

  return true
})

// CÁLCULO DEL IVA A ENVIAR AL BACKEND
const ivaPorcentajeParaDTO = computed(() => {
  if (aplicaIva.value) {
    return Math.max(0, ivaPorcentajeManual.value)
  }
  return 0
})

// --- 4. Lógica de Finalización ---

const registrarVenta = async () => {
  // Resetear errorVenta para iniciar
  errorVenta.value = null

  if (props.items.length === 0) {
    errorVenta.value = 'No se puede registrar una venta sin productos.'
    return
  }

  const isPendiente = tipoVentaSeleccionado.value === 2 || tipoVentaSeleccionado.value === 3

  if (isPendiente && props.cliente.id === props.clienteGenerico.id) {
    errorVenta.value =
      'Las ventas a Crédito o Plan Separe deben tener un cliente seleccionado (no puede ser cliente genérico).'
    return
  }

  // Validación de abono mínimo
  if (tipoVentaSeleccionado.value === 3 && !isAbonoMinimoValido.value) {
    errorVenta.value = `El abono inicial para Plan Separe debe ser mínimo $${MIN_ABONO_PLAN_SEPARE.toLocaleString('es-CO')} o igual al total.`
    return
  }

  const cajaDiariaId = cajaStore.cajaDiariaId

  if (cajaDiariaId === null) {
    errorVenta.value = 'Error: No se encontró un ID de caja activa para registrar la venta.'
    console.error('Fallo de negocio: No hay caja activa.')
    return
  }

  if (!isVentaValida.value) {
    // Esto debería ser capturado por las validaciones previas, pero como respaldo:
    errorVenta.value = 'El monto de pago/abono no cubre el mínimo requerido o el total de la venta.'
    return
  }

  isProcessing.value = true

  // Mapeo tipificado
  const itemsDTO: VentaItemDTO[] = props.items.map((item: ItemVenta) => ({
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_venta,
    descuento: 0,
  }))

  const isCredito = tipoVentaSeleccionado.value === 2
  const isPlanSepare = tipoVentaSeleccionado.value === 3

  let metodoPagoFinal: MetodoPagoRequest | null = null
  let estadoFinal: EstadoVentaRequest

  if (isPendiente) {
    metodoPagoFinal = isCredito ? 'credito' : 'plan_separe'
    estadoFinal = 'pendiente_pago'
  } else {
    // Contado (tipoVentaSeleccionado.value === 1)
    metodoPagoFinal = metodoSeleccionado.value
    estadoFinal = 'finalizada'
  }

  const clienteIdFinal: number | null =
    props.cliente.id === props.clienteGenerico.id ? null : props.cliente.id

  // Abono inicial solo si el monto es mayor a 0 y es crédito/separe
  const abonoInicialFinal = isPendiente && abonoInicial.value > 0 ? abonoInicial.value : null

  const ventaData: VentaDTO = {
    cliente_id: clienteIdFinal,
    caja_diaria_id: cajaDiariaId,
    tipo_venta_id: tipoVentaSeleccionado.value,
    descuento_total: props.descuento > 0 ? props.descuento : null,
    metodo_pago: metodoPagoFinal,
    estado: estadoFinal,
    iva_porcentaje: ivaPorcentajeParaDTO.value,
    items: itemsDTO,
    abono_inicial: abonoInicialFinal,
  }

  try {
    const resultado = await VentaService.registrarVenta(ventaData)
    VentaService.imprimirFacturaPos(resultado.venta.venta_id)
    let mensaje = `Venta registrada. `
    if (isCredito) {
      mensaje = `Venta a Crédito registrada. Pendiente: $${montoPendiente.value}`
    } else if (isPlanSepare) {
      mensaje = `Venta Plan Separe registrada. Pendiente: $${montoPendiente.value}`
    } else {
      mensaje = `Venta Contado finalizada. Cambio: $${cambio.value}`
    }

    emit('venta-registrada', mensaje)
  } catch (error) {
    errorVenta.value = 'Fallo al registrar la venta. Verifique el servidor.'
    console.error('Error al registrar venta:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>
