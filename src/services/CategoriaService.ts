import laravelApi from '@/http/laravelApi.js'
import type { AxiosResponse } from 'axios'
import type { ICategoria } from '@/interfaces/ICategoria'

interface CategoriaApiResponse {
  data: ICategoria[]
}

/**
 * Define la estructura para el envío de datos de una categoría.
 * Solo necesitamos el nombre, el ID se maneja implícitamente en la URL para PUT/DELETE.
 */
interface CategoriaPayload {
  nombre: string
}

/**
 * Servicio para interactuar con la API de Categorías.
 */
class CategoriaService {
  private endpoint = '/categorias'

  /**
   * Obtiene la lista de todas las categorías disponibles.
   * @returns Promesa que resuelve un array de objetos ICategoria.
   */
  public async getCategorias(): Promise<Array<ICategoria>> {
    try {
      const response: AxiosResponse<CategoriaApiResponse> = await laravelApi.get(this.endpoint)
      return response.data.data
    } catch (error) {
      console.error('Error al obtener la lista de categorías.', error)
      // En un entorno real, podrías lanzar el error o retornar un objeto de error específico.
      return []
    }
  }

  // --- MÉTODOS CRUD ---

  /**
   * Crea una nueva categoría.
   * @param data Objeto con el nombre de la nueva categoría.
   * @returns Promesa que resuelve la categoría recién creada.
   */
  public async createCategoria(data: CategoriaPayload): Promise<ICategoria> {
    const response: AxiosResponse<{ data: ICategoria }> = await laravelApi.post(this.endpoint, data)
    return response.data.data
  }

  /**
   * Actualiza una categoría existente.
   * @param id El ID de la categoría a actualizar.
   * @param data Objeto con el nuevo nombre de la categoría.
   * @returns Promesa que resuelve la categoría actualizada.
   */
  public async updateCategoria(id: number, data: CategoriaPayload): Promise<ICategoria> {
    // Usamos PUT/PATCH en el endpoint con el ID
    const response: AxiosResponse<{ data: ICategoria }> = await laravelApi.put(
      `${this.endpoint}/${id}`,
      data,
    )
    return response.data.data
  }

  /**
   * Elimina una categoría por su ID.
   * @param id El ID de la categoría a eliminar.
   * @returns Promesa sin cuerpo de respuesta.
   */
  public async deleteCategoria(id: number): Promise<void> {
    await laravelApi.delete(`${this.endpoint}/${id}`)
  }
}

export default new CategoriaService()
