import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ProductoBajoStockService from '@/services/ProductoBajoStockService'
import CuentaPorCobrarAlertaService from './CuentaPorCobrarAlertaService'
import type { ProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import type { PaginatedResponse } from '@/interfaces/ILaravelPaginated'
import type { CuentasPorCobrarParams } from '@/services/CuentaPorCobrarService'
import { type dataCuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'
import { type PaginatedCuentasPorCobrar } from '@/interfaces/ICuentaPorCobrar'

// Definimos la estructura de datos para el stock
interface StockAlertState {
  data: ProductoBajoStock[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

interface CuentaAlertState {
  data: dataCuentaPorCobrar[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

export const useStockAlertStore = defineStore('stockAlert', () => {
  // --- ESTADO ---

  // Estado para Stock (Existente)
  const stockAlertData = ref<StockAlertState>({
    data: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  })

  const cuentasAlertData = ref<CuentaAlertState>({
    data: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  })

  const isLoading = ref(false)
  const isLoadingCuentas = ref(false)
  const error = ref<string | null>(null)
  const errorCuentas = ref<string | null>(null)

  // --- LÓGICA COMPUTADA ---

  // Contadores individuales
  const totalStockAlertas = computed((): number => stockAlertData.value.total)
  const totalCuentasMorosas = computed((): number => cuentasAlertData.value.total)

  const totalNotificaciones = computed((): number => {
    return totalStockAlertas.value + totalCuentasMorosas.value
  })

  // Datos para la vista
  const productosBajoStock = computed((): ProductoBajoStock[] => stockAlertData.value.data)
  const cuentasMorosas = computed((): dataCuentaPorCobrar[] => cuentasAlertData.value.data)

  // --- ACCIONES (Métodos) ---

  // 1. Acciones para Bajo Stock (Modificado para usar stockAlertData)
  async function fetchBajoStock(page: number = stockAlertData.value.currentPage) {
    isLoading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<ProductoBajoStock> =
        await ProductoBajoStockService.getBajoStock({
          page: page,
          per_page: stockAlertData.value.perPage,
        })

      stockAlertData.value.data = response.data
      stockAlertData.value.total = response.meta?.total || response.meta.total
      stockAlertData.value.currentPage = response.meta.current_page
      stockAlertData.value.lastPage = response.meta.last_page
      stockAlertData.value.perPage = response.meta.per_page
    } catch (err) {
      console.error('Error al cargar alertas de stock:', err)
      error.value = 'Fallo al conectar con la API para obtener las alertas de stock.'
      stockAlertData.value.data = []
      stockAlertData.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCuentasMorosas(page: number = cuentasAlertData.value.currentPage) {
    isLoadingCuentas.value = true
    errorCuentas.value = null

    try {
      const params: CuentasPorCobrarParams = {
        page: page,
        per_page: cuentasAlertData.value.perPage,
      }

      const response: PaginatedCuentasPorCobrar =
        await CuentaPorCobrarAlertaService.getCuentasMorosas(params)

      cuentasAlertData.value.data = response.data
      cuentasAlertData.value.total = response.total
      cuentasAlertData.value.currentPage = response.current_page
      cuentasAlertData.value.lastPage = response.last_page
      cuentasAlertData.value.perPage = response.per_page
    } catch (err) {
      console.error('Error al cargar cuentas morosas:', err)
      errorCuentas.value = 'Fallo al conectar con la API para obtener las cuentas por cobrar.'
      cuentasAlertData.value.data = []
      cuentasAlertData.value.total = 0
    } finally {
      isLoadingCuentas.value = false
    }
  }

  /**
   * Método para forzar la recarga de la primera página de stock.
   */
  function reloadAlerts() {
    fetchBajoStock(1)
    fetchCuentasMorosas(1) // Recargar también las cuentas
  }

  // Exportamos todas las propiedades y métodos públicos
  return {
    stockAlertData,
    cuentasAlertData,
    isLoading,
    isLoadingCuentas,
    error,
    errorCuentas,
    totalNotificaciones,
    totalStockAlertas,
    totalCuentasMorosas,
    productosBajoStock,
    cuentasMorosas,
    fetchBajoStock,
    fetchCuentasMorosas,
    reloadAlerts,
  }
})
