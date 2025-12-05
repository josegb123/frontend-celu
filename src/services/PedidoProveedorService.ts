// src/services/PedidoProveedorService.ts
import laravelApi from '@/http/laravelApi'
import type { IPedidoProveedorRequest, IPedidoProveedor } from '@/interfaces/IPedidoProveedor'

class PedidoProveedorService {
  private readonly API_URL = '/recibir-pedidos'

  async recibirPedido(payload: IPedidoProveedorRequest): Promise<IPedidoProveedor> {
    try {
      const response = await laravelApi.post<IPedidoProveedor>(this.API_URL, payload)
      return response.data
    } catch (error) {
      console.error('Error al recibir pedido:', error)
      throw error
    }
  }

  // Potentially other methods like getPedidos, updatePedido, etc. if needed in the future
}

export default new PedidoProveedorService()
