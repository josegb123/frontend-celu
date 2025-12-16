import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ProductoBajoStockService from '@/services/ProductoBajoStockService'
import CuentaPorCobrarAlertaService from './CuentaPorCobrarAlertaService'
import type { ProductoBajoStock, responseProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import type { CuentasPorCobrarParams } from '@/services/CuentaPorCobrarService'
import { type dataCuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'
import { type PaginatedCuentasPorCobrar } from '@/interfaces/ICuentaPorCobrar'


/**
 * Estructura de estado para las alertas de Stock Bajo.
 */
interface StockAlertState {
  data: ProductoBajoStock[] | []
  message?: string | null

total : number | 0
}

/**
 * Estructura de estado para las alertas de Cuentas por Cobrar Morosas.
 */
interface CuentaAlertState {
  data: dataCuentaPorCobrar[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

export const useStockAlertStore = defineStore('stockAlert', () => {
  // --- ESTADO ---

  const stockAlertData = ref<StockAlertState>({
    data: [],
    message: null,
    total: 0,
 
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

  /** Retorna el número total de alertas de stock bajo. */
  const totalStockAlertas = computed((): number => stockAlertData.value.total)
  /** Retorna el número total de cuentas morosas. */
  const totalCuentasMorosas = computed((): number => cuentasAlertData.value.total)

  /** Retorna el total de todas las notificaciones combinadas. */
  const totalNotificaciones = computed((): number => {
    return totalStockAlertas.value + totalCuentasMorosas.value
  })

  /** Retorna la lista de productos con stock bajo. */
  const productosBajoStock = computed((): ProductoBajoStock[] => stockAlertData.value.data)
  /** Retorna la lista de cuentas por cobrar morosas. */
  const cuentasMorosas = computed((): dataCuentaPorCobrar[] => cuentasAlertData.value.data)

  // --- ACCIONES (Métodos) ---

  /**
   * Obtiene la lista de productos con stock bajo de la API.
   * @param page - La página a cargar. Por defecto usa la página actual del estado.
   */
  async function fetchBajoStock() {
    isLoading.value = true
    error.value = null

    try {


      const response: responseProductoBajoStock =
        await ProductoBajoStockService.getBajoStock()

      stockAlertData.value.data = response.data
      // Actualizar campos de paginación
      stockAlertData.value.total = response.total
      stockAlertData.value.message = null

    } catch (err) {
      console.error('Error al cargar alertas de stock:', err)
      error.value = 'Fallo al conectar con la API para obtener las alertas de stock.'
      stockAlertData.value.data = []
      stockAlertData.value.total = 0

    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene la lista de cuentas por cobrar morosas de la API.
   * @param page - La página a cargar. Por defecto usa la página actual del estado.
   */
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
      cuentasAlertData.value.currentPage = 1
      cuentasAlertData.value.lastPage = 1
    } finally {
      isLoadingCuentas.value = false
    }
  }

  /**
   * Forzar la recarga de la primera página de todas las alertas.
   */
  function reloadAlerts() {
    fetchBajoStock()
    fetchCuentasMorosas(1)
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
