<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DetallePedidoForm from './DetallePedidoForm.vue';
import PedidoProveedorService from '@/services/PedidoProveedorService';
import { proveedorService } from '@/services/proveedorService'; // Make sure to import the named export
import type { Proveedor } from '@/services/proveedorService';
import type { IPedidoProveedorRequest, IPedidoProveedor } from '@/interfaces/IPedidoProveedor';
import type { IDetallePedidoProveedorRequest } from '@/interfaces/IDetallePedidoProveedor';

const emit = defineEmits(['submit:pedido', 'success', 'error']);

const numeroFacturaProveedor = ref<string>('');
const fechaEntrega = ref<string>(new Date().toISOString().split('T')[0]); // Default to today
const selectedProveedorId = ref<number | null>(null);

const productos = ref<IDetallePedidoProveedorRequest[]>([]); // Renamed from 'detalles'
const proveedores = ref<Proveedor[]>([]);
const loadingProveedores = ref<boolean>(false);
const submitting = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null); // New ref for success messages


const montoTotal = computed(() => {
  return productos.value.reduce((sum, producto) => { // Use 'productos'
    return sum + (producto.cantidad * producto.precio_compra); // Use 'precio_compra'
  }, 0);
});

onMounted(async () => {
  loadingProveedores.value = true;
  try {
    // Assuming getAllProveedoresNoPaginado returns a direct array of Proveedor
    proveedores.value = await proveedorService.getAllProveedoresNoPaginado();
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    errorMessage.value = 'Error al cargar proveedores.';
  } finally {
    loadingProveedores.value = false;
  }
});

const addDetalle = () => {
  productos.value.push({ // Use 'productos'
    producto_id: 0, // Placeholder, will be updated by DetallePedidoForm
    cantidad: 1,
    precio_compra: 0, // Use 'precio_compra'
  });
};

const updateDetalle = (index: number, detalle: IDetallePedidoProveedorRequest | null) => {
  if (detalle) {
    productos.value[index] = detalle; // Use 'productos'
  } else {
    // Handle invalid/incomplete detail, e.g., remove it or mark as error
    console.warn(`Detalle at index ${index} is invalid and will be excluded from submission if not corrected.`);
  }
};

const removeDetalle = (index: number) => {
  productos.value.splice(index, 1); // Use 'productos'
};

const handleSubmit = async () => {
  errorMessage.value = null;
  successMessage.value = null; // Clear previous success message
  submitting.value = true;

  // Basic validation
  if (!numeroFacturaProveedor.value || !selectedProveedorId.value || productos.value.length === 0 || montoTotal.value <= 0) { // Use 'productos'
    errorMessage.value = 'Por favor, complete todos los campos obligatorios y añada al menos un detalle de pedido válido.';
    submitting.value = false;
    return;
  }

  // Filter out any invalid/incomplete details if `updateDetalle` allowed null
  const validProductos = productos.value.filter(d => d.producto_id && d.cantidad > 0 && d.precio_compra >= 0); // Use 'productos' and 'precio_compra'
  if (validProductos.length === 0) {
      errorMessage.value = 'Por favor, asegúrese de que todos los detalles del pedido son válidos.';
      submitting.value = false;
      return;
  }


  const payload: IPedidoProveedorRequest = {
    numero_factura_proveedor: numeroFacturaProveedor.value,
    fecha_entrega: fechaEntrega.value,
    proveedor_id: selectedProveedorId.value,
    monto_total: montoTotal.value,
    productos: validProductos, // Use 'productos'
  };

  try {
    const response = await PedidoProveedorService.recibirPedido(payload);
    emit('success', response);
    successMessage.value = 'Pedido registrado exitosamente!';
    // Reset form
    numeroFacturaProveedor.value = '';
    fechaEntrega.value = new Date().toISOString().split('T')[0];
    selectedProveedorId.value = null;
    productos.value = []; // Use 'productos'
  } catch (error: any) {
    console.error('Error submitting order:', error);
    errorMessage.value = error.response?.data?.message || 'Error al registrar el pedido.';
    emit('error', error);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="pedido-proveedor-form card p-4 shadow-sm">
    <h2 class="mb-4">Registrar Recepción de Pedido</h2>

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
        <!-- Removed Estado field as it's not validated by backend for initial request -->
      </div>

      <h3 class="mb-3">Detalles del Pedido</h3>
      <div v-for="(producto, index) in productos" :key="index" class="mb-3"> <!-- Use 'productos' -->
        <DetallePedidoForm
          :initialDetalle="producto"
          :index="index"
          @update:detalle="updateDetalle"
          @remove:detalle="removeDetalle"
        />
      </div>

      <button type="button" class="btn btn-outline-primary mb-4" @click="addDetalle">
        + Añadir Producto al Pedido
      </button>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <h4>Monto Total: {{ montoTotal.toFixed(2) }}</h4>
        <button type="submit" class="btn btn-success btn-lg" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ submitting ? 'Registrando...' : 'Registrar Pedido' }}
        </button>
      </div>

      <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Add any specific styles for PedidoProveedorForm here */
</style>
