import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ProductoBajoStockService from '@/services/ProductoBajoStockService'
import type { ProductoBajoStock } from '@/interfaces/IProductoBajoStock'
import type { PaginatedResponse } from '@/services/ProductoService'

// Definimos la estructura de datos que almacenará el estado paginado
interface StockAlertState {
  data: ProductoBajoStock[]
  total: number // El total de productos bajo stock en todas las páginas (del campo 'total' de meta)
  currentPage: number
  lastPage: number
  perPage: number
}

export const useStockAlertStore = defineStore('stockAlert', () => {
  // --- ESTADO ---

  const alertData = ref<StockAlertState>({
    data: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- LÓGICA COMPUTADA ---

  /**
   * Calcula y devuelve el número total de productos en bajo stock (el campo 'total' de Laravel).
   */
  const totalAlertas = computed((): number => alertData.value.total)

  /**
   * Devuelve la lista de productos bajo stock de la página actual.
   */
  const productosBajoStock = computed((): ProductoBajoStock[] => alertData.value.data)

  // --- ACCIONES (Métodos) ---

  /**
   * Carga la lista paginada de productos que están en bajo stock.
   * @param page La página a cargar. Por defecto, carga la página actual.
   */
  async function fetchBajoStock(page: number = alertData.value.currentPage) {
    isLoading.value = true
    error.value = null

    try {
      const response: PaginatedResponse<ProductoBajoStock> =
        await ProductoBajoStockService.getBajoStock({
          page: page,
          per_page: alertData.value.perPage,
        })

      // Asignamos la información de paginación a nuestro estado
      alertData.value.data = response.data
      alertData.value.total = response.meta.total
      alertData.value.currentPage = response.current_page
      alertData.value.lastPage = response.last_page
      alertData.value.perPage = response.per_page
    } catch (err) {
      console.error('Error al cargar alertas de stock:', err)
      error.value = 'Fallo al conectar con la API para obtener las alertas de stock.'

      // Limpiar la lista en caso de error para evitar mostrar datos viejos
      alertData.value.data = []
      alertData.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Método para forzar la recarga de la primera página.
   */
  function reloadAlerts() {
    fetchBajoStock(1)
  }

  // Exportamos todas las propiedades y métodos públicos
  return {
    alertData,
    isLoading,
    error,
    totalAlertas,
    productosBajoStock,
    fetchBajoStock,
    reloadAlerts,
  }
})
