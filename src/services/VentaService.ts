// src/services/VentaService.ts

import laravelApi from '@/http/laravelApi'
import type { AxiosResponse } from 'axios'
import { isAxiosError } from 'axios'
import type { VentaPayload, VentaResponse } from '@/interfaces/IVentaTypes'

class VentaService {
  private endpoint = '/ventas'

  /**
   * Registra una nueva venta enviando los datos a la API de Laravel.
   * @param payload Los datos de la venta, incluyendo ítems.
   * @returns Una promesa que resuelve con la respuesta de la API.
   * @throws Un error si la petición falla o el backend devuelve un error.
   */
  public async registrarVenta(payload: VentaPayload): Promise<VentaResponse> {
    try {
      // Laravel espera el JSON del payload completo
      const response: AxiosResponse<VentaResponse> = await laravelApi.post(this.endpoint, payload)

      // La API devuelve 201 Created y los datos de la venta
      return response.data
    } catch (error) {
      // Usar la lógica de manejo de errores de Axios para lanzar el mensaje del backend
      if (isAxiosError(error) && error.response) {
        // Asumiendo que Laravel devuelve un mensaje de error legible (e.g., validaciones, stock insuficiente)
        const errorMessage =
          error.response.data.message || 'Error desconocido al registrar la venta.'
        throw new Error(errorMessage)
      }
      // Error de red o conexión
      throw new Error('Error de conexión con el servidor al registrar la venta.')
    }
  }

  // Aquí se agregarían otros métodos como getVentas(), getVentaById(), etc.
}

export default new VentaService()
