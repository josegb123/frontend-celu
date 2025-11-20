<template>
  <div class="container mt-4">
    <h2>Registro de Nueva Venta</h2>
    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="submitVenta">

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="tipoVenta" class="form-label fw-bold">Tipo de Venta</label>
                <select class="form-select" id="tipoVenta" v-model.number="ventaData.tipo_venta_id" required>
                  <option value="" disabled>Selecciona tipo</option>
                  <option v-for="tipo in tiposVenta" :key="tipo.id" :value="tipo.id">
                    {{ tipo.nombre }}
                  </option>
                </select>
              </div>

              <div v-if="ventaData.tipo_venta_id === TIPO_VENTA_IDS.CREDITO" class="mb-3">
                <label for="clienteId" class="form-label fw-bold">ID del Cliente <span
                    class="text-danger">*</span></label>
                <input type="number" class="form-control" id="clienteId" v-model.number="ventaData.cliente_id" required
                  placeholder="Ej: 101" min="1" />
                <small class="text-muted">Requerido para ventas a Crédito.</small>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="metodoPago" class="form-label fw-bold">Método de Pago</label>
                <select class="form-select" id="metodoPago" v-model="ventaData.metodo_pago" required>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="descuento" class="form-label fw-bold">Descuento Global (%)</label>
                <input type="number" class="form-control" id="descuento" v-model.number="ventaData.descuento_total"
                  min="0" max="100" placeholder="Ej: 5 (5%)" />
              </div>
            </div>
          </div>

          <hr />
          <div>
            <h4 class="mb-3">Productos (Ítems)</h4>
          </div>
          <div class="row g-2">
            <div class="col-12">
              <VentaItemRow v-for="(item, index) in ventaData.items" :key="index" :item="item"
                @remove="removeItem(index)" @update:item="updateSpecificItem(index, $event)" />
            </div>
          </div>

          <button type="button" class="btn btn-outline-success btn-sm my-3" @click="addItem">
            <i class="bi bi-plus-circle me-1"></i> Añadir Producto
          </button>

          <hr />

          <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
            {{ message }}
          </div>

          <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
              aria-hidden="true"></span>
            {{ isSubmitting ? 'Procesando...' : 'Registrar Venta' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import VentaService from '@/services/VentaService';
import { useInventoryStore } from '@/store/InventoryStore';

import {
  TIPOS_VENTA_LISTA,
  TIPO_VENTA_IDS,
  type VentaPayload,
  type VentaItem
} from '@/interfaces/IVentaTypes';
import VentaItemRow from '@/components/VentaiItemRow.vue'; // ⬅️ Importar el componente de fila
import { useAuthStore } from '@/store/authStore';

const inventoryStore = useInventoryStore();
const updateSpecificItem = (index: number, newItem: VentaItem) => {
  // Reemplaza el objeto en el array principal con el objeto modificado del hijo.
  ventaData.items[index] = newItem;
};
const authStore = useAuthStore();
const tiposVenta = TIPOS_VENTA_LISTA;

// --- Estado de la Venta ---
const defaultItem: VentaItem = { producto_id: 1, cantidad: 1 };

const ventaData = reactive<VentaPayload>({
  // Aseguramos que el user_id del vendedor sea el del usuario autenticado
  user_id: authStore.user.id || undefined,
  cliente_id: null,
  tipo_venta_id: TIPO_VENTA_IDS.CONTADO, // Iniciar por defecto en Contado (1)
  metodo_pago: 'efectivo',
  descuento_total: 0,
  items: [defaultItem], // Un ítem inicial
});

// --- Manejo de UI y Feedback ---
const message = ref<string | null>(null);
const messageType = ref<'success' | 'danger'>('success');
const isSubmitting = ref(false);

// --- Lógica de Items ---
const addItem = () => {
  ventaData.items.push({ producto_id: 0, cantidad: 1 });
};

const removeItem = (index: number) => {
  if (ventaData.items.length > 1) {
    ventaData.items.splice(index, 1);
  } else {
    // Opcional: limpiar la fila en lugar de eliminarla si solo queda una
    ventaData.items[0] = { producto_id: 0, cantidad: 1 };
  }
};

// --- Watcher para limpiar cliente_id si cambia a Contado ---
watch(() => ventaData.tipo_venta_id, (newVal) => {
  if (newVal === TIPO_VENTA_IDS.CONTADO) {
    // Si vuelve a Contado, el cliente_id no es necesario
    ventaData.cliente_id = null;
  }
});


// --- Lógica de Envío ---
const submitVenta = async () => {
  message.value = null;
  isSubmitting.value = true;

  // 1. Validaciones extra (aunque el backend ya lo hace, es mejor hacerlas aquí)
  if (ventaData.tipo_venta_id !== TIPO_VENTA_IDS.CONTADO && !ventaData.cliente_id) {
    message.value = 'Debe seleccionar un cliente para ventas a crédito o separe.';
    messageType.value = 'danger';
    isSubmitting.value = false;
    return;
  }

  // Filtrar items vacíos o inválidos antes de enviar
  const validItems = ventaData.items.filter(item => item.producto_id > 0 && item.cantidad > 0);

  if (validItems.length === 0) {
    message.value = 'La venta debe contener al menos un producto válido.';
    messageType.value = 'danger';
    isSubmitting.value = false;
    return;
  }

  try {
    const payloadToSend = { ...ventaData, items: validItems };
    const response = await VentaService.registrarVenta(payloadToSend);

    // Éxito
    message.value = response.message || `Venta #${response.venta.id} registrada con éxito.`;
    messageType.value = 'success';
    inventoryStore.notifySaleCompleted();

    // Opcional: Resetear el formulario a un estado inicial limpio
    // Object.assign(ventaData, { ...estadoInicial, user_id: authStore.user.id });

  } catch (error) {
    console.error('Fallo en la venta:', error);
    // Capturamos el error lanzado desde VentaService (e.g., stock insuficiente)
    message.value = (error as Error).message;
    messageType.value = 'danger';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Estilos si se requieren ajustes específicos */
.card-body {
  padding: 1.5rem;
}
</style>