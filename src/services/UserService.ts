import apiClient from '@/http/laravelApi'
import type { IUser, IPaginatedUsers } from '@/interfaces/IUser'

// --- INTERFACES ---

/**
 * @interface UserQueryOptions
 * Define los parámetros opcionales para filtrar y buscar usuarios.
 */
interface UserQueryOptions {
  page?: number
  search?: string | null
  role?: string | null
  per_page?: number
}

/**
 * @interface UserFormData
 * Define la estructura de los datos del formulario enviados al backend.
 */
interface UserFormData {
  name: string
  email: string
  role: string
  password?: string
  password_confirmation?: string
}

/**
 * @class UserService
 * Servicio encargado de gestionar las operaciones CRUD y de listado
 * con el recurso de usuarios en la API de Laravel.
 */
class UserService {
  private API_URL = '/usuarios'

  /**
   * Obtiene una lista paginada de usuarios, con opciones de búsqueda y filtro.
   * @param options Opciones de consulta (página, búsqueda, rol, por página).
   * @returns Una promesa que resuelve con los datos paginados de usuarios.
   */
  public async getUsers(options: UserQueryOptions = {}): Promise<IPaginatedUsers> {
    try {
      const params = new URLSearchParams()

      if (options.page) params.append('page', options.page.toString())
      if (options.search) params.append('search', options.search)
      if (options.role) params.append('role', options.role)
      if (options.per_page) params.append('per_page', options.per_page.toString())

      const queryString = params.toString() ? `?${params.toString()}` : ''

      const response = await apiClient.get(`${this.API_URL}${queryString}`)

      return response.data
    } catch (error) {
      console.error('Error in getUsers:', error)
      throw error
    }
  }

  /**
   * Almacena o actualiza un usuario.
   * @param data Los datos del formulario del usuario.
   * @param userId El ID del usuario a actualizar (null si es creación).
   * @returns Una promesa que resuelve con el objeto IUser guardado.
   */
  public async saveUser(data: UserFormData, userId: number | null = null): Promise<IUser> {
    let response

    if (userId === null) {
      response = await apiClient.post(this.API_URL, data)
    } else {
      response = await apiClient.put(`${this.API_URL}/${userId}`, data)
    }

    return response.data.data
  }

  /**
   * Elimina un usuario por su ID.
   * @param userId El ID del usuario a eliminar.
   * @returns Una promesa que resuelve cuando la operación es exitosa.
   */
  public async deleteUser(userId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.API_URL}/${userId}`)
    } catch (error) {
      throw error
    }
  }
}

/**
 * Exportar una instancia singleton del servicio.
 */
export default new UserService()
