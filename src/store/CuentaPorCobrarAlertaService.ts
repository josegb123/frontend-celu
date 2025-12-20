import { defineStore } from 'pinia'
import { ref } from 'vue'
import laravelApi from '../http/laravelApi'
import { AxiosError } from 'axios'
import type { ICuentaPorCobrar } from '@/interfaces/ICuentaPorCobrar'
import type { PaginatedResponse } from '@/interfaces/ILaravelPaginated'

export const useCuentaAlertaStore = defineStore('cuentaAlerta', () => {
  // Estado
  const cuentasMorosas = ref<ICuentaPorCobrar[]>([])
  const totalCuentas = ref<number>(0)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  /**
   * Carga las cuentas pendientes y las almacena en el estado.
   */
  async function fetchCuentasMorosas(params: object = {}): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        estado: 'Pendiente',
        per_page: 15,
        ...params,
      }

      const response = await laravelApi.get<PaginatedResponse<ICuentaPorCobrar>>(
        '/cuentas-por-cobrar',
        {
          params: defaultParams,
        },
      )

      // Almacenamos en el estado local del Store
      cuentasMorosas.value = response.data.data
      totalCuentas.value = response.data.meta.total
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        error.value = err.response?.data?.message || 'Error al cargar alertas de crédito'
      } else {
        error.value = 'Ocurrió un error inesperado'
      }
      console.error('CuentaAlertaStore:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    cuentasMorosas,
    totalCuentas,
    isLoading,
    error,
    // Actions
    fetchCuentasMorosas,
  }
})
