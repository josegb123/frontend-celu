// /services/VentaService.js

import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// --- DTOs (Data Transfer Objects) ALINEADOS CON StoreVentaRequest ---

// DTO para el detalle del ítem
export interface VentaItemDTO {
  producto_id: number // items.*.producto_id (required)
  cantidad: number // items.*.cantidad (required)
  precio_unitario: number | null // items.*.precio_unitario (nullable)
  descuento: number | null // items.*.descuento (nullable)
}

// Tipos permitidos por el Store Request
export type MetodoPagoRequest = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'plan_separe'
export type EstadoVentaRequest = 'finalizada' | 'cancelada' | 'pendiente_pago' | 'reembolsada'

// DTO principal para enviar la Venta a la API
export interface VentaDTO {
  // --- Cabecera ---
  cliente_id: number | null // 'nullable|exists:clientes,id'
  tipo_venta_id: number // 'required|exists:tipo_ventas,id'
  descuento_total: number | null // 'nullable|numeric|min:0'
  metodo_pago: MetodoPagoRequest | null // 'nullable|string|Rule::in'
  estado: EstadoVentaRequest | null // 'nullable|string|in'
  iva_porcentaje: number | null // 'nullable|numeric'

  // --- Ítems ---
  items: VentaItemDTO[] // 'required|array|min:1'
}

class VentaService {
  private endpoint = '/ventas'

  /**
   * Procesa y registra la venta en el sistema.
   * @param ventaData Los datos completos de la venta, ítems y pagos.
   * @returns Promise<any> La respuesta del backend (ej. objeto de la venta creada).
   */
  public async registrarVenta(ventaData: VentaDTO): Promise<any> {
    try {
      const response: AxiosResponse<any> = await laravelApi.post(this.endpoint, ventaData)
      return response.data
    } catch (error) {
      console.error('Error al registrar la venta:', error)
      // Lanzamos el error para que el componente lo maneje
      throw error
    }
  }
}

export default new VentaService()
