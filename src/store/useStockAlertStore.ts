import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import NotificationService from '@/services/NotificationService'
import type { ProductoBajoStock } from '@/interfaces/IProductoBajoStock'

export const useStockStore = defineStore(
  'stock',
  () => {
    // --- ESTADO (State) ---
    const products = ref<ProductoBajoStock[]>([])
    const total = ref(0)
    const isLoading = ref(false)
    const lastError = ref<string | null>(null)

    // --- COMPUTADOS (Getters) ---
    const hasNotifications = computed(() => total.value > 0)

    // Este es el que usarás en el icono de la campana
    const badgeCount = computed(() => total.value)

    // --- ACCIONES (Actions) ---
    async function fetchBajoStock() {
      // Evitamos peticiones simultáneas si ya está cargando
      if (isLoading.value) return

      isLoading.value = true
      lastError.value = null

      try {
        const response = await NotificationService.getBajoStock()

        // Guardamos los datos en el estado
        products.value = response.data
        total.value = response.total
      } catch (error) {
        lastError.value = 'No se pudieron cargar las alertas de inventario.'
        console.error('Store Stock Error:', error)
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Limpia el estado (útil al cerrar sesión)
     */
    function clearStore() {
      products.value = []
      total.value = 0
      lastError.value = null
    }

    return {
      products,
      total,
      isLoading,
      lastError,
      hasNotifications,
      badgeCount,
      fetchBajoStock,
      clearStore,
    }
  },
  {
    persist: true,
  },
)
