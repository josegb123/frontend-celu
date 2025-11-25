import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// 1. Interfaz Extendida para Administración (Se mantiene igual)
export interface Producto {
  id: number
  categoria_id: number
  user_id: number
  codigo_barra: string | null
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  precio_compra: number | string // Mantener flexibilidad si Laravel lo devuelve como string
  precio_venta: number | string // Mantener flexibilidad si Laravel lo devuelve como string
  stock_actual: number
  stock_reservado: number
  stock_minimo: number

  // Relaciones (lite)
  categoria: {
    id: number
    nombre: string
  } | null
  user: {
    id: number
    nombre: string
  } | null
}

// Interfaz para la respuesta paginada de Laravel (Se mantiene para consistencia, aunque no se usa en getProductos)
export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

// Clase de servicio
class ProductoService {
  private endpoint = '/productos'

  // --- MÉTODOS DE BÚSQUEDA Y LISTADO ---

  /**
   * Busca productos por un término para un componente de búsqueda rápida.
   * ASUME: El endpoint devuelve una respuesta paginada donde el array de productos está en 'data.data'.
   */
  public async searchProductos(query: string): Promise<Producto[]> {
    if (query.length < 3) return []
    try {
      const response: AxiosResponse<PaginatedResponse<Producto>> = await laravelApi.get(
        `${this.endpoint}?search=${query}`,
      )
      // Si la API usa Paginate::collection() o similar, los datos están en response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error al buscar productos:', error)
      return []
    }
  }

  /**
   * Obtiene la lista de productos con soporte para paginación y filtros.
   * ASUME: El endpoint devuelve directamente el array de productos [{}, {}, ...] SIN paginación.
   * @param params Objeto de parámetros de consulta (page, search, categoria_id).
   */
  public async getProductos(params: {
    page?: number
    search?: string
    categoria_id?: number
  }): Promise<Producto[]> {
    try {
      // El backend devuelve directamente el array (ejemplo de la respuesta que mostraste).
      const response: AxiosResponse<Producto[]> = await laravelApi.get(this.endpoint, { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de productos.', error)
      throw error
    }
  }

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto a buscar.
   * @returns Una promesa que resuelve con el producto encontrado.
   */
  public async getProductoById(id: number): Promise<Producto | null> {
    try {
      const response: AxiosResponse<Producto> = await laravelApi.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error)
      return null // Retornar null si no se encuentra el producto o hay un error
    }
  }

  // --- MÉTODO DE GUARDADO (Creación/Actualización) ---

  /**
   * Maneja la creación o actualización de un producto, incluyendo la imagen.
   * ASUME: El backend devuelve el objeto Producto directamente, NO envuelto en un { data: ... }.
   * @param data Objeto FormData que contiene todos los campos, incluido el archivo 'imagen'.
   * @param id ID del producto a actualizar (null si es nuevo).
   */
  public async saveProducto(data: FormData, id: number | null): Promise<Producto> {
    try {
      let response: AxiosResponse<Producto>

      if (id) {
        // Actualización: PUT
        //data.append('_method', 'PUT')
        response = await laravelApi.post(`${this.endpoint}/${id}`, data)
      } else {
        // Creación: POST
        response = await laravelApi.post(this.endpoint, data)
      }

      // ⬅️ CORRECCIÓN CRÍTICA: Se asume que el backend devuelve el objeto Producto directamente
      // No necesitamos response.data.data porque el backend no lo envuelve.
      return response.data
    } catch (error) {
      console.error(`Error al guardar producto (ID: ${id})`, error)
      throw error // Permitir que el formulario maneje los errores de validación
    }
  }

  /**
   * Elimina un producto por su ID.
   * @param id ID del producto a eliminar.
   */
  public async deleteProducto(id: number): Promise<void> {
    try {
      await laravelApi.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Error al eliminar producto (ID: ${id})`, error)
      throw error
    }
  }
}

export default new ProductoService()
