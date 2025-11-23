import { ref, type Ref } from 'vue'

class RegisterService {
  private jwt: Ref<string>
  private error: Ref<string>
  constructor() {
    this.jwt = ref('')
    this.error = ref('')
  }

  getJwt(): Ref<string> {
    return this.jwt
  }

  getError(): Ref<string> {
    return this.error
  }

  async register(name: string, email: string, password: string, role: string): Promise<boolean> {
    this.error.value = '' // Limpiar errores anteriores

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        // Endpoint correcto
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          // CORRECCIÓN CLAVE: El campo esperado por Laravel es password_confirmation
          password_confirmation: password,
          role: role,
        }),
      })

      const response = await res.json()

      // --- MANEJO DE ESTADO HTTP ---
      if (!res.ok) {
        let errorMsg = 'El registro falló debido a un error del servidor.'

        if (res.status === 422) {
          errorMsg = response.message || 'Datos de registro inválidos (422).'
          // Aquí puedes acceder a response.errors para detalles de campo
        } else if (res.status === 500) {
          errorMsg = 'Error interno del servidor (500).'
        }

        this.error.value = errorMsg
        return false
      }

      // ÉXITO (Respuesta 201)
      this.jwt.value = response.access_token

      return true
    } catch (error) {
      // Fallo de red (DNS, CORS, etc.)
      this.error.value = 'Fallo de conexión. Verifica que el servidor esté activo.'
      console.error(error)
      return false
    }
  }
}
export default RegisterService
