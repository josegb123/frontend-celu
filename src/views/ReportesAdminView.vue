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
            <p class="card-text">
              Visualice las ventas totales y el ticket promedio por rango de fechas.
            </p>
            <div class="d-flex mb-3">
              <input type="date" class="form-control me-2" v-model="startDate" />
              <input type="date" class="form-control me-2" v-model="endDate" />
              <button
                class="btn btn-primary"
                @click="fetchVentasPorPeriodo"
                :disabled="loadingVentas"
              >
                <i class="bi bi-graph-up me-2"></i>
                {{ loadingVentas ? 'Cargando...' : 'Consultar' }}
              </button>
            </div>
            <div v-if="ventasResult" class="mt-3">
              <p><strong>Total Ventas:</strong> {{ formatCurrency(ventasResult.totalVentas) }}</p>
              <p>
                <strong>Ticket Promedio:</strong> {{ formatCurrency(ventasResult.ticketPromedio) }}
              </p>
            </div>
            <button
              class="btn btn-outline-success mt-3"
              @click="exportarVentasExcel"
              :disabled="!ventasResult"
            >
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
            <p class="card-text">
              Identifique productos con pocas ventas en un período.
              <small class="text-muted">(Últimos 90 días)</small>
            </p>
            <button
              class="btn btn-warning text-dark"
              @click="fetchProductosBajaRotacion"
              :disabled="loadingBajaRotacion"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              {{ loadingBajaRotacion ? 'Actualizando...' : 'Actualizar' }}
            </button>
            <div v-if="productosBajaRotacion.length > 0" class="mt-3">
              <ul class="list-group">
                <li
                  v-for="producto in productosBajaRotacion"
                  :key="producto.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ producto.nombre }}
                  <span class="badge bg-danger rounded-pill"
                    >{{ producto.unidades_vendidas_en_periodo }} ventas</span
                  >
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingBajaRotacion" class="text-muted mt-3">
              No hay productos con baja rotación.
            </p>
            <button
              class="btn btn-outline-danger mt-3"
              @click="exportarBajaRotacionPdf"
              :disabled="productosBajaRotacion.length === 0"
            >
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
            <p class="card-text">
              Visualice los clientes que más han comprado en un período.
              <small class="text-muted">(Últimos 30 días)</small>
            </p>
            <button class="btn btn-info" @click="fetchTopClientes" :disabled="loadingTopClientes">
              <i class="bi bi-person-heart me-2"></i>
              {{ loadingTopClientes ? 'Actualizando...' : 'Actualizar' }}
            </button>
            <div v-if="topClientes.length > 0" class="mt-3">
              <ul class="list-group">
                <li
                  v-for="cliente in topClientes"
                  :key="cliente.cliente_id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ cliente.nombre_cliente }}
                  <span class="badge bg-primary rounded-pill">{{
                    formatCurrency(cliente.monto_total)
                  }}</span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingTopClientes" class="text-muted mt-3">
              No hay datos de top clientes.
            </p>
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
            <p class="card-text">
              Resumen del valor total de los pedidos realizados a cada proveedor.
              <small class="text-muted">(Últimos 90 días)</small>
            </p>
            <button
              class="btn btn-secondary"
              @click="fetchValorPedidosProveedores"
              :disabled="loadingValorPedidosProveedores"
            >
              <i class="bi bi-truck me-2"></i>
              {{ loadingValorPedidosProveedores ? 'Actualizando...' : 'Actualizar' }}
            </button>
            <div v-if="valorPedidosProveedores.length > 0" class="mt-3">
              <ul class="list-group">
                <li
                  v-for="prov in valorPedidosProveedores"
                  :key="prov.proveedor_id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ prov.nombre_proveedor }}
                  <span class="badge bg-dark rounded-pill">{{
                    formatCurrency(prov.total_gastado)
                  }}</span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingValorPedidosProveedores" class="text-muted mt-3">
              No hay datos de pedidos a proveedores.
            </p>
          </div>
        </div>
      </div>

      <!-- Reporte de Movimientos Financieros -->
      <div class="col-lg-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">Historial de Ganancias (Beneficio Bruto)</h5>
          </div>
          <div class="card-body">
            <p class="card-text">
              Beneficio bruto histórico por período.
              <small class="text-muted">(Últimos 30 días)</small>
            </p>
            <button
              class="btn btn-dark"
              @click="fetchHistorialGanancias"
              :disabled="loadingHistorialGanancias"
            >
              <i class="bi bi-cash-coin me-2"></i>
              {{ loadingHistorialGanancias ? 'Actualizando...' : 'Actualizar' }}
            </button>

            <div v-if="historialGanancias && historialGanancias.length > 0" class="mt-3">
              <ul class="list-group">
                <li
                  v-for="item in historialGanancias"
                  :key="item.periodo_fecha"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  {{ item.periodo_fecha }}
                  <span :class="['badge', item.beneficio_bruto >= 0 ? 'bg-success' : 'bg-danger']">
                    {{ item.beneficio_bruto }}
                  </span>
                </li>
              </ul>
            </div>
            <p v-else-if="!loadingHistorialGanancias" class="text-muted mt-3">
              No hay datos de ganancias recientes.
            </p>
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

      <!-- Nuevo Reporte de Cuadre de Caja -->
      <div class="col-lg-12 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0">Cuadre de Caja y Conciliación de Efectivo</h5>
          </div>
          <div class="card-body">
            <p class="card-text">
              Verifica el flujo de efectivo registrado en movimientos financieros contra los totales
              de las cajas diarias.
            </p>
            <div class="d-flex mb-3">
              <input type="date" class="form-control me-2" v-model="cuadreCajaStartDate" />
              <input type="date" class="form-control me-2" v-model="cuadreCajaEndDate" />
              <button
                class="btn btn-danger"
                @click="fetchCuadreCaja"
                :disabled="loadingCuadreCaja || !cuadreCajaStartDate || !cuadreCajaEndDate"
              >
                <i class="bi bi-calculator me-2"></i>
                {{ loadingCuadreCaja ? 'Calculando...' : 'Calcular Cuadre' }}
              </button>
            </div>
            <div v-if="cuadreCajaResult" class="mt-3">
              <h6>Resumen de Movimientos Financieros (Efectivo)</h6>
              <p class="mb-1">
                <strong>Ingresos Totales:</strong>
                <span class="text-success">{{
                  formatCurrency(
                    cuadreCajaResult.flujo_efectivo_movimientos.total_ingresos_efectivo,
                  )
                }}</span>
              </p>
              <p class="mb-1">
                <strong>Egresos Totales:</strong>
                <span class="text-danger">{{
                  formatCurrency(cuadreCajaResult.flujo_efectivo_movimientos.total_egresos_efectivo)
                }}</span>
              </p>
              <p class="mb-1">
                <strong>Saldo Neto por Movimientos:</strong>
                <span
                  :class="
                    cuadreCajaResult.flujo_efectivo_movimientos.saldo_neto_movimientos >= 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{
                    formatCurrency(
                      cuadreCajaResult.flujo_efectivo_movimientos.saldo_neto_movimientos,
                    )
                  }}
                </span>
              </p>
              <hr />
              <h6>Consolidado de Cajas Diarias Cerradas en el Período</h6>
              <p class="mb-1">
                <strong>Monto Inicial Total (Cajas Abiertas):</strong>
                {{
                  formatCurrency(
                    cuadreCajaResult.consolidado_cajas_diarias
                      .total_monto_inicial_cajas_abiertas_en_periodo,
                  )
                }}
              </p>
              <p class="mb-1">
                <strong>Balance Final Real Total:</strong>
                {{
                  formatCurrency(
                    cuadreCajaResult.consolidado_cajas_diarias
                      .total_balance_final_real_cajas_cerradas_en_periodo,
                  )
                }}
              </p>
              <p class="mb-1">
                <strong>Balance Final Esperado Total:</strong>
                {{
                  formatCurrency(
                    cuadreCajaResult.consolidado_cajas_diarias
                      .total_balance_final_esperado_cajas_cerradas_en_periodo,
                  )
                }}
              </p>
              <p class="mb-1">
                <strong>Discrepancia Agregada (Real - Esperado):</strong>
                <span
                  :class="
                    cuadreCajaResult.consolidado_cajas_diarias
                      .discrepancia_total_cajas_cerradas_en_periodo === 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{
                    formatCurrency(
                      cuadreCajaResult.consolidado_cajas_diarias
                        .discrepancia_total_cajas_cerradas_en_periodo,
                    )
                  }}
                </span>
              </p>
              <hr />
              <p class="small text-muted">{{ cuadreCajaResult.descripcion_cuadre }}</p>
            </div>
            <div
              v-else-if="!loadingCuadreCaja && cuadreCajaStartDate && cuadreCajaEndDate"
              class="alert alert-info mt-3"
            >
              Seleccione un rango de fechas y haga clic en "Calcular Cuadre" para generar el
              reporte.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { estadisticasService, type CuadreCajaResponse } from '@/services/estadisticasService'
