import axios from 'axios'
import laravelApi from '@/http/laravelApi'

// For createDevolucion(data)
export interface ProductoDevueltoData {
  producto_id: number
  id_unico_producto: string
  cantidad: number // Should always be 1
  motivo: string
  costo_unitario: number
  notas?: string | null
}

export interface CreateDevolucionData {
  venta_id: number | null
  productos_devueltos: ProductoDevueltoData[]
  cliente_id?: number
}

// For Devolucion objects returned from API
export interface Devolucion {
  id: number
  venta_id: number
  producto_id: number
  cliente_id: number
  id_unico_producto: string
  cantidad: number
  motivo: string
  costo_unitario: number
  notas: string | null
  estado_gestion: string // 'Pendiente', 'Contactado', 'Finalizada'
  created_at: string
  updated_at: string
  // Relationships (simplified for now)
  producto?: { id: number; nombre: string }
  cliente?: { id: number; nombre: string; cedula: string | null }
  venta?: { id: number; total: number }
}

// For updateDevolucionStatus(id, newStatus)
interface UpdateStatusData {
  estado_gestion: string
}

interface DevolucionResponse {
  message: string
  devoluciones: Devolucion[] // Changed to array since store returns multiple
}

interface SingleDevolucionResponse {
  message: string
  devolucion: Devolucion
}

class DevolucionService {
  private endpoint = '/devoluciones'

  async createDevolucion(data: CreateDevolucionData): Promise<DevolucionResponse> {
    try {
      const response = await laravelApi.post<DevolucionResponse>(this.endpoint, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al crear la devolución.')
      }
      throw new Error('Error de red o desconocido al crear la devolución.')
    }
  }

  async getDevolucionesPendientes(): Promise<Devolucion[]> {
    try {
      const response = await laravelApi.get<Devolucion[]>(`${this.endpoint}/pendientes`)
      return response.data
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
