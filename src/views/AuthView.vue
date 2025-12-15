<template>
  <div
    class="auth-wrapper d-flex align-items-center justify-content-center vh-100 bg-light"
    :style="{ backgroundImage: 'url(\'/img/background.webp\')' }"
  >
    <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%">
      <div class="text-center mb-4">
        <h1 class="h3 mb-3 fw-bold">{{ brandingName }}</h1>
        <img :src="appConfig.getBusinessLogoUrl || defaultLogo" alt="Logo de la empresa" class="mb-3" style="max-width: 100px;">
        <p class="text-muted">Inicia sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="credentials.email"
            required
            autocomplete="username"
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="credentials.password"
            required
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <div v-if="authStore.error" class="alert alert-danger mt-3" role="alert">
        {{ authStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useAppConfigStore } from '@/store/useAppConfigStore'; // Added this import

const router = useRouter()
const authStore = useAuthStore()
const appConfig = useAppConfigStore(); // Added this

const credentials = ref({
  email: '',
  password: '',
  device_name: 'browser', // O puedes generar un ID único o usar el nombre del navegador
})

const isLoading = ref(false)
const defaultLogo = '/logo_default.webp'; // Asumiendo un logo por defecto

// Usamos el nombre de la marca desde el store de configuración
const brandingName = appConfig.getBusinessName;

// Observar cambios en el estado de autenticación
watch(
  () => authStore.isAuthenticated,
  (newVal) => {
    if (newVal) {
      router.push({ name: 'home' })
    }
  },
)

// Manejar el envío del formulario
const handleLogin = async () => {
  isLoading.value = true
  credentials.value.device_name = navigator.userAgent // Usar el user agent como device_name
  await authStore.login(credentials.value)
  isLoading.value = false
}
</script>

<style scoped>
.auth-wrapper {
  background-size: cover;
  background-position: center;
  /* Añadir un overlay para mejorar la legibilidad */
  position: relative;
  z-index: 1;
}
.auth-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4); /* Overlay oscuro */
  z-index: -1;
}
.card {
  border: none;
  border-radius: 0.75rem;
  background-color: rgba(255, 255, 255, 0.9); /* Fondo ligeramente transparente */
}
</style>