import { useAppConfigStore } from '@/store/useAppConfigStore'

// --- Stores ---
const appConfig = useAppConfigStore()

// --- Fechas para filtros ---
const startDate = ref<string>()
const endDate = ref<string>()
const cuadreCajaStartDate = ref<string>()
const cuadreCajaEndDate = ref<string>()

// --- Datos de Reportes ---
const ventasResult = ref<{ totalVentas: number; ticketPromedio: number } | null>(null)
const productosBajaRotacion = ref<any[]>([])
const topClientes = ref<any[]>([])
const valorPedidosProveedores = ref<any[]>([])
const historialGanancias = ref<any[] | null>(null) // Changed to array for better mapping
const cuadreCajaResult = ref<CuadreCajaResponse | null>(null) // For Cuadre de Caja report

// --- Estados de Carga ---
const loadingVentas = ref(false)
const loadingBajaRotacion = ref(false)
const loadingTopClientes = ref(false)
const loadingValorPedidosProveedores = ref(false)
const loadingHistorialGanancias = ref(false)
const loadingCuadreCaja = ref(false) // For Cuadre de Caja report

// --- Información del Negocio para Reportes ---
const businessInfo = ref({
  nombre: appConfig.getBusinessName,
  propietario: appConfig.getBusinessAdministrator,
  nit: appConfig.getBusinessNit,
  direccion: appConfig.getBusinessAddress,
  tel: appConfig.getBusinessPhone,
})

