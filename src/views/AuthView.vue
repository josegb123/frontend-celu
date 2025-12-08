<template>
  <div class="d-flex align-items-center justify-content-center login-background-modern h-100">
    <div class="theme-switch-container">
      <button
        class="btn rounded-pill shadow-lg py-2 px-3"
        :class="isDarkMode ? 'btn-light' : 'btn-dark'"
        @click="toggleTheme"
        aria-label="Alternar Tema Claro/Oscuro"
      >
        <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
      </button>
    </div>

    <div
      class="card p-4 p-md-5 w-40 shadow-lg border border-secondary-subtle rounded-3 w-100"
      style="max-width: 450px"
    >
      <div class="card-header border-0 pt-0 pb-3 text-center bg-transparent">
        <h1 class="text-primary fw-bolder mb-2 fs-2">{{ brandingName }}</h1>
        <p class="text-muted fs-6">Inicia sesión para gestionar tu negocio.</p>
      </div>

      <div class="card-body px-0 pt-0">
        <form @submit.prevent="authUser">
          <div class="mb-4">
            <label for="inputEmail" class="form-label fw-semibold text-muted">
              <i class="bi bi-envelope me-2 text-primary"></i>Correo Electrónico
            </label>
            <input
              type="email"
              class="form-control form-control-lg rounded-3 form-control-minimal"
              id="inputEmail"
              placeholder="nombre@ejemplo.com"
              v-model="email"
              required
            />
          </div>

          <div class="mb-4">
            <label for="inputPassword" class="form-label fw-semibold text-muted">
              <i class="bi bi-lock me-2 text-primary"></i>Contraseña
            </label>

            <div class="input-group input-group-lg">
              <input
                :type="passwordVisible ? 'text' : 'password'"
                class="form-control rounded-start-3 form-control-minimal"
                id="inputPassword"
                placeholder="Ingresa tu contraseña"
                v-model="password"
                required
              />

              <button
                class="btn btn-outline-primary rounded-end-3 input-group-btn-minimal"
                type="button"
                @click="togglePasswordVisibility"
              >
                <i
                  :class="passwordVisible ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"
                  class="text-primary"
                ></i>
              </button>
            </div>
          </div>

          <div class="d-grid gap-2 mb-3 mt-4">
            <button
              type="submit"
              class="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm"
              :disabled="!email || !password"
            >
              Ingresar
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

          <br />
          <p class="text-center text-muted mb-0">
            ¿Eres nuevo por aquí?
            <router-link
              :to="{ name: 'register' }"
              class="text-primary fw-bold text-decoration-none"
            >
              Crea una cuenta
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordVisible = ref(false)
const authMessage = ref<string | null>(null)
const authMessageType = ref<'success' | 'danger'>('danger')

// --- Lógica del Branding y Tema ---
const brandingName = import.meta.env.VITE_BRANDING_NAME || 'Aplicación Web'

// 🚨 Por defecto, tema oscuro (true)
const isDarkMode = ref(true)

const applyTheme = (isDark: boolean) => {
  // Bootstrap 5.3+ usa el atributo 'data-bs-theme' en el elemento raíz.
  if (isDark) {
    document.documentElement.setAttribute('data-bs-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-bs-theme')
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  applyTheme(isDarkMode.value)
}

onMounted(() => {
  // Cargar preferencia desde localStorage. Si no hay, usar 'dark'.
  const savedTheme = localStorage.getItem('theme')
  isDarkMode.value = savedTheme === 'light' ? false : true

  applyTheme(isDarkMode.value)
})

// --- Lógica de la Vista ---
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

    router.push({ name: 'home' })
  } else {
    const errorMessage = authResponse.message || 'Fallo de conexión o credenciales inválidas.'

    authMessage.value = errorMessage
    authMessageType.value = 'danger'
  }
}
</script>

<style scoped>
/* --- Estilos de Fondo y Contenedor --- */

/* Fondo base (será afectado por data-bs-theme) */
.login-background-modern {
  height: 100vh;
  /* Usamos un color neutro que funciona bien en ambos modos */
  background-color: var(--bs-body-bg);
  transition: background-color 0.3s ease;
}

/* Posicionamiento del Botón de Tema */
.theme-switch-container {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

/* Estilo para inputs: eliminamos el padding excesivo en vertical y reducimos el grosor del borde */
.form-control-minimal {
  /* Borde más fino */
  border-width: 1px;
  /* Sombra sutil al enfocar */
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}
.form-control-minimal:focus {
  /* Mantener el foco limpio */
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.1rem rgba(13, 110, 253, 0.25); /* Sombra de enfoque más discreta */
}

/* Ajuste para el botón del input group */
.input-group-btn-minimal {
  border-width: 1px !important;
  border-color: var(--bs-border-color) !important;
  border-left: none !important; /* Quitar el borde izquierdo para que se fusione con el input */
}
.input-group-btn-minimal:hover {
  border-color: var(--bs-primary) !important;
  .text-primary {
    color: var(--bs-white) !important;
  }
}
</style>
