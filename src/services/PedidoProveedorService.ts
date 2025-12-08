// src/services/PedidoProveedorService.ts
import laravelApi from '@/http/laravelApi'
import type {
  IPedidoProveedor,
  IPedidoProveedorPaginated,
  IPedidoProveedorRequest,
  IPedidoProveedorResponse,
} from '@/interfaces/IPedidoProveedor'

class PedidoProveedorService {
  private readonly API_URL = '/pedidos-proveedor'

  async recibirPedido(payload: IPedidoProveedorRequest): Promise<IPedidoProveedorResponse> {
    try {
      const response = await laravelApi.post<IPedidoProveedorResponse>(this.API_URL, payload)
      return response.data
    } catch (error) {
      console.error('Error al recibir pedido:', error)
      throw error
    }
  }

  async getPedidos(): Promise<IPedidoProveedorPaginated> {
    try {
      const response = await laravelApi.get<IPedidoProveedorPaginated>(this.API_URL)
      return response.data
    } catch (error) {
      console.error('Error al obtener pedidos:', error)
      throw error
    }
  }

  async getPedidoById(id: number): Promise<IPedidoProveedor> {
    try {
      const response = await laravelApi.get<IPedidoProveedor>(`${this.API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error)
      throw error
    }
  }
}

export default new PedidoProveedorService()