// --- Métodos para Consultar Reportes ---
async function fetchVentasPorPeriodo() {
  loadingVentas.value = true
  try {
    const data = await estadisticasService.getVentasPorPeriodo({
      start_date: startDate.value, // Pass dates for filtering
      end_date: endDate.value,
      periodo: 'month', // Default period, can be dynamic
    })

    const totalVentas = data.data.reduce((sum, item) => sum + item.ventas_totales, 0)
    const ticketPromedio =
      data.lista_ventas && data.lista_ventas.length > 0 ? totalVentas / data.lista_ventas.length : 0

    ventasResult.value = {
      totalVentas: totalVentas,
      ticketPromedio: ticketPromedio,
    }
  } catch (error: any) {
    console.error(
      'Error al obtener ventas por período:',
      error.response?.data?.message || error.message || error,
    )
    ventasResult.value = null
  } finally {
    loadingVentas.value = false
  }
}

async function fetchProductosBajaRotacion() {
  loadingBajaRotacion.value = true
  try {
    const data = await estadisticasService.getProductosBajaRotacion({
      period_days: 90, // Default to 90 days as per backend
    })
    productosBajaRotacion.value = data.data
  } catch (error: any) {
    console.error(
      'Error al obtener productos de baja rotación:',
      error.response?.data?.message || error.message || error,
    )
    productosBajaRotacion.value = []
  } finally {
    loadingBajaRotacion.value = false
  }
}

async function fetchTopClientes() {
  loadingTopClientes.value = true
  try {
    const data = await estadisticasService.getTopClientesPorMonto()
    topClientes.value = data.data.map((c) => ({
      cliente_id: c.cliente_id,
      nombre_cliente: c.nombre_cliente,
      monto_total: c.monto_total,
    }))
  } catch (error: any) {
    console.error(
      'Error al obtener top clientes:',
      error.response?.data?.message || error.message || error,
    )
    topClientes.value = []
  } finally {
    loadingTopClientes.value = false
  }
}

