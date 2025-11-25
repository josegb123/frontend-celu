import apiClient from '@/http/laravelApi' // Tu instancia de Axios configurada
import type { IUser, IPaginatedUsers } from '@/interfaces/IUser'

// Define las estructuras para el formulario, incluyendo la contraseña para la creación.
interface UserFormData {
  name: string
  email: string
  role: string
  password?: string // Opcional para la actualización
  password_confirmation?: string // Opcional para la actualización
}

class UserService {
  private API_URL = '/usuarios' // El endpoint de tu API de Laravel

  /**
   * Obtiene una lista paginada de usuarios.
   */
  public async getUsers(page: number = 1): Promise<IPaginatedUsers> {
    try {
      const response = await apiClient.get(`${this.API_URL}?page=${page}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener la lista de usuarios:', error)
      throw error
    }
  }

  /**
   * Almacena o actualiza un usuario.
   */
  public async saveUser(data: UserFormData, userId: number | null = null): Promise<IUser> {
    let response

    // Si userId es null, es una creación (POST)
    if (userId === null) {
      response = await apiClient.post(this.API_URL, data)
    } else {
      // Si userId existe, es una actualización (PUT/PATCH)
      // Nota: Si no se pasa la contraseña, el backend la ignora.
      response = await apiClient.put(`${this.API_URL}/${userId}`, data)
    }

    // La respuesta debería ser el recurso de usuario transformado
    return response.data.data
  }

  /**
   * Elimina un usuario por su ID.
   */
  public async deleteUser(userId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.API_URL}/${userId}`)
    } catch (error) {
      console.error(`Error al eliminar el usuario con ID ${userId}:`, error)
      throw error
    }
  }
}

// Exportar una instancia singleton del servicio
export default new UserService()
