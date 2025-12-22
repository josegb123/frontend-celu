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
      <div class="card rounded-3 overflow-hidden shadow-lg border-0">
        <div class="row g-0">
          <div class="col-12 col-md-7 col-lg-6">
            <div class="card-body p-4 p-md-5 mx-md-4">
              <div class="text-center mb-4 d-lg-none">
                <h1 class="h3 fw-bold mb-3">{{ appConfig.getBusinessName }}</h1>
                <img
                  :src="appConfig.getBusinessLogo || defaultLogo"
                  alt="Logo"
                  style="max-width: 120px"
                  class="mb-3 rounded"
                />
              </div>

              <h2 class="h4 fw-bold text-center text-lg-start mb-5 pb-3 d-none d-lg-block">
                Ingresar al sistema
              </h2>

              <form @submit.prevent="authUser">
                <div class="mb-4">
                  <label class="form-label fw-semibold text-muted small uppercase">
                    <i class="bi bi-envelope me-2 text-primary"></i>Correo Electrónico
                  </label>
                  <input
                    type="email"
                    class="form-control form-control-lg rounded-3 form-control-minimal"
                    placeholder="correo@ejemplo.com"
                    v-model="email"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold text-muted small">
                    <i class="bi bi-lock me-2 text-primary"></i>Contraseña
                  </label>

                  <div class="input-group input-group-lg">
                    <input
                      :type="passwordVisible ? 'text' : 'password'"
                      class="form-control rounded-start-3 form-control-minimal"
                      placeholder="••••••••"
                      v-model="password"
                      required
                    />
                    <button
                      class="btn btn-outline-primary rounded-end-3 input-group-btn-minimal"
                      type="button"
                      @click="passwordVisible = !passwordVisible"
                    >
                      <i :class="passwordVisible ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <div class="text-center pt-3 mt-4">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm w-100"
                    :disabled="!email || !password || authStore.isLoading"
                  >
                    <span
                      v-if="authStore.isLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ authStore.isLoading ? 'Verificando...' : 'Ingresar' }}
                    <i v-if="!authStore.isLoading" class="bi bi-arrow-right-circle-fill ms-2"></i>
                  </button>
                </div>

                <div
                  v-if="authMessage"
                  class="alert mt-4 text-center small py-2"
                  :class="authMessageType === 'success' ? 'alert-success' : 'alert-danger'"
                >
                  <i
                    class="bi"
                    :class="
                      authMessageType === 'success'
                        ? 'bi-check-circle-fill'
                        : 'bi-exclamation-octagon-fill'
                    "
                  ></i>
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
                :src="appConfig.getBusinessLogo || defaultLogo"
                alt="Logo Negocio"
                style="max-width: 180px; filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))"
                class="mb-4 rounded"
              />
              <h4 class="mb-3 fw-bold">{{ appConfig.getBusinessName }}</h4>
              <p class="small mb-0 opacity-75">
                Plataforma integral de gestión: Stock, Ventas y Auditoría en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useAppConfigStore } from '@/store/useAppConfigStore'

const router = useRouter()
const authStore = useAuthStore()
const appConfig = useAppConfigStore()
const defaultLogo = appConfig.getBusinessLogo === '' ? '/logo.webp' : appConfig.getBusinessLogo

console.log(appConfig.getBusinessLogo)
const email = ref('')
const password = ref('')
const passwordVisible = ref(false)
const authMessage = ref<string | null>(null)
const authMessageType = ref<'success' | 'danger'>('danger')

// Computada para saber si estamos en modo oscuro basado en el store central
const isDarkMode = computed(() => appConfig.uiPreferences.theme === 'dark')

/**
 * Alterna el tema usando el método centralizado del Store.
 * Este método ya guarda en localStorage y aplica el atributo al HTML.
 */
const toggleTheme = (): void => {
  const newTheme = isDarkMode.value ? 'light' : 'dark'
  appConfig.setUiPreferences({ theme: newTheme })
}

const authUser = async (): Promise<void> => {
  authMessage.value = null

  const success = await authStore.login(email.value, password.value)

  if (success) {
    authMessage.value = 'Acceso concedido. Redirigiendo...'
    authMessageType.value = 'success'
    setTimeout(() => router.push({ name: 'home' }), 1000)
  } else {
    authMessage.value = 'Credenciales inválidas o error de servidor.'
    authMessageType.value = 'danger'
  }
}

onMounted(() => {
  // Aseguramos que los datos del negocio estén cargados al entrar al login
  if (appConfig.businessDetails.nombre === 'Cargando...') {
    appConfig.fetchBusinessSettings()
  }
})
</script>

<style scoped>
.login-background-modern {
  height: 100vh;
  background-color: var(--bs-body-bg);
  transition: background-color 0.3s ease;
}

.login-card-wrapper {
  max-width: 950px;
  width: 90%;
}

.theme-switch-container {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.gradient-custom {
  background: linear-gradient(to top left, var(--bs-primary), #00bcd4);
  transition: all 0.5s ease;
}

/* Ajuste de gradiente para modo oscuro mediante el atributo de BS5 */
:root[data-bs-theme='dark'] .gradient-custom {
  background: linear-gradient(to top left, #1e3a8a, #4c1d95);
}

.form-control-minimal {
  background-color: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
}

.form-control-minimal:focus {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-primary);
  box-shadow: none;
}

.input-group-btn-minimal {
  border-left: none !important;
}

@media (min-width: 992px) {
  .gradient-custom {
    border-top-right-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
  }
}
</style>
