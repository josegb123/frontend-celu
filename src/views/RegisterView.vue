<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    <div
      class="card shadow-lg p-4 p-md-5 w-100 border border-secondary-subtle rounded"
      style="max-width: 450px"
    >
      <h2 class="card-title text-center mb-4">
        <i class="bi bi-person-plus-fill me-2 text-primary"></i>
        Registro de Usuario
      </h2>

      <form @submit.prevent="authUser">
        <div class="mb-3">
          <label for="nameInput" class="form-label">Nombre</label>
          <input
            type="text"
            class="form-control"
            id="nameInput"
            v-model="name"
            placeholder="Introduce el nombre completo"
            required
          />
        </div>

        <div class="mb-3">
          <label for="emailInput" class="form-label">Correo Electrónico</label>
          <input
            type="email"
            class="form-control"
            id="emailInput"
            v-model="email"
            placeholder="ejemplo@dominio.com"
            required
          />
        </div>

        <div class="mb-3">
          <label for="passwordInput" class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="passwordInput"
            v-model="password"
            placeholder="Mínimo 8 caracteres"
            required
          />
        </div>

        <div class="mb-4">
          <label for="role" class="form-label">Selecciona un rol:</label>
          <select class="form-select" name="role" id="role" v-model="role" required>
            <option disabled value="">-- Selecciona una opción --</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary w-100">
          <i class="bi bi-check-circle-fill me-2"></i> Registrar Usuario
        </button>
        <router-link :to="{ name: 'auth' }">
          <button type="button" class="btn btn-light mt-2 w-100">
            <i class="bi bi-arrow-left-circle-fill me-2"></i> Regresar
          </button>
        </router-link>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterService from '@/services/RegisterService'
import { ref, onMounted } from 'vue'

const email = ref('')
const password = ref('')
const name = ref('')
const role = ref('')

const authUser = async () => {
  // Validación básica del lado del cliente (si faltan campos)
  if (!name.value || !email.value || !password.value || !role.value) {
    alert('Por favor, completa todos los campos.')
    return
  }

  const register = new RegisterService()

  const success = await register.register(name.value, email.value, password.value, role.value)

  if (success) {
    alert('Exito: Usuario registrado con éxito.')
    // Opcional: limpiar el formulario
    name.value = ''
    email.value = ''
    password.value = ''
    role.value = '' // Se limpia para que el usuario deba seleccionar de nuevo
  } else {
    alert('Fallo en algun lugar: Error al registrar usuario.')
  }
}

onMounted(() => {
  // Inicializar el rol a una cadena vacía para que la opción "-- Selecciona una opción --"
  // esté activa si no hay valor predefinido.
  role.value = ''
})
</script>

<style scoped>
/* Estilo para asegurar que el contenedor ocupe al menos toda la altura de la vista */
.min-vh-100 {
  min-height: 100vh;
}
</style>
