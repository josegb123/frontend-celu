<template>
  <div class="reportes-admin-view container py-4">
    <h1 class="text-2xl font-bold mb-4">
      <i class="bi bi-bar-chart-fill me-2"></i> Generador de Reportes y Estadísticas
    </h1>

    <ReportFilters
      v-model:selectedReport="selectedReport"
      v-model:ventasPeriodo="ventasPeriodo"
      v-model:fechaInicio="fechaInicio"
      v-model:fechaFin="fechaFin"
      v-model:periodDays="periodDays"
      v-model:frecuenciaPeriodDays="frecuenciaPeriodDays"
      v-model:frecuenciaLimit="frecuenciaLimit"
      :loading="loading"
      @generateReport="generateReport"
    />

    <div class="d-flex justify-content-end align-items-center mb-4">
      <div class="d-flex gap-2">
        <button
          type="button"
          @click="exportToPdf"
          :disabled="isPdfButtonDisabled"
          class="btn btn-danger"
        >
          <i class="bi bi-file-pdf me-1"></i> Generar PDF
        </button>
        <button
          type="button"
          @click="exportToExcel"
          :disabled="isExcelButtonDisabled"
          class="btn btn-success"
        >
          <i class="bi bi-file-earmark-spreadsheet me-1"></i> Generar Excel
        </button>
      </div>
    </div>

    <ReportDisplayContainer
      :selectedReport="selectedReport"
      :reportData="reportData"
      :loading="loading"
    />

    <div v-if="error" class="alert alert-danger text-center mt-4">
      <i class="bi bi-exclamation-triangle-fill me-1"></i> Error al cargar el reporte:
      {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReportGenerator } from '@/composables/useReportGenerator'
import { useReportExporter } from '@/composables/useReportExporter'
import ReportFilters from '@/components/Reportes/ReportFilters.vue'
import ReportDisplayContainer from '@/components/Reportes/ReportDisplayContainer.vue'

const {
  selectedReport,
  ventasPeriodo,
  fechaInicio,
  fechaFin,
  periodDays,
  frecuenciaPeriodDays,
  frecuenciaLimit,
  reportData,
  loading,
  error,
  generateReport,
} = useReportGenerator()

// Initial report generation
generateReport()

// --- Business Data for PDF ---
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

// --- Exportation Logic (will be moved to useReportExporter) ---
const { exportToPdf, exportToExcel, isPdfButtonDisabled, isExcelButtonDisabled } =
  useReportExporter(
    selectedReport,
    reportData,
    loading,
    ventasPeriodo,
    fechaInicio,
    fechaFin,
    DATOS_NEGOCIO,
  )
</script>

<style scoped>
.reportes-admin-view {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
