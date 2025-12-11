<template>
  <div class="pedido-proveedor-form card p-4 shadow-sm">
    <h2 class="mb-4">Registrar Recepción de Pedido</h2>

    <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <label for="numeroFactura" class="form-label">Número de Factura del Proveedor</label>
          <input
            type="text"
            class="form-control"
            id="numeroFactura"
            v-model="numeroFacturaProveedor"
            required
          />
        </div>
        <div class="col-md-6">
          <label for="fechaEntrega" class="form-label">Fecha de Entrega</label>
          <input
            type="date"
            class="form-control"
            id="fechaEntrega"
            v-model="fechaEntrega"
            required
          />
        </div>
        <div class="col-md-6">
          <label for="proveedor" class="form-label">Proveedor</label>
          <select
            class="form-select"
            id="proveedor"
            v-model="selectedProveedorId"
            required
            :disabled="loadingProveedores"
          >
            <option :value="null" disabled>Seleccione un proveedor</option>
            <option v-if="loadingProveedores" disabled>Cargando proveedores...</option>
            <option v-for="proveedor in proveedores" :key="proveedor.id" :value="proveedor.id">
              {{ proveedor.nombreComercial }}
            </option>
          </select>
        </div>
      </div>
      <h3 class="mb-3">Detalles del Pedido (Búsqueda Mejorada)</h3>
      <div v-for="(producto, index) in productos" :key="index" class="mb-3">
        <DetallePedidoForm
          :initialDetalle="producto"
          :index="index"
          @update:detalle="updateDetalle"
          @remove:detalle="removeDetalle"
        />
      </div>

      <div v-if="productos.length === 0" class="alert alert-info text-center">
        Añada productos para comenzar el registro.
      </div>

      <button type="button" class="btn btn-outline-primary mb-4" @click="addDetalle">
        + Añadir Producto al Pedido
      </button>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <h4>Monto Total: {{ formatCurrency(montoTotal) }}</h4>
        <button
          type="submit"
          class="btn btn-success btn-lg"
          :disabled="submitting || productos.length === 0 || montoTotal <= 0"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ submitting ? 'Registrando...' : 'Registrar Pedido' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DetallePedidoForm from './DetallePedidoForm.vue'
import PedidoProveedorService from '@/services/PedidoProveedorService'
import { proveedorService } from '@/services/proveedorService'
import type { Proveedor } from '@/services/proveedorService'
import type { IPedidoProveedorRequest } from '@/interfaces/IPedidoProveedor'
import type { IDetallePedidoProveedorRequest } from '@/interfaces/IDetallePedidoProveedor'
import { isAxiosError } from 'axios'

// Tipado extendido para el detalle para incluir el nombre temporal para el placeholder
interface DetalleLocal extends IDetallePedidoProveedorRequest {
  nombre_producto_temporal?: string
}

const emit = defineEmits(['submit:pedido', 'success', 'error'])

const numeroFacturaProveedor = ref<string>('')
const fechaEntrega = ref<string>(new Date().toISOString().split('T')[0] || '')
const selectedProveedorId = ref<number | null>(null)

const productos = ref<DetalleLocal[]>([]) // Usamos el tipo extendido
const proveedores = ref<Proveedor[]>([])
const loadingProveedores = ref<boolean>(false)
const submitting = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const montoTotal = computed(() => {
  return productos.value.reduce((sum, producto) => {
    // Solo sumar si los valores son números válidos
    const cantidad = producto.cantidad || 0
    const precio = producto.precio_compra || 0
    return sum + cantidad * precio
  }, 0)
})

// Función para formatear moneda (mejor UX)
const formatCurrency = (val: number): string => {
  if (typeof val !== 'number' || isNaN(val)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}

onMounted(async () => {
  loadingProveedores.value = true
  try {
    proveedores.value = await proveedorService.getAllProveedoresNoPaginado()
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    errorMessage.value = 'Error al cargar proveedores.'
  } finally {
    loadingProveedores.value = false
  }
})

const addDetalle = () => {
  productos.value.push({
    producto_id: 0, // Inicia en 0, esperando la selección
    cantidad: 1,
    precio_compra: 0,
    nombre_producto_temporal: 'Buscar Producto...', // Nombre inicial para el placeholder
  })
}

const updateDetalle = (index: number, detalle: DetalleLocal | null) => {
  if (detalle && productos.value[index]) {
    // Usamos Object.assign para asegurar la reactividad
    Object.assign(productos.value[index], detalle)
  } else {
    // Si el detalle es inválido, podrías considerar eliminarlo, pero por ahora solo advertimos
    console.warn(`Detalle at index ${index} is invalid.`)
  }
}

const removeDetalle = (index: number) => {
  productos.value.splice(index, 1)
}

const handleSubmit = async () => {
  errorMessage.value = null
  successMessage.value = null
  submitting.value = true

  const validProductos = productos.value.filter(
    (d) => d.producto_id && d.cantidad > 0 && d.precio_compra >= 0,
  )

  // Validación de cabecera y ítems
  if (!numeroFacturaProveedor.value || !selectedProveedorId.value) {
    errorMessage.value = 'Por favor, complete la factura y seleccione un proveedor.'
    submitting.value = false
    return
  }
  if (validProductos.length === 0 || montoTotal.value <= 0) {
    errorMessage.value =
      'Debe añadir al menos un detalle de pedido válido y con monto total mayor a cero.'
    submitting.value = false
    return
  }

  const payload: IPedidoProveedorRequest = {
    numero_factura_proveedor: numeroFacturaProveedor.value,
    fecha_entrega: fechaEntrega.value,
    proveedor_id: selectedProveedorId.value,
    monto_total: montoTotal.value,
    // Limpiar el tipo temporal antes de enviar
    productos: validProductos.map((producto) => {
      const { nombre_producto_temporal, ...rest } = producto
      return rest
    }) as IDetallePedidoProveedorRequest[],
    metodo_pago: null,
  }

  try {
    const response = await PedidoProveedorService.recibirPedido(payload)
    emit('success', response)
    successMessage.value = 'Pedido registrado exitosamente!'

    numeroFacturaProveedor.value = ''
    fechaEntrega.value = new Date().toISOString().split('T')[0] || ''
    selectedProveedorId.value = null
    productos.value = []
  } catch (error) {
    console.error('Error submitting order:', error)
    if (isAxiosError(error)) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error de red al registrar el pedido.'
    } else if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al registrar el pedido.'
    }
    emit('error', error)
  } finally {
    submitting.value = false
  }
}
</script>
