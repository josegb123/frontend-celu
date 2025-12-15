<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Gestión de Pedidos a Proveedores</h1>

    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Listado de Pedidos</h5>
        <div class="d-flex align-items-center">
          <input
            type="text"
            class="form-control me-2"
            placeholder="Buscar pedido..."
            v-model="searchQuery"
          />
          <button @click="openReceiveOrderModal" class="btn btn-success">
            <i class="bi bi-box-arrow-in-down me-2"></i> Recibir Pedido
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Proveedor</th>
                <th>Fecha Pedido</th>
                <th>Estado</th>
                <th class="text-end">Total Estimado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pedido in filteredPedidos"
                :key="pedido.id"
                @click="openDetailsModal(pedido)"
                style="cursor: pointer;"
              >
                <td>#{{ pedido.id }}</td>
                <td>{{ pedido.proveedor }}</td>
                <td>{{ formatDate(pedido.fechaPedido) }}</td>
                <td>
                  <span :class="['badge', getStatusBadgeClass(pedido.estado)]">
                    {{ pedido.estado }}
                  </span>
                </td>
                <td class="text-end">{{ formatCurrency(pedido.totalEstimado) }}</td>
              </tr>
              <tr v-if="filteredPedidos.length === 0">
                <td colspan="5" class="text-center text-muted py-3">
                  No se encontraron pedidos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles del Pedido -->
    <div
      class="modal fade"
      :class="{ show: showDetailsModal }"
      tabindex="-1"
      aria-labelledby="pedidoDetailsModalLabel"
      aria-hidden="true"
      :style="{ display: showDetailsModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="pedidoDetailsModalLabel">Detalles del Pedido #{{ selectedPedido?.id }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDetailsModal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedPedido">
            <p><strong>Proveedor:</strong> {{ selectedPedido.proveedor }}</p>
            <p><strong>Fecha del Pedido:</strong> {{ formatDate(selectedPedido.fechaPedido) }}</p>
            <p><strong>Estado:</strong>
              <span :class="['badge', getStatusBadgeClass(selectedPedido.estado)]">
                {{ selectedPedido.estado }}
              </span>
            </p>
            <p><strong>Total Estimado:</strong> {{ formatCurrency(selectedPedido.totalEstimado) }}</p>
            <hr>
            <h6>Ítems del Pedido:</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-end">Cantidad Pedida</th>
                    <th class="text-end">Costo Unitario</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedPedido.items" :key="index">
                    <td>{{ item.producto }}</td>
                    <td class="text-end">{{ item.cantidad }}</td>
                    <td class="text-end">{{ formatCurrency(item.costoUnitario) }}</td>
                    <td class="text-end">{{ formatCurrency(item.cantidad * item.costoUnitario) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="selectedPedido.notas"><strong>Notas:</strong> {{ selectedPedido.notas }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Cerrar</button>
            <!-- Aquí se podría agregar un botón para editar el pedido si fuera necesario -->
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Recibir Pedido (Reutilizando RecibirPedidosView como componente) -->
    <div
      class="modal fade"
      :class="{ show: showReceiveOrderModal }"
      tabindex="-1"
      aria-labelledby="receiveOrderModalLabel"
      aria-hidden="true"
      :style="{ display: showReceiveOrderModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="receiveOrderModalLabel">Registrar Recepción de Pedido</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeReceiveOrderModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Aquí se montará el contenido del componente RecibirPedidosView -->
            <ReceiveOrderComponent
              @order-received="handleOrderReceived"
              @close="closeReceiveOrderModal"
              @show-notification="showNotification"
            />
          </div>
        </div>
      </div>
    </div>

    <NotificationModal
      :is-visible="notificationMessage.isVisible"
      :message="notificationMessage.message"
      :is-error="notificationMessage.isError"
      @close="notificationMessage.isVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ReceiveOrderComponent from '@/components/pedidos/ReceiveOrderComponent.vue';
import NotificationModal from '@/components/utils/NotificationModal.vue';

// Reactive state for notifications
const notificationMessage = ref({
  isVisible: false,
  message: '',
  isError: false,
});

function showNotification(payload: { type: 'success' | 'error', message: string }) {
  notificationMessage.value.message = payload.message;
  notificationMessage.value.isError = payload.type === 'error';
  notificationMessage.value.isVisible = true;
}

interface PedidoItem {
  producto: string;
  cantidad: number;
  costoUnitario: number;
}

interface Pedido {
  id: number;
  proveedor: string;
  fechaPedido: string; // ISO date string
  estado: 'Pendiente' | 'Recibido Parcial' | 'Recibido Completo' | 'Cancelado';
  totalEstimado: number;
  items: PedidoItem[];
  notas?: string;
}

const searchQuery = ref('');
const pedidos = ref<Pedido[]>([
  // Datos simulados
  {
    id: 1001,
    proveedor: 'TecnoGlobal S.A.',
    fechaPedido: '2023-10-26T10:00:00Z',
    estado: 'Recibido Parcial',
    totalEstimado: 500000,
    items: [
      { producto: 'Smartphone X', cantidad: 10, costoUnitario: 30000 },
      { producto: 'Tablet Pro', cantidad: 5, costoUnitario: 40000 },
    ],
    notas: 'Entrega programada para el 30 de Octubre.',
  },
  {
    id: 1002,
    proveedor: 'Electro Componentes Ltda.',
    fechaPedido: '2023-11-01T14:30:00Z',
    estado: 'Pendiente',
    totalEstimado: 250000,
    items: [
      { producto: 'Audífonos Bluetooth', cantidad: 20, costoUnitario: 5000 },
      { producto: 'Power Bank 10000mAh', cantidad: 15, costoUnitario: 10000 },
    ],
  },
  {
    id: 1003,
    proveedor: 'Distribuidora Móvil',
    fechaPedido: '2023-11-05T09:00:00Z',
    estado: 'Recibido Completo',
    totalEstimado: 120000,
    items: [
      { producto: 'Protectores de Pantalla', cantidad: 100, costoUnitario: 500 },
      { producto: 'Cables USB-C', cantidad: 50, costoUnitario: 1400 },
    ],
  },
]);

const filteredPedidos = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return pedidos.value.filter(
    (pedido) =>
      pedido.proveedor.toLowerCase().includes(query) ||
      pedido.id.toString().includes(query) ||
      pedido.estado.toLowerCase().includes(query) ||
      pedido.items.some(item => item.producto.toLowerCase().includes(query))
  );
});

const showDetailsModal = ref(false);
const selectedPedido = ref<Pedido | null>(null);

const showReceiveOrderModal = ref(false);

function openDetailsModal(pedido: Pedido) {
  selectedPedido.value = pedido;
  showDetailsModal.value = true;
}

function closeDetailsModal() {
  showDetailsModal.value = false;
  selectedPedido.value = null;
}

function openReceiveOrderModal() {
  showReceiveOrderModal.value = true;
}

function closeReceiveOrderModal() {
  showReceiveOrderModal.value = false;
  // Opcional: Recargar la lista de pedidos o actualizar el pedido recién recibido
  // Para la demo, simplemente cerramos el modal.
}

function handleOrderReceived(receivedData: any) {
  showNotification({ type: 'success', message: 'Pedido recibido y registrado con éxito!' });
  // En una aplicación real, aquí recargarías la lista de pedidos desde el backend
  // o actualizarías el estado localmente con 'receivedData'
  console.log('Pedido recibido data:', receivedData);
  // Ejemplo de cómo agregar el pedido recién recibido a la lista (solo para simulación)
  pedidos.value.unshift({ // Añadir al principio para ver el nuevo
    id: Math.max(...pedidos.value.map(p => p.id)) + 1, // Nuevo ID
    proveedor: receivedData.proveedor_nombre || 'Nuevo Proveedor', // Ajustar según la respuesta real
    fechaPedido: new Date().toISOString(),
    estado: 'Recibido Completo', // Asumir que se recibe completo por ahora
    totalEstimado: receivedData.monto_total,
    items: receivedData.productos.map((p: any) => ({
      producto: p.nombre_producto_temporal,
      cantidad: p.cantidad,
      costoUnitario: p.precio_compra,
    })),
    notas: 'Recibido desde formulario',
  });
  closeReceiveOrderModal();
}

function getStatusBadgeClass(estado: Pedido['estado']) {
  switch (estado) {
    case 'Pendiente': return 'bg-warning text-dark';
    case 'Recibido Parcial': return 'bg-info';
    case 'Recibido Completo': return 'bg-success';
    case 'Cancelado': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>

<style scoped>
.modal.show {
  display: block !important;
  background: rgba(0, 0, 0, 0.5);
}
.modal-dialog {
  margin-top: 50px; /* Ajuste para centrar mejor o dar espacio */
}
.table tbody tr {
    transition: background-color 0.2s ease-in-out;
}
.table tbody tr:hover {
    background-color: #f8f9fa; /* Color de fondo al pasar el ratón */
}
</style>
