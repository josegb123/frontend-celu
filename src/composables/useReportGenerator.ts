import { ref, computed, watch } from 'vue'
import { estadisticasService, type CuadreCajaResponse } from '@/services/estadisticasService' // Added CuadreCajaResponse import
import type {
  ProductoBajoStock,
  VentasPorPeriodoResponse,
  VentasPorPeriodoApiRequest,
  VentasPorCategoriaEstadistica,
  VentasPorCategoriaResponse,
  TicketPromedioResponse,
  HistorialGananciasEstadistica,
  HistorialGananciasRequest,
  TopCliente,
  TopProducto,
  ProductoBajaRotacion,
  ProductosBajaRotacionRequest,
  ValorPedidosProveedoresResponse,
  ValorPedidosProveedoresRequest,
  TopClienteFrecuencia,
  TopClientesFrecuenciaRequest,
} from '@/interfaces/reports/report_types'

type ReportType =
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
  | 'cuadreDeCaja' // Added new report type

export function useReportGenerator() {
  const selectedReport = ref<ReportType>('bajoStock')
  const ventasPeriodo = ref<'day' | 'month' | 'year'>('month')
  const fechaInicio = ref<string>('')
  const fechaFin = ref<string>('')
  const periodDays = ref<number>(90)
  const frecuenciaPeriodDays = ref<number>(90)
  const frecuenciaLimit = ref<number>(10)
  const cuadreCajaStartDate = ref<string>('') // Added for Cuadre de Caja
  const cuadreCajaEndDate = ref<string>('') // Added for Cuadre de Caja

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
    | TopClienteFrecuencia[]
    | CuadreCajaResponse // Added CuadreCajaResponse
    | null
  >(null)
  const loading = ref(false)
  const error = ref<any>(null)

  // --- Computed properties for type narrowing in the template ---
  const bajoStockData = computed<ProductoBajoStock[]>(() => {
    return selectedReport.value === 'bajoStock' && reportData.value
      ? (reportData.value as ProductoBajoStock[])
      : []
  })

  const ventasAgrupadasData = computed<VentasPorPeriodoResponse['data']>(() => {
    return selectedReport.value === 'ventasAgrupadas' && reportData.value
      ? (reportData.value as VentasPorPeriodoResponse['data'])
      : []
  })

  const ventasPorCategoriaData = computed<VentasPorCategoriaEstadistica[]>(() => {
    return selectedReport.value === 'ventasPorCategoria' && reportData.value
      ? (reportData.value as VentasPorCategoriaEstadistica[])
      : []
  })

  const ticketPromedioData = computed<TicketPromedioResponse>(() => {
    return selectedReport.value === 'ticketPromedio' && reportData.value
      ? (reportData.value as TicketPromedioResponse)
      : { monto_promedio_venta: 0, unidad: 'COP' }
  })

  const historialGananciasData = computed<HistorialGananciasEstadistica[]>(() => {
    return selectedReport.value === 'historialGanancias' && reportData.value
      ? (reportData.value as HistorialGananciasEstadistica[])
      : []
  })

  const topClientesData = computed<TopCliente[]>(() => {
    return selectedReport.value === 'topClientes' && reportData.value
      ? (reportData.value as TopCliente[])
      : []
  })

  const topProductosData = computed<TopProducto[]>(() => {
    return selectedReport.value === 'topProductos' && reportData.value
      ? (reportData.value as TopProducto[])
      : []
  })

  const productosBajaRotacionData = computed<ProductoBajaRotacion[]>(() => {
    return selectedReport.value === 'productosBajaRotacion' && reportData.value
      ? (reportData.value as ProductoBajaRotacion[])
      : []
  })

  const valorPedidosProveedoresData = computed<ValorPedidosProveedoresResponse>(() => {
    return selectedReport.value === 'valorPedidosProveedores' && reportData.value
      ? (reportData.value as ValorPedidosProveedoresResponse)
      : {
          total_gasto_proveedores: 0,
          periodo: { start_date: '', end_date: '' },
          detalles_por_proveedor: [],
        }
  })

  const topClientesFrecuenciaData = computed<TopClienteFrecuencia[]>(() => {
    return selectedReport.value === 'topClientesFrecuencia' && reportData.value
      ? (reportData.value as TopClienteFrecuencia[])
      : []
  })

  const cuadreCajaData = computed<CuadreCajaResponse | null>(() => {
    // Added cuadreCajaData
    return selectedReport.value === 'cuadreDeCaja' && reportData.value
      ? (reportData.value as CuadreCajaResponse)
      : null
  })

  // --- Fetch functions ---
  const fetchBajoStock = async () => {
    try {
      const response = await estadisticasService.getProductosBajoStock({ umbral: 5 })
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchVentasAgrupadas = async () => {
    try {
      const params: VentasPorPeriodoApiRequest = { periodo: ventasPeriodo.value }
      const response = await estadisticasService.getVentasPorPeriodo(params)
      reportData.value = response.data.map((item) => ({
        ...item,
        beneficio: item.beneficio ?? 0,
      }))
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchVentasPorCategoria = async () => {
    try {
      const response = await estadisticasService.getVentasPorCategoria()
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchTicketPromedio = async () => {
    try {
      const response = await estadisticasService.getTicketPromedio()
      reportData.value = response
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchHistorialGanancias = async () => {
    try {
      const params: HistorialGananciasRequest = {
        periodo: ventasPeriodo.value,
        fecha_inicio: fechaInicio.value || undefined,
        fecha_fin: fechaFin.value || undefined,
      }
      const response = await estadisticasService.getHistorialGanancias(params)
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchTopClientes = async () => {
    try {
      const response = await estadisticasService.getTopClientesPorMonto()
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchTopProductos = async () => {
    try {
      const response = await estadisticasService.getTopProductosVendidos()
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchProductosBajaRotacion = async () => {
    try {
      const params: ProductosBajaRotacionRequest = { period_days: periodDays.value }
      const response = await estadisticasService.getProductosBajaRotacion(params)
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchValorPedidosProveedores = async () => {
    if (!fechaInicio.value || !fechaFin.value) {
      alert('Por favor, seleccione las fechas de inicio y fin para este reporte.')
      reportData.value = null
      return
    }
    try {
      const params: ValorPedidosProveedoresRequest = {
        start_date: fechaInicio.value,
        end_date: fechaFin.value,
      }
      const response = await estadisticasService.getValorPedidosProveedores(params)
      reportData.value = response
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchTopClientesFrecuencia = async () => {
    try {
      const params: TopClientesFrecuenciaRequest = {
        period_days: frecuenciaPeriodDays.value,
        limit: frecuenciaLimit.value,
      }
      const response = await estadisticasService.getTopClientesFrecuencia(params)
      reportData.value = response.data
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const fetchCuadreCaja = async () => {
    // Added fetchCuadreCaja
    if (!cuadreCajaStartDate.value || !cuadreCajaEndDate.value) {
      alert('Por favor, seleccione las fechas de inicio y fin para el Cuadre de Caja.')
      reportData.value = null
      return
    }
    try {
      const response = await estadisticasService.getCuadreDeCaja(
        cuadreCajaStartDate.value,
        cuadreCajaEndDate.value,
      )
      reportData.value = response
    } catch (e) {
      error.value = e
      reportData.value = null
    }
  }

  const generateReport = async () => {
    loading.value = true
    error.value = null
    reportData.value = null // Clear previous data
    try {
      switch (selectedReport.value) {
        case 'bajoStock':
          await fetchBajoStock()
          break
        case 'ventasAgrupadas':
          await fetchVentasAgrupadas()
          break
        case 'ventasPorCategoria':
          await fetchVentasPorCategoria()
          break
        case 'ticketPromedio':
          await fetchTicketPromedio()
          break
        case 'historialGanancias':
          await fetchHistorialGanancias()
          break
        case 'topClientes':
          await fetchTopClientes()
          break
        case 'topProductos':
          await fetchTopProductos()
          break
        case 'productosBajaRotacion':
          await fetchProductosBajaRotacion()
          break
        case 'valorPedidosProveedores':
          await fetchValorPedidosProveedores()
          break
        case 'topClientesFrecuencia':
          await fetchTopClientesFrecuencia()
          break
        case 'cuadreDeCaja': // Added cuadreDeCaja
          await fetchCuadreCaja()
          break
        default:
          console.warn('Unknown report type selected:', selectedReport.value)
      }
    } finally {
      loading.value = false
    }
  }

  // --- Watchers ---
  watch(selectedReport, () => {
    reportData.value = null
    error.value = null
    // Reset report-specific parameters
    ventasPeriodo.value = 'month'
    fechaInicio.value = ''
    fechaFin.value = ''
    periodDays.value = 90
    frecuenciaPeriodDays.value = 90
    frecuenciaLimit.value = 10
    cuadreCajaStartDate.value = '' // Reset cuadreCajaStartDate
    cuadreCajaEndDate.value = '' // Reset cuadreCajaEndDate

    // Auto-generate reports that don't require additional parameters
    if (
      selectedReport.value === 'bajoStock' ||
      selectedReport.value === 'ticketPromedio' ||
      selectedReport.value === 'ventasPorCategoria' ||
      selectedReport.value === 'topClientes' ||
      selectedReport.value === 'topProductos'
    ) {
      generateReport()
    }
  })

  watch(ventasPeriodo, (newVal, oldVal) => {
    if (
      (selectedReport.value === 'ventasAgrupadas' ||
        selectedReport.value === 'historialGanancias') &&
      newVal !== oldVal
    ) {
      generateReport()
    }
  })

  watch(periodDays, (newVal, oldVal) => {
    if (selectedReport.value === 'productosBajaRotacion' && newVal !== oldVal) {
      generateReport()
    }
  })

  watch([fechaInicio, fechaFin], ([newFechaInicio, newFechaFin], [oldFechaInicio, oldFechaFin]) => {
    if (
      (selectedReport.value === 'historialGanancias' ||
        selectedReport.value === 'valorPedidosProveedores') &&
      (newFechaInicio !== oldFechaInicio || newFechaFin !== oldFechaFin) &&
      newFechaInicio &&
      newFechaFin // Only generate if both dates are selected
    ) {
      generateReport()
    }
  })

  watch(
    [frecuenciaPeriodDays, frecuenciaLimit],
    ([newPeriodDays, newLimit], [oldPeriodDays, oldLimit]) => {
      if (
        selectedReport.value === 'topClientesFrecuencia' &&
        (newPeriodDays !== oldPeriodDays || newLimit !== oldLimit)
      ) {
        generateReport()
      }
    },
  )

  watch(
    // Added watcher for cuadreCaja dates
    [cuadreCajaStartDate, cuadreCajaEndDate],
    ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
      if (
        selectedReport.value === 'cuadreDeCaja' &&
        (newStartDate !== oldStartDate || newEndDate !== oldEndDate) &&
        newStartDate &&
        newEndDate // Only generate if both dates are selected
      ) {
        generateReport()
      }
    },
  )

  return {
    selectedReport,
    ventasPeriodo,
    fechaInicio,
    fechaFin,
    periodDays,
    frecuenciaPeriodDays,
    frecuenciaLimit,
    cuadreCajaStartDate, // Added
    cuadreCajaEndDate, // Added
    reportData,
    loading,
    error,
    generateReport,
    bajoStockData,
    ventasAgrupadasData,
    ventasPorCategoriaData,
    ticketPromedioData,
    historialGananciasData,
    topClientesData,
    topProductosData,
    productosBajaRotacionData,
    valorPedidosProveedoresData,
    topClientesFrecuenciaData,
    cuadreCajaData, // Added
  }
}
