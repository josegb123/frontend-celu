<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 1. IMPORTAR INTERFACES DEL SERVICIO para tipar 'dashboardData'
import {
  estadisticasService,
  type TopMetric,
  type VentaMinimal,
  type TimeSeriesData,
} from '@/services/estadisticasService'
import type { HistorialGananciasEstadistica, ProductoBajoStock } from '@/interfaces/reports/report_types'

import StatCard from '@/components/home/StatCard.vue'
import TopRankingCard from '@/components/home/TopRankingCard.vue'
import LastSalesTable from '@/components/home/LastSalesTable.vue'
import { useStockAlertStore } from '@/store/useStockAlertStore'
import { useAuthStore } from '@/store/authStore'

// 2. USAR EL STORE DE ALERTAS DE STOCK
const storeAlert = useStockAlertStore()
const bajoStock = computed(() => {
  return storeAlert.totalStockAlertas
})

const userStore = useAuthStore()
const user = computed(() => userStore.user)

// 3. DEFINIR LA INTERFAZ PARA LOS DATOS DEL DASHBOARD
interface DashboardData {
  ticketPromedio: number
  margenBrutoMes: number
  productosBajoStock: ProductoBajoStock[]
  topClientes: TopMetric[]
  ultimasVentas: VentaMinimal[]
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

const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 1. Métricas clave
    const [ticket, margenResult] = await Promise.all([
      estadisticasService.getTicketPromedio(),
      estadisticasService.getHistorialGanancias({ periodo: 'month' }),
    ])

    dashboardData.value.ticketPromedio = ticket.monto_promedio_venta

    // Obtener el beneficio de la primera entrada (asumiendo que es el mes actual)
    const margenData: TimeSeriesData[] = margenResult.data.map(
      (item: HistorialGananciasEstadistica) => ({
        date: item.periodo_fecha,
        value: item.beneficio_bruto,
        label: item.periodo_fecha, // You can adjust the label as needed
      }),
    )
    dashboardData.value.margenBrutoMes =
      margenData.length > 0 && margenData[0] ? (margenData[0].value ?? 0) : 0

    // 2. Tablas/Listados
    const [stock, clientes, ventas] = await Promise.all([
      estadisticasService.getProductosBajoStock(),
      estadisticasService.getTopClientesPorMonto(),
      estadisticasService.getUltimasVentas(),
    ])

    // Asignaciones tipadas correctamente
    dashboardData.value.productosBajoStock = stock.data
    dashboardData.value.topClientes = clientes.data.map((item) => ({
      label: item.nombre_cliente,
      value: item.monto_total,
    }))
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
      <h2>👋 Bienvenido {{ user.name }}</h2>
      <p class="text-muted mb-0">Vista rápida y métricas clave del negocio.</p>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Obteniendo datos frescos de la base de datos...</p>
    </div>
    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-lg-4 col-md-6 col-sm-12">
          <StatCard
            icon="bi-cash-coin"
            title="Ticket Promedio (AOV)"
            :value="dashboardData.ticketPromedio"
            format="currency"
            variant="primary"
            tooltip="Monto promedio de cada venta."
            card-class="tailwind-style-card"
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
            card-class="tailwind-style-card"
          />
        </div>
        <div class="col-lg-4 col-md-12 col-sm-12">
          <StatCard
            icon="bi-exclamation-triangle-fill"
            title="Alerta de Inventario"
            :value="bajoStock"
            format="integer"
            variant="danger"
            tooltip="Productos con stock bajo el umbral configurado."
            action-text="Ver inventario"
            action-link="/productos"
            card-class="tailwind-style-card"
          />
        </div>
      </div>

      <div class="row g-3">
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

/* Estilos de tarjeta compacta */
.tailwind-style-card {
  border-radius: 0.5rem; /* rounded-lg */

  box-shadow: none !important;

  /* Borde delgado y sutil (thin border) - OK, usa variable adaptable */
  border: 1px solid var(--bs-border-color-translucent);

  /* Reducir el padding interno (p-3 o p-4) */
  padding: 0.75rem !important; /* Aproximadamente p-3 */
}

/* Ajustes internos para compactación */
.tailwind-style-card .card-body {
  padding: 0 !important;
}

/* Alineación y tamaño de texto */
.tailwind-style-card .card-title {
  font-size: 0.95rem;
  margin-bottom: 0.25rem !important;
}

.tailwind-style-card .stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Ajuste del icono */
.tailwind-style-card .stat-icon {
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
  line-height: 2rem;
  border-radius: 50%;
  margin-right: 0.75rem;
}
</style>
