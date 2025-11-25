<template>
  <div class="d-flex align-items-center justify-content-center login-background h-100">
    <div class="card p-4 p-md-5 w-100 shadow-lg" style="max-width: 450px">
      <div class="card-header border-0 bg-white pt-0">
        <h3 class="text-center text-primary fw-bold mb-3">Iniciar Sesión</h3>
        <p class="text-center text-muted">Accede al panel de administración de la tienda.</p>
      </div>

      <div class="card-body px-0 pt-0">
        <form @submit.prevent="authUser">
          <div class="mb-4">
            <label for="inputEmail" class="form-label fw-semibold text-secondary">
              <i class="bi bi-envelope me-2"></i>Correo Electrónico
            </label>
            <input
              type="email"
              class="form-control form-control-lg rounded-3 border-primary"
              id="inputEmail"
              placeholder="nombre@ejemplo.com"
              aria-describedby="emailHelp"
              v-model="email"
              required
            />
          </div>

          <div class="mb-4">
            <label for="inputPassword" class="form-label fw-semibold text-secondary">
              <i class="bi bi-lock me-2"></i>Contraseña
            </label>

            <div class="input-group input-group-lg">
              <input
                :type="passwordVisible ? 'text' : 'password'"
                class="form-control form-control-lg rounded-3 border-primary me-2"
                id="inputPassword"
                placeholder="Ingresa tu contraseña"
                v-model="password"
                required
              />

              <button
                class="btn btn-outline-secondary rounded-3"
                type="button"
                @click="togglePasswordVisibility"
                style="border-color: #0d6efd"
              >
                <i
                  :class="passwordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  class="text-primary"
                ></i>
              </button>
            </div>
          </div>

          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-primary btn-lg bg-gradient rounded-3 text-uppercase fw-bold shadow-sm"
              :disabled="!email || !password"
            >
              Acceder al Sistema
            </button>
          </div>

          <div
            v-if="authMessage"
            :class="[
              'alert mt-3 text-center',
              authMessageType === 'success' ? 'alert-success' : 'alert-danger',
            ]"
          >
            {{ authMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordVisible = ref(false)

const authMessage = ref<string | null>(null)
const authMessageType = ref<'success' | 'danger'>('danger')

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const authUser = async () => {
  authMessage.value = null

  if (!email.value.trim() || !password.value.trim()) {
    authMessage.value = 'El correo electrónico y la contraseña son obligatorios.'
    authMessageType.value = 'danger'
    return
  }

  const authResponse = await authStore.login(email.value, password.value)

  if (authResponse.success) {
    authMessage.value = '¡Éxito! Redirigiendo al panel de control...'
    authMessageType.value = 'success'

    router.push({ name: 'PostList' })
  } else {
    const errorMessage = authResponse.message || 'Fallo de conexión o credenciales inválidas.'

    authMessage.value = errorMessage
    authMessageType.value = 'danger'
  }
}
</script>
<style scoped>
.login-background {
  height: 100%;
  background-color: #343a40;
}

.input-group-lg .btn {
  border-color: #ced4da;
}
</style>
