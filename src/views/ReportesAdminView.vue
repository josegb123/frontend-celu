<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Reportes Administrativos</h1>

    <div class="row">
      <!-- Reporte de Ventas por Período -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Ventas por Período</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Visualice las ventas totales y el ticket promedio por rango de fechas.</p>
            <div class="d-flex mb-3">
              <input type="date" class="form-control me-2" v-model="startDate" />
              <input type="date" class="form-control me-2" v-model="endDate" />
              <button class="btn btn-primary" @click="fetchVentasPorPeriodo">Consultar</button>
            </div>
            <div v-if="ventasResult" class="mt-3">
              <p><strong>Total Ventas:</strong> {{ formatCurrency(ventasResult.totalVentas) }}</p>
              <p><strong>Ticket Promedio:</strong> {{ formatCurrency(ventasResult.ticketPromedio) }}</p>
            </div>
            <button class="btn btn-outline-success mt-3" @click="exportarVentasExcel">
              <i class="bi bi-file-earmark-excel me-2"></i> Exportar a Excel
            </button>
          </div>
        </div>
      </div>

      <!-- Reporte de Productos con Baja Rotación -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Productos de Baja Rotación</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Identifique productos con pocas ventas en un período. <small class="text-muted">(Últimos 30 días)</small></p>
            <button class="btn btn-warning text-dark" @click="fetchProductosBajaRotacion">
              <i class="bi bi-arrow-clockwise me-2"></i> Actualizar
            </button>
            <div v-if="productosBajaRotacion.length > 0" class="mt-3">
              <ul class="list-group">
                <li v-for="producto in productosBajaRotacion" :key="producto.id" class="list-group-item d-flex justify-content-between align-items-center">
                  {{ producto.nombre }}
                  <span class="badge bg-danger rounded-pill">{{ producto.ventas_periodo }} ventas</span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingBajaRotacion" class="text-muted mt-3">No hay productos con baja rotación.</p>
            <button class="btn btn-outline-danger mt-3" @click="exportarBajaRotacionPdf" :disabled="productosBajaRotacion.length === 0">
              <i class="bi bi-file-earmark-pdf me-2"></i> Exportar a PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Reporte de Clientes (Top Clientes por Gasto) -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Top Clientes por Gasto</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Visualice los clientes que más han comprado en un período. <small class="text-muted">(Últimos 30 días)</small></p>
            <button class="btn btn-info" @click="fetchTopClientes">
              <i class="bi bi-person-heart me-2"></i> Actualizar
            </button>
            <div v-if="topClientes.length > 0" class="mt-3">
              <ul class="list-group">
                <li v-for="cliente in topClientes" :key="cliente.id" class="list-group-item d-flex justify-content-between align-items-center">
                  {{ cliente.nombre }} {{ cliente.apellido }}
                  <span class="badge bg-primary rounded-pill">{{ formatCurrency(cliente.gasto_total) }}</span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingTopClientes" class="text-muted mt-3">No hay datos de top clientes.</p>
          </div>
        </div>
      </div>

      <!-- Reporte de Proveedores (Valor de Pedidos) -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">Valor de Pedidos a Proveedores</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Resumen del valor total de los pedidos realizados a cada proveedor. <small class="text-muted">(Últimos 90 días)</small></p>
            <button class="btn btn-secondary" @click="fetchValorPedidosProveedores">
              <i class="bi bi-truck me-2"></i> Actualizar
            </button>
            <div v-if="valorPedidosProveedores.length > 0" class="mt-3">
              <ul class="list-group">
                <li v-for="prov in valorPedidosProveedores" :key="prov.id" class="list-group-item d-flex justify-content-between align-items-center">
                  {{ prov.nombre }}
                  <span class="badge bg-dark rounded-pill">{{ formatCurrency(prov.valor_total_pedidos) }}</span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingValorPedidosProveedores" class="text-muted mt-3">No hay datos de pedidos a proveedores.</p>
          </div>
        </div>
      </div>

      <!-- Reporte de Movimientos Financieros -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">Movimientos Financieros (Últimos 30 días)</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Resumen de ingresos y egresos recientes.</p>
            <button class="btn btn-dark" @click="fetchHistorialGanancias">
              <i class="bi bi-cash-coin me-2"></i> Actualizar
            </button>
            <div v-if="historialGanancias" class="mt-3">
              <p><strong>Ingresos Totales:</strong> <span class="text-success">{{ formatCurrency(historialGanancias.ingresos) }}</span></p>
              <p><strong>Egresos Totales:</strong> <span class="text-danger">{{ formatCurrency(historialGanancias.egresos) }}</span></p>
              <p><strong>Balance Neto:</strong> <span :class="historialGanancias.balance >= 0 ? 'text-success' : 'text-danger'">{{ formatCurrency(historialGanancias.balance) }}</span></p>
            </div>
            <p v-else-if="!loadingHistorialGanancias" class="text-muted mt-3">No hay datos financieros recientes.</p>
          </div>
        </div>
      </div>

       <!-- Información del Negocio para Reportes -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Información del Negocio (Para Reportes)</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Estos datos se usan en la cabecera de los reportes generados.</p>
            <p><strong>Nombre:</strong> {{ businessInfo.nombre }}</p>
            <p><strong>Propietario:</strong> {{ businessInfo.propietario }}</p>
            <p><strong>NIT:</strong> {{ businessInfo.nit }}</p>
            <p><strong>Dirección:</strong> {{ businessInfo.direccion }}</p>
            <p><strong>Teléfono:</strong> {{ businessInfo.tel }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ReportesService from '@/services/ReportesService';
import { useAppConfigStore } from '@/store/useAppConfigStore'; // Added this import

// --- Stores ---
const appConfig = useAppConfigStore(); // Added this

// --- Fechas para filtros ---
const startDate = ref('');
const endDate = ref('');

// --- Datos de Reportes ---
const ventasResult = ref<{ totalVentas: number; ticketPromedio: number } | null>(null);
const productosBajaRotacion = ref<any[]>([]);
const topClientes = ref<any[]>([]);
const valorPedidosProveedores = ref<any[]>([]);
const historialGanancias = ref<{ ingresos: number; egresos: number; balance: number } | null>(null);

// --- Estados de Carga ---
const loadingVentas = ref(false);
const loadingBajaRotacion = ref(false);
const loadingTopClientes = ref(false);
const loadingValorPedidosProveedores = ref(false);
const loadingHistorialGanancias = ref(false);

// --- Información del Negocio para Reportes ---
const businessInfo = ref({
  nombre: appConfig.getBusinessName, // Reemplazado
  propietario: appConfig.getBusinessAdministrator, // Reemplazado
  nit: appConfig.getBusinessNit, // Reemplazado
  direccion: appConfig.getBusinessAddress, // Reemplazado
  tel: appConfig.getBusinessPhone, // Reemplazado
});

// --- Métodos para Consultar Reportes ---
async function fetchVentasPorPeriodo() {
  loadingVentas.value = true;
  try {
    const data = await ReportesService.getVentasPorPeriodo(startDate.value, endDate.value);
    ventasResult.value = data;
  } catch (error) {
    console.error('Error al obtener ventas por período:', error);
    ventasResult.value = null;
  } finally {
    loadingVentas.value = false;
  }
}

async function fetchProductosBajaRotacion() {
  loadingBajaRotacion.value = true;
  try {
    const data = await ReportesService.getProductosBajaRotacion();
    productosBajaRotacion.value = data;
  } catch (error) {
    console.error('Error al obtener productos de baja rotación:', error);
    productosBajaRotacion.value = [];
  } finally {
    loadingBajaRotacion.value = false;
  }
}

async function fetchTopClientes() {
  loadingTopClientes.value = true;
  try {
    const data = await ReportesService.getTopClientes();
    topClientes.value = data;
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    topClientes.value = [];
  } finally {
    loadingTopClientes.value = false;
  }
}

async function fetchValorPedidosProveedores() {
  loadingValorPedidosProveedores.value = true;
  try {
    const data = await ReportesService.getValorPedidosProveedores();
    valorPedidosProveedores.value = data;
  } catch (error) {
    console.error('Error al obtener valor de pedidos a proveedores:', error);
    valorPedidosProveedores.value = [];
  } finally {
    loadingValorPedidosProveedores.value = false;
  }
}

async function fetchHistorialGanancias() {
  loadingHistorialGanancias.value = true;
  try {
    const data = await ReportesService.getHistorialGanancias();
    historialGanancias.value = data;
  } catch (error) {
    console.error('Error al obtener historial de ganancias:', error);
    historialGanancias.value = null;
  } finally {
    loadingHistorialGanancias.value = false;
  }
}

// --- Métodos de Exportación ---
async function exportarVentasExcel() {
  try {
    await ReportesService.exportarVentasExcel(startDate.value, endDate.value);
    alert('Reporte de ventas exportado a Excel.');
  } catch (error) {
    console.error('Error al exportar ventas a Excel:', error);
    alert('Error al exportar reporte.');
  }
}

async function exportarBajaRotacionPdf() {
  try {
    await ReportesService.exportarBajaRotacionPdf(); // Este servicio debería crearse o adecuarse
    alert('Reporte de baja rotación exportado a PDF.');
  } catch (error) {
    console.error('Error al exportar baja rotación a PDF:', error);
    alert('Error al exportar reporte.');
  }
}

// --- Utilidades ---
const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
};

// --- Ciclo de Vida ---
onMounted(() => {
  // Establecer fechas por defecto para el reporte de ventas (últimos 30 días)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
  endDate.value = today.toISOString().split('T')[0];

  // Cargar algunos reportes al iniciar
  fetchVentasPorPeriodo();
  fetchProductosBajaRotacion();
  fetchTopClientes();
  fetchValorPedidosProveedores();
  fetchHistorialGanancias();
});
</script>

<style scoped>
.card-header.bg-warning {
  color: #212529 !important; /* Para que el texto se vea bien en fondo warning */
}
</style>
