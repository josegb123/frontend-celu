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
            </select>
          </div>

          <div v-if="selectedReport === 'ventasAgrupadas'" class="mb-3">
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
                  reportData.length === 0 ||
                  loading ||
                  selectedReport !== 'bajoStock'
                "
                class="btn btn-danger"
              >
                <i class="bi bi-file-pdf me-1"></i> Generar PDF
              </button>
              <button
                type="button"
                @click="exportarExcel"
                :disabled="
                  !reportData ||
                  reportData.length === 0 ||
                  loading ||
                  selectedReport !== 'ventasAgrupadas'
                "
                class="btn btn-success"
              >
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Generar Excel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="reportData && reportData.length > 0" class="card shadow-sm">
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
      </div>
    </div>

    <div v-else-if="!loading && !reportData" class="alert alert-info text-center mt-4">
      <i class="bi bi-info-circle me-1"></i> Seleccione un reporte y genere para ver los resultados.
    </div>
    <div
      v-else-if="!loading && reportData && reportData.length === 0"
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
  VentasPorPeriodoData,
  VentasPorPeriodoApiRequest,
} from '@/interfaces/estadisticas'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

// --- Estado Reactivo ---
const selectedReport = ref<'bajoStock' | 'ventasAgrupadas'>('bajoStock')
const ventasPeriodo = ref<'day' | 'month' | 'year'>('month')
const reportData = ref<ProductoBajoStock[] | VentasPorPeriodoData[] | null>(null)
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
 * Devuelve reportData tipado como VentasPorPeriodoData[] si el reporte es 'ventasAgrupadas',
 * de lo contrario, devuelve un array vacío.
 */
const ventasAgrupadasData = computed<VentasPorPeriodoData[]>(() => {
  if (selectedReport.value === 'ventasAgrupadas' && reportData.value) {
    // La aserción de tipo es segura debido a la comprobación de selectedReport.value
    return reportData.value as VentasPorPeriodoData[]
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

// --- Lógica para Generar Reporte ---
const generarReporte = async () => {
  reportData.value = null // Limpiar datos previos
  if (selectedReport.value === 'bajoStock') {
    await fetchBajoStock()
  } else if (selectedReport.value === 'ventasAgrupadas') {
    await fetchVentasAgrupadas()
  }
}

// --- Observadores ---
watch(selectedReport, () => {
  reportData.value = null
  if (selectedReport.value === 'bajoStock') {
    generarReporte()
  }
})

watch(ventasPeriodo, (newVal, oldVal) => {
  if (selectedReport.value === 'ventasAgrupadas' && newVal !== oldVal) {
    generarReporte()
  }
})

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

// --- Exportación a PDF (solo para Bajo Stock) ---
const exportarPDF = () => {
  if (selectedReport.value !== 'bajoStock' || !reportData.value || reportData.value.length === 0) {
    alert('No hay datos o el reporte seleccionado no es "Bajo Stock" para exportar a PDF.')
    return
  }

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
}
// --- Exportación a Excel (solo para Ventas Agrupadas) ---
const exportarExcel = async () => {
  if (
    selectedReport.value !== 'ventasAgrupadas' ||
    !reportData.value ||
    reportData.value.length === 0
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
