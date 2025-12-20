import laravelApi from '@/http/laravelApi'
import type { ProductoBajoResponse } from '@/interfaces/IProductoBajoStock'
import type { AxiosResponse } from 'axios'

export default {
  async getBajoStock(): Promise<ProductoBajoResponse> {
    try {
      const response: AxiosResponse<ProductoBajoResponse> = await laravelApi.get(
        '/estadisticas/productos-bajo-stock',
      )
      return response.data
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error)
      throw error
    }
  },
}
