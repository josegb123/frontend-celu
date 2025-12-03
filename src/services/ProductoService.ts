import laravelApi from '../http/laravelApi'
import type { AxiosResponse } from 'axios'

// 1. Interfaz Extendida para Administración
export interface Producto {
  id: number
  categoria_id: number
  user_id: number
  codigo_barra: string | null
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  precio_compra: number | string
  precio_venta: number | string
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
    name: string
  } | null
}

// 2. Interfaz para la respuesta paginada de Laravel (Crucial para el POS)
export interface PaginatedResponse<T> {
  current_page: number
  data: T[] // El array de productos
  last_page: number
  per_page: number
  total: number
  // Se pueden añadir otras propiedades de Laravel si se usan (ej. from, to, first_page_url)
}

// Clase de servicio
class ProductoService {
  private endpoint = '/productos'

  // --- MÉTODOS DE BÚSQUEDA Y LISTADO ---

  /**
   * Busca productos por un término para un componente de búsqueda rápida.
   * El endpoint devuelve una respuesta que contiene un array de productos.
   */
  public async searchProductos(query: string): Promise<Producto[]> {
    if (query.length < 3) return []
    try {
      const response: AxiosResponse<Producto[] | { data: Producto[] }> = await laravelApi.get(
        `${this.endpoint}?search=${query}`,
      )

      const paginatedResults = (response.data as { data: Producto[] })?.data
      const directResults = response.data

      let results: Producto[] = []

      if (Array.isArray(paginatedResults)) {
        results = paginatedResults
      } else if (Array.isArray(directResults)) {
        results = directResults as Producto[]
      } else {
        console.warn(
          'Estructura de respuesta inesperada en searchProductos. No se encontró array de productos.',
          response.data,
        )
        return []
      }

      return results
    } catch (error) {
      console.error('Error al buscar productos:', error)
      return []
    }
  }

  /**
   * Obtiene la lista de productos con soporte para paginación y filtros.
   * @param params Objeto de parámetros de consulta (page, search, categoria_id, per_page).
   * @returns Una promesa que resuelve con la respuesta paginada (PaginatedResponse<Producto>).
   */
  public async getProductos(params: {
    page?: number
    search?: string
    categoria_id?: number
    per_page?: number
  }): Promise<PaginatedResponse<Producto>> {
    try {
      // Usamos el tipo PaginatedResponse<Producto> para asegurar la estructura de la respuesta
      const response: AxiosResponse<PaginatedResponse<Producto>> = await laravelApi.get(
        this.endpoint,
        { params },
      )

      // Devolvemos la respuesta completa de paginación para que el POS pueda usar 'current_page', 'last_page', etc.
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de productos paginada.', error)
      throw error
    }
  }

  /**
   * Obtiene un producto por su ID.
   */
  public async getProductoById(id: number): Promise<Producto | null> {
    try {
      const response: AxiosResponse<Producto> = await laravelApi.get(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error)
      return null
    }
  }

  // --- MÉTODO DE GUARDADO (Creación/Actualización) ---

  /**
   * Maneja la creación o actualización de un producto, incluyendo la imagen.
   */
  public async saveProducto(data: FormData, id: number | null): Promise<Producto> {
    try {
      let response: AxiosResponse<Producto>

      if (id) {
        response = await laravelApi.post(`${this.endpoint}/${id}`, data)
      } else {
        response = await laravelApi.post(this.endpoint, data)
      }

      return response.data
    } catch (error) {
      console.error(`Error al guardar producto (ID: ${id})`, error)
      throw error
    }
  }

  /**
   * Elimina un producto por su ID.
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
