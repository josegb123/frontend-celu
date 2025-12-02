<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1. IMPORTAR INTERFACES DEL SERVICIO para tipar 'dashboardData'
import {
  estadisticasService,
  type LowStockProduct,
  type TopMetric,
  type VentaMinimal,
  type TimeSeriesData,
} from '@/services/estadisticasService'

// Importar componentes hijos (los errores 7016 indican que TS no los encuentra; si esto persiste, verifica tu archivo 'shims-vue.d.ts' o 'tsconfig.app.json')
import StatCard from '@/components/home/StatCard.vue'
import TopRankingCard from '@/components/home/TopRankingCard.vue'
import LastSalesTable from '@/components/home/LastSalesTable.vue'

interface DashboardData {
  ticketPromedio: number
  margenBrutoMes: number
  productosBajoStock: LowStockProduct[] // Tipado explícito
  topClientes: TopMetric[] // Tipado explícito
  ultimasVentas: VentaMinimal[] // Tipado explícito
}

// 2. TIPAR EL REF dashboardData con la nueva interfaz
const loading = ref(true)
const dashboardData = ref<DashboardData>({
  ticketPromedio: 0,
  margenBrutoMes: 0,
  productosBajoStock: [],
  topClientes: [],
  ultimasVentas: [],
})

// Simulación de carga de datos
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 1. Métricas clave
    const [ticket, margenResult] = await Promise.all([
      estadisticasService.getTicketPromedio(),
      // 3. CORRECCIÓN: El método se llama getHistorialGanancias, no getMargenBruto (Error 2339)
      estadisticasService.getHistorialGanancias({ periodo: 'month' }),
    ])

    dashboardData.value.ticketPromedio = ticket.monto_promedio_venta

    // Obtener el beneficio de la primera entrada (asumiendo que es el mes actual)
    const margenData: TimeSeriesData[] = margenResult.data
    dashboardData.value.margenBrutoMes =
      margenData.length > 0 ? (margenData[0].beneficio_bruto ?? 0) : 0

    // 2. Tablas/Listados
    const [stock, clientes, ventas] = await Promise.all([
      estadisticasService.getProductosBajoStock(),
      estadisticasService.getTopClientes(),
      estadisticasService.getUltimasVentas(),
    ])

    // Asignaciones tipadas correctamente
    dashboardData.value.productosBajoStock = stock.data
    dashboardData.value.topClientes = clientes.data
    dashboardData.value.ultimasVentas = ventas.data
  } catch (error) {
    console.error('Error al cargar el dashboard:', error)
    // Manejo de error
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboardData)
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>👋 Dashboard Principal</h2>
      <p class="text-muted mb-0">Vista rápida y métricas clave del negocio.</p>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Obteniendo datos frescos de la base de datos...</p>
    </div>

    <div v-else>
      <div class="row g-4 mb-5">
        <div class="col-lg-4 col-md-6 col-sm-12">
          <StatCard
            icon="bi-cash-coin"
            title="Ticket Promedio (AOV)"
            :value="dashboardData.ticketPromedio"
            format="currency"
            variant="primary"
            tooltip="Monto promedio de cada venta."
          />
        </div>
        <div class="col-lg-4 col-md-6 col-sm-12">
          <StatCard
            icon="bi-graph-up-arrow"
            title="Margen Bruto (Mes)"
            :value="dashboardData.margenBrutoMes"
            format="currency"
            variant="success"
            tooltip="Ganancia total antes de gastos operativos."
          />
        </div>
        <div class="col-lg-4 col-md-12 col-sm-12">
          <StatCard
            icon="bi-exclamation-triangle-fill"
            title="Alerta de Inventario"
            :value="dashboardData.productosBajoStock.length"
            format="integer"
            variant="danger"
            tooltip="Productos con stock bajo el umbral configurado."
            action-text="Ver inventario"
            action-link="/productos"
          />
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6 col-md-12">
          <TopRankingCard
            title="🏆 Top 10 Clientes"
            subtitle="Clientes que más ingresos generaron."
            :data="dashboardData.topClientes"
            key-field="nombre_cliente"
            value-field="monto_total"
            value-format="currency"
          />
        </div>

        <div class="col-lg-6 col-md-12">
          <LastSalesTable
            title="🕒 Últimas 10 Ventas"
            subtitle="Transacciones recientes para auditoría."
            :sales="dashboardData.ultimasVentas"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos si son necesarios */
.container-fluid {
  max-width: 1400px;
}
</style>
