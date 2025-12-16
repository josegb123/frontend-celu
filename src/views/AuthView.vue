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

    <div class="login-card-wrapper">
      <div
        class="card rounded-3 text-black overflow-hidden shadow-lg"
        :class="!isDarkMode ? 'border border-subtle' : 'border border-light-subtle'"
      >
        <div class="row g-0">
          <div class="col-12 col-md-7 col-lg-6">
            <div class="card-body p-4 p-md-5 mx-md-4">
              <div class="text-center mb-4 d-lg-none">
                <h1 class="h3 fw-bold mb-3">{{ brandingName }}</h1>
                <img
                  :src="appConfig.getBusinessLogoUrl || defaultLogo"
                  alt="Logo de la empresa"
                  style="max-width: 150px"
                  class="mb-3"
                />
                <p class="text-muted">Inicia sesión para continuar</p>
              </div>

              <h2
                class="h4 fw-bold text-center text-lg-start mb-5 pb-3 d-none d-lg-block"
                :class="{ 'text-white': isDarkMode, 'text-dark': !isDarkMode }"
              >
                Ingresar al sistema
              </h2>

              <form @submit.prevent="authUser">
                <div class="my-4 pt-4">
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

                <div class="text-center pt-3 mt-4 pb-1">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm w-100"
                    :disabled="!email || !password"
                  >
                    Ingresar <i class="bi bi-arrow-right-circle-fill ms-3"></i>
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

          <div
            class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center gradient-custom"
          >
            <div class="text-white px-3 py-4 p-md-5 mx-md-4 text-center">
              <img
                :src="appConfig.getBusinessLogoUrl || defaultLogo"
                alt="Logo de la empresa"
                style="max-width: 180px"
                class="mb-4"
              />
              <h4 class="mb-3 fw-bold">
                {{ brandingName }}
              </h4>
              <p class="small mb-0">
                Optimiza tu negocio. Mantén tu stock, ventas y finanzas bajo control en una sola
                plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// (El bloque <script setup> se mantiene igual)
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useAppConfigStore } from '@/store/useAppConfigStore'

const router = useRouter()
const authStore = useAuthStore()
const appConfig = useAppConfigStore()
const defaultLogo = '/logo.webp'

const email = ref('')
const password = ref('')
const passwordVisible = ref(false)
const authMessage = ref<string | null>(null)
const authMessageType = ref<'success' | 'danger'>('danger')

// --- Lógica del Branding y Tema ---
const brandingName = appConfig.getBusinessName

// Por defecto, tema oscuro (true)
const isDarkMode = ref(true)

const applyTheme = (isDark: boolean) => {
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
  background-color: var(--bs-body-bg);
  transition: background-color 0.3s ease;
}

/* Contenedor principal para simular el centrado y el ancho máximo del col-xl-10 */
.login-card-wrapper {
  max-width: 950px; /* Ancho cómodo para el diseño de dos columnas */
  width: 90%;
}
.card {
  background-color: var(--bs-card-bg);
}

/* Posicionamiento del Botón de Tema */
.theme-switch-container {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

/* GRADIENTE PERSONALIZADO (Azul Primario de BS5 y Cian/Purpura para elegancia) */
.gradient-custom {
  /* Gradiente base (Claro) */
  background: linear-gradient(
    to top left,
    var(--bs-primary),
    #00bcd4
  ); /* Azul primario a Cian claro */
}

/* Manejo del gradiente en Modo Oscuro */
:root[data-bs-theme='dark'] .gradient-custom {
  /* Gradiente más oscuro para el modo dark (Azul oscuro a un púrpura/magenta profundo) */
  background: linear-gradient(to top left, #1e3a8a, #4c1d95);
}

/* ESTILOS ESPECÍFICOS DE BOOTSTRAP */

.rounded-3 {
  border-radius: 0.3rem !important;
}

/* Asegura que los bordes del gradiente se redondeen correctamente en pantallas grandes */
@media (min-width: 992px) {
  .gradient-custom {
    border-top-right-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
  }
}

/* --- Estilos de Formulario --- */

.form-control-minimal {
  border-width: 1px;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}
.form-control-minimal:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.1rem rgba(var(--bs-primary-rgb), 0.25);
}

.input-group-btn-minimal {
  border-width: 1px !important;
  border-color: var(--bs-border-color) !important;
  border-left: none !important;
}
.input-group-btn-minimal:hover {
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-primary) !important;
}
.input-group-btn-minimal:hover .text-primary {
  color: var(--bs-white) !important;
}
</style>
