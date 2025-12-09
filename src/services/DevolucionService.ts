import axios from 'axios'
import laravelApi from '@/http/laravelApi'

// 1. TIPOS CORREGIDOS PARA EL PAYLOAD DE CREACIÓN

export interface DevolucionItemPayload {
  // Campo clave usado por el backend para buscar el ítem de la venta original
  detalle_venta_id: number

  // Cantidad real que se está devolviendo
  cantidad: number

  motivo: string
  notas?: string | null

  // ❌ Eliminados: producto_id, id_unico_producto, costo_unitario (obtenidos del detalle de venta)
}

export interface CreateDevolucionData {
  venta_id: number | null

  // Método para el egreso financiero
  metodo_reembolso: string

  // La colección de ítems devueltos usa la nueva interfaz
  items_devueltos: DevolucionItemPayload[]

  // ❌ Eliminado: cliente_id (obtenido directamente de la venta)
}

// 2. TIPOS CORREGIDOS PARA EL OBJETO DEVOLUCION (Respuesta de la API)

export interface Devolucion {
  id: number
  venta_id: number
  // Campo clave en el modelo de Laravel
  detalle_venta_id: number

  producto_id: number
  cliente_id: number

  // ❌ Eliminado: id_unico_producto (ya no existe en el modelo)

  cantidad: number
  motivo: string
  costo_unitario: number // Se mantiene en el objeto devuelto para auditoría
  notas: string | null
  estado_gestion: string
  created_at: string
  updated_at: string

  // Relaciones
  producto?: { id: number; nombre: string }
  cliente?: { id: number; nombre: string; cedula: string | null }
  venta?: { id: number; total: number }
  detalleVenta?: any // Nueva relación para la trazabilidad
}

// 3. TIPOS DE RESPUESTA AJUSTADOS

interface UpdateStatusData {
  estado_gestion: string
}

interface DevolucionResponse {
  message: string
  venta_id: number
  nuevo_estado: string
  devoluciones_creadas: Devolucion[] // Colección de objetos Devolucion creados
}

interface SingleDevolucionResponse {
  message: string
  devolucion: Devolucion
}

// 4. CLASE SERVICIO (Sin cambios en métodos, solo en tipos)

class DevolucionService {
  private endpoint = '/devoluciones'

  // El método recibe la interfaz CreateDevolucionData corregida
  async createDevolucion(data: CreateDevolucionData): Promise<DevolucionResponse> {
    try {
      // Usamos el endpoint '/devoluciones' que mapea al store refactorizado
      const response = await laravelApi.post<DevolucionResponse>(this.endpoint, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Aseguramos que se lance el mensaje de error del backend (ej. validación, stock, etc.)
        throw new Error(error.response.data.message || 'Error al procesar la devolución.')
      }
      throw new Error('Error de red o desconocido al procesar la devolución.')
    }
  }

  async getDevolucionesPendientes(): Promise<Devolucion[]> {
    try {
      const response = await laravelApi.get<Devolucion[]>(`${this.endpoint}/pendientes`)
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al obtener devoluciones pendientes.')
      }
      throw new Error('Error de red o desconocido al obtener devoluciones pendientes.')
    }
  }

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
