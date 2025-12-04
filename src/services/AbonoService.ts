// src/services/AbonoService.ts

import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type { IAbono, StoreAbonoPayload, StoreAbonoResponse } from '@/interfaces/IAbono'

/**
 * Servicio para interactuar con el endpoint de Abonos.
 */
class AbonoService {
  private endpoint = '/abonos'

  /**
   * Registra un nuevo abono para una Cuenta por Cobrar.
   * Este método espera la estructura definida por StoreAbonoPayload.
   *
   * @param payload Datos del abono a registrar.
   * @returns Una promesa que resuelve con la respuesta del servidor (incluyendo el Abono y el mensaje).
   */
  public async registrarAbono(payload: StoreAbonoPayload): Promise<StoreAbonoResponse> {
    try {
      const response: AxiosResponse<StoreAbonoResponse> = await laravelApi.post(
        this.endpoint,
        payload,
      )

      // La respuesta.data ya contiene el mensaje y el objeto abono.
      return response.data
    } catch (error) {
      console.error('Error al registrar abono:', error)
      // Re-lanza el error para que el componente de la vista pueda manejarlo
      throw error
    }
  }

  // Si necesitas obtener todos los abonos de una cuenta:
  public async getAbonosByCuentaId(cuentaId: number): Promise<IAbono[]> {
    try {
      const response: AxiosResponse<IAbono[]> = await laravelApi.get(
        `${this.endpoint}?cuenta_id=${cuentaId}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error al obtener abonos para la cuenta ${cuentaId}:`, error)
      return []
    }
  }
}

export default new AbonoService()
