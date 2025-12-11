<template>
  <div class="reportes-admin-view container py-4">
    <h1 class="text-2xl font-bold mb-4">
      <i class="bi bi-bar-chart-fill me-2"></i> Generador de Reportes y Estadísticas
    </h1>

    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white">
        <h2 class="h5 mb-0">Filtros de Reporte</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="generarReporte">
          <div class="mb-3">
            <label for="reportType" class="form-label fw-bold"> Seleccione el Reporte: </label>
            <select id="reportType" v-model="selectedReport" class="form-select">
              <option value="bajoStock">Productos con Stock Bajo Umbral</option>
              <option value="ventasAgrupadas">Ventas Agrupadas por Período</option>
              <option value="ventasPorCategoria">Ventas por Categoría</option>
              <option value="ticketPromedio">Ticket Promedio</option>
              <option value="historialGanancias">Historial de Ganancias</option>
              <option value="topClientes">Top Clientes por Monto</option>
              <option value="topProductos">Top Productos Vendidos</option>
              <option value="productosBajaRotacion">Productos de Baja Rotación</option>
              <option value="valorPedidosProveedores">Valor de Pedidos a Proveedores</option>
              <option value="topClientesFrecuencia">Top Clientes por Frecuencia</option>
            </select>
          </div>

          <div
            v-if="selectedReport === 'ventasAgrupadas' || selectedReport === 'historialGanancias'"
            class="mb-3"
          >
            <label class="form-label fw-bold"> Período para Ventas Agrupadas: </label>
            <div class="mt-2">
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  class="form-check-input"
                  id="periodoDay"
                  value="day"
                  v-model="ventasPeriodo"
                />
                <label class="form-check-label" for="periodoDay">Día</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  class="form-check-input"
                  id="periodoMonth"
                  value="month"
                  v-model="ventasPeriodo"
                />
                <label class="form-check-label" for="periodoMonth">Mes</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  type="radio"
                  class="form-check-input"
                  id="periodoYear"
                  value="year"
                  v-model="ventasPeriodo"
                />
                <label class="form-check-label" for="periodoYear">Año</label>
              </div>
            </div>
          </div>

          <div v-if="selectedReport === 'historialGanancias'" class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="fechaInicio" class="form-label fw-bold">Fecha Inicio:</label>
              <input type="date" id="fechaInicio" v-model="fechaInicio" class="form-control" />
            </div>
            <div class="col-md-6">
              <label for="fechaFin" class="form-label fw-bold">Fecha Fin:</label>
              <input type="date" id="fechaFin" v-model="fechaFin" class="form-control" />
            </div>
          </div>

          <div v-if="selectedReport === 'productosBajaRotacion'" class="mb-3">
            <label for="periodDays" class="form-label fw-bold"
              >Días del Período (para Baja Rotación):</label
            >
            <input
              type="number"
              id="periodDays"
              v-model.number="periodDays"
              class="form-control"
              min="1"
            />
          </div>

          <div v-if="selectedReport === 'topClientesFrecuencia'" class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="frecuenciaPeriodDays" class="form-label fw-bold">Días del Período:</label>
              <input
                type="number"
                id="frecuenciaPeriodDays"
                v-model.number="frecuenciaPeriodDays"
                class="form-control"
                min="1"
              />
            </div>
            <div class="col-md-6">
              <label for="frecuenciaLimit" class="form-label fw-bold">Límite de Clientes:</label>
              <input
                type="number"
                id="frecuenciaLimit"
                v-model.number="frecuenciaLimit"
                class="form-control"
                min="1"
              />
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4">
            <button type="submit" class="btn btn-success" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else><i class="bi bi-search me-1"></i> Generar Reporte</span>
            </button>

            <div class="d-flex gap-2">
              <button
                type="button"
                @click="exportarPDF"
                :disabled="
                  !reportData ||
                  (Array.isArray(reportData) && reportData.length === 0) ||
                  loading ||
                  (selectedReport !== 'bajoStock' &&
                    selectedReport !== 'ventasAgrupadas' &&
                    selectedReport !== 'ventasPorCategoria' &&
                    selectedReport !== 'historialGanancias' &&
                    selectedReport !== 'topClientes' &&
                    selectedReport !== 'topProductos' &&
                    selectedReport !== 'productosBajaRotacion' &&
                    selectedReport !== 'valorPedidosProveedores' &&
                    selectedReport !== 'topClientesFrecuencia')
                "
                class="btn btn-danger"
              >
                <i class="bi bi-file-pdf me-1"></i> Generar PDF
              </button>
              <button
                type="button"
                @click="exportarExcel"
                :disabled="isExcelButtonDisabled"
                class="btn btn-success"
              >
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Generar Excel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="reportData && (Array.isArray(reportData) ? reportData.length > 0 : reportData !== null)"
      class="card shadow-sm"
    >
      <div class="card-header bg-secondary text-white">
        <h2 class="h5 mb-0">Resultados del Reporte</h2>
      </div>
      <div class="card-body">
        <div v-if="selectedReport === 'bajoStock'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre Producto</th>
                <th>Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bajoStockData" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>
                  <span class="badge bg-danger">{{ item.stock_actual }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'ventasAgrupadas'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>Período</th>
                <th>Ventas Totales</th>
                <th>Beneficio Bruto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ventasAgrupadasData" :key="item.periodo_fecha">
                <td>{{ item.periodo_fecha }}</td>
                <td>{{ item.ventas_totales.toFixed(2) }}</td>
                <td>{{ (item.beneficio ?? 0).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'ventasPorCategoria'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>Categoría</th>
                <th>Unidades Vendidas</th>
                <th>Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ventasPorCategoriaData" :key="item.categoria_nombre">
                <td>{{ item.categoria_nombre }}</td>
                <td>{{ item.total_unidades_vendidas }}</td>
                <td>{{ item.total_ventas_categoria.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'ticketPromedio'" class="alert alert-info text-center">
          <h4 class="alert-heading">Ticket Promedio de Venta</h4>
          <p class="display-4 fw-bold">
            {{ ticketPromedioData.monto_promedio_venta.toFixed(2) }}
            <small class="text-muted">{{ ticketPromedioData.unidad }}</small>
          </p>
          <p>Este es el valor promedio de cada transacción de venta.</p>
        </div>

        <div v-else-if="selectedReport === 'historialGanancias'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>Período</th>
                <th>Beneficio Bruto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historialGananciasData" :key="item.periodo_fecha">
                <td>{{ item.periodo_fecha }}</td>
                <td>{{ item.beneficio_bruto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'topClientes'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>ID Cliente</th>
                <th>Nombre Cliente</th>
                <th>Monto Total Comprado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topClientesData" :key="item.cliente_id">
                <td>{{ item.cliente_id }}</td>
                <td>{{ item.nombre_cliente }}</td>
                <td>{{ item.monto_total.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'topProductos'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>ID Producto</th>
                <th>Nombre Producto</th>
                <th>Unidades Vendidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topProductosData" :key="item.producto_id">
                <td>{{ item.producto_id }}</td>
                <td>{{ item.nombre_producto }}</td>
                <td>{{ item.unidades_vendidas }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'productosBajaRotacion'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Unidades Vendidas (Período)</th>
                <th>Última Venta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in productosBajaRotacionData" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.stock }}</td>
                <td>{{ item.unidades_vendidas_en_periodo }}</td>
                <td>{{ item.ultima_venta ?? 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="selectedReport === 'valorPedidosProveedores'">
          <h4 class="mb-3">
            Total Gastado en Pedidos a Proveedores:
            <span class="badge bg-primary">
              {{ valorPedidosProveedoresData.total_gasto_proveedores.toFixed(2) }} COP
            </span>
          </h4>
          <p>
            Período: {{ valorPedidosProveedoresData.periodo.start_date }} a
            {{ valorPedidosProveedoresData.periodo.end_date }}
          </p>

          <h5 class="mt-4">Detalle por Proveedor:</h5>
          <div
            v-if="valorPedidosProveedoresData.detalles_por_proveedor.length > 0"
            class="table-responsive"
          >
            <table class="table table-striped table-hover">
              <thead class="table-light">
                <tr>
                  <th>Proveedor</th>
                  <th>Total Gastado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in valorPedidosProveedoresData.detalles_por_proveedor"
                  :key="item.proveedor_id"
                >
                  <td>{{ item.nombre_proveedor }}</td>
                  <td>{{ item.total_gastado.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-warning">
            No hay detalles de pedidos a proveedores para el período seleccionado.
          </div>
        </div>

        <div v-else-if="selectedReport === 'topClientesFrecuencia'" class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>ID Cliente</th>
                <th>Nombre Cliente</th>
                <th>Email Cliente</th>
                <th>Número de Compras</th>
                <th>Última Compra</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topClientesFrecuenciaData" :key="item.cliente_id">
                <td>{{ item.cliente_id }}</td>
                <td>{{ item.nombre_cliente }}</td>
                <td>{{ item.email_cliente ?? 'N/A' }}</td>
                <td>{{ item.numero_compras_en_periodo }}</td>
                <td>{{ item.ultima_compra ?? 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !reportData" class="alert alert-info text-center mt-4">
      <i class="bi bi-info-circle me-1"></i> Seleccione un reporte y genere para ver los resultados.
    </div>
    <div
      v-else-if="
        !loading &&
        reportData &&
        (Array.isArray(reportData) ? reportData.length === 0 : reportData === null)
      "
      class="alert alert-warning text-center mt-4"
    >
      <i class="bi bi-exclamation-triangle-fill me-1"></i> No se encontraron datos para el reporte
      seleccionado.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue' // Importar 'computed'
import { estadisticasService } from '@/services/estadisticasService'
import type {
  ProductoBajoStock,
  VentasPorPeriodoResponse, // Changed to Response to avoid confusion
  VentasPorPeriodoApiRequest,
  VentasPorCategoriaEstadistica, // New import
  VentasPorCategoriaResponse, // New import
  TicketPromedioResponse, // New import
  HistorialGananciasEstadistica, // New import
  HistorialGananciasResponse, // New import
  TopCliente, // New import
  TopProducto, // New import
  ProductoBajaRotacion, // New import
  ProductosBajaRotacionRequest, // New import
  ProductosBajaRotacionResponse, // New import
  PedidoProveedorDetalle, // New import
  ValorPedidosProveedoresRequest, // New import
  ValorPedidosProveedoresResponse, // New import
  TopClienteFrecuencia, // New import
  TopClientesFrecuenciaRequest, // New import
  TopClientesFrecuenciaResponse, // New import
} from '@/interfaces/estadisticas'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable' // Correct import for autoTable

// --- Estado Reactivo ---
const selectedReport = ref<
  | 'bajoStock'
  | 'ventasAgrupadas'
  | 'ventasPorCategoria'
  | 'ticketPromedio'
  | 'historialGanancias'
  | 'topClientes'
  | 'topProductos'
  | 'productosBajaRotacion'
  | 'valorPedidosProveedores'
  | 'topClientesFrecuencia'
>('bajoStock')
const ventasPeriodo = ref<'day' | 'month' | 'year'>('month')
const fechaInicio = ref<string>('')
const fechaFin = ref<string>('')
const periodDays = ref<number>(90) // Default for Productos de Baja Rotación
const frecuenciaPeriodDays = ref<number>(90) // Default for Top Clientes por Frecuencia
const frecuenciaLimit = ref<number>(10) // Default for Top Clientes por Frecuencia

const reportData = ref<
  | ProductoBajoStock[]
  | VentasPorPeriodoResponse['data']
  | VentasPorCategoriaResponse['data']
  | TicketPromedioResponse
  | HistorialGananciasEstadistica[]
  | TopCliente[]
  | TopProducto[]
  | ProductoBajaRotacion[]
  | ValorPedidosProveedoresResponse
  | TopClienteFrecuencia[] // New type
  | null
>(null) // Use data property
const loading = ref(false)

// --- Propiedades Computadas para Type Narrowing en el Template ---

/**
 * Devuelve reportData tipado como ProductoBajoStock[] si el reporte es 'bajoStock',
 * de lo contrario, devuelve un array vacío.
 */
const bajoStockData = computed<ProductoBajoStock[]>(() => {
  if (selectedReport.value === 'bajoStock' && reportData.value) {
    // La aserción de tipo es segura debido a la comprobación de selectedReport.value
    return reportData.value as ProductoBajoStock[]
  }
  return []
})

/**
 * Devuelve reportData tipado como VentasPorPeriodoResponse['data'] si el reporte es 'ventasAgrupadas',
 * de lo contrario, devuelve un array vacío.
 */
const ventasAgrupadasData = computed<VentasPorPeriodoResponse['data']>(() => {
  if (selectedReport.value === 'ventasAgrupadas' && reportData.value) {
    // La aserción de tipo es segura debido a la comprobación de selectedReport.value
    return reportData.value as VentasPorPeriodoResponse['data']
  }
  return []
})

/**
 * Devuelve reportData tipado como VentasPorCategoriaEstadistica[] si el reporte es 'ventasPorCategoria',
 * de lo contrario, devuelve un array vacío.
 */
const ventasPorCategoriaData = computed<VentasPorCategoriaEstadistica[]>(() => {
  if (selectedReport.value === 'ventasPorCategoria' && reportData.value) {
    return reportData.value as VentasPorCategoriaEstadistica[]
  }
  return []
})

/**
 * Devuelve reportData tipado como TicketPromedioResponse si el reporte es 'ticketPromedio',
 * de lo contrario, devuelve un objeto por defecto.
 */
const ticketPromedioData = computed<TicketPromedioResponse>(() => {
  if (selectedReport.value === 'ticketPromedio' && reportData.value) {
    return reportData.value as TicketPromedioResponse
  }
  return { monto_promedio_venta: 0, unidad: 'COP' } // Valor por defecto
})

/**
 * Devuelve reportData tipado como HistorialGananciasEstadistica[] si el reporte es 'historialGanancias',
 * de lo contrario, devuelve un array vacío.
 */
const historialGananciasData = computed<HistorialGananciasEstadistica[]>(() => {
  if (selectedReport.value === 'historialGanancias' && reportData.value) {
    return reportData.value as HistorialGananciasEstadistica[]
  }
  return []
})

/**
 * Devuelve reportData tipado como TopCliente[] si el reporte es 'topClientes',
 * de lo contrario, devuelve un array vacío.
 */
const topClientesData = computed<TopCliente[]>(() => {
  if (selectedReport.value === 'topClientes' && reportData.value) {
    return reportData.value as TopCliente[]
  }
  return []
})

/**
 * Devuelve reportData tipado como TopProducto[] si el reporte es 'topProductos',
 * de lo contrario, devuelve un array vacío.
 */
const topProductosData = computed<TopProducto[]>(() => {
  if (selectedReport.value === 'topProductos' && reportData.value) {
    return reportData.value as TopProducto[]
  }
  return []
})

/**
 * Devuelve reportData tipado como ProductoBajaRotacion[] si el reporte es 'productosBajaRotacion',
 * de lo contrario, devuelve un array vacío.
 */
const productosBajaRotacionData = computed<ProductoBajaRotacion[]>(() => {
  if (selectedReport.value === 'productosBajaRotacion' && reportData.value) {
    return reportData.value as ProductoBajaRotacion[]
  }
  return []
})

/**
 * Devuelve reportData tipado como ValorPedidosProveedoresResponse si el reporte es 'valorPedidosProveedores',
 * de lo contrario, devuelve un objeto por defecto.
 */
const valorPedidosProveedoresData = computed<ValorPedidosProveedoresResponse>(() => {
  if (selectedReport.value === 'valorPedidosProveedores' && reportData.value) {
    return reportData.value as ValorPedidosProveedoresResponse
  }
  return {
    total_gasto_proveedores: 0,
    periodo: { start_date: '', end_date: '' },
    detalles_por_proveedor: [],
  }
})

/**
 * Devuelve reportData tipado como TopClienteFrecuencia[] si el reporte es 'topClientesFrecuencia',
 * de lo contrario, devuelve un array vacío.
 */
const topClientesFrecuenciaData = computed<TopClienteFrecuencia[]>(() => {
  if (selectedReport.value === 'topClientesFrecuencia' && reportData.value) {
    return reportData.value as TopClienteFrecuencia[]
  }
  return []
})

// --- Funciones de Fetch de Datos ---

const fetchBajoStock = async () => {
  loading.value = true
  try {
    const response = await estadisticasService.getProductosBajoStock({ umbral: 5 })
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener productos bajo stock:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchVentasAgrupadas = async () => {
  loading.value = true
  try {
    const params: VentasPorPeriodoApiRequest = { periodo: ventasPeriodo.value }
    const response = await estadisticasService.getVentasPorPeriodo(params)

    reportData.value = response.data.map((item) => ({
      // Corrected: removed redundant .data
      ...item,
      beneficio: item.beneficio ?? 0, // Asegurar que beneficio no sea undefined
    }))
  } catch (error) {
    console.error('Error al obtener ventas agrupadas:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchVentasPorCategoria = async () => {
  loading.value = true
  try {
    const response = await estadisticasService.getVentasPorCategoria()
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener ventas por categoría:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchTicketPromedio = async () => {
  loading.value = true
  try {
    const response = await estadisticasService.getTicketPromedio()
    reportData.value = response
  } catch (error) {
    console.error('Error al obtener ticket promedio:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchHistorialGanancias = async () => {
  loading.value = true
  try {
    const params: VentasPorPeriodoApiRequest & { fecha_inicio?: string; fecha_fin?: string } = {
      periodo: ventasPeriodo.value,
    }
    if (fechaInicio.value) params.fecha_inicio = fechaInicio.value
    if (fechaFin.value) params.fecha_fin = fechaFin.value

    const response = await estadisticasService.getHistorialGanancias(params)
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener historial de ganancias:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchTopClientes = async () => {
  loading.value = true
  try {
    const response = await estadisticasService.getTopClientesPorMonto()
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener top clientes:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchTopProductos = async () => {
  loading.value = true
  try {
    const response = await estadisticasService.getTopProductosVendidos()
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener top productos vendidos:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchProductosBajaRotacion = async () => {
  loading.value = true
  try {
    const params: ProductosBajaRotacionRequest = { period_days: periodDays.value }
    const response = await estadisticasService.getProductosBajaRotacion(params)
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener productos de baja rotación:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchValorPedidosProveedores = async () => {
  loading.value = true
  try {
    if (!fechaInicio.value || !fechaFin.value) {
      alert('Por favor, seleccione las fechas de inicio y fin para este reporte.')
      return
    }
    const params: ValorPedidosProveedoresRequest = {
      start_date: fechaInicio.value,
      end_date: fechaFin.value,
    }
    const response = await estadisticasService.getValorPedidosProveedores(params)
    reportData.value = response
  } catch (error) {
    console.error('Error al obtener valor de pedidos a proveedores:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

const fetchTopClientesFrecuencia = async () => {
  loading.value = true
  try {
    const params: TopClientesFrecuenciaRequest = {
      period_days: frecuenciaPeriodDays.value,
      limit: frecuenciaLimit.value,
    }
    const response = await estadisticasService.getTopClientesFrecuencia(params)
    reportData.value = response.data
  } catch (error) {
    console.error('Error al obtener top clientes por frecuencia:', error)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

// --- Lógica para Generar Reporte ---
const generarReporte = async () => {
  reportData.value = null // Limpiar datos previos
  if (selectedReport.value === 'bajoStock') {
    await fetchBajoStock()
  } else if (selectedReport.value === 'ventasAgrupadas') {
    await fetchVentasAgrupadas()
  } else if (selectedReport.value === 'ventasPorCategoria') {
    await fetchVentasPorCategoria()
  } else if (selectedReport.value === 'ticketPromedio') {
    await fetchTicketPromedio()
  } else if (selectedReport.value === 'historialGanancias') {
    await fetchHistorialGanancias()
  } else if (selectedReport.value === 'topClientes') {
    await fetchTopClientes()
  } else if (selectedReport.value === 'topProductos') {
    await fetchTopProductos()
  } else if (selectedReport.value === 'productosBajaRotacion') {
    await fetchProductosBajaRotacion()
  } else if (selectedReport.value === 'valorPedidosProveedores') {
    await fetchValorPedidosProveedores()
  } else if (selectedReport.value === 'topClientesFrecuencia') {
    await fetchTopClientesFrecuencia()
  }
}

// --- Observadores ---
watch(selectedReport, () => {
  reportData.value = null
  ventasPeriodo.value = 'month' // Resetear período
  fechaInicio.value = '' // Resetear fecha de inicio
  fechaFin.value = '' // Resetear fecha de fin
  periodDays.value = 90 // Resetear días de período para baja rotación
  frecuenciaPeriodDays.value = 90 // Resetear días de período para top clientes por frecuencia
  frecuenciaLimit.value = 10 // Resetear límite para top clientes por frecuencia
  if (
    selectedReport.value === 'bajoStock' ||
    selectedReport.value === 'ticketPromedio' ||
    selectedReport.value === 'ventasPorCategoria' ||
    selectedReport.value === 'productosBajaRotacion' ||
    selectedReport.value === 'topClientes' ||
    selectedReport.value === 'topProductos' ||
    selectedReport.value === 'topClientesFrecuencia'
  ) {
    generarReporte()
  }
})

watch(ventasPeriodo, (newVal, oldVal) => {
  if (selectedReport.value === 'ventasAgrupadas' && newVal !== oldVal) {
    generarReporte()
  }
})

watch(periodDays, (newVal, oldVal) => {
  if (selectedReport.value === 'productosBajaRotacion' && newVal !== oldVal) {
    generarReporte()
  }
})

watch([fechaInicio, fechaFin], ([newFechaInicio, newFechaFin], [oldFechaInicio, oldFechaFin]) => {
  if (
    (selectedReport.value === 'historialGanancias' ||
      selectedReport.value === 'valorPedidosProveedores') &&
    (newFechaInicio !== oldFechaInicio || newFechaFin !== oldFechaFin) &&
    newFechaInicio &&
    newFechaFin
  ) {
    generarReporte()
  }
})

watch(
  [frecuenciaPeriodDays, frecuenciaLimit],
  ([newPeriodDays, newLimit], [oldPeriodDays, oldLimit]) => {
    if (
      selectedReport.value === 'topClientesFrecuencia' &&
      (newPeriodDays !== oldPeriodDays || newLimit !== oldLimit)
    ) {
      generarReporte()
    }
  },
)

// --- Datos Fijos de la Empresa ---
const DATOS_NEGOCIO = {
  nombre: import.meta.env.VITE_BUSINESS_NAME as string,
  propietario: import.meta.env.VITE_BUSINESS_OWNER as string,
  nit: import.meta.env.VITE_BUSINESS_NIT as string,
  direccion: import.meta.env.VITE_BUSINESS_ADDRESS as string,
  tel: import.meta.env.VITE_BUSINESS_TEL as string,
}

if (!DATOS_NEGOCIO.nombre || !DATOS_NEGOCIO.nit) {
  console.error(
    'Faltan variables de entorno del negocio. Asegúrate de definir VITE_BUSINESS_NAME y VITE_BUSINESS_NIT en tu archivo .env',
  )
}

const isExcelButtonDisabled = computed(() => {
  if (loading.value) return true
  if (selectedReport.value !== 'ventasAgrupadas') return true
  // If reportData.value is null/undefined, disable.
  if (!reportData.value) return true
  // If selectedReport is 'ventasAgrupadas', we expect reportData.value to be an array.
  // If it's not an array (e.g., TicketPromedioResponse), treat as disabled for Excel.
  if (!Array.isArray(reportData.value)) return true
  // Finally, if it's an empty array, disable.
  if (reportData.value.length === 0) return true
  return false
})

// --- Exportación a PDF (solo para Bajo Stock) ---
const exportarPDF = async () => {
  if (!reportData.value || (Array.isArray(reportData.value) && reportData.value.length === 0)) {
    alert('No hay datos para exportar a PDF.')
    return
  }

  loading.value = true
  try {
    if (selectedReport.value === 'bajoStock') {
      // Existing logic for bajoStock
      const doc = new jsPDF()
      let currentY = 10 // Posición Y inicial

      // 1. **Encabezado del Negocio (Mejora visual)**
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      // 2. **Título del Reporte (Inicia en una posición más baja)**
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte de Productos con Stock Bajo Umbral', 14, currentY)

      currentY += 4 // Espacio después del título

      const headers = [['ID', 'Nombre Producto', 'Stock Actual']]
      const data = (reportData.value as ProductoBajoStock[]).map((item) => [
        item.id,
        item.nombre,
        item.stock_actual,
      ])

      // 3. **Tabla (Ajustar startY a la nueva posición)**
      autoTable(doc, {
        startY: currentY + 4, // 4 unidades de espacio después del título
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_bajo_stock.pdf')
    } else if (selectedReport.value === 'ventasAgrupadas') {
      const params: VentasPorPeriodoApiRequest = { periodo: ventasPeriodo.value }
      const response = await estadisticasService.exportarVentasPdf(params)

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ventas_agrupadas_${ventasPeriodo.value}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      alert('Reporte PDF generado y descargado con éxito.')
    } else if (selectedReport.value === 'ventasPorCategoria') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte de Ventas por Categoría', 14, currentY)

      currentY += 4

      const headers = [['Categoría', 'Unidades Vendidas', 'Total Ventas']]
      const data = (reportData.value as VentasPorCategoriaEstadistica[]).map((item) => [
        item.categoria_nombre,
        item.total_unidades_vendidas,
        item.total_ventas_categoria.toFixed(2),
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_ventas_por_categoria.pdf')
    } else if (selectedReport.value === 'historialGanancias') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Historial de Ganancias', 14, currentY)

      currentY += 4

      const headers = [['Período', 'Beneficio Bruto']]
      const data = (reportData.value as HistorialGananciasEstadistica[]).map((item) => [
        item.periodo_fecha,
        item.beneficio_bruto.toFixed(2),
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_historial_ganancias.pdf')
    } else if (selectedReport.value === 'topClientes') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Top Clientes por Monto', 14, currentY)

      currentY += 4

      const headers = [['ID Cliente', 'Nombre Cliente', 'Monto Total Comprado']]
      const data = (reportData.value as TopCliente[]).map((item) => [
        item.cliente_id,
        item.nombre_cliente,
        item.monto_total.toFixed(2),
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_top_clientes.pdf')
    } else if (selectedReport.value === 'topProductos') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Top Productos Vendidos', 14, currentY)

      currentY += 4

      const headers = [['ID Producto', 'Nombre Producto', 'Unidades Vendidas']]
      const data = (reportData.value as TopProducto[]).map((item) => [
        item.producto_id,
        item.nombre_producto,
        item.unidades_vendidas,
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_top_productos_vendidos.pdf')
    } else if (selectedReport.value === 'productosBajaRotacion') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Productos de Baja Rotación', 14, currentY)

      currentY += 4

      const headers = [['ID', 'Nombre', 'Stock', 'Unidades Vendidas (Período)', 'Última Venta']]
      const data = (reportData.value as ProductoBajaRotacion[]).map((item) => [
        item.id,
        item.nombre,
        item.stock,
        item.unidades_vendidas_en_periodo,
        item.ultima_venta ?? 'N/A',
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_productos_baja_rotacion.pdf')
    } else if (selectedReport.value === 'valorPedidosProveedores') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Valor de Pedidos a Proveedores', 14, currentY)
      currentY += 7 // More space for total

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Total Gastado: ${valorPedidosProveedoresData.value.total_gasto_proveedores.toFixed(2)} COP`,
        14,
        currentY,
      )
      currentY += 5
      doc.text(
        `Período: ${valorPedidosProveedoresData.value.periodo.start_date} a ${valorPedidosProveedoresData.value.periodo.end_date}`,
        14,
        currentY,
      )
      currentY += 10

      if (valorPedidosProveedoresData.value.detalles_por_proveedor.length > 0) {
        const headers = [['Proveedor', 'Total Gastado']]
        const data = valorPedidosProveedoresData.value.detalles_por_proveedor.map((item) => [
          item.nombre_proveedor,
          item.total_gastado.toFixed(2),
        ])

        autoTable(doc, {
          startY: currentY + 4,
          head: headers,
          body: data,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
          },
          margin: { left: 14, right: 14 },
        })
      } else {
        doc.text(
          'No hay detalles de pedidos a proveedores para el período seleccionado.',
          14,
          currentY + 10,
        )
      }

      doc.save('reporte_valor_pedidos_proveedores.pdf')
    } else if (selectedReport.value === 'topClientesFrecuencia') {
      const doc = new jsPDF()
      let currentY = 10

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(DATOS_NEGOCIO.nombre, 14, currentY)
      currentY += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`NIT: ${DATOS_NEGOCIO.nit}`, 14, currentY)
      currentY += 4
      doc.text(`Tel: ${DATOS_NEGOCIO.tel} | Dir: ${DATOS_NEGOCIO.direccion}`, 14, currentY)

      currentY += 8
      doc.setLineWidth(0.5)
      doc.line(14, currentY, 196, currentY)

      currentY += 8

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Top Clientes por Frecuencia', 14, currentY)

      currentY += 4

      const headers = [
        ['ID Cliente', 'Nombre Cliente', 'Email Cliente', 'Número de Compras', 'Última Compra'],
      ]
      const data = (reportData.value as TopClienteFrecuencia[]).map((item) => [
        item.cliente_id,
        item.nombre_cliente,
        item.email_cliente ?? 'N/A',
        item.numero_compras_en_periodo,
        item.ultima_compra ?? 'N/A',
      ])

      autoTable(doc, {
        startY: currentY + 4,
        head: headers,
        body: data,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      })

      doc.save('reporte_top_clientes_frecuencia.pdf')
    }
  } catch (error) {
    console.error('Error al exportar a PDF:', error)
    alert('Hubo un error al generar el reporte PDF.')
  } finally {
    loading.value = false
  }
}
// --- Exportación a Excel (solo para Ventas Agrupadas) ---
const exportarExcel = async () => {
  if (
    selectedReport.value !== 'ventasAgrupadas' ||
    !reportData.value ||
    reportData.value === null
  ) {
    alert('No hay datos o el reporte seleccionado no es "Ventas Agrupadas" para exportar a Excel.')
    return
  }

  loading.value = true
  try {
    const params: VentasPorPeriodoApiRequest = { periodo: ventasPeriodo.value }

    const response = await estadisticasService.exportarVentasExcel(params)

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ventas_agrupadas_${ventasPeriodo.value}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    alert('Reporte Excel generado y descargado con éxito.')
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    alert('Hubo un error al generar el reporte Excel.')
  } finally {
    loading.value = false
  }
}

// Generar reporte inicial al cargar la vista
generarReporte()
</script>

<style scoped>
.reportes-admin-view {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
