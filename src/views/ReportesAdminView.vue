<template>
  <div class="container-fluid py-4 px-lg-5">
    <header class="row mb-5 align-items-end">
      <div class="col">
        <h1 class="h2 mb-1 fw-bold tracking-tight">Panel de Control</h1>
        <p class="text-secondary mb-0">Gestión y métricas de {{ businessInfo.nombre }}</p>
      </div>
      <div class="col-auto">
        <div class="btn-group shadow-sm">
          <button
            class="btn btn-outline-primary border-2"
            @click="fetchAllReports"
            :disabled="anyLoading"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>Sincronizar
          </button>
          <button class="btn btn-primary px-4" @click="exportarReporteGeneral">
            <i class="bi bi-journal-check me-2"></i>Informe General PDF
          </button>
        </div>
      </div>
    </header>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div
            class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-start"
          >
            <div>
              <h5 class="fw-bold mb-1 text-primary">Ventas por Período</h5>
              <p class="small text-secondary">Métricas de rendimiento comercial</p>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" title="Excel" @click="exportarVentasExcel">
                <i class="bi bi-file-earmark-excel"></i>
              </button>
              <button
                class="btn btn-light border"
                title="PDF"
                @click="exportarGenericoPdf('ventas')"
              >
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </div>
          <div class="card-body px-4 pb-4">
            <div class="row g-2 mb-4">
              <div class="col">
                <input
                  type="date"
                  class="form-control form-control-sm bg-input"
                  v-model="startDate"
                />
              </div>
              <div class="col">
                <input
                  type="date"
                  class="form-control form-control-sm bg-input"
                  v-model="endDate"
                />
              </div>
              <div class="col-auto">
                <button
                  class="btn btn-sm btn-primary w-100"
                  @click="fetchVentasPorPeriodo"
                  :disabled="loadingVentas"
                >
                  {{ loadingVentas ? '...' : 'Filtrar' }}
                </button>
              </div>
            </div>
            <div
              v-if="ventasResult"
              class="stat-box p-3 rounded-3 border-start border-primary border-4"
            >
              <div class="d-flex justify-content-between mb-2">
                <span class="text-secondary small">Ventas Totales</span>
                <span class="fw-bold">{{ formatCurrency(ventasResult.totalVentas) }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-secondary small">Ticket Promedio</span>
                <span class="fw-bold text-primary">{{
                  formatCurrency(ventasResult.ticketPromedio)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div
            class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-start"
          >
            <div>
              <h5 class="fw-bold mb-1 text-warning">Baja Rotación</h5>
              <p class="small text-secondary">Productos con poco movimiento (90 días)</p>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" @click="exportarGenericoExcel('rotacion')">
                <i class="bi bi-file-earmark-excel"></i>
              </button>
              <button class="btn btn-light border" @click="exportarBajaRotacionPdf">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </div>
          <div class="card-body px-4 pb-4">
            <div
              v-if="productosBajaRotacion.length > 0"
              class="list-container overflow-auto"
              style="max-height: 150px"
            >
              <div
                v-for="p in productosBajaRotacion"
                :key="p.id"
                class="d-flex justify-content-between align-items-center py-2 border-bottom-dashed"
              >
                <span class="text-truncate" style="max-width: 70%">{{ p.nombre }}</span>
                <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill"
                  >{{ p.unidades_vendidas_en_periodo }} u.</span
                >
              </div>
            </div>
            <p v-else class="text-center text-muted py-4">Sin datos de rotación</p>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div
            class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-start"
          >
            <h6 class="fw-bold mb-0 text-info">Top Clientes</h6>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" @click="exportarGenericoExcel('clientes')">
                <i class="bi bi-file-earmark-excel"></i>
              </button>
              <button class="btn btn-light border" @click="exportarGenericoPdf('clientes')">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </div>
          <div class="card-body px-4">
            <div
              v-for="c in topClientes"
              :key="c.cliente_id"
              class="d-flex justify-content-between mb-3 align-items-center"
            >
              <div class="small fw-medium">{{ c.nombre_cliente }}</div>
              <div class="small text-info fw-bold">{{ formatCurrency(c.monto_total) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card text-decoration-none">
          <div
            class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-start"
          >
            <h6 class="fw-bold mb-0">Gastos Proveedores</h6>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" @click="exportarGenericoExcel('prov')">
                <i class="bi bi-file-earmark-excel"></i>
              </button>
              <button class="btn btn-light border" @click="exportarGenericoPdf('prov')">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </div>
          <div class="card-body px-4">
            <div
              v-for="prov in valorPedidosProveedores"
              :key="prov.proveedor_id"
              class="d-flex justify-content-between mb-3 align-items-center"
            >
              <div class="small fw-medium">{{ prov.nombre_proveedor }}</div>
              <div class="small fw-bold text-secondary">
                {{ formatCurrency(prov.total_gastado) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div
            class="card-header border-0 bg-transparent pt-4 px-4 d-flex justify-content-between align-items-start"
          >
            <h6 class="fw-bold mb-0 text-success">Rentabilidad Histórica</h6>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" @click="exportarGenericoExcel('ganancias')">
                <i class="bi bi-file-earmark-excel"></i>
              </button>
              <button class="btn btn-light border" @click="exportarGenericoPdf('ganancias')">
                <i class="bi bi-file-earmark-pdf"></i>
              </button>
            </div>
          </div>
          <div class="card-body px-4">
            <div
              v-for="h in historialGanancias"
              :key="h.periodo_fecha"
              class="d-flex justify-content-between mb-2 align-items-center"
            >
              <div class="small text-secondary text-uppercase ls-1" style="font-size: 0.7rem">
                {{ h.periodo_fecha }}
              </div>
              <div
                :class="['small fw-bold', h.beneficio_bruto >= 0 ? 'text-success' : 'text-danger']"
              >
                {{ formatCurrency(h.beneficio_bruto) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="card border-0 shadow-sm custom-card overflow-hidden">
          <div class="border-start border-danger border-4">
            <div
              class="card-header bg-transparent py-4 px-4 d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 class="fw-bold mb-0 text-danger">Cuadre de Caja y Conciliación</h5>
                <p class="small text-secondary mb-0">
                  Verificación de flujos de efectivo en el período
                </p>
              </div>
              <div class="btn-group shadow-sm">
                <button class="btn btn-white border" @click="exportarGenericoExcel('cuadre')">
                  <i class="bi bi-file-earmark-excel me-2"></i>Excel
                </button>
                <button
                  class="btn btn-outline-danger px-4"
                  @click="exportarCuadrePdf"
                  :disabled="!cuadreCajaResult"
                >
                  <i class="bi bi-file-earmark-pdf me-2"></i>PDF de Cuadre
                </button>
              </div>
            </div>
            <div class="card-body px-4 pb-4">
              <div class="row g-3 mb-4 align-items-end">
                <div class="col-md-3">
                  <label class="small text-secondary mb-1">Desde</label>
                  <input
                    type="date"
                    class="form-control bg-input border-0 shadow-sm"
                    v-model="cuadreCajaStartDate"
                  />
                </div>
                <div class="col-md-3">
                  <label class="small text-secondary mb-1">Hasta</label>
                  <input
                    type="date"
                    class="form-control bg-input border-0 shadow-sm"
                    v-model="cuadreCajaEndDate"
                  />
                </div>
                <div class="col-md-3">
                  <button
                    class="btn btn-dark w-100 shadow-sm"
                    @click="fetchCuadreCaja"
                    :disabled="loadingCuadreCaja"
                  >
                    <i class="bi bi-calculator me-2"></i>Calcular Informe
                  </button>
                </div>
              </div>

              <div v-if="cuadreCajaResult" class="row g-4 pt-3 border-top">
                <div class="col-md-6">
                  <h6 class="text-uppercase fw-bold text-secondary mb-3 small tracking-widest">
                    Flujo de Movimientos
                  </h6>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Ingresos</span
                    ><span class="text-success">{{
                      formatCurrency(
                        cuadreCajaResult.flujo_efectivo_movimientos.total_ingresos_efectivo,
                      )
                    }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Egresos</span
                    ><span class="text-danger">{{
                      formatCurrency(
                        cuadreCajaResult.flujo_efectivo_movimientos.total_egresos_efectivo,
                      )
                    }}</span>
                  </div>
                  <div class="d-flex justify-content-between pt-2 border-top">
                    <strong>Saldo Neto</strong
                    ><strong>{{
                      formatCurrency(
                        cuadreCajaResult.flujo_efectivo_movimientos.saldo_neto_movimientos,
                      )
                    }}</strong>
                  </div>
                </div>
                <div class="col-md-6 border-start-md">
                  <h6 class="text-uppercase fw-bold text-secondary mb-3 small tracking-widest">
                    Consolidado Cajas
                  </h6>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Balance Real</span
                    ><strong>{{
                      formatCurrency(
                        cuadreCajaResult.consolidado_cajas_diarias
                          .total_balance_final_real_cajas_cerradas_en_periodo,
                      )
                    }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Discrepancia</span>
                    <span
                      :class="[
                        'fw-bold',
                        cuadreCajaResult.consolidado_cajas_diarias
                          .discrepancia_total_cajas_cerradas_en_periodo === 0
                          ? 'text-success'
                          : 'text-danger',
                      ]"
                    >
                      {{
                        formatCurrency(
                          cuadreCajaResult.consolidado_cajas_diarias
                            .discrepancia_total_cajas_cerradas_en_periodo,
                        )
                      }}
                    </span>
                  </div>
                  <div class="alert bg-secondary-subtle border-0 py-2 mt-3 small">
                    {{ cuadreCajaResult.descripcion_cuadre }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { AxiosError } from 'axios' // Importación correcta de AxiosError
import { estadisticasService, type CuadreCajaResponse } from '@/services/estadisticasService'
import { useAppConfigStore } from '@/store/useAppConfigStore'

// --- INTERFACES ---
interface ProductoRotacion {
  id: number
  nombre: string
  unidades_vendidas_en_periodo: number
}
interface ClienteGasto {
  cliente_id: number
  nombre_cliente: string
  monto_total: number
}
interface ProveedorPedido {
  proveedor_id: number
  nombre_proveedor: string
  total_gastado: number
}
interface GananciaHist {
  periodo_fecha: string
  beneficio_bruto: number
}

const appConfig = useAppConfigStore()

// --- ESTADOS ---
const startDate = ref<string | undefined>('')
const endDate = ref<string | undefined>('')
const cuadreCajaStartDate = ref<string | undefined>('')
const cuadreCajaEndDate = ref<string | undefined>('')

const ventasResult = ref<{ totalVentas: number; ticketPromedio: number } | null>(null)
const productosBajaRotacion = ref<ProductoRotacion[]>([])
const topClientes = ref<ClienteGasto[]>([])
const valorPedidosProveedores = ref<ProveedorPedido[]>([])
const historialGanancias = ref<GananciaHist[]>([])
const cuadreCajaResult = ref<CuadreCajaResponse | null>(null)

const loadingVentas = ref(false)
const loadingCuadreCaja = ref(false)
const anyLoading = computed(() => loadingVentas.value || loadingCuadreCaja.value)

const businessInfo = computed(() => ({
  nombre: appConfig.getBusinessName || '',
  nit: appConfig.getBusinessNit || '',
}))

// --- MÉTODOS DE DATOS CON MANEJO DE ERRORES TIPADO ---
async function fetchVentasPorPeriodo() {
  loadingVentas.value = true
  try {
    const data = await estadisticasService.getVentasPorPeriodo({
      start_date: startDate.value,
      end_date: endDate.value,
      periodo: 'month',
    })
    const total = data.data.reduce((sum, item) => sum + item.ventas_totales, 0)
    ventasResult.value = {
      totalVentas: total,
      ticketPromedio: data.lista_ventas?.length ? total / data.lista_ventas.length : 0,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Error cargando ventas:', axiosError.message)
  } finally {
    loadingVentas.value = false
  }
}

async function fetchAllReports() {
  try {
    const [baja, top, prov, ganancia] = await Promise.all([
      estadisticasService.getProductosBajaRotacion({ period_days: 90 }),
      estadisticasService.getTopClientesPorMonto(),
      estadisticasService.getValorPedidosProveedores({
        start_date: startDate.value,
        end_date: endDate.value,
      }),
      estadisticasService.getHistorialGanancias({ periodo: 'month' }),
    ])
    productosBajaRotacion.value = baja.data
    topClientes.value = top.data
    valorPedidosProveedores.value = prov.detalles_por_proveedor
    historialGanancias.value = ganancia.data
    await fetchVentasPorPeriodo()
    await fetchCuadreCaja()
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Error en carga masiva:', axiosError.message)
  }
}

async function fetchCuadreCaja() {
  if (!cuadreCajaStartDate.value || !cuadreCajaEndDate.value) return
  loadingCuadreCaja.value = true
  try {
    cuadreCajaResult.value = await estadisticasService.getCuadreDeCaja(
      cuadreCajaStartDate.value,
      cuadreCajaEndDate.value,
    )
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Error en cuadre:', axiosError.response?.data || axiosError.message)
  } finally {
    loadingCuadreCaja.value = false
  }
}

// --- EXPORTACIÓN ---
function download(data: any, name: string, mime: string) {
  const blob = new Blob([data], { type: mime })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.URL.revokeObjectURL(url)
}

async function exportarVentasExcel() {
  try {
    const res = await estadisticasService.exportarVentasExcel({
      start_date: startDate.value,
      end_date: endDate.value,
    })
    download(res.data, 'ventas.xlsx', 'application/vnd.ms-excel')
  } catch (error) {
    console.error(error as AxiosError)
  }
}

async function exportarBajaRotacionPdf() {
  try {
    const res = await estadisticasService.exportarVentasPdf()
    download(res.data, 'baja_rotacion.pdf', 'application/pdf')
  } catch (error) {
    console.error(error as AxiosError)
  }
}

// Stubs para nuevos botones de exportación requeridos
const exportarGenericoPdf = (tipo: string) => console.log('Exportando PDF:', tipo)
const exportarGenericoExcel = (tipo: string) => console.log('Exportando Excel:', tipo)
const exportarCuadrePdf = () => console.log('Cuadre PDF')
const exportarReporteGeneral = () => console.log('Informe Consolidado PDF')

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v)

onMounted(() => {
  const now = new Date().toISOString().split('T')[0]
  startDate.value = now
  endDate.value = now
  cuadreCajaStartDate.value = now
  cuadreCajaEndDate.value = now
  fetchAllReports()
})
</script>

<style scoped>
/* Colores de fondo adaptativos mediante variables de Bootstrap 5 */
.custom-card {
  background-color: var(--bs-secondary-bg);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid var(--bs-border-color-translucent) !important;
}

.custom-card:hover {
  transform: translateY(-2px);
}

.bg-input {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color);
}

.stat-box {
  background-color: var(--bs-body-bg);
}

.border-bottom-dashed {
  border-bottom: 1px dashed var(--bs-border-color);
}

.tracking-tight {
  letter-spacing: -0.025em;
}
.tracking-widest {
  letter-spacing: 0.1em;
}

/* Scrollbar minimalista */
.list-container::-webkit-scrollbar {
  width: 4px;
}
.list-container::-webkit-scrollbar-thumb {
  background: var(--bs-border-color);
  border-radius: 10px;
}

@media (min-width: 768px) {
  .border-start-md {
    border-left: 1px solid var(--bs-border-color) !important;
  }
}
</style>
