import axios from 'axios'
import laravelApi from '@/http/laravelApi'

// --- TIPOS DE RELACIONES AUXILIARES ---

/** Interfaz mínima para el DetalleVenta. Puedes expandirla si necesitas más campos. */
export interface DetalleVenta {
  id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  // Añade aquí cualquier otro campo que el backend retorne en detalleVenta
}

// --- 1. TIPOS DE PAYLOAD (INPUT) ---

export interface DevolucionItemPayload {
  /** ID del DetalleVenta asociado al producto que se devuelve. Campo clave en el backend. */
  detalle_venta_id: number

  /** Cantidad real que el cliente está devolviendo. */
  cantidad: number

  motivo: string
  notas?: string | null
}

export interface AnularVentaPayload {
  ventaId: number
  motivo: string
  /** Método de gestión del reembolso para ventas de contado: 'Efectivo', 'Transferencia', o 'SaldoCliente'. */
  metodoReembolso?: string
}

export interface CreateDevolucionData {
  venta_id: number | null

  /** Método para el egreso financiero o la generación de Saldo Cliente. */
  metodo_reembolso: string

  /** Colección de ítems a devolver. */
  items_devueltos: DevolucionItemPayload[]
}

// --- 2. TIPOS DE MODELO (RESPUESTA DE LA API) ---

export interface Devolucion {
  id: number
  venta_id: number
  /** ID del detalle de la venta original */
  detalle_venta_id: number

  producto_id: number
  cliente_id: number

  cantidad: number
  motivo: string
  /** Costo unitario registrado al momento de la devolución */
  costo_unitario: number
  notas: string | null
  estado_gestion: string
  created_at: string
  updated_at: string

  // Relaciones (si son incluidas por el Resource)
  producto?: { id: number; nombre: string }
  cliente?: { id: number; nombre: string; cedula: string | null }
  venta?: { id: number; total: number }
  detalleVenta?: DetalleVenta // Corregido: Usamos el tipo específico DetalleVenta
}

// --- 3. TIPOS DE RESPUESTA AJUSTADOS ---

interface DevolucionResponse {
  message: string
  venta_id: number
  nuevo_estado: string
  /** Colección de objetos Devolucion creados para auditoría. */
  devoluciones_creadas: Devolucion[]
}

interface SingleDevolucionResponse {
  message: string
  devolucion: Devolucion
}

// --- 4. CLASE SERVICIO ---

class DevolucionService {
  private endpoint = '/devoluciones'

  /**
   * Procesa la devolución parcial de ítems de una venta.
   * @param data Payload con la información de la venta y los ítems a devolver.
   * @returns Promesa con el resultado de la operación y el estado de la venta.
   */
  async createDevolucion(data: CreateDevolucionData): Promise<DevolucionResponse> {
    try {
      const response = await laravelApi.post<DevolucionResponse>(this.endpoint, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al procesar la devolución parcial.')
      }
      throw new Error('Error de red o desconocido al procesar la devolución parcial.')
    }
  }

  /**
   * Anula una venta completa, revirtiendo inventario, ajustando cartera o generando SaldoCliente.
   * @param payload Información de la venta a anular, motivo y método de reembolso.
   * @returns Promesa sin retorno de datos, solo indicando éxito.
   */
  async anularVenta(payload: AnularVentaPayload): Promise<void> {
    const { ventaId, motivo, metodoReembolso } = payload

    try {
      // El endpoint espera el ID de la venta en la URL y el cuerpo del request
      await laravelApi.post(`${this.endpoint}/anular-venta/${ventaId}`, {
        motivo,
        metodo_reembolso: metodoReembolso,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Error al anular la venta ID ${ventaId}.`)
      }
      throw new Error('Error de red o desconocido al anular la venta.')
    }
  }

  /**
   * Obtiene todos los registros de devoluciones que requieren gestión (estado 'Pendiente').
   * @returns Promesa con un array de objetos Devolucion.
   */
  async getDevolucionesPendientes(): Promise<Devolucion[]> {
    try {
      // Nota: El backend devuelve { data: T[] }, por eso accedemos a response.data.data
      const response = await laravelApi.get<{ data: Devolucion[] }>(`${this.endpoint}/pendientes`)
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al obtener devoluciones pendientes.')
      }
      throw new Error('Error de red o desconocido al obtener devoluciones pendientes.')
    }
  }

  /**
   * Actualiza el estado de gestión (e.g., Contactado, Finalizada) de una devolución.
   * @param id ID de la devolución a actualizar.
   * @param newStatus Nuevo estado a aplicar.
   * @returns Promesa con el objeto Devolucion actualizado.
   */
  async updateDevolucionStatus(id: number, newStatus: string): Promise<SingleDevolucionResponse> {
    try {
      const response = await laravelApi.put<SingleDevolucionResponse>(
        `${this.endpoint}/${id}/status`,
        { estado_gestion: newStatus },
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || `Error al actualizar estado de la devolución ${id}.`,
        )
      }
      throw new Error('Error de red o desconocido al actualizar estado de la devolución.')
    }
  }
}

export default new DevolucionService()