async function fetchValorPedidosProveedores() {
  loadingValorPedidosProveedores.value = true
  try {
    const today = new Date()
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)

    const startDateFormatted = ninetyDaysAgo.toISOString().split('T')[0]
    const endDateFormatted = today.toISOString().split('T')[0]

    const data = await estadisticasService.getValorPedidosProveedores({
      start_date: startDateFormatted,
      end_date: endDateFormatted,
    })
    valorPedidosProveedores.value = data.detalles_por_proveedor
  } catch (error: any) {
    console.error(
      'Error al obtener valor de pedidos a proveedores:',
      error.response?.data?.message || error.message || error,
    )
    valorPedidosProveedores.value = []
  } finally {
    loadingValorPedidosProveedores.value = false
  }
}

async function fetchHistorialGanancias() {
  loadingHistorialGanancias.value = true
  try {
    const data = await estadisticasService.getHistorialGanancias({
      fecha_inicio: startDate.value, // Reusar las fechas del primer reporte o poner un default
      fecha_fin: endDate.value,
      periodo: 'month', // Default period, can be dynamic
    })
    historialGanancias.value = data.data // La API devuelve un array de objetos con beneficio_bruto y periodo_fecha
  } catch (error: any) {
    console.error(
      'Error al obtener historial de ganancias:',
      error.response?.data?.message || error.message || error,
    )
    historialGanancias.value = null
  } finally {
    loadingHistorialGanancias.value = false
  }
}

// --- Nuevo método para Cuadre de Caja ---
async function fetchCuadreCaja() {
  if (!cuadreCajaStartDate.value || !cuadreCajaEndDate.value) {
    alert('Por favor, seleccione un rango de fechas para el Cuadre de Caja.')
    return
  }
  loadingCuadreCaja.value = true
  cuadreCajaResult.value = null // Clear previous results
  try {
    const data = await estadisticasService.getCuadreDeCaja(
      cuadreCajaStartDate.value,
      cuadreCajaEndDate.value,
    )
    cuadreCajaResult.value = data
  } catch (error: any) {
    console.error(
      'Error al obtener el Cuadre de Caja:',
      error.response?.data?.message || error.message || error,
    )
    cuadreCajaResult.value = null
    alert('Error al generar el reporte de Cuadre de Caja.')
  } finally {
    loadingCuadreCaja.value = false
  }
}

// --- Métodos de Exportación ---
async function exportarVentasExcel() {
  try {
    const response = await estadisticasService.exportarVentasExcel({
      periodo: 'month', // O según el filtro seleccionado
      start_date: startDate.value,
      end_date: endDate.value,
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_ventas_${startDate.value}_${endDate.value}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
    alert('Reporte de ventas exportado a Excel.')
  } catch (error: any) {
    console.error(
      'Error al exportar ventas a Excel:',
      error.response?.data?.message || error.message || error,
    )
    alert('Error al exportar reporte.')
  }
}

async function exportarBajaRotacionPdf() {
  try {
    // Asumir que se exporta el reporte actual sin filtros adicionales si el backend lo permite
    // En una implementación real, se enviarían los filtros de baja rotación
    const response = await estadisticasService.exportarVentasPdf() // Usando exportarVentasPdf como proxy, idealmente sería un endpoint específico
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_baja_rotacion.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
    alert('Reporte de baja rotación exportado a PDF.')
  } catch (error: any) {
    console.error(
      'Error al exportar baja rotación a PDF:',
      error.response?.data?.message || error.message || error,
    )
    alert('Error al exportar reporte.')
  }
}

// --- Utilidades ---
const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return '$0.00' // Manejar valores no numéricos
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
}

// --- Ciclo de Vida ---
onMounted(() => {
  // Establecer fechas por defecto para el reporte de ventas (últimos 30 días)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0]

  startDate.value = formatToYYYYMMDD(thirtyDaysAgo)
  endDate.value = formatToYYYYMMDD(today)
  cuadreCajaStartDate.value = formatToYYYYMMDD(thirtyDaysAgo) // Set default for cuadre de caja
  cuadreCajaEndDate.value = formatToYYYYMMDD(today) // Set default for cuadre de caja

  // Cargar algunos reportes al iniciar
  fetchVentasPorPeriodo()
  fetchProductosBajaRotacion()
  fetchTopClientes()
  fetchValorPedidosProveedores()
  fetchHistorialGanancias()
  fetchCuadreCaja() // Fetch initial Cuadre de Caja
})
</script>

<style scoped>
.card-header.bg-warning {
  color: #212529 !important; /* Para que el texto se vea bien en fondo warning */
}
</style>
