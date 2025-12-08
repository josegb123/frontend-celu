import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'
import type {
  ICliente,
  IClientePaginatedResponse,
  StoreUpdateClientePayload,
} from '@/interfaces/ICliente'

// --- Clase de Servicio ---

class ClienteService {
  private endpoint = '/clientes'

  // --------------------------------------------------------------------------
  // Métodos CRUD
  // --------------------------------------------------------------------------

  /**
   * Obtiene la lista paginada de clientes.
   * Permite buscar por nombre o cédula.
   * @param page Número de página actual.
   * @param search Término de búsqueda (nombre o cédula).
   * @returns Promise<IClientePaginatedResponse>
   */
  public async index(page: number = 1, search: string = ''): Promise<IClientePaginatedResponse> {
    try {
      const params = {
        page: page,
        ...(search && { search: search }),
      }

      const response: AxiosResponse<IClientePaginatedResponse> = await laravelApi.get(
        this.endpoint,
        { params },
      )

      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de clientes:', error)
      throw error
    }
  }

  /**
   * Busca clientes por un término (nombre, cédula) para uso rápido (ej: POS).
   * @returns Promise<ICliente[]> El array de clientes.
   */
  public async search(query: string): Promise<ICliente[]> {
    if (query.length < 3) return []
    try {
      const response: AxiosResponse<IClientePaginatedResponse> = await laravelApi.get(
        `${this.endpoint}?search=${query}&page=1`,
      )

      const results = response.data?.data

      if (Array.isArray(results)) {
        return results as ICliente[]
      }
      return []
    } catch (error) {
      console.error('Error al buscar clientes:', error)
      return []
    }
  }

  /**
   * Crea un nuevo registro de cliente.
   * @param payload Datos validados para el nuevo cliente.
   * @returns Promise<ICliente> El cliente recién creado.
   */
  public async store(payload: StoreUpdateClientePayload): Promise<ICliente> {
    const response: AxiosResponse<{ data: ICliente }> = await laravelApi.post(
      this.endpoint,
      payload,
    )
    return response.data.data
  }

  /**
   * Obtiene un cliente específico.
   * @param id ID del cliente.
   * @returns Promise<ICliente>
   */
  public async show(id: number | string): Promise<ICliente> {
    const response: AxiosResponse<{ data: ICliente }> = await laravelApi.get(
      `${this.endpoint}/${id}`,
    )
    return response.data.data
  }

  /**
   * Actualiza un registro de cliente existente.
   * @param id ID del cliente a actualizar.
   * @param payload Datos validados para la actualización.
   * @returns Promise<ICliente> El cliente actualizado.
   */
  public async update(id: number | string, payload: StoreUpdateClientePayload): Promise<ICliente> {
    const response: AxiosResponse<{ data: ICliente }> = await laravelApi.put(
      `${this.endpoint}/${id}`,
      payload,
    )
    return response.data.data
  }

  /**
   * Elimina suavemente un registro de cliente (Soft Delete).
   * @param id ID del cliente a eliminar.
   * @returns Promise<void>
   */
  public async destroy(id: number | string): Promise<void> {
    await laravelApi.delete(`${this.endpoint}/${id}`)
  }

  /**
   * Restaura un registro de cliente eliminado suavemente.
   * @param id ID del cliente a restaurar.
   * @returns Promise<ICliente> El cliente restaurado.
   */
  public async restore(id: number | string): Promise<ICliente> {
    const response: AxiosResponse<{ data: ICliente }> = await laravelApi.post(
      `${this.endpoint}/${id}/restore`,
    )
    return response.data.data
  }
}

export default new ClienteService()
